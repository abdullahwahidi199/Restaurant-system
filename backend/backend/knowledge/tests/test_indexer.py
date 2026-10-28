import json

from knowledge.capability_map import read_curation
from knowledge.loader import validate_records
from knowledge.storage import make_manifest, serialize_artifacts
from knowledge.tests.helpers import WorkspaceTest


class BuilderTests(WorkspaceTest):
    def test_counts_ownership_relative_paths_and_byte_determinism(self):
        self.write(body="# Services\n\n## Pay\nRecord the payment.\n", related_docs=["workflow"])
        self.write("workflows/services.md", document_id="workflow", related_docs=["guide"])
        first, second = self.build(), self.build()
        self.assertFalse(first.errors)
        self.assertEqual(len(first.documents), 2)
        self.assertEqual(len(first.sections), 3)
        self.assertEqual(serialize_artifacts(first), serialize_artifacts(second))
        self.assertEqual(make_manifest(first, serialize_artifacts(first)), make_manifest(second, serialize_artifacts(second)))
        validate_records(first.documents, first.sections, first.capability_map)
        for document in first.documents:
            self.assertTrue(document["path"].startswith("03_operator_guides/"))
            self.assertNotIn(str(self.workspace), json.dumps(document))
            self.assertNotIn("content", document)
            self.assertNotIn("markdown", document)
            self.assertEqual(len(document["section_ids"]), sum(s["document_id"] == document["document_id"] for s in first.sections))

    def test_malformed_document_does_not_hide_valid_records_and_sources_change_hash(self):
        path = self.write()
        (self.source / "invalid.md").write_text("No metadata", encoding="utf-8")
        result = self.build()
        self.assertEqual(len(result.documents), 1)
        self.assertEqual(result.summary()["metadata_errors"], 1)
        self.assertEqual(result.summary()["excluded"], 1)
        path.write_text(path.read_text(encoding="utf-8") + "\nNew instruction.\n", encoding="utf-8")
        self.assertNotEqual(result.source_hashes, self.build().source_hashes)

    def test_related_docs_markdown_targets_and_anchors_are_validated(self):
        self.write(body="# Services\n\n[Step](#create)\n\n## Create\nUse Create.\n", related_docs=["missing"])
        result = self.build()
        self.assertEqual(result.summary()["unresolved_references"], 1)
        self.assertEqual(result.errors[0].code, "unresolved_related_document")
        self.write(body="# Services\n\n[Missing](#unknown)\n[Outside](../../outside.md)\n[Web](https://example.invalid/)\n`[Code](no-file.md)`\n")
        result = self.build()
        self.assertEqual({i.code for i in result.errors}, {"unresolved_markdown_anchor", "unresolved_markdown_document"})
        self.write(body='# Services\n\n<a id="exact"></a>\n[Here](#exact)\n[Other](../../forms/service.md#details)\n')
        self.write("forms/service.md", document_id="form", body="# Details\nFields.\n")
        self.assertFalse(self.build().errors)

    def test_large_section_reported_not_split_and_output_directory_not_scanned(self):
        body = "# Large\n" + "Text. " * 100
        self.write(body=body)
        self.write(".generated/snapshot.md", document_id="generated")
        result = self.build(large_section_characters=50)
        self.assertEqual(result.scanned, 1)
        self.assertEqual(len(result.sections), 1)
        self.assertEqual(result.sections[0]["content"], body)
        self.assertIn("large_section", [i.code for i in result.issues])

    def test_document_classification_and_raw_metadata_preserved(self):
        paths = {
            "index.md": ("index", "operator_guidance"),
            "coverage_matrix.md": ("quality_assurance", "qa_only"),
            "reference/backend/service.md": ("backend_reference", "reference_only"),
            "reference/interface/mounted.md": ("interface_reference", "mounted_context"),
            "forms/service.md": ("form_reference", "operator_guidance"),
            "role_guides/admin.md": ("role_guide", "operator_guidance"),
            "navigation/menu.md": ("navigation", "operator_guidance"),
            "troubleshooting/errors.md": ("troubleshooting", "operator_guidance"),
            "workflows/service.md": ("workflow", "operator_guidance"),
            "modules/contractors/service.md": ("operator_guide", "operator_guidance"),
        }
        for i, path in enumerate(paths):
            self.write(path, document_id=f"doc{i}")
        self.write("reference/interface/inactive.md", document_id="inactive", availability="unmounted", roles=[])
        self.write("forms/legacy.md", document_id="legacy", document_type="form", roles=["See access section"])
        result = self.build()
        self.assertFalse(result.errors)
        by_path = {d["path"].removeprefix("03_operator_guides/"): d for d in result.documents}
        for path, classification in paths.items():
            self.assertEqual((by_path[path]["document_type"], by_path[path]["availability"]), classification)
        self.assertFalse(by_path["index.md"]["operator_guidance"])
        self.assertFalse(by_path["reference/interface/mounted.md"]["operator_guidance"])
        self.assertFalse(by_path["reference/interface/inactive.md"]["operator_guidance"])
        self.assertEqual(by_path["forms/legacy.md"]["metadata"]["document_type"], "form")
        self.assertEqual(by_path["forms/legacy.md"]["roles"], ["See access section"])


class CapabilityTests(WorkspaceTest):
    def test_evidence_bound_capabilities_and_workflow_relationships(self):
        self.write(related_docs=["purchase"])
        self.write("modules/procurement/purchases.md", document_id="purchase", module="procurement", title="Supplier invoices")
        self.write("workflows/services.md", document_id="workflow", related_docs=["guide", "purchase"])
        self.curate()
        result = self.build()
        self.assertFalse(result.errors)
        modules = result.capability_map["modules"]
        self.assertEqual([m["module"] for m in modules], ["contractors", "procurement"])
        contractors = modules[0]
        self.assertEqual(contractors["capabilities"][0]["label"], "Create contractor")
        self.assertEqual(contractors["capabilities"][0]["document_id"], "guide")
        self.assertIn(contractors["capabilities"][0]["section_id"], [s["section_id"] for s in result.sections])
        self.assertEqual(contractors["workflows"][0]["document_id"], "workflow")
        self.assertEqual(contractors["related_modules"], ["procurement"])
        self.assertTrue(modules[1]["review_required"])
        self.assertEqual(modules[1]["capabilities"], [])

    def test_unavailable_technical_qa_and_unverified_guides_do_not_become_capabilities(self):
        self.write()
        self.curate()
        for i, (path, kwargs) in enumerate([
            ("modules/inactive/guide.md", {"availability": "inactive"}),
            ("modules/unmounted/guide.md", {"availability": "unmounted"}),
            ("modules/unverified/guide.md", {"status": "needs_verification"}),
            ("reference/interface/Widget.jsx.md", {}),
            ("reference/backend/ServiceView.md", {}),
            ("coverage_matrix.md", {}),
        ]):
            self.write(path, document_id=f"ref{i}", module=f"technical{i}", **kwargs)
        result = self.build()
        self.assertEqual(len(result.documents), 7)
        self.assertEqual(len(result.capability_map["modules"]), 1)
        self.assertEqual(len(result.capability_map["modules"][0]["capabilities"]), 1)

    def test_stale_or_ambiguous_evidence_is_error_not_invented_capability(self):
        self.write()
        for overrides, expected in [({"evidence_text": "Nonexistent instruction"}, "missing_capability_evidence"), ({"heading": "No such heading"}, "invalid_capability_evidence"), ({"document_id": "not_primary"}, "invalid_capability_evidence")]:
            with self.subTest(overrides=overrides):
                self.curate(**overrides)
                result = self.build()
                self.assertIn(expected, [i.code for i in result.errors])
                self.assertEqual(result.capability_map["modules"][0]["capabilities"], [])
        self.curate()
        self.write(body="# Services\nUse **Create**.\n# Services\nAgain.\n")
        self.assertIn("invalid_capability_evidence", [i.code for i in self.build().errors])

    def test_malformed_curation_fails_clearly(self):
        for data in ({}, {"version": 1, "modules": ["bad"]}, {"version": 1, "modules": [{"module": "a"}]}, {"version": 1, "modules": [{"module": "a", "name": "A", "capabilities": [None]}]}):
            with self.subTest(data=data):
                self.curation.write_text(json.dumps(data), encoding="utf-8")
                with self.assertRaises(ValueError):
                    read_curation(self.curation)
