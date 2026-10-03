from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from audit.constants import PRODUCTION_MOVEMENT_OBJECT_TYPE
from audit.models import AuditLog
from inventory.services import (
    deduct_batch_stock_for_order_items,
    deduct_stock_for_order,
    deduct_stock_for_order_item,
)
from menu.models import Category, MenuItem, Platter, PlatterItem, Production
from orders.models import Order, OrderItem
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


class ProductionMovementTests(TestCase):
    def setUp(self):
        self.restaurant = Restaurant.objects.create(
            name="Production Audit Cafe",
            email="production-audit@example.com",
            phone="0709000000",
            address="Main street",
            is_active=True,
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=timezone.localdate() - timedelta(days=1),
            expires_at=timezone.localdate() + timedelta(days=30),
            max_branches=2,
            is_active=True,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Main Branch",
            code="PROD-MAIN",
            is_main_branch=True,
            is_active=True,
        )
        self.category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Drinks",
        )
        self.pepsi = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Pepsi",
            price="50.00",
            uses_daily_production=True,
        )
        self.platter = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Family Platter",
            price="500.00",
        )
        PlatterItem.objects.create(
            platter=self.platter,
            menu_item=self.pepsi,
            quantity="1.000",
        )
        self.admin_user, self.admin = self._staff_user("prod-admin", "Admin")

    def _staff_user(self, username, role):
        user = User.objects.create_user(username=username, password="password")
        staff = Staff.objects.create(
            user=user,
            restaurant=self.restaurant,
            active_branch=self.branch,
            name=username.title(),
            role=role,
            email=f"{username}@example.com",
            phone=f"079{Staff.objects.count():07d}",
            status="Active",
        )
        staff.branches.add(self.branch)
        return user, staff

    def _order_with_platter(self):
        order = Order.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            order_type="takeaway",
            name="Walk-in",
            status="pending",
            created_by=self.admin,
        )
        item = OrderItem.objects.create(
            order=order,
            platter=self.platter,
            quantity=1,
            price_at_order=self.platter.price,
        )
        return order, item

    def _reset_production(self):
        production, _ = Production.objects.update_or_create(
            menu_item=self.pepsi,
            branch=self.branch,
            defaults={
                "restaurant": self.restaurant,
                "quantity_produced": 10,
                "quantity_remaining": 10,
                "created_by": self.admin,
            },
        )
        return production

    def test_platter_never_consumes_standalone_daily_production(self):
        callers = [
            lambda order, item: deduct_stock_for_order(order),
            lambda order, item: deduct_batch_stock_for_order_items([item], order),
            lambda order, item: deduct_stock_for_order_item(item, order),
        ]

        for caller in callers:
            production = self._reset_production()
            order, item = self._order_with_platter()
            caller(order, item)
            production.refresh_from_db()
            self.assertEqual(production.quantity_remaining, 10)

    def test_standalone_order_consumption_is_audited(self):
        production = self._reset_production()
        order = Order.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            order_type="takeaway",
            name="Walk-in",
            status="pending",
            created_by=self.admin,
        )
        item = OrderItem.objects.create(
            order=order,
            menu_item=self.pepsi,
            quantity=2,
            price_at_order=self.pepsi.price,
        )

        with self.captureOnCommitCallbacks(execute=True):
            deduct_stock_for_order_item(item, order)

        production.refresh_from_db()
        self.assertEqual(production.quantity_remaining, 8)
        movement = AuditLog.objects.get(
            object_type=PRODUCTION_MOVEMENT_OBJECT_TYPE,
            metadata__movement_type="consume",
        )
        self.assertEqual(movement.user, self.admin_user)
        self.assertEqual(movement.metadata["order_id"], str(order.id))
        self.assertEqual(movement.old_values["quantity_remaining"], 10)
        self.assertEqual(movement.new_values["quantity_remaining"], 8)

    def test_movement_page_api_is_limited_to_admin_and_operations_manager(self):
        client = APIClient()
        client.force_authenticate(self.admin_user)
        with self.captureOnCommitCallbacks(execute=True):
            response = client.post(
                "/api/menu/production/",
                {"menu_item": self.pepsi.id, "action": "set", "quantity": 12},
                format="json",
                HTTP_X_BRANCH_ID=str(self.branch.id),
            )
        self.assertEqual(response.status_code, 200, response.data)

        for role, expected_status in [
            ("Admin", 200),
            ("OperationsManager", 200),
            ("InventoryManager", 403),
            ("Kitchen_manager", 403),
        ]:
            user, _ = self._staff_user(f"viewer-{role.lower()}", role)
            client.force_authenticate(user)
            response = client.get(
                "/api/audit-logs/production-movements/",
                HTTP_X_BRANCH_ID=str(self.branch.id),
            )
            self.assertEqual(response.status_code, expected_status, role)

        client.force_authenticate(self.admin_user)
        response = client.get(
            "/api/audit-logs/production-movements/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.data["count"], 1)
        movement = response.data["results"][0]
        self.assertEqual(movement["user_name"], self.admin.name)
        self.assertEqual(movement["metadata"]["movement_type"], "create")

    def test_daily_production_pdf_download(self):
        self._reset_production()
        client = APIClient()
        client.force_authenticate(self.admin_user)

        response = client.get(
            "/api/menu/production/pdf/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("daily_production_", response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"%PDF"))
        self.assertGreater(len(response.content), 1000)

    def test_daily_production_pdf_uses_production_permissions(self):
        manager_user, _ = self._staff_user("production-manager", "Manager")
        client = APIClient()
        client.force_authenticate(manager_user)

        response = client.get(
            "/api/menu/production/pdf/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 403)

