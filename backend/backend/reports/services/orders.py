from django.db.models import Sum, Count, F, Avg, FloatField, Q
from django.db.models.functions import TruncDate, TruncHour
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, time
from django.utils import timezone
from django.db.models import DurationField
from orders.models import Order, OrderItem
from django.db.models import (
    Sum, Count, F, FloatField, Q, ExpressionWrapper, DecimalField, Avg
)
from django.db.models.functions import TruncDate, TruncHour
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, time
from django.utils import timezone

from orders.models import Order, OrderItem

class OrderReportService:

    # -------------------------
    # Helpers (unchanged logic but cleaner)
    # -------------------------
    @staticmethod
    def _parse_range(start, end):
        today = timezone.now().date()

        start_date = parse_date(start) if start else today - timedelta(days=30)
        end_date = parse_date(end) if end else today

        start_dt = timezone.make_aware(datetime.combine(start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_date, time.max))

        return start_dt, end_dt

    # ---------- main report ----------
    @staticmethod
    def summary(start, end, restaurant=None):
        start_dt, end_dt = OrderReportService._parse_range(start, end)

        orders = Order.objects.filter(restaurant=restaurant, created_at__range=[start_dt, end_dt])

        

        # ----- Basic counts -----
        total_orders = orders.count()
        completed_orders = orders.filter(status__in=['completed', 'delivered'])
        cancelled_orders = orders.filter(status='cancelled')

        # ----- Revenue (only from non-cancelled orders) -----
        billable_orders = orders.filter(status__in=['completed', 'delivered'])
        
        from decimal import Decimal

        total_revenue = sum(
            (o.get_total() or Decimal("0")) for o in billable_orders
        )
        
        lost_revenue = sum(
            float(o.get_total()) for o in cancelled_orders
        )

        from decimal import Decimal

        service_revenue = sum(
            (o.delivery_fee or Decimal("0")) for o in billable_orders
        )

        from decimal import Decimal

        reservation_revenue = sum(
            (
                o.reservation.amount
                * (Decimal("1") - (Decimal(o.discount_percent or 0) / Decimal("100")))
            )
            for o in billable_orders
            if o.reservation and o.reservation.reservation_type != "free"
        )

        avg_order_value = (
            round(total_revenue / billable_orders.count(), 2)
            if billable_orders.exists() else 0
        )

        # ----- Breakdown by type (count + revenue) -----
        from collections import defaultdict

        type_map = defaultdict(lambda: {
            "count": 0,
            "revenue": 0
        })

        for order in billable_orders:
            t = order.order_type

            type_map[t]["count"] += 1
            type_map[t]["revenue"] += float(order.get_total())

        by_type = [
            {
                "order_type": order_type,
                "count": data["count"],
                "revenue": round(data["revenue"], 2),
            }
            for order_type, data in type_map.items()
        ]

        # ----- Breakdown by status -----
        by_status = (
            orders.values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        top_items = (
        OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__range=(start_dt, end_dt),
            order__status__in=["completed", "served", "ready"]
        )
        .exclude(status="cancelled")
            .values(name=F("menu_item__name"))
            .annotate(
                quantity_sold=Sum("quantity"),
                revenue=Sum(
                    ExpressionWrapper(
                        F("quantity") * F("menu_item__price"),
                        output_field=DecimalField()
                    )
                )
            )
            .order_by("-quantity_sold")[:10]
        )

        prep = completed_orders.filter(
            preparation_start__isnull=False,
            preparation_end__isnull=False
        ).annotate(
            prep_time=ExpressionWrapper(
                F("preparation_end") - F("preparation_start"),
                output_field=DurationField()
            )
        )

        avg_prep = prep.aggregate(
            avg=Avg("prep_time")
        )["avg"]

        avg_prep_minutes = round(avg_prep.total_seconds() / 60, 2) if avg_prep else 0
        daily = (
            orders.exclude(status='cancelled')
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                orders_count=Count("id"),
                revenue=Sum(
                    F("items__quantity") * F("items__menu_item__price"),
                    output_field=FloatField()
                )
            )
            .order_by("date")
        )
        from collections import defaultdict

        daily_map = defaultdict(lambda: {
            "orders": 0,
            "revenue": 0
        })

        for order in billable_orders:
            day = order.created_at.date()

            daily_map[day]["orders"] += 1
            daily_map[day]["revenue"] += float(order.get_total())

        daily_breakdown = [
            {
                "date": day,
                "orders": data["orders"],
                "revenue": round(data["revenue"], 2),
            }
            for day, data in sorted(daily_map.items())
        ]
                # ----- Peak hours -----
        peak_hours = (
            orders.annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        peak_hours_data = (
            orders.annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        # ----- Waiter performance -----
        waiter_performance = (
    orders.exclude(received_by__isnull=True)
    .values(waiter_name=F("received_by__name"))
    .annotate(
        orders_handled=Count("id"),
        revenue=Sum(
            ExpressionWrapper(
                F("items__quantity") * F("items__menu_item__price"),
                output_field=DecimalField()
            )
        )
    )
    .order_by("-orders_handled")[:10]
)
        # ----- Delivery boy performance -----
        delivery_performance = (
            orders.filter(order_type="delivery")
            .exclude(delivery_boy__isnull=True)
            .values(delivery_boy_name=F("delivery_boy__name"))
            .annotate(
                deliveries=Count("id"),
                revenue=Sum(
                    ExpressionWrapper(
                        F("items__quantity") * F("items__menu_item__price"),
                        output_field=DecimalField()
                    )
                )
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
                "completed_orders": completed_orders.count(),
                "cancelled_orders": cancelled_orders.count(),
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