"""Real Django queries and authorization; provider tests are explicitly scripted."""
import json
import time
from dataclasses import replace
from datetime import datetime
from decimal import Decimal
from unittest.mock import patch
from zoneinfo import ZoneInfo

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
from business_analyst.tools import inventory_procurement_definitions
from inventory.models import (
    Ingredient, IngredientStock, MenuItemIngredient, PurchaseInvoice,
    PurchaseInvoiceAttachment, PurchaseInvoiceLine, StockMovement, StockTransfer,
    StockTransferLog, Supplier, SupplierPayment,
)
from inventory.selectors import InventoryQueries, InventoryQueryError
from inventory.services import create_purchase_invoice, create_supplier_payment, supplier_ledger
from menu.models import Category, MenuItem
from restaurants.models import Branch
from users.models import Staff
from .helpers import DatabaseFixture, batch, final, invocation


class DenyRead(BasePermission):
    def has_permission(self, request, view):
        return False


class InventoryProcurementFixture(DatabaseFixture):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.staff = Staff.objects.get(user=cls.admin)
        def ingredient(name, unit="kg", quantity="10.125", threshold="1", cost="20.55", **kw):
            return Ingredient.objects.create(restaurant=cls.restaurant, branch=cls.branch,
                name=name, unit=unit, quantity_available=quantity, minimum_threshold=threshold, cost_per_unit=cost, **kw)
        cls.chicken = ingredient("Chicken")
        cls.salt = ingredient("Salt", quantity="0.500")
        cls.oil = ingredient("Oil", unit="l", quantity="0")
        cls.sugar = ingredient("Sugar", unit="g", quantity="1000", cost="0.12", is_active=False)
        cls.negative = ingredient("Legacy negative", quantity="-1", threshold="0")
        cls.shared = Ingredient.objects.create(restaurant=cls.restaurant, name="Shared Rice", unit="kg",
            quantity_available="999", minimum_threshold="99", cost_per_unit="99")
        cls.missing = Ingredient.objects.create(restaurant=cls.restaurant, name="Missing shared stock", unit="pcs",
            quantity_available="999", cost_per_unit="99")
        cls.stock = IngredientStock.objects.create(restaurant=cls.restaurant, branch=cls.branch, ingredient=cls.shared,
            quantity_available="3.125", minimum_threshold="4", cost_per_unit="2.45")
        IngredientStock.objects.create(restaurant=cls.restaurant, branch=cls.second_branch, ingredient=cls.shared,
            quantity_available="123", minimum_threshold="1", cost_per_unit="5")
        cls.second_ingredient = Ingredient.objects.create(restaurant=cls.restaurant, branch=cls.second_branch, name="Chicken",
            unit="kg", quantity_available="999", cost_per_unit="99")
        cls.foreign_ingredient = Ingredient.objects.create(restaurant=cls.foreign_restaurant, branch=cls.foreign_branch,
            name="Forbidden ingredient", unit="kg", quantity_available="999", cost_per_unit="99")
        category = Category.objects.create(restaurant=cls.restaurant, branch=cls.branch, name="Meals")
        cls.menu_item = MenuItem.objects.create(restaurant=cls.restaurant, branch=cls.branch, name="Chicken dish", price="100", category=category)
        cls.recipe = MenuItemIngredient.objects.create(menu_item=cls.menu_item, ingredient=cls.chicken, quantity_required="0.125")
        cls.ahmad = Supplier.objects.create(restaurant=cls.restaurant, branch=cls.branch, name="Ahmad",
            phone="0700000000", contact_person="Contact", email="ahmad@example.invalid")
        cls.beta = Supplier.objects.create(restaurant=cls.restaurant, branch=cls.branch, name="Beta")
        cls.second_supplier = Supplier.objects.create(restaurant=cls.restaurant, branch=cls.second_branch, name="Restricted branch")
        cls.foreign_supplier = Supplier.objects.create(restaurant=cls.foreign_restaurant, branch=cls.foreign_branch, name="Forbidden supplier")
        def invoice(supplier, number, day, lines, **kw):
            return create_purchase_invoice({"supplier": supplier.pk if supplier else None, "invoice_number": number,
                "purchase_date": day, "lines": [{"ingredient": i.pk, "quantity": qty, "unit_price": price} for i, qty, price in lines], **kw},
                cls.restaurant, cls.branch, cls.staff)
        cls.august = invoice(cls.ahmad, "AUG-1", "2026-08-10", [(cls.chicken, "2", "10.1234")])
        cls.september = invoice(cls.ahmad, "SEP-1", "2026-09-10", [(cls.chicken, "3", "12.3456"), (cls.salt, "2", "5")])
        cls.draft = invoice(cls.ahmad, "DRAFT-1", "2026-09-11", [(cls.chicken, "5", "10")], status="draft")
        cls.cash = invoice(None, "CASH-1", "2026-09-15", [(cls.chicken, "1", "7")], amount_paid="7")
        cls.beta_invoice = invoice(cls.beta, "BETA-1", "2026-09-12", [(cls.salt, "5", "10")])
        Supplier.objects.filter(pk=cls.beta.pk).update(is_active=False)
        cls.p1 = create_supplier_payment({"supplier": cls.ahmad.pk, "purchase_invoice": cls.august.pk,
            "date": "2026-09-01", "amount": "10", "payment_method": "cash"}, cls.restaurant, cls.branch, cls.staff)
        cls.p2 = create_supplier_payment({"supplier": cls.ahmad.pk, "purchase_invoice": cls.september.pk,
            "date": "2026-10-01", "amount": "20", "payment_method": "bank_transfer"}, cls.restaurant, cls.branch, cls.staff)
        cls.foreign_invoice = PurchaseInvoice.objects.create(restaurant=cls.foreign_restaurant, branch=cls.foreign_branch,
            supplier=cls.foreign_supplier, invoice_number="FORBIDDEN", total_amount="99999")
        cls.second_invoice = PurchaseInvoice.objects.create(restaurant=cls.restaurant, branch=cls.second_branch,
            supplier=cls.second_supplier, invoice_number="RESTRICTED", total_amount="99999")
        # Service posting intentionally updates stock/cost; put current position
        # at a different value to test historical prices versus current valuation.
        Ingredient.objects.filter(pk=cls.chicken.pk).update(quantity_available="10.125", cost_per_unit="20.55")
        cls.movement_rows = {}
        for kind, quantity in (("order", "-4"), ("production", "-3"), ("production_adjustment", "1"),
                               ("waste", "-2"), ("waste", "0.5"), ("adjustment", "0.125"),
                               ("transfer_out", "-1"), ("transfer_in", "1")):
            row = StockMovement.objects.create(restaurant=cls.restaurant, branch=cls.branch, ingredient=cls.chicken,
                change_quantity=quantity, movement_type=kind, created_by=cls.staff)
            StockMovement.objects.filter(pk=row.pk).update(created_at=datetime(2026, 9, 15, 10, tzinfo=ZoneInfo("Asia/Kabul")))
            cls.movement_rows[kind] = row
        StockMovement.objects.create(restaurant=cls.restaurant, branch=cls.branch, ingredient=cls.sugar,
            change_quantity="-100", movement_type="order")
        cls.foreign_movement = StockMovement.objects.create(restaurant=cls.foreign_restaurant, branch=cls.foreign_branch,
            ingredient=cls.foreign_ingredient, change_quantity="999", movement_type="purchase")
        cls.pending = StockTransfer.objects.create(restaurant=cls.restaurant, ingredient=cls.chicken, from_branch=cls.branch,
            to_branch=cls.second_branch, quantity="2", created_by=cls.staff)
        cls.approved = StockTransfer.objects.create(restaurant=cls.restaurant, ingredient=cls.chicken, from_branch=cls.branch,
            to_branch=cls.second_branch, quantity="3", status="approved", approved_by=cls.staff,
            approved_at=datetime(2026, 10, 6, 10, tzinfo=ZoneInfo("Asia/Kabul")))
        for row in (cls.pending, cls.approved):
            StockTransfer.objects.filter(pk=row.pk).update(created_at=datetime(2026, 10, 5, 10, tzinfo=ZoneInfo("Asia/Kabul")))
        cls.log = StockTransferLog.objects.create(transfer=cls.pending, action="requested", message="Request", actor=cls.staff)
        cls.foreign_transfer = StockTransfer.objects.create(restaurant=cls.foreign_restaurant, ingredient=cls.foreign_ingredient,
            from_branch=cls.foreign_branch, to_branch=Branch.objects.create(restaurant=cls.foreign_restaurant, name="Foreign Two", code="F-2"), quantity="1")
        cls.attachment = PurchaseInvoiceAttachment.objects.create(restaurant=cls.restaurant, branch=cls.branch,
            invoice=cls.september, file="private/proof.pdf", original_filename="proof.pdf", file_size=123,
            content_type="application/pdf", uploaded_by=cls.staff)
        cls.finance = cls.staff_user("inv-finance", "FinanceManager", "0711111101")
        cls.kitchen = cls.staff_user("inv-kitchen", "Kitchen_manager", "0711111102")
        cls.inventory = cls.staff_user("inv-inventory", "InventoryManager", "0711111103")
        cls.operations = cls.staff_user("inv-operations", "OperationsManager", "0711111104")

    def setUp(self):
        super().setUp()
        self.tools = production_registry(self.documents)
        self.context = ToolContext(principal_for(self.admin), time.monotonic() + 600)

    def call(self, name, user=None, **params):
        tool = self.tools.get(name)
        p = self.tools.validate_parameters(tool, params)
        context = ToolContext(principal_for(user), time.monotonic() + 60) if user else self.context
        result = tool.handler(context, p)
        self.tools.validate_output(tool, result)
        return result

    def execute(self, calls, user=None, documents=()):
        user = user or self.admin
        return BatchExecutor(self.documents, self.tools, Limits()).execute(
            {"document_ids": list(documents), "tools": calls}, user=user, binding=principal_for(user).binding,
            deadline=time.monotonic() + 60)

    def all_calls(self):
        overrides = {"get_ingredient_details": {"ingredient_name": "Chicken"},
            "get_stock_movement_details": {"movement_id": self.movement_rows["waste"].pk},
            "get_stock_transfer_details": {"transfer_id": self.pending.pk},
            "list_stock_transfer_logs": {"transfer_id": self.pending.pk},
            "get_supplier_details": {"supplier_name": "Ahmad"},
            "get_purchase_invoice_details": {"invoice_number": "SEP-1"},
            "get_supplier_ledger": {"supplier_id": self.ahmad.pk},
            "get_ingredient_summary": {"ingredient_id": self.chicken.pk},
            "get_supplier_summary": {"supplier_id": self.ahmad.pk}}
        return [invocation(t.id, f"tool_{i}", **overrides.get(t.id, {})) for i, t in enumerate(inventory_procurement_definitions())]


class InventoryProcurementToolTests(InventoryProcurementFixture):
    def test_all_thirty_contracts_domains_map_and_read_only_batches(self):
        definitions = inventory_procurement_definitions()
        self.assertEqual(len(definitions), 30)
        self.assertEqual(sum(t.domain == "inventory" for t in definitions), 18)
        self.assertTrue(all(t.read_only for t in definitions))
        for domain in ("inventory", "procurement"):
            self.assertEqual(self.tools.capabilities(domain), next(d["tools"] for d in self.documents.map["domains"] if d["id"] == domain))
        self.assertLess(len(json_bytes(self.documents.map)), 240000)
        for calls in (self.all_calls()[:15], self.all_calls()[15:]):
            with CaptureQueriesContext(connection) as captured:
                result = self.execute(calls)
            self.assertEqual([(r["id"], r.get("error")) for r in result["results"] if not r["ok"]], [])
            self.assertFalse(any(q["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for q in captured))

    def test_current_branch_stock_shared_missing_and_precise_value(self):
        rows = self.call("list_ingredients")["results"]
        by_name = {r["name"]: r for r in rows}
        self.assertEqual(len(rows), 7)
        shared = by_name["Shared Rice"]
        self.assertEqual(Decimal(shared["available_quantity"]), Decimal("3.125"))
        self.assertEqual(Decimal(shared["current_stock_value"]), Decimal("7.65625"))
        self.assertIsNone(by_name["Missing shared stock"]["available_quantity"])
        self.assertEqual(by_name["Missing shared stock"]["stock_status"], "unknown")
        self.assertEqual(Decimal(by_name["Chicken"]["current_stock_value"]), Decimal("208.06875"))
        self.assertEqual(IngredientStock.objects.filter(ingredient=self.missing).count(), 0)
        summary = self.call("get_inventory_summary")
        self.assertEqual(summary["current"]["ingredient_count"], 7)
        self.assertEqual(summary["current"]["unknown_stock"], 1)
        self.assertFalse(summary["current"]["valuation_complete"])
        self.assertIn("INCLUDING INACTIVE", summary["current"]["valuation_scope"])
        self.assertEqual(sum(g["count"] for g in summary["by_unit_status"]), 7)

    def test_stock_branch_filters_multi_branch_and_forbidden_branches(self):
        out = self.call("list_ingredient_stocks", ingredient_id=self.shared.pk, stock_branch_ids=[self.branch.pk, self.second_branch.pk])
        self.assertEqual(out["pagination"]["total"], 2)
        self.assertEqual({Decimal(r["available_quantity"]) for r in out["results"]}, {Decimal("3.125"), Decimal("123")})
        for user, ids in ((self.branch_admin, [self.second_branch.pk]), (self.finance, [self.second_branch.pk]), (self.admin, [self.foreign_branch.pk])):
            with self.subTest(user=user.username), self.assertRaises(OperationError) as error:
                self.call("list_ingredient_stocks", user=user, stock_branch_ids=ids)
            self.assertEqual(error.exception.code, "PERMISSION_DENIED")

    def test_threshold_zero_negative_and_inactive_filters(self):
        Ingredient.objects.filter(pk=self.salt.pk).update(quantity_available="1", minimum_threshold="1")
        Ingredient.objects.filter(pk=self.oil.pk).update(minimum_threshold="-1")
        low = self.call("list_low_stock_ingredients", low_stock=True)["results"]
        self.assertEqual({r["name"] for r in low}, {"Salt", "Shared Rice"})
        self.assertEqual(self.call("list_low_stock_ingredients", out_of_stock=True)["results"][0]["id"], self.oil.pk)
        self.assertEqual(self.call("list_ingredients", is_active=False)["results"][0]["id"], self.sugar.pk)
        summary = self.call("get_low_stock_summary")["current"]
        self.assertEqual((summary["low_stock"], summary["out_of_stock"], summary["negative"]), (2, 1, 1))

    def test_lookup_names_ambiguity_pagination_stable_sort_and_empty(self):
        self.assertEqual(self.call("get_ingredient_details", ingredient_name="chick")["ingredient"]["id"], self.chicken.pk)
        Ingredient.objects.create(restaurant=self.restaurant, branch=self.branch, name="Chicken thigh", unit="kg", quantity_available=1, cost_per_unit=1)
        for name, kwargs in (("get_ingredient_details", {"ingredient_name": "Chicken"}), ("get_ingredient_summary", {"ingredient_name": "Chicken"})):
            with self.assertRaises(OperationError) as e:
                self.call(name, **kwargs)
            self.assertEqual(e.exception.code, "AMBIGUOUS_RECORD")
        Supplier.objects.create(restaurant=self.restaurant, branch=self.branch, name="Ahmad Second")
        with self.assertRaises(OperationError) as e:
            self.call("get_supplier_details", supplier_name="Ahmad")
        self.assertEqual(e.exception.code, "AMBIGUOUS_RECORD")
        self.assertEqual(self.call("get_supplier_details", supplier_id=self.ahmad.pk)["supplier"]["name"], "Ahmad")
        PurchaseInvoice.objects.create(restaurant=self.restaurant, branch=self.branch, invoice_number="SEP-1 COPY")
        with self.assertRaises(OperationError) as e:
            self.call("get_purchase_invoice_details", invoice_number="SEP-1")
        self.assertEqual(e.exception.code, "AMBIGUOUS_RECORD")
        first = self.call("list_ingredients", page_size=1, sort="-name")
        second = self.call("list_ingredients", page_size=1, page=2, sort="-name")
        self.assertEqual(first["pagination"]["total"], 8)
        self.assertTrue(first["pagination"]["has_more"])
        self.assertGreater(first["results"][0]["name"], second["results"][0]["name"])
        self.assertEqual(self.call("list_ingredients", ingredient_name="absent")["pagination"]["total"], 0)

    def test_recipe_relationships_and_current_profile(self):
        result = self.call("list_ingredient_recipe_usages", ingredient_name="chick", menu_item_name="dish")
        self.assertEqual(result["pagination"]["total"], 1)
        self.assertEqual(result["results"][0]["quantity_required"], "0.125")
        self.assertEqual(self.call("get_ingredient_details", ingredient_id=self.chicken.pk)["recipe_usage_count"], 1)

    def test_purchase_history_prices_status_supplierless_and_related_filters(self):
        history = self.call("list_ingredient_purchase_history", ingredient_name="Chicken", supplier_name="Ahmad", sort="quantity")
        self.assertEqual(history["pagination"]["total"], 2)
        self.assertEqual(history["results"][0]["historical_unit_price"], "10.1234")
        self.assertNotEqual(Decimal(history["results"][0]["historical_unit_price"]), Decimal("20.55"))
        drafts = self.call("list_ingredient_purchase_history", status="draft")
        self.assertFalse(drafts["results"][0]["recognized"])
        self.assertEqual(self.call("list_purchase_invoice_lines", invoice_id=self.cash.pk)["results"][0]["supplier_id"], None)

    def test_single_range_open_ended_all_history_purchase_and_payment_dates(self):
        self.assertEqual(self.call("list_purchase_invoices", date="2026-09-10")["pagination"]["total"], 1)
        self.assertEqual(self.call("list_purchase_invoices", date_from="2026-09-10", date_to="2026-09-15")["pagination"]["total"], 4)
        self.assertEqual(self.call("list_purchase_invoices", date_to="2026-08-31")["pagination"]["total"], 1)
        self.assertEqual(self.call("list_purchase_invoices", date_from="2026-09-01")["pagination"]["total"], 4)
        self.assertEqual(self.call("list_purchase_invoices")["pagination"]["total"], 5)
        payments = self.call("list_supplier_payments", date="2026-10-01", payment_method="bank_transfer", invoice_number="SEP")
        self.assertEqual(payments["pagination"]["total"], 1)
        self.assertEqual(payments["results"][0]["date"], "2026-10-01")
        self.assertEqual(self.call("get_supplier_payments_summary", date_to="2026-09-30")["recorded_payments"], "10")

    def test_kabul_timestamp_boundaries_all_types_and_no_ui_month_cutoff(self):
        for stamp, qty in (("2026-08-31T19:29:59+00:00", "1"), ("2026-08-31T19:30:00+00:00", "2"), ("2026-09-01T19:29:59+00:00", "3"), ("2026-09-01T19:30:00+00:00", "4")):
            row = StockMovement.objects.create(restaurant=self.restaurant, branch=self.branch, ingredient=self.chicken, change_quantity=qty, movement_type="adjustment")
            StockMovement.objects.filter(pk=row.pk).update(created_at=datetime.fromisoformat(stamp))
        rows = self.call("list_stock_movements", movement_type="adjustment", date="2026-09-01")["results"]
        self.assertEqual({r["signed_quantity"] for r in rows}, {"2.000", "3.000"})
        self.assertTrue(all(r["created_at"].startswith("2026-09-01") for r in rows))
        self.assertEqual({r["movement_type"] for r in self.call("list_stock_movements", page_size=50)["results"]}, {k for k, _ in StockMovement.MOVEMENT_TYPES})
        self.assertEqual(self.call("list_stock_movements", date_to="2026-09-01", movement_type="adjustment")["pagination"]["total"], 3)

    def test_consumption_and_waste_corrections_units_and_profile_activity(self):
        result = self.call("get_consumption_summary", ingredient_id=self.chicken.pk, date_from="2026-09-01", date_to="2026-09-30", ranking="highest")
        groups = {g["movement_type"]: g for g in result["by_type_unit"]}
        self.assertEqual({k: Decimal(v["net_recorded_usage"]) for k, v in groups.items()}, {"order": Decimal(4), "production": Decimal(3), "production_adjustment": Decimal(-1)})
        self.assertEqual(Decimal(result["by_ingredient"]["results"][0]["net_recorded_usage"]), Decimal(6))
        self.assertEqual(self.call("get_consumption_summary", source="production", ingredient_id=self.chicken.pk)["movement_count"], 2)
        units = {r["ingredient__unit"] for r in self.call("get_consumption_summary")["by_unit"]}
        self.assertEqual(units, {"kg", "g"})
        waste = self.call("get_waste_summary", date="2026-09-15")
        self.assertEqual(waste["movement_count"], 2)
        self.assertEqual(Decimal(waste["by_unit"][0]["net_recorded_usage"]), Decimal("1.5"))
        self.assertEqual(Decimal(waste["by_unit"][0]["increases"]), Decimal("0.5"))
        profile = self.call("get_ingredient_summary", ingredient_name="Chicken", date_from="2026-09-01", date_to="2026-09-30")
        self.assertEqual(Decimal(profile["purchase_activity"]["quantity"]), Decimal(4))
        self.assertEqual(Decimal(profile["purchase_activity"]["line_charges"]), Decimal("44.04"))
        self.assertEqual(Decimal(profile["current"]["available_quantity"]), Decimal("10.125"))

    def test_invoice_summary_no_join_multiplication_drafts_posting_and_supplierless_paid(self):
        full = self.call("get_purchase_invoices_summary")
        self.assertEqual(Decimal(full["invoice_cohort"]["recognized_charges"]), Decimal("124.29"))
        self.assertEqual(Decimal(full["invoice_cohort"]["draft_face_value"]), Decimal("50"))
        partial = self.call("get_purchase_invoices_summary", ingredient_id=self.chicken.pk)
        self.assertEqual(Decimal(partial["invoice_cohort"]["recognized_charges"]), Decimal("74.29"))
        self.assertEqual(Decimal(partial["ingredients"]["results"][0]["line_charges"]), Decimal("64.29"))
        cash = self.call("get_purchase_invoice_details", invoice_id=self.cash.pk)["invoice"]
        self.assertEqual((Decimal(cash["current_capped_paid"]), Decimal(cash["remaining_balance"])), (Decimal(7), Decimal(0)))
        self.assertEqual(self.call("list_purchase_invoices", is_inventory_posted=False)["results"][0]["id"], self.draft.pk)
        self.assertEqual(Decimal(self.call("get_purchase_invoices_summary", status="draft")["invoice_cohort"]["recognized_charges"]), Decimal(0))

    def test_invoice_details_bounded_relations_metadata_and_no_urls(self):
        out = self.call("get_purchase_invoice_details", invoice_number="SEP-1", page_size=1)
        self.assertEqual(out["lines"]["pagination"]["total"], 2)
        self.assertTrue(out["lines"]["pagination"]["has_more"])
        later = self.call("get_purchase_invoice_details", invoice_id=self.september.pk, page_size=1, lines_page=2)
        self.assertNotEqual(out["lines"]["results"][0]["id"], later["lines"]["results"][0]["id"])
        self.assertEqual(out["payments"]["results"][0]["date"], "2026-10-01")
        attachment = out["attachments"]["results"][0]
        self.assertEqual(attachment["file_size"], 123)
        self.assertNotIn("file", attachment)
        self.assertNotIn("url", json.dumps(attachment))

    def test_supplier_profile_period_activity_current_balances_and_rankings(self):
        out = self.call("get_supplier_summary", supplier_name="Ahmad", date_from="2026-09-01", date_to="2026-09-30")
        self.assertEqual(Decimal(out["supplier"]["recognized_purchases"]), Decimal("67.29"))
        self.assertEqual(Decimal(out["supplier"]["outstanding_balance"]), Decimal("37.29"))
        self.assertEqual(Decimal(out["purchases"]["invoice_cohort"]["recognized_charges"]), Decimal("47.04"))
        self.assertEqual(Decimal(out["payments"]["recorded_payments"]), Decimal(10))
        self.assertEqual(out["supplier"]["phone"], "0700000000")
        directory = self.call("list_suppliers", page_size=1, sort="-balance")
        self.assertEqual(directory["results"][0]["name"], "Beta")
        self.assertEqual(directory["pagination"]["total"], 2)
        overview = self.call("get_suppliers_summary", page_size=1)
        self.assertEqual(overview["current"]["count"], 2)
        self.assertEqual(Decimal(overview["current"]["recognized_purchases"]), Decimal("117.29"))
        self.assertEqual(Decimal(overview["supplierless_activity"]["recognized_charges"]), Decimal(7))
        alphabetical = self.call("get_suppliers_summary", ranking="identity")
        self.assertEqual([r["name"] for r in alphabetical["supplier_ranking"]["results"]], ["Ahmad", "Beta"])
        lowest = self.call("get_suppliers_summary", ranking="lowest", page_size=1)
        self.assertEqual(lowest["supplier_ranking"]["results"][0]["name"], "Ahmad")

    def test_current_correction_reconciliation_and_capped_invoice_amounts(self):
        # Correct an invoice below already recorded payment rows; no fabricated
        # refund and no assumption supplier/invoice/net-first floors reconcile.
        PurchaseInvoice.objects.filter(pk=self.august.pk).update(total_amount="5")
        corrected = self.call("get_suppliers_summary")["current"]
        self.assertEqual(Decimal(corrected["sum_supplier_balances"]), Decimal("72.04"))
        self.assertEqual(Decimal(corrected["recognized_invoice_remaining"]), Decimal("77.04"))
        PurchaseInvoice.objects.filter(pk=self.september.pk).update(total_amount="5")
        out = self.call("get_suppliers_summary")
        current = out["current"]
        self.assertEqual(Decimal(current["aggregate_net_first_balance"]), Decimal(30))
        self.assertEqual(Decimal(current["sum_supplier_balances"]), Decimal(50))
        self.assertEqual(Decimal(current["recognized_invoice_remaining"]), Decimal(50))
        detail = self.call("get_purchase_invoice_details", invoice_id=self.august.pk)["invoice"]
        self.assertEqual(Decimal(detail["current_capped_paid"]), Decimal(5))
        self.assertEqual(Decimal(detail["remaining_balance"]), Decimal(0))
        self.assertEqual(Decimal(self.call("get_supplier_summary", supplier_id=self.ahmad.pk)["payments"]["recorded_payments"]), Decimal(30))

    def test_supplier_ledger_opening_closing_running_pagination_and_service_semantics(self):
        ledger = self.call("get_supplier_ledger", supplier_name="Ahmad", date_from="2026-09-01", date_to="2026-09-30", page_size=1)["ledger"]
        self.assertEqual(Decimal(ledger["opening_reconstructed"]), Decimal("20.25"))
        self.assertEqual(Decimal(ledger["closing_reconstructed"]), Decimal("57.29"))
        self.assertEqual(Decimal(ledger["results"][0]["running_balance"]), Decimal("10.25"))
        full = self.call("get_supplier_ledger", supplier_id=self.ahmad.pk, page_size=50)["ledger"]
        expected = supplier_ledger(self.ahmad)
        self.assertEqual([(r["entry_type"], r["id"]) for r in full["results"]], [(r["type"], r["id"]) for r in expected["entries"]])
        self.assertEqual(Decimal(full["closing_reconstructed"]), self.ahmad.total_purchases - self.ahmad.total_paid)
        SupplierPayment.objects.filter(pk=self.p1.pk).update(date="2026-07-01")
        negative = self.call("get_supplier_ledger", supplier_id=self.ahmad.pk)["ledger"]["results"][0]
        self.assertEqual(Decimal(negative["running_balance"]), Decimal(-10))

    def test_procurement_periods_keep_payables_and_supplierless_separate(self):
        august = self.call("get_procurement_summary", date_from="2026-08-01", date_to="2026-08-31")
        sept = self.call("get_procurement_summary", date_from="2026-09-01", date_to="2026-09-30", group_by="day")
        self.assertEqual(august["current_supplier_accounts"], sept["current_supplier_accounts"])
        self.assertEqual(Decimal(august["purchase_activity"]["invoice_cohort"]["recognized_charges"]), Decimal("20.25"))
        self.assertEqual(Decimal(sept["purchase_activity"]["invoice_cohort"]["recognized_charges"]), Decimal("104.04"))
        self.assertEqual(Decimal(sept["payment_activity"]["recorded_payments"]), Decimal(10))
        self.assertEqual(Decimal(sept["current_supplier_accounts"]["sum_supplier_balances"]), Decimal("87.29"))

    def test_transfers_status_quantities_dates_endpoint_scope_and_logs(self):
        out = self.call("get_stock_transfers_summary", date_from="2026-10-01", date_to="2026-10-31")
        self.assertEqual(out["transfer_count"], 2)
        self.assertEqual(sum(Decimal(r["approved_quantity"]) for r in out["quantities"]["results"]), Decimal(3))
        self.assertEqual(sum(Decimal(r["pending_quantity"]) for r in out["quantities"]["results"]), Decimal(2))
        self.assertEqual(self.call("list_stock_transfers", from_branch_id=self.branch.pk, status="pending")["pagination"]["total"], 1)
        self.assertEqual(self.call("list_stock_transfer_logs", transfer_id=self.pending.pk, action="requested")["results"][0]["id"], self.log.pk)
        self.assertEqual(self.call("list_stock_transfers", user=self.branch_admin)["pagination"]["total"], 2)
        Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
        self.context = ToolContext(principal_for(self.admin), time.monotonic() + 60)
        self.assertEqual(self.call("get_stock_transfer_details", transfer_id=self.pending.pk)["transfer"]["id"], self.pending.pk)

    def test_every_operation_role_matrix_uses_independent_existing_policies(self):
        kitchen_allowed = {"list_ingredients", "list_ingredient_stocks", "list_low_stock_ingredients", "get_inventory_summary", "get_low_stock_summary"}
        finance_denied = {"get_ingredient_details", "list_ingredient_recipe_usages", "list_low_stock_ingredients", "get_ingredient_summary", "get_low_stock_summary"}
        for user, allowed in ((self.inventory, True), (self.operations, True), (self.branch_admin, True),
                              (self.waiter, False), (self.kitchen, kitchen_allowed), (self.finance, finance_denied)):
            context = ToolContext(principal_for(user), time.monotonic() + 600)
            for tool in inventory_procurement_definitions():
                expected = tool.id not in finance_denied if user == self.finance else tool.id in kitchen_allowed if user == self.kitchen else allowed
                with self.subTest(user=user.username, tool=tool.id):
                    self.assertEqual(tool.authorize(context, {}), expected)
                    if not expected:
                        with self.assertRaises(OperationError) as error:
                            tool.handler(context, {})
                        self.assertEqual(error.exception.code, "PERMISSION_DENIED")

    def test_foreign_branch_ids_names_and_parent_logs_never_leak(self):
        detail_params = (("get_ingredient_details", {"ingredient_id": self.second_ingredient.pk}),
            ("get_ingredient_summary", {"ingredient_id": self.foreign_ingredient.pk}),
            ("get_supplier_details", {"supplier_id": self.second_supplier.pk}),
            ("get_supplier_summary", {"supplier_name": self.foreign_supplier.name}),
            ("get_purchase_invoice_details", {"invoice_id": self.foreign_invoice.pk}),
            ("get_supplier_ledger", {"supplier_id": self.foreign_supplier.pk}),
            ("get_stock_movement_details", {"movement_id": self.foreign_movement.pk}),
            ("get_stock_transfer_details", {"transfer_id": self.foreign_transfer.pk}),
            ("list_stock_transfer_logs", {"transfer_id": self.foreign_transfer.pk}))
        for name, params in detail_params:
            with self.subTest(name=name), self.assertRaises(OperationError) as error:
                self.call(name, **params)
            self.assertEqual(error.exception.code, "RECORD_NOT_AVAILABLE")
        for name, params in (("list_ingredients", {"ingredient_id": self.second_ingredient.pk}),
                ("list_suppliers", {"supplier_name": self.foreign_supplier.name}),
                ("list_purchase_invoices", {"invoice_id": self.foreign_invoice.pk}),
                ("list_stock_movements", {"ingredient_id": self.foreign_ingredient.pk}),
                ("list_supplier_payments", {"supplier_id": self.foreign_supplier.pk})):
            self.assertEqual(self.call(name, **params)["pagination"]["total"], 0)

    def test_malformed_cross_tenant_relations_and_actor_references_are_suppressed(self):
        PurchaseInvoice.objects.filter(pk=self.september.pk).update(supplier=self.foreign_supplier)
        self.assertEqual(self.call("list_purchase_invoices", invoice_id=self.september.pk)["pagination"]["total"], 0)
        self.assertEqual(self.call("list_supplier_payments", invoice_id=self.september.pk)["pagination"]["total"], 0)
        PurchaseInvoiceLine.objects.filter(invoice=self.august).update(ingredient=self.foreign_ingredient)
        self.assertEqual(self.call("list_purchase_invoice_lines", invoice_id=self.august.pk)["pagination"]["total"], 0)
        foreign_user = self.staff_user("foreign-actor", "Admin", "0711111105")
        foreign_staff = Staff.objects.get(user=foreign_user)
        Staff.objects.filter(pk=foreign_staff.pk).update(restaurant=self.foreign_restaurant)
        StockMovement.objects.filter(pk=self.movement_rows["waste"].pk).update(created_by=foreign_staff)
        actor = self.call("get_stock_movement_details", movement_id=self.movement_rows["waste"].pk)["movement"]["created_by"]
        self.assertEqual(actor, {"id": None, "name": None})

    def test_stale_principal_direct_selectors_and_changed_permissions_are_rechecked(self):
        forged = replace(self.context.principal, role="Waiter")
        with self.assertRaises(InventoryQueryError):
            InventoryQueries(principal=forged, operation="list_suppliers", parameters={})
        with self.assertRaises(InventoryQueryError):
            InventoryQueries(principal=principal_for(self.kitchen), operation="list_suppliers", parameters={})
        from inventory.views import purchase_invoice_list_create
        with patch.object(purchase_invoice_list_create.cls, "permission_classes", [DenyRead]):
            out = self.execute([invocation("get_inventory_summary", "stock"), invocation("get_procurement_summary", "procurement")])
        self.assertEqual([r["ok"] for r in out["results"]], [True, False])

    def test_parameter_validation_closed_scope_dates_enums_sorts_and_current_stock_dates(self):
        for params in ({"restaurant_id": self.foreign_restaurant.pk}, {"branch_id": self.second_branch.pk}, {"page": 0},
                       {"page_size": 51}, {"sort": "restaurant__name"}, {"unit": "tons"}, {"date": "2026-09-01"}):
            with self.subTest(params=params), self.assertRaises(OperationError) as error:
                self.call("list_ingredients", **params)
            self.assertEqual(error.exception.code, "INVALID_PARAMETERS")

    def test_invalid_activity_dates_and_missing_profile_identity(self):
        for params in ({"date": "2026-02-30"}, {"date_from": "2026-09-30", "date_to": "2026-09-01"},
                {"date": "2026-09-01", "date_from": "2026-09-01"}, {"movement_type": "sale"}):
            with self.assertRaises(OperationError) as error:
                self.call("list_stock_movements", **params)
            self.assertEqual(error.exception.code, "INVALID_PARAMETERS")
        for tool in ("get_ingredient_summary", "get_supplier_summary", "get_supplier_ledger", "get_purchase_invoice_details"):
            with self.assertRaises(OperationError) as error:
                self.call(tool)
            self.assertEqual(error.exception.code, "INVALID_PARAMETERS")

    def test_empty_summaries_and_group_pagination_keep_full_totals(self):
        summary = self.call("get_purchase_invoices_summary", page_size=1)
        self.assertTrue(summary["ingredients"]["pagination"]["has_more"])
        self.assertEqual(Decimal(summary["invoice_cohort"]["recognized_charges"]), Decimal("124.29"))
        self.assertEqual(self.call("get_supplier_payments_summary", page_size=1)["payment_count"], 2)
        empty = self.call("get_procurement_summary", date_from="2000-01-01", date_to="2000-01-02")
        self.assertEqual(empty["purchase_activity"]["invoice_cohort"]["count"], 0)
        self.assertEqual(Decimal(empty["payment_activity"]["recorded_payments"]), Decimal(0))
        self.assertEqual(empty["current_supplier_accounts"]["count"], 2)
        self.assertEqual(self.call("get_waste_summary", ingredient_name="absent")["movement_count"], 0)

    def test_transfer_logs_creation_dates_rejected_requests_and_unrelated_endpoints(self):
        stamp = "2026-09-30T19:30:00+00:00"
        StockTransferLog.objects.filter(pk=self.log.pk).update(created_at=datetime.fromisoformat(stamp))
        logs = self.call("list_stock_transfer_logs", transfer_id=self.pending.pk, date="2026-10-01")
        self.assertEqual(logs["pagination"]["total"], 1)
        self.assertEqual(self.call("list_stock_transfer_logs", transfer_id=self.pending.pk, date_to="2026-09-30")["pagination"]["total"], 0)
        StockTransfer.objects.filter(pk=self.pending.pk).update(status="rejected")
        self.assertEqual(self.call("list_stock_transfers", date="2026-10-05")["pagination"]["total"], 2)
        groups = self.call("get_stock_transfers_summary")["quantities"]["results"]
        self.assertEqual(sum(Decimal(r["approved_quantity"]) for r in groups), Decimal(3))
        self.assertEqual(sum(Decimal(r["pending_quantity"]) for r in groups), Decimal(0))
        third = Branch.objects.create(restaurant=self.restaurant, name="Three", code="BA-4")
        hidden = StockTransfer.objects.create(restaurant=self.restaurant, ingredient=self.second_ingredient,
            from_branch=self.second_branch, to_branch=third, quantity=1)
        with self.assertRaises(OperationError) as error:
            self.call("get_stock_transfer_details", transfer_id=hidden.pk)
        self.assertEqual(error.exception.code, "RECORD_NOT_AVAILABLE")

    def test_same_day_ledger_invoice_before_payment_and_running_balance_after_page_one(self):
        SupplierPayment.objects.filter(pk=self.p1.pk).update(date="2026-08-10")
        out = self.call("get_supplier_ledger", supplier_id=self.ahmad.pk, page_size=1, page=2)["ledger"]
        self.assertEqual(out["results"][0]["entry_type"], "payment")
        self.assertEqual(Decimal(out["results"][0]["running_balance"]), Decimal("10.25"))

    def test_source_permission_changes_are_independent_of_other_tool_families(self):
        from inventory.views import stock_transfer_list_create, supplier_payment_list_create
        with patch.object(stock_transfer_list_create.cls, "permission_classes", [DenyRead]):
            out = self.execute([invocation("list_stock_transfers", "transfers"), invocation("list_stock_movements", "movements")])
            movements = out["results"][1]["data"]["output"]
            self.assertEqual(movements["excluded_movement_types"], ["transfer_in", "transfer_out"])
            self.assertFalse(any(r["movement_type"].startswith("transfer_") for r in movements["results"]))
            profile = self.call("get_ingredient_summary", ingredient_id=self.chicken.pk)
            self.assertEqual(profile["movement_activity"]["excluded_movement_types"], ["transfer_in", "transfer_out"])
            with self.assertRaises(OperationError) as error:
                self.call("list_stock_movements", movement_type="transfer_out")
            self.assertEqual(error.exception.code, "PERMISSION_DENIED")
            with self.assertRaises(OperationError) as error:
                self.call("get_stock_movement_details", movement_id=self.movement_rows["transfer_out"].pk)
            self.assertEqual(error.exception.code, "RECORD_NOT_AVAILABLE")
        self.assertEqual([r["ok"] for r in out["results"]], [False, True])
        with patch.object(supplier_payment_list_create.cls, "permission_classes", [DenyRead]):
            out = self.execute([invocation("list_supplier_payments", "payments"), invocation("get_supplier_summary", "profile", supplier_id=self.ahmad.pk),
                invocation("list_ingredients", "ingredients")])
        self.assertEqual([r["ok"] for r in out["results"]], [False, False, True])

    def test_scripted_realistic_requests_use_real_batch_evidence_and_audit(self):
        # These selections are scripted, not claims of live autonomous reasoning.
        scenarios = [
            ("Give me a complete profile of chicken, including stock, purchases, consumption, waste and recipes.", "get_ingredient_summary", {"ingredient_name": "Chicken"}),
            ("Which ingredients are running low?", "list_low_stock_ingredients", {}),
            ("What ingredients did we consume most during September?", "get_consumption_summary", {"date_from": "2026-09-01", "date_to": "2026-09-30", "ranking": "highest"}),
            ("Show every stock adjustment for chicken last month.", "list_stock_movements", {"ingredient_name": "Chicken", "movement_type": "adjustment", "date_from": "2026-09-01", "date_to": "2026-09-30"}),
            ("How much waste was recorded during August?", "get_waste_summary", {"date_from": "2026-08-01", "date_to": "2026-08-31"}),
            ("Show pending transfers and approved transfers for October.", "get_stock_transfers_summary", {"date_from": "2026-10-01", "date_to": "2026-10-31"}),
            ("Give me the complete profile of supplier Ahmad.", "get_supplier_summary", {"supplier_name": "Ahmad"}),
            ("How much did we purchase from Ahmad during September, and how much did we pay him?", "get_supplier_summary", {"supplier_name": "Ahmad", "date_from": "2026-09-01", "date_to": "2026-09-30"}),
            ("Which suppliers currently have the largest outstanding balances?", "get_suppliers_summary", {"ranking": "highest"}),
            ("Compare our procurement purchases and supplier payments for August and September.", "get_procurement_summary", {"date_from": "2026-08-01", "date_to": "2026-09-30"}),
            ("How much is our current inventory worth?", "get_inventory_summary", {}),
            ("Explain why current stock value differs from historical purchase spending.", "get_inventory_summary", {}),
        ]
        for question, tool, params in scenarios:
            with self.subTest(question=question):
                def answer(request):
                    result = json.loads(next(m["content"] for m in reversed(request["messages"]) if m["role"] == "tool"))
                    self.assertTrue(result["results"][0]["ok"], result)
                    return final("Current position and historical activity have separate date and calculation bases.", citations=["b1:0"])
                provider = ScriptedProvider([batch([], [invocation(tool, "analysis", **params)]), answer])
                response = ConversationService(provider=provider).reply(user=self.admin, question=question)
                turn = TurnAudit.objects.get(pk=response["request_id"])
                self.assertEqual((turn.model_calls, turn.batches, turn.operations, turn.status), (2, 1, 1, "completed"))
                self.assertEqual(response["message"]["sources"][0]["tool_id"], tool)
