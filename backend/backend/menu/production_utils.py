# menu/production_utils.py
from decimal import Decimal
from django.db import transaction
from django.db.models import F, Q

from audit.constants import PRODUCTION_MOVEMENT_OBJECT_TYPE, AuditAction, AuditModule
from audit.services import create_audit_log
from inventory.models import MenuItemIngredient, Ingredient, StockMovement
from .models import Production


def _recipe_items_for_branch(menu_item, branch):
    recipes = MenuItemIngredient.objects.select_related("ingredient").filter(
        menu_item=menu_item,
    )
    if branch:
        recipes = recipes.filter(
            Q(ingredient__branch=branch) | Q(ingredient__branch__isnull=True)
        )
    return recipes


def _locked_recipe_ingredient(recipe, branch):
    ingredient = Ingredient.objects.select_for_update().get(id=recipe.ingredient_id)
    if branch and ingredient.branch_id and ingredient.branch_id != branch.id:
        raise ValueError("Ingredient stock belongs to another branch.")
    return ingredient


def _actor_user(actor):
    if actor is None:
        return None
    return getattr(actor, "user", actor)


def _record_production_movement(
    *,
    menu_item,
    branch,
    production_id,
    movement_type,
    before_produced,
    after_produced,
    before_remaining,
    after_remaining,
    actor=None,
    order=None,
    notes="",
    refunded_ingredients=False,
):
    actor_user = _actor_user(actor)
    actor_label = (
        getattr(actor, "name", None)
        or getattr(actor_user, "get_username", lambda: "System")()
        or "System"
    )
    order_label = f" for order #{order.id}" if order else ""
    descriptions = {
        "create": "created production",
        "replace": "replaced production",
        "increment": "added production",
        "decrement": "reduced production",
        "adjust": "adjusted production",
        "consume": "consumed production",
        "restore": "restored production",
        "clear": "cleared production",
    }
    action = AuditAction.UPDATE
    if movement_type == "create":
        action = AuditAction.CREATE
    elif movement_type == "clear":
        action = AuditAction.DELETE
    elif movement_type == "restore":
        action = AuditAction.RESTORE

    create_audit_log(
        user=actor_user,
        restaurant=menu_item.restaurant,
        branch=branch,
        action=action,
        module=AuditModule.MENU,
        object_type=PRODUCTION_MOVEMENT_OBJECT_TYPE,
        object_id=production_id or menu_item.id,
        object_repr=menu_item.name,
        description=(
            f"{actor_label} {descriptions.get(movement_type, 'changed production')} "
            f"for {menu_item.name}{order_label}."
        ),
        old_values={
            "quantity_produced": before_produced,
            "quantity_remaining": before_remaining,
        },
        new_values={
            "quantity_produced": after_produced,
            "quantity_remaining": after_remaining,
        },
        metadata={
            "movement_type": movement_type,
            "quantity_change": after_remaining - before_remaining,
            "actor_name": actor_label,
            "actor_role": getattr(actor, "role", "") or "",
            "menu_item_id": str(menu_item.id),
            "production_id": str(production_id) if production_id else None,
            "order_id": str(order.id) if order else None,
            "order_number": getattr(order, "order_number", None) if order else None,
            "notes": notes or "",
            "refunded_ingredients": bool(refunded_ingredients),
        },
    )


@transaction.atomic
def create_or_replace_production(menu_item, quantity, branch, created_by=None, notes=""):
    """
    Create a new production batch for a menu item.
    If one already exists, it is REPLACED (old remaining is discarded — manager
    should clear it intentionally before cooking a new batch).

    Ingredients are deducted for the WHOLE new batch.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")
    if not branch:
        raise ValueError("An active branch is required for production.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    # Preserve the previous balance for the movement ledger before replacing it.
    existing = Production.objects.select_for_update().filter(
        menu_item=menu_item,
        branch=branch,
    ).first()
    before_produced = existing.quantity_produced if existing else 0
    before_remaining = existing.quantity_remaining if existing else 0
    if existing:
        existing.delete()

    # Deduct ingredients for the WHOLE batch (once, not per order)
    recipe_items = _recipe_items_for_branch(menu_item, branch)

    qty_decimal = Decimal(str(quantity))
    insufficient = []
    requirements = []

    for recipe in recipe_items:
        required = recipe.quantity_required * qty_decimal
        ingredient = _locked_recipe_ingredient(recipe, branch)
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
            branch=branch,
            ingredient=ingredient,
            change_quantity=-required,
            movement_type="production",
            created_by=created_by,
        ))
    StockMovement.objects.bulk_create(movements)

    # Create the production record
    production = Production.objects.create(
        menu_item=menu_item,
        restaurant=menu_item.restaurant,
        branch=branch,
        quantity_produced=quantity,
        quantity_remaining=quantity,
        notes=notes,
        created_by=created_by,
    )

    # Refresh menu_item availability flag
    menu_item.is_available = True
    menu_item.save(update_fields=["is_available"])

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item, branch=branch)

    _record_production_movement(
        menu_item=menu_item,
        branch=branch,
        production_id=production.id,
        movement_type="replace" if existing else "create",
        before_produced=before_produced,
        after_produced=production.quantity_produced,
        before_remaining=before_remaining,
        after_remaining=production.quantity_remaining,
        actor=created_by,
        notes=notes,
    )

    return production


@transaction.atomic
def adjust_production(production, new_quantity, notes=None, actor=None, movement_type="adjust"):
    """
    Adjust the produced quantity of an existing production.
    Deducts/refunds ingredients for the DIFFERENCE only.
    `quantity_remaining` shifts by the same diff so already-sold count is preserved.
    """
    new_quantity = int(new_quantity)
    if new_quantity < 0:
        raise ValueError("Quantity cannot be negative.")

    before_produced = production.quantity_produced
    before_remaining = production.quantity_remaining
    diff = new_quantity - production.quantity_produced
    if diff == 0:
        if notes is not None:
            production.notes = notes
            production.save(update_fields=["notes"])
            _record_production_movement(
                menu_item=production.menu_item,
                branch=production.branch,
                production_id=production.id,
                movement_type=movement_type,
                before_produced=before_produced,
                after_produced=production.quantity_produced,
                before_remaining=before_remaining,
                after_remaining=production.quantity_remaining,
                actor=actor,
                notes=notes,
            )
        return production

    menu_item = production.menu_item
    branch = production.branch
    recipe_items = _recipe_items_for_branch(menu_item, branch)

    diff_decimal = Decimal(str(abs(diff)))

    if diff > 0:
        # Need MORE ingredients
        insufficient = []
        for recipe in recipe_items:
            required = recipe.quantity_required * diff_decimal
            ing = _locked_recipe_ingredient(recipe, branch)
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
                branch=branch,
                ingredient=recipe.ingredient,
                change_quantity=-required,
                movement_type="production",
                created_by=production.created_by,
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
                branch=branch,
                ingredient=recipe.ingredient,
                change_quantity=refund,
                movement_type="production_adjustment",
                created_by=production.created_by,
            ))
        StockMovement.objects.bulk_create(movements)

    production.quantity_produced = new_quantity
    production.quantity_remaining = max(0, production.quantity_remaining + diff)
    if notes is not None:
        production.notes = notes
    production.save()

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item, branch=branch)

    _record_production_movement(
        menu_item=menu_item,
        branch=branch,
        production_id=production.id,
        movement_type=movement_type,
        before_produced=before_produced,
        after_produced=production.quantity_produced,
        before_remaining=before_remaining,
        after_remaining=production.quantity_remaining,
        actor=actor,
        notes=notes or "",
    )

    return production


@transaction.atomic
def consume_production(menu_item, quantity, branch, actor=None, order=None):
    """
    Decrement remaining count when an order is placed.
    Raises ValueError if not enough remaining.
    """
    if not branch:
        raise ValueError("An active branch is required for production.")

    production = Production.objects.select_for_update().filter(
        menu_item=menu_item,
        branch=branch,
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

    before_remaining = production.quantity_remaining
    production.quantity_remaining -= quantity
    production.save(update_fields=["quantity_remaining"])

    # If sold out, mark menu item unavailable
    if production.quantity_remaining == 0:
        menu_item.is_available = False
        menu_item.save(update_fields=["is_available"])
        from inventory.utils import update_platter_availability_from_menu_item
        update_platter_availability_from_menu_item(menu_item, branch=branch)

    _record_production_movement(
        menu_item=menu_item,
        branch=branch,
        production_id=production.id,
        movement_type="consume",
        before_produced=production.quantity_produced,
        after_produced=production.quantity_produced,
        before_remaining=before_remaining,
        after_remaining=production.quantity_remaining,
        actor=actor,
        order=order,
    )

    return production


@transaction.atomic
def restore_production(menu_item, quantity, branch, actor=None, order=None):
    """
    Increment remaining count (e.g., when an order is cancelled).
    Capped at quantity_produced.
    """
    if not branch:
        return None

    production = Production.objects.select_for_update().filter(
        menu_item=menu_item,
        branch=branch,
    ).first()

    if not production:
        return None

    quantity = int(quantity)
    before_remaining = production.quantity_remaining
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
        update_platter_availability_from_menu_item(menu_item, branch=branch)

    _record_production_movement(
        menu_item=menu_item,
        branch=branch,
        production_id=production.id,
        movement_type="restore",
        before_produced=production.quantity_produced,
        after_produced=production.quantity_produced,
        before_remaining=before_remaining,
        after_remaining=production.quantity_remaining,
        actor=actor,
        order=order,
    )

    return production


@transaction.atomic
def clear_production(menu_item, branch, refund_remaining=False, actor=None, notes=""):
    """
    Clear current production (e.g., end of service).
    Optionally refund ingredients for the unsold remaining portion.
    """
    if not branch:
        return None

    production = Production.objects.select_for_update().filter(
        menu_item=menu_item,
        branch=branch,
    ).first()

    if not production:
        return None

    production_id = production.id
    before_produced = production.quantity_produced
    before_remaining = production.quantity_remaining

    if refund_remaining and production.quantity_remaining > 0:
        recipe_items = _recipe_items_for_branch(menu_item, branch)

        remaining_decimal = Decimal(str(production.quantity_remaining))
        movements = []
        for recipe in recipe_items:
            refund = recipe.quantity_required * remaining_decimal
            Ingredient.objects.filter(id=recipe.ingredient_id).update(
                quantity_available=F("quantity_available") + refund
            )
            movements.append(StockMovement(
                restaurant=recipe.ingredient.restaurant,
                branch=branch,
                ingredient=recipe.ingredient,
                change_quantity=refund,
                movement_type="production_adjustment",
                created_by=production.created_by,
            ))
        StockMovement.objects.bulk_create(movements)

    production.delete()

    menu_item.is_available = False
    menu_item.save(update_fields=["is_available"])

    from inventory.utils import update_platter_availability_from_menu_item
    update_platter_availability_from_menu_item(menu_item, branch=branch)

    _record_production_movement(
        menu_item=menu_item,
        branch=branch,
        production_id=production_id,
        movement_type="clear",
        before_produced=before_produced,
        after_produced=0,
        before_remaining=before_remaining,
        after_remaining=0,
        actor=actor,
        notes=notes,
        refunded_ingredients=refund_remaining,
    )

    return True

@transaction.atomic
def increment_production(menu_item, quantity, branch, created_by=None, notes=""):
    """
    Add `quantity` to existing production, or create a new batch if none exists.
    Deducts ingredients for the added amount only.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")
    if not branch:
        raise ValueError("An active branch is required for production.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    existing = Production.objects.filter(menu_item=menu_item, branch=branch).first()
    if not existing:
        return create_or_replace_production(
            menu_item=menu_item,
            quantity=quantity,
            branch=branch,
            created_by=created_by,
            notes=notes,
        )

    new_qty = existing.quantity_produced + quantity
    return adjust_production(
        existing,
        new_quantity=new_qty,
        notes=notes,
        actor=created_by,
        movement_type="increment",
    )


@transaction.atomic
def decrement_production(menu_item, quantity, branch, notes="", actor=None):
    """
    Reduce produced quantity by `quantity`.
    Cannot go below the number already sold.
    Refunds ingredients for the removed amount.
    """
    if not menu_item.uses_daily_production:
        raise ValueError(f"{menu_item.name} does not use production tracking.")
    if not branch:
        raise ValueError("An active branch is required for production.")

    quantity = int(quantity)
    if quantity <= 0:
        raise ValueError("Quantity must be positive.")

    existing = Production.objects.filter(menu_item=menu_item, branch=branch).first()
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
        clear_production(
            menu_item,
            branch=branch,
            refund_remaining=False,
            actor=actor,
            notes=notes,
        )
        return None

    return adjust_production(
        existing,
        new_quantity=new_qty,
        notes=notes,
        actor=actor,
        movement_type="decrement",
    )
