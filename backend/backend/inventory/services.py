from collections import defaultdict
from django.db import transaction
from django.db.models import F
from menu.production_utils import consume_production

from menu.models import MenuItem
from inventory.models import IngredientStock, MenuItemIngredient, Ingredient
from .models import StockMovement
from .utils import update_menu_item_availability


# ✅ Recalculate menu item availability after stock changes
def uses_shared_ingredients(restaurant):
    return False


def get_or_create_ingredient_stock(ingredient, branch):
    if not branch:
        return None

    stock, _ = IngredientStock.objects.get_or_create(
        ingredient=ingredient,
        branch=branch,
        defaults={
            "restaurant": ingredient.restaurant,
            "quantity_available": ingredient.quantity_available,
            "minimum_threshold": ingredient.minimum_threshold,
            "cost_per_unit": ingredient.cost_per_unit,
            "is_active": ingredient.is_active,
        },
    )
    return stock


def get_effective_stock(ingredient, branch):
    return ingredient


def get_effective_quantity(ingredient, branch):
    stock = get_effective_stock(ingredient, branch)
    return stock.quantity_available if stock else ingredient.quantity_available


def get_effective_minimum_threshold(ingredient, branch):
    stock = get_effective_stock(ingredient, branch)
    return stock.minimum_threshold if stock else ingredient.minimum_threshold


def get_effective_cost_per_unit(ingredient, branch):
    stock = get_effective_stock(ingredient, branch)
    return stock.cost_per_unit if stock else ingredient.cost_per_unit


def change_ingredient_stock(ingredient, branch, quantity_delta, cost_per_unit=None):
    quantity_delta = Decimal(str(quantity_delta))

    if branch and ingredient.branch_id != branch.id:
        raise ValueError("Ingredient stock belongs to another branch.")

    ingredient.quantity_available += quantity_delta
    if cost_per_unit is not None:
        ingredient.cost_per_unit = Decimal(str(cost_per_unit))
    if ingredient.quantity_available < 0:
        raise ValueError(f"Insufficient stock for {ingredient.name}")
    ingredient.save(update_fields=["quantity_available", "cost_per_unit"])
    return ingredient.quantity_available


def get_recipe_items(menu_item, branch=None):
    recipes = MenuItemIngredient.objects.filter(
        menu_item=menu_item,
    ).select_related("ingredient")

    if branch:
        recipes = recipes.filter(ingredient__branch=branch)

    return recipes


def recalc_menu_availability(ingredient_ids):
    if not ingredient_ids:
        return

    menu_item_ids = (
        MenuItemIngredient.objects
        .filter(ingredient_id__in=ingredient_ids)
        .values_list("menu_item_id", flat=True)
        .distinct()
    )

    ingredients = Ingredient.objects.filter(id__in=ingredient_ids).select_related("branch")
    branches = {
        ingredient.branch_id: ingredient.branch
        for ingredient in ingredients
        if ingredient.branch_id
    }
    for stock in IngredientStock.objects.filter(
        ingredient_id__in=ingredient_ids,
    ).select_related("branch"):
        branches[stock.branch_id] = stock.branch

    for branch in branches.values():
        menu_items = MenuItem.objects.filter(id__in=menu_item_ids)
        for item in menu_items:
            update_menu_item_availability(item, branch=branch)


from collections import defaultdict
from decimal import Decimal
from django.db import transaction
from django.db.models import F

from menu.models import MenuItem
from inventory.models import IngredientStock, MenuItemIngredient, Ingredient
from .models import StockMovement
from .utils import update_menu_item_availability


# ✅ Deduct stock for a single menu item
def deduct_menu_item_stock(menu_item, quantity, order, ingredient_ids):
    if menu_item.uses_daily_production:
        consume_production(menu_item, int(quantity), branch=order.branch)
        return
    recipe_items = get_recipe_items(menu_item, branch=order.branch)

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
        ingredient = Ingredient.objects.get(id=ingredient_id)
        change_ingredient_stock(ingredient, order.branch, -required_qty)

    # 🔵 STEP 3: Create stock movement records
    for recipe in recipe_items:
        change_qty = recipe.quantity_required * quantity

        stock_movements.append(
            StockMovement(
                restaurant=recipe.ingredient.restaurant,
                branch=order.branch,
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
        order.items\
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
def add_stock(ingredient, quantity, created_by=None, cost_per_unit=None, branch=None):
    quantity = Decimal(quantity)
    branch = branch or ingredient.branch

    change_ingredient_stock(
        ingredient,
        branch,
        quantity,
        cost_per_unit=cost_per_unit,
    )

    # 3. Create Movement
    StockMovement.objects.create(
        ingredient=ingredient,
        restaurant=ingredient.restaurant,
        branch=branch,
        change_quantity=quantity,
        movement_type="purchase",
        created_by=created_by,
        unit_cost=cost_per_unit # Ensure you added this field to model
    )

    # 4. Update availability
    for recipe in ingredient.menu_items.select_related("menu_item"):
        update_menu_item_availability(recipe.menu_item, branch=branch)

        
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
    production_consumptions = defaultdict(int)
    
    # Step 1: Aggregate all ingredient requirements across all items
    for order_item in order_items:
        
        # Single menu item
        if order_item.menu_item:
            mi = order_item.menu_item
            if mi.uses_daily_production:
                production_consumptions[mi] += int(order_item.quantity)
                continue
            recipe_items = get_recipe_items(order_item.menu_item, branch=order.branch)
            
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
                        branch=order.branch,
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
                mi = platter_item.menu_item
                if mi.uses_daily_production:
                    production_consumptions[mi] += (
                        int(platter_item.quantity) * int(order_item.quantity)
                    )
                    continue
                recipe_items = get_recipe_items(platter_item.menu_item, branch=order.branch)
                
                item_quantity = Decimal(str(platter_item.quantity)) * platter_quantity
                
                for recipe in recipe_items:
                    required_qty = recipe.quantity_required * item_quantity
                    ingredient = recipe.ingredient
                    
                    ingredient_requirements[ingredient.id] += required_qty
                    ingredient_ids.add(ingredient.id)
                    
                    stock_movements.append(
                        StockMovement(
                            restaurant=ingredient.restaurant,
                            branch=order.branch,
                            ingredient_id=ingredient.id,
                            change_quantity=-required_qty,
                            movement_type="order",
                            related_order=order,
                        )
                    )
    for mi, qty in production_consumptions.items():
        consume_production(mi, qty, branch=order.branch)
    
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
            if ingredient and get_effective_quantity(ingredient, order.branch) < required_qty:
                insufficient.append(ingredient.name)
        
        if insufficient:
            raise ValueError(f"Insufficient stock for: {', '.join(insufficient)}")
        
        # Batch update using CASE WHEN (single query per batch, or individual updates)
        # Option A: For many ingredients, do individual updates (still much better than per-item)
        for ing_id, required_qty in ingredient_requirements.items():
            ingredient = ingredients.get(ing_id)
            if ingredient:
                change_ingredient_stock(ingredient, order.branch, -required_qty)
        
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
    
    ingredients = Ingredient.objects.filter(id__in=ingredient_ids).select_related("branch")
    branches = {
        ingredient.branch_id: ingredient.branch
        for ingredient in ingredients
        if ingredient.branch_id
    }
    for stock in IngredientStock.objects.filter(
        ingredient_id__in=ingredient_ids,
    ).select_related("branch"):
        branches[stock.branch_id] = stock.branch

    menu_items = MenuItem.objects.filter(id__in=menu_item_ids)

    for branch in branches.values():
        for menu_item in menu_items:
            update_menu_item_availability(menu_item, branch=branch)

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

    change_ingredient_stock(
        ingredient,
        movement.branch or ingredient.branch,
        new_effect - old_effect,
        cost_per_unit=(
            new_unit_cost
            if old_type == "purchase" and new_unit_cost is not None
            else None
        ),
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
            recipe.menu_item,
            branch=movement.branch or ingredient.branch,
        )




