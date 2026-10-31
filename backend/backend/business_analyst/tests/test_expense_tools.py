from ai_assistant.audit_payloads import read_blob
"""Real Django data and orchestration; model responses are explicitly scripted."""
import json
import os
import time
from pathlib import Path
from unittest.mock import patch

from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.permissions import BasePermission
from ai_assistant.testing import ScriptedProvider
from business_analyst.config import Limits
from business_analyst.context import ToolContext, principal_for
from business_analyst.errors import OperationError
from business_analyst.executor import BatchExecutor
from business_analyst.models import TurnAudit
from business_analyst.registry import json_bytes, production_registry
from business_analyst.service import ConversationService
from business_analyst.tools import definitions, expense_definitions, operation_views
from expenses.models import Expenses, ExpenseHistory
from expenses.selectors import ExpenseQueries
from expenses.views import _calc_expense_stats, ExpenseDetailsView, ExpenseHistoryApiView
from reports.services.finance import FinanceReportService
from users.models import Staff
from .contractor_data import create_data
from .expense_data import create_expense_data
from .helpers import DatabaseFixture, batch, final, invocation

EXPENSES = "admin_finance_expenses"
HISTORY = "admin_finance_expense_detail_history"
CONTRACTORS = "admin_contractors_shared_financial_meaning"


class DenyRead(BasePermission):
    def has_permission(self, request, view):
        return False


class ExpenseToolTests(DatabaseFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.data = create_expense_data(cls.restaurant, cls.branch)
        cls.contractor_data = create_data(cls.restaurant, cls.branch, Staff.objects.get(user=cls.admin))
        cls.restricted = []
        for restaurant, branch in ((cls.restaurant, cls.second_branch), (cls.foreign_restaurant, cls.foreign_branch), (cls.restaurant, None)):
            cls.restricted.append(Expenses.objects.create(restaurant=restaurant, branch=branch,
                name="Restricted cost", amount="9999", date="2026-01-01"))

    def setUp(self):
        super().setUp()
        self.registry = production_registry(self.documents)
        self.context = ToolContext(principal_for(self.admin), time.monotonic() + 60)

    def call(self, tool_id, **params):
        tool = self.registry.get(tool_id)
        p = self.registry.validate_parameters(tool, params)
        result = tool.handler(self.context, p)
        self.registry.validate_output(tool, result)
        return result

    def execute(self, calls, documents=(), user=None):
        user = user or self.admin
        return BatchExecutor(self.documents, self.registry, Limits()).execute(
            {"document_ids": list(documents), "tools": calls}, user=user,
            binding=principal_for(user).binding, deadline=time.monotonic() + 60)

    def test_all_registered_and_five_finance_contracts_match_complete_map(self):
        self.assertEqual(len(definitions()), 48)
        self.assertEqual(len(expense_definitions()), 5)
        supplied = self.documents.capability_map(self.context.principal, self.registry)
        self.assertEqual(supplied, self.documents.map)
        finance = next(d for d in supplied["domains"] if d["id"] == "finance")
        self.assertEqual({t["id"] for t in finance["tools"]}, {t.id for t in expense_definitions()})
        self.assertLess(len(json_bytes(supplied)), 240000)

    def test_all_time_financial_summary_counts_saved_afn_once(self):
        result = self.call("get_expense_summary")
        self.assertEqual(result["totals"], {"count": 7, "total_afn": "1850.00", "average_afn": "264.29",
            "minimum_afn": "-10.00", "maximum_afn": "1000.00", "first_expense_date": "2025-12-31",
            "last_expense_date": "2026-02-05", "negative_amount_count": 1, "zero_amount_count": 1, "negative_rate_count": 1})
        currencies = {r["currency"]: r for r in result["by_currency"]}
        self.assertEqual(currencies["USD"], {"currency": "USD", "count": 2, "original_amount": "12.00", "total_afn": "690.00"})
        self.assertEqual(sum(r["count"] for r in result["by_name"]["groups"]), 7)
        self.assertEqual(result["period"], {"from": None, "to": None})

    def test_inclusive_dates_and_open_bounds_filter_expense_date(self):
        result = self.call("get_expense_summary", date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual((result["totals"]["count"], result["totals"]["total_afn"]), (5, "1810.00"))
        self.assertEqual(self.call("get_expense_summary", date_to="2025-12-31")["totals"]["total_afn"], "50.00")
        self.assertEqual(self.call("get_expense_summary", date_from="2026-02-01")["totals"]["total_afn"], "-10.00")
        self.assertEqual(self.call("list_expenses", date_from="2026-01-31", date_to="2026-01-31")["results"][0]["id"], self.data["fuel"].pk)

    def test_saved_conversion_details_complete_and_not_revalued(self):
        result = self.call("get_expense_details", expense_id=self.data["fuel"].pk)["expense"]
        self.assertEqual(result, {"id": self.data["fuel"].pk, "name": "Fuel", "amount": "10.00", "currency": "USD",
            "exchange_rate": "70.00", "amount_afn": "700.00", "date": "2026-01-31", "description": "Synthetic operating cost"})
        Expenses.objects.filter(pk=self.data["fuel"].pk).update(exchange_rate="80")
        self.assertEqual(self.call("get_expense_details", expense_id=self.data["fuel"].pk)["expense"]["amount_afn"], "700.00")
        self.assertEqual(self.call("get_expense_summary", name="fuel")["totals"]["total_afn"], "700.00")

    def test_name_currency_search_pagination_and_stable_sorts(self):
        self.assertEqual(self.call("list_expenses", currency="USD")["pagination"]["total"], 2)
        self.assertEqual(self.call("list_expenses", name="fUeL")["results"][0]["name"], "Fuel")
        self.assertEqual(self.call("list_expenses", search="operating")["pagination"]["total"], 7)
        pages = [self.call("list_expenses", page_size=1, page=n, sort="amount_afn")["results"][0]["id"] for n in range(1, 8)]
        self.assertEqual(len(set(pages)), 7)
        self.assertEqual(pages, [r["id"] for r in self.call("list_expenses", sort="amount_afn")["results"]])
        self.assertEqual(self.call("list_expenses", page=10000)["results"], [])

    def test_history_events_not_expenses_and_no_invented_record_link(self):
        result = self.call("list_expense_history", page_size=50)
        self.assertEqual(result["pagination"]["total"], 10)
        self.assertTrue(all("expense_id" not in r for r in result["results"]))
        update = next(r for r in result["results"] if r["action"] == "updated")
        self.assertEqual(update["changed_fields"]["amount"], {"old": 100.0, "new": 120.0})
        self.assertEqual(update["amount_afn"], "120.00")
        self.assertEqual(self.call("list_expense_history", action="deleted")["results"][0]["amount_afn"], "210.00")
        self.assertEqual(self.call("get_expense_summary")["totals"]["total_afn"], "1850.00")
        with self.assertRaises(OperationError) as caught:
            self.call("get_expense_details", expense_id=self.data["deleted_id"])
        self.assertEqual(caught.exception.code, "RECORD_NOT_AVAILABLE")

    def test_history_inclusive_kabul_days_and_event_dates_differ_from_expense_dates(self):
        jan = self.call("get_expense_history_summary", date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual(jan["event_count"], 5)
        fuel = self.call("list_expense_history", name="fuel", date_from="2026-02-01", date_to="2026-02-01")
        self.assertEqual(fuel["pagination"]["total"], 1)
        self.assertEqual(fuel["results"][0]["date_time"], "2026-02-01T01:30:00+04:30")
        self.assertEqual(self.call("list_expense_history", name="fuel", date_to="2026-01-31")["results"], [])
        self.assertEqual(self.call("list_expense_history", name="Transport", action="updated", date_to="2026-01-31")["results"], [])

    def test_history_summary_has_counts_and_no_financial_totals(self):
        result = self.call("get_expense_history_summary")
        self.assertEqual(result["event_count"], 10)
        self.assertEqual({r["action"]: r["event_count"] for r in result["by_action"]}, {"created": 8, "updated": 1, "deleted": 1})
        self.assertEqual({r["month"]: r["event_count"] for r in result["by_month"]["groups"]}, {"2026-02-01": 4, "2026-01-01": 5, "2025-12-01": 1})
        self.assertEqual(self.call("get_expense_history_summary", currency="USD", action="created")["event_count"], 3)
        self.assertNotIn("total_afn", json.dumps(result))

    def test_empty_results_have_zero_counts_and_null_dates(self):
        result = self.call("get_expense_summary", search="absent")
        self.assertEqual(result["totals"]["count"], 0)
        self.assertEqual(result["totals"]["total_afn"], "0.00")
        self.assertIsNone(result["totals"]["first_expense_date"])
        self.assertEqual(result["by_currency"], [])
        self.assertEqual(self.call("get_expense_history_summary", search="absent")["event_count"], 0)

    def test_summary_reconciles_existing_expense_cards_and_finance_report(self):
        scope = Expenses.objects.filter(restaurant=self.restaurant, branch=self.branch)
        cards = _calc_expense_stats(scope)
        self.assertEqual(cards["total_count"], 7)
        self.assertEqual(float(cards["total_afn"]), 1850.0)
        self.assertEqual(float(cards["total_usd"]), 12.0)
        report = FinanceReportService.profit_loss("2026-01-01", "2026-01-31", self.restaurant, self.branch)
        self.assertEqual(report["expenses"]["daily_expenses"], 1810.0)
        self.assertEqual(report["cash_flow"]["daily_expense_payments"], 1810.0)
        self.assertEqual(self.call("get_expense_summary", date_from="2026-01-01", date_to="2026-01-31")["totals"]["total_afn"], "1810.00")

    def test_summary_groups_bounded_with_exact_remainders_and_no_row_dump(self):
        Expenses.objects.bulk_create([Expenses(restaurant=self.restaurant, branch=self.branch, name=f"Group {n:02d}",
            date=f"2024-{n:02d}-01" if n < 13 else "2023-01-01", amount="1", amount_afn="1") for n in range(1, 14)])
        result = self.call("get_expense_summary")
        self.assertEqual(len(result["by_name"]["groups"]), 10)
        self.assertEqual(len(result["by_month"]["groups"]), 12)
        for field in ("by_name", "by_month"):
            group = result[field]
            self.assertGreater(group["other_count"], 0)
            self.assertEqual(sum(r["count"] for r in group["groups"]) + group["other_count"], 20)
            from decimal import Decimal
            self.assertEqual(sum(Decimal(r["total_afn"]) for r in group["groups"]) + Decimal(group["other_total_afn"]), Decimal("1863.00"))
        self.assertNotIn("results", result)

    def test_selectors_are_read_only_database_aggregates_and_query_count_bounded(self):
        q = ExpenseQueries(restaurant_id=self.restaurant.pk, branch_id=self.branch.pk, parameters={})
        with CaptureQueriesContext(connection) as captured:
            q.summary()
        self.assertLessEqual(len(captured), 6)
        self.assertTrue(any("SUM(" in query["sql"].upper() and "GROUP BY" in query["sql"].upper() for query in captured))
        self.assertFalse(any(query["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for query in captured))

    def test_scope_foreign_null_branch_and_unknown_ids_are_indistinguishable(self):
        for pk in [r.pk for r in self.restricted] + [999999]:
            with self.subTest(pk=pk), self.assertRaises(OperationError) as caught:
                self.call("get_expense_details", expense_id=pk)
            self.assertEqual(caught.exception.code, "RECORD_NOT_AVAILABLE")
        self.assertEqual(self.call("list_expenses")["pagination"]["total"], 7)
        self.assertEqual(self.call("list_expense_history", search="Restricted")["results"], [])

    def test_active_branch_change_uses_new_scope_and_rejects_stale_context(self):
        Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
        with self.assertRaises(OperationError) as caught:
            self.call("get_expense_summary")
        self.assertEqual(caught.exception.code, "PERMISSION_DENIED")
        self.context = ToolContext(principal_for(self.admin), time.monotonic() + 30)
        self.assertEqual(self.call("get_expense_summary")["totals"]["total_afn"], "9999.00")

    def test_each_tool_reuses_corresponding_api_policy_and_independent_denial(self):
        with patch.object(ExpenseHistoryApiView, "permission_classes", [DenyRead]):
            self.assertEqual(self.call("list_expenses")["pagination"]["total"], 7)
            for tool in ("list_expense_history", "get_expense_history_summary"):
                with self.subTest(tool=tool), self.assertRaises(OperationError) as caught:
                    self.call(tool)
                self.assertEqual(caught.exception.code, "PERMISSION_DENIED")
        with patch.object(ExpenseDetailsView, "permission_classes", [DenyRead]):
            self.assertEqual(self.call("get_expense_summary")["totals"]["count"], 7)
            with self.assertRaises(OperationError):
                self.call("get_expense_details", expense_id=self.data["fuel"].pk)
        self.assertTrue(all(operation_views(t.id) for t in definitions()))

    def test_authorized_roles_and_waiter_denial_for_all_five_tools(self):
        for role, allowed in (("Admin", True), ("BranchAdmin", True), ("FinanceManager", True),
                              ("InventoryManager", True), ("OperationsManager", True), ("Waiter", False), ("Manager", False)):
            Staff.objects.filter(user=self.other).update(role=role)
            context = ToolContext(principal_for(self.other), time.monotonic() + 30)
            for t in expense_definitions():
                self.assertEqual(t.authorize(context, {}), allowed, (role, t.id))
        calls = [invocation(t.id, t.id, **({"expense_id": self.data["fuel"].pk} if t.id == "get_expense_details" else {})) for t in expense_definitions()]
        result = self.execute(calls, user=self.waiter)
        self.assertTrue(all(r["error"]["code"] == "PERMISSION_DENIED" and "data" not in r for r in result["results"]))

    def test_contractor_tools_require_each_related_source_policy(self):
        from contractors import views
        with patch.object(views.contractor_payment_list_create.cls, "permission_classes", [DenyRead]):
            self.assertEqual(self.call("list_service_invoices")["pagination"]["total"], 8)
            for tool_id, params in (
                ("get_service_contract_details", {"contract_id": self.contractor_data["agreements"]["active"].pk}),
                ("get_service_contracts_summary", {}), ("get_service_invoices_summary", {}), ("get_contractor_summary", {})):
                with self.subTest(tool_id=tool_id), self.assertRaises(OperationError) as caught:
                    self.call(tool_id, **params)
                self.assertEqual(caught.exception.code, "PERMISSION_DENIED")

    def test_finance_user_retrieves_expense_definitions_under_actual_policy(self):
        Staff.objects.filter(user=self.other).update(role="FinanceManager")
        principal = principal_for(self.other)
        self.assertEqual(self.documents.fetch(EXPENSES, principal)["document_id"], EXPENSES)
        with patch.object(ExpenseHistoryApiView, "permission_classes", [DenyRead]):
            with self.assertRaises(OperationError):
                self.documents.fetch(HISTORY, principal)

    def test_invalid_parameters_and_dates_cannot_override_scope(self):
        for params in ({"date_from": "2026-02-30"}, {"date_from": "2026-02-01", "date_to": "2026-01-01"},
                       {"currency": "EUR"}, {"status": "draft"}, {"category": "Fuel"}, {"contractor_id": 1},
                       {"branch_id": self.second_branch.pk}, {"page_size": 51}, {"page": 0}, {"sort": "restaurant__name"}):
            with self.subTest(params=params), self.assertRaises(OperationError) as caught:
                self.call("list_expenses", **params)
            self.assertEqual(caught.exception.code, "INVALID_PARAMETERS")
        for params in ({"expense_id": 1}, {"action": "paid"}, {"date_to": "2026-13-01"}):
            with self.assertRaises(OperationError):
                self.call("list_expense_history", **params)

    def test_mixed_modules_documents_partial_failures_and_no_business_writes(self):
        calls = [invocation("get_expense_summary", "cost"), invocation("get_contractor_summary", "contractors"),
                 invocation("get_expense_details", "restricted", expense_id=self.restricted[0].pk),
                 invocation("list_expense_history", "invalid", action="wrong")]
        with CaptureQueriesContext(connection) as captured:
            result = self.execute(calls, [EXPENSES, HISTORY, CONTRACTORS])
        self.assertEqual([r["ok"] for r in result["results"]], [True, True, True, True, True, False, False])
        self.assertEqual([r["error"]["code"] for r in result["results"] if not r["ok"]], ["RECORD_NOT_AVAILABLE", "INVALID_PARAMETERS"])
        self.assertFalse(any(q["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for q in captured))

    def test_permission_denial_in_mixed_batch_keeps_allowed_results(self):
        with patch.object(ExpenseHistoryApiView, "permission_classes", [DenyRead]):
            result = self.execute([invocation("get_expense_summary", "ok"), invocation("list_expense_history", "denied"),
                                   invocation("get_contractor_summary", "contractor")])
        self.assertEqual([r["ok"] for r in result["results"]], [True, False, True])
        self.assertEqual(result["results"][1]["error"]["code"], "PERMISSION_DENIED")

    def test_actual_service_selection_batch_evidence_followup_and_audit(self):
        def select(request):
            supplied = json.loads(request["messages"][1]["content"].split("\n", 1)[1])
            self.assertEqual(supplied, self.documents.map)
            self.assertEqual([t["name"] for t in request["tools"]], ["retrieve_business_context"])
            return batch([EXPENSES, HISTORY, CONTRACTORS], [invocation("get_expense_summary", "expense", date_from="2026-01-01", date_to="2026-01-31"),
                invocation("get_expense_history_summary", "history"), invocation("get_contractor_summary", "contractor")])
        def answer(request):
            result = json.loads(next(m["content"] for m in reversed(request["messages"]) if m["role"] == "tool"))
            self.assertEqual(result["results"][3]["data"]["output"]["totals"]["total_afn"], "1810.00")
            self.assertEqual(result["results"][4]["data"]["output"]["event_count"], 10)
            return final("January current expense records total AFN 1810.00. Ten audit events are not additional spending. Contractor totals are separate.", citations=["b1:0", "b1:1", "b1:2", "b1:3", "b1:4", "b1:5"])
        provider = ScriptedProvider([select, answer])
        service = ConversationService(provider=provider)
        response = service.reply(user=self.admin, question="Compare January ordinary expenses, audit events and contractor charges.")
        turn = TurnAudit.objects.get(pk=response["request_id"])
        self.assertEqual((turn.model_calls, turn.batches, turn.operations), (2, 1, 6))
        self.assertEqual(len(response["message"]["sources"]), 6)
        events = [read_blob(event.payload) for event in turn.events.filter(event_type="operation_finished").select_related("payload")]
        observed = {"mode": "mocked_model_real_pipeline", "model_requests": turn.model_calls, "batches": turn.batches,
                    "document_ids": [e["id"] for e in events if e["kind"] == "document"],
                    "tool_ids": [e["id"] for e in events if e["kind"] == "tool"], "outcome": "grounded_answer", "total_afn": "1810.00"}
        if os.environ.get("BUSINESS_ANALYST_EXPENSE_OUTPUT"):
            Path(os.environ["BUSINESS_ANALYST_EXPENSE_OUTPUT"]).write_text(json.dumps(observed, indent=2), encoding="utf-8")
        def followup_select(request):
            self.assertNotIn("January current expense records total AFN 1810.00", json.dumps(request["messages"]))
            return batch([EXPENSES], [invocation("get_expense_summary", "fresh")])
        service.provider = ScriptedProvider([followup_select, final("Current all-time expenses total AFN 1850.00.", citations=["b1:0", "b1:1"])])
        response2 = service.reply(user=self.admin, question="Now show all-time expenses.", conversation_id=response["conversation_id"])
        turn2 = TurnAudit.objects.get(pk=response2["request_id"])
        self.assertEqual((turn2.model_calls, turn2.batches), (2, 1))
        self.assertEqual(response2["message"]["sources"][1]["tool_id"], "get_expense_summary")
