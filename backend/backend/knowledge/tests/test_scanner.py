from unittest.mock import patch

from knowledge.scanner import MetadataError, parse_frontmatter, safe_relative, scan_documents
from knowledge.tests.helpers import WorkspaceTest


class ScannerTests(WorkspaceTest):
    def test_recursive_discovery_unicode_and_metadata(self):
        body = "# سلام\n\nثبت سفارش — پښتو **Save**\n"
        self.write(body=body, roles=["See access section"], title="خدمات")
        self.write("forms/nested/service.md", document_id="form", document_type="form")
        scan = scan_documents(self.source)
        self.assertEqual(scan.scanned, 2)
        self.assertEqual(len(scan.documents), 2)
        guide = next(d for d in scan.documents if d.document_id == "guide")
        self.assertEqual(guide.markdown, body)
        self.assertEqual(guide.metadata["title"], "خدمات")
        self.assertEqual(guide.metadata["roles"], ["See access section"])
        self.assertEqual(guide.path, "03_operator_guides/modules/contractors/services.md")
        self.assertEqual(next(d for d in scan.documents if d.document_id == "form").document_type, "form_reference")
        self.assertIn("generic_or_unknown_roles", [i.code for i in scan.issues])

    def test_generated_temporary_unrelated_and_non_markdown_are_excluded(self):
        self.write()
        for path in (".generated/copy.md", "generated/copy.md", "node_modules/copy.md", "tmp/copy.md", "modules/copy.tmp.md", "modules/.copy.md", "modules/~copy.md"):
            self.write(path, document_id="should_not_be_seen")
        (self.source / ".env").write_text("DO_NOT_READ=this_is_not_documentation", encoding="utf-8")
        scan = scan_documents(self.source)
        self.assertEqual(scan.scanned, 1)
        self.assertEqual([d.document_id for d in scan.documents], ["guide"])
        self.assertEqual(len(scan.excluded), 7)

    def test_invalid_missing_duplicate_keys_and_duplicate_ids_are_recoverable(self):
        self.write()
        self.write("modules/duplicate1.md", document_id="duplicate")
        self.write("modules/duplicate2.md", document_id="duplicate")
        for name, value in {"missing": "# No metadata", "yaml": "---\ntitle: [\n---\n", "duplicate_key": "---\nid: a\nid: b\n---\n"}.items():
            (self.source / f"{name}.md").write_text(value, encoding="utf-8")
        scan = scan_documents(self.source)
        self.assertEqual(scan.scanned, 6)
        self.assertEqual([d.document_id for d in scan.documents], ["guide"])
        self.assertEqual(len([i for i in scan.issues if i.severity == "error"]), 5)
        self.assertEqual(len(scan.excluded), 5)

    def test_required_fields_types_paths_and_yaml_aliases(self):
        for override in ({"roles": "Admin"}, {"id": "../file"}, {"source_references": ["../private"]}, {"source_references": ["C:/private/file.py:fn"]}, {"frontend_routes": ["https://host/path"]}, {"document_type": "imaginary"}):
            with self.subTest(override=override):
                self.write(**override)
                self.assertEqual(len(scan_documents(self.source).documents), 0)
        with self.assertRaises(MetadataError):
            parse_frontmatter("---\na: &value [a]\nb: *value\n---\n")
        for path in ("../file", "/file", "C:/file", "a\\file", "a//file", "https://host"):
            self.assertFalse(safe_relative(path))

    def test_missing_and_empty_root_fail_clearly(self):
        with self.assertRaisesRegex(ValueError, "No source Markdown"):
            scan_documents(self.source)
        with self.assertRaisesRegex(ValueError, "root is missing"):
            scan_documents(self.workspace / "missing")

    def test_crlf_and_bom_normalize_body_but_keep_raw_hash(self):
        target = self.write()
        normal = scan_documents(self.source).documents[0]
        target.write_bytes(b"\xef\xbb\xbf" + target.read_bytes().replace(b"\n", b"\r\n"))
        changed = scan_documents(self.source).documents[0]
        self.assertEqual(normal.markdown, changed.markdown)
        self.assertEqual(normal.content_hash, changed.content_hash)
        self.assertNotEqual(normal.source_hash, changed.source_hash)

    def test_symlink_markdown_is_skipped_without_reading(self):
        # Windows symlink creation can require elevated privileges: mock its
        # observed type while exercising the scanner's actual exclusion branch.
        target = self.write()
        with patch("pathlib.Path.is_symlink", side_effect=lambda: True):
            with self.assertRaisesRegex(ValueError, "No source Markdown"):
                scan_documents(target.parent)
