from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Customer


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
