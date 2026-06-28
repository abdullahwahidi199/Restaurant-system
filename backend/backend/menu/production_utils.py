# menu/production_utils.py
from decimal import Decimal
from django.db import transaction
from django.db.models import F

from inventory.models import MenuItemIngredient, Ingredient, StockMovement
from .models import Production


@transaction.atomic
def create_or_replace_production(menu_item, quantity, created_by=None, notes=""):
    """
    Create a new production batch for a menu item.
    If one already exists, it is REPLACED (old remaining is discarded — manager
    should clear it intentionally before cooking a new batch).

    Ingredients are deducted for the WHOLE new batch.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    # Remove any existing production for this item
    Production.objects.filter(menu_item=menu_item).delete()

    # Deduct ingredients for the WHOLE batch (once, not per order)
    recipe_items = MenuItemIngredient.objects.select_related(
        "ingredient"
    ).filter(menu_item=menu_item)

    qty_decimal = Decimal(str(quantity))
    insufficient = []
    requirements = []

    for recipe in recipe_items:
        required = recipe.quantity_required * qty_decimal
        ingredient = Ingredient.objects.select_for_update().get(
            id=recipe.ingredient_id
        )
        if ingredient.quantity_available < required:
            insufficient.append(
                f"{ingredient.name} (need {required}, have {ingredient.quantity_available})"
            )
        requirements.append((ingredient, required))

    if insufficient:
        raise ValueError(f"Insufficient stock: {', '.join(insufficient)}")

    # Apply deductions
    movements = []
    for ingredient, required in requirements:
        Ingredient.objects.filter(id=ingredient.id).update(
            quantity_available=F("quantity_available") - required
        )
        movements.append(StockMovement(
            restaurant=ingredient.restaurant,
            ingredient=ingredient,
            change_quantity=-required,
            movement_type="production",
        ))
    StockMovement.objects.bulk_create(movements)

    # Create the production record
    production = Production.objects.create(
        menu_item=menu_item,
        restaurant=menu_item.restaurant,
        quantity_produced=quantity,
        quantity_remaining=quantity,
        notes=notes,
        created_by=created_by,
    )

    # Refresh menu_item availability flag
    menu_item.is_available = True
    menu_item.save(update_fields=["is_available"])

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item)

    return production


@transaction.atomic
def adjust_production(production, new_quantity, notes=None):
    """
    Adjust the produced quantity of an existing production.
    Deducts/refunds ingredients for the DIFFERENCE only.
    `quantity_remaining` shifts by the same diff so already-sold count is preserved.
    """
    new_quantity = int(new_quantity)
    if new_quantity < 0:
        raise ValueError("Quantity cannot be negative.")

    diff = new_quantity - production.quantity_produced
    if diff == 0:
        if notes is not None:
            production.notes = notes
            production.save(update_fields=["notes"])
        return production

    menu_item = production.menu_item
    recipe_items = MenuItemIngredient.objects.select_related(
        "ingredient"
    ).filter(menu_item=menu_item)

    diff_decimal = Decimal(str(abs(diff)))

    if diff > 0:
        # Need MORE ingredients
        insufficient = []
        for recipe in recipe_items:
            required = recipe.quantity_required * diff_decimal
            ing = Ingredient.objects.select_for_update().get(id=recipe.ingredient_id)
            if ing.quantity_available < required:
                insufficient.append(ing.name)
        if insufficient:
            raise ValueError(f"Insufficient stock for: {', '.join(insufficient)}")

        movements = []
        for recipe in recipe_items:
            required = recipe.quantity_required * diff_decimal
            Ingredient.objects.filter(id=recipe.ingredient_id).update(
                quantity_available=F("quantity_available") - required
            )
            movements.append(StockMovement(
                restaurant=recipe.ingredient.restaurant,
                ingredient=recipe.ingredient,
                change_quantity=-required,
                movement_type="production",
            ))
        StockMovement.objects.bulk_create(movements)
    else:
        # REFUND ingredients
        movements = []
        for recipe in recipe_items:
            refund = recipe.quantity_required * diff_decimal
            Ingredient.objects.filter(id=recipe.ingredient_id).update(
                quantity_available=F("quantity_available") + refund
            )
            movements.append(StockMovement(
                restaurant=recipe.ingredient.restaurant,
                ingredient=recipe.ingredient,
                change_quantity=refund,
                movement_type="production_adjustment",
            ))
        StockMovement.objects.bulk_create(movements)

    production.quantity_produced = new_quantity
    production.quantity_remaining = max(0, production.quantity_remaining + diff)
    if notes is not None:
        production.notes = notes
    production.save()

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item)

    return production


@transaction.atomic
def consume_production(menu_item, quantity):
    """
    Decrement remaining count when an order is placed.
    Raises ValueError if not enough remaining.
    """
    production = Production.objects.select_for_update().filter(
        menu_item=menu_item
    ).first()

    if not production:
        raise ValueError(
            f"{menu_item.name} is not available — no active production."
        )

    quantity = int(quantity)

    if production.quantity_remaining < quantity:
        raise ValueError(
            f"Only {production.quantity_remaining} portion(s) of "
            f"{menu_item.name} remaining."
        )

    production.quantity_remaining -= quantity
    production.save(update_fields=["quantity_remaining"])

    # If sold out, mark menu item unavailable
    if production.quantity_remaining == 0:
        menu_item.is_available = False
        menu_item.save(update_fields=["is_available"])
        from inventory.utils import update_platter_availability_from_menu_item
        update_platter_availability_from_menu_item(menu_item)

    return production


@transaction.atomic
def restore_production(menu_item, quantity):
    """
    Increment remaining count (e.g., when an order is cancelled).
    Capped at quantity_produced.
    """
    production = Production.objects.select_for_update().filter(
        menu_item=menu_item
    ).first()

    if not production:
        return None

    quantity = int(quantity)
    was_zero = production.quantity_remaining == 0
    production.quantity_remaining = min(
        production.quantity_produced,
        production.quantity_remaining + quantity
    )
    production.save(update_fields=["quantity_remaining"])

    if was_zero and production.quantity_remaining > 0:
        menu_item.is_available = True
        menu_item.save(update_fields=["is_available"])
        from inventory.utils import update_platter_availability_from_menu_item
        update_platter_availability_from_menu_item(menu_item)

    return production


@transaction.atomic
def clear_production(menu_item, refund_remaining=False):
    """
    Clear current production (e.g., end of service).
    Optionally refund ingredients for the unsold remaining portion.
    """
    production = Production.objects.select_for_update().filter(
        menu_item=menu_item
    ).first()

    if not production:
        return None

    if refund_remaining and production.quantity_remaining > 0:
        recipe_items = MenuItemIngredient.objects.select_related(
            "ingredient"
        ).filter(menu_item=menu_item)

        remaining_decimal = Decimal(str(production.quantity_remaining))
        movements = []
        for recipe in recipe_items:
            refund = recipe.quantity_required * remaining_decimal
            Ingredient.objects.filter(id=recipe.ingredient_id).update(
                quantity_available=F("quantity_available") + refund
            )
            movements.append(StockMovement(
                restaurant=recipe.ingredient.restaurant,
                ingredient=recipe.ingredient,
                change_quantity=refund,
                movement_type="production_adjustment",
            ))
        StockMovement.objects.bulk_create(movements)

    production.delete()

    menu_item.is_available = False
    menu_item.save(update_fields=["is_available"])

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item)

    return True

@transaction.atomic
def increment_production(menu_item, quantity, created_by=None, notes=""):
    """
    Add `quantity` to existing production, or create a new batch if none exists.
    Deducts ingredients for the added amount only.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    existing = Production.objects.filter(menu_item=menu_item).first()
    if not existing:
        return create_or_replace_production(
            menu_item=menu_item,
            quantity=quantity,
            created_by=created_by,
            notes=notes,
        )

    new_qty = existing.quantity_produced + quantity
    return adjust_production(existing, new_quantity=new_qty, notes=notes)


@transaction.atomic
def decrement_production(menu_item, quantity, notes=""):
    """
    Reduce produced quantity by `quantity`.
    Cannot go below the number already sold.
    Refunds ingredients for the removed amount.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    existing = Production.objects.filter(menu_item=menu_item).first()
    if not existing:
        raise ValueError(f"No active production for {menu_item.name}")

    sold = existing.quantity_produced - existing.quantity_remaining
    new_qty = existing.quantity_produced - quantity
    if new_qty < sold:
        raise ValueError(
            f"Cannot reduce below {sold} — that many have already been sold."
        )
    if new_qty == 0:
        # Nothing left to sell; clear it
        clear_production(menu_item, refund_remaining=False)
        return None

    return adjust_production(existing, new_quantity=new_qty, notes=notes)