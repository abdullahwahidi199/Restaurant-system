"""Load a committed generation and resolve opaque IDs entirely in memory."""
import copy
import json
import re
from pathlib import Path

from .markdown import digest
from .scanner import safe_relative
from .schemas import SCHEMA_VERSION


class IndexError(ValueError):
    """A missing, incomplete, unsupported or inconsistent knowledge index."""


def validate_records(documents, sections, capability_map, *, complete=True):
    doc_ids = [d["document_id"] for d in documents]
    section_ids = [s["section_id"] for s in sections]
    if len(set(doc_ids)) != len(doc_ids) or len(set(section_ids)) != len(section_ids):
        raise IndexError("Duplicate document or section IDs in index.")
    docs = {d["document_id"]: d for d in documents}
    parts = {s["section_id"]: s for s in sections}
    owned = set()
    for doc in documents:
        if not safe_relative(doc["path"]) or not doc["path"].startswith("03_operator_guides/"):
            raise IndexError("Unsafe logical document path in index.")
        if len(set(doc["section_ids"])) != len(doc["section_ids"]):
            raise IndexError("Repeated section ID in document registry.")
        cursor = 0
        contents = []
        for position, sid in enumerate(doc["section_ids"]):
            section = parts.get(sid)
            if section is None or section["document_id"] != doc["document_id"] or sid in owned:
                raise IndexError("Invalid section ownership in index.")
            owned.add(sid)
            if section["position"] != position or section["start_offset"] != cursor:
                raise IndexError("Section order or non-overlapping offsets are invalid.")
            if section["end_offset"] - cursor != len(section["content"]):
                raise IndexError("Section length is inconsistent with offsets.")
            if digest(section["content"]) != section["content_hash"]:
                raise IndexError("Section content checksum mismatch.")
            if section["parent_section_id"]:
                parent = parts.get(section["parent_section_id"])
                if not parent or parent["document_id"] != doc["document_id"] or parent["position"] >= position:
                    raise IndexError("Invalid heading parent relationship.")
            for key in ("module", "path", "document_type", "availability", "status", "roles", "keywords", "frontend_routes"):
                if section[key] != doc[key]:
                    raise IndexError("Section inherited metadata does not match its document.")
            contents.append(section["content"])
            cursor = section["end_offset"]
        if not contents or digest("".join(contents)) != doc["content_hash"]:
            raise IndexError("Document sections do not reconstruct its Markdown content.")
        if complete and any(other not in docs for other in doc["related_docs"]):
            raise IndexError("Unresolved related document in complete index.")
    if owned != set(parts):
        raise IndexError("Orphan sections in index.")
    modules = capability_map["modules"]
    if len({m["module"] for m in modules}) != len(modules):
        raise IndexError("Duplicate module in capability map.")
    module_ids = {m["module"] for m in modules}
    for module in modules:
        for did in module["primary_documents"]:
            doc = docs.get(did)
            if not doc or doc["document_type"] != "operator_guide" or doc["module"] != module["module"] or doc["availability"] not in {"operator_guidance", "customer_context"}:
                raise IndexError("Capability primary document is not eligible module guidance.")
        if any(m not in module_ids for m in module["related_modules"]):
            raise IndexError("Unknown related capability module.")
        for workflow in module["workflows"]:
            doc = docs.get(workflow["document_id"])
            if not doc or doc["document_type"] != "workflow":
                raise IndexError("Capability workflow reference does not resolve.")
        for capability in module["capabilities"]:
            section = parts.get(capability["section_id"])
            if not section or section["document_id"] != capability["document_id"] or capability["document_id"] not in module["primary_documents"]:
                raise IndexError("Capability section reference does not resolve to its primary guide.")


class KnowledgeIndex:
    def __init__(self, manifest, documents, sections, capability_map):
        validate_records(documents, sections, capability_map, complete=manifest["complete"])
        self._manifest = manifest
        self._documents = {d["document_id"]: d for d in documents}
        self._sections = {s["section_id"]: s for s in sections}
        self._capabilities = capability_map

    @property
    def manifest(self):
        return copy.deepcopy(self._manifest)

    def list_modules(self):
        return [m["module"] for m in self._capabilities["modules"]]

    def get_capability_map(self):
        return copy.deepcopy(self._capabilities)

    def documents_for_module(self, module, *, include_supporting=False):
        return [copy.deepcopy(d) for d in self._documents.values() if d["module"] == module and (include_supporting or d["operator_guidance"])]

    def get_document(self, document_id):
        # ID strings never enter a path expression or trigger a filesystem read.
        return copy.deepcopy(self._documents.get(document_id))

    def get_section(self, section_id):
        return copy.deepcopy(self._sections.get(section_id))


def load_index(output_root, *, require_complete=True):
    root = Path(output_root).resolve()
    try:
        manifest_path = root / "manifest.json"
        if manifest_path.is_symlink():
            raise IndexError("Manifest must not be a symlink.")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest["schema_version"] != SCHEMA_VERSION:
            raise IndexError("Unsupported knowledge index schema version.")
        if not isinstance(manifest["complete"], bool) or (require_complete and not manifest["complete"]):
            raise IndexError("Knowledge index is incomplete; review its build diagnostics.")
        generation = manifest["generation"]
        if not re.fullmatch(r"generations/[a-f0-9]{64}", generation) or generation.split("/")[-1] != manifest["build_hash"]:
            raise IndexError("Invalid generation reference in manifest.")
        if set(manifest["artifacts"]) != {"documents.json", "sections.jsonl", "capability_map.json"}:
            raise IndexError("Unexpected artifact set in manifest.")
        blobs = {}
        for name, info in manifest["artifacts"].items():
            logical = f"{generation}/{name}"
            if info["path"] != logical:
                raise IndexError("Artifact path does not belong to the committed generation.")
            target = root / logical
            if target.is_symlink() or not target.resolve().is_relative_to(root):
                raise IndexError("Artifact escaped the index storage root.")
            raw = target.read_bytes()
            if len(raw) != info["bytes"] or digest(raw) != info["sha256"]:
                raise IndexError("Artifact checksum mismatch; rebuild the index.")
            blobs[name] = raw.decode("utf-8")
        catalog = json.loads(blobs["documents.json"])
        capabilities = json.loads(blobs["capability_map.json"])
        if catalog["schema_version"] != SCHEMA_VERSION or capabilities["schema_version"] != SCHEMA_VERSION:
            raise IndexError("Artifact schema version mismatch.")
        documents = catalog["documents"]
        sections = [json.loads(line) for line in blobs["sections.jsonl"].splitlines()]
        if len(documents) != manifest["summary"]["documents_indexed"] or len(sections) != manifest["summary"]["sections_indexed"] or len(capabilities["modules"]) != manifest["summary"]["capability_modules"]:
            raise IndexError("Manifest counts do not match its artifacts.")
        return KnowledgeIndex(manifest, documents, sections, capabilities)
    except IndexError:
        raise
    except (OSError, UnicodeError, ValueError, KeyError, TypeError) as exc:
        raise IndexError("Knowledge index is missing or malformed; run build_knowledge_index.") from exc
