from django.db import transaction
from .models import MenuItemIngredient, StockMovement
from .utils import update_menu_item_availability


from django.db import transaction
from .models import MenuItemIngredient, StockMovement
from .utils import update_menu_item_availability


@transaction.atomic
def deduct_menu_item_stock(
    menu_item,
    quantity,
    order
):

    recipe_items = MenuItemIngredient.objects.select_related(
        'ingredient',
        'menu_item'
    ).filter(menu_item=menu_item)

    for recipe in recipe_items:

        required_qty = (
            recipe.quantity_required * quantity
        )

        ingredient = recipe.ingredient

        if ingredient.quantity_available < required_qty:
            raise ValueError(
                f"Insufficient stock for {ingredient.name}"
            )

        ingredient.quantity_available -= required_qty

        ingredient.save(
            update_fields=['quantity_available']
        )

        StockMovement.objects.create(
            restaurant=ingredient.restaurant,
            ingredient=ingredient,
            change_quantity=-required_qty,
            movement_type='order',
            related_order=order
        )

    # update availability
    for recipe in recipe_items:

        for rel in recipe.ingredient.menu_items.select_related(
            'menu_item'
        ):

            update_menu_item_availability(
                rel.menu_item
            )
@transaction.atomic
def deduct_stock_for_order(order):

    for order_item in order.items.all():

        # NORMAL MENU ITEM
        if order_item.menu_item:

            deduct_menu_item_stock(
                menu_item=order_item.menu_item,
                quantity=order_item.quantity,
                order=order
            )

        # PLATTER
        elif order_item.platter:

            for platter_item in order_item.platter.items.all():

                deduct_menu_item_stock(
                    menu_item=platter_item.menu_item,
                    quantity=(
                        platter_item.quantity
                        * order_item.quantity
                    ),
                    order=order
                )
from django.db import transaction
from decimal import Decimal
from .models import StockMovement
from .utils import update_menu_item_availability


@transaction.atomic
def add_stock(ingredient, quantity, created_by=None, cost_per_unit=None):
    quantity = Decimal(quantity)
    
    # 1. Update Quantity
    ingredient.quantity_available += quantity

    # 2. Update Price (Simple: set to new price if provided)
    if cost_per_unit is not None:
        ingredient.cost_per_unit = Decimal(cost_per_unit)

    ingredient.save()

    # 3. Create Movement
    StockMovement.objects.create(
        ingredient=ingredient,
        restaurant=ingredient.restaurant,
        change_quantity=quantity,
        movement_type="purchase",
        created_by=created_by,
        unit_cost=cost_per_unit # Ensure you added this field to model
    )

    # 4. Update availability
    for recipe in ingredient.menu_items.select_related("menu_item"):
        update_menu_item_availability(recipe.menu_item)

        
from django.db import transaction
from .models import MenuItemIngredient, StockMovement
from .utils import update_menu_item_availability


@transaction.atomic
def deduct_stock_for_order_item(order_item, order):

    # NORMAL ITEM
    if order_item.menu_item:

        deduct_menu_item_stock(
            menu_item=order_item.menu_item,
            quantity=order_item.quantity,
            order=order
        )

    # PLATTER
    elif order_item.platter:

        for platter_item in order_item.platter.items.all():

            deduct_menu_item_stock(
                menu_item=platter_item.menu_item,
                quantity=(
                    platter_item.quantity
                    * order_item.quantity
                ),
                order=order
            )


from decimal import Decimal
from django.db import transaction
from .utils import update_menu_item_availability


@transaction.atomic
def edit_stock_movement(
    movement,
    new_quantity,
    new_movement_type,
    new_unit_cost=None
):

    ingredient = movement.ingredient

    old_quantity = Decimal(movement.change_quantity)
    old_type = movement.movement_type

    new_quantity = Decimal(new_quantity)

    """
    STOCK EFFECT RULES

    purchase   => +
    adjustment => signed
    waste      => always negative
    """

    # OLD EFFECT
    old_effect = old_quantity

    # NEW EFFECT
    if new_movement_type == "waste":
        new_effect = -abs(new_quantity)
    else:
        new_effect = new_quantity

    # reverse old movement
    ingredient.quantity_available -= old_effect

    # apply new movement
    ingredient.quantity_available += new_effect

    if ingredient.quantity_available < 0:
        raise ValueError(
            "Stock cannot become negative"
        )

    # purchases update ingredient cost
    if (
        old_type == "purchase"
        and new_unit_cost is not None
    ):
        ingredient.cost_per_unit = Decimal(
            new_unit_cost
        )

    ingredient.save(
        update_fields=[
            "quantity_available",
            "cost_per_unit"
        ]
    )

    # update movement
    movement.change_quantity = new_effect
    movement.movement_type = new_movement_type

    if (
        old_type == "purchase"
        and new_unit_cost is not None
    ):
        movement.unit_cost = Decimal(
            new_unit_cost
        )

    movement.save()

    # refresh menu availability
    for recipe in ingredient.menu_items.select_related(
        "menu_item"
    ):

        update_menu_item_availability(
            recipe.menu_item
        )




