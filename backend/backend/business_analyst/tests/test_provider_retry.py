"""Real provider adapter, Analyst tools, persistence and centralized audit; fake HTTP only."""
import json
from unittest.mock import patch

import httpx
from django.test import override_settings
from rest_framework.test import APIClient

from ai_assistant.audit_payloads import read_blob
from ai_assistant.models import Conversation, TurnAudit
from ai_assistant.provider import DeepSeekProvider
from .helpers import DatabaseFixture, batch, final, invocation


@override_settings(DEEPSEEK_API_KEY="whitespace-retry-synthetic-key", DEEPSEEK_MODEL="deepseek-flash",
                   DEEPSEEK_REASONING_EFFORT="none", DEEPSEEK_BASE_URL="https://api.deepseek.com")
class AnalystProviderRetryTests(DatabaseFixture):
    def send(self, *, exhausted=False, thinking=False):
        sent = []
        def handle(request):
            body = json.loads(request.content)
            sent.append(body)
            if len(sent) == 1:
                completion = batch(documents=("admin_contractors_shared_financial_meaning",),
                    tools=(invocation("get_contractor_summary", "summary_once"),))
                message, finish = completion.message(), completion.finish_reason
            elif len(sent) == 2 or exhausted:
                message, finish = {"role": "assistant", "content": " \n\t "}, "stop"
            else:
                completion = final("Current contractor balances are zero in this test branch.", citations=("b1:0", "b1:1"))
                message, finish = completion.message(), completion.finish_reason
            if thinking:
                message["reasoning_content"] = "PRIVATE_RETRY_REASONING"
            return httpx.Response(200, json={"model": body["model"],
                "choices": [{"message": message, "finish_reason": finish}],
                "usage": {"prompt_tokens": 100, "completion_tokens": len(sent), "total_tokens": 100 + len(sent)}})

        client = APIClient()
        client.force_authenticate(self.admin)
        provider = DeepSeekProvider(transport=httpx.MockTransport(handle))
        with patch("business_analyst.service.get_provider", return_value=provider):
            response = client.post("/api/business-analyst/chat/", {
                "message": "Summarize our contractor balances.",
                "model": "deepseek-v4-pro" if thinking else "deepseek-flash",
                "reasoning_effort": "high" if thinking else "none",
            }, format="json")
        return response, sent

    def assert_attempt_audit(self, turn, *, exhausted):
        requests = list(turn.events.filter(event_type="model_request").select_related("payload"))
        responses = list(turn.events.filter(event_type="model_response").select_related("payload"))
        attempts = list(turn.events.filter(event_type="provider_attempt_finished").select_related("payload"))
        self.assertEqual([e.model_ordinal for e in requests], [1, 2, 2])
        self.assertEqual([read_blob(e.payload)["provider_attempt"] for e in requests], [1, 1, 2])
        self.assertEqual([read_blob(e.payload)["provider_attempt"] for e in responses], [1, 1, 2])
        self.assertEqual([e.status for e in attempts], ["completed", "failed", "failed" if exhausted else "completed"])
        failed = read_blob(attempts[1].payload)
        self.assertEqual(failed["response_condition"], "whitespace_only")
        self.assertEqual(failed["error_code"], "provider_invalid_response")
        self.assertEqual(failed["completion_summary"]["finish_reason"], "stop")
        self.assertTrue(failed["retry_scheduled"])
        self.assertFalse(read_blob(attempts[-1].payload)["retry_scheduled"])
        self.assertTrue(all(e.duration_ms is not None and e.duration_ms >= 0 for e in responses + attempts))
        self.assertEqual([read_blob(e.payload)["response"]["usage"]["completion_tokens"] for e in responses], [1, 2, 3])
        self.assertEqual((turn.model_calls, turn.completed_model_calls), (3, 3))
        self.assertEqual(turn.usage, {"prompt_tokens": 300, "completion_tokens": 6, "total_tokens": 306})
        self.assertTrue(turn.usage_complete)
        # The successful batch/summary executes exactly once, before both final-generation attempts.
        self.assertEqual((turn.batches, turn.operations), (1, 2))
        self.assertEqual(turn.events.filter(event_type="operation_finished", tool_name="get_contractor_summary").count(), 1)
        self.assertNotIn("PRIVATE_RETRY_REASONING", str([read_blob(e.payload) for e in turn.events.select_related("payload")]))

    def test_successful_retry_keeps_evidence_configuration_and_single_persisted_turn(self):
        response, sent = self.send(thinking=True)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(sent), 3)
        self.assertEqual(sent[1], sent[2])
        self.assertEqual(sent[2]["messages"][-1]["role"], "tool")
        self.assertEqual(sent[2]["model"], "deepseek-v4-pro")
        self.assertEqual(sent[2]["reasoning_effort"], "high")
        self.assertEqual(sent[2]["thinking"], {"type": "enabled"})
        turn = TurnAudit.objects.get(pk=response.data["request_id"])
        self.assertEqual(turn.status, "completed")
        self.assert_attempt_audit(turn, exhausted=False)
        self.assertEqual(Conversation.objects.count(), 1)
        conversation = turn.conversation
        self.assertEqual(list(conversation.messages.values_list("role", flat=True)), ["user", "assistant"])
        self.assertIsNone(conversation.active_request)

    def test_exhaustion_returns_safe_failure_and_one_failed_user_message(self):
        response, sent = self.send(exhausted=True)
        self.assertEqual(response.status_code, 502, response.data)
        self.assertEqual(response.data["error"]["code"], "provider_invalid_response")
        self.assertNotIn("whitespace", json.dumps(response.data))
        self.assertNotIn("synthetic-key", json.dumps(response.data))
        self.assertEqual(len(sent), 3)
        self.assertEqual(sent[1], sent[2])
        turn = TurnAudit.objects.get(pk=response.data["request_id"])
        self.assertEqual(turn.status, "failed")
        self.assert_attempt_audit(turn, exhausted=True)
        self.assertIsNone(turn.assistant_message)
        conversation = turn.conversation
        self.assertEqual(conversation.messages.count(), 1)
        self.assertEqual(conversation.messages.get().state, "failed")
        self.assertIsNone(conversation.active_request)
