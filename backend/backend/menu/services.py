# services.py or utils.py - Add this function
from .models import Production
def adjust_production_quantity(menu_item, action, amount, branch, staff=None):
    """
    Increment or decrement production for a menu item.
    
    Args:
        menu_item: MenuItem instance
        action: 'increment' (cook more) or 'decrement' (remove/waste)
        amount: Number of portions to add/remove
        staff: Staff profile who made the change
    
    Returns:
        Production instance
    """
    if action not in ['increment', 'decrement']:
        raise ValueError("Action must be 'increment' or 'decrement'")
    if not branch:
        raise ValueError("An active branch is required")

    production = menu_item.get_production(branch=branch)

    if action == 'increment':
        if production:
            production.quantity_produced += amount
            production.quantity_remaining += amount
            production.save()
        else:
            # Create new production
            production = Production.objects.create(
                menu_item=menu_item,
                restaurant=menu_item.restaurant,
                branch=branch,
                quantity_produced=amount,
                quantity_remaining=amount,
                created_by=staff
            )
    else:  # decrement
        if not production:
            raise ValueError("No active production to adjust")

        if production.quantity_remaining < amount:
            raise ValueError(
                f"Cannot remove {amount}. Only {production.quantity_remaining} remaining."
            )

        production.quantity_remaining -= amount
        production.save()

    return production
