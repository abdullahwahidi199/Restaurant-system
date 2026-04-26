from datetime import datetime, timedelta, time

from django.db.models import (
    Sum,
    Count,
    F,
    Q,
    Value,
    ExpressionWrapper,
    DecimalField,
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.dateparse import parse_date

from users.models import Staff, Attendance, Payroll
from orders.models import Order, Reservation


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
    def summary(start, end, restaurant=None):
        start_dt, end_dt = StaffReportService._parse_range(start, end)
        start_date = start_dt.date()
        end_date = end_dt.date()

        # ── Base querysets ──────────────────────────────────────────────────
        staff_qs = Staff.objects.filter(restaurant=restaurant)

        orders_qs = Order.objects.filter(
            restaurant=restaurant,
            created_at__range=[start_dt, end_dt],
        )

        attendance_qs = Attendance.objects.filter(
            restaurant=restaurant,
            date__range=[start_date, end_date],
        )

        payroll_qs = Payroll.objects.filter(
            restaurant=restaurant,
            period_start__lte=end_date,
            period_end__gte=start_date,
        )

        reservation_qs = Reservation.objects.filter(
            restaurant=restaurant,
            created_at__range=[start_dt, end_dt],
        )

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
                    order_type__in=["dine-in", "takeaway"],
                    received_by__isnull=False,
                    received_by__role="Waiter",
                )
                .values(
                    staff_id=F("received_by__id"),
                )
                .annotate(
                    orders_handled=Count("id", distinct=True),
                    completed_orders=Count(
                        "id",
                        filter=Q(status="completed"),
                        distinct=True,
                    ),
                    revenue=Coalesce(
                        Sum(
                            ExpressionWrapper(
                                F("items__quantity") * F("items__menu_item__price"),
                                output_field=StaffReportService.MONEY_FIELD,
                            )
                        ),
                        Value(0, output_field=StaffReportService.MONEY_FIELD),
                    ),
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

        delivery_stats = {
            row["staff_id"]: row
            for row in (
                orders_qs
                .filter(
                    order_type="delivery",
                    delivery_boy__isnull=False,
                    delivery_boy__role="DeliveryBoy",
                )
                .values(
                    staff_id=F("delivery_boy__id"),
                )
                .annotate(
                    deliveries_handled=Count("id", distinct=True),
                    delivered=Count(
                        "id",
                        filter=Q(status="delivered"),
                        distinct=True,
                    ),
                    revenue=Coalesce(
                        Sum(
                            ExpressionWrapper(
                                F("items__quantity") * F("items__menu_item__price"),
                                output_field=StaffReportService.MONEY_FIELD,
                            )
                        ),
                        Value(0, output_field=StaffReportService.MONEY_FIELD),
                    ),
                )
            )
        }

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

        cashier_performance = [
            {
                "staff_id": cashier["id"],
                "staff_name": cashier["name"],
                "reservations_created": cashier_stats.get(cashier["id"], {}).get("reservations_created", 0),
                "total_amount": StaffReportService._money(
                    cashier_stats.get(cashier["id"], {}).get("total_amount", 0)
                ),
                "total_paid": StaffReportService._money(
                    cashier_stats.get(cashier["id"], {}).get("total_paid", 0)
                ),
            }
            for cashier in cashiers
        ]

        cashier_performance.sort(
            key=lambda x: (-x["reservations_created"], -x["total_amount"], x["staff_name"].lower())
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
            if row["reservations_created"] > 0 or row["total_amount"] > 0:
                combined_top_performers.append(
                    {
                        "staff_id": row["staff_id"],
                        "staff_name": row["staff_name"],
                        "role": "Cashier",
                        "orders": row["reservations_created"],
                        "revenue": row["total_amount"],
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