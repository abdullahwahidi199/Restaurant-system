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
from decimal import Decimal, InvalidOperation
from django.utils import timezone
from .models import (
    Ingredient,
    PurchaseInvoice,
    PurchaseInvoiceLine,
    StockMovement,
    Supplier,
    SupplierPayment,
)
from .utils import update_menu_item_availability


MONEY_QUANT = Decimal("0.01")


def _decimal(value, default="0"):
    if value in [None, ""]:
        return Decimal(default)
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("Enter a valid amount.") from exc


def _money(value):
    return _decimal(value).quantize(MONEY_QUANT)


def _invoice_status(total, paid):
    total = _money(total)
    paid = _money(paid)
    if paid <= 0:
        return PurchaseInvoice.STATUS_UNPAID
    if paid < total:
        return PurchaseInvoice.STATUS_PARTIALLY_PAID
    return PurchaseInvoice.STATUS_PAID


def _supplier_for_invoice(supplier_id, restaurant, branch):
    if not supplier_id:
        return None

    try:
        return Supplier.objects.get(
            id=supplier_id,
            restaurant=restaurant,
            branch=branch,
            is_active=True,
        )
    except Supplier.DoesNotExist as exc:
        raise ValueError("Supplier not found for this branch.") from exc


def _invoice_lines_from_payload(data, restaurant, branch):
    raw_lines = data.get("lines")

    if not raw_lines:
        ingredient = data.get("ingredient")
        quantity = data.get("quantity")
        unit_price = data.get("unit_price") or data.get("cost_per_unit")
        total_price = data.get("total_price")

        if total_price not in [None, ""] and quantity not in [None, ""] and not unit_price:
            unit_price = _money(total_price) / _decimal(quantity)

        raw_lines = [
            {
                "ingredient": ingredient,
                "quantity": quantity,
                "unit_price": unit_price,
            }
        ]

    lines = []
    for index, line in enumerate(raw_lines, start=1):
        ingredient_id = line.get("ingredient")
        if not ingredient_id:
            raise ValueError(f"Line {index}: ingredient is required.")

        try:
            ingredient = Ingredient.objects.select_for_update().get(
                id=ingredient_id,
                restaurant=restaurant,
                branch=branch,
                is_active=True,
            )
        except Ingredient.DoesNotExist as exc:
            raise ValueError(f"Line {index}: ingredient not found for this branch.") from exc

        quantity = _decimal(line.get("quantity"))
        unit_price = _decimal(line.get("unit_price"))
        if quantity <= 0:
            raise ValueError(f"Line {index}: quantity must be greater than zero.")
        if unit_price < 0:
            raise ValueError(f"Line {index}: unit price cannot be negative.")

        lines.append(
            {
                "ingredient": ingredient,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": _money(quantity * unit_price),
            }
        )

    if not lines:
        raise ValueError("At least one invoice line is required.")

    return lines


@transaction.atomic
def post_purchase_invoice_inventory(invoice, created_by=None):
    invoice = (
        PurchaseInvoice.objects
        .select_for_update()
        .prefetch_related("lines__ingredient")
        .get(pk=invoice.pk)
    )

    if invoice.is_inventory_posted:
        return invoice

    if invoice.status == PurchaseInvoice.STATUS_DRAFT:
        invoice.status = _invoice_status(invoice.total_amount, invoice.amount_paid)

    for line in invoice.lines.all():
        ingredient = line.ingredient
        change_ingredient_stock(
            ingredient,
            invoice.branch,
            line.quantity,
            cost_per_unit=line.unit_price,
        )
        movement = StockMovement.objects.create(
            ingredient=ingredient,
            restaurant=invoice.restaurant,
            branch=invoice.branch,
            change_quantity=line.quantity,
            movement_type="purchase",
            created_by=created_by or invoice.created_by,
            unit_cost=line.unit_price,
            note=(
                f"Purchase invoice {invoice.invoice_number or invoice.id}"
                + (f" from {invoice.supplier.name}" if invoice.supplier_id else "")
            ),
        )
        PurchaseInvoiceLine.objects.filter(pk=line.pk).update(stock_movement=movement)

        for recipe in ingredient.menu_items.select_related("menu_item"):
            update_menu_item_availability(recipe.menu_item, branch=invoice.branch)

    invoice.is_inventory_posted = True
    invoice.save(update_fields=["is_inventory_posted", "status", "updated_at"])
    invoice.refresh_totals_and_status(save=True)
    return invoice


@transaction.atomic
def create_purchase_invoice(data, restaurant, branch, created_by=None):
    if not branch:
        raise ValueError("An active branch is required to create a purchase invoice.")

    supplier = _supplier_for_invoice(data.get("supplier"), restaurant, branch)
    lines = _invoice_lines_from_payload(data, restaurant, branch)
    requested_status = data.get("status")
    is_draft = requested_status == PurchaseInvoice.STATUS_DRAFT

    invoice = PurchaseInvoice.objects.create(
        restaurant=restaurant,
        branch=branch,
        supplier=supplier,
        invoice_number=(data.get("invoice_number") or "").strip(),
        purchase_date=data.get("purchase_date") or timezone.localdate(),
        due_date=data.get("due_date") or None,
        notes=(data.get("notes") or "").strip(),
        status=PurchaseInvoice.STATUS_DRAFT if is_draft else PurchaseInvoice.STATUS_UNPAID,
        created_by=created_by,
    )

    for line in lines:
        PurchaseInvoiceLine.objects.create(
            invoice=invoice,
            ingredient=line["ingredient"],
            quantity=line["quantity"],
            unit_price=line["unit_price"],
            total_price=line["total_price"],
        )

    invoice.refresh_totals_and_status(save=True)

    initial_paid = _money(
        data.get("amount_paid")
        if "amount_paid" in data
        else data.get("amount_paid_initial")
    )
    if initial_paid > invoice.total_amount:
        raise ValueError("Initial payment cannot exceed invoice total.")

    if not is_draft:
        invoice = post_purchase_invoice_inventory(invoice, created_by=created_by)

        if supplier and initial_paid > 0:
            create_supplier_payment(
                {
                    "supplier": supplier.id,
                    "purchase_invoice": invoice.id,
                    "date": data.get("purchase_date"),
                    "amount": initial_paid,
                    "payment_method": data.get("payment_method") or "cash",
                    "reference_number": data.get("payment_reference") or "",
                    "notes": "Initial invoice payment.",
                },
                restaurant=restaurant,
                branch=branch,
                created_by=created_by,
            )
        elif not supplier:
            invoice.amount_paid = initial_paid
            invoice.status = _invoice_status(invoice.total_amount, initial_paid)
            invoice.save(update_fields=["amount_paid", "status", "updated_at"])
        else:
            invoice.refresh_totals_and_status(save=True)

    return PurchaseInvoice.objects.prefetch_related("lines", "payments").get(pk=invoice.pk)


@transaction.atomic
def create_supplier_payment(data, restaurant, branch, created_by=None):
    supplier_id = data.get("supplier")
    invoice_id = data.get("purchase_invoice")
    if not supplier_id or not invoice_id:
        raise ValueError("Supplier and purchase invoice are required.")

    try:
        supplier = Supplier.objects.get(
            id=supplier_id,
            restaurant=restaurant,
        )
    except Supplier.DoesNotExist as exc:
        raise ValueError("Supplier not found.") from exc

    try:
        invoice = PurchaseInvoice.objects.select_for_update().get(
            id=invoice_id,
            restaurant=restaurant,
            supplier=supplier,
        )
    except PurchaseInvoice.DoesNotExist as exc:
        raise ValueError("Purchase invoice not found for this supplier.") from exc

    if branch and invoice.branch_id != branch.id:
        raise ValueError("Purchase invoice belongs to another branch.")

    if invoice.status == PurchaseInvoice.STATUS_DRAFT:
        raise ValueError("Draft invoices cannot receive payments.")

    amount = _money(data.get("amount"))
    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")
    if amount > invoice.remaining_balance:
        raise ValueError("Payment amount cannot exceed the remaining balance.")

    payment = SupplierPayment.objects.create(
        restaurant=restaurant,
        branch=invoice.branch,
        supplier=supplier,
        purchase_invoice=invoice,
        date=data.get("date") or timezone.localdate(),
        amount=amount,
        payment_method=data.get("payment_method") or "cash",
        reference_number=(data.get("reference_number") or "").strip(),
        notes=(data.get("notes") or "").strip(),
        created_by=created_by,
    )
    return payment


def supplier_ledger(supplier):
    entries = []

    for invoice in supplier.purchase_invoices.exclude(status="draft").all():
        entries.append(
            {
                "date": invoice.purchase_date,
                "type": "invoice",
                "id": invoice.id,
                "label": invoice.invoice_number or f"PINV-{invoice.id}",
                "debit": Decimal(invoice.total_amount or 0),
                "credit": Decimal("0.00"),
                "status": invoice.status,
            }
        )

    for payment in supplier.payments.all():
        entries.append(
            {
                "date": payment.date,
                "type": "payment",
                "id": payment.id,
                "label": payment.reference_number or payment.get_payment_method_display(),
                "debit": Decimal("0.00"),
                "credit": Decimal(payment.amount or 0),
                "status": "paid",
            }
        )

    entries.sort(key=lambda item: (item["date"], item["type"], item["id"]))

    balance = Decimal("0.00")
    for entry in entries:
        balance += entry["debit"] - entry["credit"]
        entry["debit"] = float(entry["debit"])
        entry["credit"] = float(entry["credit"])
        entry["running_balance"] = float(balance)

    return {
        "supplier": supplier,
        "entries": entries,
        "total_purchases": supplier.total_purchases,
        "total_paid": supplier.total_paid,
        "outstanding_balance": supplier.outstanding_balance,
    }


@transaction.atomic
def add_stock(ingredient, quantity, created_by=None, cost_per_unit=None, branch=None):
    branch = branch or ingredient.branch
    return create_purchase_invoice(
        {
            "supplier": None,
            "lines": [
                {
                    "ingredient": ingredient.id,
                    "quantity": quantity,
                    "unit_price": cost_per_unit,
                }
            ],
        },
        restaurant=ingredient.restaurant,
        branch=branch,
        created_by=created_by,
    )

        
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

    try:
        linked_line = movement.purchase_invoice_line
    except PurchaseInvoiceLine.DoesNotExist:
        linked_line = None
    if linked_line and old_type == "purchase":
        linked_line.quantity = new_effect
        linked_line.unit_price = Decimal(movement.unit_cost or 0)
        linked_line.save()
        linked_line.invoice.refresh_totals_and_status(save=True)

    # refresh menu availability
    for recipe in ingredient.menu_items.select_related(
        "menu_item"
    ):

        update_menu_item_availability(
            recipe.menu_item,
            branch=movement.branch or ingredient.branch,
        )




