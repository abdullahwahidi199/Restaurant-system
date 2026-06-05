from collections import defaultdict
from django.db import transaction
from django.db.models import F

from menu.models import MenuItem
from inventory.models import MenuItemIngredient, Ingredient
from .models import StockMovement
from .utils import update_menu_item_availability


# ✅ Recalculate menu item availability after stock changes
def recalc_menu_availability(ingredient_ids):
    if not ingredient_ids:
        return

    menu_item_ids = (
        MenuItemIngredient.objects
        .filter(ingredient_id__in=ingredient_ids)
        .values_list("menu_item_id", flat=True)
        .distinct()
    )

    menu_items = MenuItem.objects.filter(id__in=menu_item_ids)

    for item in menu_items:
        update_menu_item_availability(item)


from collections import defaultdict
from decimal import Decimal
from django.db import transaction
from django.db.models import F

from menu.models import MenuItem
from inventory.models import MenuItemIngredient, Ingredient
from .models import StockMovement
from .utils import update_menu_item_availability


# ✅ Deduct stock for a single menu item
def deduct_menu_item_stock(menu_item, quantity, order, ingredient_ids):
    recipe_items = (
        MenuItemIngredient.objects
        .select_related("ingredient")
        .filter(menu_item=menu_item)
    )

    stock_movements = []

    # 🔵 STEP 1: Calculate required quantities (use Decimal)
    ingredient_requirements = defaultdict(Decimal)

    # Ensure quantity is Decimal
    quantity = Decimal(str(quantity))

    for recipe in recipe_items:
        required_qty = recipe.quantity_required * quantity
        ingredient = recipe.ingredient

        ingredient_requirements[ingredient.id] += required_qty
        ingredient_ids.add(ingredient.id)

    # 🔵 STEP 2: Atomically deduct stock
    for ingredient_id, required_qty in ingredient_requirements.items():
        updated = Ingredient.objects.filter(
            id=ingredient_id,
            quantity_available__gte=required_qty
        ).update(
            quantity_available=F("quantity_available") - required_qty
        )

        if updated == 0:
            ingredient = Ingredient.objects.get(id=ingredient_id)
            raise ValueError(f"Insufficient stock for {ingredient.name}")

    # 🔵 STEP 3: Create stock movement records
    for recipe in recipe_items:
        change_qty = recipe.quantity_required * quantity

        stock_movements.append(
            StockMovement(
                restaurant=recipe.ingredient.restaurant,
                ingredient=recipe.ingredient,
                change_quantity=-change_qty,
                movement_type="order",
                related_order=order,
            )
        )

    StockMovement.objects.bulk_create(stock_movements, batch_size=100)


# ✅ Main entry point — deduct stock for entire order
@transaction.atomic
def deduct_stock_for_order(order):
    ingredient_ids = set()

    order_items = (
        order.items
        .select_related("menu_item", "platter")
        .prefetch_related("platter__items__menu_item")
    )

    for order_item in order_items:

        # 🔹 Single menu item
        if order_item.menu_item:
            deduct_menu_item_stock(
                menu_item=order_item.menu_item,
                quantity=order_item.quantity,
                order=order,
                ingredient_ids=ingredient_ids
            )

        # 🔹 Platter (multiple menu items)
        elif order_item.platter:
            for platter_item in order_item.platter.items.all():
                deduct_menu_item_stock(
                    menu_item=platter_item.menu_item,
                    quantity=platter_item.quantity * order_item.quantity,
                    order=order,
                    ingredient_ids=ingredient_ids
                )

    # ✅ Recalculate availability only once at the end
    recalc_menu_availability(ingredient_ids)
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


from decimal import Decimal
from django.db import transaction


# Add this to your stock_utils.py

from decimal import Decimal
from collections import defaultdict
from django.db import transaction, models
from django.db.models import F, Sum, Q
from django.db.models.functions import Coalesce

@transaction.atomic
def deduct_batch_stock_for_order_items(order_items, order):
    """
    Batch deduct stock for multiple order items at once
    """
    if not order_items:
        return set()
    
    ingredient_ids = set()
    ingredient_requirements = defaultdict(Decimal)  # ingredient_id -> total qty needed
    stock_movements = []
    
    # Step 1: Aggregate all ingredient requirements across all items
    for order_item in order_items:
        
        # Single menu item
        if order_item.menu_item:
            recipe_items = MenuItemIngredient.objects.filter(
                menu_item=order_item.menu_item
            ).select_related("ingredient")
            
            quantity = Decimal(str(order_item.quantity))
            
            for recipe in recipe_items:
                required_qty = recipe.quantity_required * quantity
                ingredient = recipe.ingredient
                
                ingredient_requirements[ingredient.id] += required_qty
                ingredient_ids.add(ingredient.id)
                
                # Prepare stock movement for later
                stock_movements.append(
                    StockMovement(
                        restaurant=ingredient.restaurant,
                        ingredient_id=ingredient.id,
                        change_quantity=-required_qty,
                        movement_type="order",
                        related_order=order,
                    )
                )
        
        # Platter
        elif order_item.platter:
            # Prefetch platter items to avoid N+1
            platter_items = order_item.platter.items.select_related('menu_item')
            platter_quantity = Decimal(str(order_item.quantity))
            
            for platter_item in platter_items:
                recipe_items = MenuItemIngredient.objects.filter(
                    menu_item=platter_item.menu_item
                ).select_related("ingredient")
                
                item_quantity = Decimal(str(platter_item.quantity)) * platter_quantity
                
                for recipe in recipe_items:
                    required_qty = recipe.quantity_required * item_quantity
                    ingredient = recipe.ingredient
                    
                    ingredient_requirements[ingredient.id] += required_qty
                    ingredient_ids.add(ingredient.id)
                    
                    stock_movements.append(
                        StockMovement(
                            restaurant=ingredient.restaurant,
                            ingredient_id=ingredient.id,
                            change_quantity=-required_qty,
                            movement_type="order",
                            related_order=order,
                        )
                    )
    
    # Step 2: Batch update ingredients in a single query per ingredient
    if ingredient_requirements:
        # Get all ingredients with their current stock in one query
        ingredients = {
            ing.id: ing for ing in 
            Ingredient.objects.filter(id__in=ingredient_requirements.keys())
            .select_for_update()  # Lock rows to prevent race conditions
        }
        
        # Validate stock levels
        insufficient = []
        for ing_id, required_qty in ingredient_requirements.items():
            ingredient = ingredients.get(ing_id)
            if ingredient and ingredient.quantity_available < required_qty:
                insufficient.append(ingredient.name)
        
        if insufficient:
            raise ValueError(f"Insufficient stock for: {', '.join(insufficient)}")
        
        # Batch update using CASE WHEN (single query per batch, or individual updates)
        # Option A: For many ingredients, do individual updates (still much better than per-item)
        update_queries = []
        for ing_id, required_qty in ingredient_requirements.items():
            update_queries.append(
                Ingredient.objects.filter(id=ing_id).update(
                    quantity_available=F("quantity_available") - required_qty
                )
            )
        
        # Option B: Use bulk_update if you prefer (requires fetching all)
        # for ing_id, required_qty in ingredient_requirements.items():
        #     ingredients[ing_id].quantity_available -= required_qty
        # Ingredient.objects.bulk_update(ingredients.values(), ['quantity_available'])
    
    # Step 3: Bulk create stock movements
    if stock_movements:
        StockMovement.objects.bulk_create(stock_movements, batch_size=100)
    
    return ingredient_ids


@transaction.atomic
def recalc_batch_menu_availability(ingredient_ids):
    """
    Recalculate availability for all menu items affected by these ingredients,
    but only once per menu item.
    """
    if not ingredient_ids:
        return
    
    # Get all unique menu items affected by these ingredients
    menu_item_ids = set(
        MenuItemIngredient.objects
        .filter(ingredient_id__in=ingredient_ids)
        .values_list("menu_item_id", flat=True)
        .distinct()
    )
    
    # Bulk fetch current ingredient quantities for these menu items
    # This is more efficient than recalculating one by one
    menu_items = MenuItem.objects.filter(id__in=menu_item_ids).prefetch_related(
        'ingredients__ingredient'
    )
    
    for menu_item in menu_items:
        # Use a single query to check availability
        required_ingredients = menu_item.ingredients.select_related('ingredient')
        is_available = all(
            recipe.ingredient.quantity_available >= recipe.quantity_required
            for recipe in required_ingredients
        )
        
        # Only update if changed
        if menu_item.is_available != is_available:
            menu_item.is_available = is_available
            menu_item.save(update_fields=['is_available'])

@transaction.atomic
def deduct_stock_for_order_item(order_item, order):
    ingredient_ids = set()

    # ✅ NORMAL ITEM
    if order_item.menu_item:
        deduct_menu_item_stock(
            menu_item=order_item.menu_item,
            quantity=Decimal(str(order_item.quantity)),
            order=order,
            ingredient_ids=ingredient_ids
        )

    # ✅ PLATTER
    elif order_item.platter:
        for platter_item in order_item.platter.items.all():
            qty = Decimal(str(platter_item.quantity)) * Decimal(str(order_item.quantity))
            deduct_menu_item_stock(
                menu_item=platter_item.menu_item,
                quantity=qty,
                order=order,
                ingredient_ids=ingredient_ids
            )

    # ✅ Recalculate availability only once
    recalc_menu_availability(ingredient_ids)

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




