from django.db.models import (
    Count, Sum, F, FloatField, ExpressionWrapper,
    DecimalField, Q, Avg
)
from django.db.models.functions import TruncDate
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, timedelta, time
from decimal import Decimal

from inventory.models import Ingredient, StockMovement, MenuItemIngredient
from inventory.services import (
    get_effective_cost_per_unit,
)


class InventoryReportService:

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
    def _scope(queryset, branch):
        return queryset.filter(branch=branch) if branch else queryset

    @staticmethod
    def _ingredient_rows(restaurant, branch=None):
        ingredients = InventoryReportService._scope(
            Ingredient.objects.filter(restaurant=restaurant),
            branch,
        ).order_by("name")
        for ingredient in ingredients:
            yield {
                "ingredient": ingredient,
                "quantity": ingredient.quantity_available,
                "threshold": ingredient.minimum_threshold,
                "cost": ingredient.cost_per_unit,
                "is_active": ingredient.is_active,
            }

    # -------------------------
    # Stock Status (Enhanced)
    # -------------------------
    @staticmethod
    def stock_status(restaurant, branch=None):
        rows = list(InventoryReportService._ingredient_rows(restaurant, branch))
        active_rows = [row for row in rows if row["is_active"]]
        inactive_count = len(rows) - len(active_rows)

        low_stock = []
        critical_stock = []
        out_of_stock = []
        healthy_stock = []
        total_inventory_value = Decimal("0.00")

        for row in active_rows:
            i = row["ingredient"]
            quantity = row["quantity"] or 0
            threshold = row["threshold"] or 0
            cost = row["cost"] or 0
            stock_value = quantity * cost
            total_inventory_value += stock_value

            entry = {
                "id": i.id,
                "name": row.get("name", i.name),
                "unit": i.get_unit_display(),
                "available": float(quantity),
                "threshold": float(threshold),
                "cost_per_unit": float(cost),
                "stock_value": float(stock_value),
            }

            if quantity <= 0:
                out_of_stock.append(entry)
            elif quantity <= threshold:
                # Critical = below half of threshold
                if quantity <= (threshold / 2):
                    critical_stock.append(entry)
                else:
                    low_stock.append(entry)
            else:
                healthy_stock.append(entry)

        return {
            "total_items": len(rows),
            "active_items": len(active_rows),
            "inactive_items": inactive_count,
            "out_of_stock_count": len(out_of_stock),
            "critical_stock_count": len(critical_stock),
            "low_stock_count": len(low_stock),
            "healthy_stock_count": len(healthy_stock),
            "total_inventory_value": round(float(total_inventory_value), 2),
            "out_of_stock_list": out_of_stock,
            "critical_stock_list": critical_stock,
            "low_stock_list": low_stock,
        }

    # -------------------------
    # Full Inventory
    # -------------------------
    @staticmethod
    def full_inventory(restaurant, branch=None):
        result = []
        for row in InventoryReportService._ingredient_rows(restaurant, branch):
            i = row["ingredient"]
            available = float(row["quantity"] or 0)
            threshold = float(row["threshold"] or 0)
            cost = float(row["cost"] or 0)
            stock_value = available * cost

            if not row["is_active"]:
                status = "INACTIVE"
            elif available <= 0:
                status = "OUT OF STOCK"
            elif available <= threshold / 2:
                status = "CRITICAL"
            elif available <= threshold:
                status = "LOW"
            else:
                status = "OK"

            result.append({
                "id": i.id,
                "name": row.get("name", i.name),
                "unit": i.get_unit_display(),
                "available": available,
                "threshold": threshold,
                "cost_per_unit": cost,
                "stock_value": round(stock_value, 2),
                "is_active": i.is_active,
                "status": status,
            })
        return result

    # -------------------------
    # Movement Report (Enhanced)
    # -------------------------
    @staticmethod
    def movement_report(start, end, restaurant, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        movements = InventoryReportService._scope(
            StockMovement.objects.filter(
                created_at__range=[start_dt, end_dt],
                restaurant=restaurant,
            ),
            branch,
        ).exclude(movement_type="order")
        # By Type with quantity totals
        by_type = list(
            movements.values("movement_type")
            .annotate(
                count=Count("id"),
                total_quantity=Sum("change_quantity"),
            )
            .order_by("-count")
        )

        # Total purchase cost (purchases only)
        purchases_cost = Decimal("0.00")
        for m in movements.filter(restaurant=restaurant,movement_type="purchase").select_related("ingredient"):
            unit_cost = (
                m.unit_cost
                if m.unit_cost is not None
                else get_effective_cost_per_unit(m.ingredient, m.branch)
            )
            purchases_cost += (m.change_quantity or 0) * (unit_cost or 0)

        # Total waste cost
        waste_cost = Decimal("0.00")
        waste_qty = Decimal("0.00")
        for m in movements.filter(restaurant=restaurant,movement_type="waste").select_related("ingredient"):
            qty = abs(m.change_quantity or 0)
            waste_qty += qty
            unit_cost = (
                m.unit_cost
                if m.unit_cost is not None
                else get_effective_cost_per_unit(m.ingredient, m.branch)
            )
            waste_cost += qty * (unit_cost or 0)

        # Order consumption
        consumption_qty = Decimal("0.00")
        consumption_cost = Decimal("0.00")
        

        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "total_movements": movements.count(),
            "total_purchase_cost": round(float(purchases_cost), 2),
            "total_waste_quantity": round(float(waste_qty), 2),
            "total_waste_cost": round(float(waste_cost), 2),
            "total_consumption_quantity": round(float(consumption_qty), 2),
            "total_consumption_cost": round(float(consumption_cost), 2),
            "by_type": by_type,
        }

    # -------------------------
    # Recent Movements
    # -------------------------
    @staticmethod
    def recent_movements(start, end, limit=25, restaurant=None, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        movements = (
            InventoryReportService._scope(
                StockMovement.objects.filter(
                    restaurant=restaurant,
                    created_at__range=[start_dt, end_dt],
                ),
                branch,
            )
            .select_related("ingredient", "created_by", "related_order")
            .order_by("-created_at")[:limit]
        )
        return [
            {
                "ingredient": getattr(m.ingredient, "name", "-"),
                "unit": m.ingredient.get_unit_display() if m.ingredient else "-",
                "type": m.get_movement_type_display(),
                "quantity": float(m.change_quantity or 0),
                "created_by": getattr(m.created_by, "name", "-") if m.created_by else "-",
                "related_order": getattr(m.related_order, "id", None),
                "date": m.created_at,
            }
            for m in movements
        ]

    # -------------------------
    # Top Moving Ingredients
    # -------------------------
    @staticmethod
    def top_moving_ingredients(start, end, limit=10,restaurant=None, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            InventoryReportService._scope(
                StockMovement.objects.filter(
                    restaurant=restaurant,
                    created_at__range=[start_dt, end_dt],
                ),
                branch,
            ).exclude(movement_type="order")
            .values(
                name=F("ingredient__name"),
                unit=F("ingredient__unit"),
            )
            .annotate(
                total_quantity=Sum("change_quantity"),
                movement_count=Count("id"),
            )
            .order_by("-movement_count")[:limit]
        )

    # -------------------------
    # Top Wasted Ingredients
    # -------------------------
    @staticmethod
    def top_wasted_ingredients(start, end, limit=10, restaurant=None, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        wastes = (
            InventoryReportService._scope(
                StockMovement.objects.filter(
                    restaurant=restaurant,
                    created_at__range=[start_dt, end_dt],
                    movement_type="waste",
                ),
                branch,
            )
            .select_related("ingredient")
            .values(
                name=F("ingredient__name"),
                unit=F("ingredient__unit"),
                cost=F("ingredient__cost_per_unit"),
            )
            .annotate(
                total_wasted=Sum("change_quantity"),
                count=Count("id"),
            )
            .order_by("-total_wasted")[:limit]
        )
        result = []
        for w in wastes:
            qty = abs(float(w["total_wasted"] or 0))
            cost = float(w["cost"] or 0)
            result.append({
                "name": w["name"],
                "unit": w["unit"],
                "total_wasted": qty,
                "waste_cost": round(qty * cost, 2),
                "count": w["count"],
            })
        return result

    # -------------------------
    # Daily Movement Trend
    # -------------------------
    @staticmethod
    def daily_movements(start, end, restaurant, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            InventoryReportService._scope(
                StockMovement.objects.filter(
                    restaurant=restaurant,
                    created_at__range=[start_dt, end_dt],
                ),
                branch,
            ).exclude(movement_type="order")
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                total_movements=Count("id"),
                total_quantity=Sum("change_quantity"),
            )
            .order_by("date")
        )

    # -------------------------
    # Top Staff by Movements
    # -------------------------
    @staticmethod
    def top_staff_movements(start, end, limit=10,restaurant=None, branch=None):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            InventoryReportService._scope(
                StockMovement.objects.filter(
                    restaurant=restaurant,
                    created_at__range=[start_dt, end_dt],
                    created_by__isnull=False,
                ),
                branch,
            )
            .values(staff_name=F("created_by__name"))
            .annotate(
                movement_count=Count("id"),
                total_quantity=Sum("change_quantity"),
            )
            .order_by("-movement_count")[:limit]
        )

    # -------------------------
    # Menu Item Ingredient Usage
    # -------------------------
    @staticmethod
    def menu_item_ingredient_usage(limit=15, restaurant=None, branch=None):
        """Which menu items use the most ingredients (recipe complexity)."""
        qs = MenuItemIngredient.objects.filter(menu_item__restaurant=restaurant)
        if branch:
            qs = qs.filter(ingredient__branch=branch)
        return list(
            qs.values(
                menu_item_name=F("menu_item__name")
            )
            .annotate(
                ingredient_count=Count("ingredient", distinct=True),
                total_required=Sum("quantity_required"),
            )
            .order_by("-ingredient_count")[:limit]
        )

    # -------------------------
    # Most Used Ingredients in Recipes
    # -------------------------
    @staticmethod
    def most_used_in_recipes(limit=10, restaurant=None, branch=None):
        qs = MenuItemIngredient.objects.filter(menu_item__restaurant=restaurant)
        if branch:
            qs = qs.filter(ingredient__branch=branch)
        return list(
            qs.values(
                ingredient_name=F("ingredient__name"),
                unit=F("ingredient__unit"),
            )
            .annotate(
                used_in_items=Count("menu_item", distinct=True),
                total_required=Sum("quantity_required"),
            )
            .order_by("-used_in_items")[:limit]
        )
