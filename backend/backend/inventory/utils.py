def update_menu_item_availability(menu_item):
    recipes = menu_item.ingredients.select_related('ingredient').all()

    # ❗ no recipe = unavailable
    if not recipes.exists():
        menu_item.mark_unavailable()
        return

    for recipe in recipes:
        ingredient = recipe.ingredient
        ingredient.refresh_from_db()

        if ingredient.quantity_available < recipe.quantity_required:
            menu_item.mark_unavailable()
            return

    menu_item.mark_available()