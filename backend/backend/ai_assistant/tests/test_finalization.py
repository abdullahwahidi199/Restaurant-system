"""Post-fetch finalization regressions. No network or provider credits."""
import json
import re
from unittest.mock import patch

import httpx
from django.test import SimpleTestCase, override_settings

from ai_assistant.config import Limits
from ai_assistant.diagnostics import AssistantLogFormatter
from ai_assistant.errors import AssistantError
from ai_assistant.orchestrator import Orchestrator, decode_answer
from ai_assistant.prompts import SYSTEM_INSTRUCTIONS
from ai_assistant.provider import Completion, DeepSeekProvider
from ai_assistant.testing import ScriptedProvider, call, final
from .helpers import answer_latest, fetch_latest, gateway_fixture, search, tools


class FinalizationTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gateway, cls.index, _ = gateway_fixture()

    def run_turn(self, responses, **kwargs):
        provider = ScriptedProvider(responses)
        engine = Orchestrator(provider, self.gateway, kwargs.pop("limits", Limits()))
        return engine.run(user=object(), question="What is this system about?", **kwargs), provider

    def test_valid_final_after_fetch_is_accepted_on_third_call(self):
        with self.assertLogs("ai_assistant", level="INFO") as logs:
            result, provider = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 3)
        self.assertEqual(provider.requests[-1]["tool_choice"], "auto")
        records = [r for r in logs.records if r.msg == "assistant_model_call"]
        self.assertEqual([r.model_call_ordinal for r in records], [1, 2, 3])
        self.assertEqual([r.decision for r in records], ["continued", "continued", "accepted"])
        self.assertEqual(records[-1].state_before, "EVIDENCE_AVAILABLE")
        self.assertEqual(records[-1].decision_reason, "verified_cited_answer")
        for stage in ("provider", "context", "search", "fetch", "validation"):
            self.assertGreaterEqual(result.metrics[stage + "_duration_ms"], 0)

    def test_invalid_kind_recovers_with_specific_feedback_in_four_calls(self):
        invalid = Completion(json.dumps({"kind": "answer|clarification|limitation", "content": "PRIVATE_REJECTED_TEXT", "citations": []}))
        def repaired(request):
            correction = request["messages"][-1]["content"]
            self.assertIn("final_kind_invalid", correction)
            self.assertIn('exactly one of "answer", "clarification", "limitation"', correction)
            self.assertIn("Complete evidence is available", correction)
            self.assertIn("Complete authorized citation candidates", correction)
            self.assertNotIn("Search first, fetch", correction)
            self.assertNotIn("PRIVATE_REJECTED_TEXT", str(request["messages"]))
            self.assertEqual(request["tool_choice"], "auto")
            return answer_latest(request)
        with self.assertLogs("ai_assistant", level="INFO") as logs:
            result, provider = self.run_turn([search(), fetch_latest, invalid, repaired])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 4)
        rejected = [r for r in logs.records if getattr(r, "decision", None) == "rejected"]
        self.assertEqual(rejected[0].decision_reason, "final_kind_invalid")

    def test_repeat_same_validation_failure_stops_instead_of_six_call_loop(self):
        for invalid, reason in ((Completion(""), "final_content_empty"), (Completion("not-json"), "final_json_invalid"),
                (final("Missing citations"), "citations_missing_or_over_limit"),
                (final("Invalid reference", [{"document_id": "unknown", "section_id": "unknown"}]), "citation_not_fetched")):
            with self.subTest(reason=reason):
                provider = ScriptedProvider([search(), fetch_latest, invalid, invalid, invalid, invalid])
                engine = Orchestrator(provider, self.gateway, Limits())
                with self.assertLogs("ai_assistant", level="INFO") as logs, self.assertRaises(AssistantError) as caught:
                    engine.run(user=object(), question="What is this system about?")
                self.assertEqual(caught.exception.code, "answer_repair_stalled")
                self.assertEqual(caught.exception.status, 422)
                self.assertEqual(len(provider.requests), 4)
                calls = [r for r in logs.records if r.msg == "assistant_model_call"]
                self.assertEqual(calls[-1].decision_reason, "repeated_" + reason)
                self.assertEqual(engine.metrics["model_requests"], 4)

    def test_different_errors_replace_repair_message_without_accumulating_context(self):
        first = Completion("bad-json")
        second = Completion('{"kind":[],"content":"PRIVATE_REJECTED_TEXT","citations":[]}')
        def repaired(request):
            repairs = [m for m in request["messages"] if m["role"] == "system" and m["content"].startswith("Final response rejected:")]
            self.assertEqual(len(repairs), 1)
            self.assertIn("final_kind_invalid", repairs[0]["content"])
            self.assertNotIn("PRIVATE_REJECTED_TEXT", str(request["messages"]))
            return answer_latest(request)
        result, provider = self.run_turn([search(), fetch_latest, first, second, repaired])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 5)

    def test_new_evidence_allows_correction_after_same_previous_failure(self):
        def fetch_different(request):
            from ai_assistant.testing import tool_results
            found = next(r for r in reversed(tool_results(request)) if r.get("results"))
            item = found["results"][1]
            return tools(call("fetch_documentation", {"search_token":found["search_token"], "sections":[{"document_id":item["document_id"], "section_id":item["section_id"]}]}, "additional_fetch"))
        result, provider = self.run_turn([search(), fetch_latest, final("Missing citation"), fetch_different,
                                        final("Still missing citation"), answer_latest])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 6)
        self.assertEqual(result.metrics["fetches"], 2)

    def test_unexpected_tool_after_fetch_is_safe_and_can_recover(self):
        unexpected = tools(call("execute_sql", {"sql": "PRIVATE_ARGUMENT"}, "unexpected"))
        with self.assertLogs("ai_assistant", level="INFO") as logs:
            result, provider = self.run_turn([search(), fetch_latest, unexpected, answer_latest])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 4)
        tool = next(r for r in logs.records if r.msg == "assistant_tool" and r.tool == "unregistered")
        self.assertEqual(tool.error_code, "unknown_tool")
        self.assertNotIn("PRIVATE_ARGUMENT", str(logs.output))

    def test_short_discovery_handles_keep_signed_tokens_out_of_model_messages(self):
        execute = self.gateway.execute
        signed = []
        def checked(**kwargs):
            if kwargs["name"] == "fetch_documentation":
                self.assertIn(kwargs["arguments"]["search_token"], signed)
            result = execute(**kwargs)
            if result.get("search_token"):
                signed.append(result["search_token"])
            return result
        with patch.object(self.gateway, "execute", side_effect=checked):
            result, provider = self.run_turn([search(), fetch_latest, answer_latest])
        self.assertEqual(result.kind, "answer")
        self.assertTrue(signed)
        context = json.dumps([r["messages"] for r in provider.requests])
        self.assertIn("discovery_1", context)
        self.assertTrue(all(token not in context for token in signed))
        self.assertTrue(all(len(token) > len("discovery_1") for token in signed))

    def test_short_citation_is_resolved_then_verified_against_complete_evidence(self):
        from ai_assistant.testing import tool_results
        def answer(request):
            fetched = tool_results(request)[-1]
            candidates = fetched["complete_citation_candidates"]
            self.assertEqual(candidates[0]["section_id"], "evidence_1")
            self.assertNotEqual(candidates[0]["section_id"], fetched["sections"][0]["section_id"])
            return final("Use the cited documentation.", candidates)
        result, provider = self.run_turn([search(), fetch_latest, answer])
        self.assertEqual(len(provider.requests), 3)
        self.assertTrue(self.index.get_section(result.sources[0]["section_id"]))
        self.assertNotEqual(result.sources[0]["section_id"], "evidence_1")

    def test_alias_does_not_authorize_different_document_or_invented_reference(self):
        for citation, expected in (({"document_id":"unknown", "section_id":"evidence_1"}, "citation_document_mismatch"),
                                   ({"document_id":"unknown", "section_id":"evidence_999"}, "citation_not_fetched")):
            with self.subTest(reason=expected), self.assertLogs("ai_assistant", level="INFO") as logs:
                result, _ = self.run_turn([search(), fetch_latest, final("Unsupported candidate", [citation]), answer_latest])
            self.assertEqual(result.kind, "answer")
            self.assertIn(expected, [getattr(r, "decision_reason", "") for r in logs.records])

    def test_mixed_complete_and_partial_fetch_only_offers_complete_citations(self):
        from ai_assistant.testing import tool_results
        selected = {}
        def mixed_fetch(request):
            found = tool_results(request)[-1]
            items = found["results"][:2]
            lengths = [len(self.index.get_section(item["section_id"])["content"]) for item in items]
            self.assertNotEqual(*lengths)
            selected["partial"] = items[lengths.index(max(lengths))]
            return fetch_latest(request, count=2, max_characters=min(lengths))
        def answer(request):
            fetched = tool_results(request)[-1]
            self.assertTrue(any(s["is_partial"] for s in fetched["sections"]))
            self.assertEqual(len(fetched["complete_citation_candidates"]), 1)
            return final("Use only the supported complete procedure.", fetched["complete_citation_candidates"])
        result, provider = self.run_turn([search(), mixed_fetch, answer])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 3)
        self.assertNotEqual(result.sources[0]["section_id"], selected["partial"]["section_id"])

    def test_partial_citation_is_rejected_even_if_other_evidence_is_complete(self):
        from ai_assistant.testing import tool_results
        selected = {}
        def mixed_fetch(request):
            items = tool_results(request)[-1]["results"][:2]
            lengths = [len(self.index.get_section(item["section_id"])["content"]) for item in items]
            selected["partial"] = {k:items[lengths.index(max(lengths))][k] for k in ("document_id","section_id")}
            return fetch_latest(request, count=2, max_characters=min(lengths))
        def bad_answer(request):
            return final("Do not accept partial evidence.", [selected["partial"]])
        def repaired(request):
            self.assertIn("citation_incomplete", request["messages"][-1]["content"])
            found = next(r for r in reversed(tool_results(request)) if r.get("complete_citation_candidates"))
            return final("Use complete evidence only.", found["complete_citation_candidates"])
        result, provider = self.run_turn([search(), mixed_fetch, bad_answer, repaired])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 4)

    def test_invented_discovery_handle_is_not_substituted_or_authorized(self):
        invalid = tools(call("fetch_documentation", {"search_token":"invented", "sections":[{"document_id":"unknown", "section_id":"unknown"}]}, "bad_handle"))
        result, provider = self.run_turn([search(), invalid, search(call_id="renewed_search"), fetch_latest, answer_latest])
        self.assertEqual(result.kind, "answer")
        self.assertEqual(len(provider.requests), 5)
        self.assertIn("discovery_invalid", provider.requests[2]["messages"][-1]["content"])

    @override_settings(DEEPSEEK_API_KEY="mock-private-key")
    def test_empty_wire_response_fails_once_with_shape_diagnostics(self):
        def empty(request):
            provider = DeepSeekProvider(transport=httpx.MockTransport(lambda req: httpx.Response(200, json={
                "choices":[{"message":{"role":"assistant", "content":""}, "finish_reason":"stop"}]})))
            return provider.complete(**request)
        with self.assertLogs("ai_assistant", level="INFO") as logs, self.assertRaises(AssistantError) as caught:
            self.run_turn([search(), fetch_latest, empty])
        self.assertEqual(caught.exception.code, "provider_invalid_response")
        calls = [r for r in logs.records if r.msg == "assistant_model_call"]
        self.assertEqual(len(calls), 3)
        self.assertEqual(calls[-1].finish_reason, "stop")
        self.assertEqual(calls[-1].assistant_content_length, 0)
        self.assertEqual(calls[-1].decision, "failed")
        self.assertNotIn("mock-private-key", str(logs.output))

    def test_genuine_progress_can_still_exhaust_unchanged_configured_limit(self):
        provider = ScriptedProvider([search(call_id="s" + str(i)) for i in range(7)])
        engine = Orchestrator(provider, self.gateway, Limits())
        with self.assertRaises(AssistantError) as caught:
            engine.run(user=object(), question="Find more documentation")
        self.assertEqual(caught.exception.code, "orchestration_limit")
        self.assertEqual(len(provider.requests), 6)
        self.assertEqual(Limits().model_requests, 6)

    def test_final_shape_errors_remain_strict_and_diagnostic(self):
        for raw, reason in ((" ", "final_content_empty"), ("[]", "final_json_invalid"),
                ('{"kind":"answer"}', "final_fields_invalid"),
                ('{"kind":"answer","content":"x","citations":{}}', "final_citations_invalid"),
                ('{"kind":"answer","content":"   ","citations":[]}', "final_content_empty"),
                ('{"kind":"answer","content":"x","citations":[],"extra":true}', "final_fields_invalid")):
            with self.subTest(reason=reason), self.assertRaises(AssistantError) as caught:
                decode_answer(raw, Limits())
            self.assertEqual(caught.exception.code, "answer_invalid")
            self.assertEqual(caught.exception.diagnostic_reason, reason)
        example = re.search(r'\{"kind":"answer", "content":"operator-friendly explanation",\s*"citations":\[\{"document_id":"\.\.\.", "section_id":"\.\.\."\}\]\}', SYSTEM_INSTRUCTIONS).group()
        self.assertEqual(decode_answer(example, Limits())["kind"], "answer")

    def test_formatted_call_diagnostics_exclude_text_tokens_and_reasoning(self):
        import logging
        record = logging.LogRecord("ai_assistant", logging.INFO, "", 0, "assistant_model_call", (), None)
        record.__dict__.update(model_call_ordinal=3, finish_reason="stop", tool_call_count=0,
            assistant_content_length=200, decision="rejected", decision_reason="citation_schema_invalid",
            content="PRIVATE_TEXT", reasoning_content="PRIVATE_REASONING", search_token="PRIVATE_TOKEN", api_key="PRIVATE_KEY")
        formatted = AssistantLogFormatter().format(record)
        self.assertNotIn("PRIVATE", formatted)
        self.assertEqual(json.loads(formatted)["model_call_ordinal"], 3)
