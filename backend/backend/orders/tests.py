import shutil
import tempfile
from datetime import timedelta
from unittest.mock import patch

from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from menu.models import Category, MenuItem, Station
from orders.models import DiscountCard, DiscountRequest, Order, OrderItem, Table
from orders.routing import websocket_urlpatterns
from orders.seriailizers import OrderSerializer
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

        cls._original_channel_layer = order_signals.channel_layer
        order_signals.channel_layer = get_channel_layer()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        import orders.signals as order_signals

        order_signals.channel_layer = cls._original_channel_layer
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
        self.manager_user = self._staff_user("manager", "Manager")
        self.delivery_user = self._staff_user("delivery", "DeliveryBoy")
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

    def _create_order(
        self,
        *,
        status="ready",
        item_status="approved",
        order_type="takeaway",
        table=None,
    ):
        order = Order.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            order_type=order_type,
            name="Walk-in",
            status=status,
            table=table,
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

    def test_completed_payment_retry_is_idempotent_across_cashiers(self):
        order, _ = self._create_order()
        self._mark_paid(order)
        original_paid_at = order.paid_at
        original_receiver = order.received_by
        second_cashier = self._staff_user("cashier-2", "Cashier")

        self.client.force_authenticate(second_cashier)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "completed"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertEqual(order.paid_at, original_paid_at)
        self.assertEqual(order.received_by, original_receiver)

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

    def test_default_kitchen_keeps_unassigned_order_items_visible(self):
        self.grill_station.is_default = True
        self.grill_station.save(update_fields=["is_default"])
        order, assigned_item = self._create_order(
            status="pending",
            item_status="pending",
        )
        unassigned_menu_items = [
            MenuItem.objects.create(
                restaurant=self.restaurant,
                branch=self.branch,
                category=self.category,
                name=f"Main Kitchen fallback {index}",
                price="60.00",
                station=None,
            )
            for index in range(2)
        ]
        unassigned_order_items = [
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=1,
                price_at_order=menu_item.price,
                status="pending",
            )
            for menu_item in unassigned_menu_items
        ]

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.get(
            "/api/orders/kitchen-orders/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        kitchen_order = next(item for item in response.data if item["id"] == order.id)
        expected_ids = {
            assigned_item.id,
            *(item.id for item in unassigned_order_items),
        }
        self.assertEqual({item["id"] for item in kitchen_order["items"]}, expected_ids)
        self.assertEqual(len(kitchen_order["items"]), 3)

        # This is the same full serializer used by the NEW_ORDER WebSocket
        # broadcast. It must carry all lines and route fallback items to the
        # actual default station id so the browser-side station filter keeps
        # them.
        full_snapshot = OrderSerializer(order).data
        self.assertEqual(len(full_snapshot["items"]), 3)
        self.assertTrue(
            all(
                item["station_id"] == self.grill_station.id
                for item in full_snapshot["items"]
            )
        )

        status_response = self.client.patch(
            f"/api/orders/orders/{order.id}/update_status/",
            {"status": "in_progress"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(status_response.status_code, 200, status_response.data)
        self.assertEqual(
            set(order.items.values_list("status", flat=True)),
            {"approved"},
        )

        # Unassigned work belongs to the default kitchen; it must not leak to
        # an unrelated specialist station screen.
        self.kitchen_user.staff_profile.stations.set([self.drinks_station])
        specialist_response = self.client.get(
            "/api/orders/kitchen-orders/",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(
            specialist_response.status_code,
            200,
            specialist_response.data,
        )
        self.assertNotIn(
            order.id,
            [item["id"] for item in specialist_response.data],
        )

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

    def test_stale_full_save_cannot_overwrite_completed_payment(self):
        order, _ = self._create_order()
        stale_order = Order.objects.get(pk=order.pk)
        paid_at = timezone.now()

        Order.objects.filter(pk=order.pk).update(
            status="completed",
            paid_at=paid_at,
            received_by=self.cashier_user.staff_profile,
        )

        stale_order.note = "late response from an older READY request"
        with self.assertRaisesRegex(
            ValueError,
            r"cannot change from completed to ready",
        ):
            stale_order.save()

        order.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertEqual(order.paid_at, paid_at)
        self.assertEqual(order.received_by, self.cashier_user.staff_profile)
        self.assertIsNone(order.note)

    def test_stale_narrow_save_has_no_status_or_table_side_effects(self):
        table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Paid table",
        )
        order, _ = self._create_order(order_type="dine-in", table=table)
        stale_order = Order.objects.get(pk=order.pk)
        self._mark_paid(order)

        stale_order.note = "Late non-status edit"
        stale_order.save(update_fields=["note"])

        order.refresh_from_db()
        table.refresh_from_db()
        self.assertEqual(order.status, "completed")
        self.assertIsNotNone(order.paid_at)
        self.assertEqual(order.note, "Late non-status edit")
        self.assertEqual(table.status, "available")

    def test_paid_order_rejects_pending_discount_approval(self):
        order, _ = self._create_order()
        discount = DiscountRequest.objects.create(
            order=order,
            requested_by=self.cashier_user.staff_profile,
            discount_percent="5.00",
            reason="Loyal customer",
        )
        self._mark_paid(order)

        self.client.force_authenticate(self.manager_user)
        response = self.client.patch(
            f"/api/orders/discounts/{discount.id}/approveOrReject/",
            {"action": "approve"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        discount.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(discount.status, "pending")
        self.assertIsNone(discount.approved_by)
        self.assertEqual(order.status, "completed")
        self.assertEqual(order.discount_percent, 0)
        self.assertIsNotNone(order.paid_at)

    def test_active_discount_approval_preserves_status_and_advances_updated_at(self):
        order, _ = self._create_order()
        discount = DiscountRequest.objects.create(
            order=order,
            requested_by=self.cashier_user.staff_profile,
            discount_percent="5.00",
            reason="Loyal customer",
        )
        previous_updated_at = timezone.now() - timedelta(hours=1)
        Order.objects.filter(pk=order.pk).update(updated_at=previous_updated_at)

        self.client.force_authenticate(self.manager_user)
        response = self.client.patch(
            f"/api/orders/discounts/{discount.id}/approveOrReject/",
            {"action": "approve"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        discount.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(discount.status, "approved")
        self.assertEqual(order.status, "ready")
        self.assertEqual(order.discount_percent, discount.discount_percent)
        self.assertGreater(order.updated_at, previous_updated_at)

    def test_paid_order_rejects_discount_card_without_consuming_it(self):
        order, _ = self._create_order()
        card = DiscountCard.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            card_name="VIP",
            card_number="VIP-001",
            customer_name="Walk-in",
            customer_phone="0700000099",
            discount_percentage="10.00",
            valid_from=timezone.localdate() - timedelta(days=1),
            valid_until=timezone.localdate() + timedelta(days=30),
            usage_limit=1,
        )
        self._mark_paid(order)

        self.client.force_authenticate(self.cashier_user)
        response = self.client.post(
            f"/api/orders/discount-cards/{order.id}/apply/",
            {
                "card_number": card.card_number,
                "customer_phone": card.customer_phone,
            },
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        card.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(card.used_count, 0)
        self.assertIsNone(order.discount_card)
        self.assertEqual(order.discount_percent, 0)
        self.assertEqual(order.status, "completed")

    def test_active_table_change_preserves_status_and_advances_updated_at(self):
        old_table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Table 1",
        )
        new_table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Table 2",
        )
        order, _ = self._create_order(
            order_type="dine-in",
            table=old_table,
        )
        previous_updated_at = timezone.now() - timedelta(hours=1)
        Order.objects.filter(pk=order.pk).update(updated_at=previous_updated_at)

        self.client.force_authenticate(self.manager_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/change-table/",
            {"table": new_table.id},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        self.assertEqual(order.table, new_table)
        self.assertEqual(order.status, "ready")
        self.assertGreater(order.updated_at, previous_updated_at)

    def test_paid_dine_in_order_rejects_table_change(self):
        old_table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Table 1",
        )
        new_table = Table.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Table 2",
        )
        order, _ = self._create_order(
            order_type="dine-in",
            table=old_table,
        )
        self._mark_paid(order)

        self.client.force_authenticate(self.manager_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/change-table/",
            {"table": new_table.id},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        order.refresh_from_db()
        self.assertEqual(order.table, old_table)
        self.assertEqual(order.status, "completed")

    def test_paid_order_item_cannot_be_cancelled(self):
        order, item = self._create_order(item_status="pending")
        self._mark_paid(order)

        self.client.force_authenticate(self.cashier_user)
        response = self.client.patch(
            f"/api/orders/order-items/{item.id}/cancel/",
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        item.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(item.status, "pending")
        self.assertIsNone(item.cancelled_at)
        self.assertEqual(order.status, "completed")

    def test_paid_delivery_order_cannot_be_assigned(self):
        order, _ = self._create_order(order_type="delivery")
        self._mark_paid(order)

        self.client.force_authenticate(self.cashier_user)
        response = self.client.patch(
            f"/api/orders/orders/{order.id}/assign-delivery/",
            {"delivery_person_id": self.delivery_user.staff_profile.id},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 400, response.data)
        order.refresh_from_db()
        self.assertIsNone(order.delivery_boy)
        self.assertEqual(order.status, "completed")

    def test_item_status_mutation_advances_order_updated_at(self):
        order, item = self._create_order(status="pending", item_status="pending")
        previous_updated_at = timezone.now() - timedelta(hours=1)
        Order.objects.filter(pk=order.pk).update(updated_at=previous_updated_at)

        self.client.force_authenticate(self.kitchen_user)
        response = self.client.patch(
            f"/api/orders/order-items/{item.id}/status/",
            {"status": "approved"},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

        self.assertEqual(response.status_code, 200, response.data)
        order.refresh_from_db()
        self.assertEqual(order.status, "in_progress")
        self.assertGreater(order.updated_at, previous_updated_at)


class OrderRealtimeRegressionTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        cls._media_root = tempfile.mkdtemp()
        cls._settings = override_settings(
            CHANNEL_LAYERS=TEST_CHANNEL_LAYERS,
            MEDIA_ROOT=cls._media_root,
        )
        cls._settings.enable()

        import orders.signals as order_signals

        cls._original_channel_layer = order_signals.channel_layer
        order_signals.channel_layer = get_channel_layer()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        import orders.signals as order_signals

        order_signals.channel_layer = cls._original_channel_layer
        super().tearDownClass()
        cls._settings.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)

    def setUp(self):
        self.restaurant = Restaurant.objects.create(
            name="Realtime Cafe",
            email="realtime@example.com",
            phone="0799999999",
            address="Socket street",
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=timezone.localdate() - timedelta(days=1),
            expires_at=timezone.localdate() + timedelta(days=30),
            max_branches=2,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Realtime Branch",
            code="LIVE",
            address="Socket street",
            phone="0799999999",
            email="live@example.com",
            is_main_branch=True,
        )
        self.cashier_user = self._staff_user("live-cashier", "Cashier")
        self.kitchen_user = self._staff_user("live-kitchen", "Kitchen_manager")
        self.station = Station.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Realtime Grill",
            is_active=True,
        )
        self.kitchen_user.staff_profile.stations.add(self.station)
        self.category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Realtime Meals",
        )
        self.menu_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Realtime Burger",
            price="95.00",
            station=self.station,
        )
        async_to_sync(get_channel_layer().flush)()

    def _staff_user(self, username, role):
        user = User.objects.create_user(
            username=username,
            password="test-password",
        )
        staff = Staff.objects.create(
            user=user,
            name=username.title(),
            email=f"{username}@example.com",
            phone=f"078{Staff.objects.count():07d}",
            role=role,
            restaurant=self.restaurant,
            active_branch=self.branch,
        )
        staff.branches.add(self.branch)
        return user

    def _create_order(self, *, status="pending", item_status="pending"):
        order = Order.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            order_type="takeaway",
            name="Realtime guest",
            status=status,
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

    def _api_request(self, method, path, data=None, *, user=None):
        client = APIClient()
        client.force_authenticate(user or self.cashier_user)
        request = getattr(client, method)
        kwargs = {"HTTP_X_BRANCH_ID": str(self.branch.id)}
        if data is not None:
            kwargs.update({"data": data, "format": "json"})
        return request(path, **kwargs)

    def _communicator(self):
        return WebsocketCommunicator(
            URLRouter(websocket_urlpatterns),
            f"/ws/orders/{self.restaurant.id}/",
        )

    async def _receive_event(self, communicator, event_type, max_messages=6):
        observed_types = []
        for _ in range(max_messages):
            event = await communicator.receive_json_from(timeout=3)
            observed_types.append(event.get("type"))
            if event.get("type") == event_type:
                return event
        self.fail(
            f"Did not receive {event_type}; observed events: {observed_types}"
        )

    async def test_order_creation_broadcasts_full_order_and_all_created_items(self):
        communicator = self._communicator()
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "post",
                "/api/orders/orders/",
                {
                    "name": "Socket customer",
                    "order_type": "takeaway",
                    "status": "pending",
                    "items": [
                        {
                            "menu_item": self.menu_item.id,
                            "quantity": quantity,
                            "description": f"Line {quantity}",
                        }
                        for quantity in (1, 2, 3)
                    ],
                },
            )
            self.assertEqual(response.status_code, 201, response.data)

            order_event = await self._receive_event(communicator, "NEW_ORDER")
            item_events = [
                await self._receive_event(communicator, "ITEM_CREATED")
                for _ in range(3)
            ]

            self.assertEqual(order_event["order"]["id"], response.data["id"])
            self.assertEqual(order_event["order"]["status"], "pending")
            self.assertEqual(len(order_event["order"]["items"]), 3)
            self.assertTrue(order_event["order"]["updated_at"])
            self.assertEqual(
                {event["order_id"] for event in item_events},
                {response.data["id"]},
            )
            self.assertEqual(
                {event["item"]["id"] for event in item_events},
                {item["id"] for item in response.data["items"]},
            )
            self.assertEqual(
                {event["item"]["quantity"] for event in item_events},
                {1, 2, 3},
            )
            self.assertEqual(
                {event["order_updated_at"] for event in item_events},
                {order_event["order"]["updated_at"]},
            )
        finally:
            await communicator.disconnect()

    async def test_item_addition_broadcasts_updated_order_and_new_item(self):
        order, _ = await sync_to_async(
            self._create_order,
            thread_sensitive=True,
        )(status="ready", item_status="ready")
        communicator = self._communicator()
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "patch",
                f"/api/orders/orders/{order.id}/add-items/",
                {
                    "items": [
                        {
                            "menu_item": self.menu_item.id,
                            "quantity": 3,
                            "description": "No onions",
                        }
                    ]
                },
            )
            self.assertEqual(response.status_code, 200, response.data)

            order_event = await self._receive_event(communicator, "NEW_ORDER")
            item_event = await self._receive_event(communicator, "ITEM_CREATED")
            created_item_id = response.data["new_items"][0]["id"]

            self.assertEqual(order_event["order"]["id"], order.id)
            self.assertEqual(len(order_event["order"]["items"]), 2)
            self.assertTrue(order_event["order"]["updated_at"])
            self.assertEqual(item_event["order_id"], order.id)
            self.assertEqual(item_event["item"]["id"], created_item_id)
            self.assertEqual(item_event["item"]["status"], "pending")
            self.assertEqual(item_event["item"]["description"], "No onions")
        finally:
            await communicator.disconnect()

    async def test_kitchen_item_status_broadcasts_item_and_order_snapshots(self):
        order, item = await sync_to_async(
            self._create_order,
            thread_sensitive=True,
        )()
        communicator = self._communicator()
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "patch",
                f"/api/orders/order-items/{item.id}/status/",
                {"status": "approved"},
                user=self.kitchen_user,
            )
            self.assertEqual(response.status_code, 200, response.data)

            item_event = await self._receive_event(communicator, "ITEM_UPDATED")
            order_event = await self._receive_event(communicator, "NEW_ORDER")

            self.assertEqual(item_event["order_id"], order.id)
            self.assertEqual(item_event["item"]["id"], item.id)
            self.assertEqual(item_event["item"]["status"], "approved")
            self.assertEqual(order_event["order"]["id"], order.id)
            self.assertEqual(order_event["order"]["status"], "in_progress")
            self.assertTrue(order_event["order"]["updated_at"])
            self.assertEqual(
                item_event["order_updated_at"],
                order_event["order"]["updated_at"],
            )
        finally:
            await communicator.disconnect()

    async def test_client_cannot_inject_order_event_into_restaurant_group(self):
        sender = self._communicator()
        observer = self._communicator()
        sender_connected, _ = await sender.connect()
        observer_connected, _ = await observer.connect()
        self.assertTrue(sender_connected)
        self.assertTrue(observer_connected)

        try:
            await sender.send_json_to(
                {
                    "type": "NEW_ORDER",
                    "order": {"id": 999, "status": "ready"},
                }
            )
            rejection = await sender.receive_json_from(timeout=1)
            self.assertEqual(rejection["type"], "error")
            self.assertEqual(
                rejection["code"],
                "client_order_events_not_allowed",
            )
            self.assertTrue(await observer.receive_nothing(timeout=0.2))

            await sender.send_json_to({"type": "ping"})
            self.assertEqual(
                await sender.receive_json_from(timeout=1),
                {"type": "pong"},
            )
        finally:
            await sender.disconnect()
            await observer.disconnect()

    async def test_multiple_clients_receive_payment_and_reconnect_has_no_replay(self):
        order, _ = await sync_to_async(
            self._create_order,
            thread_sensitive=True,
        )()
        first = self._communicator()
        second = self._communicator()
        reconnected = None
        first_connected, _ = await first.connect()
        second_connected, _ = await second.connect()
        self.assertTrue(first_connected)
        self.assertTrue(second_connected)

        try:
            ready_response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "patch",
                f"/api/orders/orders/{order.id}/update_status/",
                {"status": "ready"},
                user=self.kitchen_user,
            )
            self.assertEqual(ready_response.status_code, 200, ready_response.data)

            first_ready = await self._receive_event(first, "NEW_ORDER")
            second_ready = await self._receive_event(second, "NEW_ORDER")
            self.assertEqual(first_ready["order"]["status"], "ready")
            self.assertEqual(second_ready["order"], first_ready["order"])

            await first.disconnect()
            first_connected = False

            paid_response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "patch",
                f"/api/orders/orders/{order.id}/update_status/",
                {"status": "completed"},
            )
            self.assertEqual(paid_response.status_code, 200, paid_response.data)

            paid_event = await self._receive_event(second, "NEW_ORDER")
            self.assertEqual(paid_event["order"]["id"], order.id)
            self.assertEqual(paid_event["order"]["status"], "completed")
            self.assertTrue(paid_event["order"]["paid_at"])
            self.assertEqual(
                paid_event["order"]["received_by"],
                self.cashier_user.staff_profile.id,
            )

            reconnected = self._communicator()
            reconnect_accepted, _ = await reconnected.connect()
            self.assertTrue(reconnect_accepted)
            self.assertTrue(await reconnected.receive_nothing(timeout=0.2))

            detail_response = await sync_to_async(
                self._api_request,
                thread_sensitive=True,
            )(
                "get",
                f"/api/orders/orders/{order.id}/",
            )
            self.assertEqual(detail_response.status_code, 200, detail_response.data)
            self.assertEqual(detail_response.data["status"], "completed")
            self.assertIsNotNone(detail_response.data["paid_at"])
        finally:
            if first_connected:
                await first.disconnect()
            if second_connected:
                await second.disconnect()
            if reconnected is not None:
                await reconnected.disconnect()
