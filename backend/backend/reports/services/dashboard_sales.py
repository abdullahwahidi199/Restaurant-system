from collections import defaultdict
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.db.models import Prefetch
from django.utils import timezone

from orders.models import Order, OrderItem


def build_dashboard_sales(*, restaurant, branch, start_date, end_date, interval, calculate_total):
    """Return complete, local-calendar sales buckets and an equal-length comparison."""
    days = (end_date - start_date).days + 1
    if interval == "auto":
        interval = "day" if days <= 62 else "week" if days <= 180 else "month"

    previous_end = start_date - timedelta(days=1) if start_date > date.min else None
    previous_start = max(date.min, start_date - timedelta(days=min(days, start_date.toordinal() - 1)))
    zone = timezone.get_current_timezone()
    window_start = timezone.make_aware(datetime.combine(previous_start, time.min), zone)
    window_end = timezone.make_aware(datetime.combine(end_date + timedelta(days=1), time.min), zone)
    orders = Order.objects.filter(
        restaurant=restaurant,
        created_at__gte=window_start,
        created_at__lt=window_end,
        status__in=["completed", "delivered"],
    )
    if branch:
        orders = orders.filter(branch=branch)
    orders = orders.select_related("reservation__table").prefetch_related(
        Prefetch("items", queryset=OrderItem.objects.select_related("menu_item", "platter"))
    )

    daily = defaultdict(lambda: {"revenue": Decimal("0.00"), "orders": 0})
    previous_revenue = Decimal("0.00")
    previous_orders = 0
    for order in orders.iterator(chunk_size=250):
        day = timezone.localtime(order.created_at, zone).date()
        revenue = calculate_total(order)
        if day < start_date:
            previous_revenue += revenue
            previous_orders += 1
        else:
            daily[day]["revenue"] += revenue
            daily[day]["orders"] += 1

    buckets = []
    cursor = start_date
    while cursor <= end_date:
        if interval == "month":
            next_month = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)
            bucket_end = min(end_date, next_month - timedelta(days=1))
        elif interval == "week":
            bucket_end = min(end_date, cursor + timedelta(days=6 - cursor.weekday()))
        else:
            bucket_end = cursor

        revenue = Decimal("0.00")
        order_count = 0
        day = cursor
        while day <= bucket_end:
            if day in daily:
                revenue += daily[day]["revenue"]
                order_count += daily[day]["orders"]
            day += timedelta(days=1)
        buckets.append({
            "date": cursor.isoformat(),
            "end_date": bucket_end.isoformat(),
            "revenue": round(float(revenue), 2),
            "orders": order_count,
            "average_order_value": round(float(revenue / order_count), 2) if order_count else 0,
        })
        cursor = bucket_end + timedelta(days=1)

    total_revenue = sum((value["revenue"] for value in daily.values()), Decimal("0.00"))
    total_orders = sum(value["orders"] for value in daily.values())

    return {
        "currency": "AFN",
        "range": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days,
            "interval": interval,
            "timezone": str(zone),
        },
        "totals": {
            "revenue": round(float(total_revenue), 2),
            "orders": total_orders,
            "average_order_value": round(float(total_revenue / total_orders), 2) if total_orders else 0,
            "daily_average_revenue": round(float(total_revenue / days), 2),
        },
        "comparison": {
            "start_date": previous_start.isoformat() if previous_end else None,
            "end_date": previous_end.isoformat() if previous_end else None,
            "revenue": round(float(previous_revenue), 2),
            "orders": previous_orders,
            "revenue_change_percent": round(float((total_revenue - previous_revenue) / previous_revenue * 100), 1)
            if previous_revenue else None,
            "orders_change_percent": round((total_orders - previous_orders) / previous_orders * 100, 1)
            if previous_orders else None,
        },
        "series": buckets,
    }
