import io
import json
import shutil
import tempfile
import uuid
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone
from knowledge.errors import GatewayError
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from ai_assistant.errors import AssistantError
from ai_assistant.models import Conversation, Message
from ai_assistant.service import get_gateway
from ai_assistant.testing import ScriptedProvider, final
from restaurants.models import Branch, Restaurant, Subscription
from users.models import AuthSession, Staff

from .helpers import answer_latest, fetch_latest, search

MEDIA = tempfile.mkdtemp(prefix="pakhlai-assistant-tests-")
TEST_CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache", "LOCATION": "assistant-tests"}}
TEST_CHANNELS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}


@override_settings(CACHES=TEST_CACHES, CHANNEL_LAYERS=TEST_CHANNELS, MEDIA_ROOT=MEDIA, AI_ASSISTANT_THROTTLE_RATE="100/min", DEEPSEEK_API_KEY="", ALLOWED_HOSTS=["testserver"])
class AssistantAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.restaurant = Restaurant.objects.create(name="Assistant Fixture", email="assistant@example.invalid", phone="0700000010", address="Fixture")
        Subscription.objects.create(restaurant=cls.restaurant, starts_at=timezone.now().date() - timedelta(days=1), expires_at=timezone.now().date() + timedelta(days=30), is_active=True, max_branches=5)
        cls.branch = Branch.objects.create(restaurant=cls.restaurant, name="Assistant Branch", code="AI-ONE", is_active=True)
        cls.other_branch = Branch.objects.create(restaurant=cls.restaurant, name="Other Branch", code="AI-TWO", is_active=True)
        cls.admin = cls.staff_user("assistant-admin", "Admin", "0700000011")
        cls.other = cls.staff_user("assistant-other", "Admin", "0700000012")
        cls.waiter = cls.staff_user("assistant-waiter", "Waiter", "0700000013")

    @classmethod
    def staff_user(cls, username, role, phone):
        user = User.objects.create_user(username=username, password="test-only-password")
        staff = Staff.objects.create(user=user, restaurant=cls.restaurant, active_branch=cls.branch, name="Synthetic Test Staff", role=role, email=f"{username}@example.invalid", phone=phone)
        staff.branches.add(cls.branch)
        return user

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA, ignore_errors=True)

    def setUp(self):
        cache.clear()
        get_gateway.cache_clear()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def provider(self, responses=None):
        return ScriptedProvider(responses or [search(), fetch_latest, answer_latest])

    def post(self, message="How do I create a contractor invoice?", provider=None, **kwargs):
        with patch("ai_assistant.service.get_provider", return_value=provider or self.provider()):
            return self.client.post("/api/assistant/chat/", {"message": message, **kwargs}, format="json")

    def test_valid_message_conversation_creation_history_and_verified_source_metadata(self):
        response = self.post()
        self.assertEqual(response.status_code, 200, response.data)
        conversation = Conversation.objects.get(pk=response.data["conversation_id"])
        self.assertEqual(conversation.user, self.admin)
        self.assertEqual(conversation.branch, self.branch)
        self.assertIsNone(conversation.active_request)
        self.assertEqual(conversation.messages.count(), 2)
        self.assertTrue(response.data["message"]["sources"])
        self.assertNotIn("search_token", json.dumps(response.data))
        self.assertNotIn("tool_calls", json.dumps(response.data))
        listing = self.client.get("/api/assistant/conversations/")
        self.assertEqual(listing.data["results"][0]["id"], str(conversation.pk))
        history = self.client.get(f"/api/assistant/conversations/{conversation.pk}/messages/")
        self.assertEqual([item["role"] for item in history.data["results"]], ["user", "assistant"])
        self.assertFalse(history.data["results"][1]["stale_sources"])

    def test_original_greeting_works_with_unavailable_index_and_no_provider_calls(self):
        provider = ScriptedProvider([])
        with patch.object(get_gateway().repository, "get", side_effect=GatewayError("index_unavailable", "Index unavailable")) as load:
            for question in ("hello how are you", "Hello, how are you?"):
                response = self.post(question, provider=provider)
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data["message"]["kind"], "greeting")
                self.assertEqual(response.data["message"]["sources"], [])
            load.assert_not_called()
        self.assertEqual(provider.requests, [])

    def test_greeting_prefix_does_not_bypass_factual_grounding_or_hide_index_failure(self):
        with patch.object(get_gateway().repository, "get", side_effect=GatewayError("index_unavailable", "Index unavailable")), self.assertLogs("ai_assistant", level="WARNING") as logs:
            response = self.post("Hello, how do I create a contractor invoice?")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "index_unavailable")
        record = logs.records[-1]
        self.assertEqual(record.failure_stage, "knowledge_index_loading")
        self.assertEqual(record.knowledge_index_status, "unavailable")
        self.assertEqual(record.model_requests, 0)
        self.assertNotIn("contractor invoice", str(logs.output))

    def test_empty_long_numeric_and_unknown_identity_payload_fields_rejected(self):
        for data in ({"message": ""}, {"message": "  "}, {"message": "x" * 4001}, {"message": 42}, {"message": "hello", "role": "Admin"}, {"message": "hello", "branch_id": self.other_branch.pk}, {"message": "hello", "language": "ps"}, {"message": "hello", "conversation_id": "invalid"}):
            with self.subTest(data=data):
                response = self.client.post("/api/assistant/chat/", data, format="json")
                self.assertEqual(response.status_code, 400)
        self.assertEqual(Conversation.objects.count(), 0)

    def test_large_body_invalid_json_and_unauthenticated_requests(self):
        response = self.client.post("/api/assistant/chat/", data="x" * 32769, content_type="application/json")
        self.assertEqual(response.status_code, 413)
        self.assertEqual(self.client.post("/api/assistant/chat/", data="{bad", content_type="application/json").status_code, 400)
        anonymous = APIClient()
        self.assertEqual(anonymous.post("/api/assistant/chat/", {"message": "hello"}, format="json").status_code, 401)
        self.assertEqual(anonymous.get("/api/assistant/conversations/").status_code, 401)

    def test_conversation_followup_reuses_revalidated_evidence(self):
        first = self.post("How do I record a contractor payment?")
        self.assertEqual(first.status_code, 200, first.data)
        citations = [{key: source[key] for key in ("document_id", "section_id")} for source in first.data["message"]["sources"]]
        provider = self.provider([final("The documented payment can be partial.", citations)])
        second = self.post("And can it be partial?", provider=provider, conversation_id=first.data["conversation_id"])
        self.assertEqual(second.status_code, 200, second.data)
        self.assertEqual(second.data["conversation_id"], first.data["conversation_id"])
        self.assertEqual(Conversation.objects.count(), 1)
        self.assertEqual(Message.objects.count(), 4)
        self.assertEqual(len(provider.requests), 1)

    def test_post_fetch_final_schema_repair_persists_only_verified_answer(self):
        from ai_assistant.provider import Completion
        invalid = Completion('{"kind":"answer|clarification|limitation","content":"UNVERIFIED_TEXT","citations":[]}')
        provider = ScriptedProvider([search(), fetch_latest, invalid, answer_latest])
        response = self.post(provider=provider)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(provider.requests), 4)
        self.assertTrue(response.data["message"]["sources"])
        self.assertFalse(Message.objects.filter(content__contains="UNVERIFIED_TEXT").exists())

    def test_repeated_post_fetch_rejection_is_controlled_and_releases_lease(self):
        invalid = final("No citations supplied")
        provider = ScriptedProvider([search(), fetch_latest, invalid, invalid])
        response = self.post(provider=provider)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data["error"]["code"], "answer_repair_stalled")
        self.assertEqual(len(provider.requests), 4)
        conversation = Conversation.objects.get(pk=response.data["conversation_id"])
        self.assertIsNone(conversation.active_request)
        self.assertEqual(conversation.messages.count(), 1)
        self.assertEqual(conversation.messages.get().state, "failed")

    def test_other_user_and_wrong_branch_or_restaurant_context_cannot_access_conversation(self):
        first = self.post()
        conversation_id = first.data["conversation_id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.post(conversation_id=conversation_id).status_code, 404)
        self.assertEqual(self.client.get(f"/api/assistant/conversations/{conversation_id}/messages/").status_code, 404)
        self.client.force_authenticate(self.admin)
        Staff.objects.filter(user=self.admin).update(active_branch=self.other_branch)
        self.assertEqual(self.post(conversation_id=conversation_id).status_code, 404)
        self.assertEqual(self.client.get("/api/assistant/conversations/").data["results"], [])
        another = Restaurant.objects.create(name="Elsewhere", email="elsewhere@example.invalid", phone="0700000088", address="Fixture")
        Staff.objects.filter(user=self.admin).update(restaurant=another)
        self.assertIn(self.post(conversation_id=conversation_id).status_code, {403, 404})

    def test_inactive_subscription_staff_and_unassigned_branch_denied(self):
        Subscription.objects.filter(restaurant=self.restaurant).update(is_active=False)
        self.assertEqual(self.post().status_code, 403)
        Subscription.objects.filter(restaurant=self.restaurant).update(is_active=True)
        Staff.objects.filter(user=self.waiter).update(active_branch=self.other_branch)
        self.client.force_authenticate(self.waiter)
        self.assertEqual(self.post().status_code, 403)
        Staff.objects.filter(user=self.waiter).update(active_branch=self.branch, status="Inactive")
        self.assertEqual(self.post().status_code, 403)

    def test_provider_failure_missing_key_and_failed_message_state(self):
        for code, status in [("provider_timeout", 504), ("provider_rate_limited", 429)]:
            provider = self.provider([AssistantError(code, "Controlled failure", status)])
            response = self.post(provider=provider)
            self.assertEqual(response.status_code, status)
            conversation = Conversation.objects.get(pk=response.data["conversation_id"])
            self.assertIsNone(conversation.active_request)
            self.assertEqual(conversation.messages.get().state, "failed")
            self.assertEqual(conversation.messages.get().role, "user")
        response = self.client.post("/api/assistant/chat/", {"message": "How do I create an invoice?"}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "provider_not_configured")

    def test_forged_references_never_reach_api_or_stored_assistant_messages(self):
        fake = final("Made-up final answer", [{"document_id": "invented", "section_id": "invented"}])
        response = self.post(provider=self.provider([search(), fetch_latest, fake, fake, fake, fake]))
        self.assertEqual(response.status_code, 422)
        self.assertEqual(Message.objects.filter(role="assistant").count(), 0)
        self.assertNotIn("Made-up", json.dumps(response.data))

    def test_conversation_busy_and_expired_lease_recovery(self):
        first = self.post("hello")
        conversation = Conversation.objects.get(pk=first.data["conversation_id"])
        Conversation.objects.filter(pk=conversation.pk).update(active_request=uuid.uuid4(), active_until=timezone.now() + timedelta(minutes=5))
        self.assertEqual(self.post(conversation_id=conversation.pk).status_code, 409)
        Conversation.objects.filter(pk=conversation.pk).update(active_until=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.post(conversation_id=conversation.pk).status_code, 200)

    @override_settings(AI_ASSISTANT_THROTTLE_RATE="1/min")
    def test_throttling_is_applied(self):
        self.assertEqual(self.post("hello").status_code, 200)
        self.assertEqual(self.post("hello").status_code, 429)

    @override_settings(AI_ASSISTANT_THROTTLE_RATE="invalid")
    def test_invalid_throttle_configuration_fails_closed(self):
        response = self.post("hello")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "configuration_invalid")

    def test_history_and_conversation_list_pagination_are_bounded(self):
        first = self.post("hello")
        for number in range(42):
            Message.objects.create(conversation_id=first.data["conversation_id"], request_id=uuid.uuid4(), role="user", kind="question", content=f"Synthetic history {number}")
        first_page = self.client.get(f"/api/assistant/conversations/{first.data['conversation_id']}/messages/")
        self.assertEqual(len(first_page.data["results"]), 40)
        self.assertEqual(first_page.data["next_page"], 1)
        second_page = self.client.get(f"/api/assistant/conversations/{first.data['conversation_id']}/messages/?page=1")
        self.assertEqual(len(second_page.data["results"]), 4)
        self.assertIsNone(second_page.data["next_page"])
        self.assertEqual(self.client.get("/api/assistant/conversations/?page=-1").status_code, 400)

    def test_history_revalidates_stored_sources_and_redacts_stale_answers(self):
        first = self.post()
        message = Message.objects.get(role="assistant")
        for source in message.sources:
            source["index_version"] = "stale"
        message.save(update_fields=["sources"])
        history = self.client.get(f"/api/assistant/conversations/{first.data['conversation_id']}/messages/")
        previous = history.data["results"][-1]
        self.assertTrue(previous["stale_sources"])
        self.assertEqual(previous["sources"], [])
        self.assertNotEqual(previous["content"], message.content)

    def test_existing_jwt_session_authentication_and_revocation(self):
        jwt = AccessToken.for_user(self.admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer " + str(jwt))
        response = client.post("/api/assistant/chat/", {"message": "hello"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        jwt["sid"] = str(uuid.uuid4())  # A nonexistent managed session must fail existing auth.
        client.credentials(HTTP_AUTHORIZATION="Bearer " + str(jwt))
        response = client.post("/api/assistant/chat/", {"message": "hello"}, format="json")
        self.assertEqual(response.status_code, 401)
        session = AuthSession.objects.create(user=self.admin, restaurant=self.restaurant, branch=self.branch, role="Admin", refresh_expires_at=timezone.now() + timedelta(hours=1))
        jwt["sid"] = str(session.pk)
        client.credentials(HTTP_AUTHORIZATION="Bearer " + str(jwt))
        self.assertEqual(client.post("/api/assistant/chat/", {"message": "hello"}, format="json").status_code, 200)
        AuthSession.objects.filter(pk=session.pk).update(revoked_at=timezone.now())
        cache.clear()  # Existing authentication deliberately caches session validity.
        self.assertEqual(client.post("/api/assistant/chat/", {"message": "hello"}, format="json").status_code, 401)

    def test_role_change_hides_old_conversations(self):
        first = self.post()
        Staff.objects.filter(user=self.admin).update(role="Waiter")
        self.assertEqual(self.post(conversation_id=first.data["conversation_id"]).status_code, 404)
        self.assertEqual(self.client.get("/api/assistant/conversations/").data["results"], [])

    def test_unsupported_provider_configuration_fails_cleanly(self):
        with override_settings(AI_ASSISTANT_PROVIDER="unsupported"):
            response = self.client.post("/api/assistant/chat/", {"message": "How do I create an invoice?"}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"]["code"], "configuration_invalid")

    def test_mock_cli_uses_real_authorized_account_gateway_service_and_persistence(self):
        output = io.StringIO()
        call_command("test_ai_assistant", "--mock", "--user-id", str(self.admin.pk), "--question", "How do I create a contractor invoice?", stdout=output)
        self.assertIn("Mock demonstration", output.getvalue())
        self.assertIn("Limits: ", output.getvalue())
        self.assertIn("operator_modules_contractors_services", output.getvalue())
        self.assertIn('"tool": "fetch_documentation"', output.getvalue())
        self.assertNotIn("search_token", output.getvalue())
        self.assertTrue(Message.objects.filter(role="assistant").exists())

    def test_unauthorized_scope_and_logs_do_not_leak_conversation_content(self):
        self.client.force_authenticate(self.waiter)
        provider = self.provider([search(), final("Cannot show payroll", kind="limitation")])
        with self.assertLogs("ai_assistant", level="INFO") as captured:
            response = self.post("How do I generate payroll? PRIVATE_CHAT_MARKER", provider=provider)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["message"]["sources"], [])
        self.assertNotIn("PRIVATE_CHAT_MARKER", "\n".join(captured.output))
        self.assertFalse(any(record.__dict__.get("reasoning_content") for record in captured.records))
