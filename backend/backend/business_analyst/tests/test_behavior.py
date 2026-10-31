"""Real service/retrieval/audit pipeline with explicitly scripted model responses."""
import json
import os
import shutil
import tempfile
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from ai_assistant.provider import Completion, ToolCall
from ai_assistant.testing import ScriptedProvider
from business_analyst.config import Limits
from business_analyst.context import principal_for
from business_analyst.documents import DocumentRepository
from business_analyst.errors import OperationError
from business_analyst.models import Message, TurnAudit
from business_analyst.registry import production_registry
from business_analyst.service import ConversationService
from .helpers import ADMIN_DOC, DOC, DatabaseFixture, batch, definition, final, invocation


# These IDs are scripted selections, not evidence of autonomous model selection.
CASES = [
    ("dashboard", "Why do Dashboard revenue and headline order counts differ?", [DOC, "admin_dashboard_headline_cards"]),
    ("operations", "How do order charges relate to reservation charges and prepayments?", ["admin_operations_orders", "admin_operations_reservations"]),
    ("restaurant", "How do menu availability and kitchen station routing differ?", ["admin_restaurant_menu", "admin_restaurant_kitchen_stations"]),
    ("inventory", "Why do low stock alerts and the inventory dashboard differ?", ["admin_inventory_low_stock_alerts", "admin_inventory_dashboard"]),
    ("procurement", "Why can supplier net balance differ from invoice balances?", ["admin_procurement_suppliers", "admin_procurement_purchase_invoices"]),
    ("hr", "Do attendance records and shift durations automatically establish paid hours?", ["admin_hr_attendance", "admin_hr_shifts"]),
    ("payroll", "How do earned expense, advance recovery and salary payments differ?", ["admin_payroll_records", "admin_payroll_salary_advances", "admin_payroll_payments"]),
    ("contractors", "Does agreement value equal recognized service expense or paid cash?", ["admin_contractors_service_contracts", "admin_contractors_service_invoices"]),
    ("finance", "Do purchase value and cash flow labels establish profit or reconciled cash?", ["admin_reports_finance_profit_cost", "admin_reports_finance_profit_flow_cash", "admin_reports_finance_purchase_contractor_payroll"]),
    ("administration", "How do blank branch delivery settings differ from zero and Disabled?", ["admin_administration_settings_scope", "admin_administration_settings_branch", "admin_administration_settings_delivery"]),
]


class BehaviorTests(DatabaseFixture):
    def observe(self, name, provider, response):
        turn = TurnAudit.objects.get(pk=response["request_id"])
        requests = []
        retrieved = []
        errors = []
        tool_ids = []
        for request in provider.requests:
            for message in request["messages"]:
                if message["role"] == "tool":
                    result = json.loads(message["content"])
                    # Each snapshot repeats prior tool messages. Keep unique IDs.
                    for item in result.get("results", []):
                        key = item["evidence_id"]
                        if key not in requests:
                            requests.append(key)
                            if item["ok"] and item["kind"] == "document":
                                retrieved.append(item["id"])
                            if item["kind"] == "tool":
                                tool_ids.append(item["id"])
                            if not item["ok"]:
                                errors.append(item["error"]["code"])
                    if result.get("error") and result["error"]["code"] not in errors:
                        errors.append(result["error"]["code"])
        row = {"name": name, "mode": "mocked_model_real_pipeline", "model_requests": len(provider.requests),
               "batches": turn.batches, "operations": turn.operations, "retrieved_document_ids": retrieved,
               "business_tool_ids": tool_ids, "errors": errors, "kind": response["message"]["kind"], "status": turn.status}
        target = os.environ.get("BUSINESS_ANALYST_BEHAVIOR_OUTPUT")
        if target:
            with Path(target).open("a", encoding="utf-8") as stream:
                stream.write(json.dumps(row) + "\n")
        return row

    def answer_from_evidence(self, request):
        result = json.loads(next(message["content"] for message in reversed(request["messages"]) if message["role"] == "tool"))
        successful = [item for item in result["results"] if item["ok"]]
        # Cite verbatim body sentences available only after actual retrieval.
        content = "\n".join(next(line for line in item["data"]["content"].splitlines() if line.startswith("- **"))
                            for item in successful if item["kind"] == "document")
        return final(content, citations=[item["evidence_id"] for item in successful])

    def test_ten_domains_use_complete_compact_map_two_model_requests_and_one_batch(self):
        for domain, question, identities in CASES:
            with self.subTest(domain=domain):
                provider = ScriptedProvider([batch(identities), self.answer_from_evidence])
                service = ConversationService(provider=provider)
                response = service.reply(user=self.admin, question=question)
                expected_map = self.documents.capability_map(
                    principal_for(self.admin),
                    production_registry(self.documents))
                for request in provider.requests:
                    supplied = json.loads(request["messages"][1]["content"].split("\n", 1)[1])
                    self.assertEqual(supplied, expected_map)
                    self.assertEqual(sum(len(d["documents"]) for d in supplied["domains"]), 78)
                    self.assertEqual([tool["name"] for tool in request["tools"]], ["retrieve_business_context"])
                row = self.observe(domain, provider, response)
                self.assertEqual((row["model_requests"], row["batches"], row["operations"]), (2, 1, len(identities)))
                self.assertEqual(row["retrieved_document_ids"], identities)
                self.assertEqual([source["document_id"] for source in response["message"]["sources"]], identities)
                self.assertEqual(response["message"]["kind"], "answer")

    def test_missing_document_is_partial_evidence_not_a_successful_or_citable_result(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(self.documents.root, root, dirs_exist_ok=True)
            missing = "admin_inventory_stock_levels"
            (root / "docs" / (missing + ".md")).unlink()
            provider = ScriptedProvider([batch([DOC, missing]),
                                         final("The second requested document is unavailable; no stock figures can be established.", kind="limitation")])
            response = ConversationService(provider=provider, documents=DocumentRepository(root)).reply(user=self.admin, question="Compare the supplied definitions.")
            row = self.observe("missing_document_partial_evidence", provider, response)
            self.assertEqual(row["retrieved_document_ids"], [DOC])
            self.assertEqual(row["errors"], ["DOCUMENT_UNAVAILABLE"])
            self.assertEqual(response["message"]["sources"][0]["document_id"], DOC)

    def test_invalid_document_then_additional_round_recovers_with_actual_evidence(self):
        provider = ScriptedProvider([batch(["invalid_id"]), batch([DOC], call_id="retry"), self.answer_from_evidence])
        response = ConversationService(provider=provider).reply(user=self.admin, question="Explain Dashboard sales.")
        row = self.observe("invalid_id_recovery", provider, response)
        self.assertEqual((row["model_requests"], row["batches"]), (3, 2))
        self.assertEqual(row["errors"], ["INVALID_DOCUMENT_ID"])
        self.assertEqual(response["message"]["sources"][0]["evidence_id"], "b2:0")

    def test_oversized_arguments_batch_and_document_produce_controlled_limitations(self):
        large = Completion(tool_calls=(ToolCall("oversize", "retrieve_business_context", "x" * 32001),), finish_reason="tool_calls")
        for name, first, limits, error in (
            ("arguments", large, Limits(), "LIMIT_EXCEEDED"),
            ("batch", batch([DOC] * 17), Limits(), "LIMIT_EXCEEDED"),
            ("document", batch([DOC]), replace(Limits(), document_bytes=5), "OUTPUT_TOO_LARGE"),
        ):
            with self.subTest(name=name):
                provider = ScriptedProvider([first, final("The requested evidence exceeds the configured limit.", citations=[], kind="limitation")])
                response = ConversationService(provider=provider, limits=limits).reply(user=self.admin, question="Explain the evidence.")
                row = self.observe("oversized_" + name, provider, response)
                self.assertIn(error, row["errors"])
                self.assertEqual(row["model_requests"], 2)
                self.assertEqual(response["message"]["sources"], [])

    def test_corrupt_document_cannot_support_an_answer_even_with_a_known_id(self):
        with patch.object(self.documents, "fetch", side_effect=OperationError("DOCUMENT_UNAVAILABLE")):
            provider = ScriptedProvider([batch(), final("UNSUPPORTED", citations=["b1:0"]),
                                         final("The document could not be retrieved.", citations=[], kind="limitation")])
            response = ConversationService(provider=provider, documents=self.documents).reply(user=self.admin, question="Explain sales.")
        row = self.observe("failed_evidence_rejected", provider, response)
        self.assertEqual(row["model_requests"], 3)
        self.assertEqual(response["message"]["sources"], [])
        self.assertFalse(Message.objects.filter(role="assistant", content="UNSUPPORTED").exists())

    def test_map_tool_contracts_enable_mixed_dispatch_without_registry_fetch_and_allow_partial_denial(self):
        allowed = definition(id="test.allowed", authorize=lambda context, params: context.principal.role == "BranchAdmin")
        denied = definition(id="test.denied", authorize=lambda context, params: False)
        registry = self.registry(allowed, denied)
        self.documents.map["domains"][0]["tools"] = [
            {"id": allowed.id, "selection_hint": "Test metadata preserved", "parameters": {"untrusted": "overridden"}},
            {"id": "test.unregistered", "description": "Must not become callable"},
        ]
        def select(request):
            supplied = json.loads(request["messages"][1]["content"].split("\n", 1)[1])
            tools = {tool["id"]: tool for domain in supplied["domains"] for tool in domain["tools"]}
            self.assertEqual(tools[allowed.id]["parameters"], allowed.parameters)
            self.assertEqual(tools[allowed.id]["output"], allowed.output)
            self.assertEqual(tools[allowed.id]["knowledge_ids"], [DOC])
            self.assertEqual(tools[allowed.id]["selection_hint"], "Test metadata preserved")
            self.assertNotIn("test.unregistered", tools)
            return batch([DOC, ADMIN_DOC], [invocation(allowed.id, "allow", amount=2), invocation(denied.id, "deny", amount=2)])
        provider = ScriptedProvider([select, final("The documented definition and permitted test value are available; other operations were denied.", citations=["b1:0", "b1:2"])])
        response = ConversationService(provider=provider, documents=self.documents, registry=registry).reply(user=self.branch_admin, question="Test mixed evidence.")
        row = self.observe("mixed_documents_and_test_tools", provider, response)
        self.assertEqual((row["model_requests"], row["batches"], row["operations"]), (2, 1, 4))
        self.assertEqual(row["errors"], ["PERMISSION_DENIED", "PERMISSION_DENIED"])
        self.assertEqual([source["kind"] for source in response["message"]["sources"]], ["document", "tool"])

    def test_followup_keeps_conversation_and_audits_separate_turns_with_fresh_evidence(self):
        provider = ScriptedProvider([batch(), self.answer_from_evidence, batch(["admin_dashboard_headline_cards"], call_id="followup"), self.answer_from_evidence])
        service = ConversationService(provider=provider)
        first = service.reply(user=self.admin, question="Explain dashboard revenue.")
        second = service.reply(user=self.admin, question="And do headline order counts use that same population?", conversation_id=first["conversation_id"])
        self.assertEqual(first["conversation_id"], second["conversation_id"])
        turns = list(TurnAudit.objects.order_by("started_at"))
        self.assertEqual([(turn.model_calls, turn.batches, turn.status) for turn in turns], [(2, 1, "complete"), (2, 1, "complete")])
        self.assertEqual(second["message"]["sources"][0]["document_id"], "admin_dashboard_headline_cards")
        self.assertIn("Explain dashboard revenue.", json.dumps(provider.requests[2]["messages"]))
        for name, part, response in (("followup_initial", provider.requests[:2], first), ("followup_fresh", provider.requests[2:], second)):
            captured = SimpleNamespace(requests=part)
            self.observe(name, captured, response)

    def test_denied_operation_citation_is_repaired_without_discarding_authorized_results(self):
        registry = self.registry(definition(), definition(id="test.denied", authorize=lambda context, params: False))
        def repair(request):
            instruction = request["messages"][-1]["content"]
            self.assertIn('["b1:0","b1:1"]', instruction)
            self.assertNotIn("b1:2", instruction)
            self.assertIn("Never cite failed or permission-denied operations", instruction)
            return final("Sales are operational order values. The test result is 3; the other tool was denied.", citations=["b1:0", "b1:1"])
        provider = ScriptedProvider([
            batch([DOC], [invocation(amount=3), invocation("test.denied", "denied", amount=1)]),
            final("INVALID_DENIAL_CITATION", citations=["b1:0", "b1:1", "b1:2"]), repair])
        response = ConversationService(provider=provider, registry=registry).reply(user=self.admin, question="Test mixed evidence and denial.")
        row = self.observe("denied_citation_repair", provider, response)
        self.assertEqual((row["model_requests"], row["batches"]), (3, 1))
        self.assertEqual([source["evidence_id"] for source in response["message"]["sources"]], ["b1:0", "b1:1"])
        self.assertFalse(Message.objects.filter(content="INVALID_DENIAL_CITATION", role="assistant").exists())
