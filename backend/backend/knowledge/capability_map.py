"""Small audited labels + document/heading evidence, without an LLM or source crawl."""
import json
from pathlib import Path

from .markdown import digest
from .schemas import Issue, SCHEMA_VERSION

DEFAULT_CURATION = Path(__file__).with_name("capabilities.json")


def read_curation(path=None):
    raw = Path(path or DEFAULT_CURATION).read_bytes()
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(data.get("modules"), list):
        raise ValueError("Invalid capability curation schema.")
    if not all(isinstance(m, dict) for m in data["modules"]):
        raise ValueError("Capability curation modules must be objects.")
    keys = [m.get("module") for m in data["modules"]]
    if not all(isinstance(k, str) and k.strip() for k in keys) or len(set(keys)) != len(keys):
        raise ValueError("Capability curation module IDs must be unique strings.")
    for module in data["modules"]:
        if not isinstance(module.get("name"), str) or not module["name"].strip() or not isinstance(module.get("capabilities"), list):
            raise ValueError("Capability modules require a name and a capabilities list.")
        for item in module["capabilities"]:
            if not isinstance(item, dict) or any(not isinstance(item.get(key), str) or not item[key].strip() for key in ("label", "document_id", "heading", "evidence_text")):
                raise ValueError("Curated capabilities require label, document_id, heading and evidence_text strings.")
    return data, digest(raw)


def generate_capability_map(documents, sections, curation):
    issues, groups, modules = [], {}, []
    by_id = {d.document_id: d for d in documents}
    by_heading = {}
    for section in sections:
        by_heading.setdefault((section["document_id"], section["heading"]), []).append(section)
    for doc in documents:
        if doc.document_type == "operator_guide" and doc.availability in {"operator_guidance", "customer_context"} and doc.metadata["status"] == "source_verified":
            groups.setdefault(doc.metadata["module"], []).append(doc)
    curated = {m["module"]: m for m in curation["modules"]}
    for module, primary in sorted(groups.items()):
        primary.sort(key=lambda d: d.document_id)
        primary_ids = {d.document_id for d in primary}
        layer = curated.get(module)
        if layer is None:
            issues.append(Issue("warning", "capability", "curation_missing", primary[0].path, "No curated capabilities; retained document descriptions for review instead of inventing actions."))
            layer = {"name": module.replace("_", " ").title(), "capabilities": []}
        workflows = [
            d for d in documents if d.document_type == "workflow"
            and d.availability == "operator_guidance" and d.metadata["status"] == "source_verified"
            and primary_ids.intersection(d.metadata["related_docs"])
        ]
        capabilities, seen = [], set()
        for item in layer.get("capabilities", []):
            label, doc_id, heading = item.get("label"), item.get("document_id"), item.get("heading")
            candidates = by_heading.get((doc_id, heading), [])
            doc = by_id.get(doc_id)
            if not isinstance(label, str) or not label.strip() or doc_id not in primary_ids or not doc or len(candidates) != 1:
                issues.append(Issue("error", "capability", "invalid_capability_evidence", primary[0].path, "Capability requires a label and an unambiguous heading in an eligible primary module guide."))
                continue
            section = candidates[0]
            quote = item.get("evidence_text")
            if not isinstance(quote, str) or not quote.strip() or quote not in section["content"]:
                issues.append(Issue("error", "capability", "missing_capability_evidence", doc.path, "Curated capability evidence no longer matches its section; review the label before publishing."))
                continue
            if label.casefold() in seen:
                continue
            seen.add(label.casefold())
            capabilities.append({"label": label, "document_id": doc_id, "section_id": section["section_id"]})
        related = set()
        for doc in [*primary, *workflows]:
            for other_id in doc.metadata["related_docs"]:
                other = by_id.get(other_id)
                if other and other.document_type == "operator_guide" and other.metadata["module"] in groups:
                    related.add(other.metadata["module"])
        related.discard(module)
        modules.append({
            "module": module, "name": layer["name"],
            "description": primary[0].metadata["description"],
            "responsibilities": list(dict.fromkeys(d.metadata["description"] for d in primary)),
            "capabilities": capabilities,
            "workflows": [{"document_id": d.document_id, "title": d.metadata["title"]} for d in sorted(workflows, key=lambda d: d.document_id)],
            "related_modules": sorted(related), "primary_documents": sorted(primary_ids),
            "review_required": not bool(capabilities),
            "availability": "customer_context" if all(d.availability == "customer_context" for d in primary) else "operator_guidance",
            "verification": "static_documentation_only",
        })
    return {
        "schema_version": SCHEMA_VERSION,
        "scope": "Documented module responsibilities, subject to primary-guide roles, states and limitations. Not runtime certification or access control.",
        "modules": modules,
    }, issues
