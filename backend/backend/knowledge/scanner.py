"""Recursive Markdown-only scanner. Never imports Django models or reads source code."""
import os
import re
from collections import defaultdict
from pathlib import Path

import yaml

from .classification import classify
from .markdown import digest, parse_headings
from .schemas import Document, Issue, KNOWN_ROLES, SOURCE_PREFIX, ScanResult

MAX_DOCUMENT_BYTES = 8 * 1024 * 1024
REQUIRED_TEXT = ("id", "title", "module", "description", "status")
REQUIRED_LISTS = ("keywords", "roles", "related_docs", "frontend_routes", "source_references")
IGNORED_DIRS = frozenset({"node_modules", "venv", "env", "__pycache__", "staticfiles", "media", "artifacts", "tmp", "temp", "generated"})


class MetadataError(ValueError):
    pass


class UniqueSafeLoader(yaml.SafeLoader):
    def compose_node(self, parent, index):
        if self.check_event(yaml.AliasEvent):
            raise MetadataError("YAML aliases are not supported in frontmatter.")
        return super().compose_node(parent, index)

    def construct_mapping(self, node, deep=False):
        mapping = {}
        for key_node, value_node in node.value:
            key = self.construct_object(key_node, deep=deep)
            if not isinstance(key, str) or key in mapping:
                raise MetadataError("Frontmatter keys must be unique strings.")
            mapping[key] = self.construct_object(value_node, deep=deep)
        return mapping


def safe_relative(value):
    """Portable relative reference only; no drives, traversal, URLs or backslashes."""
    return (
        isinstance(value, str) and bool(value) and not value.startswith(("/", "\\"))
        and "\\" not in value and ":" not in value
        and all(part not in {".", "..", ""} for part in value.split("/"))
    )


def parse_frontmatter(text):
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise MetadataError("Missing YAML frontmatter opening delimiter.")
    closing = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if closing is None:
        raise MetadataError("Missing YAML frontmatter closing delimiter.")
    front = "".join(lines[1:closing])
    if len(front) > 128 * 1024:
        raise MetadataError("Frontmatter exceeds the supported metadata size.")
    try:
        meta = yaml.load(front, Loader=UniqueSafeLoader)
    except MetadataError:
        raise
    except yaml.YAMLError as exc:
        mark = getattr(exc, "problem_mark", None)
        detail = f" at frontmatter line {mark.line + 1}" if mark else ""
        raise MetadataError("Invalid YAML frontmatter" + detail + ".") from exc
    if not isinstance(meta, dict):
        raise MetadataError("Frontmatter must be a mapping.")
    for name in REQUIRED_TEXT:
        if not isinstance(meta.get(name), str) or not meta[name].strip():
            raise MetadataError(f"{name} must be a nonempty string.")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", meta["id"]):
        raise MetadataError("id must be an opaque identifier without path separators.")
    for name in REQUIRED_LISTS:
        if not isinstance(meta.get(name), list) or not all(isinstance(v, str) and v.strip() for v in meta[name]):
            raise MetadataError(f"{name} must be a list of nonempty strings (an empty list is allowed).")
    for name in ("document_type", "availability"):
        if name in meta and not isinstance(meta[name], str):
            raise MetadataError(f"{name} must be a string.")
    for reference in meta["source_references"]:
        if re.match(r"^[A-Za-z]:[/\\]", reference) or not safe_relative(reference.split(":", 1)[0]):
            raise MetadataError("source_references must contain repository-relative paths.")
    if any(not r.startswith("/") or r.startswith("//") or "\\" in r or "://" in r for r in meta["frontend_routes"]):
        raise MetadataError("frontend_routes must contain application paths, not hosts or filesystem paths.")
    # Unknown extension values must also be JSON serializable and cycle-free.
    import json
    try:
        json.dumps(meta, ensure_ascii=False, allow_nan=False)
    except (TypeError, ValueError, RecursionError) as exc:
        raise MetadataError("Metadata must contain JSON-compatible YAML values.") from exc
    return meta, "".join(lines[closing + 1:])


def discover_sources(root):
    """Share the exact eligibility rules between indexing and freshness checks."""
    root = Path(root).resolve()
    if not root.is_dir():
        raise ValueError("Documentation root is missing or is not a directory; configure KNOWLEDGE_DOCUMENTATION_ROOT or --source.")
    excluded = []
    candidates = []
    for directory, dirs, files in os.walk(root, followlinks=False):
        for name in sorted(dirs[:]):
            item = Path(directory) / name
            if name.startswith(".") or name in IGNORED_DIRS or item.is_symlink():
                dirs.remove(name)
                excluded.append({"path": item.relative_to(root).as_posix(), "reason": "generated, unrelated, hidden or symlink directory"})
        dirs.sort()
        for name in sorted(files):
            if Path(name).suffix.lower() != ".md":
                continue
            item = Path(directory) / name
            relative = item.relative_to(root).as_posix()
            if name.startswith((".", "~")) or re.search(r"(?:\.tmp|\.bak|\.generated)\.md$", name, re.I) or item.is_symlink():
                excluded.append({"path": relative, "reason": "temporary, generated or symlink Markdown"})
                continue
            candidates.append((relative, item))
    return sorted(candidates), excluded


def scan_documents(root):
    root = Path(root).resolve()
    candidates, excluded = discover_sources(root)
    result = ScanResult()
    result.excluded = excluded
    result.scanned = len(candidates)
    if not candidates:
        raise ValueError("No source Markdown documents found; refusing to build an empty index.")
    for relative, item in sorted(candidates):
        logical = f"{SOURCE_PREFIX}/{relative}"
        try:
            if not item.resolve().is_relative_to(root) or item.is_symlink():
                raise MetadataError("Source path escaped the configured documentation root.")
            if item.stat().st_size > MAX_DOCUMENT_BYTES:
                raise MetadataError("Document exceeds the supported file size; review it before indexing.")
            raw = item.read_bytes()
            result.source_hashes[logical] = digest(raw)
            text = raw.decode("utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
            meta, body = parse_frontmatter(text)
            kind, availability = classify(relative, meta)
            headings = parse_headings(body)
            result.documents.append(Document(meta, logical, body, digest(raw), digest(body), headings, kind, availability))
            if meta["status"] not in {"source_verified", "needs_verification", "automated_test_verified", "runtime_verified"}:
                result.issues.append(Issue("warning", "metadata", "unknown_status", logical, "Verification status is not a known classification; preserved verbatim."))
            if not meta["roles"]:
                role_state = "role_metadata_unspecified"
            elif any(r not in KNOWN_ROLES for r in meta["roles"]):
                role_state = "generic_or_unknown_roles"
            else:
                role_state = None
            if role_state:
                result.issues.append(Issue("warning", "metadata", role_state, logical, "Role metadata is descriptive/unspecified, not authorization; consult the documented access rules."))
            if meta["status"] == "needs_verification" or availability in {"unmounted", "inactive", "needs_verification"}:
                result.issues.append(Issue("warning", "availability", "manual_or_source_only", logical, "Not certified for current operator instructions; availability and verification must be respected."))
        except (MetadataError, UnicodeError, OSError, ValueError, RecursionError) as exc:
            message = str(exc) if isinstance(exc, (MetadataError, ValueError)) else "Document could not be read as UTF-8 Markdown."
            result.issues.append(Issue("error", "metadata", "invalid_document", logical, message))
            result.excluded.append({"path": relative, "reason": "invalid document; see diagnostics"})
    registry = defaultdict(list)
    for document in result.documents:
        registry[document.document_id].append(document)
    duplicates = {key for key, docs in registry.items() if len(docs) > 1}
    for key in sorted(duplicates):
        for document in registry[key]:
            result.issues.append(Issue("error", "metadata", "duplicate_id", document.path, f"Duplicate document ID {key}; all ambiguous copies excluded."))
            result.excluded.append({"path": document.path.removeprefix(SOURCE_PREFIX + "/"), "reason": "duplicate document ID"})
    result.documents = sorted((d for d in result.documents if d.document_id not in duplicates), key=lambda d: d.path)
    return result
