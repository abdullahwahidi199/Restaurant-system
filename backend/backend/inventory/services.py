from django.db import transaction
from .models import MenuItemIngredient, StockMovement
from .utils import update_menu_item_availability

@transaction.atomic
def deduct_stock_for_order(order):
    for order_item in order.items.all():
        recipe_items = MenuItemIngredient.objects.select_related(
            'ingredient', 'menu_item'
        ).filter(menu_item=order_item.menu_item)

        for recipe in recipe_items:
            required_qty = recipe.quantity_required * order_item.quantity
            ingredient = recipe.ingredient

            if ingredient.quantity_available < required_qty:
                raise ValueError(
                    f"Insufficient stock for {ingredient.name}"
                )

            ingredient.quantity_available -= required_qty
            ingredient.save(update_fields=['quantity_available'])

            StockMovement.objects.create(
                ingredient=ingredient,
                change_quantity=-required_qty,
                movement_type='order',
                related_order=order,
                # created_by=order.waiter
            )


        update_menu_item_availability(order_item.menu_item)
from django.db import transaction
from decimal import Decimal
from .models import StockMovement
from .utils import update_menu_item_availability


@transaction.atomic
def add_stock(
    ingredient,
    quantity,
    created_by=None,
    cost_per_unit=None
):
    quantity = Decimal(quantity)

    old_qty = ingredient.quantity_available
    old_cost = ingredient.cost_per_unit or Decimal("0")

    ingredient.quantity_available = old_qty + quantity

   
    if cost_per_unit is not None:
        new_cost = Decimal(cost_per_unit)

        total_old_value = old_qty * old_cost
        total_new_value = quantity * new_cost
        total_qty = old_qty + quantity

        ingredient.cost_per_unit = (
            (total_old_value + total_new_value) / total_qty
        )

    ingredient.save()

    StockMovement.objects.create(
        ingredient=ingredient,
        change_quantity=quantity,
        movement_type="purchase",
        created_by=created_by
    )

    for recipe in ingredient.menu_items.select_related("menu_item"):
        update_menu_item_availability(recipe.menu_item)

        
from django.db import transaction
from .models import MenuItemIngredient, StockMovement
from .utils import update_menu_item_availability


@transaction.atomic
def deduct_stock_for_order_item(order_item, order):
    recipe_items = MenuItemIngredient.objects.select_related(
        'ingredient', 'menu_item'
    ).filter(menu_item=order_item.menu_item)

    for recipe in recipe_items:
        required_qty = recipe.quantity_required * order_item.quantity
        ingredient = recipe.ingredient

        if ingredient.quantity_available < required_qty:
            raise ValueError(f"Insufficient stock for {ingredient.name}")

        ingredient.quantity_available -= required_qty
        ingredient.save(update_fields=['quantity_available'])

        StockMovement.objects.create(
            ingredient=ingredient,
            change_quantity=-required_qty,
            movement_type='order',
            related_order=order
        )

    update_menu_item_availability(order_item.menu_item)