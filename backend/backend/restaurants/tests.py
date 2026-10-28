import shutil
import tempfile
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from inventory.models import Ingredient, MenuItemIngredient, StockMovement
from menu.models import Category, MenuItem, Platter, PlatterItem
from restaurants.data_migration import run_branch_data_migration
from restaurants.models import Branch, BranchDataMigrationLog, Restaurant, Subscription
from users.models import Staff


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class RestaurantCreationTests(TestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            username="platform-admin",
            email="platform@example.com",
            password="test-password",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.superuser)

    def payload(self, **overrides):
        data = {
            "name": "Atomic Restaurant",
            "email": "atomic@example.com",
            "phone": "0700000900",
            "address": "Atomic address",
            "is_active": True,
            "admin_name": "atomic-admin",
            "admin_email": "atomic-admin@example.com",
            "admin_phone": "0700000901",
            "admin_password": "secure-test-password",
        }
        data.update(overrides)
        return data

    def test_duplicate_admin_username_returns_field_error_without_writes(self):
        response = self.client.post(
            "/api/restaurant/restaurants/",
            self.payload(admin_name=self.superuser.username),
            format="multipart",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("admin_name", response.data)
        self.assertIn("already exists", str(response.data["admin_name"]))
        self.assertFalse(Restaurant.objects.filter(name="Atomic Restaurant").exists())
        self.assertFalse(Staff.objects.filter(email="atomic-admin@example.com").exists())

    def test_unexpected_failure_rolls_back_restaurant_user_branch_and_staff(self):
        with patch(
            "restaurants.views.record_instance_create",
            side_effect=RuntimeError("audit unavailable"),
        ):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    "/api/restaurant/restaurants/",
                    self.payload(),
                    format="multipart",
                )

        self.assertFalse(Restaurant.objects.filter(name="Atomic Restaurant").exists())
        self.assertFalse(Branch.objects.filter(restaurant__name="Atomic Restaurant").exists())
        self.assertFalse(User.objects.filter(username="atomic-admin").exists())
        self.assertFalse(Staff.objects.filter(email="atomic-admin@example.com").exists())

    def test_success_creates_restaurant_main_branch_user_and_admin_staff(self):
        response = self.client.post(
            "/api/restaurant/restaurants/",
            self.payload(),
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        restaurant = Restaurant.objects.get(name="Atomic Restaurant")
        user = User.objects.get(username="atomic-admin")
        staff = Staff.objects.get(user=user)
        main_branch = restaurant.branches.get(is_main_branch=True)

        self.assertEqual(staff.restaurant, restaurant)
        self.assertEqual(staff.role, "Admin")
        self.assertEqual(staff.active_branch, main_branch)
        self.assertTrue(staff.branches.filter(id=main_branch.id).exists())


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class BranchDataMigrationServiceTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.restaurant = Restaurant.objects.create(
            name="Migration Restaurant",
            email="migration@example.com",
            phone="0700000100",
            address="Migration address",
            menu_mode="separate",
            ingredient_mode="separate",
            recipe_mode="separate",
            pricing_mode="branch",
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=date.today() - timedelta(days=1),
            expires_at=date.today() + timedelta(days=30),
            max_branches=5,
            is_active=True,
        )
        self.source = Branch.objects.create(
            restaurant=self.restaurant,
            name="Branch One",
            code="B1",
            is_active=True,
        )
        self.destination = Branch.objects.create(
            restaurant=self.restaurant,
            name="Branch Two",
            code="B2",
            is_active=True,
        )

    def create_source_menu(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.source,
            name="Burgers",
            rank=1,
        )
        ingredient = Ingredient.objects.create(
            restaurant=self.restaurant,
            branch=self.source,
            name="Chicken",
            unit="g",
            quantity_available=1000,
            minimum_threshold=100,
            cost_per_unit=2,
        )
        StockMovement.objects.create(
            restaurant=self.restaurant,
            branch=self.source,
            ingredient=ingredient,
            change_quantity=500,
            unit_cost=2,
            movement_type="purchase",
        )
        item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.source,
            category=category,
            name="Chicken Burger",
            price=150,
            is_available=True,
            is_manually_available=True,
        )
        MenuItemIngredient.objects.create(
            menu_item=item,
            ingredient=ingredient,
            quantity_required=200,
        )
        platter = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.source,
            category=category,
            name="Family Platter",
            price=500,
            is_available=True,
            is_manually_available=True,
        )
        PlatterItem.objects.create(platter=platter, menu_item=item, quantity=2)

    def test_everything_migration_clones_dependencies_into_destination_branch(self):
        self.create_source_menu()

        log = run_branch_data_migration(
            source_branch=self.source,
            destination_branch=self.destination,
            migration_type="everything",
        )

        destination_item = MenuItem.objects.get(
            restaurant=self.restaurant,
            branch=self.destination,
            name="Chicken Burger",
        )
        destination_ingredient = Ingredient.objects.get(
            restaurant=self.restaurant,
            branch=self.destination,
            name="Chicken",
        )
        destination_recipe = MenuItemIngredient.objects.get(
            menu_item=destination_item,
            ingredient=destination_ingredient,
        )
        destination_platter = Platter.objects.get(
            restaurant=self.restaurant,
            branch=self.destination,
            name="Family Platter",
        )

        self.assertEqual(log.status, "completed")
        self.assertEqual(destination_ingredient.quantity_available, Decimal("0.000"))
        self.assertFalse(
            StockMovement.objects.filter(
                restaurant=self.restaurant,
                branch=self.destination,
            ).exists()
        )
        self.assertFalse(log.summary["ingredients"]["stock_quantity_copied"])
        self.assertEqual(destination_recipe.quantity_required, 200)
        self.assertEqual(destination_platter.items.get().menu_item, destination_item)
        self.assertGreater(log.imported_count, 0)

    def test_migration_is_idempotent_and_skips_duplicates(self):
        self.create_source_menu()

        first = run_branch_data_migration(
            self.source,
            self.destination,
            "everything",
        )
        second = run_branch_data_migration(
            self.source,
            self.destination,
            "everything",
        )

        self.assertGreater(first.imported_count, 0)
        self.assertEqual(second.summary["ingredients"]["imported"], 0)
        self.assertEqual(second.summary["menu_items"]["imported"], 0)
        self.assertEqual(second.summary["platters"]["imported"], 0)
        self.assertEqual(
            MenuItem.objects.filter(
                restaurant=self.restaurant,
                branch=self.destination,
                name="Chicken Burger",
            ).count(),
            1,
        )
        self.assertEqual(BranchDataMigrationLog.objects.count(), 2)
