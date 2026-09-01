from xml.sax.saxutils import escape

from django.http import HttpResponse
from django.utils import timezone
from reportlab.graphics.charts.barcharts import HorizontalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.shapes import Drawing, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    LongTable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from audit.services import record_report_export
from restaurants.permissions import IsRestaurantActive, IsSameRestaurant

from .services.menu_items import MenuItemSalesReportService
from .views import get_report_branch


BRAND = colors.HexColor("#0f766e")
BRAND_DARK = colors.HexColor("#134e4a")
ACCENT = colors.HexColor("#f59e0b")
INK = colors.HexColor("#0f172a")
MUTED = colors.HexColor("#64748b")
LINE = colors.HexColor("#cbd5e1")
SOFT = colors.HexColor("#f0fdfa")
ROW_ALT = colors.HexColor("#f8fafc")


def _bool(value, default=True):
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _money(value, currency="AFN"):
    try:
        return f"{currency} {float(value or 0):,.2f}"
    except (TypeError, ValueError):
        return f"{currency} 0.00"


def _number(value):
    try:
        return f"{int(value or 0):,}"
    except (TypeError, ValueError):
        return "0"


def _paragraph(value, style):
    return Paragraph(escape(str(value if value not in (None, "") else "-")), style)


def _table(data, widths, *, repeat_rows=1, numeric_columns=None, font_size=7.5):
    table = LongTable(data, colWidths=widths, repeatRows=repeat_rows, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), font_size),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ROW_ALT]),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("FONTSIZE", (0, 1), (-1, -1), font_size),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
    ]
    for column in numeric_columns or []:
        commands.append(("ALIGN", (column, 1), (column, -1), "RIGHT"))
    table.setStyle(TableStyle(commands))
    return table


def _section(title, styles):
    return [
        Spacer(1, 0.25 * cm),
        Paragraph(escape(title), styles["ReportSection"]),
        Spacer(1, 0.15 * cm),
    ]


def _top_items_chart(items):
    items = [item for item in items if item.get("units_sold", 0) > 0][:10]
    if not items:
        return None
    drawing = Drawing(25.5 * cm, 8 * cm)
    chart = HorizontalBarChart()
    chart.x = 6 * cm
    chart.y = 0.8 * cm
    chart.height = 6.5 * cm
    chart.width = 18.5 * cm
    chart.data = [[float(item.get("units_sold", 0)) for item in reversed(items)]]
    chart.categoryAxis.categoryNames = [
        str(item.get("name") or "-")[:34] for item in reversed(items)
    ]
    chart.categoryAxis.labels.fontName = "Helvetica"
    chart.categoryAxis.labels.fontSize = 7
    chart.categoryAxis.labels.boxAnchor = "e"
    chart.valueAxis.valueMin = 0
    chart.valueAxis.labels.fontSize = 7
    chart.valueAxis.gridStrokeColor = LINE
    chart.bars[0].fillColor = BRAND
    chart.bars[0].strokeColor = BRAND_DARK
    chart.barWidth = 9
    drawing.add(chart)
    drawing.add(String(6 * cm, 7.55 * cm, "Units sold", fontSize=8, fillColor=MUTED))
    return drawing


def _category_chart(categories):
    categories = [row for row in categories if row.get("net_sales", 0) > 0][:8]
    if not categories:
        return None
    palette = [
        BRAND,
        ACCENT,
        colors.HexColor("#2563eb"),
        colors.HexColor("#7c3aed"),
        colors.HexColor("#dc2626"),
        colors.HexColor("#0891b2"),
        colors.HexColor("#65a30d"),
        colors.HexColor("#ea580c"),
    ]
    drawing = Drawing(25.5 * cm, 8 * cm)
    pie = Pie()
    pie.x = 1.5 * cm
    pie.y = 0.5 * cm
    pie.width = 6.5 * cm
    pie.height = 6.5 * cm
    pie.data = [float(row.get("net_sales", 0)) for row in categories]
    pie.labels = [f"{row.get('sales_percentage', 0):.1f}%" for row in categories]
    pie.slices.strokeWidth = 0.5
    pie.slices.strokeColor = colors.white
    pie.simpleLabels = 1
    for index, color in enumerate(palette[: len(categories)]):
        pie.slices[index].fillColor = color
    drawing.add(pie)
    for index, row in enumerate(categories):
        y = 6.9 * cm - (index * 0.72 * cm)
        drawing.add(
            String(
                10 * cm,
                y,
                f"{row.get('category_name') or 'Uncategorized'}",
                fontSize=8,
                fillColor=INK,
            )
        )
        drawing.add(
            String(
                20.5 * cm,
                y,
                _money(row.get("net_sales")),
                fontSize=8,
                fillColor=MUTED,
            )
        )
        drawing.add(
            String(9.45 * cm, y, "■", fontSize=10, fillColor=palette[index])
        )
    return drawing


def _report_title(report_type):
    return {
        "complete": "Complete Menu Item Sales Report",
        "top": "Top Selling Menu Items",
        "bottom": "Least Selling Menu Items",
        "category": "Category Menu Item Sales Report",
        "all_ranked": "All Menu Items Ranked",
    }.get(report_type, "Menu Item Sales Report")


def _filter_label(data, report_type):
    filters = data["filters"]
    category_name = "All Categories"
    if filters.get("category"):
        match = next(
            (
                row["name"]
                for row in data.get("categories", [])
                if row["id"] == filters["category"]
            ),
            None,
        )
        category_name = match or "Selected category"
    ranking = report_type.replace("_", " ").title()
    return [
        ["Category", category_name, "Report type", ranking],
        ["Rank by", filters["rank_by"].replace("_", " ").title(), "Sort", f"{filters['sort_by'].replace('_', ' ').title()} ({filters['sort_order'].upper()})"],
        ["Item limit", filters["limit"] if report_type in {"top", "bottom"} else "All", "Zero-sales items", "Included" if filters["include_zero_sales"] else "Excluded"],
        ["Search", filters.get("search") or "None", "Sales status", filters["sales_status"].title()],
    ]


def _page_decorator(restaurant, branch, generated_at):
    footer_label = f"{restaurant.name} · {branch.name if branch else 'All Branches'}"

    def decorate(canvas, doc):
        canvas.saveState()
        width, _ = landscape(A4)
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.4)
        canvas.line(doc.leftMargin, 0.75 * cm, width - doc.rightMargin, 0.75 * cm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(doc.leftMargin, 0.42 * cm, footer_label[:90])
        canvas.drawCentredString(width / 2, 0.42 * cm, "Confidential business report")
        canvas.drawRightString(
            width - doc.rightMargin,
            0.42 * cm,
            f"Page {doc.page} · Generated {generated_at}",
        )
        canvas.restoreState()

    return decorate


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive])
def menu_item_sales_pdf(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_report_branch(request)
    start = request.GET.get("start")
    end = request.GET.get("end")
    report_type = str(request.GET.get("report_type") or "complete").lower()
    if report_type not in {"complete", "top", "bottom", "category", "all_ranked"}:
        report_type = "complete"

    params = request.GET.copy()
    if report_type == "top":
        params["ranking"] = "top"
        params["sort_order"] = "desc"
        params["sort_by"] = params.get("rank_by", "quantity")
    elif report_type == "bottom":
        params["ranking"] = "bottom"
        params["sort_order"] = "asc"
        params["sort_by"] = params.get("rank_by", "quantity")
    else:
        params["ranking"] = "all"

    try:
        data = MenuItemSalesReportService.generate(
            start,
            end,
            restaurant,
            branch=branch,
            params=params,
            paginate=False,
        )
    except ValueError as exc:
        return HttpResponse(str(exc), status=400, content_type="text/plain")

    include_summary = _bool(request.GET.get("include_summary"), True)
    include_kpis = _bool(request.GET.get("include_kpis"), True)
    include_details = _bool(request.GET.get("include_details"), True)
    include_categories = _bool(request.GET.get("include_categories"), True)
    include_charts = _bool(request.GET.get("include_charts"), True)
    include_trend = _bool(request.GET.get("include_trend"), True)
    include_insights = _bool(request.GET.get("include_insights"), True)

    generated = timezone.localtime(timezone.now())
    generated_label = generated.strftime("%Y-%m-%d %H:%M %Z")
    response = HttpResponse(content_type="application/pdf")
    filename = f"menu_item_sales_{report_type}_{data['range']['start']}_{data['range']['end']}.pdf"
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    doc = SimpleDocTemplate(
        response,
        pagesize=landscape(A4),
        leftMargin=1.15 * cm,
        rightMargin=1.15 * cm,
        topMargin=1 * cm,
        bottomMargin=1.15 * cm,
        title=_report_title(report_type),
        author=restaurant.name,
        subject="Menu item sales analytics",
    )
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportMeta",
            parent=styles["BodyText"],
            fontSize=8.5,
            leading=12,
            textColor=MUTED,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportSection",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=BRAND_DARK,
            borderColor=BRAND,
            borderWidth=0,
            borderPadding=0,
            spaceBefore=5,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallCell",
            parent=styles["BodyText"],
            fontSize=7,
            leading=9,
            textColor=INK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Insight",
            parent=styles["BodyText"],
            fontSize=9,
            leading=13,
            leftIndent=9,
            bulletIndent=0,
            textColor=INK,
        )
    )

    story = []
    logo = None
    logo_field = getattr(branch, "logo", None) if branch else None
    logo_field = logo_field or getattr(restaurant, "logo", None)
    if logo_field:
        try:
            logo = Image(logo_field.path, width=1.8 * cm, height=1.8 * cm)
        except (OSError, ValueError):
            logo = None

    header_text = [
        Paragraph(_report_title(report_type), styles["ReportTitle"]),
        Paragraph(
            f"<b>{escape(restaurant.name)}</b> · {escape(branch.name if branch else 'All Branches')}<br/>"
            f"Period: <b>{data['range']['start']}</b> to <b>{data['range']['end']}</b> · Generated: {escape(generated_label)}",
            styles["ReportMeta"],
        ),
    ]
    header = Table(
        [[logo or "", header_text]],
        colWidths=[2.2 * cm, 23.5 * cm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 0.7, BRAND),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        ),
    )
    story.extend([header, Spacer(1, 0.25 * cm)])

    filter_rows = _filter_label(data, report_type)
    filter_table = Table(filter_rows, colWidths=[2.3 * cm, 7.4 * cm, 2.6 * cm, 13.2 * cm])
    filter_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND_DARK),
                ("TEXTCOLOR", (2, 0), (2, -1), BRAND_DARK),
                ("TEXTCOLOR", (1, 0), (1, -1), INK),
                ("TEXTCOLOR", (3, 0), (3, -1), INK),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.35, LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(filter_table)

    summary = data["summary"]
    currency = data["currency"]
    if include_summary:
        story.extend(_section("Executive Summary", styles))
        summary_text = (
            f"This report covers <b>{_number(summary['distinct_items_sold'])}</b> selling menu products "
            f"and <b>{_number(summary['total_units_sold'])}</b> units. Net menu-item revenue was "
            f"<b>{_money(summary['total_revenue'], currency)}</b> after "
            f"<b>{_money(summary['total_discount'], currency)}</b> in attributable order discounts."
        )
        story.append(Paragraph(summary_text, styles["BodyText"]))

    if include_kpis:
        story.extend(_section("Key Performance Indicators", styles))
        top = summary.get("top_selling_item") or {}
        lowest = summary.get("lowest_selling_item") or {}
        kpi_data = [
            ["Distinct sold items", "Units sold", "Net revenue", "Avg revenue / item", "Avg selling price"],
            [
                _number(summary["distinct_items_sold"]),
                _number(summary["total_units_sold"]),
                _money(summary["total_revenue"], currency),
                _money(summary["average_revenue_per_item"], currency),
                _money(summary["average_selling_price"], currency),
            ],
            ["Top selling item", f"{top.get('name', '-')} · {_number(top.get('units_sold'))} units · {_money(top.get('revenue'), currency)}", "Lowest selling item", f"{lowest.get('name', '-')} · {_number(lowest.get('units_sold'))} units · {_money(lowest.get('revenue'), currency)}", ""],
        ]
        kpi_table = Table(kpi_data, colWidths=[4.3 * cm, 6.2 * cm, 4.3 * cm, 6.2 * cm, 4.5 * cm])
        kpi_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("SPAN", (1, 2), (1, 2)),
                    ("SPAN", (3, 2), (4, 2)),
                    ("BACKGROUND", (0, 1), (-1, -1), SOFT),
                    ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]
            )
        )
        story.append(kpi_table)

    if include_charts and data["items"]:
        story.extend(_section("Visual Analytics", styles))
        top_chart = _top_items_chart(data["items"])
        category_chart = _category_chart(data["category_summary"])
        if top_chart:
            story.append(Paragraph("Top Selling Items", styles["Heading3"]))
            story.append(top_chart)
        if category_chart:
            story.append(Paragraph("Revenue by Category", styles["Heading3"]))
            story.append(category_chart)

    if include_details:
        story.append(PageBreak())
        story.extend(_section("Menu Item Sales Detail", styles))
        selected_sales_percentage = sum(
            float(item.get("sales_percentage", 0)) for item in data["items"]
        )
        item_rows = [["Rank", "Menu Item", "Type", "Category", "Units", "Orders", "Gross", "Discount", "Net", "Avg Price", "% Sales"]]
        for item in data["items"]:
            item_rows.append(
                [
                    item["rank"],
                    _paragraph(item["name"], styles["SmallCell"]),
                    "Platter" if item["product_type"] == "platter" else "Item",
                    _paragraph(item["category_name"], styles["SmallCell"]),
                    _number(item["units_sold"]),
                    _number(item["order_count"]),
                    _money(item["gross_sales"], currency),
                    _money(item["discount"], currency),
                    _money(item["net_sales"], currency),
                    _money(item["average_price"], currency),
                    f"{item['sales_percentage']:.2f}%",
                ]
            )
        if len(item_rows) == 1:
            item_rows.append(["-", "No qualifying sales", "-", "-", "0", "0", _money(0), _money(0), _money(0), _money(0), "0.00%"])
        item_rows.append(
            [
                "",
                "TOTAL",
                "",
                "",
                _number(summary["total_units_sold"]),
                "",
                _money(summary["gross_sales"], currency),
                _money(summary["total_discount"], currency),
                _money(summary["total_revenue"], currency),
                _money(summary["average_selling_price"], currency),
                f"{selected_sales_percentage:.2f}%",
            ]
        )
        detail_table = _table(
            item_rows,
            [1.0 * cm, 4.2 * cm, 1.5 * cm, 3.2 * cm, 1.35 * cm, 1.3 * cm, 2.4 * cm, 2.2 * cm, 2.4 * cm, 2.3 * cm, 1.5 * cm],
            numeric_columns=[0, 4, 5, 6, 7, 8, 9, 10],
            font_size=6.8,
        )
        detail_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                    ("BACKGROUND", (0, -1), (-1, -1), SOFT),
                    ("LINEABOVE", (0, -1), (-1, -1), 0.8, BRAND),
                ]
            )
        )
        story.append(detail_table)

    if include_categories:
        story.extend(_section("Category Performance", styles))
        category_rows = [["Category", "Items Sold", "Units", "Gross Sales", "Discount", "Net Sales", "% Sales", "Avg Item Revenue"]]
        for row in data["category_summary"]:
            category_rows.append(
                [
                    _paragraph(row["category_name"], styles["SmallCell"]),
                    _number(row["items_sold"]),
                    _number(row["units_sold"]),
                    _money(row["gross_sales"], currency),
                    _money(row["discount"], currency),
                    _money(row["net_sales"], currency),
                    f"{row['sales_percentage']:.2f}%",
                    _money(row["average_item_revenue"], currency),
                ]
            )
        if len(category_rows) == 1:
            category_rows.append(["No categories", "0", "0", _money(0), _money(0), _money(0), "0.00%", _money(0)])
        story.append(
            _table(
                category_rows,
                [5.1 * cm, 2.2 * cm, 2.1 * cm, 3.2 * cm, 3.1 * cm, 3.2 * cm, 2.0 * cm, 3.5 * cm],
                numeric_columns=[1, 2, 3, 4, 5, 6, 7],
            )
        )

    if include_trend:
        story.extend(_section(f"Sales Trend ({data['trend']['granularity'].title()})", styles))
        trend_rows = [["Period", "Units Sold", "Net Revenue"]]
        for point in data["trend"]["points"]:
            trend_rows.append(
                [
                    point["period"],
                    _number(point["units_sold"]),
                    _money(point["revenue"], currency),
                ]
            )
        if len(trend_rows) == 1:
            trend_rows.append(["No qualifying sales", "0", _money(0, currency)])
        story.append(
            _table(
                trend_rows,
                [8.5 * cm, 7.5 * cm, 9.5 * cm],
                numeric_columns=[1, 2],
            )
        )

    if include_insights:
        story.extend(_section("Deterministic Insights", styles))
        insight_text = {
            "top_performer": lambda row: f"Top performer: {row['item']} generated the highest net revenue ({_money(row['value'], currency)}).",
            "most_sold": lambda row: f"Most sold: {row['item']} recorded the highest quantity ({_number(row['value'])} units).",
            "category_leader": lambda row: f"Category leader: {row['category']} generated the highest category revenue ({_money(row['value'], currency)}).",
            "low_performer": lambda row: f"Low performer: {row['item']} had the lowest quantity among products with recorded sales ({_number(row['value'])} units).",
        }
        if data["insights"]:
            for row in data["insights"]:
                story.append(
                    Paragraph(
                        escape(insight_text[row["type"]](row)),
                        styles["Insight"],
                        bulletText="•",
                    )
                )
        else:
            story.append(Paragraph("No sales-based insights are available for this scope.", styles["BodyText"]))

    page_decorator = _page_decorator(restaurant, branch, generated_label)
    doc.build(story, onFirstPage=page_decorator, onLaterPages=page_decorator)

    record_report_export(
        request=request,
        report_type="menu_items",
        export_format="pdf",
        branch=branch,
        start=start,
        end=end,
        metadata={
            "menu_item_report_type": report_type,
            "filters": data["filters"],
            "sections": {
                "summary": include_summary,
                "kpis": include_kpis,
                "details": include_details,
                "categories": include_categories,
                "charts": include_charts,
                "trend": include_trend,
                "insights": include_insights,
            },
        },
    )
    return response
