import shutil
import tempfile
from datetime import date, timedelta

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from menu.models import Category, MenuItem
from restaurants.models import Branch, Restaurant, Subscription


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
