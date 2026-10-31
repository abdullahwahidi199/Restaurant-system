"""Compact discovery metadata with unchanged real contracts and execution.

The full-map adapter is a test-only before/after control, not a second registry.
"""
import copy
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from ai_assistant.testing import ScriptedProvider
from business_analyst.documents import DocumentRepository
from business_analyst.errors import OperationError
from business_analyst.models import TurnAudit
from business_analyst.registry import ToolRegistry, json_bytes, production_registry
from business_analyst.service import ConversationService
from business_analyst.tools import definitions
from .contractor_data import create_data
from .expense_data import create_expense_data
from .helpers import batch, definition, final, invocation
from .test_inventory_procurement_tools import InventoryProcurementFixture


ARTIFACTS = Path(__file__).resolve().parents[4] / "artifacts/business_analyst_capability_map"


class FullContractDocuments(DocumentRepository):
    """Reproduce the original AI representation from the same internal registry."""
    def capability_map(self, principal, registry):
        result = super().capability_map(principal, registry)
        for domain in result["domains"]:
            domain["tools"] = [{"id": tool["id"], "description": tool["description"],
                "parameters": tool["parameters"], "output": registry.get(tool["id"]).output,
                "knowledge_ids": tool["knowledge_ids"]} for tool in domain["tools"]]
        return result


class CapabilityMapFixture(InventoryProcurementFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.contractors = create_data(cls.restaurant, cls.branch, cls.staff)
        cls.expenses = create_expense_data(cls.restaurant, cls.branch)


class CompactCapabilityMapTests(CapabilityMapFixture):
    def test_complete_coverage_and_exact_existing_contract_fingerprints(self):
        baseline = json.loads((Path(__file__).with_name("fixtures") / "capability_contracts_before.sha256.json").read_text(encoding="utf-8"))
        result = self.documents.capability_map(self.context.principal, self.tools)
        entries = [t for domain in result["domains"] for t in domain["tools"]]
        self.assertEqual(len(entries), len({t["id"] for t in entries}))
        self.assertEqual({t["id"] for t in entries}, {t.id for t in definitions()})
        self.assertEqual(len(result["domains"]), 10)
        self.assertEqual(sum(len(d["documents"]) for d in result["domains"]), 78)
        catalog = [{key: domain[key] for key in ("id", "description", "documents")} for domain in result["domains"]]
        self.assertEqual(hashlib.sha256(json_bytes(catalog)).hexdigest(), baseline["catalog_sha256"])
        for entry in entries:
            with self.subTest(tool=entry["id"]):
                tool = self.tools.get(entry["id"])
                self.assertEqual(set(entry), {"id", "description", "parameters", "returns", "knowledge_ids"})
                self.assertEqual(entry["parameters"], tool.parameters)
                Draft202012Validator.check_schema(entry["parameters"])
                self.assertEqual(entry["returns"], tool.returns)
                self.assertGreater(len(entry["returns"]), 60)
                for key, expected in baseline["tools"][tool.id].items():
                    value = list(tool.knowledge_ids) if key == "knowledge_ids" else getattr(tool, key)
                    self.assertEqual(hashlib.sha256(json_bytes(value)).hexdigest(), expected, key)

    def test_output_validation_still_rejects_missing_decimal_and_pagination_fields(self):
        for definition in definitions():
            with self.subTest(tool=definition.id), self.assertRaises(OperationError) as error:
                self.tools.validate_output(self.tools.get(definition.id), {})
            self.assertEqual(error.exception.code, "INVALID_OUTPUT")
        expense = self.call("get_expense_summary")
        self.assertEqual(expense["totals"]["total_afn"], "1850.00")
        for invalid in (1850.0, "1850", "NaN"):
            output = copy.deepcopy(expense)
            output["totals"]["total_afn"] = invalid
            with self.assertRaises(OperationError):
                self.tools.validate_output(self.tools.get("get_expense_summary"), output)
        listing = self.call("list_expenses", page_size=1)
        self.assertEqual(listing["pagination"]["total"], 7)
        for invalid in ("7", None):
            output = copy.deepcopy(listing)
            output["pagination"]["total"] = invalid
            with self.assertRaises(OperationError):
                self.tools.validate_output(self.tools.get("list_expenses"), output)

    def test_determinism_copy_isolation_and_substantial_reduction(self):
        first = self.documents.capability_map(self.context.principal, self.tools)
        second = DocumentRepository().capability_map(self.context.principal, production_registry(DocumentRepository()))
        self.assertEqual(json_bytes(first), json_bytes(second))
        full = FullContractDocuments().capability_map(self.context.principal, self.tools)
        self.assertLess(len(json_bytes(first)), len(json_bytes(full)) * 0.5)
        before_tools = [t for d in full["domains"] for t in d["tools"]]
        after_tools = [t for d in first["domains"] for t in d["tools"]]
        self.assertEqual([t["id"] for t in before_tools], [t["id"] for t in after_tools])
        self.assertEqual([t["parameters"] for t in before_tools], [t["parameters"] for t in after_tools])
        tool = next(t for t in after_tools if t["id"] == "list_expenses")
        tool["parameters"]["properties"]["page"]["maximum"] = 1
        self.assertEqual(self.tools.get("list_expenses").parameters["properties"]["page"]["maximum"], 10000)

    def test_stale_catalog_output_schemas_and_forged_returns_cannot_leak(self):
        domain = next(d for d in self.documents.map["domains"] if d["id"] == "contractors")
        domain["tools"] = [{"id": "get_contractor_summary", "output": {"secret_schema": "MUST_NOT_TRANSMIT"},
            "returns": "FORGED", "parameters": {"bad": True}, "selection_hint": "Compatible plain-text hint"}]
        result = self.documents.capability_map(self.context.principal, self.tools)
        entry = next(t for d in result["domains"] for t in d["tools"] if t["id"] == "get_contractor_summary")
        self.assertNotIn("output", entry)
        self.assertNotIn("MUST_NOT_TRANSMIT", json_bytes(result).decode())
        self.assertEqual(entry["returns"], self.tools.get(entry["id"]).returns)
        self.assertEqual(entry["parameters"], self.tools.get(entry["id"]).parameters)
        self.assertEqual(entry["selection_hint"], "Compatible plain-text hint")

    def test_future_and_legacy_tools_appear_without_another_specification_fetch(self):
        registry = ToolRegistry(self.documents)
        future = definition(id="test.future", returns="A bounded integer value and selected label, both from the authorized test operation.")
        legacy = definition(id="test.legacy")
        for tool in (*definitions(), future, legacy):
            registry.register(tool)
        result = self.documents.capability_map(self.context.principal, registry.freeze())
        entries = {t["id"]: t for d in result["domains"] for t in d["tools"]}
        self.assertEqual(entries[future.id]["returns"], future.returns)
        self.assertIn("value, label", entries[legacy.id]["returns"])
        self.assertNotIn("output", entries[legacy.id])
        self.assertEqual(entries[legacy.id]["parameters"], legacy.parameters)
        for invalid in (None, {}, 10):
            with self.assertRaises(ValueError):
                ToolRegistry(self.documents).register(definition(returns=invalid))

    def test_internal_full_results_and_authorization_unchanged_by_map_projection(self):
        calls = [invocation("get_contractor_summary", "contractors", date_from="2026-01-01", date_to="2026-01-31"),
            invocation("get_expense_summary", "expenses", date_from="2026-01-01", date_to="2026-01-31"),
            invocation("get_inventory_summary", "stock"), invocation("get_procurement_summary", "procurement")]
        full = self.execute(calls)
        self.documents.capability_map(self.context.principal, self.tools)
        compact = self.execute(calls)
        self.assertTrue(all(r["ok"] for r in compact["results"]), compact)
        self.assertEqual([r["data"]["output"] for r in full["results"]], [r["data"]["output"] for r in compact["results"]])
        self.assertEqual(compact["results"][0]["data"]["output"]["current"]["outstanding_balance"], "275.00")
        self.assertEqual(compact["results"][1]["data"]["output"]["totals"]["total_afn"], "1810.00")
        for tool in ("get_contractor_summary", "get_expense_summary", "get_inventory_summary", "get_procurement_summary"):
            denied = self.execute([invocation(tool, "denied")], user=self.waiter)
            self.assertEqual(denied["results"][0]["error"]["code"], "PERMISSION_DENIED")

    def test_representative_selection_two_calls_one_batch_in_both_representations(self):
        # Scripted selections validate contracts/orchestration, not LLM accuracy.
        cases = [
            ("Why might our total contractor outstanding balance differ from the sum of unpaid service invoice balances?",
             ["admin_contractors_shared_financial_meaning", "admin_contractors_payables"],
             [("get_contractor_summary", {}), ("get_service_invoices_summary", {})]),
            ("Explain the difference between a service contract's value, a contractor invoice's total, a payment, and a contractor's outstanding balance in our system.",
             ["admin_contractors_shared_financial_meaning", "admin_contractors_service_contracts", "admin_contractors_service_invoices", "admin_contractors_payments"], []),
            ("List contractors and current balances.", [], [("list_contractors", {"page_size": 2, "sort": "-balance"})]),
            ("List January 2026 expenses.", [], [("list_expenses", {"date_from": "2026-01-01", "date_to": "2026-01-31", "sort": "date"})]),
            ("Compare January service charges, contractor payments and operating expenses.", ["admin_contractors_shared_financial_meaning", "admin_finance_expenses"],
             [("get_service_invoices_summary", {"date_from": "2026-01-01", "date_to": "2026-01-31"}),
              ("get_contractor_payments_summary", {"date_from": "2026-01-01", "date_to": "2026-01-31"}),
              ("get_expense_summary", {"date_from": "2026-01-01", "date_to": "2026-01-31"})]),
            ("Compare current inventory with procurement purchases/payments.", ["admin_inventory_dashboard", "admin_procurement_shared_financial_meaning"],
             [("get_inventory_summary", {}), ("get_procurement_summary", {})]),
        ]
        for question, doc_ids, tool_specs in cases:
            observed = []
            for repository in (FullContractDocuments(), DocumentRepository()):
                with self.subTest(question=question, representation=type(repository).__name__):
                    def select(request):
                        capability = json.loads(request["messages"][1]["content"].split("\n", 1)[1])
                        entries = {t["id"]: t for d in capability["domains"] for t in d["tools"]}
                        self.assertEqual(set(entries), {t.id for t in definitions()})
                        calls = [invocation(name, f"tool_{i}", **params) for i, (name, params) in enumerate(tool_specs)]
                        for call in calls:
                            Draft202012Validator(entries[call["tool_id"]]["parameters"]).validate(call["parameters"])
                        observed.append((doc_ids, calls))
                        return batch(doc_ids, calls)
                    def answer(request):
                        evidence = json.loads(next(m["content"] for m in reversed(request["messages"]) if m["role"] == "tool"))
                        self.assertTrue(all(r["ok"] for r in evidence["results"]), evidence)
                        return final("Agreement values, recognized invoice charges, payment rows and current balances are separate measures.",
                                     citations=[r["evidence_id"] for r in evidence["results"]])
                    provider = ScriptedProvider([select, answer])
                    result = ConversationService(provider=provider, documents=repository).reply(user=self.admin, question=question)
                    audit = TurnAudit.objects.get(pk=result["request_id"])
                    self.assertEqual((audit.model_calls, audit.batches, audit.operations, audit.status), (2, 1, len(doc_ids) + len(tool_specs), "completed"))
                    self.assertEqual(len(result["message"]["sources"]), len(doc_ids) + len(tool_specs))
                    self.assertEqual([t["name"] for t in provider.requests[0]["tools"]], ["retrieve_business_context"])
            self.assertEqual(observed[0], observed[1])
