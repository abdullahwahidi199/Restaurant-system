import shutil
import tempfile
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.db.models.query import QuerySet
from django.test import TestCase, override_settings
from django.test.client import RequestFactory
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.exceptions import PermissionDenied
from rest_framework.test import APIClient

from customers.models import Customer
from restaurants.branching import get_active_branch, get_requested_branch
from restaurants.models import Branch, Restaurant, Subscription
from users.models import LoginRateLimitConfig, Payroll, Staff
from users.payroll_services import generate_payroll
from users.serializers import StaffSerializer


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class StaffSerializerBranchFallbackTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def create_restaurant_and_branch(self):
        restaurant = Restaurant.objects.create(
            name="Branch Test Restaurant",
            email="branch-test@example.com",
            phone="0700000000",
            address="Test address",
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
            name="Branch Two",
            code="BR-2",
            is_active=True,
        )
        return restaurant, branch

    def test_empty_branch_ids_falls_back_to_active_branch_for_branch_role(self):
        restaurant, branch = self.create_restaurant_and_branch()

        serializer = StaffSerializer(
            data={
                "name": "Branch Waiter",
                "role": "Waiter",
                "email": "branch-waiter@example.com",
                "phone": "0700000001",
                "status": "Active",
                "branch_ids": [],
            },
            context={"restaurant": restaurant, "branch": branch},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        staff = serializer.save(restaurant=restaurant)

        self.assertEqual(staff.active_branch, branch)
        self.assertEqual(list(staff.branches.values_list("id", flat=True)), [branch.id])
        self.assertEqual(Staff.objects.get(id=staff.id).active_branch, branch)

    def test_stale_branch_ids_falls_back_to_active_branch_for_branch_role(self):
        restaurant, branch = self.create_restaurant_and_branch()

        serializer = StaffSerializer(
            data={
                "name": "Branch Cashier",
                "role": "Cashier",
                "email": "branch-cashier@example.com",
                "phone": "0700000003",
                "status": "Active",
                "branch_ids": [999999],
            },
            context={"restaurant": restaurant, "branch": branch},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        staff = serializer.save(restaurant=restaurant)

        self.assertEqual(staff.active_branch, branch)
        self.assertEqual(list(staff.branches.values_list("id", flat=True)), [branch.id])

    def test_stale_branch_header_falls_back_to_saved_active_branch(self):
        restaurant, branch = self.create_restaurant_and_branch()
        user = User.objects.create_user(username="admin", password="password")
        Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name="Admin",
            role="Admin",
            email="admin@example.com",
            phone="0700000002",
        )
        request = RequestFactory().get("/", HTTP_X_BRANCH_ID="999999")
        request.user = user

        self.assertEqual(get_active_branch(request, raise_exception=False), branch)

    def test_branch_admin_header_for_another_branch_is_denied(self):
        restaurant, branch = self.create_restaurant_and_branch()
        other_branch = Branch.objects.create(
            restaurant=restaurant,
            name="Other Branch",
            code="BR-3",
            is_active=True,
        )
        user = User.objects.create_user(username="branch-admin", password="password")
        staff = Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name="Branch Admin",
            role="BranchAdmin",
            email="branch-admin@example.com",
            phone="0700000004",
        )
        staff.branches.add(branch)

        request = RequestFactory().get("/", HTTP_X_BRANCH_ID=str(other_branch.id))
        request.user = user

        with self.assertRaises(PermissionDenied):
            get_active_branch(request, raise_exception=False)

    def test_branch_admin_cannot_request_all_branches(self):
        restaurant, branch = self.create_restaurant_and_branch()
        user = User.objects.create_user(username="branch-admin-all", password="password")
        staff = Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name="Branch Admin All",
            role="BranchAdmin",
            email="branch-admin-all@example.com",
            phone="0700000005",
        )
        staff.branches.add(branch)

        request = RequestFactory().get("/", {"branch": "all"})
        request.user = user

        with self.assertRaises(PermissionDenied):
            get_requested_branch(request, allow_all=True, raise_exception=False)

    def test_branch_admin_cannot_assign_created_user_to_another_branch(self):
        restaurant, branch = self.create_restaurant_and_branch()
        other_branch = Branch.objects.create(
            restaurant=restaurant,
            name="Other Branch",
            code="BR-4",
            is_active=True,
        )
        user = User.objects.create_user(username="branch-admin-create", password="password")
        staff = Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name="Branch Admin Create",
            role="BranchAdmin",
            email="branch-admin-create@example.com",
            phone="0700000006",
        )
        staff.branches.add(branch)

        request = RequestFactory().post("/")
        request.user = user
        serializer = StaffSerializer(
            data={
                "name": "Cross Branch Cashier",
                "role": "Cashier",
                "email": "cross-branch-cashier@example.com",
                "phone": "0700000007",
                "status": "Active",
                "branch_ids": [other_branch.id],
            },
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )

        with self.assertRaises(PermissionDenied):
            serializer.is_valid()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class PayrollGenerationTests(TestCase):
    def test_selected_staff_payroll_uses_staff_base_salary_on_create(self):
        restaurant = Restaurant.objects.create(
            name="Payroll Test Restaurant",
            email="payroll-test@example.com",
            phone="0710000000",
            address="Test address",
        )
        Subscription.objects.create(
            restaurant=restaurant,
            starts_at=date.today() - timedelta(days=1),
            expires_at=date.today() + timedelta(days=30),
            max_branches=2,
            is_active=True,
        )
        branch = Branch.objects.create(
            restaurant=restaurant,
            name="Main Branch",
            code="MAIN",
            is_main_branch=True,
            is_active=True,
        )
        staff = Staff.objects.create(
            restaurant=restaurant,
            active_branch=branch,
            name="Payroll Waiter",
            role="Waiter",
            email="payroll-waiter@example.com",
            phone="0710000001",
            status="Active",
            payroll_base_salary=Decimal("5000.00"),
            salary_type=Staff.SALARY_MONTHLY,
            is_payroll_active=True,
        )
        staff.branches.add(branch)

        payrolls = generate_payroll(
            {
                "period_type": Payroll.PERIOD_MONTHLY,
                "period_start": date(2026, 8, 1),
                "period_end": date(2026, 8, 31),
                "staff_ids": [staff.id],
            },
            restaurant=restaurant,
            branch=branch,
        )

        self.assertEqual(len(payrolls), 1)
        self.assertEqual(payrolls[0].base_salary, Decimal("5000.00"))

    def test_staff_lock_query_is_not_distinct(self):
        restaurant = Restaurant.objects.create(
            name="Payroll Lock Restaurant",
            email="payroll-lock@example.com",
            phone="0710000010",
            address="Test address",
        )
        Subscription.objects.create(
            restaurant=restaurant,
            starts_at=date.today() - timedelta(days=1),
            expires_at=date.today() + timedelta(days=30),
            max_branches=3,
            is_active=True,
        )
        branch = Branch.objects.create(
            restaurant=restaurant,
            name="Main Branch",
            code="LOCK-MAIN",
            is_main_branch=True,
            is_active=True,
        )
        other_branch = Branch.objects.create(
            restaurant=restaurant,
            name="Other Branch",
            code="LOCK-OTHER",
            is_active=True,
        )
        staff = Staff.objects.create(
            restaurant=restaurant,
            active_branch=branch,
            name="Payroll Cook",
            role="Kitchen_manager",
            email="payroll-cook@example.com",
            phone="0710000011",
            status="Active",
            payroll_base_salary=Decimal("6000.00"),
            salary_type=Staff.SALARY_MONTHLY,
            is_payroll_active=True,
        )
        staff.branches.add(branch, other_branch)

        original_select_for_update = QuerySet.select_for_update

        def assert_staff_lock_is_not_distinct(queryset, *args, **kwargs):
            if queryset.model is Staff:
                self.assertFalse(queryset.query.distinct)
            return original_select_for_update(queryset, *args, **kwargs)

        with patch.object(QuerySet, "select_for_update", assert_staff_lock_is_not_distinct):
            payrolls = generate_payroll(
                {
                    "period_type": Payroll.PERIOD_MONTHLY,
                    "period_start": date(2026, 8, 1),
                    "period_end": date(2026, 8, 31),
                },
                restaurant=restaurant,
                branch=branch,
            )

        self.assertEqual(len(payrolls), 1)


RATE_LIMIT_TEST_CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "login-rate-limit-tests",
    }
}


@override_settings(CACHES=RATE_LIMIT_TEST_CACHES, DEBUG=True)
class LoginRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        LoginRateLimitConfig.load()
        LoginRateLimitConfig.objects.filter(pk=1).update(
            enabled=True,
            max_failed_attempts=2,
            window_minutes=5,
            lockout_minutes=1,
        )
        self.config = LoginRateLimitConfig.load()

    def create_staff_user(self, username="staff-login", password="correct-password"):
        user = User.objects.create_user(username=username, password=password)
        Staff.objects.create(
            user=user,
            name="Staff Login",
            role="Admin",
            email=f"{username}@example.com",
            phone=f"079{User.objects.count():07d}",
            status="Active",
        )
        return user

    def test_staff_login_blocks_after_configured_failed_attempts(self):
        self.create_staff_user()

        for _ in range(2):
            response = self.client.post(
                "/api/users/token/",
                {"username": "staff-login", "password": "wrong"},
                format="json",
                REMOTE_ADDR="10.0.0.10",
            )
            self.assertEqual(response.status_code, 401)

        response = self.client.post(
            "/api/users/token/",
            {"username": "staff-login", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.10",
        )

        self.assertEqual(response.status_code, 429)
        self.assertIn("Retry-After", response)
        self.assertGreaterEqual(response.data["retry_after"], 1)

    def test_successful_staff_login_resets_failed_attempts(self):
        self.create_staff_user()

        self.client.post(
            "/api/users/token/",
            {"username": "staff-login", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.11",
        )
        response = self.client.post(
            "/api/users/token/",
            {"username": "staff-login", "password": "correct-password"},
            format="json",
            REMOTE_ADDR="10.0.0.11",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            "/api/users/token/",
            {"username": "staff-login", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.11",
        )
        self.assertEqual(response.status_code, 401)

    def test_staff_and_customer_namespaces_are_separate(self):
        self.create_staff_user()

        for _ in range(2):
            self.client.post(
                "/api/users/token/",
                {"username": "staff-login", "password": "wrong"},
                format="json",
                REMOTE_ADDR="10.0.0.12",
            )

        customer_response = self.client.post(
            "/api/customer/login/",
            {"username": "missing-customer", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.12",
        )
        self.assertEqual(customer_response.status_code, 401)

    def test_customer_login_resets_after_success(self):
        user = User.objects.create_user(username="customer-login", password="correct-password")
        Customer.objects.create(user=user, phone="0700000009", address="Test address")

        self.client.post(
            "/api/customer/login/",
            {"username": "customer-login", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.13",
        )
        response = self.client.post(
            "/api/customer/login/",
            {"username": "customer-login", "password": "correct-password"},
            format="json",
            REMOTE_ADDR="10.0.0.13",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            "/api/customer/login/",
            {"username": "customer-login", "password": "wrong"},
            format="json",
            REMOTE_ADDR="10.0.0.13",
        )
        self.assertEqual(response.status_code, 401)

    def test_super_admin_can_manage_login_rate_limit_config(self):
        superuser = User.objects.create_superuser(
            username="super",
            email="super@example.com",
            password="password",
        )
        self.client.force_authenticate(user=superuser)

        response = self.client.patch(
            "/api/users/security/login-rate-limit/",
            {
                "enabled": False,
                "max_failed_attempts": 7,
                "window_minutes": 10,
                "lockout_minutes": 20,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["enabled"])
        self.assertEqual(response.data["max_failed_attempts"], 7)

    def test_regular_staff_cannot_manage_login_rate_limit_config(self):
        user = self.create_staff_user(username="regular-staff")
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/users/security/login-rate-limit/")

        self.assertEqual(response.status_code, 403)
