from collections import Counter, defaultdict
from datetime import datetime, timedelta, time
from decimal import Decimal

from django.db.models import (
    Count, DecimalField, ExpressionWrapper, F, FloatField, Prefetch, Sum
)
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from django.utils.dateparse import parse_date

from orders.models import Order, OrderItem


class OrderReportService:

    # -------------------------
    # Helpers
    # -------------------------
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
        """
        Replicates Order.get_total() but reads from prefetched data
        so zero extra queries are fired.
        """
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

    # -------------------------
    # Main report
    # -------------------------
    @staticmethod
    def summary(start, end, restaurant=None):
        start_dt, end_dt = OrderReportService._parse_range(start, end)

        # Base queryset for DB-level aggregations
        base_qs = Order.objects.filter(
            restaurant=restaurant,
            created_at__range=[start_dt, end_dt],
        )

        # Single query: load everything needed for revenue math into memory
        orders_list = list(
            base_qs.select_related(
                "reservation__table"
            ).prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("menu_item", "platter")
                )
            )
        )

        # ----- Partition & count in Python -----
        status_counts = Counter()
        completed_orders = []
        cancelled_orders = []
        billable_orders = []

        for order in orders_list:
            status_counts[order.status] += 1
            if order.status in ("completed", "delivered"):
                completed_orders.append(order)
                billable_orders.append(order)
            elif order.status == "cancelled":
                cancelled_orders.append(order)

        total_orders = len(orders_list)

        # ----- Revenue & breakdowns (all Python-side) -----
        total_revenue = Decimal("0.00")
        service_revenue = Decimal("0.00")
        reservation_revenue = Decimal("0.00")
        lost_revenue = 0.0

        type_map = defaultdict(lambda: {"count": 0, "revenue": 0.0})
        daily_map = defaultdict(lambda: {"orders": 0, "revenue": 0.0})

        for order in billable_orders:
            order_total = OrderReportService._order_total(order)

            total_revenue += order_total
            service_revenue += Decimal(str(order.delivery_fee or 0))

            if order.reservation and order.reservation.reservation_type != "free":
                reservation_revenue += (
                    Decimal(str(order.reservation.amount))
                    * (Decimal("1") - (Decimal(str(order.discount_percent or 0)) / Decimal("100")))
                )

            t = order.order_type
            type_map[t]["count"] += 1
            type_map[t]["revenue"] += float(order_total)

            day = order.created_at.date()
            daily_map[day]["orders"] += 1
            daily_map[day]["revenue"] += float(order_total)

        for order in cancelled_orders:
            lost_revenue += float(OrderReportService._order_total(order))

        avg_order_value = (
            round(total_revenue / len(billable_orders), 2)
            if billable_orders else 0
        )

        by_type = [
            {
                "order_type": order_type,
                "count": data["count"],
                "revenue": round(data["revenue"], 2),
            }
            for order_type, data in type_map.items()
        ]

        by_status = [
            {"status": status, "count": count}
            for status, count in status_counts.most_common()
        ]

        daily_breakdown = [
            {
                "date": day,
                "orders": data["orders"],
                "revenue": round(data["revenue"], 2),
            }
            for day, data in sorted(daily_map.items())
        ]

        # ----- Preparation time (Python-side) -----
        prep_times = [
            (o.preparation_end - o.preparation_start).total_seconds() / 60
            for o in completed_orders
            if o.preparation_start and o.preparation_end
        ]
        avg_prep_minutes = (
            round(sum(prep_times) / len(prep_times), 2)
            if prep_times else 0
        )

        # ----- DB-level aggregations (unchanged logic) -----
        top_items = (
            OrderItem.objects.filter(
                order__restaurant=restaurant,
                order__created_at__range=(start_dt, end_dt),
                order__status__in=["completed", "served", "ready"],
            )
            .exclude(status="cancelled")
            .values(name=F("menu_item__name"))
            .annotate(
                quantity_sold=Sum("quantity"),
                revenue=Sum(
                    ExpressionWrapper(
                        F("quantity") * F("menu_item__price"),
                        output_field=DecimalField(),
                    )
                ),
            )
            .order_by("-quantity_sold")[:10]
        )

        peak_hours_data = (
            base_qs.annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        waiter_performance = (
            base_qs.exclude(received_by__isnull=True)
            .values(waiter_name=F("received_by__name"))
            .annotate(
                orders_handled=Count("id"),
                revenue=Sum(
                    ExpressionWrapper(
                        F("items__quantity") * F("items__menu_item__price"),
                        output_field=DecimalField(),
                    )
                ),
            )
            .order_by("-orders_handled")[:10]
        )

        delivery_performance = (
            base_qs.filter(order_type="delivery")
            .exclude(delivery_boy__isnull=True)
            .values(delivery_boy_name=F("delivery_boy__name"))
            .annotate(
                deliveries=Count("id"),
                revenue=Sum(
                    ExpressionWrapper(
                        F("items__quantity") * F("items__menu_item__price"),
                        output_field=DecimalField(),
                    )
                ),
            )
            .order_by("-deliveries")[:10]
        )

        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "totals": {
                "total_orders": total_orders,
                "completed_orders": len(completed_orders),
                "cancelled_orders": len(cancelled_orders),
                "food_revenue": round(total_revenue - service_revenue - reservation_revenue, 2),
                "delivery_revenue": round(service_revenue, 2),
                "reservation_revenue": round(reservation_revenue, 2),
                "total_revenue": round(total_revenue, 2),
                "lost_revenue": round(lost_revenue, 2),
                "average_order_value": avg_order_value,
                "average_preparation_minutes": avg_prep_minutes,
            },
            "by_type": by_type,
            "by_status": by_status,
            "top_items": top_items,
            "daily_breakdown": daily_breakdown,
            "peak_hours": peak_hours_data,
            "waiter_performance": waiter_performance,
            "delivery_performance": delivery_performance,
        }