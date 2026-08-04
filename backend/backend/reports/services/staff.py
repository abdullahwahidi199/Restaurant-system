from datetime import datetime, timedelta, time
from django.db.models import (
    Sum,
    Count,
    F,
    Q,
    Value,
    ExpressionWrapper,
    DecimalField,
    Case,
    When,
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.dateparse import parse_date

from users.models import Staff, Attendance, Payroll
from orders.models import Order, Reservation
from decimal import Decimal

class StaffReportService:
    MONEY_FIELD = DecimalField(max_digits=12, decimal_places=2)

    @staticmethod
    def _parse_range(start, end):
        today = timezone.now().date()
        start_date = parse_date(start) if start else today - timedelta(days=30)
        end_date = parse_date(end) if end else today

        start_dt = timezone.make_aware(datetime.combine(start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_date, time.max))

        return start_dt, end_dt

    @staticmethod
    def _money(value):
        return round(float(value or 0), 2)

    @staticmethod
    def summary(start, end, restaurant=None, branch=None):
        start_dt, end_dt = StaffReportService._parse_range(start, end)
        start_date = start_dt.date()
        end_date = end_dt.date()

        # ── Base querysets ──────────────────────────────────────────────────
        staff_qs = Staff.objects.filter(restaurant=restaurant)
        if branch:
            staff_qs = staff_qs.filter(branches=branch).distinct()

        orders_qs = Order.objects.filter(
            restaurant=restaurant,
            created_at__range=[start_dt, end_dt],
        )
        if branch:
            orders_qs = orders_qs.filter(branch=branch)

        attendance_qs = Attendance.objects.filter(
            restaurant=restaurant,
            date__range=[start_date, end_date],
        )
        if branch:
            attendance_qs = attendance_qs.filter(branch=branch)

        payroll_qs = Payroll.objects.filter(
            restaurant=restaurant,
            period_start__lte=end_date,
            period_end__gte=start_date,
        )
        if branch:
            payroll_qs = payroll_qs.filter(branch=branch)

        reservation_qs = Reservation.objects.filter(
            restaurant=restaurant,
            created_at__range=[start_dt, end_dt],
        )
        if branch:
            reservation_qs = reservation_qs.filter(branch=branch)

        # ── Staff counts ────────────────────────────────────────────────────
        total_staff = staff_qs.count()
        active_staff = staff_qs.filter(status="Active").count()
        inactive_staff = total_staff - active_staff

        by_role = list(
            staff_qs
            .values("role")
            .annotate(count=Count("id"))
            .order_by("-count", "role")
        )

        # ── Attendance ──────────────────────────────────────────────────────
        attendance_summary = list(
            attendance_qs
            .values("status")
            .annotate(count=Count("id"))
            .order_by("-count", "status")
        )

        total_attendance_records = attendance_qs.count()
        present_count = attendance_qs.filter(status="Present").count()
        attendance_rate = (
            round((present_count / total_attendance_records) * 100, 2)
            if total_attendance_records
            else 0
        )

        daily_attendance = list(
            attendance_qs
            .values("date", "status")
            .annotate(count=Count("id"))
            .order_by("date", "status")
        )

        # ── Payroll summary ────────────────────────────────────────────────
        payroll_rows = (
            payroll_qs
            .values(
                "staff_id",
                staff_name=F("staff__name"),
                role=F("staff__role"),
            )
            .annotate(
                payroll_count=Count("id", distinct=True),
                total_base=Coalesce(
                    Sum("base_salary"),
                    Value(0, output_field=StaffReportService.MONEY_FIELD),
                ),
                total_bonuses=Coalesce(
                    Sum("bonuses"),
                    Value(0, output_field=StaffReportService.MONEY_FIELD),
                ),
                total_deductions=Coalesce(
                    Sum("deductions"),
                    Value(0, output_field=StaffReportService.MONEY_FIELD),
                ),
                total_net=Coalesce(
                    Sum("net_salary"),
                    Value(0, output_field=StaffReportService.MONEY_FIELD),
                ),
            )
            .order_by("-total_net", "staff_name")
        )

        payroll_summary = [
            {
                "staff_id": row["staff_id"],
                "staff_name": row["staff_name"],
                "role": row["role"],
                "payroll_count": row["payroll_count"],
                "total_base": StaffReportService._money(row["total_base"]),
                "total_bonuses": StaffReportService._money(row["total_bonuses"]),
                "total_deductions": StaffReportService._money(row["total_deductions"]),
                "total_net": StaffReportService._money(row["total_net"]),
            }
            for row in payroll_rows
        ]

        total_payroll_cost = payroll_qs.aggregate(
            total=Coalesce(
                Sum("net_salary"),
                Value(0, output_field=StaffReportService.MONEY_FIELD),
            )
        )["total"]

        # ── Waiter performance (ALL waiters) ────────────────────────────────
        waiters = list(
            staff_qs
            .filter(role="Waiter")
            .values("id", "name")
            .order_by("name")
        )

        waiter_stats = {
            row["staff_id"]: row
            for row in (
                orders_qs
                .filter(
    order_type__in=["dine-in"],
    created_by__isnull=False,
    created_by__role="Waiter",
)
.values(
    staff_id=F("created_by__id"),
)
.annotate(
    orders_handled=Count("id", distinct=True),
    completed_orders=Count(
        "id",
        filter=Q(status="completed"),
        distinct=True,
    ),
    # Replace the entire revenue annotation in waiter_stats with:
revenue=Coalesce(
    Sum(
        ExpressionWrapper(
            F("items__quantity") * Coalesce(
                F("items__price_at_order"), F("items__menu_item__price"), F("items__platter__price"),
                output_field=StaffReportService.MONEY_FIELD
            ),
            output_field=StaffReportService.MONEY_FIELD
        ),
        filter=Q(items__status__in=["pending", "ready", "served", "completed"])
    ),
    Value(0, output_field=StaffReportService.MONEY_FIELD),
)
)
            )
        }

        waiter_performance = [
            {
                "staff_id": waiter["id"],
                "staff_name": waiter["name"],
                "orders_handled": waiter_stats.get(waiter["id"], {}).get("orders_handled", 0),
                "completed_orders": waiter_stats.get(waiter["id"], {}).get("completed_orders", 0),
                "revenue": StaffReportService._money(
                    waiter_stats.get(waiter["id"], {}).get("revenue", 0)
                ),
            }
            for waiter in waiters
        ]

        waiter_performance.sort(
            key=lambda x: (-x["orders_handled"], -x["revenue"], x["staff_name"].lower())
        )

        # ── Delivery performance (ALL delivery boys) ────────────────────────
        delivery_boys = list(
            staff_qs
            .filter(role="DeliveryBoy")
            .values("id", "name")
            .order_by("name")
        )

        delivery_stats = {}
        from decimal import Decimal

        delivery_stats = {}

        delivery_orders = (
            orders_qs
            .filter(
                order_type="delivery",
                delivery_boy__isnull=False,
                delivery_boy__role="DeliveryBoy",
                status="delivered",
            )
            .select_related("delivery_boy")
            .prefetch_related(
                "items__menu_item",
                "items__platter",
                "reservation",
            )
        )

        for order in delivery_orders:

            boy_id = order.delivery_boy.id

            if boy_id not in delivery_stats:
                delivery_stats[boy_id] = {
                    "deliveries_handled": 0,
                    "delivered": 0,
                    "revenue": Decimal("0.00"),
                }

            # ✅ USE CENTRALIZED TOTAL LOGIC
            final_total = order.get_total()

            delivery_stats[boy_id]["deliveries_handled"] += 1
            delivery_stats[boy_id]["delivered"] += 1
            delivery_stats[boy_id]["revenue"] += final_total
        delivery_performance = [
            {
                "staff_id": boy["id"],
                "staff_name": boy["name"],
                "deliveries_handled": delivery_stats.get(boy["id"], {}).get("deliveries_handled", 0),
                "delivered": delivery_stats.get(boy["id"], {}).get("delivered", 0),
                "revenue": StaffReportService._money(
                    delivery_stats.get(boy["id"], {}).get("revenue", 0)
                ),
            }
            for boy in delivery_boys
        ]

        delivery_performance.sort(
            key=lambda x: (-x["deliveries_handled"], -x["revenue"], x["staff_name"].lower())
        )

        # ── Cashier performance (ALL cashiers) ──────────────────────────────
        cashiers = list(
            staff_qs
            .filter(role="Cashier")
            .values("id", "name")
            .order_by("name")
        )

        cashier_stats = {
            row["staff_id"]: row
            for row in (
                reservation_qs
                .filter(
                    created_by__isnull=False,
                    created_by__role="Cashier",
                )
                .exclude(status="cancelled")
                .values(
                    staff_id=F("created_by__id"),
                )
                .annotate(
                    reservations_created=Count("id", distinct=True),
                    total_amount=Coalesce(
                        Sum("amount"),
                        Value(0, output_field=StaffReportService.MONEY_FIELD),
                    ),
                    total_paid=Coalesce(
                        Sum("paid_amount"),
                        Value(0, output_field=StaffReportService.MONEY_FIELD),
                    ),
                )
            )
        }

    

        from decimal import Decimal

        order_cashier_stats = {}

        cashier_orders = (
            orders_qs
            .filter(
                received_by__isnull=False,
                received_by__role="Cashier",
                status__in=["completed","delivered"],
            )
            .select_related("reservation", "received_by")
            .prefetch_related("items__menu_item", "items__platter")
        )

        for order in cashier_orders:
            cashier_id = order.received_by.id

            if cashier_id not in order_cashier_stats:
                order_cashier_stats[cashier_id] = {
                    "staff_id": cashier_id,
                    "orders_paid": 0,
                    "order_revenue": Decimal("0.00"),
                }

            # ITEMS TOTAL
                    # ITEMS TOTAL
            items_total = Decimal("0.00")

            for item in order.items.exclude(status="cancelled"):
                price = item.price_at_order
                if price is None:
                    if item.menu_item:
                        price = item.menu_item.price
                    elif item.platter:
                        price = item.platter.price
                    else:
                        price = Decimal("0.00")

                items_total += item.quantity * price


            # RESERVATION
            reservation_total = Decimal("0.00")
            prepaid_amount = Decimal("0.00")

            if (
    order.reservation
    and order.reservation.status != "cancelled"
):
                r = order.reservation

                # include FULL reservation in discountable subtotal
                reservation_total += r.amount

                # store prepaid separately
                if r.reservation_type == "prepaid":
                    prepaid_amount = r.paid_amount


            # DELIVERY
            delivery_total = (
                order.delivery_fee
                if order.order_type == "delivery"
                else Decimal("0.00")
            )

            # SUBTOTAL
            subtotal = items_total + reservation_total + delivery_total

            # DISCOUNT ON FULL BILL
            discount = (
                subtotal * order.discount_percent
            ) / Decimal("100")

            # FINAL TOTAL AFTER DISCOUNT
            final_total = subtotal - discount

            # REMOVE ALREADY PAID PREPAID AMOUNT
            final_total -= prepaid_amount

            # safety
            if final_total < 0:
                final_total = Decimal("0.00")


            order_cashier_stats[cashier_id]["orders_paid"] += 1
            order_cashier_stats[cashier_id]["order_revenue"] += final_total

        cashier_performance = [
        {
            "staff_id": cashier["id"],
            "staff_name": cashier["name"],

            # Reservations
            "reservations_created": cashier_stats.get(cashier["id"], {}).get("reservations_created", 0),
            "reservation_total_paid": StaffReportService._money(
                cashier_stats.get(cashier["id"], {}).get("total_paid", 0)
            ),

            # Orders 
            "orders_paid": order_cashier_stats.get(cashier["id"], {}).get("orders_paid", 0),
            "order_revenue": StaffReportService._money(
                order_cashier_stats.get(cashier["id"], {}).get("order_revenue", 0)
            ),  

            
            "total_cash_handled": StaffReportService._money(
                cashier_stats.get(cashier["id"], {}).get("total_paid", 0)
                + order_cashier_stats.get(cashier["id"], {}).get("order_revenue", 0)
            ),
        }
        for cashier in cashiers
    ]

        cashier_performance.sort(
    key=lambda x: (-x["total_cash_handled"], -x["orders_paid"], x["staff_name"].lower())
)

        # ── Top performers across all tracked roles ─────────────────────────
        combined_top_performers = []

        for row in waiter_performance:
            if row["orders_handled"] > 0 or row["revenue"] > 0:
                combined_top_performers.append(
                    {
                        "staff_id": row["staff_id"],
                        "staff_name": row["staff_name"],
                        "role": "Waiter",
                        "orders": row["orders_handled"],
                        "revenue": row["revenue"],
                    }
                )

        for row in delivery_performance:
            if row["deliveries_handled"] > 0 or row["revenue"] > 0:
                combined_top_performers.append(
                    {
                        "staff_id": row["staff_id"],
                        "staff_name": row["staff_name"],
                        "role": "DeliveryBoy",
                        "orders": row["deliveries_handled"],
                        "revenue": row["revenue"],
                    }
                )

        for row in cashier_performance:
            if row["orders_paid"] > 0 or float(row["total_cash_handled"]) > 0:
                combined_top_performers.append(
                    {
                        "staff_id": row["staff_id"],
                        "staff_name": row["staff_name"],
                        "role": "Cashier",
                        "orders": row["orders_paid"],  # better KPI than reservations
                        "revenue": row["total_cash_handled"],  # REAL money handled
                    }
                )

        top_performers = sorted(
            combined_top_performers,
            key=lambda x: (-x["revenue"], -x["orders"], x["staff_name"].lower()),
        )[:10]

        # ── Build response ───────────────────────────────────────────────────
        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "totals": {
                "total_staff": total_staff,
                "active_staff": active_staff,
                "inactive_staff": inactive_staff,
                "total_payroll_cost": StaffReportService._money(total_payroll_cost),
                "attendance_rate_percent": attendance_rate,
                "present_days": present_count,
                "total_attendance_records": total_attendance_records,
            },
            "by_role": by_role,
            "attendance_summary": attendance_summary,
            "daily_attendance": daily_attendance,
            "waiter_performance": waiter_performance,
            "delivery_performance": delivery_performance,
            "cashier_performance": cashier_performance,
            "payroll_summary": payroll_summary,
            "top_performers": top_performers,
        }
