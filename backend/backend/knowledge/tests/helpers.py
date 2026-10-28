import json
import tempfile
import unittest
from pathlib import Path

import yaml

from knowledge.indexer import build_index


def metadata(document_id="guide", **overrides):
    return {
        "id": document_id, "title": "Service workspace", "module": "contractors",
        "description": "Manage external services and contractor obligations.",
        "keywords": ["contractor"], "roles": ["Admin"], "related_docs": [],
        "frontend_routes": ["/contractors"], "source_references": ["frontend/src/Page.jsx:Page"],
        "status": "source_verified", **overrides,
    }


class WorkspaceTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.workspace = Path(self.temporary.name)
        self.source = self.workspace / "03_operator_guides"
        self.source.mkdir()
        self.output = self.workspace / ".generated"
        self.curation = self.workspace / "capabilities.json"
        self.curation.write_text(json.dumps({"version": 1, "modules": []}), encoding="utf-8")

    def write(self, path="modules/contractors/services.md", body="# Services\n\nUse **Create**.\n", **overrides):
        target = self.source / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("---\n" + yaml.safe_dump(metadata(**overrides), allow_unicode=True, sort_keys=False) + "---\n" + body, encoding="utf-8", newline="\n")
        return target

    def build(self, **kwargs):
        return build_index(self.source, curation_path=self.curation, **kwargs)

    def curate(self, **overrides):
        item = {"label": "Create contractor", "document_id": "guide", "heading": "Services", "evidence_text": "Use **Create**.", **overrides}
        self.curation.write_text(json.dumps({"version": 1, "modules": [{"module": "contractors", "name": "Contractors and Services", "capabilities": [item]}]}), encoding="utf-8")
