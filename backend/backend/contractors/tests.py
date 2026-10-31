import time
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import connection
from django.test.utils import CaptureQueriesContext

from business_analyst.context import ToolContext, principal_for
from business_analyst.registry import production_registry
from business_analyst.tests.helpers import DatabaseFixture
from contractors.management.commands.seed_contractor_test_data import MODELS, TAG
from contractors.models import Contractor, ContractorInvoice, ContractorPayment
from contractors.services import create_contractor_invoice, create_contractor_payment


class ContractorSeedTests(DatabaseFixture):
    def command(self, **options):
        output = StringIO()
        call_command("seed_contractor_test_data", restaurant=self.restaurant.pk,
                     branch=self.branch.pk, stdout=output, **options)
        return output.getvalue()

    def seed(self):
        return self.command(confirm=f"seed:{self.restaurant.pk}:{self.branch.pk}")

    def cleanup(self, **options):
        return self.command(cleanup=True, confirm=f"cleanup:{self.restaurant.pk}:{self.branch.pk}", **options)

    def counts(self):
        return [model.objects.count() for model in MODELS]

    def test_explicit_confirmation_valid_scope_and_read_only_dry_run(self):
        with CaptureQueriesContext(connection) as queries:
            self.assertIn("would create", self.command(dry_run=True))
        self.assertFalse(any(q["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for q in queries))
        for token in (None, "seed:999:999"):
            with self.assertRaises(CommandError):
                self.command(confirm=token)
        with self.assertRaises(CommandError):
            call_command("seed_contractor_test_data", restaurant=self.restaurant.pk, branch=self.foreign_branch.pk, dry_run=True)
        self.assertEqual(self.counts(), [0, 0, 0, 0, 0])

    def test_idempotence_and_dependency_ordered_cleanup_preserve_existing_data(self):
        original = Contractor.objects.create(restaurant=self.restaurant, branch=self.branch, name="Existing provider")
        invoice = create_contractor_invoice({"contractor": original.pk, "total_amount": "700"}, self.restaurant, self.branch)
        payment = create_contractor_payment({"contractor": original.pk, "invoice": invoice.pk, "amount": "100"}, self.restaurant, self.branch)
        before = self.counts()
        self.seed()
        self.assertEqual(self.counts(), [a + b for a, b in zip(before, [4, 4, 6, 8, 5])])
        with CaptureQueriesContext(connection) as queries:
            self.assertIn("Already seeded", self.seed())
        self.assertFalse(any(q["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for q in queries))
        self.assertIn("would remove 27", self.cleanup(dry_run=True))
        self.cleanup()
        self.assertEqual(self.counts(), before)
        self.assertTrue(ContractorPayment.objects.filter(pk=payment.pk).exists())
        invoice.refresh_from_db()
        self.assertEqual(str(invoice.amount_paid), "100.00")
        self.cleanup()

    def test_cleanup_refuses_new_dependencies_even_set_null_and_edited_rows(self):
        self.seed()
        agreement = MODELS[1].objects.first()
        extra = create_contractor_invoice({"contractor": agreement.contractor_id, "contract": agreement.pk,
                                          "total_amount": "25"}, self.restaurant, self.branch)
        before = self.counts()
        with self.assertRaisesMessage(CommandError, "additional dependent"):
            self.cleanup()
        self.assertEqual(self.counts(), before)
        extra.delete()
        row = ContractorPayment.objects.first()
        row.notes = "Edited by user"
        row.save(update_fields=["notes"])
        with self.assertRaisesMessage(CommandError, "edited"):
            self.cleanup()

    def test_transaction_rolls_back_failure_and_marker_collision_is_not_adopted(self):
        with patch("contractors.management.commands.seed_contractor_test_data.create_contractor_payment", side_effect=ValueError("failure")):
            with self.assertRaises(ValueError):
                self.seed()
        self.assertEqual(self.counts(), [0, 0, 0, 0, 0])
        Contractor.objects.create(restaurant=self.restaurant, branch=self.branch, name=f"{TAG} Kabul Cooling Services")
        with self.assertRaises(CommandError):
            self.seed()
        self.assertEqual(self.counts(), [1, 0, 0, 0, 0])

    def test_all_existing_analyst_tools_and_period_totals(self):
        self.seed()
        registry = production_registry(self.documents)
        context = ToolContext(principal_for(self.admin), time.monotonic() + 60)

        def invoke(name, **params):
            tool = registry.get(name)
            values = registry.validate_parameters(tool, params)
            result = tool.handler(context, values)
            registry.validate_output(tool, result)
            return result

        providers = invoke("list_contractors")
        self.assertEqual(providers["pagination"]["total"], 4)
        summary = invoke("get_contractor_summary")
        self.assertEqual(summary["contractors"], {"count": 4, "active": 3, "inactive": 1})
        self.assertEqual(summary["current"]["outstanding_balance"], "7500.00")
        self.assertEqual(invoke("list_service_contracts")["pagination"]["total"], 4)
        self.assertEqual(invoke("get_service_contracts_summary")["agreement_value"], "37000.00")
        self.assertEqual(invoke("list_service_invoices")["pagination"]["total"], 6)
        invoices = invoke("get_service_invoices_summary")
        self.assertEqual(invoices["totals"]["recognized_charges"], "19000.00")
        self.assertEqual(invoices["totals"]["draft_face_value"], "1800.00")
        self.assertEqual(len(invoices["by_status"]), 4)
        self.assertEqual({g["service_type"]: g["recognized_charges"] for g in invoices["service_types"]["groups"]},
                         {"Maintenance": "10000.00", "Cleaning": "6500.00", "Pest Control": "2500.00"})
        self.assertEqual(invoke("list_service_invoice_lines")["pagination"]["total"], 8)
        self.assertEqual(invoke("list_contractor_payments")["pagination"]["total"], 5)
        payments = invoke("get_contractor_payments_summary")
        self.assertEqual(payments["recorded_payments"], "11500.00")
        self.assertEqual(len(payments["by_method"]), 4)
        for month, last, charges, paid, count in (("09", "30", "11500.00", "5000.00", 2), ("10", "31", "7500.00", "6500.00", 3)):
            bounds = dict(date_from=f"2026-{month}-01", date_to=f"2026-{month}-{last}")
            result = invoke("get_contractor_summary", **bounds)
            self.assertEqual(result["activity"]["recognized_charges"], charges)
            self.assertEqual(result["activity"]["recorded_payments"], paid)
            self.assertEqual(result["current"]["outstanding_balance"], "7500.00")
            self.assertEqual(invoke("list_contractor_payments", **bounds)["pagination"]["total"], count)
        for row in providers["results"]:
            invoke("get_contractor_details", contractor_id=row["id"])
            ledger = invoke("get_contractor_ledger", contractor_id=row["id"])
            self.assertEqual(ledger["current"]["outstanding_balance"], row["outstanding_balance"])
        invoke("get_service_contract_details", contract_id=MODELS[1].objects.first().pk)
        for invoice in ContractorInvoice.objects.all():
            invoke("get_service_invoice_details", invoice_id=invoice.pk)
