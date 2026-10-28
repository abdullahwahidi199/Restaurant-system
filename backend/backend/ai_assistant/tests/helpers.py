import json
from pathlib import Path

from knowledge.gateway import KnowledgeGateway
from knowledge.loader import load_index
from knowledge.tests.gateway_helpers import MemoryRepository, identity

from ai_assistant.provider import Completion
from ai_assistant.testing import call, final, tool_results

INDEX_ROOT = Path(__file__).resolve().parents[4] / "docs/ai_knowledge/.generated"


def gateway_fixture(role="Admin"):
    index = load_index(INDEX_ROOT)
    current = {"principal": identity(role)}
    gateway = KnowledgeGateway(repository=MemoryRepository(index), principal_resolver=lambda user: current["principal"])
    return gateway, index, current


def tools(*calls):
    return Completion(tool_calls=tuple(calls), finish_reason="tool_calls")


def search(query="contractor invoice payment", call_id="search_1", **kwargs):
    return tools(call("search_documentation", {"query": query, "limit": 8, **kwargs}, call_id))


def fetch_latest(request, *, count=1, call_id="fetch_1", **overrides):
    found = next(result for result in reversed(tool_results(request)) if result.get("results"))
    selected = [{key: result[key] for key in ("document_id", "section_id")} for result in found["results"][:count]]
    return tools(call("fetch_documentation", {"search_token": found["search_token"], "sections": selected, "max_characters": 12000, **overrides}, call_id))


def answer_latest(request):
    found = [section for result in tool_results(request) for section in result.get("sections", [])]
    citations = [{key: section[key] for key in ("document_id", "section_id")} for section in found]
    return final("Use the documented control and enter the required invoice/payment fields. Check the amount restrictions before submitting.", citations)
