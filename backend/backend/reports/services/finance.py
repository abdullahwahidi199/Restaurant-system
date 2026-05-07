from django.db.models import (
    Sum,
    F,
    DecimalField,
    ExpressionWrapper,
)
from decimal import Decimal

from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, time, timedelta

from orders.models import OrderItem,Order
from inventory.models import StockMovement
from users.models import Payroll

# Update this import to match your actual app name
from expenses.models import Expenses


class FinanceReportService:

    @staticmethod
    def _parse_range(start, end):
        today = timezone.now().date()

        start_date = parse_date(start) if start else today - timedelta(days=30)
        end_date = parse_date(end) if end else today

        start_dt = timezone.make_aware(datetime.combine(start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_date, time.max))

        return start_dt, end_dt

    @staticmethod
    def profit_loss(start, end, restaurant):
        start_dt, end_dt = FinanceReportService._parse_range(start, end)
        money_field = DecimalField(max_digits=14, decimal_places=2)

        # -------- Revenue --------
        items = OrderItem.objects.filter(
    order__created_at__range=(start_dt, end_dt),
    order__restaurant=restaurant,
    order__status="completed"
)

        orders = (
    Order.objects.filter(
        restaurant=restaurant,
        created_at__range=(start_dt, end_dt),
        status="completed"
    )
    .select_related("reservation")
    .prefetch_related("items__menu_item")
)

        revenue = Decimal("0")

        for o in orders:
            revenue += Decimal(o.get_total())

        # -------- COGS --------
        cogs = Decimal("0")
        for item in items.select_related("menu_item"):
            cogs += Decimal(item.quantity) * Decimal(item.menu_item.get_cost_per_unit())

        # -------- Stock purchases --------
        purchases = StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__range=(start_dt, end_dt),
            movement_type="purchase"
        ).aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("change_quantity") * F("ingredient__cost_per_unit"),
                    output_field=money_field
                )
            )
        )["total"] or Decimal("0")

        # -------- Wastage --------
        wastage = StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__range=(start_dt, end_dt),
            movement_type="waste"
        ).aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("change_quantity") * F("ingredient__cost_per_unit"),
                    output_field=money_field
                )
            )
        )["total"] or Decimal("0")
        wastage = abs(wastage)

        # -------- Operational Expenses (NEW) --------
        operational_expenses = Expenses.objects.filter(
            restaurant=restaurant,
            date__range=(start_dt.date(), end_dt.date())
        ).aggregate(
            total=Sum("amount", output_field=money_field)
        )["total"] or Decimal("0")

        # -------- Totals --------
        total_expenses = cogs + wastage + operational_expenses
        gross_profit = revenue - cogs
        net_profit = revenue - total_expenses

        margin = (
            round((net_profit / revenue) * 100, 2)
            if revenue > 0 else Decimal("0")
        )

        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "revenue": float(round(revenue, 2)),
            "expenses": {
                "cogs": float(round(cogs, 2)),
                "wastage": float(round(wastage, 2)),
                "stock_purchases": float(round(purchases, 2)),
                "operational_expenses": float(round(operational_expenses, 2)),
                "total_expenses": float(round(total_expenses, 2)),
            },
            "gross_profit": float(round(gross_profit, 2)),
            "net_profit": float(round(net_profit, 2)),
            "profit_margin_percent": float(margin),
        }