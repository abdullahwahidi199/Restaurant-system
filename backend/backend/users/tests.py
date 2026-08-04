import shutil
import tempfile

from django.test import TestCase, override_settings
from django.test.client import RequestFactory
from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied

from restaurants.branching import get_active_branch, get_requested_branch
from restaurants.models import Branch, Restaurant
from users.models import Staff
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
