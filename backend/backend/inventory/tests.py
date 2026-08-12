from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.test.client import RequestFactory

from inventory.models import Ingredient
from inventory.serializers import MenuItemIngredientSerializer
from menu.models import Category, MenuItem
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


class MenuItemIngredientSerializerTests(TestCase):
    def test_active_branch_can_add_recipe_to_shared_menu_item(self):
        restaurant = Restaurant.objects.create(
            name="Recipe Test Restaurant",
            email="recipe-test@example.com",
            phone="0720000000",
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
        user = User.objects.create_user(username="recipe-admin", password="password")
        staff = Staff.objects.create(
            user=user,
            restaurant=restaurant,
            active_branch=branch,
            name="Recipe Admin",
            role="Admin",
            email="recipe-admin@example.com",
            phone="0720000001",
            status="Active",
        )
        staff.branches.add(branch)
        category = Category.objects.create(
            restaurant=restaurant,
            branch=None,
            name="Shared Category",
        )
        menu_item = MenuItem.objects.create(
            restaurant=restaurant,
            branch=None,
            category=category,
            name="Shared Rice",
            price=Decimal("120.00"),
        )
        ingredient = Ingredient.objects.create(
            restaurant=restaurant,
            branch=branch,
            name="Rice",
            unit="kg",
            quantity_available=Decimal("20.000"),
            minimum_threshold=Decimal("1.000"),
            cost_per_unit=Decimal("30.00"),
        )
        request = RequestFactory().post("/", HTTP_X_BRANCH_ID=str(branch.id))
        request.user = user

        serializer = MenuItemIngredientSerializer(
            data={
                "menu_item": menu_item.id,
                "ingredient": ingredient.id,
                "quantity_required": "0.250",
            },
            context={"request": request},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
