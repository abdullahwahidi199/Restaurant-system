"""HTTP/UI integration seams using real orchestration and mocked provider transport."""
import json
from unittest.mock import patch

import httpx
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework.permissions import BasePermission
from ai_assistant.model_configuration import MODELS, EFFORTS, model_options
from ai_assistant.provider import DeepSeekProvider
from ai_assistant.testing import ScriptedProvider
from business_analyst.models import TurnAudit
from expenses.views import expensesApi
from .expense_data import create_expense_data
from .helpers import DatabaseFixture, batch, final, invocation

ROOT = "/api/business-analyst/"
DOC = "admin_finance_expenses"


class Denied(BasePermission):
    def has_permission(self, request, view):
        return False


class ChatIntegrationTests(DatabaseFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.data = create_expense_data(cls.restaurant, cls.branch)

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_business_options_reuse_shared_configuration_and_require_trusted_context(self):
        response = self.client.get(ROOT + "model-options/")
        self.assertEqual(response.data, model_options())
        self.assertIn("no-store", response["Cache-Control"])
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(ROOT + "model-options/").status_code, 401)

    @override_settings(DEEPSEEK_API_KEY="synthetic-transport-key")
    def test_all_eight_selector_combinations_reach_actual_deepseek_payload_and_two_call_flow(self):
        for model, _ in MODELS:
            for effort, _ in EFFORTS:
                with self.subTest(model=model, effort=effort):
                    requests = []
                    def transport(request):
                        payload = json.loads(request.content)
                        requests.append(payload)
                        self.assertEqual(payload["model"], model)
                        self.assertEqual(payload["thinking"], {"type": "disabled" if effort == "none" else "enabled"})
                        self.assertEqual(payload.get("reasoning_effort"), None if effort == "none" else effort)
                        supplied = json.loads(payload["messages"][1]["content"].split("\n", 1)[1])
                        self.assertEqual(supplied, self.documents.map)
                        message = {"role": "assistant"}
                        if effort != "none":
                            message["reasoning_content"] = "Synthetic private reasoning; never returned to the UI."
                        if len(requests) == 1:
                            message.update(content=None, tool_calls=[{"id": "retrieve_1", "type": "function", "function": {
                                "name": "retrieve_business_context", "arguments": json.dumps({"document_ids": [DOC], "tools": []})}}])
                            finish = "tool_calls"
                        else:
                            prior = next(m for m in payload["messages"] if m["role"] == "assistant")
                            self.assertEqual("reasoning_content" in prior, effort != "none")
                            message["content"] = json.dumps({"kind": "answer", "content": "USD expenses use their saved AFN conversion.", "citations": ["b1:0"]})
                            finish = "stop"
                        return httpx.Response(200, json={"choices": [{"message": message, "finish_reason": finish}],
                            "usage": {"prompt_tokens": 100, "completion_tokens": 20, "total_tokens": 120}})
                    provider = DeepSeekProvider(transport=httpx.MockTransport(transport))
                    with patch("business_analyst.service.get_provider", return_value=provider):
                        response = self.client.post(ROOT + "chat/", {"message": "Explain expense conversion.",
                            "model": model, "reasoning_effort": effort}, format="json")
                    self.assertEqual(response.status_code, 200, response.data)
                    turn = TurnAudit.objects.get(pk=response.data["request_id"])
                    self.assertEqual((turn.model_calls, turn.batches, turn.operations), (2, 1, 1))
                    self.assertNotIn("Synthetic private reasoning", json.dumps(response.data))

    def test_saved_data_answer_visible_as_past_observation_but_withheld_from_model_followup(self):
        first = ScriptedProvider([batch([DOC], [invocation("get_expense_summary", "expense")]),
            final("Current expenses total AFN 1850.00.", citations=["b1:0", "b1:1"])])
        with patch("business_analyst.service.get_provider", return_value=first):
            response = self.client.post(ROOT + "chat/", {"message": "Show all-time expenses."}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        identity = response.data["conversation_id"]
        history = self.client.get(ROOT + f"conversations/{identity}/messages/")
        answer = history.data["results"][1]
        self.assertEqual(answer["content"], "Current expenses total AFN 1850.00.")
        self.assertTrue(answer["historical_observation"])
        self.assertFalse(answer["stale_sources"])
        self.assertEqual(answer["sources"][1]["tool_id"], "get_expense_summary")
        second = ScriptedProvider([batch([DOC], [invocation("get_expense_summary", "fresh", date_from="2026-01-01", date_to="2026-01-31")]),
            final("January expenses total AFN 1810.00.", citations=["b1:0", "b1:1"])])
        with patch("business_analyst.service.get_provider", return_value=second):
            followup = self.client.post(ROOT + "chat/", {"message": "Now show January.", "conversation_id": identity}, format="json")
        self.assertEqual(followup.status_code, 200, followup.data)
        self.assertNotIn("Current expenses total AFN 1850.00.", json.dumps(second.requests[0]["messages"]))
        with patch.object(expensesApi.cls, "permission_classes", [Denied]):
            denied = self.client.get(ROOT + f"conversations/{identity}/messages/")
        self.assertTrue(denied.data["results"][1]["stale_sources"])
        self.assertNotIn("1850", denied.data["results"][1]["content"])

    def test_invalid_model_options_do_not_start_provider_or_conversation(self):
        with patch("business_analyst.service.get_provider") as provider:
            for values in ({"model": "retired"}, {"reasoning_effort": "ultra"}):
                response = self.client.post(ROOT + "chat/", {"message": "Explain expenses.", **values}, format="json")
                self.assertEqual(response.status_code, 400)
            provider.assert_not_called()
