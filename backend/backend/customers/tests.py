from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from django.test import TransactionTestCase, override_settings
from django.core import signing
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, timedelta
from decimal import Decimal

from menu.models import Category, MenuItem, Platter, PlatterItem
from orders.models import Order
from restaurants.models import Branch, Restaurant, Subscription

from .models import Customer, CustomerAddress


class CustomerSignupRouteTests(APITestCase):
    def test_public_signup_route_creates_customer_account(self):
        response = self.client.post(
            "/api/customer/signup/",
            {
                "username": "new-customer",
                "password": "safe-password-123",
                "email": "customer@example.com",
                "phone": "0700123456",
                "address": "Kabul",
                "date_of_birth": "1998-04-12",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="new-customer")
        self.assertTrue(user.check_password("safe-password-123"))
        self.assertTrue(
            Customer.objects.filter(
                user=user,
                phone="0700123456",
                address="Kabul",
            ).exists()
        )

    def test_customer_token_refresh_supports_canonical_and_legacy_routes(self):
        user = User.objects.create_user(
            username="returning-customer",
            password="safe-password-123",
        )
        Customer.objects.create(
            user=user,
            phone="0700654321",
            address="Kabul",
        )

        canonical_response = self.client.post(
            "/api/customer/token/refresh/",
            {"refresh": str(RefreshToken.for_user(user))},
            format="json",
        )
        legacy_response = self.client.post(
            "/api/customer/customer/token/refresh/",
            {"refresh": str(RefreshToken.for_user(user))},
            format="json",
        )

        self.assertEqual(canonical_response.status_code, 200)
        self.assertIn("access", canonical_response.data)
        self.assertEqual(legacy_response.status_code, 200)
        self.assertIn("access", legacy_response.data)


class MarketplaceFixtures:
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="market-customer",
            password="safe-password-123",
        )
        self.customer = Customer.objects.create(
            user=self.user,
            phone="0700123456",
            address="Legacy address",
        )
        self.other_user = User.objects.create_user(
            username="other-customer",
            password="safe-password-123",
        )
        self.other_customer = Customer.objects.create(
            user=self.other_user,
            phone="0700999999",
        )
        self.restaurant = Restaurant.objects.create(
            name="Marketplace Kitchen",
            email="marketplace@example.com",
            phone="0700000000",
            address="Kabul",
            latitude=34.525,
            longitude=69.178,
            base_delivery_fee=Decimal("50.00"),
            price_per_km=Decimal("0.00"),
            min_order_amount=Decimal("100.00"),
            delivery_radius_km=Decimal("20.00"),
            delivery_available=True,
            show_on_landing=True,
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=date.today() - timedelta(days=1),
            expires_at=date.today() + timedelta(days=30),
            max_branches=2,
            is_active=True,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Main Branch",
            code="MAIN",
            address="Kabul",
            latitude=34.525,
            longitude=69.178,
            delivery_available=True,
            delivery_radius_km=Decimal("20.00"),
            base_delivery_fee=Decimal("50.00"),
            price_per_km=Decimal("0.00"),
            min_order_amount=Decimal("100.00"),
            is_main_branch=True,
        )
        self.category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Main dishes",
        )
        self.item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.category,
            name="Qabuli Palaw",
            price=Decimal("250.00"),
            is_available=True,
            is_manually_available=True,
        )
        self.address = CustomerAddress.objects.create(
            customer=self.customer,
            label="Home",
            address_line="Street 1",
            city="Kabul",
            latitude=34.526,
            longitude=69.179,
            is_default=True,
        )
        self.client.force_authenticate(self.user)

    def checkout_payload(self, **overrides):
        payload = {
            "restaurant_slug": self.restaurant.slug,
            "branch_slug": self.branch.slug,
            "order_type": "delivery",
            "address_id": self.address.id,
            "contact_phone": "0700123456",
            "idempotency_key": "checkout-attempt-1",
            "items": [
                {
                    "item_type": "menu_item",
                    "item_id": self.item.id,
                    "quantity": 2,
                    "note": "No onions",
                }
            ],
        }
        payload.update(overrides)
        return payload

    def reviewed_payload(self, **overrides):
        payload = self.checkout_payload(**overrides)
        response = self.client.post('/api/customer/checkout/validate/', payload, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        payload['quote_token'] = response.data['quote_token']
        return payload


class CustomerMarketplaceApiTests(MarketplaceFixtures, APITestCase):

    def test_checkout_validation_returns_authoritative_totals(self):
        response = self.client.post(
            "/api/customer/checkout/validate/",
            self.checkout_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["subtotal"], "500.00")
        self.assertEqual(response.data["delivery_fee"], "50.00")
        self.assertEqual(response.data["total"], "550.00")
        self.assertEqual(response.data["payment_method"], "cash_on_delivery")

    def test_order_creation_is_idempotent_and_customer_scoped(self):
        payload = self.reviewed_payload()
        first = self.client.post("/api/customer/orders/", payload, format="json")
        second = self.client.post("/api/customer/orders/", payload, format="json")

        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 200, second.data)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(Order.objects.filter(customer=self.customer).count(), 1)
        order = Order.objects.get(pk=first.data["id"])
        self.assertEqual(order.branch, self.branch)
        self.assertEqual(order.items.get().price_at_order, Decimal("250.00"))

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.get(f"/api/customer/orders/{order.id}/")
        self.assertEqual(forbidden.status_code, 404)

    def test_unavailable_item_is_rejected_before_order_creation(self):
        self.item.is_manually_available = False
        self.item.save(update_fields=["is_manually_available"])

        response = self.client.post(
            "/api/customer/orders/",
            self.checkout_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "item_unavailable")
        self.assertFalse(Order.objects.filter(customer=self.customer).exists())

    def test_address_crud_keeps_a_default_address(self):
        created = self.client.post(
            "/api/customer/addresses/",
            {
                "label": "Office",
                "address_line": "Business center",
                "city": "Kabul",
                "is_default": True,
            },
            format="json",
        )

        self.assertEqual(created.status_code, 201, created.data)
        self.address.refresh_from_db()
        self.assertFalse(self.address.is_default)
        deleted = self.client.delete(
            f"/api/customer/addresses/{created.data['id']}/"
        )
        self.assertEqual(deleted.status_code, 204)
        self.address.refresh_from_db()
        self.assertTrue(self.address.is_default)

    def test_checkout_requires_authentication(self):
        self.client.force_authenticate(None)
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.status_code, 401)

    def test_a_changed_price_requires_a_new_review(self):
        payload = self.reviewed_payload()
        MenuItem.objects.filter(pk=self.item.pk).update(price=Decimal('300.00'))
        response = self.client.post('/api/customer/orders/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'price_changed')
        self.assertFalse(Order.objects.filter(customer=self.customer).exists())
        new_payload = self.reviewed_payload()
        accepted = self.client.post('/api/customer/orders/', new_payload, format='json')
        self.assertEqual(accepted.status_code, 201, accepted.data)
        self.assertEqual(accepted.data['total'], '650.00')

    def test_prices_totals_and_discounts_from_the_client_are_ignored(self):
        payload = self.reviewed_payload(total='1.00', discount=99, delivery_fee=0)
        payload['items'][0]['unit_price'] = '1.00'
        response = self.client.post('/api/customer/orders/', payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['total'], '550.00')

    def test_a_quote_is_required_and_is_bound_to_customer_and_cart(self):
        response = self.client.post('/api/customer/orders/', self.checkout_payload(), format='json')
        self.assertEqual(response.data['code'], 'quote_expired')
        payload = self.reviewed_payload()
        payload['items'][0]['quantity'] = 1
        rejected = self.client.post('/api/customer/orders/', payload, format='json')
        self.assertEqual(rejected.data['code'], 'price_changed')

    def test_accepted_order_replay_survives_new_prices_and_unavailability(self):
        payload = self.reviewed_payload()
        first = self.client.post('/api/customer/orders/', payload, format='json')
        MenuItem.objects.filter(pk=self.item.pk).update(price=900, is_manually_available=False)
        replay = self.client.post('/api/customer/orders/', payload, format='json')
        self.assertEqual(replay.status_code, 200)
        self.assertEqual(replay.data['id'], first.data['id'])
        self.assertEqual(replay.data['total'], '550.00')

    def test_wrong_branch_items_and_closed_branches_are_rejected(self):
        other_branch = Branch.objects.create(restaurant=self.restaurant, name='West', code='WEST', is_active=True)
        payload = self.checkout_payload(branch_slug=other_branch.slug, order_type='takeaway')
        response = self.client.post('/api/customer/checkout/validate/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'item_unavailable')
        self.branch.opening_hours = 'closed'
        self.branch.save(update_fields=['opening_hours'])
        closed = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(closed.status_code, 400)

    def test_other_customers_cannot_use_or_change_saved_addresses(self):
        self.client.force_authenticate(self.other_user)
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.status_code, 400)
        changed = self.client.patch(f'/api/customer/addresses/{self.address.id}/', {'label': 'Stolen'}, format='json')
        self.assertEqual(changed.status_code, 404)
        self.assertEqual(self.client.delete(f'/api/customer/addresses/{self.address.id}/').status_code, 404)

    def test_saved_addresses_survive_sign_out_and_a_fresh_customer_session(self):
        created = self.client.post('/api/customer/addresses/', {
            'label': 'Work', 'address_line': 'Building 2', 'area': 'City centre',
            'city': 'Kabul', 'instructions': 'Use the side entrance',
            'latitude': 34.526, 'longitude': 69.179, 'is_default': True,
        }, format='json')
        self.assertEqual(created.status_code, 201, created.data)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/api/customer/addresses/').status_code, 401)
        new_session = APIClient()
        token = RefreshToken.for_user(self.user).access_token
        new_session.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        addresses = new_session.get('/api/customer/addresses/')
        self.assertEqual(addresses.status_code, 200)
        saved = next(a for a in addresses.data if a['id'] == created.data['id'])
        self.assertEqual(saved['address_line'], 'Building 2')
        self.assertEqual(saved['latitude'], 34.526)
        self.assertEqual(saved['instructions'], 'Use the side entrance')
        self.assertTrue(saved['is_default'])
        self.assertEqual(CustomerAddress.objects.filter(customer=self.customer).count(), 2)

    def test_delivery_instructions_prefill_but_can_be_overridden_for_this_order(self):
        self.address.instructions = 'Use the side entrance'
        self.address.save(update_fields=['instructions'])
        payload = self.reviewed_payload(delivery_instructions='Call on arrival')
        accepted = self.client.post('/api/customer/orders/', payload, format='json')
        self.assertEqual(accepted.status_code, 201, accepted.data)
        self.assertEqual(accepted.data['note'], 'Call on arrival')
        self.address.refresh_from_db()
        self.assertEqual(self.address.instructions, 'Use the side entrance')

    def test_invalid_coordinates_and_missing_location_are_rejected(self):
        for coordinates in [{'latitude': 91, 'longitude': 0}, {'latitude': 'NaN', 'longitude': 0}, {'latitude': 0}]:
            response = self.client.post('/api/customer/addresses/', {'address_line': 'Test', **coordinates}, format='json')
            self.assertEqual(response.status_code, 400, response.data)
        self.address.latitude = None
        self.address.longitude = None
        self.address.save()
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.data['code'], 'address_location_required')

    def test_delivery_minimum_radius_and_support_are_authoritative(self):
        self.branch.min_order_amount = Decimal('1000')
        self.branch.save(update_fields=['min_order_amount'])
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.data['code'], 'minimum_order')
        self.branch.delivery_available = False
        self.branch.save(update_fields=['delivery_available'])
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.data['code'], 'delivery_unavailable')
        takeaway = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(order_type='takeaway'), format='json')
        self.assertEqual(takeaway.status_code, 200)
        self.assertEqual(takeaway.data['delivery_fee'], '0.00')
        self.assertEqual(takeaway.data['payment_method'], 'cash_on_pickup')

    def test_expired_subscription_and_inactive_branch_cannot_accept_orders(self):
        Branch.objects.filter(pk=self.branch.pk).update(is_active=False)
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.status_code, 404)
        Branch.objects.filter(pk=self.branch.pk).update(is_active=True)
        Subscription.objects.filter(restaurant=self.restaurant).update(expires_at=date.today()-timedelta(days=1))
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(), format='json')
        self.assertEqual(response.status_code, 404)

    def test_platter_cannot_hide_an_unavailable_or_wrong_branch_component(self):
        platter = Platter.objects.create(restaurant=self.restaurant, branch=self.branch, category=self.category, name='Family meal', price=800)
        PlatterItem.objects.create(platter=platter, menu_item=self.item, quantity=Decimal('2'))
        self.item.is_manually_available = False
        self.item.save(update_fields=['is_manually_available'])
        response = self.client.post('/api/customer/checkout/validate/', self.checkout_payload(items=[{'item_type': 'platter', 'item_id': platter.id, 'quantity': 1}]), format='json')
        self.assertEqual(response.status_code, 400)

    def test_cancellation_is_owner_scoped_and_limited_to_pending_window(self):
        response = self.client.post('/api/customer/orders/', self.reviewed_payload(), format='json')
        order_id = response.data['id']
        self.client.force_authenticate(self.other_user)
        self.assertEqual(self.client.post(f'/api/customer/orders/{order_id}/cancel/').status_code, 404)
        self.client.force_authenticate(self.user)
        Order.objects.filter(pk=order_id).update(created_at=timezone.now()-timedelta(minutes=3))
        self.assertEqual(self.client.post(f'/api/customer/orders/{order_id}/cancel/').status_code, 409)
        Order.objects.filter(pk=order_id).update(created_at=timezone.now())
        cancelled = self.client.post(f'/api/customer/orders/{order_id}/cancel/')
        self.assertEqual(cancelled.status_code, 200)
        self.assertEqual(cancelled.data['status'], 'cancelled')

    def test_order_history_paginates_without_exposing_other_customers(self):
        for index in range(22):
            Order.objects.create(customer=self.customer, restaurant=self.restaurant, branch=self.branch, order_type='takeaway', client_order_id=f'history-{index}')
        Order.objects.create(customer=self.other_customer, restaurant=self.restaurant, branch=self.branch, order_type='takeaway')
        response = self.client.get('/api/customer/orders/?page=1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 22)
        self.assertEqual(len(response.data['results']), 20)
        self.assertIsNotNone(response.data['next'])

    def test_public_menu_does_not_expose_costs_recipes_or_staff_fields(self):
        response = self.client.get(f'/api/menu/public/{self.restaurant.slug}/{self.branch.slug}/menu-items/')
        self.assertEqual(response.status_code, 200, response.data)
        item = response.data[0]
        for private_field in ['ingredients', 'cost_per_unit', 'profit_per_unit', 'station', 'station_name', 'production_produced']:
            self.assertNotIn(private_field, item)


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class CustomerOrderSocketTests(MarketplaceFixtures, TransactionTestCase):
    def test_owner_gets_only_order_events_and_another_customer_is_denied(self):
        from .consumers import CustomerOrderConsumer
        from orders.signals import broadcast_customer_order
        order = Order.objects.create(customer=self.customer, restaurant=self.restaurant, branch=self.branch, order_type='takeaway')
        ticket = signing.dumps({'order_id': order.id, 'user_id': self.user.id}, salt='customer-order-socket')
        bad_ticket = signing.dumps({'order_id': order.id, 'user_id': self.other_user.id}, salt='customer-order-socket')

        async def scenario():
            def communicator(value):
                connection = WebsocketCommunicator(CustomerOrderConsumer.as_asgi(), f'/ws/customer/orders/{order.id}/?ticket={value}')
                connection.scope['url_route'] = {'kwargs': {'order_id': order.id}}
                return connection
            unauthorized = communicator(bad_ticket)
            allowed, code = await unauthorized.connect()
            self.assertFalse(allowed)
            self.assertEqual(code, 4403)
            owner = communicator(ticket)
            self.assertTrue((await owner.connect())[0])
            self.assertEqual((await owner.receive_json_from())['type'], 'CONNECTED')
            await get_channel_layer().group_send(f'customer_order_{order.id}', {'type': 'customer_order_message', 'message': {'type': 'ORDER_UPDATED', 'order_id': order.id, 'status': 'in_progress'}})
            event = await owner.receive_json_from()
            self.assertEqual(event['status'], 'in_progress')
            self.assertNotIn('order', event)
            await owner.disconnect()
            await unauthorized.disconnect()
        async_to_sync(scenario)()
        with self.assertRaises(Exception) if False else self.captureOnCommitCallbacks() if hasattr(self, 'captureOnCommitCallbacks') else __import__('contextlib').nullcontext():
            broadcast_customer_order(order)

    def test_missing_or_tampered_ticket_is_denied(self):
        from .consumers import CustomerOrderConsumer
        async def scenario():
            connection = WebsocketCommunicator(CustomerOrderConsumer.as_asgi(), '/ws/customer/orders/1/?ticket=tampered')
            connection.scope['url_route'] = {'kwargs': {'order_id': 1}}
            allowed, code = await connection.connect()
            self.assertFalse(allowed)
            self.assertEqual(code, 4401)
            await connection.disconnect()
        async_to_sync(scenario)()
