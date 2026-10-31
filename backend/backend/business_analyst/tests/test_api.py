import json
import uuid
from datetime import timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from ai_assistant.errors import AssistantError
from ai_assistant.models import Conversation as MentorConversation, Message as MentorMessage
from ai_assistant.testing import ScriptedProvider
from restaurants.models import Subscription
from users.models import AuthSession, Staff

from business_analyst.models import AuditEvent, Conversation, Message, TurnAudit
from business_analyst.service import ConversationService
from .helpers import DOC, DatabaseFixture, batch, definition, final, invocation

URL = "/api/business-analyst/"


class APITests(DatabaseFixture):
    def setUp(self):
        super().setUp()
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def post(self, message="What does dashboard sales mean?", provider=None, **extra):
        with patch("business_analyst.service.get_provider", return_value=provider or ScriptedProvider([batch(), final()])):
            return self.client.post(URL + "chat/", {"message": message, **extra}, format="json")

    def test_documentation_answer_conversation_history_and_execution_audit(self):
        response = self.post()
        self.assertEqual(response.status_code, 200, response.data)
        conversation = Conversation.objects.get(pk=response.data["conversation_id"])
        self.assertEqual(conversation.user_id, self.admin.pk)
        self.assertEqual(conversation.restaurant_id, self.restaurant.pk)
        self.assertEqual(conversation.branch_id, self.branch.pk)
        self.assertIsNone(conversation.active_request)
        self.assertEqual(conversation.messages.count(), 2)
        self.assertEqual(response.data["message"]["sources"][0]["document_id"], DOC)
        turn = TurnAudit.objects.get(pk=response.data["request_id"])
        self.assertEqual((turn.status, turn.model_calls, turn.batches, turn.operations), ("complete", 2, 1, 1))
        self.assertIsNotNone(turn.finished_at)
        self.assertEqual(list(turn.events.values_list("sequence", flat=True)), list(range(1, turn.events.count() + 1)))
        listing = self.client.get(URL + "conversations/")
        self.assertEqual(listing.data["results"][0]["id"], str(conversation.pk))
        history = self.client.get(URL + f"conversations/{conversation.pk}/messages/")
        self.assertEqual([item["role"] for item in history.data["results"]], ["user", "assistant"])
        self.assertIn("no-store", response["Cache-Control"])

    def test_conversation_continuation_uses_only_its_own_history(self):
        first = self.post("First scoped question")
        other = self.post("Unrelated conversation text")
        provider = ScriptedProvider([batch(), final()])
        second = self.post("Follow-up question", provider=provider, conversation_id=first.data["conversation_id"])
        self.assertEqual(second.status_code, 200, second.data)
        messages = json.dumps(provider.requests[0]["messages"])
        self.assertIn("First scoped question", messages)
        self.assertNotIn("Unrelated conversation text", messages)
        self.assertEqual(Conversation.objects.get(pk=first.data["conversation_id"]).messages.count(), 4)
        self.assertNotEqual(first.data["conversation_id"], other.data["conversation_id"])

    def test_wrong_owner_branch_restaurant_and_role_cannot_access_history_or_resume(self):
        response = self.post()
        identity = response.data["conversation_id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.post(conversation_id=identity).status_code, 404)
        self.assertEqual(self.client.get(URL + f"conversations/{identity}/messages/").status_code, 404)
        self.client.force_authenticate(self.admin)
        for changes in ({"active_branch": self.second_branch}, {"restaurant": self.foreign_restaurant, "active_branch": self.foreign_branch},
                        {"restaurant": self.restaurant, "active_branch": self.branch, "role": "BranchAdmin"}):
            Staff.objects.filter(user=self.admin).update(**changes)
            self.assertEqual(self.post(conversation_id=identity).status_code, 404)
            self.assertEqual(self.client.get(URL + "conversations/").data["results"], [])

    def test_client_cannot_supply_scope_or_tool_arguments(self):
        for field in ("user_id", "restaurant_id", "branch_id", "role", "permissions", "tools", "document_ids"):
            response = self.post(**{field: "forged"})
            self.assertEqual(response.status_code, 400, response.data)
        self.assertFalse(Conversation.objects.exists())

    def test_existing_django_jwt_and_managed_session_revocation_are_authoritative(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.post().status_code, 401)
        token = AccessToken.for_user(self.admin)
        session = AuthSession.objects.create(user=self.admin, restaurant=self.restaurant, branch=self.branch,
                                            role="Admin", refresh_expires_at=timezone.now() + timedelta(hours=1))
        token["sid"] = str(session.pk)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + str(token))
        self.assertEqual(self.post().status_code, 200)
        AuthSession.objects.filter(pk=session.pk).update(revoked_at=timezone.now())
        cache.clear()
        self.assertEqual(self.post().status_code, 401)

    def test_invalid_subscription_inactive_staff_and_unassigned_branch_are_denied(self):
        Subscription.objects.filter(restaurant=self.restaurant).update(is_active=False)
        self.assertEqual(self.post().status_code, 403)
        Subscription.objects.filter(restaurant=self.restaurant).update(is_active=True)
        Staff.objects.filter(user=self.admin).update(status="Inactive")
        self.assertEqual(self.post().status_code, 403)
        self.client.force_authenticate(self.branch_admin)
        Staff.objects.filter(user=self.branch_admin).update(active_branch=self.second_branch)
        self.assertEqual(self.post().status_code, 403)

    def test_provider_failure_marks_failed_turn_releases_lease_and_audits_safe_error(self):
        for code, status in (("provider_timeout", 504), ("provider_rate_limited", 429)):
            response = self.post(provider=ScriptedProvider([AssistantError(code, "Safe failure", status)]))
            self.assertEqual(response.status_code, status)
            conversation = Conversation.objects.get(pk=response.data["conversation_id"])
            self.assertIsNone(conversation.active_request)
            self.assertEqual(conversation.messages.get().state, "failed")
            self.assertFalse(conversation.messages.filter(role="assistant").exists())
            turn = TurnAudit.objects.get(pk=response.data["request_id"])
            self.assertEqual((turn.status, turn.error_code), ("failed", code))
            self.assertEqual(turn.events.last().event, "turn_failed")

    def test_no_live_provider_fallback_when_credentials_are_missing(self):
        response = self.client.post(URL + "chat/", {"message": "Explain sales"}, format="json")
        self.assertEqual(response.status_code, 503, response.data)
        self.assertEqual(response.data["error"]["code"], "provider_not_configured")

    def test_audit_omits_question_text_tool_content_arguments_and_reasoning(self):
        response = self.post(message="PRIVATE_QUESTION_TEXT explain sales")
        self.assertEqual(response.status_code, 200)
        events = json.dumps(list(AuditEvent.objects.values_list("metadata", flat=True)))
        self.assertNotIn("PRIVATE_QUESTION_TEXT", events)
        self.assertNotIn("Sum of non-cancelled", events)
        self.assertNotIn("reasoning_content", events)
        self.assertIn("sha256", events)

    def test_final_context_change_never_persists_assistant_answer(self):
        def changed(request):
            Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
            return final()
        response = self.post(provider=ScriptedProvider([batch(), changed]))
        self.assertEqual(response.status_code, 409, response.data)
        self.assertEqual(response.data["error"]["code"], "context_changed")
        self.assertFalse(Message.objects.filter(role="assistant").exists())

    def test_busy_conversation_and_expired_lease_recovery(self):
        first = self.post()
        identity = first.data["conversation_id"]
        stale_request = uuid.uuid4()
        Conversation.objects.filter(pk=identity).update(active_request=stale_request, active_until=timezone.now() + timedelta(minutes=5))
        self.assertEqual(self.post(conversation_id=identity).status_code, 409)
        Message.objects.create(conversation_id=identity, request_id=stale_request, role="user", content="Old interrupted turn", state="pending")
        TurnAudit.objects.create(request_id=stale_request, conversation_id=identity)
        Conversation.objects.filter(pk=identity).update(active_until=timezone.now() - timedelta(seconds=1))
        response = self.post(conversation_id=identity)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(Message.objects.get(request_id=stale_request).state, "failed")
        self.assertEqual(TurnAudit.objects.get(pk=stale_request).error_code, "turn_interrupted")

    def test_stale_document_history_is_redacted_before_model_replay(self):
        response = self.post()
        message = Message.objects.get(role="assistant")
        message.sources[0]["provenance"]["sha256"] = "0" * 64
        message.content = "STALE_ASSERTION"
        message.save()
        history = self.client.get(URL + f"conversations/{response.data['conversation_id']}/messages/")
        self.assertTrue(history.data["results"][1]["stale_sources"])
        self.assertNotIn("STALE_ASSERTION", json.dumps(history.data))
        provider = ScriptedProvider([batch(), final()])
        self.assertEqual(self.post(provider=provider, conversation_id=response.data["conversation_id"]).status_code, 200)
        self.assertNotIn("STALE_ASSERTION", json.dumps(provider.requests[0]["messages"]))

    def test_fresh_tool_answer_is_visible_and_prior_tool_observation_is_not_replayed(self):
        service = ConversationService(provider=ScriptedProvider([
            batch([], [invocation(amount=2)]), final("Test tool value is 2.")]),
            documents=self.documents, registry=self.registry(definition()))
        response = service.reply(user=self.admin, question="Test tool value?")
        self.assertEqual(response["message"]["content"], "Test tool value is 2.")
        self.assertFalse(response["message"]["stale_sources"])
        self.assertEqual(response["message"]["sources"][0]["kind"], "tool")
        provider = ScriptedProvider([batch(), final()])
        self.assertEqual(self.post(provider=provider, conversation_id=response["conversation_id"]).status_code, 200)
        self.assertNotIn("Test tool value is 2.", json.dumps(provider.requests[0]["messages"]))

    @override_settings(BUSINESS_ANALYST_THROTTLE_RATE="1/min")
    def test_endpoint_throttle_is_separate(self):
        self.assertEqual(self.post().status_code, 200)
        self.assertEqual(self.post().status_code, 429)

    def test_pagination_and_payload_limits(self):
        self.assertEqual(self.client.get(URL + "conversations/?page=-1").status_code, 400)
        self.assertEqual(self.post(message="x" * 4001).status_code, 400)
        self.assertEqual(self.post(message="x" * 33000).status_code, 413)
        self.assertEqual(self.post(conversation_id="not-a-uuid").status_code, 400)

    def test_mentor_and_business_conversations_and_models_remain_isolated(self):
        mentor = MentorConversation.objects.create(user=self.admin, restaurant=self.restaurant, branch=self.branch,
                                                   authorization_binding="mentor-binding", title="MENTOR_PRIVATE_HISTORY")
        MentorMessage.objects.create(conversation=mentor, request_id=uuid.uuid4(), role="user", content="MENTOR_PRIVATE_HISTORY")
        provider = ScriptedProvider([batch(), final()])
        response = self.post(provider=provider)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertNotIn("MENTOR_PRIVATE_HISTORY", json.dumps(provider.requests[0]["messages"]))
        self.assertEqual(self.post(conversation_id=str(mentor.pk)).status_code, 404)
        self.assertEqual(MentorMessage.objects.count(), 1)
        from django.urls import resolve
        from ai_assistant.views import ChatView as MentorChat
        self.assertEqual(resolve("/api/assistant/chat/").func.view_class, MentorChat)
        self.assertNotEqual(resolve(URL + "chat/").func.view_class, MentorChat)
