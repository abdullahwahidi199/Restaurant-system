def update_menu_item_availability(menu_item):
    recipes = menu_item.ingredients.select_related(
        'ingredient'
    ).all()

    # ❗ no recipe = unavailable
    if not recipes.exists():
        menu_item.mark_unavailable()

        update_platter_availability_from_menu_item(
            menu_item
        )

        return

    for recipe in recipes:

        ingredient = recipe.ingredient
        ingredient.refresh_from_db()

        if (
            ingredient.quantity_available
            < recipe.quantity_required
        ):

            menu_item.mark_unavailable()

            update_platter_availability_from_menu_item(
                menu_item
            )

            return

    menu_item.mark_available()

    update_platter_availability_from_menu_item(
        menu_item
    )

def update_platter_availability_from_menu_item(menu_item):

    for platter in menu_item.platter_items.select_related(
        "platter"
    ):

        update_platter_availability(
            platter.platter
        )

def update_platter_availability(platter):
    """
    Platter is available ONLY if:
    - it has items
    - ALL menu items inside it are available
    """

    platter_items = platter.items.select_related(
        "menu_item"
    ).all()

    # no items = unavailable
    if not platter_items.exists():
        platter.is_available = False
        platter.save(update_fields=["is_available"])
        return

    for platter_item in platter_items:

        if not platter_item.menu_item.is_available:
            platter.is_available = False
            platter.save(update_fields=["is_available"])
            return

    platter.is_available = True
    platter.save(update_fields=["is_available"])