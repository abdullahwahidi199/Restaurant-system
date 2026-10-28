import tempfile
import unittest
from pathlib import Path

from knowledge.indexer import build_index
from knowledge.loader import load_index
from knowledge.scanner import scan_documents
from knowledge.schemas import DOCUMENT_TYPES
from knowledge.storage import make_manifest, publish_index, serialize_artifacts


class RepositoryIntegrationTests(unittest.TestCase):
    def test_all_repository_documents_and_categories_roundtrip_without_external_services(self):
        source = Path(__file__).resolve().parents[4] / "docs/ai_knowledge/03_operator_guides"
        if not source.is_dir():
            self.skipTest("Repository documentation is not included in this deployment.")
        scan = scan_documents(source)
        result = build_index(source)
        self.assertFalse(result.errors, [i.to_dict() for i in result.errors])
        self.assertEqual(len(result.documents), scan.scanned)
        self.assertEqual({d["document_type"] for d in result.documents}, DOCUMENT_TYPES)
        self.assertEqual(len(result.sections), sum(len(d["section_ids"]) for d in result.documents))
        primary = next(d for d in result.documents if d["document_id"] == "operator_modules_contractors_services")
        self.assertTrue(primary["operator_guidance"])
        for doc in result.documents:
            if doc["document_type"] in {"quality_assurance", "backend_reference", "interface_reference", "index"}:
                self.assertFalse(doc["operator_guidance"])
            self.assertTrue(doc["path"].startswith("03_operator_guides/"))
        with tempfile.TemporaryDirectory() as output:
            manifest = publish_index(result, output)
            index = load_index(output)
            section = index.get_section(primary["section_ids"][0])
            self.assertEqual(section["document_id"], primary["document_id"])
            for original in scan.documents:
                record = index.get_document(original.document_id)
                self.assertEqual(record["roles"], original.metadata["roles"])
                self.assertEqual("".join(index.get_section(sid)["content"] for sid in record["section_ids"]), original.markdown)
            self.assertIn("contractors", index.list_modules())
            self.assertEqual(len(index.list_modules()), len(set(index.list_modules())))
            rebuilt = build_index(source)
            self.assertEqual(serialize_artifacts(result), serialize_artifacts(rebuilt))
            self.assertEqual(manifest, make_manifest(rebuilt, serialize_artifacts(rebuilt)))
