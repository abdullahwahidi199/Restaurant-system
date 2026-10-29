"""Explicit mock providers for tests and --mock CLI only; never an HTTP fallback."""
import json

from .provider import Completion, ToolCall


def final(content, citations=(), kind="answer"):
    return Completion(json.dumps({"kind": kind, "content": content, "citations": list(citations)}, ensure_ascii=False))


def call(name, arguments, call_id="call_1"):
    return ToolCall(call_id, name, json.dumps(arguments, ensure_ascii=False))


class ScriptedProvider:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.requests = []

    def complete(self, **request):
        import copy
        self.requests.append(copy.deepcopy(request))
        try:
            response = next(self.responses)
        except StopIteration:
            raise AssertionError("The scripted provider ran out of responses.") from None
        if isinstance(response, Exception):
            raise response
        return response(request) if callable(response) else response


def tool_results(request):
    return [json.loads(message["content"]) for message in request["messages"] if message["role"] == "tool"]


class DemoProvider(ScriptedProvider):
    """Deterministic, visibly mock excerpt, exercising the actual tool loop."""
    def __init__(self, question):
        def fetch(request):
            if any(result.get('evidence_available') for result in tool_results(request)):
                return answer(request)
            searched = next(result for result in reversed(tool_results(request)) if result.get("results"))
            selected = searched["results"][0]
            return Completion(tool_calls=(call("fetch_documentation", {"search_token": searched["search_token"], "sections": [{key: selected[key] for key in ("document_id", "section_id")}], "max_characters": 12000}, "call_fetch"),), finish_reason="tool_calls")

        def answer(request):
            fetched = next(result for result in reversed(tool_results(request)) if result.get("sections"))
            section = fetched["sections"][0]
            if section["next_offset"] is not None:
                return final("The mock cannot summarize an incomplete section.", kind="limitation")
            return final("Mock demonstration — retrieved reference excerpt:\n\n" + section["content"][:1000], [{key: section[key] for key in ("document_id", "section_id")}])

        super().__init__([Completion(tool_calls=(call("search_documentation", {"query": question[:512], "limit": 5}, "call_search"),), finish_reason="tool_calls"), fetch, answer])
