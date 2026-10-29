import io
import json
import os
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.db import OperationalError

from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway
from knowledge.management.commands.test_knowledge_gateway import Command
from knowledge.repository import IndexRepository
from knowledge.storage import publish_index
from knowledge.tests.gateway_helpers import identity
from knowledge.tests.helpers import WorkspaceTest
from knowledge.tool_definitions import get_tool_definitions


class GatewayInfrastructureTests(WorkspaceTest):
    def test_source_freshness_touch_change_add_delete_and_rebuild(self):
        path = self.write()
        publish_index(self.build(), self.output)
        repository = IndexRepository(self.output, source_root=self.source, curation_path=self.curation)
        first = repository.get()
        os.utime(path, None)
        self.assertIs(repository.get(), first)
        original = path.read_bytes()
        path.write_bytes(original + b"\nChanged instruction.\n")
        with self.assertRaises(GatewayError):
            repository.get()
        publish_index(self.build(), self.output)
        second = repository.get()
        self.assertNotEqual(first.version, second.version)
        added = self.write("additional.md", document_id="additional")
        with self.assertRaises(GatewayError):
            repository.get()
        added.unlink()
        self.assertIs(repository.get(), second)
        path.unlink()
        with self.assertRaises(GatewayError):
            repository.get()

    def test_curation_drift_is_detected_after_cache_load(self):
        self.write()
        publish_index(self.build(), self.output)
        repository = IndexRepository(self.output, source_root=self.source, curation_path=self.curation)
        repository.get()
        self.curation.write_bytes(self.curation.read_bytes() + b"\n")
        with self.assertRaises(GatewayError):
            repository.get()

    def gateway(self):
        return KnowledgeGateway(index_root=self.output, principal_resolver=lambda user: identity())

    def test_cache_refreshes_on_manifest_and_immutable_artifact_change(self):
        self.write(document_id="operator_modules_contractors_services")
        publish_index(self.build(), self.output)
        repository = IndexRepository(self.output)
        first = repository.get()
        self.assertIs(repository.get(), first)
        self.write(body="# Changed\nNew procedure.\n", document_id="operator_modules_contractors_services")
        manifest = publish_index(self.build(), self.output)
        second = repository.get()
        self.assertNotEqual(first.version, second.version)
        self.assertEqual(second.version, manifest["build_hash"])
        target = self.output / manifest["artifacts"]["sections.jsonl"]["path"]
        target.write_bytes(target.read_bytes() + b" ")
        with self.assertRaises(GatewayError) as error:
            repository.get()
        self.assertEqual(error.exception.code, "index_unavailable")

    def test_missing_index_and_missing_artifact_do_not_use_stale_cache(self):
        with self.assertRaises(GatewayError):
            self.gateway().search_documentation(user=object(), query="create")
        self.write(document_id="operator_modules_contractors_services")
        manifest = publish_index(self.build(), self.output)
        repository = IndexRepository(self.output)
        repository.get()
        (self.output / manifest["artifacts"]["documents.json"]["path"]).unlink()
        with self.assertRaises(GatewayError):
            repository.get()

    def test_modified_manifest_cannot_retain_an_old_build_identity(self):
        self.write(document_id="operator_modules_contractors_services")
        manifest = publish_index(self.build(), self.output)
        manifest["source_hashes"]["03_operator_guides/modules/contractors/services.md"] = "0" * 64
        (self.output / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaises(GatewayError) as error:
            IndexRepository(self.output).get()
        self.assertEqual(error.exception.code, "index_unavailable")

    def test_search_response_mutation_cannot_change_cached_source_metadata(self):
        self.write(document_id="operator_modules_contractors_services")
        self.curate(document_id="operator_modules_contractors_services")
        publish_index(self.build(), self.output)
        gateway = self.gateway()
        response = gateway.search_documentation(user=object(), query="Create", module="contractors")
        response["results"][0]["heading_path"][0]["heading"] = "corrupted"
        response["module_context"]["capabilities"][0]["label"] = "corrupted"
        again = gateway.search_documentation(user=object(), query="Create", module="contractors")
        self.assertEqual(again["results"][0]["heading_path"][0]["heading"], "Services")
        self.assertEqual(again["module_context"]["capabilities"][0]["label"], "Create contractor")

    def test_new_generation_invalidates_tokens_and_refreshes_search_engine(self):
        did = "operator_modules_contractors_services"
        self.write(document_id=did)
        publish_index(self.build(), self.output)
        gateway = self.gateway()
        first = gateway.search_documentation(user=object(), query="Create")
        section = first["results"][0]
        self.write(body="# Changed\nAnother known procedure.\n", document_id=did)
        publish_index(self.build(), self.output)
        with self.assertRaises(GatewayError) as error:
            gateway.fetch_documentation(user=object(), search_token=first["search_token"], sections=[{"document_id": did, "section_id": section["section_id"]}])
        self.assertEqual(error.exception.code, "discovery_stale")
        second = gateway.search_documentation(user=object(), query="Another known procedure")
        self.assertNotEqual(first["index_version"], second["index_version"])
        self.assertEqual(second["results"][0]["title"], "Changed")

    def test_unicode_dari_pashto_and_english_match_and_fetch_unchanged(self):
        body = "# Service\n\n## ثبت سفارش\nبرای ثبت سفارش این مرحله را بخوانید.\n\n## خوندي کول\nدلته خوندي کول وکاروئ.\n\n## Create contractor\nUse **Create**.\n"
        self.write(body=body, document_id="operator_modules_contractors_services")
        publish_index(self.build(), self.output)
        gateway = self.gateway()
        for query, heading in (("ثبت سفارش", "ثبت سفارش"), ("خوندي کول", "خوندي کول"), ("CREATE CONTRACTOR!", "Create contractor")):
            with self.subTest(query=query):
                found = gateway.search_documentation(user=object(), query=query)
                self.assertEqual(found["results"][0]["title"], heading)
                selected = found["results"][0]
                fetched = gateway.fetch_documentation(user=object(), search_token=found["search_token"], sections=[{"document_id": selected["document_id"], "section_id": selected["section_id"]}])
                self.assertIn(heading, fetched["sections"][0]["content"])

    def test_long_repetitive_content_does_not_beat_exact_procedure_heading(self):
        self.write(body="# Create contractor\nEnter name and save.\n", document_id="operator_modules_contractors_services")
        self.write("modules/procurement/irrelevant.md", body="# Background\n" + "contractor " * 15000, document_id="operator_modules_procurement_purchasing", title="Background notes", module="procurement", keywords=[], description="Background reference.")
        publish_index(self.build(), self.output)
        result = self.gateway().search_documentation(user=object(), query="Create contractor")
        self.assertEqual(result["results"][0]["document_id"], "operator_modules_contractors_services")

    def test_tokens_are_stateless_across_gateway_instances(self):
        self.write(document_id="operator_modules_contractors_services")
        publish_index(self.build(), self.output)
        first = self.gateway().search_documentation(user=object(), query="Create")
        selected = first["results"][0]
        second = self.gateway().fetch_documentation(user=object(), search_token=first["search_token"], sections=[{"document_id": selected["document_id"], "section_id": selected["section_id"]}])
        self.assertEqual(second["sections"][0]["content"], "# Services\n\nUse **Create**.\n")

    def test_tool_definitions_are_json_serializable_and_defensive_copies(self):
        definitions = get_tool_definitions()
        self.assertEqual({d["name"] for d in definitions}, {"search_documentation", "fetch_documentation"})
        self.assertTrue(json.loads(json.dumps(definitions, ensure_ascii=False)))
        definitions[0]["parameters"]["properties"]["limit"]["maximum"] = 9999
        self.assertEqual(get_tool_definitions()[0]["parameters"]["properties"]["limit"]["maximum"], 15)

    def test_authorization_storage_failure_is_safe(self):
        gateway = KnowledgeGateway(repository=Mock(), principal_resolver=Mock(side_effect=OperationalError("private database hostname")))
        with self.assertRaises(GatewayError) as caught:
            gateway.search_documentation(user=object(), query="Create")
        self.assertEqual(caught.exception.code, "authorization_unavailable")
        self.assertNotIn("hostname", str(caught.exception))
        gateway.repository.get.assert_not_called()

    def test_development_cli_uses_existing_account_and_real_dispatch(self):
        self.write(document_id="operator_modules_contractors_services")
        publish_index(self.build(), self.output)
        command = Command(stdout=io.StringIO())
        User = Mock()
        User.DoesNotExist = type("DoesNotExist", (Exception,), {})
        user = SimpleNamespace(pk=11)
        User.objects.get.return_value = user
        gateway = self.gateway()
        with patch("knowledge.management.commands.test_knowledge_gateway.get_user_model", return_value=User), patch("knowledge.management.commands.test_knowledge_gateway.KnowledgeGateway", return_value=gateway):
            command.handle(user_id=11, query="Create", module="contractors", browse=False, limit=3)
        User.objects.get.assert_called_once_with(pk=11)
        self.assertIn("Fetch succeeded", command.stdout._out.getvalue())
        self.assertIn("operator_modules_contractors_services", command.stdout._out.getvalue())
