"""Pure build pipeline. Diagnostics are returned even when publication is refused."""
from collections import Counter

from .capability_map import generate_capability_map, read_curation
from .classification import is_operator_guidance
from .markdown import extract_sections
from .scanner import scan_documents
from .references import validate_markdown_links
from .schemas import BuildResult, Issue, KNOWN_ROLES

LARGE_SECTION_CHARACTERS = 32_000


def build_index(source_root, *, curation_path=None, large_section_characters=LARGE_SECTION_CHARACTERS):
    scan = scan_documents(source_root)
    curation, configuration_hash = read_curation(curation_path)
    issues = list(scan.issues)
    documents, sections, ids = [], [], {d.document_id for d in scan.documents}
    for doc in scan.documents:
        parts = extract_sections(doc)
        role_state = "literal" if doc.metadata["roles"] and all(r in KNOWN_ROLES for r in doc.metadata["roles"]) else ("unspecified" if not doc.metadata["roles"] else "generic_or_unknown")
        documents.append({
            "document_id": doc.document_id,
            **{key: doc.metadata[key] for key in ("title", "module", "description", "keywords", "roles", "related_docs", "frontend_routes", "source_references", "status")},
            "document_type": doc.document_type, "availability": doc.availability,
            "role_metadata_state": role_state,
            "operator_guidance": is_operator_guidance(doc.document_type, doc.availability, doc.metadata["status"]),
            "metadata": doc.metadata, "path": doc.path, "source_hash": doc.source_hash,
            "content_hash": doc.content_hash, "section_ids": [s["section_id"] for s in parts],
        })
        for reference in doc.metadata["related_docs"]:
            if reference not in ids:
                issues.append(Issue("error", "reference", "unresolved_related_document", doc.path, f"Unknown related document ID: {reference}."))
        for section in parts:
            if len(section["content"]) > large_section_characters:
                issues.append(Issue("warning", "section", "large_section", doc.path, f"Section at position {section['position']} exceeds {large_section_characters} characters; preserved intact for review."))
        sections.extend(parts)
    section_counts = Counter(s["section_id"] for s in sections)
    if any(n > 1 for n in section_counts.values()):
        issues.append(Issue("error", "section", "duplicate_section_id", "", "Section identity collision; publication must be refused."))
    issues.extend(validate_markdown_links(scan.documents, sections))
    capability_map, capability_issues = generate_capability_map(scan.documents, sections, curation)
    issues.extend(capability_issues)
    issues.sort(key=lambda i: (i.severity, i.category, i.path, i.code, i.message))
    return BuildResult(documents, sections, capability_map, issues, sorted(scan.excluded, key=lambda x: (x["path"], x["reason"])), scan.scanned, dict(sorted(scan.source_hashes.items())), configuration_hash)
