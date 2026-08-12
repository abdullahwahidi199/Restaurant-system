import shutil
import tempfile
from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase, override_settings

from inventory.models import Ingredient, MenuItemIngredient, StockMovement
from menu.models import Category, MenuItem, Platter, PlatterItem
from restaurants.data_migration import run_branch_data_migration
from restaurants.models import Branch, BranchDataMigrationLog, Restaurant, Subscription


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


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
