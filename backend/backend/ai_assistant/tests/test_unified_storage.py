import json
import uuid
from dataclasses import replace
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from ai_assistant.agents import BUSINESS_ANALYST, OPERATOR_MENTOR
from ai_assistant.audit_payloads import read_blob, put_blob
from ai_assistant.auditing import reconcile_turns
from ai_assistant.errors import AssistantError
from ai_assistant.models import Conversation, Message, TurnAudit, AuditEvent, AuditBlob, AuditAccess
from ai_assistant.model_configuration import ModelConfiguration
from ai_assistant.persistence import AgentStore
from ai_assistant.service import STORE as MENTOR_STORE
from ai_assistant.testing import ScriptedProvider
from business_analyst.config import Limits
from business_analyst.context import principal_for, STORE as BUSINESS_STORE
from business_analyst.service import ConversationService
from business_analyst.tests.expense_data import create_expense_data
from business_analyst.tests.helpers import DatabaseFixture, batch, final, invocation

AUDIT = "/api/assistant/audit/"


class UnifiedStorageTests(DatabaseFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        create_expense_data(cls.restaurant, cls.branch)
        cls.superadmin = User.objects.create_superuser(username="unified-audit-admin",password="test-only")

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.audit = APIClient()
        self.audit.force_authenticate(self.superadmin)
        self.principal = principal_for(self.admin)

    def business(self):
        provider = ScriptedProvider([
            replace(batch(["admin_finance_expenses"], [invocation("get_expense_summary","expenses")]),
                    usage={"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}),
            replace(final("Current ordinary expenses: AFN 1850.00.",citations=["b1:0","b1:1"]),
                    usage={"prompt_tokens":20,"completion_tokens":10,"total_tokens":30})])
        return ConversationService(provider=provider).reply(user=self.admin,question="Summarize ordinary expenses.")

    def mentor_record(self):
        identity = uuid.uuid4()
        conversation, question, trace = MENTOR_STORE.reserve(user=self.admin,principal=self.principal,
            question="Mentor-only recorded question",conversation_id=None,request_id=identity,
            configuration=ModelConfiguration.resolve(),limits=Limits())
        trace.event("answer_generated",{"kind":"clarification","content":"Mentor-only response","sources":[]})
        MENTOR_STORE.persist_answer(conversation=conversation,request_id=identity,question_record=question,
            content="Mentor-only response",kind="clarification",sources=[],trace=trace)
        MENTOR_STORE.release(conversation,identity)
        return conversation, identity

    def test_both_agents_share_models_but_lists_history_and_posts_are_agent_scoped(self):
        business = self.business()
        mentor, _ = self.mentor_record()
        self.assertEqual(Conversation.objects.count(),2)
        mentor_list = self.client.get("/api/assistant/conversations/")
        business_list = self.client.get("/api/business-analyst/conversations/")
        self.assertEqual([c["id"] for c in mentor_list.data["results"]],[str(mentor.pk)])
        self.assertEqual([c["id"] for c in business_list.data["results"]],[business["conversation_id"]])
        for prefix, wrong in (("assistant",business["conversation_id"]),("business-analyst",str(mentor.pk))):
            with self.subTest(prefix=prefix):
                self.assertEqual(self.client.get(f"/api/{prefix}/conversations/{wrong}/messages/").status_code,404)
                self.assertEqual(self.client.post(f"/api/{prefix}/chat/",{"message":"Follow up","conversation_id":wrong},format="json").status_code,404)
                self.assertEqual(self.client.post(f"/api/{prefix}/chat/",{"message":"x","agent_type":"business_analyst"},format="json").status_code,400)

    def test_agent_filter_remains_effective_even_when_authorization_binding_is_identical(self):
        borrowed = MENTOR_STORE.scope(self.admin,self.principal)
        borrowed["agent_type"] = BUSINESS_ANALYST
        business = Conversation.objects.create(**borrowed,title="Must not appear in Mentor")
        self.assertEqual(self.client.get(f"/api/assistant/conversations/{business.pk}/messages/").status_code,404)
        self.assertEqual(self.client.get("/api/assistant/conversations/").data["results"],[])

    def test_business_audit_uses_encrypted_common_events_actual_usage_and_admin_filters(self):
        business = self.business()
        mentor, _ = self.mentor_record()
        turn = TurnAudit.objects.get(pk=business["request_id"])
        self.assertEqual((turn.agent_type,turn.model_calls,turn.completed_model_calls,turn.tool_calls,turn.completed_tool_calls,turn.batches,turn.operations),
                         (BUSINESS_ANALYST,2,2,1,1,1,2))
        self.assertEqual(turn.usage,{"prompt_tokens":30,"completion_tokens":15,"total_tokens":45})
        self.assertTrue(turn.usage_complete)
        self.assertIsNotNone(turn.duration_ms)
        self.assertEqual(turn.events.filter(event_type="operation_finished").count(),2)
        operation = turn.events.get(event_type="operation_finished",tool_name="get_expense_summary")
        self.assertEqual(read_blob(operation.payload)["id"],"get_expense_summary")
        self.assertTrue(all("1850.00" not in b.ciphertext for b in AuditBlob.objects.all()))
        for path in ("turns/","conversations/"):
            response = self.audit.get(AUDIT+path,{"agent_type":BUSINESS_ANALYST,"user":self.admin.pk,"restaurant":self.restaurant.pk})
            self.assertEqual(response.status_code,200,response.data)
            self.assertEqual(response.data["count"],1)
            self.assertEqual(response.data["results"][0]["agent_type"],BUSINESS_ANALYST)
        filtered = self.audit.get(AUDIT+"turns/",{"tool":"get_expense_summary"})
        self.assertEqual(filtered.data["count"],1)
        detail = self.audit.get(AUDIT+f"turns/{turn.pk}/")
        self.assertEqual(detail.data["final_answer"]["content"],business["message"]["content"])
        self.assertEqual(detail.data["conversation_totals"]["turns"],1)
        events = self.audit.get(AUDIT+f"turns/{turn.pk}/events/")
        self.assertNotIn("Current ordinary expenses",json.dumps(events.data, default=str))
        self.assertTrue(AuditAccess.objects.filter(turn_identifier=turn.pk,access_type="timeline").exists())
        self.assertEqual(self.audit.get(AUDIT+f"conversations/{mentor.pk}/messages/").data["agent_type"],OPERATOR_MENTOR)

    def test_superadmin_gate_and_access_logging_cover_both_agents_and_new_options(self):
        result = self.business()
        for path in ("agents/","turns/","conversations/",f"turns/{result['request_id']}/"):
            self.assertEqual(self.client.get(AUDIT+path).status_code,403)
        self.assertEqual(AuditAccess.objects.count(),0)
        response = self.audit.get(AUDIT+"agents/")
        self.assertEqual({a["value"] for a in response.data["agents"]},{OPERATOR_MENTOR,BUSINESS_ANALYST})
        self.assertIn("get_expense_summary",response.data["tools"])
        self.assertTrue(AuditAccess.objects.filter(access_type="agent_list").exists())
        self.assertIn("no-store",response["Cache-Control"])

    def test_deleting_a_conversation_preserves_immutable_audit_and_original_payloads(self):
        result = self.business()
        turn = TurnAudit.objects.get(pk=result["request_id"])
        original_count = turn.events.count()
        Conversation.objects.get(pk=result["conversation_id"]).delete()
        turn.refresh_from_db()
        self.assertIsNone(turn.conversation_id)
        self.assertIsNone(turn.user_message_id)
        self.assertIsNone(turn.assistant_message_id)
        self.assertEqual(str(turn.conversation_identifier),result["conversation_id"])
        self.assertEqual(turn.events.count(),original_count)
        detail = self.audit.get(AUDIT+f"turns/{turn.pk}/")
        self.assertEqual(detail.status_code,200,detail.data)
        self.assertIn("1850.00",detail.data["final_answer"]["content"])
        event = turn.events.first()
        with self.assertRaises(ValueError): event.save()

    def test_provider_failure_is_audited_and_releases_only_its_agent_lease(self):
        with self.assertRaises(AssistantError):
            ConversationService(provider=ScriptedProvider([AssistantError("provider_timeout","Safe timeout",504)])).reply(
                user=self.admin,question="Show expenses")
        turn = TurnAudit.objects.get()
        self.assertEqual((turn.agent_type,turn.status,turn.error_code),(BUSINESS_ANALYST,"failed","provider_timeout"))
        self.assertIsNone(turn.conversation.active_request)
        self.assertFalse(turn.usage_complete)
        self.assertEqual(turn.completed_model_calls,0)

    def test_future_agent_uses_same_store_and_stays_out_of_existing_chat_endpoints(self):
        future = AgentStore("future_agent")
        conversation = Conversation.objects.create(**future.scope(self.admin,self.principal),title="Future storage only")
        self.assertEqual(self.client.get("/api/assistant/conversations/").data["results"],[])
        self.assertEqual(self.client.get("/api/business-analyst/conversations/").data["results"],[])
        options = self.audit.get(AUDIT+"agents/").data
        self.assertIn("future_agent",{a["value"] for a in options["agents"]})
        self.assertEqual(future.conversations().get().pk,conversation.pk)

    def test_summary_metadata_does_not_expose_extra_legacy_configuration_contents(self):
        result = self.business()
        turn = TurnAudit.objects.get(pk=result["request_id"])
        payload = read_blob(turn.question_payload)
        payload["model_configuration"] = {"private_prompt":"PRIVATE_LEGACY_CONFIGURATION_CONTENT"}
        TurnAudit.objects.filter(pk=turn.pk).update(model_configuration={},question_payload=put_blob(payload))
        response = self.audit.get(AUDIT+"turns/")
        self.assertEqual(response.status_code,200,response.data)
        self.assertNotIn("PRIVATE_LEGACY_CONFIGURATION_CONTENT",json.dumps(response.data,default=str))
        self.assertIsNone(response.data["results"][0]["model_configuration"])
