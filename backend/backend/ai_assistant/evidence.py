"""Bounded complete-section evidence and revalidation of server-stored citations."""
import re

from knowledge.access import can_read_document
from knowledge.markdown import digest

from .errors import AssistantError


def reference_for(section, document, version):
    return {"document_id": document["document_id"], "section_id": section["section_id"], "document_title": document["title"],
            "heading": section["heading"], "verification_status": document["status"], "index_version": version, "content_hash": section["content_hash"]}


def revalidate_reference(reference, index, principal):
    if not isinstance(reference, dict) or reference.get("index_version") != index.version:
        return None
    did, sid = reference.get("document_id"), reference.get("section_id")
    if not isinstance(did, str) or not isinstance(sid, str):
        return None
    doc, section = index.get_document(did), index.get_section(sid)
    if not doc or not section or section["document_id"] != did or reference.get("content_hash") != section["content_hash"] or not can_read_document(principal, doc):
        return None
    return section, reference_for(section, doc, index.version)


class Evidence:
    def __init__(self, limits):
        self.limits = limits
        self.records = {}
        self.received_characters = 0

    def add(self, section, reference=None):
        key = section["document_id"], section["section_id"]
        if key not in self.records and len(self.records) >= self.limits.fetched_sections:
            raise AssistantError("evidence_limit", "Too many documentation sections were requested. Please ask a narrower question.", 422)
        content = section["content"]
        if self.received_characters + len(content) > self.limits.evidence_characters:
            raise AssistantError("evidence_limit", "The retrieved documentation is too large for one answer. Please ask a narrower question.", 422)
        self.received_characters += len(content)
        span = section.get("content_range", {"start": 0, "end": len(content), "total": len(content)})
        record = self.records.setdefault(key, {"reference": reference, "parts": {}, "total": span["total"], "content_hash": section["content_hash"], "content": None})
        if record["total"] != span["total"] or record["content_hash"] != section["content_hash"] or span["end"] - span["start"] != len(content):
            raise AssistantError("evidence_inconsistent", "Documentation changed while being retrieved. Please try again.", 409)
        record["parts"][span["start"]] = content
        assembled = ""
        for start, text in sorted(record["parts"].items()):
            if start > len(assembled):
                break
            overlap = len(assembled) - start
            if text[:overlap] != assembled[start:start + min(len(text), overlap)]:
                raise AssistantError("evidence_inconsistent", "Documentation pages could not be verified.", 409)
            assembled += text[overlap:]
        if len(assembled) == record["total"] and digest(assembled) == record["content_hash"]:
            record["content"] = assembled

    def complete(self, key):
        record = self.records.get(key)
        return bool(record and record["content"] and re.sub(r"^#{1,6}\s.*$", "", record["content"], flags=re.MULTILINE).strip())

    def selected_references(self, citations):
        if not isinstance(citations, list) or not citations or len(citations) > self.limits.fetched_sections:
            raise AssistantError("evidence_required", "The answer needs verified documentation references.", 422)
        selected, seen = [], set()
        for citation in citations:
            if not isinstance(citation, dict) or set(citation) != {"document_id", "section_id"} or not all(isinstance(v, str) for v in citation.values()):
                raise AssistantError("sources_invalid", "The answer contained an invalid documentation reference.", 502)
            key = citation["document_id"], citation["section_id"]
            if not self.complete(key) or not self.records[key]["reference"]:
                raise AssistantError("evidence_required", "The answer needs complete, relevant fetched documentation.", 422)
            if key not in seen:
                selected.append(self.records[key]["reference"])
                seen.add(key)
        return selected
