from django.utils import timezone

def is_restaurant_active(restaurant):
    subscription = getattr(restaurant, "subscription", None)
    today = timezone.now().date()

    return (
        restaurant.is_active and
        subscription and
        subscription.is_active and
        subscription.starts_at <= today <= subscription.expires_at
    )