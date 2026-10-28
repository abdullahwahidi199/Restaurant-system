"""Actual gateway results, exact-section metrics and same-snapshot fetch auditing."""
from collections import defaultdict

from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway
from knowledge.markdown import digest

from .dataset import evaluation_principal


class FixedSnapshot:
    def __init__(self, index):
        self.index = index

    def get(self):
        return self.index


def aggregate(cases):
    eligible = [case for case in cases if case["retrieval_metric"]]
    denominator = len(eligible)
    return {"denominator": denominator, **{f"recall_at_{k}": sum(case["first_correct_rank"] is not None and case["first_correct_rank"] <= k for case in eligible) / denominator if denominator else None for k in (1, 3, 5)},
            "mrr_at_15": sum(1 / case["first_correct_rank"] if case["first_correct_rank"] else 0 for case in eligible) / denominator if denominator else None}


def grouped(cases, key):
    groups = defaultdict(list)
    for case in cases:
        if case["retrieval_metric"]:
            groups[case[key]].append(case)
    return {group: aggregate(items) for group, items in sorted(groups.items())}


def verify_fetch(gateway, index, found, result):
    offset, parts, pages = 0, [], 0
    while True:
        pages += 1
        if pages > 50:
            raise ValueError("Evaluation page limit exceeded.")
        response = gateway.fetch_documentation(user=object(), search_token=found["search_token"], sections=[{"document_id": result["document_id"], "section_id": result["section_id"], "offset": offset}], max_characters=12000)
        section = response["sections"][0]
        parts.append(section["content"])
        if section["next_offset"] is None:
            break
        offset = section["next_offset"]
    raw = "".join(parts)
    original = index.get_section(result["section_id"])
    if raw != original["content"] or section["document_id"] != original["document_id"] or digest(raw) != original["content_hash"] or section["heading"] != original["heading"]:
        raise ValueError("Search/fetch source mismatch.")
    return {"exact": True, "characters": len(raw), "pages": pages, "content_hash": digest(raw)}


def evaluate_retrieval(records, index, config):
    current = {"principal": evaluation_principal("Admin")}
    gateway = KnowledgeGateway(repository=FixedSnapshot(index), principal_resolver=lambda user: current["principal"])
    cases = []
    for record in records:
        current["principal"] = evaluation_principal(record["principal"])
        case = {key: record[key] for key in ("id", "question", "language", "category", "module", "principal", "expected_behavior", "retrieval_metric", "expected_documents", "expected_sections")}
        try:
            found = gateway.search_documentation(user=object(), query=record["question"], limit=config["search_limit"])
            case["results"] = [{key: result[key] for key in ("rank", "document_id", "section_id", "title", "module", "document_type", "relevance_score")} for result in found["results"]]
            correct = next((result for result in found["results"] if result["section_id"] in record["expected_sections"] and result["document_id"] in record["expected_documents"]), None)
            case["first_correct_rank"] = correct["rank"] if correct else None
            # A right-document/wrong-section candidate is explicitly recorded, not scored.
            case["document_only_ranks"] = [r["rank"] for r in found["results"] if r["document_id"] in record["expected_documents"] and r["section_id"] not in record["expected_sections"]]
            case["fetch_verification"] = verify_fetch(gateway, index, found, correct) if correct else None
            if not record["retrieval_metric"]:
                case["observation"] = {"candidate_modules_top_5": list(dict.fromkeys(r["module"] for r in found["results"][:5])), "note": "Not a single-answer retrieval metric. Behavior is checked separately through real mocked orchestration tests."}
        except GatewayError as exc:
            case.update({"gateway_error": exc.code, "results": [], "first_correct_rank": None, "fetch_verification": None})
        cases.append(case)
    return {"method": "Exact expected section ID AND document ID. Recall cutoffs 1/3/5, reciprocal rank truncated at the actual gateway maximum of 15. No-hit contributes zero.",
            "overall": aggregate(cases), "by_language": grouped(cases, "language"), "by_category": grouped(cases, "category"), "by_module": grouped(cases, "module"), "by_principal": grouped(cases, "principal"),
            "cases": cases, "failures_at_5": [c["id"] for c in cases if c["retrieval_metric"] and (c["first_correct_rank"] is None or c["first_correct_rank"] > 5)],
            "non_metric_cases": [c["id"] for c in cases if not c["retrieval_metric"]]}
