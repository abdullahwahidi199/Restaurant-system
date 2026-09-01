from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import (
    Count,
    DecimalField,
    ExpressionWrapper,
    F,
    Q,
    Sum,
    Value,
)
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncWeek

from menu.models import Category, MenuItem, Platter
from orders.models import OrderItem

from .orders import OrderReportService


MONEY = Decimal("0.01")
SUCCESSFUL_ORDER_STATUSES = ("completed", "delivered")
ALLOWED_RANK_FIELDS = {
    "quantity": "units_sold",
    "revenue": "net_sales",
    "average_price": "average_price",
    "orders": "order_count",
    "percentage_sales": "sales_percentage",
}
ALLOWED_SORT_FIELDS = {
    **ALLOWED_RANK_FIELDS,
    "name": "name",
    "category": "category_name",
    "gross_sales": "gross_sales",
    "discount": "discount",
    "net_sales": "net_sales",
}


def _money(value):
    return Decimal(value or 0).quantize(MONEY, rounding=ROUND_HALF_UP)


def _float(value):
    return float(_money(value))


def _bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _positive_int(value, default, maximum):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return min(max(parsed, 1), maximum)


class MenuItemSalesReportService:
    """Branch-safe sales analytics for menu items and sellable platters.

    Aggregation stays in the database. Only the compact per-product result set is
    merged in Python so menu items and platters can share one ranked report.
    """

    @staticmethod
    def _product_scope(model, restaurant, branch, category_id=None, search=""):
        queryset = model.objects.filter(restaurant=restaurant)
        if branch:
            queryset = queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(name_dari__icontains=search)
                | Q(name_pashto__icontains=search)
            )
        return queryset

    @staticmethod
    def _sales_scope(restaurant, branch, start_dt, end_dt):
        queryset = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__range=(start_dt, end_dt),
            order__status__in=SUCCESSFUL_ORDER_STATUSES,
        )
        if branch:
            queryset = queryset.filter(order__branch=branch)
        return queryset

    @staticmethod
    def _money_expressions(product_type):
        live_price = (
            "menu_item__price" if product_type == "menu_item" else "platter__price"
        )
        money_field = DecimalField(max_digits=18, decimal_places=2)
        price = Coalesce(
            F("price_at_order"),
            F(live_price),
            Value(Decimal("0.00")),
            output_field=money_field,
        )
        gross = ExpressionWrapper(
            F("quantity") * price,
            output_field=money_field,
        )
        discount = ExpressionWrapper(
            gross * Coalesce(F("order__discount_percent"), Value(Decimal("0.00")))
            / Value(Decimal("100.00")),
            output_field=money_field,
        )
        return gross, discount

    @staticmethod
    def _aggregate_product_sales(
        base_queryset,
        *,
        product_type,
        category_id=None,
        search="",
    ):
        relation = "menu_item" if product_type == "menu_item" else "platter"
        queryset = base_queryset.filter(**{f"{relation}__isnull": False}).exclude(
            status="cancelled"
        )
        if category_id:
            queryset = queryset.filter(**{f"{relation}__category_id": category_id})
        if search:
            queryset = queryset.filter(
                Q(**{f"{relation}__name__icontains": search})
                | Q(**{f"{relation}__name_dari__icontains": search})
                | Q(**{f"{relation}__name_pashto__icontains": search})
            )

        gross, discount = MenuItemSalesReportService._money_expressions(product_type)
        return list(
            queryset.values(
                product_id=F(f"{relation}_id"),
                name=F(f"{relation}__name"),
                name_dari=F(f"{relation}__name_dari"),
                name_pashto=F(f"{relation}__name_pashto"),
                category_id=F(f"{relation}__category_id"),
                category_name=F(f"{relation}__category__name"),
                category_name_dari=F(f"{relation}__category__name_dari"),
                category_name_pashto=F(f"{relation}__category__name_pashto"),
            )
            .annotate(
                units_sold=Sum("quantity"),
                order_count=Count("order_id", distinct=True),
                gross_sales=Sum(gross),
                discount=Sum(discount),
            )
            .order_by()
        )

    @staticmethod
    def _aggregate_cancelled_quantities(
        base_queryset,
        *,
        product_type,
        category_id=None,
        search="",
    ):
        relation = "menu_item" if product_type == "menu_item" else "platter"
        queryset = base_queryset.filter(
            status="cancelled",
            **{f"{relation}__isnull": False},
        )
        if category_id:
            queryset = queryset.filter(**{f"{relation}__category_id": category_id})
        if search:
            queryset = queryset.filter(
                Q(**{f"{relation}__name__icontains": search})
                | Q(**{f"{relation}__name_dari__icontains": search})
                | Q(**{f"{relation}__name_pashto__icontains": search})
            )
        return {
            row[f"{relation}_id"]: int(row["cancelled_quantity"] or 0)
            for row in queryset.values(f"{relation}_id")
            .annotate(cancelled_quantity=Sum("quantity"))
            .order_by()
        }

    @staticmethod
    def _empty_products(model, product_type, restaurant, branch, category_id, search):
        rows = MenuItemSalesReportService._product_scope(
            model,
            restaurant,
            branch,
            category_id=category_id,
            search=search,
        ).values(
            "id",
            "name",
            "name_dari",
            "name_pashto",
            "category_id",
            "category__name",
            "category__name_dari",
            "category__name_pashto",
        )
        return [
            {
                "product_type": product_type,
                "product_id": row["id"],
                "name": row["name"],
                "name_dari": row["name_dari"],
                "name_pashto": row["name_pashto"],
                "category_id": row["category_id"],
                "category_name": row["category__name"] or "Uncategorized",
                "category_name_dari": row["category__name_dari"],
                "category_name_pashto": row["category__name_pashto"],
                "units_sold": 0,
                "order_count": 0,
                "cancelled_quantity": 0,
                "gross_sales": Decimal("0.00"),
                "discount": Decimal("0.00"),
                "net_sales": Decimal("0.00"),
                "average_price": Decimal("0.00"),
                "sales_percentage": Decimal("0.00"),
            }
            for row in rows
        ]

    @staticmethod
    def _normalize_sales_rows(rows, product_type, cancelled_quantities):
        normalized = []
        for row in rows:
            gross = _money(row["gross_sales"])
            discount = min(_money(row["discount"]), gross)
            net = _money(gross - discount)
            units = int(row["units_sold"] or 0)
            normalized.append(
                {
                    "product_type": product_type,
                    "product_id": row["product_id"],
                    "name": row["name"],
                    "name_dari": row["name_dari"],
                    "name_pashto": row["name_pashto"],
                    "category_id": row["category_id"],
                    "category_name": row["category_name"] or "Uncategorized",
                    "category_name_dari": row["category_name_dari"],
                    "category_name_pashto": row["category_name_pashto"],
                    "units_sold": units,
                    "order_count": int(row["order_count"] or 0),
                    "cancelled_quantity": cancelled_quantities.get(
                        row["product_id"], 0
                    ),
                    "gross_sales": gross,
                    "discount": discount,
                    "net_sales": net,
                    "average_price": _money(net / units) if units else Decimal("0.00"),
                    "sales_percentage": Decimal("0.00"),
                }
            )
        return normalized

    @staticmethod
    def _merge_zero_products(sales_rows, zero_rows):
        indexed = {
            (row["product_type"], row["product_id"]): row for row in sales_rows
        }
        for row in zero_rows:
            indexed.setdefault((row["product_type"], row["product_id"]), row)
        return list(indexed.values())

    @staticmethod
    def _sort_rows(rows, sort_by, direction):
        field = ALLOWED_SORT_FIELDS.get(sort_by, "units_sold")
        reverse = direction == "desc"

        def key(row):
            value = row.get(field)
            if field in {"name", "category_name"}:
                return (str(value or "").casefold(), str(row.get("name") or "").casefold())
            return (Decimal(str(value or 0)), str(row.get("name") or "").casefold())

        return sorted(rows, key=key, reverse=reverse)

    @staticmethod
    def _summary(rows):
        selling = [row for row in rows if row["units_sold"] > 0]
        total_units = sum(row["units_sold"] for row in selling)
        gross = sum((row["gross_sales"] for row in selling), Decimal("0.00"))
        discount = sum((row["discount"] for row in selling), Decimal("0.00"))
        net = sum((row["net_sales"] for row in selling), Decimal("0.00"))
        distinct = len(selling)

        top = max(
            selling,
            key=lambda row: (row["units_sold"], row["net_sales"], row["name"]),
            default=None,
        )
        lowest = min(
            selling,
            key=lambda row: (row["units_sold"], row["net_sales"], row["name"]),
            default=None,
        )

        def compact(row):
            if not row:
                return None
            return {
                "product_type": row["product_type"],
                "product_id": row["product_id"],
                "name": row["name"],
                "name_dari": row["name_dari"],
                "name_pashto": row["name_pashto"],
                "units_sold": row["units_sold"],
                "revenue": _float(row["net_sales"]),
            }

        return {
            "distinct_items_sold": distinct,
            "total_units_sold": total_units,
            "gross_sales": _float(gross),
            "total_discount": _float(discount),
            "total_revenue": _float(net),
            "average_revenue_per_item": _float(net / distinct) if distinct else 0.0,
            "average_selling_price": _float(net / total_units) if total_units else 0.0,
            "top_selling_item": compact(top),
            "lowest_selling_item": compact(lowest),
        }

    @staticmethod
    def _category_summary(rows):
        grouped = {}
        for row in rows:
            key = row["category_id"]
            category = grouped.setdefault(
                key,
                {
                    "category_id": key,
                    "category_name": row["category_name"],
                    "category_name_dari": row["category_name_dari"],
                    "category_name_pashto": row["category_name_pashto"],
                    "items_sold": 0,
                    "units_sold": 0,
                    "gross_sales": Decimal("0.00"),
                    "discount": Decimal("0.00"),
                    "net_sales": Decimal("0.00"),
                },
            )
            if row["units_sold"] > 0:
                category["items_sold"] += 1
            category["units_sold"] += row["units_sold"]
            category["gross_sales"] += row["gross_sales"]
            category["discount"] += row["discount"]
            category["net_sales"] += row["net_sales"]

        total = sum((row["net_sales"] for row in grouped.values()), Decimal("0.00"))
        result = []
        for row in grouped.values():
            item_count = row["items_sold"]
            result.append(
                {
                    "category_id": row["category_id"],
                    "category_name": row["category_name"],
                    "category_name_dari": row["category_name_dari"],
                    "category_name_pashto": row["category_name_pashto"],
                    "items_sold": item_count,
                    "units_sold": row["units_sold"],
                    "gross_sales": _float(row["gross_sales"]),
                    "discount": _float(row["discount"]),
                    "net_sales": _float(row["net_sales"]),
                    "sales_percentage": float(
                        (row["net_sales"] / total * 100).quantize(MONEY)
                    )
                    if total
                    else 0.0,
                    "average_item_revenue": _float(row["net_sales"] / item_count)
                    if item_count
                    else 0.0,
                }
            )
        return sorted(result, key=lambda row: (-row["net_sales"], row["category_name"]))

    @staticmethod
    def _trend(base_queryset, rows, start_dt, end_dt):
        selected_menu_ids = [
            row["product_id"] for row in rows if row["product_type"] == "menu_item"
        ]
        selected_platter_ids = [
            row["product_id"] for row in rows if row["product_type"] == "platter"
        ]
        if not selected_menu_ids and not selected_platter_ids:
            return {"granularity": "daily", "points": []}

        day_count = (end_dt.date() - start_dt.date()).days + 1
        if day_count <= 45:
            truncator = TruncDate("order__created_at")
            granularity = "daily"
        elif day_count <= 240:
            truncator = TruncWeek("order__created_at")
            granularity = "weekly"
        else:
            truncator = TruncMonth("order__created_at")
            granularity = "monthly"

        combined = defaultdict(
            lambda: {
                "units_sold": 0,
                "gross_sales": Decimal("0.00"),
                "discount": Decimal("0.00"),
            }
        )

        for product_type, ids, id_field in (
            ("menu_item", selected_menu_ids, "menu_item_id"),
            ("platter", selected_platter_ids, "platter_id"),
        ):
            if not ids:
                continue
            gross, discount = MenuItemSalesReportService._money_expressions(product_type)
            trend_rows = (
                base_queryset.exclude(status="cancelled")
                .filter(**{f"{id_field}__in": ids})
                .annotate(period=truncator)
                .values("period")
                .annotate(
                    units_sold=Sum("quantity"),
                    gross_sales=Sum(gross),
                    discount=Sum(discount),
                )
                .order_by("period")
            )
            for row in trend_rows:
                period = row["period"]
                period_date = period.date() if hasattr(period, "date") else period
                if granularity == "monthly":
                    label = period_date.strftime("%Y-%m")
                else:
                    label = period_date.strftime("%Y-%m-%d")
                combined[label]["units_sold"] += int(row["units_sold"] or 0)
                combined[label]["gross_sales"] += _money(row["gross_sales"])
                combined[label]["discount"] += _money(row["discount"])

        points = []
        for period, row in sorted(combined.items()):
            net = row["gross_sales"] - row["discount"]
            points.append(
                {
                    "period": period,
                    "units_sold": row["units_sold"],
                    "revenue": _float(net),
                }
            )
        return {"granularity": granularity, "points": points}

    @staticmethod
    def _insights(rows, categories):
        selling = [row for row in rows if row["units_sold"] > 0]
        if not selling:
            return []
        highest_revenue = max(
            selling, key=lambda row: (row["net_sales"], row["units_sold"])
        )
        most_sold = max(
            selling, key=lambda row: (row["units_sold"], row["net_sales"])
        )
        lowest = min(
            selling, key=lambda row: (row["units_sold"], row["net_sales"])
        )
        insights = [
            {
                "type": "top_performer",
                "item": highest_revenue["name"],
                "item_dari": highest_revenue["name_dari"],
                "item_pashto": highest_revenue["name_pashto"],
                "value": _float(highest_revenue["net_sales"]),
            },
            {
                "type": "most_sold",
                "item": most_sold["name"],
                "item_dari": most_sold["name_dari"],
                "item_pashto": most_sold["name_pashto"],
                "value": most_sold["units_sold"],
            },
        ]
        if categories:
            insights.append(
                {
                    "type": "category_leader",
                    "category": categories[0]["category_name"],
                    "category_dari": categories[0]["category_name_dari"],
                    "category_pashto": categories[0]["category_name_pashto"],
                    "value": categories[0]["net_sales"],
                }
            )
        insights.append(
            {
                "type": "low_performer",
                "item": lowest["name"],
                "item_dari": lowest["name_dari"],
                "item_pashto": lowest["name_pashto"],
                "value": lowest["units_sold"],
            }
        )
        return insights

    @staticmethod
    def _categories(restaurant, branch):
        queryset = Category.objects.filter(restaurant=restaurant)
        if branch:
            queryset = queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
        return list(
            queryset.values("id", "name", "name_dari", "name_pashto").order_by(
                "rank", "name"
            )
        )

    @staticmethod
    def generate(start, end, restaurant, branch=None, params=None, paginate=True):
        params = params or {}
        start_dt, end_dt = OrderReportService._parse_range(start, end)
        if start_dt > end_dt:
            raise ValueError("Start date must be on or before end date.")

        search = str(params.get("search") or params.get("name") or "").strip()[:150]
        category_value = params.get("category")
        category_id = None
        if category_value not in (None, "", "all"):
            try:
                category_id = int(category_value)
            except (TypeError, ValueError):
                raise ValueError("Category must be a numeric identifier.")

        ranking_value = str(params.get("ranking") or "all").lower()
        limit = _positive_int(params.get("limit"), 10, 200)
        if ranking_value.startswith("top_") or ranking_value.startswith("bottom_"):
            direction, _, raw_limit = ranking_value.partition("_")
            ranking_value = direction
            limit = _positive_int(raw_limit, limit, 200)
        if ranking_value not in {"all", "top", "bottom"}:
            ranking_value = "all"

        rank_by = str(params.get("rank_by") or "quantity").lower()
        if rank_by not in ALLOWED_RANK_FIELDS:
            rank_by = "quantity"
        sort_by = str(params.get("sort_by") or rank_by).lower()
        if sort_by not in ALLOWED_SORT_FIELDS:
            sort_by = rank_by
        requested_direction = str(params.get("sort_order") or "").lower()
        default_direction = "asc" if ranking_value == "bottom" else "desc"
        sort_order = requested_direction if requested_direction in {"asc", "desc"} else default_direction

        include_zero = _bool(params.get("include_zero_sales"), False)
        sales_status = str(params.get("sales_status") or "all").lower()
        if sales_status not in {"all", "selling", "zero"}:
            sales_status = "all"
        if sales_status == "zero":
            include_zero = True

        base_sales = MenuItemSalesReportService._sales_scope(
            restaurant, branch, start_dt, end_dt
        )
        menu_sales = MenuItemSalesReportService._aggregate_product_sales(
            base_sales,
            product_type="menu_item",
            category_id=category_id,
            search=search,
        )
        platter_sales = MenuItemSalesReportService._aggregate_product_sales(
            base_sales,
            product_type="platter",
            category_id=category_id,
            search=search,
        )
        menu_cancelled = MenuItemSalesReportService._aggregate_cancelled_quantities(
            base_sales,
            product_type="menu_item",
            category_id=category_id,
            search=search,
        )
        platter_cancelled = MenuItemSalesReportService._aggregate_cancelled_quantities(
            base_sales,
            product_type="platter",
            category_id=category_id,
            search=search,
        )

        rows = MenuItemSalesReportService._normalize_sales_rows(
            menu_sales, "menu_item", menu_cancelled
        ) + MenuItemSalesReportService._normalize_sales_rows(
            platter_sales, "platter", platter_cancelled
        )

        all_scope_sales_count = len([row for row in rows if row["units_sold"] > 0])
        if include_zero:
            zero_rows = MenuItemSalesReportService._empty_products(
                MenuItem,
                "menu_item",
                restaurant,
                branch,
                category_id,
                search,
            ) + MenuItemSalesReportService._empty_products(
                Platter,
                "platter",
                restaurant,
                branch,
                category_id,
                search,
            )
            rows = MenuItemSalesReportService._merge_zero_products(rows, zero_rows)

        if sales_status == "selling" or not include_zero:
            rows = [row for row in rows if row["units_sold"] > 0]
        elif sales_status == "zero":
            rows = [row for row in rows if row["units_sold"] == 0]

        scope_total_revenue = sum(
            (row["net_sales"] for row in rows), Decimal("0.00")
        )

        metric_field = ALLOWED_RANK_FIELDS[rank_by]
        ranking_direction = "asc" if ranking_value == "bottom" else "desc"
        rows = MenuItemSalesReportService._sort_rows(rows, rank_by, ranking_direction)
        if ranking_value in {"top", "bottom"}:
            if ranking_value == "bottom" and not include_zero:
                rows = [row for row in rows if row["units_sold"] > 0]
            rows = rows[:limit]

        for row in rows:
            row["sales_percentage"] = (
                (row["net_sales"] / scope_total_revenue * 100).quantize(MONEY)
                if scope_total_revenue
                else Decimal("0.00")
            )

        rows = MenuItemSalesReportService._sort_rows(rows, sort_by, sort_order)
        for index, row in enumerate(rows, 1):
            row["rank"] = index

        summary = MenuItemSalesReportService._summary(rows)
        category_summary = MenuItemSalesReportService._category_summary(rows)
        trend = MenuItemSalesReportService._trend(
            base_sales, rows, start_dt, end_dt
        )
        insights = MenuItemSalesReportService._insights(rows, category_summary)
        chart_rows = sorted(
            [row for row in rows if row["units_sold"] > 0],
            key=lambda row: (-row["units_sold"], -row["net_sales"], row["name"]),
        )[:10]

        total_count = len(rows)
        page = _positive_int(params.get("page"), 1, 100000)
        page_size = _positive_int(params.get("page_size"), 25, 200)
        if paginate:
            start_index = (page - 1) * page_size
            display_rows = rows[start_index : start_index + page_size]
        else:
            display_rows = rows
            page = 1
            page_size = total_count or 1

        serialized_rows = []
        for row in display_rows:
            serialized = dict(row)
            for field in (
                "gross_sales",
                "discount",
                "net_sales",
                "average_price",
                "sales_percentage",
            ):
                serialized[field] = _float(serialized[field])
            serialized_rows.append(serialized)

        serialized_chart_rows = []
        for row in chart_rows:
            serialized = dict(row)
            for field in (
                "gross_sales",
                "discount",
                "net_sales",
                "average_price",
                "sales_percentage",
            ):
                serialized[field] = _float(serialized[field])
            serialized_chart_rows.append(serialized)

        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "currency": "AFN",
            "summary": summary,
            "items": serialized_rows,
            "category_summary": category_summary,
            "top_items": serialized_chart_rows,
            "trend": trend,
            "insights": insights,
            "categories": MenuItemSalesReportService._categories(restaurant, branch),
            "pagination": {
                "page": page,
                "page_size": page_size,
                "count": total_count,
                "total_pages": max(1, (total_count + page_size - 1) // page_size),
                "has_next": page * page_size < total_count,
                "has_previous": page > 1,
            },
            "filters": {
                "search": search,
                "category": category_id,
                "ranking": ranking_value,
                "rank_by": rank_by,
                "limit": limit,
                "include_zero_sales": include_zero,
                "sales_status": sales_status,
                "sort_by": sort_by,
                "sort_order": sort_order,
            },
            "scope": {
                "qualifying_sales_items_before_status_filter": all_scope_sales_count,
                "selected_items": total_count,
                "total_menu_revenue_before_ranking": _float(scope_total_revenue),
                "ranking_metric": metric_field,
                "successful_order_statuses": list(SUCCESSFUL_ORDER_STATUSES),
                "cancelled_items_excluded": True,
            },
        }
