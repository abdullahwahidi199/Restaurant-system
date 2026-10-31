from ai_assistant.audit_payloads import read_blob
import json
import time
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.db import connection
from django.test.utils import CaptureQueriesContext
from ai_assistant.testing import ScriptedProvider
from contractors.models import Contractor, ContractorInvoice, ContractorPayment, ServiceContract
from contractors.services import contractor_ledger, create_contractor_invoice, create_contractor_payment
from business_analyst.context import ToolContext, principal_for
from business_analyst.tools import contractor_definitions as definitions
from business_analyst.errors import OperationError
from business_analyst.executor import BatchExecutor
from business_analyst.config import Limits
from business_analyst.registry import production_registry
from business_analyst.service import ConversationService
from business_analyst.models import TurnAudit
from users.models import Staff
from .contractor_data import create_data
from .helpers import DatabaseFixture, batch, final, invocation


class ContractorToolTests(DatabaseFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.data = create_data(cls.restaurant, cls.branch, Staff.objects.get(user=cls.admin))
        cls.second_provider = Contractor.objects.create(restaurant=cls.restaurant, branch=cls.second_branch, name="Restricted Second Branch")
        cls.foreign_provider = Contractor.objects.create(restaurant=cls.foreign_restaurant, branch=cls.foreign_branch, name="Restricted Foreign")
        for provider in (cls.second_provider, cls.foreign_provider):
            invoice = create_contractor_invoice({"contractor": provider.pk, "invoice_date": "2026-01-01", "total_amount": "9999"}, provider.restaurant, provider.branch)
            create_contractor_payment({"contractor": provider.pk, "invoice": invoice.pk, "amount": "999", "date": "2026-01-01"}, provider.restaurant, provider.branch)

    def setUp(self):
        super().setUp()
        self.tools = production_registry(self.documents)
        self.context = ToolContext(principal_for(self.admin), time.monotonic() + 60)

    def call(self, name, **params):
        tool = self.tools.get(name)
        parameters = self.tools.validate_parameters(tool, params)
        value = tool.handler(self.context, parameters)
        self.tools.validate_output(tool, value)
        return value

    def test_exactly_thirteen_tools_registered_under_contractors_with_complete_map_contracts(self):
        expected = {definition.id for definition in definitions()}
        self.assertEqual(len(expected), 13)
        capabilities = self.documents.capability_map(self.context.principal, self.tools)
        advertised = next(domain["tools"] for domain in capabilities["domains"] if domain["id"] == "contractors")
        self.assertEqual({tool["id"] for tool in advertised}, expected)
        self.assertEqual(advertised, next(domain["tools"] for domain in self.documents.map["domains"] if domain["id"] == "contractors"))
        self.assertTrue(all(not domain["tools"] for domain in capabilities["domains"] if domain["id"] not in {"contractors", "finance"}))

    def test_contractor_directory_all_time_current_balances_and_inactive_profiles(self):
        result = self.call("list_contractors")
        self.assertEqual(result["pagination"]["total"], 3)
        values = {row["name"]: row for row in result["results"]}
        self.assertEqual((values["Alpha Services"]["total_invoiced"], values["Alpha Services"]["total_paid"], values["Alpha Services"]["outstanding_balance"]), ("215.00", "110.00", "105.00"))
        self.assertEqual(values["Beta Repairs"]["outstanding_balance"], "180.00")
        self.assertFalse(values["Beta Repairs"]["is_active"])
        self.assertEqual(values["Gamma Credit"]["outstanding_balance"], "0.00")

    def test_contractor_filters_pagination_sort_and_single_details(self):
        result = self.call("list_contractors", is_active=False, search="Beta")
        self.assertEqual([r["id"] for r in result["results"]], [self.data["beta"].pk])
        one = self.call("list_contractors", page_size=1, sort="-balance")
        two = self.call("list_contractors", page_size=1, page=2, sort="-balance")
        self.assertTrue(one["pagination"]["has_more"])
        self.assertNotEqual(one["results"][0]["id"], two["results"][0]["id"])
        detail = self.call("get_contractor_details", contractor_id=self.data["alpha"].pk)
        self.assertEqual(detail["contractor"]["contact_person"], "Synthetic Contact")
        self.assertEqual(detail["invoice_totals"]["recognized_charges"], "215.00")
        self.assertEqual(detail["contract_count"], 3)

    def test_combined_summary_reconciles_current_aggregate_provider_and_invoice_balances(self):
        result = self.call("get_contractor_summary")
        self.assertEqual(result["contractors"], {"count": 3, "active": 2, "inactive": 1})
        self.assertEqual(result["current"], {"total_invoiced": "425.00", "total_paid": "150.00", "outstanding_balance": "275.00",
            "sum_contractor_balances": "285.00", "positive_balance_contractors": 2, "recognized_invoice_balances": "285.00"})
        self.assertEqual(result["activity"]["agreement_value"], "2000.00")
        self.assertEqual(result["activity"]["net_activity"], "275.00")

    def test_period_activity_uses_separate_business_dates_and_keeps_balances_all_time(self):
        result = self.call("get_contractor_summary", date_from="2026-01-01", date_to="2026-01-31")
        figures = {key: value for key, value in result["activity"].items() if key not in {"invoice_statuses", "contract_statuses", "payment_methods"}}
        self.assertEqual(figures, {"contract_count": 4, "agreement_value": "1000.00",
            "invoice_count_including_drafts": 7, "recognized_invoice_count": 6, "draft_invoice_count": 1, "draft_face_value": "70.00",
            "recognized_charges": "385.00", "payment_count": 3, "recorded_payments": "70.00", "net_activity": "315.00"})
        self.assertEqual(result["current"]["outstanding_balance"], "275.00")
        self.assertIn("ignore date bounds", result["date_basis"])
        self.assertEqual(sum(row["count"] for row in result["activity"]["invoice_statuses"]), 7)
        self.assertNotIn("invoice_statuses", result["current"])

    def test_single_contractor_and_active_population_summary_scope(self):
        result = self.call("get_contractor_summary", contractor_id=self.data["alpha"].pk, date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual(result["activity"]["recognized_charges"], "175.00")
        self.assertEqual(result["activity"]["recorded_payments"], "30.00")
        self.assertEqual(result["current"]["outstanding_balance"], "105.00")
        inactive = self.call("get_contractor_summary", is_active=False)
        self.assertEqual(inactive["current"]["outstanding_balance"], "180.00")

    def test_contract_filters_start_dates_and_linked_invoice_totals_ignore_invoice_dates(self):
        result = self.call("list_service_contracts", date_from="2025-12-01", date_to="2025-12-01", status="completed")
        self.assertEqual(result["pagination"]["total"], 1)
        self.assertEqual(result["results"][0]["agreement_value"], "1000.00")
        self.assertEqual(result["results"][0]["current_linked_invoiced"], "150.00")
        detail = self.call("get_service_contract_details", contract_id=self.data["agreements"]["completed"].pk)
        self.assertEqual(detail["linked_invoice_totals"]["recognized_charges"], "150.00")
        self.assertEqual(detail["contract"]["status"], "completed")

    def test_contract_summary_all_statuses_and_filtered_cohort(self):
        result = self.call("get_service_contracts_summary")
        self.assertEqual(result["count"], 5)
        self.assertEqual(len(result["by_status"]), 5)
        self.assertEqual(result["agreement_value"], "2000.00")
        self.assertEqual(result["current_linked_invoices"]["recognized_charges"], "385.00")
        january = self.call("get_service_contracts_summary", date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual(january["current_linked_invoices"]["recognized_charges"], "235.00")
        self.assertEqual(january["agreement_value"], "1000.00")

    def test_invoice_search_does_not_multiply_totals_for_matching_lines(self):
        result = self.call("list_service_invoices", search="Synthetic", contractor_id=self.data["alpha"].pk)
        self.assertEqual(result["pagination"]["total"], 6)
        result = self.call("get_service_invoices_summary", search="Synthetic", contractor_id=self.data["alpha"].pk)
        self.assertEqual(result["totals"]["recognized_charges"], "215.00")

    def test_invoice_summary_date_cohort_drafts_and_all_date_capped_paid(self):
        result = self.call("get_service_invoices_summary", date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual(result["totals"], {"count": 7, "face_value_including_drafts": "455.00", "draft_count": 1,
            "draft_face_value": "70.00", "recognized_count": 6, "recognized_charges": "385.00", "current_capped_paid": "140.00",
            "current_remaining": "245.00", "open_count": 4, "all_date_linked_payments": "150.00"})
        drafts = self.call("get_service_invoices_summary", status="draft")
        self.assertEqual(drafts["totals"]["recognized_charges"], "0.00")
        self.assertEqual(drafts["totals"]["current_remaining"], "0.00")
        self.assertEqual(drafts["totals"]["draft_face_value"], "70.00")

    def test_invoice_detail_contains_complete_scalar_fields_and_bounded_relation_pages(self):
        result = self.call("get_service_invoice_details", invoice_id=self.data["january"].pk, page_size=1)
        self.assertEqual(result["invoice"]["amount_paid"], "50.00")
        self.assertEqual(result["lines"]["pagination"], {"page": 1, "page_size": 1, "total": 2, "has_more": True})
        self.assertEqual(result["payments"]["pagination"]["total"], 2)
        self.assertEqual(result["attachments"]["results"][0]["original_filename"], "proof.pdf")
        self.assertNotIn("file", result["attachments"]["results"][0])
        self.assertEqual(result["audit_changes"]["pagination"]["total"], 1)
        next_page = self.call("get_service_invoice_details", invoice_id=self.data["january"].pk, page_size=1, lines_page=2)
        self.assertNotEqual(result["lines"]["results"][0]["id"], next_page["lines"]["results"][0]["id"])

    def test_invoice_lines_individual_filters_parent_dates_and_precise_money(self):
        result = self.call("list_service_invoice_lines", invoice_id=self.data["january"].pk, service_type="maintenance")
        self.assertEqual(result["pagination"]["total"], 1)
        self.assertEqual((result["results"][0]["quantity"], result["results"][0]["unit_price"], result["results"][0]["total_price"]), ("2.00", "40.00", "80.00"))
        all_time = self.call("list_service_invoice_lines", status="draft")
        self.assertFalse(all_time["results"][0]["recognized"])
        dated = self.call("list_service_invoice_lines", date_from="2025-12-10", date_to="2025-12-10")
        self.assertEqual(dated["pagination"]["total"], 1)

    def test_payment_listing_and_summary_use_payment_dates_not_invoice_dates(self):
        result = self.call("list_contractor_payments", date_from="2026-02-01", date_to="2026-02-28")
        self.assertEqual(result["pagination"]["total"], 2)
        summary = self.call("get_contractor_payments_summary", date_from="2026-02-01", date_to="2026-02-28")
        self.assertEqual(summary["recorded_payments"], "70.00")
        self.assertEqual(summary["contractor_count"], 1)
        self.assertEqual(self.call("get_contractor_payments_summary")["recorded_payments"], "150.00")
        future = self.call("get_service_invoice_details", invoice_id=self.data["future"].pk)
        self.assertEqual(future["invoice"]["remaining_balance"], "15.00")

    def test_payment_filters_one_invoice_method_status_and_contract(self):
        result = self.call("get_contractor_payments_summary", contractor_id=self.data["alpha"].pk, invoice_id=self.data["january"].pk, payment_method="cash", invoice_status="partially_paid")
        self.assertEqual((result["count"], result["recorded_payments"]), (1, "30.00"))
        result = self.call("list_contractor_payments", contract_id=self.data["agreements"]["completed"].pk)
        self.assertEqual(result["pagination"]["total"], 3)

    def test_ledger_matches_existing_business_service_without_float_serialization(self):
        result = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, page_size=50)
        expected = contractor_ledger(self.data["alpha"])
        self.assertEqual([(r["type"], r["id"]) for r in result["results"]], [(r["type"], r["id"]) for r in expected["entries"]])
        self.assertEqual([r["running_balance"] for r in result["results"]], [f"{r['running_balance']:.2f}" for r in expected["entries"]])
        self.assertEqual(result["current"]["outstanding_balance"], "105.00")
        credit = self.call("get_contractor_ledger", contractor_id=self.data["gamma"].pk)
        self.assertEqual(credit["results"][-1]["running_balance"], "-10.00")
        self.assertEqual(credit["current"]["outstanding_balance"], "0.00")

    def test_ledger_period_opening_and_pagination_preserve_running_balances(self):
        result = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, date_from="2026-01-01", date_to="2026-01-31", page_size=50)
        self.assertEqual(result["range"], {"invoice_count": 4, "payment_count": 1,
            "opening_reconstructed": "40.00", "invoice_debits": "175.00", "payment_credits": "30.00", "closing_reconstructed": "185.00"})
        pages = [self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, date_from="2026-01-01", date_to="2026-01-31", page_size=1, page=n)["results"][0] for n in range(1, len(result["results"]) + 1)]
        self.assertEqual(pages, result["results"])
        reverse = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, order="descending", page_size=50)
        forward = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, page_size=50)
        self.assertEqual(reverse["results"], list(reversed(forward["results"])))

    def test_all_thirteen_tools_execute_in_read_only_batch_without_business_writes(self):
        params = {"get_contractor_details": {"contractor_id": self.data["alpha"].pk},
                  "get_contractor_ledger": {"contractor_id": self.data["alpha"].pk},
                  "get_service_contract_details": {"contract_id": self.data["agreements"]["active"].pk},
                  "get_service_invoice_details": {"invoice_id": self.data["january"].pk}}
        calls = [invocation(tool.id, "call" + str(index), **params.get(tool.id, {})) for index, tool in enumerate(definitions())]
        with CaptureQueriesContext(connection) as captured:
            result = BatchExecutor(self.documents, self.tools, Limits()).execute(
                {"document_ids": ["admin_contractors_shared_financial_meaning"], "tools": calls},
                user=self.admin, binding=self.context.principal.binding, deadline=time.monotonic() + 60)
        self.assertTrue(all(row["ok"] for row in result["results"]), result)
        self.assertEqual(len(result["results"]), 14)
        mutations = [query["sql"] for query in captured if query["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE"))]
        self.assertEqual(mutations, [])

    @patch("business_analyst.tools.authorize_tool", return_value=True)
    def test_list_query_count_is_bounded_as_record_count_grows(self, _authorize):
        with CaptureQueriesContext(connection) as captured:
            self.call("list_service_invoices", page_size=50)
        self.assertLessEqual(len(captured), 2)
        with CaptureQueriesContext(connection) as captured:
            self.call("list_contractors", page_size=50)
        self.assertLessEqual(len(captured), 2)

    def test_record_ids_cannot_cross_branch_tenant_or_probe_nonexistent_records(self):
        for provider_id in (self.second_provider.pk, self.foreign_provider.pk, 999999):
            with self.subTest(provider=provider_id), self.assertRaises(OperationError) as caught:
                self.call("get_contractor_details", contractor_id=provider_id)
            self.assertEqual(caught.exception.code, "RECORD_NOT_AVAILABLE")
        self.assertEqual(self.call("list_contractors")["pagination"]["total"], 3)

    def test_operation_roles_match_existing_contractor_permissions(self):
        for role, allowed in (("Admin", True), ("BranchAdmin", True), ("FinanceManager", True), ("InventoryManager", True), ("OperationsManager", True), ("Waiter", False), ("Manager", False), ("Cashier", False)):
            Staff.objects.filter(user=self.admin).update(role=role)
            principal = principal_for(self.admin)
            context = ToolContext(principal, time.monotonic() + 30)
            tool = self.tools.get("get_contractor_summary")
            self.assertEqual(tool.authorize(context, {}), allowed)
            if allowed:
                value = tool.handler(context, {})
                self.assertEqual(value["contractors"]["count"], 3)
            else:
                with self.assertRaises(OperationError) as caught:
                    tool.handler(context, {})
                self.assertEqual(caught.exception.code, "PERMISSION_DENIED")

    def test_bad_parameters_dates_unknown_sort_scope_overrides_and_mismatched_links_fail(self):
        for params in ({"date_from": "2026-02-30"}, {"date_from": "2026-02-01", "date_to": "2026-01-01"},
                       {"branch_id": self.second_branch.pk}, {"page_size": 1000}, {"sort": "contractor__restaurant"}, {"status": "invalid"}):
            with self.subTest(params=params), self.assertRaises(OperationError) as caught:
                self.call("list_service_invoices", **params)
            self.assertEqual(caught.exception.code, "INVALID_PARAMETERS")
        with self.assertRaises(OperationError):
            self.call("list_service_invoices", contractor_id=self.data["beta"].pk, contract_id=self.data["agreements"]["active"].pk)

    def test_empty_results_are_valid_zero_summaries_not_default_month_queries(self):
        for name in ("get_contractor_summary", "get_service_contracts_summary", "get_service_invoices_summary", "get_contractor_payments_summary"):
            with self.subTest(tool=name):
                result = self.call(name, date_from="2000-01-01", date_to="2000-01-31")
                if name == "get_contractor_summary":
                    self.assertEqual(result["activity"]["recognized_charges"], "0.00")
                    self.assertEqual(result["current"]["outstanding_balance"], "275.00")
                elif name == "get_service_invoices_summary":
                    self.assertEqual(result["totals"]["count"], 0)
                else:
                    self.assertEqual(result["count"], 0)

    def test_model_selects_summary_and_document_in_two_calls_and_audits_actual_data(self):
        def select(request):
            supplied = json.loads(request["messages"][1]["content"].split("\n", 1)[1])
            tools = {tool["id"]: tool for domain in supplied["domains"] for tool in domain["tools"]}
            self.assertIn("date_from", tools["get_contractor_summary"]["parameters"]["properties"])
            return batch(["admin_contractors_shared_financial_meaning"], [invocation("get_contractor_summary", "summary", date_from="2026-01-01", date_to="2026-01-31")])
        def answer(request):
            retrieved = json.loads(next(message["content"] for message in reversed(request["messages"]) if message["role"] == "tool"))
            value = retrieved["results"][1]["data"]["output"]
            self.assertEqual((value["activity"]["recognized_charges"], value["activity"]["recorded_payments"]), ("385.00", "70.00"))
            return final("January charges are AFN 385.00 and recorded payments AFN 70.00. Current net debt is AFN 275.00, not a January closing snapshot.", citations=["b1:0", "b1:1"])
        provider = ScriptedProvider([select, answer])
        response = ConversationService(provider=provider).reply(user=self.admin, question="Compare January contractor costs, payments and current debt.")
        audit = TurnAudit.objects.get(pk=response["request_id"])
        self.assertEqual((audit.model_calls, audit.batches, audit.operations), (2, 1, 2))
        self.assertEqual([source["kind"] for source in response["message"]["sources"]], ["document", "tool"])

    def test_same_date_ledger_orders_invoices_before_payments_and_pages_exactly(self):
        create_contractor_payment({"contractor": self.data["alpha"].pk, "invoice": self.data["january"].pk,
            "amount": "5", "date": "2026-01-02"}, self.restaurant, self.branch)
        result = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, date_from="2026-01-02", date_to="2026-01-02")
        self.assertEqual([row["type"] for row in result["results"]], ["invoice", "payment"])
        self.assertEqual([row["running_balance"] for row in result["results"]], ["140.00", "135.00"])
        page_two = self.call("get_contractor_ledger", contractor_id=self.data["alpha"].pk, date_from="2026-01-02", date_to="2026-01-02", page_size=1, page=2)
        self.assertEqual(page_two["results"][0], result["results"][1])

    def test_inconsistent_foreign_relationships_never_leak_details_lines_or_financial_values(self):
        corrupt = ContractorInvoice.objects.create(restaurant=self.restaurant, branch=self.branch,
            contractor=self.foreign_provider, total_amount="900000", status="approved")
        linked_foreign = ContractorInvoice.objects.create(restaurant=self.restaurant, branch=self.branch,
            contractor=self.data["alpha"], contract=ServiceContract.objects.create(restaurant=self.foreign_restaurant,
                branch=self.foreign_branch, contractor=self.foreign_provider, title="Restricted", start_date="2026-01-01"),
            total_amount="800000", status="approved")
        for invoice in (corrupt, linked_foreign):
            with self.assertRaises(OperationError) as caught:
                self.call("get_service_invoice_details", invoice_id=invoice.pk)
            self.assertEqual(caught.exception.code, "RECORD_NOT_AVAILABLE")
        self.assertEqual(self.call("get_contractor_summary")["current"]["outstanding_balance"], "275.00")

    def test_active_branch_switch_changes_tools_scope_and_rejects_old_ids(self):
        Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
        current = principal_for(self.admin)
        output = BatchExecutor(self.documents, self.tools, Limits()).execute({"document_ids": [], "tools": [
            invocation("get_contractor_summary", "summary"), invocation("get_contractor_details", "wrong", contractor_id=self.data["alpha"].pk)]},
            user=self.admin, binding=current.binding, deadline=time.monotonic() + 30)
        self.assertTrue(output["results"][0]["ok"])
        self.assertEqual(output["results"][0]["data"]["output"]["current"]["outstanding_balance"], "9000.00")
        self.assertEqual(output["results"][1]["error"]["code"], "RECORD_NOT_AVAILABLE")

    def test_mixed_unauthorized_batch_retains_authorized_document_and_tool_results(self):
        provider = ScriptedProvider([
            batch(["admin_contractors_shared_financial_meaning"], [
                invocation("get_contractor_summary", "valid"),
                invocation("get_contractor_details", "foreign", contractor_id=self.foreign_provider.pk)]),
            final("Current net debt is AFN 275.00. The other requested account is unavailable in this scope.", citations=["b1:0", "b1:1"])])
        response = ConversationService(provider=provider).reply(user=self.admin, question="Show permitted totals and the other account.")
        audit = TurnAudit.objects.get(pk=response["request_id"])
        operations = [read_blob(event.payload) for event in audit.events.filter(event_type="operation_finished").select_related("payload")]
        self.assertEqual([operation["ok"] for operation in operations], [True, True, False])
        self.assertEqual(operations[-1]["code"], "RECORD_NOT_AVAILABLE")
        self.assertEqual((audit.model_calls, audit.batches), (2, 1))

    def test_waiter_gets_permission_denied_for_every_contractor_tool_without_record_data(self):
        waiter = principal_for(self.waiter)
        calls = [invocation(tool.id, "denied" + str(index), **({"contractor_id": self.data["alpha"].pk} if tool.id in {"get_contractor_details", "get_contractor_ledger"}
                else {"contract_id": self.data["agreements"]["active"].pk} if tool.id == "get_service_contract_details"
                else {"invoice_id": self.data["january"].pk} if tool.id == "get_service_invoice_details" else {})) for index, tool in enumerate(definitions())]
        result = BatchExecutor(self.documents, self.tools, Limits()).execute({"document_ids": [], "tools": calls},
            user=self.waiter, binding=waiter.binding, deadline=time.monotonic() + 30)
        self.assertTrue(all(row["error"]["code"] == "PERMISSION_DENIED" and "data" not in row for row in result["results"]))
        self.assertNotIn("Alpha", json.dumps(result))

    def test_finance_role_can_read_associated_contractor_definitions_but_not_other_admin_docs(self):
        Staff.objects.filter(user=self.other).update(role="FinanceManager")
        finance = principal_for(self.other)
        result = self.documents.fetch("admin_contractors_shared_financial_meaning", finance)
        self.assertIn("Financial distinction", result["content"])
        with self.assertRaises(OperationError):
            self.documents.fetch("admin_dashboard_sales_meaning", finance)

    def test_summary_service_type_groups_are_bounded_and_other_total_reconciles(self):
        invoice = create_contractor_invoice({"contractor": self.data["alpha"].pk, "lines": [
            {"service_type": f"Type {index:02}", "description": "Synthetic", "quantity": "1", "unit_price": "1.01"} for index in range(12)]},
            self.restaurant, self.branch)
        result = self.call("get_service_invoices_summary", search=invoice.invoice_number or "Synthetic")
        groups = result["service_types"]
        self.assertEqual(len(groups["groups"]), 10)
        self.assertGreater(groups["total_groups"], 10)
        self.assertEqual(sum((Decimal(group["recognized_charges"]) for group in groups["groups"]), Decimal(groups["other_charges"])), Decimal(result["totals"]["recognized_charges"]))

    def test_tool_followup_retrieves_current_values_and_withholds_old_live_answer(self):
        def response(request):
            value = json.loads(next(m["content"] for m in reversed(request["messages"]) if m["role"] == "tool"))["results"][0]["data"]["output"]
            return final("LIVE_TOTAL " + value["current"]["total_invoiced"], citations=["b1:0"])
        provider = ScriptedProvider([batch([], [invocation("get_contractor_summary", "first")]), response,
                                     batch([], [invocation("get_contractor_summary", "second")]), response])
        service = ConversationService(provider=provider)
        first = service.reply(user=self.admin, question="Show contractor charges.")
        create_contractor_invoice({"contractor": self.data["alpha"].pk, "total_amount": "0.01"}, self.restaurant, self.branch)
        second = service.reply(user=self.admin, question="Refresh them.", conversation_id=first["conversation_id"])
        self.assertIn("425.01", second["message"]["content"])
        self.assertNotIn("LIVE_TOTAL 425.00", json.dumps(provider.requests[2]["messages"]))

    def test_reads_stored_line_rounding_and_serializes_decimal_amounts_without_floats(self):
        invoice = create_contractor_invoice({"contractor": self.data["alpha"].pk, "lines": [
            {"service_type": "Precision", "description": "Fractional service", "quantity": "1.23", "unit_price": "2.15"},
            {"service_type": "Precision", "description": "Small charge", "quantity": "1", "unit_price": "0.01"}]}, self.restaurant, self.branch)
        result = self.call("get_service_invoice_details", invoice_id=invoice.pk)
        self.assertEqual(result["invoice"]["total_amount"], "2.65")
        self.assertEqual([line["total_price"] for line in result["lines"]["results"]], ["2.64", "0.01"])
        self.assertIsInstance(result["invoice"]["total_amount"], str)

    def test_oversized_actual_record_fails_without_truncating_or_blocking_summary(self):
        Contractor.objects.filter(pk=self.data["alpha"].pk).update(notes="x" * 41000)
        result = BatchExecutor(self.documents, self.tools, Limits()).execute({"document_ids": [], "tools": [
            invocation("get_contractor_details", "large", contractor_id=self.data["alpha"].pk),
            invocation("get_contractor_summary", "summary")]}, user=self.admin,
            binding=self.context.principal.binding, deadline=time.monotonic() + 30)
        self.assertEqual(result["results"][0]["error"]["code"], "OUTPUT_TOO_LARGE")
        self.assertNotIn("data", result["results"][0])
        self.assertTrue(result["results"][1]["ok"])

    def test_backdated_ledger_credit_gives_negative_opening_without_flooring(self):
        payment = self.data["gamma"].payments.get()
        payment.date = date(2025, 12, 1)
        payment.save()
        result = self.call("get_contractor_ledger", contractor_id=self.data["gamma"].pk, date_from="2026-01-01", date_to="2026-01-31")
        self.assertEqual(result["range"]["opening_reconstructed"], "-20.00")
        self.assertEqual(result["range"]["closing_reconstructed"], "-10.00")
        self.assertEqual(result["results"][0]["running_balance"], "-10.00")
        self.assertEqual(result["current"]["outstanding_balance"], "0.00")

    def test_model_gets_trusted_business_date_without_implicit_month_filter(self):
        provider = ScriptedProvider([batch([], [invocation("get_contractor_summary", "all")]),
                                     final("All-time recognized charges are AFN 425.00.", citations=["b1:0"])])
        with patch("business_analyst.engine.timezone.localdate", return_value=date(2026, 10, 31)):
            ConversationService(provider=provider).reply(user=self.admin, question="Show all-time contractor charges.")
        self.assertIn('"today":"2026-10-31"', provider.requests[0]["messages"][0]["content"])
        self.assertIn('"timezone":"Asia/Kabul"', provider.requests[0]["messages"][0]["content"])
        self.assertEqual(json.loads(provider.requests[1]["messages"][-1]["content"])["results"][0]["data"]["output"]["period"], {"from": None, "to": None})
