from knowledge.markdown import extract_sections
from knowledge.scanner import scan_documents
from knowledge.tests.helpers import WorkspaceTest


class SectionTests(WorkspaceTest):
    def sections(self, body):
        self.write(body=body)
        return extract_sections(scan_documents(self.source).documents[0])

    def test_hierarchy_preserves_all_text_without_nested_duplication(self):
        body = "Preamble\n\n# Workspace\nIntro\n\n## Create\n1. Open **Create**.\n2. Enter details.\n\n### Fields\n| Field | Required |\n| --- | --- |\n| نام | Yes |\n\n## Review\nFinish.\n"
        sections = self.sections(body)
        self.assertEqual([s["heading"] for s in sections], ["Introduction", "Workspace", "Create", "Fields", "Review"])
        self.assertEqual("".join(s["content"] for s in sections), body)
        self.assertIsNone(sections[1]["parent_section_id"])
        self.assertEqual(sections[3]["parent_section_id"], sections[2]["section_id"])
        self.assertEqual([h["heading"] for h in sections[3]["heading_path"]], ["Workspace", "Create", "Fields"])
        self.assertIn("1. Open **Create**.\n2. Enter details.", sections[2]["content"])
        self.assertIn("| نام | Yes |", sections[3]["content"])
        self.assertNotIn("نام", sections[2]["content"])
        for previous, following in zip(sections, sections[1:]):
            self.assertEqual(previous["end_offset"], following["start_offset"])

    def test_fences_indented_code_quotes_and_nested_list_headings_do_not_split(self):
        body = "# Real\n\n```python\n# fake\n## fake\n```\n\n~~~\n# also fake\n~~~\n\n    # indented\n\n> # quoted\n\n1. Step\n\n   ## Within step\n   Keep here.\n\n## Next\nDone.\n"
        sections = self.sections(body)
        self.assertEqual([s["heading"] for s in sections], ["Real", "Next"])
        self.assertEqual("".join(s["content"] for s in sections), body)

    def test_duplicate_headings_deterministic_and_rename_changes_id(self):
        body = "# Service\n## Save\nFirst.\n## Save\nSecond.\n"
        first = self.sections(body)
        self.assertEqual(first, self.sections(body))
        self.assertEqual(len({s["section_id"] for s in first}), 3)
        self.assertEqual(first[1]["heading_anchor"], "save")
        self.assertEqual(first[2]["heading_anchor"], "save-1")
        edited = self.sections(body.replace("First.", "Updated."))
        self.assertEqual([s["section_id"] for s in first], [s["section_id"] for s in edited])
        renamed = self.sections(body.replace("## Save", "## Submit", 1))
        self.assertNotEqual(first[1]["section_id"], renamed[1]["section_id"])

    def test_headingless_empty_and_leading_whitespace(self):
        for body in ("Plain **text**\n", "", "\n\n# Heading\nText without final newline"):
            with self.subTest(body=body):
                parts = self.sections(body)
                self.assertEqual(len(parts), 1)
                self.assertEqual(parts[0]["start_offset"], 0)
                self.assertEqual(parts[0]["content"], body)

    def test_setext_headings_and_non_heading_horizontal_rules(self):
        body = "Workspace\n=========\n\nDetails\n-------\n\n1. Step\n\n---\n\nDone.\n"
        sections = self.sections(body)
        self.assertEqual([s["heading"] for s in sections], ["Workspace", "Details"])
        self.assertEqual([s["heading_level"] for s in sections], [1, 2])
        self.assertEqual("".join(s["content"] for s in sections), body)
