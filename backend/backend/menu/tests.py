import shutil
import tempfile
from datetime import date, timedelta

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from django.contrib.auth.models import User

from menu.models import Category, MenuItem, Platter
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class PublicMenuCategoryTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.restaurant = Restaurant.objects.create(
            name="Afiat",
            email="afiat-menu@example.com",
            phone="0700000200",
            address="Test address",
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
            name="Main",
            code="MAIN",
            is_main_branch=True,
            is_active=True,
        )

    def test_public_categories_only_include_items_assigned_to_that_category(self):
        meat = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Meat",
            rank=1,
        )
        drinks = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Drinks",
            rank=2,
        )
        shami = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=meat,
            name="Shami",
            price=250,
        )
        juice = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=drinks,
            name="Juice",
            price=90,
        )

        response = self.client.get(
            f"/api/menu/public/{self.restaurant.slug}/categories/",
        )

        self.assertEqual(response.status_code, 200)
        categories = {category["name"]: category for category in response.data}

        self.assertEqual(
            [item["id"] for item in categories["Meat"]["menu_items"]],
            [shami.id],
        )
        self.assertEqual(
            [item["id"] for item in categories["Drinks"]["menu_items"]],
            [juice.id],
        )
        self.assertEqual(categories["Meat"]["menu_items"][0]["category"], meat.id)
        self.assertEqual(categories["Drinks"]["menu_items"][0]["category"], drinks.id)

    def test_public_categories_include_unavailable_menu_items_and_platters(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Specials",
            rank=1,
        )
        available_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Kabuli",
            price=250,
        )
        unavailable_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Mantu",
            price=180,
            is_available=False,
        )
        unavailable_platter = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Family Platter",
            price=900,
            is_manually_available=False,
        )

        response = self.client.get(
            f"/api/menu/public/{self.restaurant.slug}/categories/",
        )

        self.assertEqual(response.status_code, 200)
        public_category = response.data[0]
        menu_items = {item["name"]: item for item in public_category["menu_items"]}
        platters = {platter["name"]: platter for platter in public_category["platters"]}

        self.assertIn(available_item.name, menu_items)
        self.assertIn(unavailable_item.name, menu_items)
        self.assertTrue(menu_items[available_item.name]["final_availability"])
        self.assertFalse(menu_items[unavailable_item.name]["final_availability"])
        self.assertIn(unavailable_platter.name, platters)
        self.assertFalse(platters[unavailable_platter.name]["final_availability"])

    def test_public_detail_endpoints_allow_unavailable_entries(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Unavailable",
            rank=1,
        )
        unavailable_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Bolani",
            price=120,
            is_manually_available=False,
        )
        unavailable_platter = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Lunch Platter",
            price=500,
            is_available=False,
        )

        item_response = self.client.get(
            f"/api/menu/public/{self.restaurant.slug}/menu-items/{unavailable_item.id}/",
        )
        platter_response = self.client.get(
            f"/api/menu/public/{self.restaurant.slug}/platters/{unavailable_platter.id}/",
        )

        self.assertEqual(item_response.status_code, 200)
        self.assertFalse(item_response.data["final_availability"])
        self.assertEqual(platter_response.status_code, 200)
        self.assertFalse(platter_response.data["final_availability"])


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class MenuOrderingTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.restaurant = Restaurant.objects.create(
            name="Order House",
            email="order-house@example.com",
            phone="0700000300",
            address="Test address",
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
            name="Main",
            code="MAIN",
            is_main_branch=True,
            is_active=True,
        )
        self.user = User.objects.create_user(
            username="menu-admin",
            password="pass",
        )
        self.staff = Staff.objects.create(
            user=self.user,
            name="Menu Admin",
            email="menu-admin@example.com",
            phone="0700000301",
            role="Admin",
            restaurant=self.restaurant,
            active_branch=self.branch,
        )
        self.staff.branches.add(self.branch)
        self.client.force_authenticate(self.user)
        self.client.defaults["HTTP_X_BRANCH_ID"] = str(self.branch.id)

    def test_public_categories_return_entries_in_display_order(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Main dishes",
            rank=1,
        )
        third = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Third",
            price=1,
            display_order=2,
        )
        first = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="First",
            price=1,
            display_order=0,
        )
        second = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Second",
            price=1,
            display_order=1,
        )

        response = self.client.get(
            f"/api/menu/public/{self.restaurant.slug}/categories/",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in response.data[0]["menu_items"]],
            [first.id, second.id, third.id],
        )

    def test_reorder_endpoint_persists_menu_items_and_platters(self):
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Popular",
            rank=1,
        )
        pizza = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Pizza",
            price=1,
            display_order=0,
        )
        combo = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Combo",
            price=2,
            display_order=1,
        )
        fries = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=category,
            name="Fries",
            price=1,
            display_order=2,
        )

        response = self.client.post(
            "/api/menu/menu-items/reorder/",
            {
                "category_id": category.id,
                "items": [
                    {"id": combo.id, "type": "platter"},
                    {"id": fries.id, "type": "menu_item"},
                    {"id": pizza.id, "type": "menu_item"},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        pizza.refresh_from_db()
        combo.refresh_from_db()
        fries.refresh_from_db()
        self.assertEqual(combo.display_order, 0)
        self.assertEqual(fries.display_order, 1)
        self.assertEqual(pizza.display_order, 2)

    def test_reorder_rejects_other_branch_entries(self):
        other_branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Other",
            code="OTHER",
            is_active=True,
        )
        category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Main dishes",
            rank=1,
        )
        item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=other_branch,
            category=category,
            name="Other branch item",
            price=1,
            display_order=0,
        )

        response = self.client.post(
            "/api/menu/menu-items/reorder/",
            {
                "category_id": category.id,
                "items": [{"id": item.id, "type": "menu_item"}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
