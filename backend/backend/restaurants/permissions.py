from rest_framework.permissions import BasePermission


class IsSameRestaurant(BasePermission):
    """
    Object-level permission:
    Super admin can access everything.
    Staff can only access objects belonging to their restaurant.
    """

    def has_object_permission(self, request, view, obj):
        # Super admin has full access
        if request.user.is_superuser:
            return True

        # User must have staff profile
        if not hasattr(request.user, "staff_profile"):
            return False

        user_restaurant = request.user.staff_profile.restaurant

        # Check object has restaurant field
        return hasattr(obj, "restaurant") and obj.restaurant == user_restaurant


class IsSuperAdmin(BasePermission):
    """
    Allows access only to superusers.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_superuser
        )


class HasStaffRole(BasePermission):
    """
    Base role permission for restaurant staff.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not hasattr(request.user, "staff_profile"):
            return False

        return request.user.staff_profile.role in self.allowed_roles


class IsRestaurantAdmin(HasStaffRole):
    allowed_roles = ["Admin"]


class IsCashier(HasStaffRole):
    allowed_roles = ["Cashier"]


class IsWaiter(HasStaffRole):
    allowed_roles = ["Waiter"]


class IsKitchenManager(HasStaffRole):
    allowed_roles = ["Kitchen_manager"]

from rest_framework.permissions import BasePermission
from django.utils import timezone

class IsRestaurantActive(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # superadmin bypass (optional)
        if user.is_superuser:
            return True

        if not hasattr(user, "staff_profile"):
            return False

        restaurant = user.staff_profile.restaurant

        if not restaurant.is_active:
            return False

        subscription = getattr(restaurant, "subscription", None)

        if not subscription:
            return False

        today = timezone.now().date()

        if not (
            subscription.is_active and
            subscription.starts_at <= today <= subscription.expires_at
        ):
            return False

        return True