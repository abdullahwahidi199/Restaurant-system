def update_menu_item_availability(menu_item):
    
    for recipe in menu_item.ingredients.select_related('ingredient').all():
        ingredient = recipe.ingredient

        if ingredient.quantity_available < recipe.quantity_required:
            menu_item.mark_unavailable()
            return

    menu_item.mark_available()
