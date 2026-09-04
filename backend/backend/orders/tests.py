import shutil
import tempfile
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from menu.models import Category, MenuItem, Station
from orders.models import Order, OrderItem, Table
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


TEST_CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


class OrderPaymentIntegrityTests(TestCase):
    @classmethod
    def setUpClass(cls):
        cls._media_root = tempfile.mkdtemp()
        cls._settings = override_settings(
            CHANNEL_LAYERS=TEST_CHANNEL_LAYERS,
            MEDIA_ROOT=cls._media_root,
        )
        cls._settings.enable()

        import orders.signals as order_signals
        from channels.layers import get_channel_layer

        order_signals.channel_layer = get_channel_layer()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._settings.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.restaurant = Restaurant.objects.create(
            name="Integrity Cafe",
            email="integrity@example.com",
            phone="0700000000",
            address="Main street",
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=timezone.localdate() - timedelta(days=1),
            expires_at=timezone.localdate() + timedelta(days=30),
            max_branches=2,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Main Branch",
            code="MAIN",
            address="Main street",
            phone="0700000000",
            email="main@example.com",
            is_main_branch=True,
        )

        self.cashier_user = self._staff_user("cashier", "Cashier")
        self.kitchen_user = self._staff_user("kitchen", "Kitchen_manager")
        self.grill_station = Station.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Grill",
            is_active=True,
        )
        self.drinks_station = Station.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Drinks",
            is_active=True,
        )
        self.kitchen_user.staff_profile.stations.add(self.grill_station)
        self.category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Meals",
        )
        self.menu_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Kabuli Pulao",
            price="120.00",
            station=self.grill_station,
        )
        self.other_station_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Dogh",
            price="40.00",
            station=self.drinks_station,
        )

    def _staff_user(self, username, role):
        user = User.objects.create_user(
            username=username,
            password="test-password",
        )
        staff = Staff.objects.create(
            user=user,
            name=username.title(),
            email=f"{username}@example.com",
            phone=f"07{Staff.objects.count():08d}",
            role=role,
            restaurant=self.restaurant,
            active_branch=self.branch,
        )
        staff.branches.add(self.branch)
        return user

    def _create_order(self, *, status="ready", item_status="approved"):
        order = Order.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            order_type="takeaway",
            name="Walk-in",
            status=status,
            is_printed=True,
            created_by=self.cashier_user.staff_profile,
        )
        item = OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=1,
            price_at_order=self.menu_item.price,
            status=item_status,
        )
        return order, item

    def _mark_paid(self, order):
        self.client.force_authenticate(self.cashier_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "completed"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertIsNotNone(order.paid_at)
        self.assertEqual(order.received_by, self.cashier_user.staff_profile)
        return order

    def test_paid_order_remains_paid_when_fetched_later(self):
        order, _ = self._create_order()
        self._mark_paid(order)

        self.client.force_authenticate(self.cashier_user)
        response = self.client.get(
            f"/api/orders/orders/{order.id}/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "completed")
        self.assertIsNotNone(response.data["paid_at"])

    def test_stale_item_status_update_cannot_reopen_paid_order(self):
        order, item = self._create_order(item_status="approved")
        self._mark_paid(order)

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/order-items/{item.id}/status/",
            {"status": "ready"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        order.refresh_from_db()
        item.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertEqual(item.status, "approved")
        self.assertIsNotNone(order.paid_at)

    def test_stale_order_status_update_cannot_reopen_paid_order(self):
        order, _ = self._create_order()
        self._mark_paid(order)

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "ready"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        order.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertIsNotNone(order.paid_at)

    def test_items_cannot_be_added_after_order_is_paid(self):
        order, _ = self._create_order()
        self._mark_paid(order)

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/add-items/",
            {"items": [{"menu_item": self.menu_item.id, "quantity": 1}]},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        order.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertEqual(order.items.count(), 1)

    def test_start_preparing_approves_only_items_for_assigned_station(self):
        order, grill_item = self._create_order(item_status="pending")
        drinks_item = OrderItem.objects.create(
            order=order,
            menu_item=self.other_station_item,
            quantity=1,
            price_at_order=self.other_station_item.price,
            status="pending",
        )

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "in_progress"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        grill_item.refresh_from_db()
        drinks_item.refresh_from_db()
        self.assertEqual(order.status, "in_progress")
        self.assertEqual(grill_item.status, "approved")
        self.assertEqual(drinks_item.status, "pending")

    def test_mark_ready_marks_only_items_for_assigned_station_ready(self):
        order, grill_item = self._create_order(status="in_progress", item_status="approved")
        drinks_item = OrderItem.objects.create(
            order=order,
            menu_item=self.other_station_item,
            quantity=1,
            price_at_order=self.other_station_item.price,
            status="pending",
        )

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "ready"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        grill_item.refresh_from_db()
        drinks_item.refresh_from_db()
        self.assertEqual(order.status, "in_progress")
        self.assertEqual(grill_item.status, "ready")
        self.assertEqual(drinks_item.status, "pending")

    def test_unassigned_kitchen_manager_sees_active_orders_on_reload(self):
        self.kitchen_user.staff_profile.stations.clear()
        order, _ = self._create_order(status="pending", item_status="pending")

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.get(
            "/api/orders/kitchen-orders/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual([item["id"] for item in response.data], [order.id])

    def test_unassigned_kitchen_manager_start_preparing_approves_all_items(self):
        self.kitchen_user.staff_profile.stations.clear()
        order, grill_item = self._create_order(status="pending", item_status="pending")
        drinks_item = OrderItem.objects.create(
            order=order,
            menu_item=self.other_station_item,
            quantity=1,
            price_at_order=self.other_station_item.price,
            status="pending",
        )

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "in_progress"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        grill_item.refresh_from_db()
        drinks_item.refresh_from_db()
        self.assertEqual(grill_item.status, "approved")
        self.assertEqual(drinks_item.status, "approved")

    def test_unassigned_kitchen_manager_mark_ready_marks_all_items_ready(self):
        self.kitchen_user.staff_profile.stations.clear()
        order, grill_item = self._create_order(status="in_progress", item_status="approved")
        drinks_item = OrderItem.objects.create(
            order=order,
            menu_item=self.other_station_item,
            quantity=1,
            price_at_order=self.other_station_item.price,
            status="approved",
        )

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "ready"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        grill_item.refresh_from_db()
        drinks_item.refresh_from_db()
        self.assertEqual(order.status, "ready")
        self.assertEqual(grill_item.status, "ready")
        self.assertEqual(drinks_item.status, "ready")

    def test_status_update_survives_realtime_broadcast_failure(self):
        order, item = self._create_order(status="pending", item_status="pending")
        self.client.force_authenticate(self.kitchen_user)

        with patch(
            "orders.signals.broadcast_order",
            side_effect=ConnectionError("channel layer unavailable"),
        ), self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/orders/orders/{order.id}/update_status/",
                {"status": "in_progress"},
                format="json",
                HTTP_X_BRANCH_ID=str(self.branch.id),
            )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        item.refresh_from_db()
        self.assertEqual(order.status, "in_progress")
        self.assertEqual(item.status, "approved")

    def test_status_update_returns_conflict_and_rolls_back_on_inventory_error(self):
        order, item = self._create_order(status="pending", item_status="pending")
        self.client.force_authenticate(self.kitchen_user)

        with patch.object(
            order.__class__,
            "save",
            side_effect=ValueError("Insufficient stock for: Rice"),
        ):
            response = self.client.patch(
                f"/api/orders/orders/{order.id}/update_status/",
                {"status": "in_progress"},
                format="json",
                HTTP_X_BRANCH_ID=str(self.branch.id),
            )

        self.assertEqual(response.status_code, 409, response.data)
        self.assertEqual(response.data["error"], "Insufficient stock for: Rice")
        self.assertEqual(response.data["error_code"], "insufficient_stock")
        self.assertEqual(
            response.data["message"],
            "وضعیت سفارش تغییر نکرد، چون موجودی مواد اولیه کافی نیست: Rice. "
            "لطفاً موجودی گدام را بررسی کنید.",
        )
        order.refresh_from_db()
        item.refresh_from_db()
        self.assertEqual(order.status, "pending")
        self.assertEqual(item.status, "pending")

    def test_item_status_update_returns_stock_conflict_and_rolls_back(self):
        order, item = self._create_order(status="pending", item_status="pending")
        self.client.force_authenticate(self.kitchen_user)

        with patch.object(
            order.__class__,
            "save",
            side_effect=ValueError("Insufficient stock for Rice"),
        ):
            response = self.client.patch(
                f"/api/orders/order-items/{item.id}/status/",
                {"status": "approved"},
                format="json",
                HTTP_X_BRANCH_ID=str(self.branch.id),
            )

        self.assertEqual(response.status_code, 409, response.data)
        self.assertEqual(response.data["error_code"], "insufficient_stock")
        self.assertIn("Rice", response.data["message"])
        order.refresh_from_db()
        item.refresh_from_db()
        self.assertEqual(order.status, "pending")
        self.assertEqual(item.status, "pending")

    def test_status_update_does_not_revalidate_existing_table_assignment(self):
        table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Legacy duplicate table",
        )
        first_order, _ = self._create_order(status="pending", item_status="pending")
        second_order, second_item = self._create_order(
            status="pending",
            item_status="pending",
        )
        Order.objects.filter(pk=first_order.pk).update(table=table)
        Order.objects.filter(pk=second_order.pk).update(table=table)

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/orders/{second_order.id}/update_status/",
            {"status": "in_progress"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        second_order.refresh_from_db()
        second_item.refresh_from_db()
        self.assertEqual(second_order.status, "in_progress")
        self.assertEqual(second_item.status, "approved")
