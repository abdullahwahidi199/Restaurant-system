import io
import json
import uuid
from datetime import timedelta
from unittest.mock import patch

import httpx
from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.management import call_command
from django.db import OperationalError
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from ai_assistant.audit_payloads import put_blob, read_blob, redact
from ai_assistant.auditing import reconcile_turns
from ai_assistant.errors import AssistantError
from ai_assistant.models import AuditAccess, AuditBlob, AuditEvent, Conversation, Message, TurnAudit
from ai_assistant.provider import Completion, DeepSeekProvider
from ai_assistant.service import ConversationService, get_gateway, principal_for
from ai_assistant.testing import ScriptedProvider, call, final, tool_results
from users.models import Staff
from .helpers import answer_latest, fetch_latest, search, tools
from .test_evaluation_hardening import DatabaseFixture, EVAL_SETTINGS


@override_settings(**EVAL_SETTINGS)
class AuditingTests(DatabaseFixture, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.make_data()
        cls.superadmin = User.objects.create_superuser(username="audit-superadmin", password="test-password")

    def setUp(self):
        cache.clear()
        get_gateway.cache_clear()
        self.client = self.client_for_user()
        self.admin = APIClient()
        self.admin.force_authenticate(self.superadmin)

    def send(self, responses=None, question="How do I create a contractor invoice?", **data):
        provider = ScriptedProvider(responses if responses is not None else [search(),fetch_latest,answer_latest])
        with patch("ai_assistant.service.get_provider",return_value=provider):
            response = self.client.post("/api/assistant/chat/", {"message":question,**data},format="json")
        return response,provider

    def payload(self, event):
        return read_blob(event.payload)

    def test_greeting_creates_real_turn_and_no_invented_model_or_tool_events(self):
        response,provider = self.send([],"Hello, how are you?")
        self.assertEqual(response.status_code,200,response.data)
        turn = TurnAudit.objects.get()
        self.assertEqual(turn.pk,uuid.UUID(response.data["request_id"]))
        self.assertEqual(turn.user_message.content,"Hello, how are you?")
        self.assertEqual(turn.assistant_message.content,response.data["message"]["content"])
        self.assertEqual(turn.status,"completed")
        self.assertEqual(turn.model_calls,0)
        self.assertEqual(provider.requests,[])
        self.assertEqual(list(turn.events.values_list("event_type",flat=True)),["user_message","context_prepared","answer_generated","answer_persisted","turn_completed"])

    def test_search_fetch_order_ids_rank_and_exact_historical_snapshot(self):
        response,_ = self.send()
        self.assertEqual(response.status_code,200,response.data)
        turn = TurnAudit.objects.get()
        events = list(turn.events.select_related("payload"))
        self.assertEqual([e.sequence for e in events],list(range(1,len(events)+1)))
        self.assertEqual(turn.model_calls,3)
        self.assertEqual(turn.tool_calls,2)
        self.assertEqual(turn.completed_tool_calls,2)
        search_event = next(e for e in events if e.event_type=="tool_result" and e.tool_name=="search_documentation")
        ranked = self.payload(search_event)["result"]
        self.assertEqual([r["rank"] for r in ranked["results"]],list(range(1,len(ranked["results"])+1)))
        self.assertIn("ranking_method",ranked)
        self.assertEqual(ranked["search_token"],"[REDACTED]")
        fetched = next(e for e in events if e.event_type=="tool_result" and e.tool_name=="fetch_documentation")
        snapshot = self.payload(fetched)["result"]
        content = snapshot["sections"][0]["content"]
        self.assertTrue(content)
        self.assertEqual(snapshot["index_version"],turn.assistant_message.index_version)
        with patch.object(get_gateway().repository,"get",side_effect=AssertionError("Historical API must not load today's docs")):
            api = self.admin.get(f"/api/assistant/audit/turns/{turn.pk}/events/{fetched.sequence}/")
        self.assertEqual(api.status_code,200,api.data)
        self.assertEqual(api.data["payload"]["result"]["sections"][0]["content"],content)
        Message.objects.filter(pk=turn.assistant_message_id).update(content="MUTATED_LATER")
        detail = self.admin.get(f"/api/assistant/audit/turns/{turn.pk}/")
        self.assertNotIn("MUTATED_LATER",detail.data["final_answer"]["content"])
        for event in events:
            if event.event_type=="tool_result":
                before = next(e for e in events if e.event_type=="tool_call" and e.tool_call_id==event.tool_call_id)
                self.assertLess(before.sequence,event.sequence)
                self.assertGreaterEqual(event.duration_ms,0)

    def test_multi_tool_batch_and_repeated_searches_are_actual_events(self):
        batch = tools(call("search_documentation",{"query":"contractor","limit":5},"s1"),call("search_documentation",{"query":"invoice","limit":5},"s2"))
        response,_ = self.send([batch,fetch_latest,lambda r:fetch_latest(r,call_id="fetch2"),answer_latest])
        self.assertEqual(response.status_code,200,response.data)
        turn = TurnAudit.objects.get()
        self.assertEqual(turn.tool_calls,4)
        self.assertEqual(list(turn.events.filter(event_type="tool_call").values_list("tool_call_id",flat=True)),["s1","s2","fetch_1","fetch2"])
        response_event = turn.events.filter(event_type="model_response").first()
        self.assertEqual(len(self.payload(response_event)["response"]["choices"][0]["message"]["tool_calls"]),2)

    def test_followup_reuse_is_not_presented_as_new_search(self):
        first,_ = self.send()
        citations = [{k:s[k] for k in ("document_id","section_id")} for s in first.data["message"]["sources"]]
        second,_ = self.send([final("Required fields are described in the verified section.",citations)],"What fields are required?",conversation_id=first.data["conversation_id"])
        self.assertEqual(second.status_code,200,second.data)
        turn = TurnAudit.objects.get(pk=second.data["request_id"])
        self.assertEqual(turn.tool_calls,0)
        reuse = self.payload(turn.events.get(event_type="evidence_reused"))
        self.assertTrue(reuse["permissions_rechecked"])
        self.assertTrue(reuse["index_version_validated"])
        self.assertIn(first.data["request_id"],reuse["prior_turns"])
        self.assertLess(turn.events.get(event_type="evidence_reused").sequence,turn.events.get(event_type="context_prepared").sequence)
        third,_=self.send([final("Required fields remain as documented.",citations)],"What fields are required?",conversation_id=first.data["conversation_id"])
        third_trace=TurnAudit.objects.get(pk=third.data["request_id"])
        self.assertEqual(self.payload(third_trace.events.get(event_type="evidence_reused"))["prior_turns"],[first.data["request_id"]])

    @override_settings(DEEPSEEK_API_KEY="sk-audit-test-credential-do-not-store")
    def test_adapter_boundary_matches_actual_wire_and_aggregates_only_reported_usage(self):
        sent=[]
        responses=iter([search(),fetch_latest,answer_latest])
        def handle(request):
            body=json.loads(request.content);sent.append(body)
            item=next(responses); item=item(body) if callable(item) else item
            return httpx.Response(200,json={"id":"safe-provider-id","model":"deepseek-flash","choices":[{"message":item.message(),"finish_reason":item.finish_reason}],
                "usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15,"prompt_cache_hit_tokens":7,"prompt_cache_miss_tokens":3}})
        provider=DeepSeekProvider(transport=httpx.MockTransport(handle))
        with patch("ai_assistant.service.get_provider",return_value=provider):
            response=self.client.post("/api/assistant/chat/",{"message":"How do I create a contractor invoice?"},format="json")
        self.assertEqual(response.status_code,200,response.data)
        turn=TurnAudit.objects.get()
        requests=list(turn.events.filter(event_type="model_request").select_related("payload"))
        self.assertEqual(len(requests),3)
        for event,wire in zip(requests,sent):
            payload=self.payload(event)
            self.assertEqual(payload["capture_boundary"],"deepseek_http")
            self.assertEqual(payload["payload"],redact(wire))
        self.assertEqual(turn.usage,{"prompt_tokens":30,"completion_tokens":15,"total_tokens":45,"prompt_cache_hit_tokens":21,"prompt_cache_miss_tokens":9})
        self.assertTrue(turn.usage_complete)
        self.assertEqual(turn.completed_model_calls,3)

    @override_settings(DEEPSEEK_API_KEY="sk-audit-test-credential-do-not-store")
    def test_private_reasoning_and_credentials_never_persist(self):
        body={"choices":[{"message":{"role":"assistant","content":"observable output", "reasoning_content":"PRIVATE_REASONING_NEVER_STORE", "private_reasoning":"OTHER_HIDDEN_OUTPUT"},"finish_reason":"stop"}],"usage":{"prompt_tokens":9}}
        provider=DeepSeekProvider(transport=httpx.MockTransport(lambda req:httpx.Response(200,json=body)))
        with patch("ai_assistant.service.get_provider",return_value=provider):
            response=self.client.post("/api/assistant/chat/",{"message":"How do I create a contractor invoice?"},format="json")
        self.assertEqual(response.status_code,502)
        turn=TurnAudit.objects.get()
        decoded=[self.payload(e) for e in turn.events.select_related("payload")]
        self.assertNotIn("PRIVATE_REASONING_NEVER_STORE",json.dumps(decoded))
        self.assertNotIn("OTHER_HIDDEN_OUTPUT",json.dumps(decoded))
        blob=put_blob({"authorization":"Bearer SECRET_AUTH", "parameters":{"password":"hidden-in-schema"}, "messages":[{"content":'password=examplepass sk-audit-test-credential-do-not-store eyJabc.defghi.jklmnop',"arguments":'{"search_token":"signed_private","api_key":"nested-secret"}'}]})
        text=json.dumps(read_blob(blob))
        for secret in ("SECRET_AUTH","examplepass","sk-audit-test-credential-do-not-store","eyJabc.defghi.jklmnop","signed_private","nested-secret","hidden-in-schema"):
            self.assertNotIn(secret,text)
        self.assertNotIn("private passphrase",redact("Configuration: 'password': 'private passphrase'"))
        for b in AuditBlob.objects.all():
            self.assertNotIn("observable output",b.ciphertext)

    def test_failure_events_survive_model_timeout_and_missing_index(self):
        response,_=self.send([AssistantError("provider_timeout","Safe timeout",504)])
        self.assertEqual(response.status_code,504)
        turn=TurnAudit.objects.get()
        self.assertEqual(turn.status,"failed")
        self.assertEqual(turn.completed_model_calls,0)
        self.assertFalse(turn.usage_complete)
        self.assertTrue(turn.events.filter(event_type="model_request").exists())
        self.assertEqual(self.payload(turn.events.get(event_type="error"))["error_code"],"provider_timeout")
        from knowledge.errors import GatewayError
        with patch.object(get_gateway().repository,"get",side_effect=GatewayError("index_unavailable","Safe error")):
            failed,_=self.send()
        self.assertEqual(failed.status_code,503)
        missing=TurnAudit.objects.get(pk=failed.data["request_id"])
        self.assertEqual(missing.failure_stage,"knowledge_index_loading")
        self.assertEqual(missing.model_calls,0)

    def test_invalid_arguments_and_unauthorized_fetch_errors_are_recorded(self):
        invalid=tools(call("fetch_documentation",{"search_token":"invented", "sections":[{"document_id":"unknown","section_id":"unknown"}]},"bad_fetch"))
        response,_=self.send([search(),invalid,search(call_id="renewed"),fetch_latest,answer_latest])
        self.assertEqual(response.status_code,200,response.data)
        event=TurnAudit.objects.get().events.get(event_type="tool_result",tool_call_id="bad_fetch")
        self.assertEqual(self.payload(event)["error_code"],"discovery_invalid")
        from ai_assistant.provider import ToolCall
        malformed=tools(ToolCall("bad_json","search_documentation","{invalid"))
        another,_=self.send([malformed,search(),fetch_latest,answer_latest])
        self.assertEqual(another.status_code,200,another.data)
        trace=TurnAudit.objects.get(pk=another.data["request_id"])
        self.assertEqual(self.payload(trace.events.get(event_type="tool_result",tool_call_id="bad_json"))["error_code"],"invalid_tool_arguments")

    def test_signed_discovery_does_not_authorize_an_undiscovered_section(self):
        def forbidden(request):
            found=tool_results(request)[-1]
            doc=get_gateway().repository.get().get_document("operator_modules_payroll_payroll")
            return tools(call("fetch_documentation",{"search_token":found["search_token"],"sections":[{"document_id":doc["document_id"],"section_id":doc["section_ids"][0]}]},"undiscovered"))
        response,_=self.send([search(),forbidden,final("No authorized evidence for that request.",kind="limitation")])
        self.assertEqual(response.status_code,200,response.data)
        turn=TurnAudit.objects.get()
        result=self.payload(turn.events.get(event_type="tool_result",tool_call_id="undiscovered"))
        self.assertEqual(result["error_code"],"section_not_available")
        self.assertEqual(turn.completed_tool_calls,1)

    def test_genuine_model_limit_is_retained_as_failed_trace(self):
        response,_=self.send([search(call_id="repeat_"+str(i)) for i in range(6)])
        self.assertEqual(response.status_code,422)
        turn=TurnAudit.objects.get()
        self.assertEqual(turn.error_code,"orchestration_limit")
        self.assertEqual(turn.model_calls,6)
        self.assertEqual(turn.completed_model_calls,6)
        self.assertEqual(turn.status,"failed")
        self.assertEqual(turn.events.filter(event_type="model_response").count(),6)

    def test_interrupt_and_expired_lease_are_persisted_without_reconstructed_responses(self):
        def interrupt(request):
            raise KeyboardInterrupt()
        with self.assertRaises(KeyboardInterrupt):
            self.send([interrupt])
        turn=TurnAudit.objects.get()
        self.assertEqual(turn.status,"interrupted")
        principal=principal_for(self.user,get_gateway())
        conversation,question,trace=ConversationService()._reserve(self.user,principal,"Abandoned synthetic request",None,uuid.uuid4())
        Conversation.objects.filter(pk=conversation.pk).update(active_until=timezone.now()-timedelta(seconds=1))
        self.assertEqual(reconcile_turns(conversation),1)
        trace.turn.refresh_from_db()
        self.assertEqual(trace.turn.status,"interrupted")
        self.assertIsNone(trace.turn.duration_ms)
        self.assertFalse(trace.turn.events.filter(event_type="model_response").exists())

    def test_audit_storage_failure_prevents_unrecorded_model_operation(self):
        from django.urls import resolve
        self.assertIn("default",resolve("/api/assistant/chat/").func._non_atomic_requests)
        provider=ScriptedProvider([search()])
        with patch("ai_assistant.service.get_provider",return_value=provider),patch("ai_assistant.auditing.put_blob",side_effect=OperationalError("PRIVATE_DATABASE_ERROR")):
            response=self.client.post("/api/assistant/chat/",{"message":"How do I create an invoice?"},format="json")
        self.assertEqual(response.status_code,503)
        self.assertEqual(response.data["error"]["code"],"audit_unavailable")
        self.assertEqual(provider.requests,[])
        self.assertFalse(Conversation.objects.exists())
        self.assertNotIn("PRIVATE_DATABASE_ERROR",json.dumps(response.data))

    def test_encrypted_deduplication_key_rotation_and_reserved_marker_roundtrip(self):
        value={"a":"Repeated immutable Markdown. "*300,"b":["Repeated immutable Markdown. "*300],"literal":{"__audit_text_blob__":"not-a-reference"}}
        with override_settings(AI_AUDIT_ENCRYPTION_KEYS=["old-test-encryption-key"]):
            first=put_blob(value);second=put_blob(value)
        self.assertEqual(first.pk,second.pk)
        self.assertEqual(AuditBlob.objects.filter(kind="text").count(),1)
        from django.db.models.deletion import ProtectedError
        with self.assertRaises(ProtectedError):
            AuditBlob.objects.get(kind="text").delete()
        with self.assertRaises(ValueError):
            first.save()
        with override_settings(AI_AUDIT_ENCRYPTION_KEYS=["new-test-encryption-key","old-test-encryption-key"]):
            self.assertEqual(read_blob(first),value)
        with override_settings(AI_AUDIT_ENCRYPTION_KEYS=["wrong-test-encryption-key"]),self.assertRaises(AssistantError):
            read_blob(first)

    def test_superadmin_permission_and_no_event_existence_leak_for_all_other_roles(self):
        self.send([],"hello")
        turn=TurnAudit.objects.get()
        paths=["/api/assistant/audit/turns/",f"/api/assistant/audit/turns/{turn.pk}/",f"/api/assistant/audit/turns/{uuid.uuid4()}/",
               f"/api/assistant/audit/turns/{turn.pk}/events/",f"/api/assistant/audit/turns/{turn.pk}/events/1/","/api/assistant/audit/conversations/"]
        for role in ("Admin","BranchAdmin","Manager","FinanceManager","OperationsManager","Cashier","Waiter","SuperAdmin","InventoryManager","Kitchen_manager","Other"):
            Staff.objects.filter(user=self.user).update(role=role)
            for path in paths:
                with self.subTest(role=role,path=path):
                    self.assertEqual(self.client.get(path).status_code,403)
        self.assertFalse(AuditAccess.objects.exists())
        for path in paths:
            self.assertEqual(APIClient().get(path).status_code,401)
        for method in ("post","patch","delete"):
            self.assertEqual(getattr(self.admin,method)(paths[0],{},format="json").status_code,405)
        jwt=APIClient();jwt.credentials(HTTP_AUTHORIZATION="Bearer "+str(AccessToken.for_user(self.superadmin)))
        good=jwt.get(paths[1]);self.assertEqual(good.status_code,200,good.data)
        self.assertEqual(good["Cache-Control"],"no-store, private")
        self.assertTrue(AuditAccess.objects.filter(user=self.superadmin,turn_identifier=turn.pk,access_type="turn_detail").exists())
        with patch("ai_assistant.audit_views.read_blob",side_effect=RuntimeError("PRIVATE_STACK")):
            failed=self.admin.get(paths[1])
        self.assertEqual(failed.status_code,503)
        self.assertNotIn("PRIVATE_STACK",json.dumps(failed.data))
        User.objects.filter(pk=self.superadmin.pk).update(is_superuser=False,is_staff=True)
        self.assertEqual(self.admin.get(paths[1]).status_code,403)

    def test_filters_pagination_unknown_usage_and_legacy_conversations(self):
        response,_=self.send()
        turn=TurnAudit.objects.get()
        self.assertFalse(turn.usage_complete)
        self.assertEqual(turn.usage,{})
        page=self.admin.get("/api/assistant/audit/turns/",{"tool":"fetch_documentation","user":self.user.pk,"status":"completed","conversation":str(turn.conversation_id)})
        self.assertEqual(page.data["count"],1)
        self.assertEqual(page.data["results"][0]["usage"],{})
        rows=[TurnAudit(request_id=uuid.uuid4(),conversation=turn.conversation,conversation_identifier=turn.conversation_id,user=self.user,
            started_at=timezone.now(),provider="test",model="test",question_payload=turn.question_payload,status="completed") for _ in range(55)]
        TurnAudit.objects.bulk_create(rows)
        large=self.admin.get("/api/assistant/audit/turns/",{"page_size":1000})
        self.assertEqual(len(large.data["results"]),50)
        self.assertIsNotNone(large.data["next"])
        self.assertEqual(self.admin.get("/api/assistant/audit/turns/",{"status":"made-up"}).status_code,400)
        legacy=Conversation.objects.create(user=self.user,authorization_binding="legacy")
        Message.objects.create(conversation=legacy,request_id=uuid.uuid4(),role="user",kind="question",content="Old question")
        history=self.admin.get(f"/api/assistant/audit/conversations/{legacy.pk}/messages/")
        self.assertFalse(history.data["results"][0]["trace_available"])
        self.assertEqual(history.data["conversation_totals"]["turns"],0)

    def test_retention_is_explicit_and_preserves_messages_and_live_evidence(self):
        self.send([],"hello")
        old=TurnAudit.objects.get()
        self.send([],"hello")
        recent=TurnAudit.objects.exclude(pk=old.pk).get()
        TurnAudit.objects.filter(pk=old.pk).update(started_at=timezone.now()-timedelta(days=100))
        AuditBlob.objects.update(created_at=timezone.now()-timedelta(days=101))
        before=Message.objects.count()
        output=io.StringIO();call_command("maintain_ai_audits",stdout=output)
        self.assertTrue(TurnAudit.objects.filter(pk=old.pk).exists())
        call_command("maintain_ai_audits",execute=True,stdout=output)
        self.assertFalse(TurnAudit.objects.filter(pk=old.pk).exists())
        self.assertEqual(Message.objects.count(),before)
        self.assertEqual(read_blob(TurnAudit.objects.get(pk=recent.pk).question_payload)["content"],"hello")
