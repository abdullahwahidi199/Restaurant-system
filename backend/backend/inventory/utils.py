

def update_menu_item_availability(menu_item, branch=None):
    from .services import get_effective_quantity, get_recipe_items

    if menu_item.uses_daily_production:
        prod = menu_item.get_production(branch=branch)
        if prod and prod.quantity_remaining > 0:
            menu_item.mark_available(branch=branch)
        else:
            menu_item.mark_unavailable(branch=branch)
        update_platter_availability_from_menu_item(menu_item, branch=branch)
        return

    recipes = get_recipe_items(menu_item, branch=branch)

    if not recipes.exists():
        menu_item.mark_unavailable(branch=branch)
        update_platter_availability_from_menu_item(menu_item, branch=branch)
        return

    for recipe in recipes:
        ingredient = recipe.ingredient
        if get_effective_quantity(ingredient, branch) < recipe.quantity_required:
            menu_item.mark_unavailable(branch=branch)
            update_platter_availability_from_menu_item(menu_item, branch=branch)
            return

    menu_item.mark_available(branch=branch)
    update_platter_availability_from_menu_item(menu_item, branch=branch)


def update_platter_availability_from_menu_item(menu_item, branch=None):
    for platter in menu_item.platter_items.select_related("platter"):
        update_platter_availability(platter.platter, branch=branch)


def update_platter_availability(platter, branch=None):
    platter_items = platter.items.select_related("menu_item").all()

    if not platter_items.exists():
        platter.is_available = False
        platter.save(update_fields=["is_available"])
        return

    is_available = all(
        item.menu_item.is_available_for_branch(branch=branch)
        for item in platter_items
    )

    platter.is_available = is_available
    platter.save(update_fields=["is_available"])
