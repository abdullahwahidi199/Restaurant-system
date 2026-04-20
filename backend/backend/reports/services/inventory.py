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

    # -------------------------
    # Stock Status (Enhanced)
    # -------------------------
    @staticmethod
    def stock_status():
        ingredients = Ingredient.objects.all()
        active_ingredients = ingredients.filter(is_active=True)
        inactive_count = ingredients.filter(is_active=False).count()

        low_stock = []
        critical_stock = []
        out_of_stock = []
        healthy_stock = []
        total_inventory_value = Decimal("0.00")

        for i in active_ingredients:
            stock_value = (i.quantity_available or 0) * (i.cost_per_unit or 0)
            total_inventory_value += stock_value

            entry = {
                "id": i.id,
                "name": i.name,
                "unit": i.get_unit_display(),
                "available": float(i.quantity_available or 0),
                "threshold": float(i.minimum_threshold or 0),
                "cost_per_unit": float(i.cost_per_unit or 0),
                "stock_value": float(stock_value),
            }

            if i.quantity_available <= 0:
                out_of_stock.append(entry)
            elif i.quantity_available <= i.minimum_threshold:
                # Critical = below half of threshold
                if i.quantity_available <= (i.minimum_threshold / 2):
                    critical_stock.append(entry)
                else:
                    low_stock.append(entry)
            else:
                healthy_stock.append(entry)

        return {
            "total_items": ingredients.count(),
            "active_items": active_ingredients.count(),
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
    def full_inventory():
        ingredients = Ingredient.objects.all().order_by("name")
        result = []
        for i in ingredients:
            available = float(i.quantity_available or 0)
            threshold = float(i.minimum_threshold or 0)
            cost = float(i.cost_per_unit or 0)
            stock_value = available * cost

            if not i.is_active:
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
                "name": i.name,
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
    def movement_report(start, end):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        movements = StockMovement.objects.filter(
    created_at__range=[start_dt, end_dt]
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
        for m in movements.filter(movement_type="purchase").select_related("ingredient"):
            purchases_cost += (m.change_quantity or 0) * (m.ingredient.cost_per_unit or 0)

        # Total waste cost
        waste_cost = Decimal("0.00")
        waste_qty = Decimal("0.00")
        for m in movements.filter(movement_type="waste").select_related("ingredient"):
            qty = abs(m.change_quantity or 0)
            waste_qty += qty
            waste_cost += qty * (m.ingredient.cost_per_unit or 0)

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
    def recent_movements(start, end, limit=25):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        movements = (
            StockMovement.objects.filter(created_at__range=[start_dt, end_dt])
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
    def top_moving_ingredients(start, end, limit=10):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            StockMovement.objects.filter(
    created_at__range=[start_dt, end_dt]
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
    def top_wasted_ingredients(start, end, limit=10):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        wastes = (
            StockMovement.objects.filter(
                created_at__range=[start_dt, end_dt],
                movement_type="waste",
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
    def daily_movements(start, end):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            StockMovement.objects.filter(
    created_at__range=[start_dt, end_dt]
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
    def top_staff_movements(start, end, limit=10):
        start_dt, end_dt = InventoryReportService._parse_range(start, end)
        return list(
            StockMovement.objects.filter(
                created_at__range=[start_dt, end_dt],
                created_by__isnull=False,
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
    def menu_item_ingredient_usage(limit=15):
        """Which menu items use the most ingredients (recipe complexity)."""
        return list(
            MenuItemIngredient.objects.values(
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
    def most_used_in_recipes(limit=10):
        return list(
            MenuItemIngredient.objects.values(
                ingredient_name=F("ingredient__name"),
                unit=F("ingredient__unit"),
            )
            .annotate(
                used_in_items=Count("menu_item", distinct=True),
                total_required=Sum("quantity_required"),
            )
            .order_by("-used_in_items")[:limit]
        )