import io
import json
import os
from types import SimpleNamespace
from unittest.mock import patch

from django.core.management.base import CommandError

from knowledge.loader import IndexError, load_index
from knowledge.management.commands.build_knowledge_index import Command
from knowledge.storage import publish_index
from knowledge.tests.helpers import WorkspaceTest


class StorageTests(WorkspaceTest):
    def test_roundtrip_exact_id_lookups_and_immutable_return_values(self):
        self.write(body="# Services\n\n## Fields\nنام — پښتو\n")
        result = self.build()
        manifest = publish_index(result, self.output)
        index = load_index(self.output)
        self.assertTrue(manifest["complete"])
        self.assertEqual(index.list_modules(), ["contractors"])
        self.assertEqual(index.documents_for_module("contractors")[0]["document_id"], "guide")
        document = index.get_document("guide")
        section = index.get_section(document["section_ids"][1])
        self.assertIn("پښتو", section["content"])
        self.assertIsNone(index.get_document("../../.env"))
        self.assertIsNone(index.get_section("C:/private/file"))
        document["title"] = "mutated"
        section["content"] = "mutated"
        self.assertNotEqual(index.get_document("guide")["title"], "mutated")
        self.assertIn("پښتو", index.get_section(document["section_ids"][1])["content"])
        first = (self.output / "manifest.json").read_bytes()
        self.assertEqual(publish_index(result, self.output), manifest)
        self.assertEqual((self.output / "manifest.json").read_bytes(), first)
        self.assertEqual(len(list((self.output / "generations").iterdir())), 1)

    def test_interrupted_commit_preserves_previous_complete_generation(self):
        self.write()
        previous = publish_index(self.build(), self.output)
        previous_bytes = (self.output / "manifest.json").read_bytes()
        self.write(body="# Services\nChanged instructions.\n")
        replace = os.replace

        def interrupt(source, destination):
            if str(destination).endswith("manifest.json"):
                raise OSError("Simulated interruption at the only commit point")
            return replace(source, destination)

        with patch("knowledge.storage.os.replace", side_effect=interrupt):
            with self.assertRaises(OSError):
                publish_index(self.build(), self.output)
        self.assertEqual((self.output / "manifest.json").read_bytes(), previous_bytes)
        self.assertEqual(load_index(self.output).manifest["build_hash"], previous["build_hash"])
        self.assertFalse(list(self.output.glob(".staging-*")))
        self.assertFalse(list(self.output.glob(".manifest-*")))

    def test_errors_preserve_index_partial_requires_explicit_opt_in(self):
        self.write()
        publish_index(self.build(), self.output)
        before = (self.output / "manifest.json").read_bytes()
        self.write(related_docs=["missing"])
        result = self.build()
        with self.assertRaisesRegex(IndexError, "Build has errors"):
            publish_index(result, self.output)
        self.assertEqual((self.output / "manifest.json").read_bytes(), before)
        manifest = publish_index(result, self.output, allow_partial=True)
        self.assertFalse(manifest["complete"])
        with self.assertRaisesRegex(IndexError, "incomplete"):
            load_index(self.output)
        self.assertIsNotNone(load_index(self.output, require_complete=False).get_document("guide"))

    def test_loader_refuses_tampering_path_traversal_and_missing_storage(self):
        with self.assertRaisesRegex(IndexError, "missing or malformed"):
            load_index(self.output)
        self.write()
        manifest = publish_index(self.build(), self.output)
        path = self.output / manifest["artifacts"]["sections.jsonl"]["path"]
        original = path.read_bytes()
        path.write_bytes(original + b" ")
        with self.assertRaisesRegex(IndexError, "checksum"):
            load_index(self.output)
        path.write_bytes(original)
        manifest["artifacts"]["documents.json"]["path"] = "../../.env"
        (self.output / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(IndexError, "committed generation"):
            load_index(self.output)

    def test_check_mode_creates_no_files_and_reports_errors(self):
        self.write()
        command = Command(stdout=io.StringIO())
        options = dict(source=str(self.source), output=str(self.output), check=True, allow_partial=False, verbose_diagnostics=True)
        fake_settings = SimpleNamespace(KNOWLEDGE_DOCUMENTATION_ROOT=self.source, KNOWLEDGE_INDEX_ROOT=self.output)
        with patch("knowledge.management.commands.build_knowledge_index.settings", fake_settings), patch("knowledge.management.commands.build_knowledge_index.build_index", side_effect=lambda source: self.build()):
            command.handle(**options)
            self.assertFalse(self.output.exists())
            self.write(related_docs=["missing"])
            with self.assertRaises(CommandError):
                command.handle(**options)
            options["output"] = str(self.source)
            with self.assertRaisesRegex(CommandError, "source directory"):
                command.handle(**options)

    def test_supporting_documents_require_opt_in(self):
        self.write()
        self.write("reference/backend/services.md", document_id="backend")
        publish_index(self.build(), self.output)
        index = load_index(self.output)
        self.assertEqual(len(index.documents_for_module("contractors")), 1)
        self.assertEqual(len(index.documents_for_module("contractors", include_supporting=True)), 2)
