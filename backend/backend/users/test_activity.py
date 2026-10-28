from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from unittest.mock import patch

from restaurants.models import Branch, Restaurant, Subscription

from .models import AuthSession, Staff


TEST_CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "activity-tests",
    }
}
TEST_CHANNELS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}


@override_settings(CACHES=TEST_CACHES, CHANNEL_LAYERS=TEST_CHANNELS, DEBUG=True)
class ActivitySessionTests(TestCase):
    def setUp(self):
        cache.clear()
        self.restaurant, self.branch = self.make_restaurant("One", "one")
        self.admin = self.make_staff(
            "admin-one",
            "Admin One",
            "Admin",
            self.restaurant,
            self.branch,
            "0700000001",
        )

    def make_restaurant(self, name, slug):
        restaurant = Restaurant.objects.create(
            name=name,
            email=f"{slug}@example.com",
            phone=f"07{Restaurant.objects.count():08d}",
            address="Test address",
        )
        Subscription.objects.create(
            restaurant=restaurant,
            starts_at=timezone.now().date() - timedelta(days=1),
            expires_at=timezone.now().date() + timedelta(days=30),
            max_branches=5,
        )
        branch = Branch.objects.create(
            restaurant=restaurant,
            name="Main",
            code=f"MAIN-{slug}",
            is_main_branch=True,
        )
        return restaurant, branch

    def make_staff(self, username, name, role, restaurant, branch, phone):
        user = User.objects.create_user(username=username, password="test-password")
        staff = Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name=name,
            role=role,
            email=f"{username}@example.com",
            phone=phone,
        )
        staff.branches.add(branch)
        return user

    def login(self, username="admin-one"):
        response = APIClient().post(
            "/api/users/token/",
            {"username": username, "password": "test-password"},
            format="json",
            HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0) Chrome/130.0",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn("session_id", response.data)
        return response.data

    def authenticated_client(self, access):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        return client

    def test_login_creates_session_and_heartbeat_updates_presence(self):
        tokens = self.login()
        session = AuthSession.objects.get(pk=tokens["session_id"])
        self.assertEqual(session.user, self.admin)
        self.assertEqual(session.branch, self.branch)

        client = self.authenticated_client(tokens["access"])
        response = client.post(
            "/api/users/activity/heartbeat/",
            {"idle_seconds": 0},
            format="json",
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "active")

    def test_unique_user_and_multi_device_session_counts(self):
        first = self.login()
        second = self.login()
        client = self.authenticated_client(second["access"])
        client.post("/api/users/activity/heartbeat/", {"idle_seconds": 0}, format="json")
        first_client = self.authenticated_client(first["access"])
        first_client.post("/api/users/activity/heartbeat/", {"idle_seconds": 0}, format="json")

        response = client.get("/api/users/activity/overview/?branch=all")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["unique_active_users"], 1)
        self.assertEqual(response.data["active_sessions"], 2)
        self.assertEqual(response.data["valid_accounts"], 1)
        self.assertEqual(response.data["valid_sessions"], 2)

    def test_idle_transition_is_separate_from_session_validity(self):
        tokens = self.login()
        client = self.authenticated_client(tokens["access"])
        client.post("/api/users/activity/heartbeat/", {"idle_seconds": 301}, format="json")
        response = client.get("/api/users/activity/overview/?branch=all")
        self.assertEqual(response.data["unique_active_users"], 0)
        self.assertEqual(response.data["idle_users"], 1)
        self.assertEqual(response.data["valid_sessions"], 1)

    def test_revocation_rejects_access_and_refresh_tokens(self):
        target = self.login()
        actor = self.login()
        client = self.authenticated_client(actor["access"])
        response = client.post(
            f"/api/users/activity/sessions/{target['session_id']}/revoke/",
            {"branch": "all"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        revoked_client = self.authenticated_client(target["access"])
        self.assertEqual(revoked_client.get("/api/users/activity/sessions/?branch=all").status_code, 401)
        refresh_response = APIClient().post(
            "/api/users/token/refresh/",
            {"refresh": target["refresh"]},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, 401)

    def test_refresh_rotation_keeps_the_same_managed_session(self):
        tokens = self.login()
        response = APIClient().post(
            "/api/users/token/refresh/",
            {"refresh": tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("refresh", response.data)
        self.assertEqual(AuthSession.objects.filter(user=self.admin).count(), 1)
        refreshed_client = self.authenticated_client(response.data["access"])
        self.assertEqual(
            refreshed_client.post(
                "/api/users/activity/heartbeat/",
                {"idle_seconds": 0},
                format="json",
            ).status_code,
            200,
        )

    def test_restaurant_and_branch_isolation(self):
        other_restaurant, other_branch = self.make_restaurant("Two", "two")
        self.make_staff(
            "admin-two",
            "Admin Two",
            "Admin",
            other_restaurant,
            other_branch,
            "0700000002",
        )
        other = self.login("admin-two")
        own = self.login()
        own_client = self.authenticated_client(own["access"])
        response = own_client.get("/api/users/activity/sessions/?branch=all")
        self.assertEqual(response.status_code, 200)
        returned_ids = {row["session_id"] for row in response.data["results"]}
        self.assertNotIn(other["session_id"], returned_ids)

        second_branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Second",
            code="SECOND-one",
        )
        branch_admin = self.make_staff(
            "branch-admin",
            "Branch Admin",
            "BranchAdmin",
            self.restaurant,
            self.branch,
            "0700000003",
        )
        branch_tokens = self.login("branch-admin")
        branch_client = self.authenticated_client(branch_tokens["access"])
        forbidden = branch_client.get(
            f"/api/users/activity/sessions/?branch={second_branch.id}"
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_search_role_status_and_pagination_are_server_side(self):
        self.make_staff(
            "cashier-one",
            "Searchable Cashier",
            "Cashier",
            self.restaurant,
            self.branch,
            "0700000004",
        )
        self.login("cashier-one")
        admin_tokens = self.login()
        client = self.authenticated_client(admin_tokens["access"])

        page = client.get("/api/users/activity/sessions/?branch=all&page_size=1")
        self.assertEqual(page.status_code, 200)
        self.assertEqual(page.data["count"], 2)
        self.assertEqual(len(page.data["results"]), 1)

        filtered = client.get(
            "/api/users/activity/sessions/?branch=all&role=Cashier&search=Searchable"
        )
        self.assertEqual(filtered.data["count"], 1)
        self.assertEqual(filtered.data["results"][0]["username"], "cashier-one")
        self.assertTrue(any(row["role"] == "Admin" for row in page.data["summary"]["by_role"]))

    def test_logout_and_expiration_are_recorded(self):
        target = self.login()
        client = self.authenticated_client(target["access"])
        response = client.post(
            "/api/users/activity/logout/",
            {"refresh": target["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, 204)
        session = AuthSession.objects.get(pk=target["session_id"])
        self.assertEqual(session.end_reason, AuthSession.END_LOGOUT)
        self.assertIsNotNone(session.ended_at)
        self.assertEqual(client.get("/api/users/activity/sessions/?branch=all").status_code, 401)

        expired = self.login()
        AuthSession.objects.filter(pk=expired["session_id"]).update(
            refresh_expires_at=timezone.now() - timedelta(seconds=1)
        )
        actor = self.login()
        history = self.authenticated_client(actor["access"]).get(
            "/api/users/activity/history/?branch=all&status=expired"
        )
        self.assertEqual(history.status_code, 200)
        self.assertTrue(any(row["session_id"] == expired["session_id"] for row in history.data["results"]))
        self.assertEqual(AuthSession.objects.get(pk=expired["session_id"]).end_reason, AuthSession.END_EXPIRED)

    def test_presence_cache_failure_does_not_block_heartbeat(self):
        tokens = self.login()
        client = self.authenticated_client(tokens["access"])
        with patch("users.presence._redis_client", side_effect=RuntimeError("redis unavailable")):
            response = client.post(
                "/api/users/activity/heartbeat/",
                {"idle_seconds": 0},
                format="json",
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "active")
