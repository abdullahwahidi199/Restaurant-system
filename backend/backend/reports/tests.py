from datetime import datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from menu.models import Category, MenuItem, Platter, PlatterItem
from orders.models import Order, OrderItem
from reports.services.finance import FinanceReportService
from reports.services.menu_items import MenuItemSalesReportService
from reports.services.orders import OrderReportService
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff


class MenuItemSalesReportTests(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.restaurant = Restaurant.objects.create(
            name="Report Kitchen",
            email="reports@example.com",
            phone="0700000000",
            address="Kabul",
            is_active=True,
        )
        Subscription.objects.create(
            restaurant=self.restaurant,
            starts_at=self.today - timedelta(days=2),
            expires_at=self.today + timedelta(days=30),
            max_branches=4,
            is_active=True,
        )
        self.branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="Central",
            code="CENTRAL",
            is_main_branch=True,
            is_active=True,
        )
        self.other_branch = Branch.objects.create(
            restaurant=self.restaurant,
            name="West",
            code="WEST",
            is_active=True,
        )
        self.user = User.objects.create_user("report-admin", password="password")
        self.staff = Staff.objects.create(
            user=self.user,
            restaurant=self.restaurant,
            active_branch=self.branch,
            name="Report Admin",
            role="Admin",
            email="report-admin@example.com",
            phone="0700000001",
            status="Active",
        )
        self.staff.branches.add(self.branch, self.other_branch)

        self.meals = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Meals",
            name_dari="غذاها",
        )
        self.drinks = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            name="Drinks",
        )
        self.burger = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.meals,
            name="Burger",
            price=Decimal("100.00"),
        )
        self.tea = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.drinks,
            name="Tea",
            price=Decimal("50.00"),
        )
        self.zero_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.meals,
            name="Zero Salad",
            price=Decimal("70.00"),
        )
        self.family_platter = Platter.objects.create(
            restaurant=self.restaurant,
            branch=self.branch,
            category=self.meals,
            name="Family Platter",
            price=Decimal("300.00"),
        )
        PlatterItem.objects.create(
            platter=self.family_platter,
            menu_item=self.burger,
            quantity=Decimal("2.000"),
        )

        discounted = self._order(status="completed", discount="10.00")
        self._item(discounted, self.burger, quantity=2, price="100.00")
        self._item(
            discounted,
            self.burger,
            quantity=5,
            price="100.00",
            status="cancelled",
        )

        delivered = self._order(status="delivered")
        self._item(delivered, self.tea, quantity=1, price="50.00")

        platter_order = self._order(status="completed")
        OrderItem.objects.create(
            order=platter_order,
            platter=self.family_platter,
            quantity=1,
            price_at_order=Decimal("300.00"),
            status="approved",
        )

        cancelled_order = self._order(status="cancelled")
        self._item(cancelled_order, self.burger, quantity=10, price="100.00")

        pending_order = self._order(status="pending")
        self._item(pending_order, self.tea, quantity=20, price="50.00")

        other_branch_category = Category.objects.create(
            restaurant=self.restaurant,
            branch=self.other_branch,
            name="West Meals",
        )
        other_branch_item = MenuItem.objects.create(
            restaurant=self.restaurant,
            branch=self.other_branch,
            category=other_branch_category,
            name="West Burger",
            price=Decimal("900.00"),
        )
        other_branch_order = self._order(
            status="completed", branch=self.other_branch
        )
        self._item(other_branch_order, other_branch_item, quantity=7, price="900.00")

        outside = self._order(status="completed")
        self._item(outside, self.burger, quantity=99, price="100.00")
        outside_dt = timezone.make_aware(
            datetime.combine(self.today - timedelta(days=3), time(hour=12))
        )
        Order.objects.filter(pk=outside.pk).update(created_at=outside_dt)

        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _order(self, *, status, branch=None, discount="0.00"):
        return Order.objects.create(
            restaurant=self.restaurant,
            branch=branch or self.branch,
            order_type="takeaway",
            name="Walk-in",
            status=status,
            discount_percent=Decimal(discount),
            created_by=self.staff,
        )

    @staticmethod
    def _item(order, menu_item, *, quantity, price, status="approved"):
        return OrderItem.objects.create(
            order=order,
            menu_item=menu_item,
            quantity=quantity,
            price_at_order=Decimal(price),
            status=status,
        )

    @property
    def range_value(self):
        return self.today.strftime("%Y-%m-%d")

    def report(self, **params):
        return MenuItemSalesReportService.generate(
            self.range_value,
            self.range_value,
            self.restaurant,
            branch=self.branch,
            params=params,
            paginate=False,
        )

    def test_accurate_quantity_revenue_discount_and_status_rules(self):
        data = self.report()

        self.assertEqual(data["summary"]["distinct_items_sold"], 3)
        self.assertEqual(data["summary"]["total_units_sold"], 4)
        self.assertEqual(data["summary"]["gross_sales"], 550.0)
        self.assertEqual(data["summary"]["total_discount"], 20.0)
        self.assertEqual(data["summary"]["total_revenue"], 530.0)
        self.assertEqual(data["summary"]["average_selling_price"], 132.5)

        burger = next(row for row in data["items"] if row["name"] == "Burger")
        self.assertEqual(burger["units_sold"], 2)
        self.assertEqual(burger["gross_sales"], 200.0)
        self.assertEqual(burger["discount"], 20.0)
        self.assertEqual(burger["net_sales"], 180.0)
        self.assertEqual(burger["average_price"], 90.0)
        self.assertEqual(burger["order_count"], 1)
        self.assertEqual(burger["cancelled_quantity"], 5)

        orders_report = OrderReportService.summary(
            self.range_value,
            self.range_value,
            self.restaurant,
            branch=self.branch,
        )
        finance_report = FinanceReportService.profit_loss(
            self.range_value,
            self.range_value,
            self.restaurant,
            branch=self.branch,
        )
        self.assertEqual(float(orders_report["totals"]["food_revenue"]), 530.0)
        self.assertEqual(finance_report["revenue"], 530.0)

    def test_platter_is_a_single_sellable_row_and_not_exploded(self):
        data = self.report()
        platter = next(row for row in data["items"] if row["name"] == "Family Platter")
        burger = next(row for row in data["items"] if row["name"] == "Burger")

        self.assertEqual(platter["product_type"], "platter")
        self.assertEqual(platter["units_sold"], 1)
        self.assertEqual(platter["net_sales"], 300.0)
        self.assertEqual(burger["units_sold"], 2)

    def test_date_range_includes_entire_end_date_and_excludes_outside(self):
        late_order = self._order(status="completed")
        self._item(late_order, self.tea, quantity=2, price="50.00")
        late_dt = timezone.make_aware(
            datetime.combine(self.today, time(hour=23, minute=59, second=59))
        )
        Order.objects.filter(pk=late_order.pk).update(created_at=late_dt)

        data = self.report()
        tea = next(row for row in data["items"] if row["name"] == "Tea")
        burger = next(row for row in data["items"] if row["name"] == "Burger")
        self.assertEqual(tea["units_sold"], 3)
        self.assertEqual(burger["units_sold"], 2)

    def test_branch_and_category_filters(self):
        branch_data = self.report(category=self.drinks.id)
        self.assertEqual([row["name"] for row in branch_data["items"]], ["Tea"])
        self.assertEqual(branch_data["summary"]["total_revenue"], 50.0)
        self.assertEqual(len(branch_data["category_summary"]), 1)
        self.assertEqual(branch_data["category_summary"][0]["category_name"], "Drinks")

        all_branches = MenuItemSalesReportService.generate(
            self.range_value,
            self.range_value,
            self.restaurant,
            branch=None,
            params={"search": "West Burger"},
            paginate=False,
        )
        self.assertEqual(all_branches["items"][0]["units_sold"], 7)
        self.assertNotIn("West Burger", [row["name"] for row in self.report()["items"]])

    def test_top_bottom_ranking_and_zero_sales_behavior(self):
        top = self.report(ranking="top", rank_by="quantity", limit=1)
        self.assertEqual(top["items"][0]["name"], "Burger")

        top_revenue = self.report(ranking="top", rank_by="revenue", limit=1)
        self.assertEqual(top_revenue["items"][0]["name"], "Family Platter")

        bottom = self.report(ranking="bottom", rank_by="quantity", limit=1)
        self.assertEqual(bottom["items"][0]["units_sold"], 1)
        self.assertNotEqual(bottom["items"][0]["name"], "Zero Salad")

        bottom_with_zero = self.report(
            ranking="bottom",
            rank_by="quantity",
            limit=1,
            include_zero_sales="true",
        )
        self.assertEqual(bottom_with_zero["items"][0]["name"], "Zero Salad")
        self.assertEqual(bottom_with_zero["items"][0]["units_sold"], 0)

        zero_only = self.report(sales_status="zero", include_zero_sales="true")
        self.assertIn("Zero Salad", [row["name"] for row in zero_only["items"]])
        self.assertIsNone(zero_only["summary"]["lowest_selling_item"])

    def test_existing_menu_sales_lookup_reuses_accurate_service(self):
        response = self.client.get(
            "/api/menu/menu-item-sales/",
            {
                "name": "Burger",
                "start": self.range_value,
                "end": self.range_value,
            },
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["menu_item__name"], "Burger")
        self.assertEqual(response.data[0]["total_sold"], 2)
        self.assertEqual(response.data[0]["total_revenue"], 200.0)

    def test_category_aggregation_and_trend(self):
        data = self.report()
        meals = next(
            row for row in data["category_summary"] if row["category_name"] == "Meals"
        )
        self.assertEqual(meals["items_sold"], 2)
        self.assertEqual(meals["units_sold"], 3)
        self.assertEqual(meals["gross_sales"], 500.0)
        self.assertEqual(meals["discount"], 20.0)
        self.assertEqual(meals["net_sales"], 480.0)
        self.assertEqual(data["trend"]["granularity"], "daily")
        self.assertEqual(sum(point["units_sold"] for point in data["trend"]["points"]), 4)

    def test_api_filters_branch_and_permissions(self):
        response = self.client.get(
            "/api/reports/generate_report/",
            {
                "type": "menu_items",
                "start": self.range_value,
                "end": self.range_value,
                "category": self.drinks.id,
                "ranking": "top",
                "rank_by": "revenue",
                "limit": 5,
            },
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["type"], "menu_items")
        self.assertEqual(response.data["branch"]["id"], self.branch.id)
        self.assertEqual(response.data["data"]["items"][0]["name"], "Tea")
        self.assertEqual(response.data["data"]["filters"]["rank_by"], "revenue")

        self.client.force_authenticate(user=None)
        denied = self.client.get(
            "/api/reports/generate_report/",
            {"type": "menu_items", "start": self.range_value, "end": self.range_value},
        )
        self.assertEqual(denied.status_code, 401)

    def test_pdf_endpoint_uses_report_filters_and_is_protected(self):
        response = self.client.get(
            "/api/reports/menu-items-pdf/",
            {
                "start": self.range_value,
                "end": self.range_value,
                "report_type": "top",
                "rank_by": "quantity",
                "limit": 5,
                "category": self.meals.id,
                "include_charts": "false",
            },
            HTTP_X_BRANCH_ID=str(self.branch.id),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF"))

        self.client.force_authenticate(user=None)
        denied = self.client.get("/api/reports/menu-items-pdf/")
        self.assertEqual(denied.status_code, 401)

    def test_branch_admin_cannot_request_an_unassigned_branch(self):
        branch_user = User.objects.create_user("branch-report", password="password")
        branch_staff = Staff.objects.create(
            user=branch_user,
            restaurant=self.restaurant,
            active_branch=self.branch,
            name="Branch Report",
            role="BranchAdmin",
            email="branch-report@example.com",
            phone="0700000099",
            status="Active",
        )
        branch_staff.branches.add(self.branch)
        self.client.force_authenticate(branch_user)

        response = self.client.get(
            "/api/reports/generate_report/",
            {"type": "menu_items", "start": self.range_value, "end": self.range_value},
            HTTP_X_BRANCH_ID=str(self.other_branch.id),
        )
        self.assertEqual(response.status_code, 403)
