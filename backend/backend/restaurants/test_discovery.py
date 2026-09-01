import shutil
import tempfile
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from customers.models import Customer
from menu.models import Category, MenuItem, Platter, Review
from restaurants.models import Branch, Restaurant, Subscription
from restaurants.views import get_discovery_limit


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class RestaurantDiscoveryApiTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.counter = 0

    def create_restaurant(self, name, **restaurant_fields):
        self.counter += 1
        restaurant_fields.setdefault("show_on_landing", True)
        restaurant = Restaurant.objects.create(
            name=name,
            email=f"restaurant-{self.counter}@example.com",
            phone=f"070000{self.counter:04d}",
            address=restaurant_fields.pop("address", f"{name} address"),
            **restaurant_fields,
        )
        subscription = Subscription.objects.create(
            restaurant=restaurant,
            starts_at=date.today() - timedelta(days=1),
            expires_at=date.today() + timedelta(days=30),
            max_branches=5,
            is_active=True,
        )
        return restaurant, subscription

    def create_branch(self, restaurant, name="Main Branch", **branch_fields):
        self.counter += 1
        return Branch.objects.create(
            restaurant=restaurant,
            name=name,
            code=f"B-{self.counter}",
            address=branch_fields.pop("address", f"{name} address"),
            **branch_fields,
        )

    def test_anonymous_discovery_only_returns_operational_restaurants(self):
        visible, _subscription = self.create_restaurant("Visible Kitchen")
        self.create_branch(visible)

        inactive, _subscription = self.create_restaurant("Inactive Kitchen")
        self.create_branch(inactive)
        Restaurant.objects.filter(pk=inactive.pk).update(is_active=False)

        expired, expired_subscription = self.create_restaurant("Expired Kitchen")
        self.create_branch(expired)
        Subscription.objects.filter(pk=expired_subscription.pk).update(
            expires_at=date.today() - timedelta(days=1)
        )

        disabled, disabled_subscription = self.create_restaurant("Disabled Kitchen")
        self.create_branch(disabled)
        Subscription.objects.filter(pk=disabled_subscription.pk).update(is_active=False)

        branchless, _subscription = self.create_restaurant("Branchless Kitchen")
        inactive_branch = self.create_branch(branchless)
        Branch.objects.filter(pk=inactive_branch.pk).update(is_active=False)

        response = self.client.get("/api/restaurant/discovery/")
        stale_token_response = self.client.get(
            "/api/restaurant/discovery/",
            HTTP_AUTHORIZATION="Bearer definitely-not-a-valid-token",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(stale_token_response.status_code, 200)
        self.assertEqual(
            [restaurant["name"] for restaurant in response.data["restaurants"]],
            ["Visible Kitchen"],
        )
        self.assertEqual(set(response.data), {"restaurants", "cuisines", "dishes"})

    def test_landing_visibility_only_controls_curated_collections(self):
        visible, _subscription = self.create_restaurant("Marketplace Kitchen")
        self.create_branch(visible)
        hidden, _subscription = self.create_restaurant(
            "Test Kitchen",
            show_on_landing=False,
        )
        self.create_branch(hidden)

        default_response = self.client.get("/api/restaurant/discovery/")
        search_response = self.client.get(
            "/api/restaurant/discovery/",
            {"q": "Test Kitchen"},
        )
        hidden_public_response = self.client.get(
            f"/api/restaurant/public/{hidden.slug}/"
        )

        self.assertEqual(default_response.status_code, 200)
        self.assertEqual(
            [restaurant["name"] for restaurant in default_response.data["restaurants"]],
            ["Marketplace Kitchen"],
        )
        self.assertEqual(search_response.status_code, 200)
        self.assertEqual(
            [restaurant["name"] for restaurant in search_response.data["restaurants"]],
            ["Test Kitchen"],
        )
        self.assertEqual(search_response.data["cuisines"], [])
        self.assertEqual(search_response.data["dishes"], [])
        self.assertEqual(hidden_public_response.status_code, 200)
        self.assertEqual(
            hidden_public_response.data["restaurant"]["id"],
            hidden.id,
        )

    def test_superadmin_can_enable_restaurant_for_landing(self):
        restaurant, _subscription = self.create_restaurant(
            "Pending Marketplace Kitchen",
            show_on_landing=False,
        )
        self.create_branch(restaurant)
        superadmin = get_user_model().objects.create_superuser(
            username="marketplace-superadmin",
            email="superadmin@example.com",
            password="safe-password-123",
        )
        self.client.force_authenticate(user=superadmin)

        update_response = self.client.patch(
            f"/api/restaurant/restaurants/{restaurant.id}/",
            {"show_on_landing": True},
            format="json",
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertTrue(update_response.data["show_on_landing"])
        restaurant.refresh_from_db()
        self.assertTrue(restaurant.show_on_landing)

        self.client.force_authenticate(user=None)
        discovery_response = self.client.get("/api/restaurant/discovery/")
        self.assertEqual(discovery_response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in discovery_response.data["restaurants"]],
            [restaurant.id],
        )

    def test_new_restaurants_default_to_hidden(self):
        restaurant = Restaurant.objects.create(
            name="Newly Provisioned Kitchen",
            email="newly-provisioned@example.com",
            phone="0700999999",
            address="Kabul",
        )

        self.assertFalse(restaurant.show_on_landing)

    def test_response_uses_real_branches_menu_categories_and_reviews(self):
        restaurant, _subscription = self.create_restaurant(
            "Saffron Table",
            slogan="Afghan favorites",
            min_order_amount=Decimal("250.00"),
            opening_hours="08:00 - 22:00",
        )
        active_branch = self.create_branch(
            restaurant,
            name="Wazir Akbar Khan",
            is_main_branch=True,
        )
        inactive_branch = self.create_branch(restaurant, name="Closed Location")
        Branch.objects.filter(pk=inactive_branch.pk).update(is_active=False)

        category = Category.objects.create(
            restaurant=restaurant,
            branch=active_branch,
            name="Afghan",
            name_dari="افغان",
            name_pashto="افغاني",
            rank=1,
        )
        menu_item = MenuItem.objects.create(
            restaurant=restaurant,
            branch=active_branch,
            category=category,
            name="Chicken Mantoo",
            name_dari="منتوی مرغ",
            name_pashto="د چرګ منتو",
            price=Decimal("220.00"),
            is_available=True,
            is_manually_available=True,
        )
        MenuItem.objects.create(
            restaurant=restaurant,
            branch=active_branch,
            category=category,
            name="Unavailable Dish",
            price=Decimal("100.00"),
            is_available=False,
            is_manually_available=True,
        )
        Platter.objects.create(
            restaurant=restaurant,
            branch=active_branch,
            category=category,
            name="Family Kabuli Platter",
            price=Decimal("850.00"),
            is_available=True,
            is_manually_available=True,
        )
        customer = Customer.objects.create(phone="0700111222", address="Kabul")
        Review.objects.create(
            customer=customer,
            restaurant=restaurant,
            branch=active_branch,
            menu_item=menu_item,
            rating=5,
        )
        Review.objects.create(
            customer=customer,
            restaurant=restaurant,
            branch=active_branch,
            rating=3,
        )

        response = self.client.get("/api/restaurant/discovery/")

        self.assertEqual(response.status_code, 200)
        result = response.data["restaurants"][0]
        self.assertEqual(result["rating"], 4.0)
        self.assertEqual(result["review_count"], 2)
        self.assertEqual(result["cuisines"], ["Afghan"])
        self.assertEqual(result["cuisine_details"][0]["name_dari"], "افغان")
        self.assertEqual([branch["name"] for branch in result["branches"]], ["Wazir Akbar Khan"])
        self.assertEqual(
            {dish["name"] for dish in result["dishes"]},
            {"Chicken Mantoo", "Family Kabuli Platter"},
        )
        self.assertEqual(
            {dish["type"] for dish in result["dishes"]},
            {"menu_item", "platter"},
        )
        self.assertIsNone(result["distance_km"])
        self.assertIsNone(result["delivers_to_location"])
        self.assertIsNone(result["is_open"])
        self.assertNotIn("estimated_delivery_minutes", result)
        self.assertEqual([cuisine["name"] for cuisine in response.data["cuisines"]], ["Afghan"])
        self.assertEqual(response.data["cuisines"][0]["name_pashto"], "افغاني")
        self.assertEqual(
            next(
                dish for dish in response.data["dishes"]
                if dish["name"] == "Chicken Mantoo"
            )["name_dari"],
            "منتوی مرغ",
        )
        self.assertEqual(
            {dish["name"] for dish in response.data["dishes"]},
            {"Chicken Mantoo", "Family Kabuli Platter"},
        )

    def test_search_matches_restaurant_branch_category_item_and_platter(self):
        restaurant, _subscription = self.create_restaurant(
            "Garden Kitchen",
            slogan="Traditional comfort food",
            address="Flower Street",
        )
        branch = self.create_branch(
            restaurant,
            name="Kart-e-Char Branch",
            address="University Road",
        )
        category = Category.objects.create(
            restaurant=restaurant,
            branch=branch,
            name="Afghan Classics",
            name_dari="غذاهای افغانی",
            name_pashto="افغان خواړه",
        )
        MenuItem.objects.create(
            restaurant=restaurant,
            branch=branch,
            category=category,
            name="Beef Mantoo",
            name_pashto="د غوښې منتو",
            price=Decimal("200.00"),
        )
        Platter.objects.create(
            restaurant=restaurant,
            branch=branch,
            category=category,
            name="Celebration Tray",
            name_dari="سینی مهمانی",
            price=Decimal("750.00"),
        )
        other, _subscription = self.create_restaurant("Coffee Corner")
        self.create_branch(other, name="Downtown")

        for query in [
            "Garden",
            "comfort",
            "Flower",
            "Kart-e-Char",
            "University",
            "Afghan Classics",
            "غذاهای افغانی",
            "افغان خواړه",
            "Beef Mantoo",
            "د غوښې منتو",
            "Celebration Tray",
            "سینی مهمانی",
        ]:
            with self.subTest(query=query):
                response = self.client.get(
                    "/api/restaurant/discovery/",
                    {"q": query},
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    [item["name"] for item in response.data["restaurants"]],
                    ["Garden Kitchen"],
                )

        no_results = self.client.get(
            "/api/restaurant/discovery/",
            {"q": "does-not-exist"},
        )
        self.assertEqual(no_results.status_code, 200)
        self.assertEqual(no_results.data, {"restaurants": [], "cuisines": [], "dishes": []})

    def test_location_uses_closest_active_branch_and_effective_delivery_radius(self):
        near, _subscription = self.create_restaurant(
            "Nearby Kitchen",
            latitude=34.5000,
            longitude=69.2000,
            delivery_available=True,
            delivery_radius_km=Decimal("3.00"),
        )
        near_branch = self.create_branch(
            near,
            name="Nearby Branch",
            latitude=None,
            longitude=None,
            delivery_available=None,
            delivery_radius_km=None,
        )

        far, _subscription = self.create_restaurant(
            "Far Kitchen",
            latitude=35.5000,
            longitude=69.2000,
            delivery_available=True,
            delivery_radius_km=Decimal("5.00"),
        )
        far_branch = self.create_branch(
            far,
            name="Far Branch",
            latitude=35.5000,
            longitude=69.2000,
            delivery_available=True,
            delivery_radius_km=Decimal("5.00"),
        )
        unknown, _subscription = self.create_restaurant(
            "Unknown Distance Kitchen",
            latitude=None,
            longitude=None,
            delivery_available=True,
        )
        self.create_branch(
            unknown,
            name="Unmapped Branch",
            latitude=None,
            longitude=None,
            delivery_available=True,
        )

        response = self.client.get(
            "/api/restaurant/discovery/",
            {"lat": "34.5000", "lng": "69.2000"},
        )

        self.assertEqual(response.status_code, 200)
        results_by_id = {
            restaurant["id"]: restaurant
            for restaurant in response.data["restaurants"]
        }
        nearby_result = results_by_id[near.id]
        far_result = results_by_id[far.id]
        unknown_result = results_by_id[unknown.id]
        self.assertEqual(nearby_result["id"], near.id)
        self.assertEqual(nearby_result["distance_km"], 0.0)
        self.assertTrue(nearby_result["delivers_to_location"])
        self.assertEqual(nearby_result["branches"][0]["id"], near_branch.id)
        self.assertTrue(nearby_result["branches"][0]["delivers_to_location"])
        self.assertEqual(far_result["id"], far.id)
        self.assertGreater(far_result["distance_km"], 100)
        self.assertFalse(far_result["delivers_to_location"])
        self.assertEqual(far_result["branches"][0]["id"], far_branch.id)
        self.assertIsNone(unknown_result["distance_km"])
        self.assertIsNone(unknown_result["delivers_to_location"])

    def test_location_validation_and_limit_cap_are_safe(self):
        self.assertEqual(get_discovery_limit("10000"), 50)
        self.assertEqual(get_discovery_limit("bad"), 24)
        self.assertEqual(get_discovery_limit("0"), 1)

        missing_longitude = self.client.get(
            "/api/restaurant/discovery/",
            {"lat": "34.5"},
        )
        invalid_latitude = self.client.get(
            "/api/restaurant/discovery/",
            {"lat": "91", "lng": "69.2"},
        )

        self.assertEqual(missing_longitude.status_code, 400)
        self.assertEqual(invalid_latitude.status_code, 400)
