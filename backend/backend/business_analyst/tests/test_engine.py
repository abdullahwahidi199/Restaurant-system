import json
from dataclasses import replace
from unittest.mock import patch

import httpx
from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import ModelConfiguration
from ai_assistant.provider import Completion, DeepSeekProvider, ToolCall
from ai_assistant.testing import ScriptedProvider
from django.test import override_settings
from users.models import Staff

from business_analyst.config import Limits
from business_analyst.context import principal_for
from business_analyst.engine import Engine
from business_analyst.registry import production_registry
from .helpers import DOC, OTHER_DOC, DatabaseFixture, batch, definition, final, invocation


class EngineTests(DatabaseFixture):
    def execute_engine(self, responses, *, limits=None, registry=None, configuration=None):
        provider = ScriptedProvider(responses)
        events = []
        result = Engine(provider, self.documents, registry or production_registry(self.documents),
                        limits or Limits(), audit=lambda event, metadata: events.append((event, metadata))).run(
                            user=self.admin, question="What does dashboard sales mean?", principal=principal_for(self.admin),
                            request_id="test-turn", configuration=configuration)
        return result, provider, events

    def test_actual_documentation_only_question_uses_two_model_calls_and_one_batch(self):
        def answer(request):
            tool_message = next(message for message in request["messages"] if message["role"] == "tool")
            evidence = json.loads(tool_message["content"])["results"][0]
            self.assertTrue(evidence["ok"])
            self.assertIn("not verified cash collections or profit", evidence["data"]["content"])
            self.assertIn("completed or delivered", evidence["data"]["content"])
            return final(citations=[evidence["evidence_id"]])
        result, provider, events = self.execute_engine([batch(), answer])
        self.assertEqual(len(provider.requests), 2)
        self.assertEqual(sum(event == "batch_started" for event, _ in events), 1)
        self.assertEqual(result.sources[0]["document_id"], DOC)
        self.assertEqual(result.sources[0]["kind"], "document")
        self.assertIn("not verified cash", result.content)
        for request in provider.requests:
            self.assertIn("Business Capability Map", request["messages"][1]["content"])
            self.assertIn(DOC, request["messages"][1]["content"])
            self.assertEqual([tool["name"] for tool in request["tools"]], ["retrieve_business_context"])
            self.assertNotIn("search_documentation", json.dumps(request["tools"]))

    def test_multiple_documents_and_tools_share_a_batch_with_distinct_evidence_types(self):
        result, provider, events = self.execute_engine(
            [batch([DOC, OTHER_DOC], [invocation(amount=3)]), final(citations=["b1:0", "b1:1", "b1:2"])],
            registry=self.registry(definition()))
        self.assertEqual([source["kind"] for source in result.sources], ["document", "document", "tool"])
        self.assertIn("executed_at", result.sources[2])
        self.assertEqual(sum(event == "batch_started" for event, _ in events), 1)
        self.assertEqual(len(provider.requests), 2)
        self.assertIn("test.echo", provider.requests[0]["messages"][1]["content"])

    def test_additional_retrieval_round_when_more_evidence_is_needed(self):
        result, provider, events = self.execute_engine([batch(), batch([OTHER_DOC], call_id="second"),
                                                       final(citations=["b1:0", "b2:0"])])
        self.assertEqual(len(provider.requests), 3)
        self.assertEqual(len(result.sources), 2)
        self.assertEqual(sum(event == "batch_started" for event, _ in events), 2)

    def test_multiple_model_function_calls_are_executed_before_next_model_request(self):
        first = Completion(tool_calls=(batch().tool_calls[0], batch([OTHER_DOC], call_id="second").tool_calls[0]), finish_reason="tool_calls")
        result, provider, _ = self.execute_engine([first, final(citations=["b1:0", "b2:0"])])
        self.assertEqual(len(provider.requests), 2)
        self.assertEqual([message["tool_call_id"] for message in provider.requests[1]["messages"] if message["role"] == "tool"], ["retrieve_1", "second"])
        self.assertEqual(len(result.sources), 2)

    def test_malformed_and_unknown_function_requests_receive_safe_errors_then_can_recover(self):
        for call, code in ((ToolCall("bad", "eval", "{}"), "TOOL_NOT_REGISTERED"),
                           (ToolCall("bad", "retrieve_business_context", "{"), "INVALID_PARAMETERS"),
                           (ToolCall("bad", "retrieve_business_context", '{"branch_id":42}'), "INVALID_PARAMETERS")):
            first = Completion(tool_calls=(call,), finish_reason="tool_calls")
            result, provider, _ = self.execute_engine([first, batch(), final()])
            error = json.loads(next(message["content"] for message in provider.requests[1]["messages"] if message["role"] == "tool"))
            self.assertEqual(error["error"]["code"], code)
            self.assertEqual(result.sources[0]["document_id"], DOC)

    def test_uncited_early_or_forged_answers_are_rejected_without_replaying_unsupported_prose(self):
        for invalid in (final("UNSUPPORTED_TEXT", citations=[]), final("UNSUPPORTED_TEXT", citations=["made-up"])):
            result, provider, events = self.execute_engine([invalid, batch(), final()])
            self.assertNotIn("UNSUPPORTED_TEXT", json.dumps(provider.requests[1]["messages"]))
            self.assertTrue(any(event == "answer_rejected" for event, _ in events))
            self.assertTrue(result.sources)
        with self.assertRaises(AssistantError) as caught:
            self.execute_engine([final(citations=[]), final(citations=[])])
        self.assertEqual(caught.exception.code, "unsupported_answer")

    def test_failed_operations_cannot_be_cited(self):
        with self.assertRaises(AssistantError) as caught:
            self.execute_engine([batch(["missing"]), final(), final()])
        self.assertEqual(caught.exception.code, "unsupported_answer")

    def test_live_data_limitation_does_not_invoke_unavailable_production_tools(self):
        result, provider, events = self.execute_engine([final("Current revenue is unavailable; no sales tools are registered.", citations=[], kind="limitation")])
        self.assertEqual(result.kind, "limitation")
        self.assertEqual(result.sources, [])
        self.assertEqual(len(provider.requests), 1)
        self.assertFalse(any(event == "batch_started" for event, _ in events))

    def test_reasoning_configuration_is_reused_and_transient_reasoning_is_replayed_for_tool_protocol(self):
        first = replace(batch(), reasoning_content="transient provider protocol state")
        _, provider, _ = self.execute_engine([first, final()], configuration=ModelConfiguration("deepseek-v4-pro", "high"))
        self.assertEqual(provider.requests[0]["configuration"].reasoning_effort, "high")
        assistant_call = next(message for message in provider.requests[1]["messages"] if message["role"] == "assistant")
        self.assertEqual(assistant_call["reasoning_content"], first.reasoning_content)

    def test_retrieval_model_context_and_turn_limits_fail_safely(self):
        for responses, limits, expected in (([batch(), batch(call_id="second")], replace(Limits(), retrieval_rounds=1), "retrieval_limit"),
                                            ([batch()], replace(Limits(), model_requests=1), "model_limit"),
                                            ([batch()], replace(Limits(), context_bytes=100), "context_limit")):
            with self.subTest(expected=expected), self.assertRaises(AssistantError) as caught:
                self.execute_engine(responses, limits=limits)
            self.assertEqual(caught.exception.code, expected)
        with patch("business_analyst.engine.time.monotonic", side_effect=[0, 1000]), self.assertRaises(AssistantError) as caught:
            self.execute_engine([batch()])
        self.assertEqual(caught.exception.code, "turn_timeout")

    def test_context_change_during_generation_cannot_return_an_answer(self):
        def change(request):
            Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
            return batch()
        with self.assertRaises(AssistantError) as caught:
            self.execute_engine([change, final()])
        self.assertEqual(caught.exception.code, "context_changed")

    @override_settings(DEEPSEEK_API_KEY="test-only-provider-key", DEEPSEEK_MODEL="deepseek-flash", DEEPSEEK_REASONING_EFFORT="none")
    def test_actual_deepseek_transport_integrates_with_business_batch_protocol(self):
        payloads = []
        def transport(request):
            body = json.loads(request.content)
            payloads.append(body)
            if len(payloads) == 1:
                message = batch().message()
                finish = "tool_calls"
            else:
                message = final().message()
                finish = "stop"
            return httpx.Response(200, json={"choices": [{"message": message, "finish_reason": finish}]})
        provider = DeepSeekProvider(transport=httpx.MockTransport(transport))
        result = Engine(provider, self.documents, production_registry(self.documents), Limits()).run(
            user=self.admin, question="Explain dashboard sales", principal=principal_for(self.admin), request_id="transport-test")
        self.assertEqual(result.sources[0]["document_id"], DOC)
        self.assertEqual(len(payloads), 2)
        self.assertTrue(all(DOC in body["messages"][1]["content"] for body in payloads))
        self.assertNotIn("test-only-provider-key", json.dumps(payloads))
