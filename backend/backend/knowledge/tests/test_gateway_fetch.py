import unittest
from dataclasses import replace
from unittest.mock import patch

from django.core import signing

from knowledge.errors import GatewayError
from knowledge.gateway import TOKEN_SALT
from knowledge.tests.gateway_helpers import INDEX_ROOT, identity, repository_gateway


@unittest.skipUnless(INDEX_ROOT.is_dir(), "Build the generated index to run gateway repository tests.")
class RepositoryFetchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gateway, cls.index, cls.current = repository_gateway()

    def setUp(self):
        self.current["principal"] = identity()
        self.discovery = self.gateway.search_documentation(user=object(), query="record contractor payment", limit=5)
        self.selections = [{"document_id": r["document_id"], "section_id": r["section_id"]} for r in self.discovery["results"][:2]]

    def fetch(self, **overrides):
        return self.gateway.fetch_documentation(user=object(), **{"search_token": self.discovery["search_token"], "sections": self.selections, **overrides})

    def assert_error(self, code, **kwargs):
        with self.assertRaises(GatewayError) as caught:
            self.fetch(**kwargs)
        self.assertEqual(caught.exception.code, code)

    def test_complete_search_fetch_sequence_and_multiple_sections(self):
        result = self.fetch(max_characters=12000)
        self.assertEqual(result["content_kind"], "untrusted_reference_material")
        self.assertEqual(len(result["sections"]), 2)
        for section in result["sections"]:
            self.assertEqual(section["content"], self.index.get_section(section["section_id"])["content"])
            self.assertTrue(section["source_path"].startswith("03_operator_guides/"))
            self.assertTrue(section["source_references"])
            self.assertEqual(section["verification_status"], "source_verified")
        # Same discovery permits later selections without a new search.
        self.assertEqual(self.fetch(sections=self.selections[1:])["sections"][0]["section_id"], self.selections[1]["section_id"])

    def test_missing_modified_expired_and_other_user_tokens_rejected(self):
        self.assert_error("discovery_invalid", search_token="modified")
        self.assert_error("invalid_arguments", search_token="")
        with self.assertRaises(GatewayError):
            self.gateway.fetch_documentation(user=object(), sections=self.selections)
        token = self.discovery["search_token"]
        self.assert_error("discovery_invalid", search_token=token[:-5] + "abcde")
        with patch("django.core.signing.time.time", return_value=10**10):
            self.assert_error("discovery_expired")
        self.current["principal"] = identity(user_id="different")
        self.assert_error("discovery_invalid")

    def test_role_branch_restaurant_and_permission_changes_invalidate_discovery(self):
        for change in ({"role": "Waiter"}, {"branch_id": "other"}, {"restaurant_id": "other"}, {"revoke_sessions": True}):
            with self.subTest(change=change):
                self.current["principal"] = replace(identity(), **change)
                self.assert_error("discovery_invalid")

    def test_undiscovered_unknown_mismatched_and_path_ids_rejected(self):
        self.assert_error("section_not_available", sections=[{"document_id": "not_a_document", "section_id": "not_a_section"}])
        other = self.index.get_document("operator_modules_payroll_payroll")
        self.assert_error("section_not_available", sections=[{"document_id": other["document_id"], "section_id": other["section_ids"][0]}])
        mismatched = {**self.selections[0], "document_id": other["document_id"]}
        self.assert_error("section_not_available", sections=[mismatched])
        self.assert_error("invalid_arguments", sections=[{"document_id": "../.env", "section_id": "../../.env"}])
        self.assert_error("invalid_arguments", sections=[{**self.selections[0], "path": ".env"}])

    def test_fetch_rechecks_policy_even_with_valid_signature_and_subject(self):
        payload = signing.loads(self.discovery["search_token"], salt=TOKEN_SALT)
        self.current["principal"] = identity("Waiter")
        # A server-created fixture simulates discovery followed by a policy narrowing.
        # Even a correctly bound token cannot grant an otherwise forbidden section.
        payload["subject"] = self.current["principal"].binding
        token = signing.dumps(payload, salt=TOKEN_SALT)
        self.assert_error("section_not_available", search_token=token)

    def test_index_change_rejects_old_discovery(self):
        with patch.object(type(self.index), "version", new_callable=unittest.mock.PropertyMock, return_value="new_generation"):
            self.assert_error("discovery_stale")

    def test_paging_reconstructs_exact_content_and_limits_are_explicit(self):
        selection = self.selections[0]
        original = self.index.get_section(selection["section_id"])["content"]
        parts, offset = [], 0
        while True:
            item = self.fetch(sections=[{**selection, "offset": offset}], max_characters=75)["sections"][0]
            parts.append(item["content"])
            if item["next_offset"] is None:
                break
            self.assertTrue(item["is_partial"])
            self.assertTrue(item["notice"])
            offset = item["next_offset"]
        self.assertEqual("".join(parts), original)
        self.assert_error("invalid_offset", sections=[{**selection, "offset": len(original) + 1}])
        self.assert_error("invalid_arguments", sections=self.selections * 3)
        self.assert_error("invalid_arguments", max_characters=12001)
        self.assert_error("invalid_arguments", sections=[selection, selection])
        with patch("knowledge.fetch.MAX_RESPONSE_BYTES", 100):
            self.assert_error("response_too_large")
