from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from audit.constants import AuditAction, AuditModule
from audit.models import AuditLog
from audit.services import calculate_field_changes, create_audit_log
from contractors.models import Contractor
from expenses.models import Expenses
from inventory.models import Ingredient, Supplier
from menu.models import Category, MenuItem
from orders.models import Reservation, Table
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


def create_restaurant(name):
    restaurant = Restaurant.objects.create(
        name=name,
        email=f"{name.lower().replace(' ', '-')}@example.com",
        phone="0700000000",
        address="Test address",
        is_active=True,
    )
    Subscription.objects.create(
        restaurant=restaurant,
        starts_at=date.today() - timedelta(days=1),
        expires_at=date.today() + timedelta(days=30),
        max_branches=5,
        is_active=True,
    )
    branch = Branch.objects.create(
        restaurant=restaurant,
        name="Main Branch",
        code=f"MAIN-{restaurant.id}",
        is_main_branch=True,
        is_active=True,
    )
    return restaurant, branch


def create_staff_user(username, restaurant, branch, role="Admin"):
    user = User.objects.create_user(username=username, password="password")
    staff = Staff.objects.create(
        user=user,
        restaurant=restaurant,
        active_branch=branch,
        name=username.title(),
        role=role,
        email=f"{username}@example.com",
        phone=f"07{user.id:08d}",
        status="Active",
    )
    staff.branches.add(branch)
    return user, staff


class AuditUtilityTests(TestCase):
    def test_calculate_field_changes_normalizes_values(self):
        changes = calculate_field_changes(
            {"amount": Decimal("5000.00"), "status": "draft"},
            {"amount": Decimal("6000.00"), "status": "approved"},
        )

        self.assertEqual(
            changes,
            {
                "amount": {"old": "5000.00", "new": "6000.00"},
                "status": {"old": "draft", "new": "approved"},
            },
        )

    def test_audit_logs_are_immutable(self):
        restaurant, branch = create_restaurant("Audit Immutable")
        log = create_audit_log(
            restaurant=restaurant,
            branch=branch,
            action=AuditAction.CREATE,
            module=AuditModule.EXPENSES,
            object_type="Expenses",
            object_id="1",
            object_repr="Expense",
            on_commit=False,
        )

        log.description = "Changed later"
        with self.assertRaises(ValueError):
            log.save()


class AuditApiIsolationTests(TestCase):
    def setUp(self):
        self.restaurant, self.branch = create_restaurant("Audit A")
        self.other_restaurant, self.other_branch = create_restaurant("Audit B")
        self.user, self.staff = create_staff_user("audit-admin", self.restaurant, self.branch)
        self.other_user, _ = create_staff_user("audit-other", self.other_restaurant, self.other_branch)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_tenant_isolation(self):
        create_audit_log(
            user=self.user,
            restaurant=self.restaurant,
            branch=self.branch,
            action=AuditAction.CREATE,
            module=AuditModule.EXPENSES,
            object_type="Expenses",
            object_id="1",
            object_repr="Visible",
            on_commit=False,
        )
        create_audit_log(
            user=self.other_user,
            restaurant=self.other_restaurant,
            branch=self.other_branch,
            action=AuditAction.CREATE,
            module=AuditModule.EXPENSES,
            object_type="Expenses",
            object_id="2",
            object_repr="Hidden",
            on_commit=False,
        )

        response = self.client.get("/api/audit-logs/")

        self.assertEqual(response.status_code, 200)
        objects = [row["object_repr"] for row in response.data["results"]]
        self.assertIn("Visible", objects)
        self.assertNotIn("Hidden", objects)

    def test_branch_admin_only_sees_assigned_branch(self):
        second_branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Second",
            code="SECOND",
            is_active=True,
        )
        branch_user, branch_staff = create_staff_user(
            "branch-auditor",
            self.restaurant,
            self.branch,
            role="BranchAdmin",
        )
        branch_staff.branches.set([self.branch])
        self.client.force_authenticate(branch_user)

        create_audit_log(
            user=self.user,
            restaurant=self.restaurant,
            branch=self.branch,
            action=AuditAction.CREATE,
            module=AuditModule.EXPENSES,
            object_type="Expenses",
            object_id="1",
            object_repr="Branch One",
            on_commit=False,
        )
        create_audit_log(
            user=self.user,
            restaurant=self.restaurant,
            branch=second_branch,
            action=AuditAction.CREATE,
            module=AuditModule.EXPENSES,
            object_type="Expenses",
            object_id="2",
            object_repr="Branch Two",
            on_commit=False,
        )

        response = self.client.get("/api/audit-logs/")

        self.assertEqual(response.status_code, 200)
        objects = [row["object_repr"] for row in response.data["results"]]
        self.assertEqual(objects, ["Branch One"])


class ModuleAuditHookTests(TestCase):
    def setUp(self):
        self.restaurant, self.branch = create_restaurant("Audit Hooks")
        self.user, self.staff = create_staff_user("audit-hook", self.restaurant, self.branch)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_expense_create_and_update_are_audited(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/expenses/expenses/",
                {
                    "name": "Fuel",
                    "amount": "2000.00",
                    "currency": "AFN",
                    "exchange_rate": "1",
                    "date": date.today().isoformat(),
                    "description": "Generator fuel",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        expense = Expenses.objects.get(name="Fuel")

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/expenses/expenses/{expense.id}/",
                {"amount": "2500.00"},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        logs = AuditLog.objects.filter(object_type="Expenses", object_id=str(expense.id))
        self.assertTrue(logs.filter(action=AuditAction.CREATE).exists())
        update_log = logs.get(action=AuditAction.UPDATE)
        self.assertEqual(update_log.metadata["changes"]["amount"]["old"], "2000.00")
        self.assertEqual(update_log.metadata["changes"]["amount"]["new"], "2500.00")

    def test_procurement_supplier_create_and_update_are_audited(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/procurement/suppliers/",
                {"name": "ABC Supplier", "phone": "0799999999"},
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        supplier = Supplier.objects.get(name="ABC Supplier")

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/procurement/suppliers/{supplier.id}/",
                {"is_active": False},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        logs = AuditLog.objects.filter(object_type="Supplier", object_id=str(supplier.id))
        self.assertTrue(logs.filter(action=AuditAction.CREATE).exists())
        self.assertTrue(logs.filter(action=AuditAction.STATUS_CHANGE).exists())

    def test_contractor_create_and_update_are_audited(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/contractors/contractors/",
                {"name": "Clean Co", "phone": "0788888888"},
                format="json",
            )

        self.assertEqual(response.status_code, 201)
        contractor = Contractor.objects.get(name="Clean Co")

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/contractors/contractors/{contractor.id}/",
                {"contact_person": "Omar"},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        logs = AuditLog.objects.filter(object_type="Contractor", object_id=str(contractor.id))
        self.assertTrue(logs.filter(action=AuditAction.CREATE).exists())
        update_log = logs.get(action=AuditAction.UPDATE)
        self.assertEqual(update_log.metadata["changes"]["contact_person"]["new"], "Omar")

    def test_audit_filters_by_object(self):
        create_audit_log(
            user=self.user,
            restaurant=self.restaurant,
            branch=self.branch,
            action=AuditAction.CREATE,
            module=AuditModule.PROCUREMENT,
            object_type="PurchaseInvoice",
            object_id="24",
            object_repr="PINV-24",
            on_commit=False,
        )

        response = self.client.get(
            "/api/audit-logs/",
            {"object_type": "PurchaseInvoice", "object_id": "24"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["object_repr"], "PINV-24")

    def test_staff_role_changes_are_audited(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/users/staff/",
                {
                    "name": "Ahmad",
                    "email": "ahmad@example.com",
                    "phone": "0711111111",
                    "role": "Waiter",
                    "status": "Active",
                },
                format="multipart",
            )

        self.assertEqual(response.status_code, 201, response.data)
        staff_member = Staff.objects.get(email="ahmad@example.com")

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/users/staff/{staff_member.id}/",
                {"role": "Cashier"},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        role_log = AuditLog.objects.get(
            module=AuditModule.ROLES,
            object_type="Staff",
            object_id=str(staff_member.id),
        )
        self.assertEqual(role_log.action, AuditAction.STATUS_CHANGE)
        self.assertEqual(role_log.metadata["changes"]["role"]["old"], "Waiter")
        self.assertEqual(role_log.metadata["changes"]["role"]["new"], "Cashier")

    def test_branch_settings_changes_are_audited(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                "/api/restaurant/branches/active/settings/",
                {"opening_hours": "09:00-21:00"},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            AuditLog.objects.filter(
                module=AuditModule.SETTINGS,
                object_type="Branch",
                object_id=str(self.branch.id),
                metadata__changes__opening_hours__new="09:00-21:00",
            ).exists()
        )

    def test_menu_item_create_is_audited(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Burgers",
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/menu/menu-items/",
                {
                    "name": "Chicken Burger",
                    "price": "280.00",
                    "category": category.id,
                    "is_manually_available": True,
                },
                format="multipart",
            )

        self.assertEqual(response.status_code, 201)
        item = MenuItem.objects.get(name="Chicken Burger")
        self.assertTrue(
            AuditLog.objects.filter(
                module=AuditModule.MENU,
                action=AuditAction.CREATE,
                object_type="MenuItem",
                object_id=str(item.id),
            ).exists()
        )

    def test_stock_adjustment_is_audited(self):
        ingredient = Ingredient.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Rice",
            unit="kg",
            quantity_available="10.000",
            minimum_threshold="2.000",
            cost_per_unit="100.00",
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/inventory/adjust-stock/",
                {
                    "ingredient": ingredient.id,
                    "quantity": "2.000",
                    "movement_type": "adjustment",
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            AuditLog.objects.filter(
                module=AuditModule.INVENTORY,
                action=AuditAction.CREATE,
                object_type="StockMovement",
                new_values__movement_type="adjustment",
            ).exists()
        )

    def test_reservation_cancellation_is_audited(self):
        table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="T1",
            capacity=4,
        )
        reservation = Reservation.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            table=table,
            customer_name="Nadia",
            phone="0791111111",
            guests=2,
            reservation_date=(timezone.localdate() + timedelta(days=1)),
            start_time=timezone.now() + timedelta(days=1),
            duration_minutes=60,
            status="reserved",
            created_by=self.staff,
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f"/api/orders/cancel-reservation/{reservation.id}/")

        self.assertEqual(response.status_code, 200)
        cancel_log = AuditLog.objects.get(
            module=AuditModule.RESERVATIONS,
            action=AuditAction.CANCEL,
            object_type="Reservation",
            object_id=str(reservation.id),
        )
        self.assertEqual(cancel_log.metadata["changes"]["status"]["new"], "cancelled")

    def test_report_export_metadata_is_audited_without_report_contents(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.get(
                "/api/reports/generate_report/",
                {"type": "inventory", "start": "2026-01-01", "end": "2026-01-31"},
            )

        self.assertEqual(response.status_code, 200)
        log = AuditLog.objects.get(
            module=AuditModule.REPORTS,
            action=AuditAction.EXPORT,
            object_type="ReportExport",
            object_id="inventory:json",
        )
        self.assertEqual(log.metadata["report_type"], "inventory")
        self.assertNotIn("data", log.metadata)
