from datetime import datetime, time, timedelta
from decimal import Decimal

from django.db.models import (
    DecimalField, ExpressionWrapper, F, Prefetch, Sum
)
from django.utils import timezone
from django.utils.dateparse import parse_date

from expenses.models import Expenses
from inventory.models import StockMovement
from menu.models import MenuItem
from orders.models import Order, OrderItem


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
    def _order_total(order):
        """Replicates Order.get_total() using prefetched items (zero DB hits)."""
        prefetched = getattr(order, "_prefetched_objects_cache", {})
        if "items" in prefetched:
            items = [i for i in prefetched["items"] if i.status != "cancelled"]
        else:
            items = [i for i in order.items.all() if i.status != "cancelled"]

        items_total = sum(
            (i.get_subtotal() for i in items),
            Decimal("0.00")
        )

        reservation_total = Decimal("0.00")
        if order.reservation:
            r = order.reservation
            if r.reservation_type in ("fee", "prepaid"):
                reservation_total = r.total_price

        delivery_total = (
            Decimal(str(order.delivery_fee or 0))
            if order.order_type == "delivery"
            else Decimal("0.00")
        )

        subtotal = items_total + reservation_total + delivery_total
        discount = (subtotal * Decimal(str(order.discount_percent or 0))) / Decimal("100")
        return subtotal - discount

    @staticmethod
    def profit_loss(start, end, restaurant):
        SUCCESSFUL_STATUSES = ["completed", "delivered"]
        start_dt, end_dt = FinanceReportService._parse_range(start, end)
        money_field = DecimalField(max_digits=14, decimal_places=2)

        # -------- 1. Load every successful order + full item tree ----------
        orders = list(
            Order.objects.filter(
                restaurant=restaurant,
                created_at__range=(start_dt, end_dt),
                status__in=SUCCESSFUL_STATUSES,
            )
            .select_related("reservation__table")
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related(
                        "menu_item", "platter"
                    ).prefetch_related(
                        "platter__items__menu_item"
                    )
                )
            )
        )

        # -------- 2. Revenue (Python-side, no extra queries) ----------
        revenue = sum(
            (FinanceReportService._order_total(o) for o in orders),
            Decimal("0")
        )

        # -------- 3. Gather items & every menu_item ID needed for COGS ----------
        all_items = []
        menu_item_ids = set()

        for order in orders:
            for item in order.items.all():          # uses prefetch cache
                all_items.append(item)
                if item.menu_item_id:
                    menu_item_ids.add(item.menu_item_id)
                elif item.platter_id:
                    for pi in item.platter.items.all():  # uses prefetch cache
                        if pi.menu_item_id:
                            menu_item_ids.add(pi.menu_item_id)

        # -------- 4. Bulk-fetch ingredient costs for ALL menu items (1 query) ----------
        costs_map = {}
        if menu_item_ids:
            costs_data = (
                MenuItem.objects.filter(id__in=menu_item_ids)
                .annotate(
                    _cost=Sum(
                        ExpressionWrapper(
                            F("ingredients__quantity_required")
                            * F("ingredients__ingredient__cost_per_unit"),
                            output_field=DecimalField(max_digits=10, decimal_places=2),
                        )
                    )
                )
                .values("id", "_cost")
            )
            costs_map = {c["id"]: c["_cost"] or Decimal("0") for c in costs_data}

        # -------- 5. COGS (pure Python, zero N+1) ----------
        cogs = Decimal("0")
        for item in all_items:
            if item.menu_item_id:
                unit_cost = costs_map.get(item.menu_item_id, Decimal("0"))
                cogs += Decimal(item.quantity) * unit_cost

            elif item.platter_id:
                platter_cost = Decimal("0")
                for pi in item.platter.items.all():
                    unit_cost = costs_map.get(pi.menu_item_id, Decimal("0"))
                    platter_cost += Decimal(pi.quantity) * unit_cost
                cogs += Decimal(item.quantity) * platter_cost

        # -------- 6. Stock purchases ----------
        purchases = (
            StockMovement.objects.filter(
                restaurant=restaurant,
                created_at__range=(start_dt, end_dt),
                movement_type="purchase",
            )
            .aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F("change_quantity") * F("ingredient__cost_per_unit"),
                        output_field=money_field,
                    )
                )
            )["total"]
            or Decimal("0")
        )

        # -------- 7. Wastage ----------
        wastage = (
            StockMovement.objects.filter(
                restaurant=restaurant,
                created_at__range=(start_dt, end_dt),
                movement_type="waste",
            )
            .aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F("change_quantity") * F("ingredient__cost_per_unit"),
                        output_field=money_field,
                    )
                )
            )["total"]
            or Decimal("0")
        )
        wastage = abs(wastage)

        # -------- 8. Operational Expenses ----------
        operational_expenses = (
            Expenses.objects.filter(
                restaurant=restaurant,
                date__range=(start_dt.date(), end_dt.date()),
            )
            .aggregate(total=Sum("amount_afn", output_field=money_field))["total"]
            or Decimal("0")
        )

        # -------- 9. Totals ----------
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