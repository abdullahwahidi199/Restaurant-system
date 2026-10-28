import json
from unittest.mock import Mock

import httpx
from django.test import SimpleTestCase, override_settings

from ai_assistant.config import Limits
from ai_assistant.errors import AssistantError
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.provider import DeepSeekProvider, parse_completion

from .helpers import gateway_fixture


def payload(content='{"kind":"limitation","content":"No evidence","citations":[]}', calls=None, finish="stop", **extra):
    return {"choices": [{"message": {"role": "assistant", "content": content, **({"tool_calls": calls} if calls else {}), **extra}, "finish_reason": finish}], "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}}


@override_settings(DEEPSEEK_API_KEY="mock-key-not-a-real-secret", DEEPSEEK_BASE_URL="https://api.deepseek.com", DEEPSEEK_MODEL="deepseek-flash")
class ProviderTests(SimpleTestCase):
    def invoke(self, handler, **kwargs):
        provider = DeepSeekProvider(transport=httpx.MockTransport(handler))
        return provider.complete(messages=[{"role": "system", "content": "Return JSON."}, {"role": "user", "content": "Test"}], tools=[], tool_choice="search_documentation", limits=Limits(), timeout=10, request_id="test-request", **kwargs)

    def test_actual_request_format_disables_thinking_forced_choice_and_usage(self):
        captured = []
        def handler(request):
            captured.append(request)
            return httpx.Response(200, json=payload())
        result = self.invoke(handler)
        body = json.loads(captured[0].content)
        self.assertEqual(str(captured[0].url), "https://api.deepseek.com/chat/completions")
        self.assertEqual(body["model"], "deepseek-flash")
        self.assertEqual(body["thinking"], {"type": "disabled"})
        self.assertEqual(body["tool_choice"], {"type": "function", "function": {"name": "search_documentation"}})
        self.assertEqual(body["response_format"], {"type": "json_object"})
        self.assertFalse(body["stream"])
        self.assertEqual(result.usage["total_tokens"], 15)
        self.assertNotIn("mock-key", json.dumps(body))

    def test_missing_key_makes_no_transport_call(self):
        handler = Mock(side_effect=AssertionError("No network allowed"))
        with override_settings(DEEPSEEK_API_KEY=""), self.assertRaises(AssistantError) as caught:
            self.invoke(handler)
        self.assertEqual(caught.exception.code, "provider_not_configured")
        handler.assert_not_called()

    def test_logs_contain_status_not_provider_body_key_or_conversation_text(self):
        with self.assertLogs("ai_assistant", level="INFO") as captured:
            self.invoke(lambda request: httpx.Response(200, json=payload()))
        self.assertEqual(captured.records[-1].provider_status, "ok")
        self.assertTrue(hasattr(captured.records[-1], "duration_ms"))
        self.assertNotIn("mock-key", str(captured.output))
        self.assertFalse(any("messages" in record.__dict__ for record in captured.records))
        with self.assertRaises(AssistantError) as caught:
            self.invoke(lambda request: httpx.Response(200, json=payload(content=json.dumps({"kind": "answer", "content": "mock-key-not-a-real-secret", "citations": []}))))
        self.assertEqual(caught.exception.code, "provider_invalid_response")
        self.assertNotIn("mock-key", str(caught.exception))

    def test_provider_auth_rate_timeout_and_service_failures_are_safe(self):
        for status, code in [(401, "provider_authentication"), (403, "provider_authentication"), (429, "provider_rate_limited"), (500, "provider_unavailable"), (400, "provider_request_failed"), (302, "provider_request_failed")]:
            with self.subTest(status=status), self.assertRaises(AssistantError) as caught:
                self.invoke(lambda request: httpx.Response(status, text="PRIVATE PROVIDER BODY mock-key-not-a-real-secret"))
            self.assertEqual(caught.exception.code, code)
            self.assertNotIn("PRIVATE", str(caught.exception))
        def timeout(request):
            raise httpx.ReadTimeout("private endpoint details", request=request)
        with self.assertRaises(AssistantError) as caught:
            self.invoke(timeout)
        self.assertEqual(caught.exception.code, "provider_timeout")

    def test_invalid_json_reasoning_and_truncated_responses_rejected(self):
        bad = [payload(finish="length"), payload(reasoning_content="private reasoning"), {}, {"choices": []}]
        for data in bad:
            with self.subTest(data=data), self.assertRaises(AssistantError):
                self.invoke(lambda request: httpx.Response(200, json=data))
        with self.assertRaises(AssistantError):
            self.invoke(lambda request: httpx.Response(200, text="not json"))
        with self.assertRaises(AssistantError):
            self.invoke(lambda request: httpx.Response(200, content=b"x" * 256001))

    def test_api_endpoint_and_model_configuration_cannot_send_keys_to_http_or_userinfo(self):
        for base in ("http://api.deepseek.com", "https://user:pass@example.invalid", "https://api.deepseek.com?key=bad", "https://api.deepseek.com:invalid", 42):
            handler = Mock()
            with self.subTest(base=base), override_settings(DEEPSEEK_BASE_URL=base), self.assertRaises(AssistantError):
                self.invoke(handler)
            handler.assert_not_called()

    def test_tool_response_parsing_and_duplicate_call_ids(self):
        call = {"id": "call_one", "type": "function", "function": {"name": "search_documentation", "arguments": '{"query":"menu"}'}}
        result = parse_completion(payload(content=None, calls=[call], finish="tool_calls"))
        self.assertEqual(result.tool_calls[0].id, "call_one")
        self.assertEqual(result.message()["tool_calls"][0], call)
        with self.assertRaises(AssistantError):
            parse_completion(payload(content=None, calls=[call, call], finish="tool_calls"))

    def test_real_adapter_orchestrator_gateway_sequence_without_network(self):
        gateway, _, _ = gateway_fixture()
        requests = []
        def handler(request):
            body = json.loads(request.content)
            requests.append(body)
            if len(requests) == 1:
                call = {"id": "model_search", "type": "function", "function": {"name": "search_documentation", "arguments": '{"query":"contractor invoice"}'}}
                return httpx.Response(200, json=payload(content=None, calls=[call], finish="tool_calls"))
            tool = json.loads(body["messages"][-1]["content"])
            if len(requests) == 2:
                first = tool["results"][0]
                arguments = {"search_token": tool["search_token"], "sections": [{key: first[key] for key in ("document_id", "section_id")}]}
                call = {"id": "model_fetch", "type": "function", "function": {"name": "fetch_documentation", "arguments": json.dumps(arguments)}}
                return httpx.Response(200, json=payload(content=None, calls=[call], finish="tool_calls"))
            first = tool["sections"][0]
            content = json.dumps({"kind": "answer", "content": "Use the documented invoice form.", "citations": [{key: first[key] for key in ("document_id", "section_id")}]})
            return httpx.Response(200, json=payload(content=content))
        provider = DeepSeekProvider(transport=httpx.MockTransport(handler))
        result = Orchestrator(provider, gateway, Limits()).run(user=object(), question="How do I create a contractor invoice?")
        self.assertEqual(len(requests), 3)
        self.assertEqual(result.sources[0]["document_id"], "operator_modules_contractors_services")
        self.assertEqual(requests[2]["messages"][-1]["tool_call_id"], "model_fetch")
        self.assertEqual(requests[1]["tools"][0]["type"], "function")
