from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum,F,FloatField,Count,Avg,Prefetch
from django.db.models.functions import TruncDate
from django.db import models
from users.models import Staff,Attendance
from menu.models import MenuItem,Review
from orders.models import Order,OrderItem
from menu.serializers import MenuItemSerializer
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.db.models import Avg
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from django.http import HttpResponse
from .services.orders import OrderReportService
from .services.staff import StaffReportService
from restaurants.branching import get_requested_branch
from restaurants.permissions import IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q

from datetime import timedelta
from decimal import Decimal
from collections import defaultdict


def get_report_branch(request):
    return get_requested_branch(
        request,
        allow_all=True,
        raise_exception=True,
    )


def report_branch_payload(branch):
    return {
        "id": branch.id if branch else None,
        "name": branch.name if branch else "All Branches",
        "scope": "current" if branch else "all",
    }


class DashboardSummaryAPIView(APIView):
    permission_classes = [IsRestaurantAdmin, IsSameRestaurant, IsRestaurantActive]

    def get(self, request):
        staff_profile = request.user.staff_profile
        restaurant = staff_profile.restaurant
        branch = get_report_branch(request)
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        month_start = today.replace(day=1)
        last_30_days = today - timedelta(days=30)

        # ── 1. Staff & attendance ──────────────────────────────────────
        staff_qs = Staff.objects.filter(restaurant=restaurant)
        if branch:
            staff_qs = staff_qs.filter(branches=branch).distinct()

        total_staff = staff_qs.count()
        attendance_qs = Attendance.objects.filter(
            date=today, status="Present", restaurant=restaurant
        )
        if branch:
            attendance_qs = attendance_qs.filter(branch=branch)
        attendance_today = attendance_qs.count()
        attendance_rate = (
            round((attendance_today / total_staff) * 100, 2)
            if total_staff else 0
        )

        # ── 2. Menu & reviews ──────────────────────────────────────────
        menu_items_qs = MenuItem.objects.filter(restaurant=restaurant)
        if branch:
            menu_items_qs = menu_items_qs.filter(branch=branch)
        menu_items = menu_items_qs.count()
        review_qs = Review.objects.filter(restaurant=restaurant)
        if branch:
            review_qs = review_qs.filter(branch=branch)
        average_rating = (
            review_qs
            .aggregate(avg=Avg("rating"))["avg"]
            or 0
        )

        # ── 3. Order counts & delivery counts (1 query) ────────────────
        month_orders_qs = Order.objects.filter(
            restaurant=restaurant,
            created_at__gte=month_start,
        )
        if branch:
            month_orders_qs = month_orders_qs.filter(branch=branch)
        order_aggs = month_orders_qs.aggregate(
            total_orders_month=Count("id"),
            total_orders_week=Count("id", filter=Q(created_at__gte=week_start)),
            total_orders_today=Count("id", filter=Q(created_at__date=today)),
            deliveries_this_month_count=Count("id", filter=Q(order_type="delivery")),
            deliveries_this_week_count=Count(
                "id", filter=Q(created_at__date__gte=week_start, order_type="delivery")
            ),
            deliveries_today_count=Count(
                "id", filter=Q(created_at__date=today, order_type="delivery")
            ),
        )

        # ── 4. Revenue (1 query + Python sum) ──────────────────────────
        # Fetch the whole month once; today & week are subsets.
        completed_orders_qs = Order.objects.filter(
                restaurant=restaurant,
                created_at__date__gte=last_30_days,
                status__in=["completed", "delivered"],
            )
        if branch:
            completed_orders_qs = completed_orders_qs.filter(branch=branch)

        completed_orders = list(
            completed_orders_qs
            .select_related("reservation__table")
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("menu_item", "platter")
                )
            )
        )

        revenue_today = sum(
            (self._calculate_order_total(o) for o in completed_orders
             if o.created_at.date() == today),
            Decimal("0.00")
        )
        revenue_week = sum(
    self._calculate_order_total(o)
    for o in completed_orders
    if o.created_at.date() >= week_start
)
        revenue_month = sum(
    self._calculate_order_total(o)
    for o in completed_orders
    if o.created_at.date() >= month_start
)
        # ── 5. Best selling items ──────────────────────────────────────
        def get_best_selling_items(start_date):
            qs = OrderItem.objects.filter(
                order__restaurant=restaurant,
                order__created_at__gte=start_date,
            )
            if branch:
                qs = qs.filter(order__branch=branch)
            return (
                qs
                .values(item_name=F("menu_item__name"), unit_price=F("menu_item__price"))
                .annotate(
                    total_sales=Sum("quantity"),
                    total_revenue=Sum(
                        F("quantity") * F("menu_item__price"),
                        output_field=FloatField(),
                    ),
                )
                .order_by("-total_sales")[:5]
            )

        best_selling_data = {
            "best_selling_today": get_best_selling_items(today),
            "best_selling_week": get_best_selling_items(week_start),
            "best_selling_month": get_best_selling_items(month_start),
        }

        sold_items_qs = OrderItem.objects.filter(
                order__restaurant=restaurant,
                order__created_at__gte=month_start,
            )
        if branch:
            sold_items_qs = sold_items_qs.filter(order__branch=branch)

        total_sold_product_month = (
            sold_items_qs
            .aggregate(total_sold=Sum("quantity"))["total_sold"]
            or 0
        )

        # ── 6. Daily sales (last 30 days) ──────────────────────────────
        

# ── 6. Daily sales (last 30 days) ──────────────────────────────

        daily_orders = [
            o for o in completed_orders
            if o.created_at.date() >= last_30_days
        ]

        daily_map = defaultdict(lambda: {
            "orders": 0,
            "revenue": Decimal("0.00"),
        })

        for order in daily_orders:
            day = order.created_at.date()

            daily_map[day]["orders"] += 1
            daily_map[day]["revenue"] += self._calculate_order_total(order)

        daily_sales_data = [
            {
                "date": day.strftime("%Y-%m-%d"),
                "orders": values["orders"],
                "revenue": round(float(values["revenue"]), 2),
            }
            for day, values in sorted(daily_map.items())
        ]

        # ── 7. Delivery boys performance ───────────────────────────────
        delivery_staff_qs = Staff.objects.filter(restaurant=restaurant, role="DeliveryBoy")
        if branch:
            delivery_staff_qs = delivery_staff_qs.filter(branches=branch).distinct()

        delivery_filter = Q(
            deliveries__created_at__gte=month_start,
            deliveries__restaurant=restaurant,
        )
        if branch:
            delivery_filter &= Q(deliveries__branch=branch)

        delivery_boys_performance = (
            delivery_staff_qs
            .annotate(
                deliveries_count=Count(
                    "deliveries",
                    filter=delivery_filter,
                ),
                total_revenue=Sum(
                    F("deliveries__items__quantity")
                    * F("deliveries__items__menu_item__price"),
                    filter=delivery_filter,
                    output_field=FloatField(),
                ),
            )
            .values("id", "name", "image", "deliveries_count", "total_revenue")
        )

        comparison_branches = staff_profile.get_available_branches()
        if branch and not staff_profile.has_all_branch_access:
            comparison_branches = comparison_branches.filter(id=branch.id)

        branch_performance = []
        for compare_branch in comparison_branches:
            branch_orders = Order.objects.filter(
                restaurant=restaurant,
                branch=compare_branch,
                created_at__date__gte=month_start,
            )
            branch_completed = list(
                branch_orders.filter(status__in=["completed", "delivered"])
                .select_related("reservation__table")
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=OrderItem.objects.select_related("menu_item", "platter"),
                    )
                )
            )
            branch_revenue = sum(
                (self._calculate_order_total(order) for order in branch_completed),
                Decimal("0.00"),
            )
            branch_performance.append(
                {
                    "branch_id": compare_branch.id,
                    "branch_name": compare_branch.name,
                    "orders": branch_orders.count(),
                    "revenue": round(float(branch_revenue), 2),
                }
            )

        return Response({
            "branch": report_branch_payload(branch),
            "total_staff": total_staff,
            "menu_items": menu_items,
            "attendance_rate": attendance_rate,
            "average_rating": average_rating,
            "total_orders_today": order_aggs["total_orders_today"],
            "total_orders_week": order_aggs["total_orders_week"],
            "total_orders_month": order_aggs["total_orders_month"],
            "revenue_today": revenue_today,
            "revenue_week": revenue_week,
            "revenue_month": revenue_month,
            "total_sold_products_month": total_sold_product_month,
            "best_selling_items": best_selling_data,
            "daily_sales": daily_sales_data,
            "deliveries_today_count": order_aggs["deliveries_today_count"],
            "deliveries_this_month_count": order_aggs["deliveries_this_month_count"],
            "deliveries_this_week_count": order_aggs["deliveries_this_week_count"],
            "delivery_boys_performance": delivery_boys_performance,
            "branch_performance": branch_performance,
        })

    @staticmethod
    def _calculate_order_total(order):
        """
        Replicates Order.get_total() but uses prefetched items
        to avoid an extra query per order.
        """
        # Use the prefetch cache if available; otherwise fall back to DB.
        prefetched = getattr(order, "_prefetched_objects_cache", {})
        if "items" in prefetched:
            items = [i for i in prefetched["items"] if i.status != "cancelled"]
        else:
            items = order.items.exclude(status="cancelled")

        items_total = sum(
            (item.get_subtotal() for item in items),
            Decimal("0.00")
        )

        reservation_total = Decimal("0.00")
        if order.reservation:
            r = order.reservation
            if r.reservation_type in ("fee", "prepaid"):
                reservation_total = r.total_price

        delivery_total = (
            Decimal(str(order.delivery_fee))
            if order.order_type == "delivery"
            else Decimal("0.00")
        )

        subtotal = items_total + reservation_total + delivery_total
        discount = (subtotal * order.discount_percent) / Decimal("100")
        return subtotal - discount
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    def get(self, request):
        restaurant=request.user.staff_profile.restaurant
        branch = get_report_branch(request)
        notifications = Notification.objects.filter(restaurant=restaurant, is_read=False)
        if branch:
            notifications = notifications.filter(Q(branch=branch) | Q(branch__isnull=True))
        notifications = notifications.order_by('-created_at')[:10]  # latest 10
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class MarkAsReadView(APIView):
    def post(self, request, pk):
        restaurant=request.user.staff_profile.restaurant
        branch = get_report_branch(request)
        try:
            notifications = Notification.objects.filter(pk=pk, restaurant=restaurant)
            if branch:
                notifications = notifications.filter(Q(branch=branch) | Q(branch__isnull=True))
            notification = notifications.get()
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read.'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.orders import OrderReportService
from .services.finance import FinanceReportService
from .services.inventory import InventoryReportService
# from .services.staff import StaffReportService
from .services.customers import CustomerReportService


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive])
def generate_report(request):
    restaurant=request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    report_type = request.GET.get("type")
    start = request.GET.get("start")
    end = request.GET.get("end")

    if report_type == "orders":
        data = OrderReportService.summary(start, end, restaurant, branch=branch)

    elif report_type == "finance":
        data = FinanceReportService.profit_loss(start, end, restaurant, branch=branch)

    elif report_type == "inventory":
        data = InventoryReportService.stock_status(restaurant, branch=branch)
    elif report_type == "staff":
        data = StaffReportService.summary(start, end, restaurant, branch=branch)

    elif report_type == "stock_movements":
        data = InventoryReportService.movement_report(start, end, restaurant, branch=branch)

    # elif report_type == "staff_attendance":
    #     data = StaffReportService.attendance_report(start, end)

    # elif report_type == "staff_performance":
    #     data = StaffReportService.performance()

    elif report_type == "customers":
        data = CustomerReportService.overview(restaurant=restaurant, branch=branch)

    else:
        return Response({"error": "Invalid report type"}, status=400)

    return Response({
        "type": report_type,
        "branch": report_branch_payload(branch),
        "start": start,
        "end": end,
        "data": data
    })

from django.http import HttpResponse
from django.utils import timezone

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import cm

from .services.orders import OrderReportService
from .services.staff import StaffReportService


# ── Shared helpers ────────────────────────────────────────────────────────────

def _money(x):
    try:
        return f"AFN {float(x):,.2f}"
    except Exception:
        return f"AFN {x}"


def _safe(x, default="—"):
    return default if x is None else str(x)


def _make_table(table_data, col_widths=None):
    tbl = Table(table_data, colWidths=col_widths, hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  colors.HexColor("#1f4e79")),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  colors.white),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0),  10),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return tbl


def _section_title(story, styles, text):
    story.append(Spacer(1, 8))
    story.append(Paragraph(f"<b>{text}</b>", styles["Heading3"]))
    story.append(Spacer(1, 6))


# ── Orders PDF ────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def orders_pdf_report(request):
    start      = request.GET.get("start")
    end        = request.GET.get("end")
    restaurant = request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    data       = OrderReportService.summary(start, end, restaurant, branch=branch)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="orders_report.pdf"'

    doc = SimpleDocTemplate(
        response, pagesize=A4,
        leftMargin=1.3*cm, rightMargin=1.3*cm,
        topMargin=1.2*cm,  bottomMargin=1.2*cm,
        title="Orders Report"
    )

    styles = getSampleStyleSheet()
    story  = []

    # ── Header ───────────────────────────────────────────────────────────────
    story.append(Paragraph("<b>Orders Report</b>", styles["Title"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"Range: <b>{data['range']['start']}</b> to <b>{data['range']['end']}</b><br/>"
        f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}",
        styles["Normal"]
    ))
    story.append(Spacer(1, 12))

    # ── Summary Totals ────────────────────────────────────────────────────────
    totals = data.get("totals", {})
    _section_title(story, styles, "Summary Totals")
    story.append(_make_table([
        ["Metric", "Value"],
        ["Total Orders",                    _safe(totals.get("total_orders"))],
        ["Completed Orders",                _safe(totals.get("completed_orders"))],
        ["Cancelled Orders",                _safe(totals.get("cancelled_orders"))],
        ["Total Revenue (non-cancelled)",   _money(totals.get("total_revenue", 0))],
        ["Food Revenue",                    _money(totals.get("food_revenue", 0))],
        ["Delivery Revenue",                _money(totals.get("delivery_revenue", 0))],
        ["Reservation Revenue",             _money(totals.get("reservation_revenue", 0))],
        ["Lost Revenue (cancelled)",        _money(totals.get("lost_revenue", 0))],
        ["Average Order Value",             _money(totals.get("average_order_value", 0))],
        ["Avg Preparation Time (minutes)",  _safe(totals.get("average_preparation_minutes"))],
    ], col_widths=[8*cm, 8*cm]))

    # ── By Type ───────────────────────────────────────────────────────────────
    _section_title(story, styles, "Breakdown by Order Type")
    by_type    = list(data.get("by_type", []))
    type_table = [["Type", "Orders", "Revenue"]]
    for row in by_type:
        type_table.append([
            _safe(row.get("order_type")),
            _safe(row.get("count", 0)),
            _money(row.get("revenue", 0)),
        ])
    if len(type_table) == 1:
        type_table.append(["—", "0", _money(0)])
    story.append(_make_table(type_table, col_widths=[6*cm, 4*cm, 6*cm]))

    # ── By Status ─────────────────────────────────────────────────────────────
    _section_title(story, styles, "Breakdown by Status")
    by_status    = list(data.get("by_status", []))
    status_table = [["Status", "Orders"]]
    for row in by_status:
        status_table.append([_safe(row.get("status")), _safe(row.get("count", 0))])
    if len(status_table) == 1:
        status_table.append(["—", "0"])
    story.append(_make_table(status_table, col_widths=[10*cm, 6*cm]))

    # ── Top Items ─────────────────────────────────────────────────────────────
    _section_title(story, styles, "Top Selling Items")
    top_items   = list(data.get("top_items", []))
    items_table = [["Item", "Qty Sold", "Revenue"]]
    for item in top_items:
        items_table.append([
            _safe(item.get("name")),
            _safe(item.get("quantity_sold", 0)),
            _money(item.get("revenue", 0)),
        ])
    if len(items_table) == 1:
        items_table.append(["—", "0", _money(0)])
    story.append(_make_table(items_table, col_widths=[9*cm, 3*cm, 4*cm]))

    # ── Daily Breakdown ───────────────────────────────────────────────────────
    _section_title(story, styles, "Daily Breakdown (Orders & Revenue)")
    daily       = list(data.get("daily_breakdown", []))
    daily_table = [["Date", "Orders", "Revenue"]]
    for d in daily:
        date_str = d.get("date")
        if hasattr(date_str, "strftime"):
            date_str = date_str.strftime("%Y-%m-%d")
        daily_table.append([
            _safe(date_str),
            _safe(d.get("orders", 0)),
            _money(d.get("revenue", 0)),
        ])
    if len(daily_table) == 1:
        daily_table.append(["—", "0", _money(0)])
    story.append(_make_table(daily_table, col_widths=[5*cm, 4*cm, 7*cm]))

    story.append(PageBreak())

    # ── Peak Hours ────────────────────────────────────────────────────────────
    _section_title(story, styles, "Peak Hours (Top 5)")
    peak       = list(data.get("peak_hours", []))
    peak_table = [["Hour", "Orders"]]
    for p in peak:
        hour = p.get("hour")
        if hasattr(hour, "strftime"):
            hour = hour.strftime("%Y-%m-%d %H:00")
        peak_table.append([_safe(hour), _safe(p.get("count", 0))])
    if len(peak_table) == 1:
        peak_table.append(["—", "0"])
    story.append(_make_table(peak_table, col_widths=[10*cm, 6*cm]))

    # ── Waiter Performance ────────────────────────────────────────────────────
    _section_title(story, styles, "Waiter Performance (Top 10)")
    waiters      = list(data.get("waiter_performance", []))
    waiter_table = [["Waiter", "Orders Handled", "Revenue"]]
    for w in waiters:
        waiter_table.append([
            _safe(w.get("waiter_name")),
            _safe(w.get("orders_handled", 0)),
            _money(w.get("revenue", 0)),
        ])
    if len(waiter_table) == 1:
        waiter_table.append(["—", "0", _money(0)])
    story.append(_make_table(waiter_table, col_widths=[7*cm, 4*cm, 5*cm]))

    # ── Delivery Performance ──────────────────────────────────────────────────
    _section_title(story, styles, "Delivery Boy Performance (Top 10)")
    deliveries = list(data.get("delivery_performance", []))
    del_table  = [["Delivery Boy", "Deliveries", "Revenue"]]
    for d in deliveries:
        del_table.append([
            _safe(d.get("delivery_boy_name")),
            _safe(d.get("deliveries", 0)),
            _money(d.get("revenue", 0)),
        ])
    if len(del_table) == 1:
        del_table.append(["—", "0", _money(0)])
    story.append(_make_table(del_table, col_widths=[7*cm, 4*cm, 5*cm]))

    doc.build(story)
    return response


# ── Staff PDF ─────────────────────────────────────────────────────────────────
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def staff_pdf_report(request):
    start = request.GET.get("start")
    end = request.GET.get("end")
    restaurant = request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    data = StaffReportService.summary(start, end, restaurant, branch=branch)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="staff_report.pdf"'

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        leftMargin=1.3 * cm,
        rightMargin=1.3 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
        title="Staff Report",
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(Paragraph("<b>Staff Report</b>", styles["Title"]))
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            f"Range: <b>{data['range']['start']}</b> to <b>{data['range']['end']}</b><br/>"
            f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 12))

    # ── Summary Totals ──────────────────────────────────────────────────────
    totals = data.get("totals", {})
    _section_title(story, styles, "Summary Totals")
    story.append(
        _make_table(
            [
                ["Metric", "Value"],
                ["Total Staff", _safe(totals.get("total_staff"))],
                ["Active Staff", _safe(totals.get("active_staff"))],
                ["Inactive Staff", _safe(totals.get("inactive_staff"))],
                ["Total Payroll Cost", _money(totals.get("total_payroll_cost", 0))],
                ["Attendance Rate", f"{totals.get('attendance_rate_percent', 0)} %"],
                ["Present Days (records)", _safe(totals.get("present_days"))],
                ["Total Attendance Records", _safe(totals.get("total_attendance_records"))],
            ],
            col_widths=[8 * cm, 8 * cm],
        )
    )

    # ── Staff by Role ───────────────────────────────────────────────────────
    _section_title(story, styles, "Staff by Role")
    by_role = data.get("by_role", [])
    role_table = [["Role", "Count"]]
    for row in by_role:
        role_table.append([
            _safe(row.get("role")),
            _safe(row.get("count", 0)),
        ])
    if len(role_table) == 1:
        role_table.append(["—", "0"])
    story.append(_make_table(role_table, col_widths=[10 * cm, 6 * cm]))

    # ── Attendance Summary ──────────────────────────────────────────────────
    _section_title(story, styles, "Attendance Summary")
    att_summary = data.get("attendance_summary", [])
    att_table = [["Status", "Count"]]
    for row in att_summary:
        att_table.append([
            _safe(row.get("status")),
            _safe(row.get("count", 0)),
        ])
    if len(att_table) == 1:
        att_table.append(["—", "0"])
    story.append(_make_table(att_table, col_widths=[10 * cm, 6 * cm]))

    # ── Daily Attendance ────────────────────────────────────────────────────
    _section_title(story, styles, "Daily Attendance Breakdown")
    daily_att = data.get("daily_attendance", [])
    daily_table = [["Date", "Status", "Count"]]
    for row in daily_att:
        date_str = row.get("date")
        if hasattr(date_str, "strftime"):
            date_str = date_str.strftime("%Y-%m-%d")

        daily_table.append([
            _safe(date_str),
            _safe(row.get("status")),
            _safe(row.get("count", 0)),
        ])
    if len(daily_table) == 1:
        daily_table.append(["—", "—", "0"])
    story.append(_make_table(daily_table, col_widths=[5 * cm, 6 * cm, 5 * cm]))

    story.append(PageBreak())

    # ── Waiter Performance ──────────────────────────────────────────────────
    _section_title(story, styles, "Waiter Performance")
    waiters = data.get("waiter_performance", [])
    waiter_table = [["Waiter", "Orders", "Completed", "Revenue"]]
    for w in waiters:
        waiter_table.append([
            _safe(w.get("staff_name")),
            _safe(w.get("orders_handled", 0)),
            _safe(w.get("completed_orders", 0)),
            _money(w.get("revenue", 0)),
        ])
    if len(waiter_table) == 1:
        waiter_table.append(["—", "0", "0", _money(0)])
    story.append(_make_table(waiter_table, col_widths=[5 * cm, 3 * cm, 3 * cm, 5 * cm]))

    # ── Delivery Performance ────────────────────────────────────────────────
    _section_title(story, styles, "Delivery Performance")
    deliveries = data.get("delivery_performance", [])
    del_table = [["Delivery Boy", "Assigned", "Delivered", "Revenue"]]
    for d in deliveries:
        del_table.append([
            _safe(d.get("staff_name")),
            _safe(d.get("deliveries_handled", 0)),
            _safe(d.get("delivered", 0)),
            _money(d.get("revenue", 0)),
        ])
    if len(del_table) == 1:
        del_table.append(["—", "0", "0", _money(0)])
    story.append(_make_table(del_table, col_widths=[5 * cm, 3 * cm, 3 * cm, 5 * cm]))

    # ── Cashier Performance ─────────────────────────────────────────────────
    _section_title(story, styles, "Cashier Performance (Payments Overview)")

    cashiers = data.get("cashier_performance", [])

    cash_table = [[
        "Cashier",
        "Reservations",
        # "Reservation Paid",
        "Orders Paid",
        # "Order Revenue",
        "Total Cash"
    ]]

    for c in cashiers:
        cash_table.append([
            _safe(c.get("staff_name")),
            _safe(c.get("reservations_created", 0)),
            # _money(c.get("reservation_total_paid", 0)),
            _safe(c.get("orders_paid", 0)),
            # _money(c.get("order_revenue", 0)),
            _money(c.get("total_cash_handled", 0)),  
        ])

    if len(cash_table) == 1:
        cash_table.append(["—", "0", _money(0), "0", _money(0), _money(0)])

    story.append(
        _make_table(
            cash_table,
            col_widths=[3.5 * cm, 2.5 * cm, 3 * cm, 2.5 * cm, 3 * cm, 3.5 * cm],
        )
    )

    # ── Payroll Summary ─────────────────────────────────────────────────────
    _section_title(story, styles, "Payroll Summary")
    payrolls = data.get("payroll_summary", [])
    payroll_table = [[
        "Staff",
        "Role",
        "Payrolls",
        "Base",
        "Bonuses",
        "Deductions",
        "Net",
    ]]
    for p in payrolls:
        payroll_table.append([
            _safe(p.get("staff_name")),
            _safe(p.get("role")),
            _safe(p.get("payroll_count", 0)),
            _money(p.get("total_base", 0)),
            _money(p.get("total_bonuses", 0)),
            _money(p.get("total_deductions", 0)),
            _money(p.get("total_net", 0)),
        ])
    if len(payroll_table) == 1:
        payroll_table.append(["—", "—", "0", _money(0), _money(0), _money(0), _money(0)])
    story.append(
        _make_table(
            payroll_table,
            col_widths=[3.2 * cm, 2.5 * cm, 2 * cm, 2.2 * cm, 2.2 * cm, 2.4 * cm, 2.2 * cm],
        )
    )

    _section_title(story, styles, "Top Performers (by Revenue)")
    performers = data.get("top_performers", [])
    perf_table = [["Staff", "Role", "Orders", "Revenue"]]
    for p in performers:
        perf_table.append([
            _safe(p.get("staff_name")),
            _safe(p.get("role")),
            _safe(p.get("orders", 0)),
            _money(p.get("revenue", 0)),
        ])
    if len(perf_table) == 1:
        perf_table.append(["—", "—", "0", _money(0)])
    story.append(_make_table(perf_table, col_widths=[5 * cm, 4 * cm, 3 * cm, 4 * cm]))

    doc.build(story)
    return response
from django.http import HttpResponse
from django.utils import timezone

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import cm

from .services.orders import OrderReportService

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def orders_pdf_report(request):
    start = request.GET.get("start")
    end = request.GET.get("end")
    restaurant=request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    data = OrderReportService.summary(start, end, restaurant, branch=branch)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="orders_report.pdf"'

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        leftMargin=1.3 * cm,
        rightMargin=1.3 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
        title="Orders Report"
    )

    styles = getSampleStyleSheet()
    story = []

    def money(x):
        try:
            return f"AFN {float(x):,.2f}"
        except Exception:
            return f"AFN {x}"

    def safe(x, default="—"):
        return default if x is None else str(x)

    def section_title(text):
        story.append(Spacer(1, 8))
        story.append(Paragraph(f"<b>{text}</b>", styles["Heading3"]))
        story.append(Spacer(1, 6))

    def make_table(table_data, col_widths=None):
        tbl = Table(table_data, colWidths=col_widths, hAlign="LEFT")
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4e79")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),

            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        return tbl

    # ---------------- Header ----------------
    story.append(Paragraph("<b>Orders Report</b>", styles["Title"]))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        f"Range: <b>{data['range']['start']}</b> to <b>{data['range']['end']}</b><br/>"
        f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}",
        styles["Normal"]
    ))
    story.append(Spacer(1, 12))

    # ---------------- Totals ----------------
    totals = data.get("totals", {})
    section_title("Summary Totals")

    totals_table = [
        ["Metric", "Value"],
        ["Total Orders", safe(totals.get("total_orders"))],
        ["Completed Orders", safe(totals.get("completed_orders"))],
        ["Cancelled Orders", safe(totals.get("cancelled_orders"))],
        ["Total Revenue (non-cancelled)", money(totals.get("total_revenue", 0))],
        ["Food Revenue", money(totals.get("food_revenue", 0))],
        ["Delivery Revenue", money(totals.get("delivery_revenue", 0))],
        ["Reservation Revenue", money(totals.get("reservation_revenue", 0))],
        ["Lost Revenue (cancelled)", money(totals.get("lost_revenue", 0))],
        ["Average Order Value", money(totals.get("average_order_value", 0))],
        ["Avg Preparation Time (minutes)", safe(totals.get("average_preparation_minutes"))],
    ]
    story.append(make_table(totals_table, col_widths=[8 * cm, 8 * cm]))

    # ---------------- By Type ----------------
    section_title("Breakdown by Order Type")
    by_type = list(data.get("by_type", []))

    type_table = [["Type", "Orders", "Revenue"]]
    if by_type:
        for row in by_type:
            type_table.append([
                safe(row.get("order_type")),
                safe(row.get("count", 0)),
                money(row.get("revenue", 0)),
            ])
    else:
        type_table.append(["—", "0", money(0)])

    story.append(make_table(type_table, col_widths=[6 * cm, 4 * cm, 6 * cm]))

    # ---------------- By Status ----------------
    section_title("Breakdown by Status")
    by_status = list(data.get("by_status", []))

    status_table = [["Status", "Orders"]]
    if by_status:
        for row in by_status:
            status_table.append([safe(row.get("status")), safe(row.get("count", 0))])
    else:
        status_table.append(["—", "0"])

    story.append(make_table(status_table, col_widths=[10 * cm, 6 * cm]))

    # ---------------- Top Items ----------------
    section_title("Top Selling Items")
    top_items = list(data.get("top_items", []))

    items_table = [["Item", "Qty Sold", "Revenue"]]
    if top_items:
        for item in top_items:
            items_table.append([
                safe(item.get("name")),
                safe(item.get("quantity_sold", 0)),
                money(item.get("revenue", 0)),
            ])
    else:
        items_table.append(["—", "0", money(0)])

    story.append(make_table(items_table, col_widths=[9 * cm, 3 * cm, 4 * cm]))

    # ---------------- Daily breakdown ----------------
    section_title("Daily Breakdown (Orders & Revenue)")
    daily = list(data.get("daily_breakdown", []))

    daily_table = [["Date", "Orders", "Revenue"]]
    if daily:
        for d in daily:
            # d["date"] is a date object in your service output
            date_str = d.get("date")
            if hasattr(date_str, "strftime"):
                date_str = date_str.strftime("%Y-%m-%d")
            daily_table.append([
                safe(date_str),
                safe(d.get("orders", 0)),
                money(d.get("revenue", 0)),
            ])
    else:
        daily_table.append(["—", "0", money(0)])

    story.append(make_table(daily_table, col_widths=[5 * cm, 4 * cm, 7 * cm]))

    # Optional: page break before performance sections (keeps PDF tidy)
    story.append(PageBreak())

    # ---------------- Peak hours ----------------
    section_title("Peak Hours (Top 5)")
    peak = list(data.get("peak_hours", []))

    peak_table = [["Hour", "Orders"]]
    if peak:
        for p in peak:
            hour = p.get("hour")
            # TruncHour returns datetime; show hour nicely
            if hasattr(hour, "strftime"):
                hour = hour.strftime("%Y-%m-%d %H:00")
            peak_table.append([safe(hour), safe(p.get("count", 0))])
    else:
        peak_table.append(["—", "0"])

    story.append(make_table(peak_table, col_widths=[10 * cm, 6 * cm]))

    # ---------------- Waiter performance ----------------
    section_title("Waiter Performance (Top 10)")
    waiters = list(data.get("waiter_performance", []))

    waiter_table = [["Waiter", "Orders Handled", "Revenue"]]
    if waiters:
        for w in waiters:
            waiter_table.append([
                safe(w.get("waiter_name")),
                safe(w.get("orders_handled", 0)),
                money(w.get("revenue", 0)),
            ])
    else:
        waiter_table.append(["—", "0", money(0)])

    story.append(make_table(waiter_table, col_widths=[7 * cm, 4 * cm, 5 * cm]))

    # ---------------- Delivery performance ----------------
    section_title("Delivery Boy Performance (Top 10)")
    deliveries = list(data.get("delivery_performance", []))

    del_table = [["Delivery Boy", "Deliveries", "Revenue"]]
    if deliveries:
        for d in deliveries:
            del_table.append([
                safe(d.get("delivery_boy_name")),
                safe(d.get("deliveries", 0)),
                money(d.get("revenue", 0)),
            ])
    else:
        del_table.append(["—", "0", money(0)])

    story.append(make_table(del_table, col_widths=[7 * cm, 4 * cm, 5 * cm]))

    doc.build(story)
    return response

from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors

from .services.finance import FinanceReportService
from .services.inventory import InventoryReportService

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def finance_pdf_report(request):
    start = request.GET.get("start")
    end = request.GET.get("end")
    restaurant=request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    data = FinanceReportService.profit_loss(start, end, restaurant, branch=branch)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="finance_report.pdf"'

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    y = height - 40

    def new_page():
        nonlocal y
        p.showPage()
        y = height - 40
        p.setFont("Helvetica", 12)

    def ensure_space(required_height=80):
        nonlocal y
        if y - required_height < 40:
            new_page()

    def draw_section_title(title):
        nonlocal y
        ensure_space(30)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, title)
        y -= 25
        p.setFont("Helvetica", 12)

    def draw_text_line(text):
        nonlocal y
        ensure_space(20)
        p.drawString(50, y, str(text))
        y -= 18

    def draw_table(table_data, col_widths):
        nonlocal y
        if not table_data:
            return

        table = Table(table_data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkgreen),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ]))

        w, h = table.wrapOn(p, width, height)
        ensure_space(h + 20)
        table.drawOn(p, 50, y - h)
        y -= (h + 20)

    # Title
    p.setFont("Helvetica-Bold", 18)
    p.drawString(180, y, "Finance Report")
    y -= 35

    p.setFont("Helvetica", 12)
    draw_text_line(f"From: {data.get('range', {}).get('start', '-')}")
    draw_text_line(f"To: {data.get('range', {}).get('end', '-')}")
    y -= 10

    # Summary
    draw_section_title("Financial Summary")
    draw_text_line(f"Revenue: AFN {data.get('revenue', 0)}")
    draw_text_line(f"Gross Profit: AFN {data.get('gross_profit', 0)}")
    draw_text_line(f"Net Profit: AFN {data.get('net_profit', 0)}")
    draw_text_line(f"Profit Margin: {data.get('profit_margin_percent', 0)}%")
    y -= 10

    # Expenses breakdown
        # Expenses breakdown
    expenses = data.get("expenses", {})
    draw_section_title("Expense Breakdown")

    table_data = [
        ["Expense Type", "Amount (AFN)"],
        ["COGS", str(expenses.get("cogs", 0))],
        ["Wastage", str(expenses.get("wastage", 0))],
        ["Stock Purchases", str(expenses.get("stock_purchases", 0))],
        ["Operational Expenses", str(expenses.get("operational_expenses", 0))],  # NEW
        ["Total Expenses", str(expenses.get("total_expenses", 0))],
    ]
    draw_table(table_data, [220, 150])

    # Profit analysis
    draw_section_title("Profit Analysis")

    revenue = float(data.get("revenue", 0))
    gross_profit = float(data.get("gross_profit", 0))
    net_profit = float(data.get("net_profit", 0))
    margin = float(data.get("profit_margin_percent", 0))

    if net_profit > 0:
        result_text = "Business is operating at a PROFIT."
    elif net_profit < 0:
        result_text = "Business is operating at a LOSS."
    else:
        result_text = "Business is BREAK-EVEN."

    draw_text_line(result_text)
    draw_text_line(f"Gross Profit Contribution: AFN {gross_profit}")
    draw_text_line(f"Net Profit Contribution: AFN {net_profit}")
    draw_text_line(f"Final Margin: {margin}%")

    p.save()
    return response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from django.http import HttpResponse
from datetime import datetime, date, timedelta
from django.utils import timezone
from .services.inventory import InventoryReportService


def safe_str(val, max_len=None):
    if val is None:
        return "-"
    s = str(val)
    return s[:max_len] if max_len else s


def safe_num(val):
    try:
        return f"{float(val):.2f}"
    except (TypeError, ValueError):
        return "0.00"


def safe_money(val):
    try:
        return f"AFN {float(val):,.2f}"
    except (TypeError, ValueError):
        return "AFN 0.00"


def safe_date(val, fmt="%Y-%m-%d %H:%M"):
    if val is None:
        return "-"
    if isinstance(val, str):
        return val
    if isinstance(val, (datetime, date)):
        return val.strftime(fmt)
    return str(val)

@api_view(["GET"])
@permission_classes([IsAuthenticated])

def inventory_pdf_report(request):
    start = request.GET.get("start")
    end = request.GET.get("end")
    restaurant=request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    today = timezone.now().date()
    if not start:
        start = (today - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end:
        end = today.strftime("%Y-%m-%d")

    try:
        stock = InventoryReportService.stock_status(restaurant, branch=branch)
        movements = InventoryReportService.movement_report(start, end, restaurant, branch=branch)
        full_inv = InventoryReportService.full_inventory(restaurant, branch=branch)
        recent = InventoryReportService.recent_movements(start, end, limit=30, restaurant=restaurant, branch=branch)

        top_wasted = InventoryReportService.top_wasted_ingredients(start, end, limit=10, restaurant=restaurant, branch=branch)
        daily = InventoryReportService.daily_movements(start, end, restaurant=restaurant, branch=branch)
        
        
    except Exception as e:
        return HttpResponse(f"Error generating report data: {e}", status=500)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="inventory_report.pdf"'

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    margin_x = 50
    y = height - 50

    def check_page_space(needed=100):
        nonlocal y
        if y < needed:
            p.showPage()
            y = height - 50

    def draw_section_title(title, color=colors.darkblue):
        nonlocal y
        check_page_space(60)
        p.setFont("Helvetica-Bold", 14)
        p.setFillColor(color)
        p.drawString(margin_x, y, title)
        p.setFillColor(colors.black)
        y -= 22

    def draw_table(table_data, col_widths, header_color=colors.darkblue, header_text_color=colors.white):
        nonlocal y
        if len(table_data) <= 1:
            check_page_space(30)
            p.setFont("Helvetica-Oblique", 10)
            p.setFillColor(colors.grey)
            p.drawString(margin_x, y, "No data available.")
            p.setFillColor(colors.black)
            y -= 20
            return

        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), header_color),
            ("TEXTCOLOR", (0, 0), (-1, 0), header_text_color),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ]))
        w, h = table.wrapOn(p, width, height)
        check_page_space(h + 20)
        table.drawOn(p, margin_x, y - h)
        y -= (h + 20)

    # ---------------- Title ----------------
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, y, "Inventory Report")
    y -= 30

    p.setFont("Helvetica", 11)
    p.drawString(margin_x, y, f"From: {start}")
    p.drawString(width / 2, y, f"To: {end}")
    y -= 30

    # ---------------- Stock Summary ----------------
    draw_section_title("Stock Status Summary")
    p.setFont("Helvetica", 11)
    summary_lines = [
        f"Total Items: {stock['total_items']}",
        f"Active Items: {stock['active_items']}",
        f"Inactive Items: {stock['inactive_items']}",
        f"Out of Stock: {stock['out_of_stock_count']}",
        f"Critical Stock: {stock['critical_stock_count']}",
        f"Low Stock: {stock['low_stock_count']}",
        f"Healthy Stock: {stock['healthy_stock_count']}",
        f"Total Inventory Value: {safe_money(stock['total_inventory_value'])}",
    ]
    for line in summary_lines:
        check_page_space(20)
        p.drawString(margin_x, y, line)
        y -= 18
    y -= 10

    if stock["out_of_stock_count"] or stock["critical_stock_count"]:
        check_page_space(30)
        p.setFont("Helvetica-Bold", 11)
        p.setFillColor(colors.red)
        msg = f"Warning: {stock['out_of_stock_count']} out of stock, {stock['critical_stock_count']} critical!"
        p.drawString(margin_x, y, msg)
        p.setFillColor(colors.black)
        y -= 25

    # ---------------- Out of Stock ----------------
    if stock["out_of_stock_list"]:
        draw_section_title("Out of Stock Items", colors.red)
        rows = [["Ingredient", "Unit", "Threshold", "Cost/Unit"]]
        for i in stock["out_of_stock_list"]:
            rows.append([
                safe_str(i["name"], 28),
                safe_str(i["unit"], 10),
                safe_num(i["threshold"]),
                safe_money(i["cost_per_unit"]),
            ])
        draw_table(rows, [200, 80, 90, 110], header_color=colors.red)

    # ---------------- Critical Stock ----------------
    if stock["critical_stock_list"]:
        draw_section_title("Critical Stock Items", colors.darkred)
        rows = [["Ingredient", "Available", "Threshold", "Unit", "Stock Value"]]
        for i in stock["critical_stock_list"]:
            rows.append([
                safe_str(i["name"], 25),
                safe_num(i["available"]),
                safe_num(i["threshold"]),
                safe_str(i["unit"], 8),
                safe_money(i["stock_value"]),
            ])
        draw_table(rows, [160, 70, 70, 60, 110], header_color=colors.darkred)

    # ---------------- Low Stock ----------------
    if stock["low_stock_list"]:
        draw_section_title("Low Stock Items", colors.orange)
        rows = [["Ingredient", "Available", "Threshold", "Unit", "Stock Value"]]
        for i in stock["low_stock_list"]:
            rows.append([
                safe_str(i["name"], 25),
                safe_num(i["available"]),
                safe_num(i["threshold"]),
                safe_str(i["unit"], 8),
                safe_money(i["stock_value"]),
            ])
        draw_table(rows, [160, 70, 70, 60, 110], header_color=colors.orange, header_text_color=colors.black)

    # ---------------- Full Inventory ----------------
    draw_section_title("Full Inventory List")
    rows = [["Ingredient", "Available", "Threshold", "Unit", "Cost/Unit", "Status"]]
    for i in full_inv:
        rows.append([
            safe_str(i["name"], 22),
            safe_num(i["available"]),
            safe_num(i["threshold"]),
            safe_str(i["unit"], 8),
            safe_money(i["cost_per_unit"]),
            safe_str(i["status"], 12),
        ])
    draw_table(rows, [140, 65, 65, 55, 90, 80])

    # ---------------- Movements Summary ----------------
    draw_section_title("Stock Movements Summary")
    p.setFont("Helvetica", 11)
    mv_lines = [
        f"Total Movements: {movements['total_movements']}",
        f"Total Purchase Cost: {safe_money(movements['total_purchase_cost'])}",
        f"Total Consumption Qty (Orders): {safe_num(movements['total_consumption_quantity'])}",
        f"Total Consumption Cost: {safe_money(movements['total_consumption_cost'])}",
        f"Total Waste Qty: {safe_num(movements['total_waste_quantity'])}",
        f"Total Waste Cost: {safe_money(movements['total_waste_cost'])}",
    ]
    for line in mv_lines:
        check_page_space(20)
        p.drawString(margin_x, y, line)
        y -= 18
    y -= 10

    # ---------------- Movements by Type ----------------
    draw_section_title("Purchase Movements Only")

    rows = [["Movement Type", "Count", "Total Quantity"]]

    for m in movements["by_type"]:
        if str(m["movement_type"]).lower() == "purchase":
            rows.append([
                "Purchase",
                str(m["count"] or 0),
                safe_num(m.get("total_quantity")),
            ])

    draw_table(rows, [200, 80, 120], header_color=colors.steelblue)
    # ---------------- Daily Movements ----------------
    draw_section_title("Daily Movement Trend")
    rows = [["Date", "Movements", "Total Quantity"]]
    for d in daily:
        rows.append([
            safe_date(d["date"], fmt="%Y-%m-%d"),
            str(d["total_movements"] or 0),
            safe_num(d.get("total_quantity")),
        ])
    draw_table(rows, [120, 100, 120], header_color=colors.teal)

    
    

    # ---------------- Top Wasted Ingredients ----------------
    draw_section_title("Top Wasted Ingredients", colors.darkred)
    rows = [["Ingredient", "Wasted Qty", "Waste Cost", "Count"]]
    for i in top_wasted:
        rows.append([
            safe_str(i["name"], 25),
            safe_num(i["total_wasted"]),
            safe_money(i["waste_cost"]),
            str(i["count"] or 0),
        ])
    draw_table(rows, [160, 90, 110, 70], header_color=colors.darkred)



    # ---------------- Recent Movements ----------------
    draw_section_title("Recent Stock Movements")
    rows = [["Date", "Ingredient", "Type", "Qty", "By", "Order#"]]
    for m in recent:
        rows.append([
            safe_date(m["date"]),
            safe_str(m["ingredient"], 18),
            safe_str(m["type"], 12),
            safe_num(m["quantity"]),
            safe_str(m["created_by"], 14),
            safe_str(m["related_order"], 8),
        ])
    draw_table(rows, [100, 110, 75, 60, 90, 60], header_color=colors.darkblue)

    # ---------------- Footer ----------------
    p.setFont("Helvetica-Oblique", 9)
    p.setFillColor(colors.grey)
    p.drawCentredString(width / 2, 30, f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    p.showPage()
    p.save()
    return response


# def stock_movements_pdf_report(request):
#     start = request.GET.get("start")
#     end = request.GET.get("end")

#     data = InventoryReportService.movement_report(start, end)

#     response = HttpResponse(content_type="application/pdf")
#     response["Content-Disposition"] = 'attachment; filename="stock_movements_report.pdf"'

#     p = canvas.Canvas(response, pagesize=A4)
#     width, height = A4
#     y = height - 40

#     def new_page():
#         nonlocal y
#         p.showPage()
#         y = height - 40
#         p.setFont("Helvetica", 12)

#     def ensure_space(required_height=80):
#         nonlocal y
#         if y - required_height < 40:
#             new_page()

#     def draw_section_title(title):
#         nonlocal y
#         ensure_space(30)
#         p.setFont("Helvetica-Bold", 14)
#         p.drawString(50, y, title)
#         y -= 25
#         p.setFont("Helvetica", 12)

#     def draw_text_line(text):
#         nonlocal y
#         ensure_space(20)
#         p.drawString(50, y, str(text))
#         y -= 18

#     def draw_table(table_data, col_widths):
#         nonlocal y
#         if not table_data:
#             return

#         table = Table(table_data, colWidths=col_widths)
#         table.setStyle(TableStyle([
#             ("BACKGROUND", (0, 0), (-1, 0), colors.darkred),
#             ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
#             ("GRID", (0, 0), (-1, -1), 1, colors.black),
#             ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
#             ("FONTSIZE", (0, 0), (-1, -1), 10),
#             ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
#             ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
#         ]))

#         w, h = table.wrapOn(p, width, height)
#         ensure_space(h + 20)
#         table.drawOn(p, 50, y - h)
#         y -= (h + 20)

#     # Title
#     p.setFont("Helvetica-Bold", 18)
#     p.drawString(140, y, "Stock Movements Report")
#     y -= 35

#     p.setFont("Helvetica", 12)
#     draw_text_line(f"From: {start or '-'}")
#     draw_text_line(f"To: {end or '-'}")
#     y -= 10

#     # Summary
#     draw_section_title("Movement Summary")
#     draw_text_line(f"Total Movements: {data.get('total_movements', 0)}")
#     y -= 10

#     # By type
#     by_type = list(data.get("by_type", []))
#     if by_type:
#         draw_section_title("Movements by Type")
#         table_data = [["Movement Type", "Count"]]
#         for item in by_type:
#             table_data.append([
#                 str(item.get("movement_type", "")),
#                 str(item.get("count", 0)),
#             ])
#         draw_table(table_data, [220, 120])
#     else:
#         draw_section_title("Movements by Type")
#         draw_text_line("No stock movements found for the selected range.")

#     p.save()
#     return response
