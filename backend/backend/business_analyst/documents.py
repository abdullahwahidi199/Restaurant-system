"""Allowlisted direct access to the verified Admin pack; no Mentor index/search."""
import copy
import hashlib
import json
import re
from pathlib import Path

import yaml
from django.conf import settings
from ai_assistant.errors import AssistantError

from .errors import OperationError
from .registry import TOOL_ID

ID_PATTERN = re.compile(r"[a-z][a-z0-9_]{0,95}\Z")
ADMIN_ONLY = frozenset({"admin_administration_branches", "admin_administration_branch_migration"})


def can_read(principal, document_id):
    # Admin visibility remains independent of empty frontmatter roles.
    if principal.role == "Admin" or (principal.role == "BranchAdmin" and document_id not in ADMIN_ONLY):
        return True
    from .tools import can_read_business_document
    return can_read_business_document(principal, document_id)


class DocumentRepository:
    def __init__(self, root=None):
        self.root = Path(root or settings.BUSINESS_ANALYST_KNOWLEDGE_ROOT).resolve()
        try:
            path = self.root / "business_ai_capability_map.json"
            with path.open("rb") as stream:
                raw = stream.read(256001)
            if len(raw) > 256000:
                raise ValueError
            self.map = json.loads(raw)
            if (not isinstance(self.map, dict) or set(self.map) != {"schema_version", "id", "domains"}
                    or type(self.map["schema_version"]) is not int or self.map["schema_version"] != 1
                    or not isinstance(self.map["id"], str) or not ID_PATTERN.fullmatch(self.map["id"])
                    or not isinstance(self.map["domains"], list)):
                raise ValueError
            self.catalog = {}
            self.domain_ids = set()
            tool_ids = set()
            for domain in self.map["domains"]:
                if (not isinstance(domain, dict) or set(domain) != {"id", "description", "documents", "tools"}
                        or not isinstance(domain["id"], str) or not ID_PATTERN.fullmatch(domain["id"])
                        or domain["id"] in self.domain_ids or not isinstance(domain["description"], str)
                        or not domain["description"].strip() or not isinstance(domain["documents"], list)
                        or not isinstance(domain["tools"], list)):
                    raise ValueError
                self.domain_ids.add(domain["id"])
                for item in domain["documents"]:
                    if (not isinstance(item, dict) or set(item) != {"id", "title", "description"}
                            or any(not isinstance(item[key], str) or not item[key].strip() for key in item)):
                        raise ValueError
                    identity = item["id"]
                    if not ID_PATTERN.fullmatch(identity) or identity in self.catalog:
                        raise ValueError
                    self.catalog[identity] = copy.deepcopy(item)
                for tool in domain["tools"]:
                    if (not isinstance(tool, dict) or not isinstance(tool.get("id"), str)
                            or not TOOL_ID.fullmatch(tool["id"]) or tool["id"] in tool_ids):
                        raise ValueError
                    tool_ids.add(tool["id"])
        except (OSError, ValueError, TypeError, KeyError, RecursionError):
            raise AssistantError("knowledge_unavailable", "The Admin knowledge catalog is unavailable.") from None

    def _path(self, document_id):
        # Stable IDs define filenames; the AI-facing catalog contains no paths.
        if not isinstance(document_id, str) or not ID_PATTERN.fullmatch(document_id):
            raise ValueError
        candidate = self.root / "docs" / (document_id + ".md")
        resolved = candidate.resolve()
        docs = (self.root / "docs").resolve()
        if (not resolved.is_relative_to(docs) or resolved.suffix != ".md"
                or not docs.is_relative_to(self.root)):
            raise ValueError
        return resolved

    def fetch(self, document_id, principal, *, max_bytes=32000):
        if not isinstance(document_id, str) or document_id not in self.catalog:
            raise OperationError("INVALID_DOCUMENT_ID")
        if not can_read(principal, document_id):
            raise OperationError("PERMISSION_DENIED")
        item = self.catalog[document_id]
        try:
            path = self._path(document_id)
            with path.open("rb") as stream:
                raw = stream.read(max_bytes + 1)
            if len(raw) > max_bytes:
                raise OperationError("OUTPUT_TOO_LARGE")
            content = raw.decode("utf-8")  # Preserve exact text, including CRLF/frontmatter.
            parts = re.split(r"\r?\n---\r?\n", content, maxsplit=1)
            if not content.startswith("---") or len(parts) != 2:
                raise ValueError
            metadata = yaml.safe_load(parts[0][3:])
            if (metadata["id"] != document_id or metadata["namespace"] != "admin"
                    or metadata["status"] != "current_observed_behavior"
                    or not isinstance(metadata["source_refs"], list)):
                raise ValueError
            return {"document_id": document_id, "title": item["title"], "content": content,
                    "provenance": {"path": f"docs/{document_id}.md", "sha256": hashlib.sha256(raw).hexdigest(),
                                   "source_refs": metadata["source_refs"], "status": metadata["status"],
                                   "authority": "ADMIN_BUSINESS_KNOWLEDGE.md"}}
        except OperationError:
            raise
        except (OSError, UnicodeError, ValueError, KeyError, TypeError, yaml.YAMLError):
            raise OperationError("DOCUMENT_UNAVAILABLE") from None

    def capability_map(self, principal, registry):
        visible = {identity for identity in self.catalog if can_read(principal, identity)}
        domains = []
        for domain in self.map["domains"]:
            docs = [{key: item[key] for key in ("id", "title", "description")}
                    for item in domain["documents"] if item["id"] in visible]
            declared = {tool["id"]: tool for tool in domain["tools"]}
            # Preserve declared selection metadata, but only registered handlers
            # are callable and their canonical invocation contracts always win.
            tools = [{**copy.deepcopy(declared.get(tool["id"], {})), **tool}
                     for tool in registry.capabilities(domain["id"])]
            if docs or tools:
                domains.append({"id": domain["id"], "description": domain["description"], "documents": docs, "tools": tools})
        return {"schema_version": self.map["schema_version"], "id": self.map["id"], "domains": domains}
