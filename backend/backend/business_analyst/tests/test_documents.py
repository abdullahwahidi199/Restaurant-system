import copy
import hashlib
import json
import shutil
import tempfile
from pathlib import Path

from django.test import SimpleTestCase
from ai_assistant.errors import AssistantError
from knowledge.access import Principal

from business_analyst.documents import DocumentRepository
from business_analyst.errors import OperationError
from business_analyst.registry import production_registry
from .helpers import ADMIN_DOC, DOC


class DocumentTests(SimpleTestCase):
    def setUp(self):
        self.documents = DocumentRepository()
        self.admin = Principal("1", restaurant_id="1", branch_id="2", role="Admin")

    def test_all_actual_admin_documents_are_retrievable_with_exact_content_and_provenance(self):
        self.assertEqual(len(self.documents.catalog), 78)
        for identity, item in self.documents.catalog.items():
            with self.subTest(document=identity):
                result = self.documents.fetch(identity, self.admin)
                raw = (self.documents.root / "docs" / f"{identity}.md").read_bytes()
                self.assertEqual(result["content"].encode("utf-8"), raw)
                self.assertEqual(result["document_id"], identity)
                self.assertEqual(result["provenance"]["sha256"], hashlib.sha256(raw).hexdigest())
                self.assertTrue(result["provenance"]["source_refs"])

    def test_unknown_and_arbitrary_paths_cannot_be_retrieved(self):
        for identity in ("unknown", "../../backend/.env", "C:\\Windows\\win.ini", [DOC], None):
            with self.subTest(identity=identity), self.assertRaises(OperationError) as caught:
                self.documents.fetch(identity, self.admin)
            self.assertEqual(caught.exception.code, "INVALID_DOCUMENT_ID")

    def test_backend_visibility_does_not_use_empty_frontmatter_roles(self):
        for role, identity in (("Waiter", DOC), ("FinanceManager", DOC), ("BranchAdmin", ADMIN_DOC)):
            with self.assertRaises(OperationError) as caught:
                self.documents.fetch(identity, Principal("1", role=role))
            self.assertEqual(caught.exception.code, "PERMISSION_DENIED")
        self.assertEqual(self.documents.fetch(DOC, Principal("1", role="BranchAdmin"))["document_id"], DOC)

    def test_oversized_document_is_not_truncated_or_reported_as_missing(self):
        with self.assertRaises(OperationError) as caught:
            self.documents.fetch(DOC, self.admin, max_bytes=10)
        self.assertEqual(caught.exception.code, "OUTPUT_TOO_LARGE")

    def test_missing_or_identity_changed_document_returns_safe_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(self.documents.root, root, dirs_exist_ok=True)
            repository = DocumentRepository(root)
            path = root / "docs" / f"{DOC}.md"
            path.write_text(path.read_text(encoding="utf-8").replace("id: " + DOC, "id: forged"), encoding="utf-8")
            for missing in (False, True):
                if missing:
                    path.unlink()
                with self.assertRaises(OperationError) as caught:
                    repository.fetch(DOC, self.admin)
                self.assertEqual(caught.exception.code, "DOCUMENT_UNAVAILABLE")
                self.assertNotIn(str(root), str(caught.exception))

    def test_catalog_rejects_path_traversal_absolute_paths_and_duplicate_ids(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for path in ("../secrets.md", "docs/../../secrets.md", "C:/secrets.md", "docs\\secrets.md"):
                catalog = copy.deepcopy(self.documents.map)
                catalog["domains"][0]["documents"][0]["path"] = path
                (root / "business_ai_capability_map.json").write_text(json.dumps(catalog), encoding="utf-8")
                with self.assertRaises(AssistantError):
                    DocumentRepository(root)
            catalog = copy.deepcopy(self.documents.map)
            catalog["domains"][0]["documents"].append(catalog["domains"][0]["documents"][0])
            (root / "business_ai_capability_map.json").write_text(json.dumps(catalog), encoding="utf-8")
            with self.assertRaises(AssistantError):
                DocumentRepository(root)

    def test_runtime_map_filters_documents_and_never_advertises_unimplemented_tools(self):
        registry = production_registry(self.documents)
        capability_map = self.documents.capability_map(Principal("1", role="BranchAdmin"), registry)
        ids = [doc["id"] for domain in capability_map["domains"] for doc in domain["documents"]]
        self.assertNotIn(ADMIN_DOC, ids)
        self.assertIn(DOC, ids)
        self.assertEqual(len(next(domain["tools"] for domain in capability_map["domains"] if domain["id"] == "contractors")), 13)
        self.assertTrue(all(not domain["tools"] for domain in capability_map["domains"] if domain["id"] not in {"contractors", "finance"}))
        self.assertEqual(len(next(domain["tools"] for domain in capability_map["domains"] if domain["id"] == "finance")), 5)
        self.assertNotIn("tool_hints", json.dumps(capability_map))
        with self.assertRaises(ValueError):
            registry.register(None)

    def test_complete_compact_map_matches_every_document_and_contains_only_selection_fields(self):
        runtime = self.documents.capability_map(self.admin, production_registry(self.documents))
        self.assertEqual(runtime, self.documents.map)
        self.assertEqual(set(runtime), {"schema_version", "id", "domains"})
        identities = []
        for domain in runtime["domains"]:
            self.assertEqual(set(domain), {"id", "description", "documents", "tools"})
            for item in domain["documents"]:
                identities.append(item["id"])
                self.assertEqual(set(item), {"id", "title", "description"})
                self.assertTrue(5 <= len(item["description"].split()) <= 15)
        self.assertEqual(len(identities), 78)
        self.assertEqual(set(identities), {path.stem for path in (self.documents.root / "docs").glob("*.md")})
