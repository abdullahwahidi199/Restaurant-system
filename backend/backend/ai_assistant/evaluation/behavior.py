"""Non-metric cases through the real engine, with visibly scripted model choices."""
from knowledge.gateway import KnowledgeGateway
from ai_assistant.config import Limits
from ai_assistant.evidence import reference_for
from ai_assistant.orchestrator import Orchestrator
from ai_assistant.provider import Completion
from ai_assistant.testing import ScriptedProvider, call, final

from .dataset import evaluation_principal
from .retrieval import FixedSnapshot, verify_fetch


def evaluate_behaviors(records, index):
    cases = []
    for record in records:
        if record["retrieval_metric"]:
            continue
        principal = evaluation_principal(record["principal"])
        gateway = KnowledgeGateway(repository=FixedSnapshot(index), principal_resolver=lambda user: principal)
        def search(number):
            return Completion(tool_calls=(call("search_documentation", {"query": record["question"], "limit": 5}, f"search_{number}"),), finish_reason="tool_calls")
        history = []
        if record["expected_behavior"] == "clarify":
            provider = ScriptedProvider([search(1), final("Clarify", kind="clarification")])
            expected = "clarification"
        elif record["expected_behavior"] == "live_data_unavailable":
            provider, expected = ScriptedProvider([]), "limitation"
        elif record["expected_behavior"] == "unsupported":
            provider = ScriptedProvider([search(1), search(2), final("SCRIPTED_UNSUPPORTED_INSTRUCTIONS", kind="limitation")])
            expected = "limitation"
        else:
            source = index.get_section(record["expected_sections"][0])
            doc = index.get_document(source["document_id"])
            found = gateway.search_documentation(user=object(), query=source["section_id"], limit=5)
            actual = next(r for r in found["results"] if r["section_id"] == source["section_id"])
            verify_fetch(gateway, index, found, actual)
            reference = reference_for(source, doc, index.version)
            history = [{"role": "user", "kind": "question", "content": record["prior_question"], "sources": []},
                       {"role": "assistant", "kind": "answer", "content": "Previously retrieved reference excerpt: " + source["content"][:300], "sources": [reference]}]
            provider = ScriptedProvider([final("Scripted follow-up supported by the revalidated prior section.", [{"document_id": source["document_id"], "section_id": source["section_id"]}])])
            expected = "answer"
        case = {"id": record["id"], "expected_behavior": record["expected_behavior"]}
        try:
            result = Orchestrator(provider, gateway, Limits()).run(user=object(), question=record["question"], history=history)
            valid = result.kind == expected and "SCRIPTED_UNSUPPORTED_INSTRUCTIONS" not in result.content
            if record["expected_behavior"] == "followup_reuse":
                valid = valid and bool(result.sources) and result.metrics["searches"] == 0
            else:
                valid = valid and not result.sources
            case.update({"status": "passed" if valid else "failed", "actual_kind": result.kind, "model_requests": len(provider.requests), "new_searches": result.metrics.get("searches", 0)})
        except Exception as exc:
            case.update({"status": "failed", "error_type": type(exc).__name__, "code": getattr(exc, "code", "unexpected_evaluation_error")})
        cases.append(case)
    return {"cases": cases, "passed": sum(c["status"] == "passed" for c in cases), "failed": sum(c["status"] == "failed" for c in cases),
            "scope": "Predetermined fake model protocol through the real engine and gateway. This verifies control flow, not real model decision/answer quality."}
