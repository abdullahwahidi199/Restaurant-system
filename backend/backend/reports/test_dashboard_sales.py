from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from menu.models import Category, MenuItem
from orders.models import Order, OrderItem
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


class DashboardSalesTests(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.restaurant = Restaurant.objects.create(
            name="Graph Kitchen", email="graph@example.com", phone="0700000000",
            address="Kabul", is_active=True,
        )
        Subscription.objects.create(
            restaurant=self.restaurant, starts_at=self.today - timedelta(days=2),
            expires_at=self.today + timedelta(days=30), max_branches=4, is_active=True,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant, name="Central", code="GRAPH-CENTRAL",
            is_main_branch=True, is_active=True,
        )
        self.other_branch = Branch.objects.create(
            restaurant=self.restaurant, name="West", code="GRAPH-WEST", is_active=True,
        )
        self.user = User.objects.create_user("graph-admin", password="test-password")
        self.staff = Staff.objects.create(
            user=self.user, restaurant=self.restaurant, active_branch=self.branch,
            name="Graph Admin", role="Admin", email="graph-admin@example.com",
            phone="0700000001", status="Active",
        )
        self.staff.branches.add(self.branch, self.other_branch)
        category = Category.objects.create(
            restaurant=self.restaurant, branch=self.branch, name="Meals",
        )
        self.item = MenuItem.objects.create(
            restaurant=self.restaurant, branch=self.branch, category=category,
            name="Graph meal", price=Decimal("999.00"),
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def sale(self, day, *, price="100.00", quantity=1, discount="0.00", status="completed", branch=None, at=time(12)):
        branch = branch or self.branch
        order = Order.objects.create(
            restaurant=branch.restaurant, branch=branch, order_type="takeaway",
            name="Walk-in", status=status, discount_percent=Decimal(discount),
        )
        OrderItem.objects.create(
            order=order, menu_item=self.item, quantity=quantity,
            price_at_order=Decimal(price), status="approved",
        )
        Order.objects.filter(pk=order.pk).update(
            created_at=timezone.make_aware(datetime.combine(day, at)),
        )
        return order

    def report(self, start, end, **params):
        return self.client.get(
            "/api/reports/dashboard-sales/",
            {"start_date": start.isoformat(), "end_date": end.isoformat(), **params},
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )

    def test_complete_local_dates_snapshot_prices_and_previous_period(self):
        start = date(self.today.year - 1, 3, 10)
        end = start + timedelta(days=2)
        order = self.sale(start, quantity=2, discount="10.00", at=time.min)
        OrderItem.objects.create(
            order=order, menu_item=self.item, quantity=5,
            price_at_order=Decimal("100.00"), status="cancelled",
        )
        self.sale(end, price="50.00", status="delivered", at=time(23, 59, 59))
        self.sale(start - timedelta(days=1), price="100.00")
        self.sale(end + timedelta(days=1), price="900.00", at=time.min)
        self.sale(start, price="500.00", status="pending")
        self.sale(start, price="500.00", status="cancelled")
        self.sale(start, price="700.00", branch=self.other_branch)

        response = self.report(start, end)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["totals"], {
            "revenue": 230.0, "orders": 2,
            "average_order_value": 115.0, "daily_average_revenue": 76.67,
        })
        self.assertEqual([row["orders"] for row in data["series"]], [1, 0, 1])
        self.assertEqual([row["revenue"] for row in data["series"]], [180.0, 0.0, 50.0])
        self.assertEqual(data["range"]["timezone"], "Asia/Kabul")
        self.assertEqual(data["comparison"]["revenue"], 100.0)
        self.assertEqual(data["comparison"]["revenue_change_percent"], 130.0)
        self.assertEqual(data["comparison"]["start_date"], (start - timedelta(days=3)).isoformat())

    def test_last_year_returns_all_twelve_months_and_historical_sales(self):
        year = self.today.year - 1
        self.sale(date(year, 1, 15), price="100.00")
        self.sale(date(year, 2, 20), price="200.00")
        self.sale(date(year, 12, 31), price="300.00")
        data = self.report(date(year, 1, 1), date(year, 12, 31)).json()
        self.assertEqual(data["range"]["interval"], "month")
        self.assertEqual(len(data["series"]), 12)
        self.assertEqual(data["totals"]["revenue"], 600.0)
        self.assertEqual(data["totals"]["orders"], 3)
        self.assertEqual(data["series"][-1]["end_date"], f"{year}-12-31")

    def test_weekly_buckets_clip_to_selected_dates(self):
        start = date(2025, 5, 7)  # Wednesday
        end = date(2025, 5, 13)  # Tuesday
        self.sale(start, price="10.00")
        self.sale(date(2025, 5, 12), price="20.00")
        data = self.report(start, end, interval="week").json()
        self.assertEqual(
            [(row["date"], row["end_date"]) for row in data["series"]],
            [("2025-05-07", "2025-05-11"), ("2025-05-12", "2025-05-13")],
        )
        self.assertEqual([row["revenue"] for row in data["series"]], [10.0, 20.0])

    def test_monthly_buckets_handle_leap_year_and_partial_months(self):
        data = self.report(date(2024, 2, 15), date(2024, 3, 3), interval="month").json()
        self.assertEqual(
            [(row["date"], row["end_date"]) for row in data["series"]],
            [("2024-02-15", "2024-02-29"), ("2024-03-01", "2024-03-03")],
        )

    def test_default_period_is_exactly_thirty_days_with_zero_sales_days(self):
        response = self.client.get("/api/reports/dashboard-sales/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["range"]["days"], 30)
        self.assertEqual(data["range"]["start_date"], (self.today - timedelta(days=29)).isoformat())
        self.assertEqual(data["range"]["end_date"], self.today.isoformat())
        self.assertEqual(len(data["series"]), 30)
        self.assertEqual(data["totals"]["revenue"], 0)
        self.assertIsNone(data["comparison"]["revenue_change_percent"])

    def test_invalid_and_reversed_ranges_are_rejected(self):
        cases = [
            {"start_date": "2025-02-30", "end_date": "2025-03-10"},
            {"start_date": "2025-03-11", "end_date": "2025-03-10"},
            {"start_date": self.today.isoformat(), "end_date": (self.today + timedelta(days=1)).isoformat()},
            {"interval": "year"},
        ]
        for params in cases:
            with self.subTest(params=params):
                self.assertEqual(self.client.get("/api/reports/dashboard-sales/", params).status_code, 400)

    def test_all_branch_scope_does_not_expose_another_restaurant(self):
        other_restaurant = Restaurant.objects.create(name="Other Kitchen", email="other-graph@example.com")
        Subscription.objects.create(
            restaurant=other_restaurant, starts_at=self.today - timedelta(days=2),
            expires_at=self.today + timedelta(days=30), max_branches=2, is_active=True,
        )
        foreign_branch = Branch.objects.create(
            restaurant=other_restaurant, name="Private", code="GRAPH-PRIVATE", is_active=True,
        )
        self.sale(self.today, price="100.00")
        self.sale(self.today, price="200.00", branch=self.other_branch)
        self.sale(self.today, price="999.00", branch=foreign_branch)
        data = self.report(self.today, self.today, branch="all").json()
        self.assertEqual(data["totals"]["revenue"], 300.0)
        self.assertEqual(self.report(self.today, self.today, branch=foreign_branch.id).status_code, 403)

    def test_branch_admin_cannot_expand_scope_and_login_is_required(self):
        self.staff.role = "BranchAdmin"
        self.staff.save(update_fields=["role"])
        self.assertEqual(self.report(self.today, self.today, branch="all").status_code, 403)
        self.assertEqual(self.report(self.today, self.today, branch=self.other_branch.id).status_code, 403)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.report(self.today, self.today).status_code, 401)
