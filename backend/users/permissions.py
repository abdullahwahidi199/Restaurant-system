from rest_framework.permissions import BasePermission


class IsSameRestaurant(BasePermission):
    """
    Object-level permission:
    Staff can only access objects belonging to their restaurant.
    Superuser can access everything.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if not user.is_authenticated:
            return False

        if not hasattr(user, "staff_profile"):
            return False

        staff = user.staff_profile

        # Direct restaurant field
        if hasattr(obj, "restaurant"):
            return obj.restaurant == staff.restaurant

        # Through staff relation
        if hasattr(obj, "staff"):
            return obj.staff.restaurant == staff.restaurant

        return False


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class HasStaffRole(BasePermission):
    allowed_roles = None   # None = any staff user

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if not hasattr(user, "staff_profile"):
            return False

        staff = user.staff_profile

        if self.allowed_roles is None:
            return True

        return (
            staff.role in self.allowed_roles or
            (staff.custom_role and staff.custom_role in self.allowed_roles)
        )

# ===== Specific Roles =====

class IsRestaurantAdmin(HasStaffRole):
    allowed_roles = ["Admin"]


class IsCashier(HasStaffRole):
    allowed_roles = ["Cashier"]


class IsWaiter(HasStaffRole):
    allowed_roles = ["Waiter"]


class IsKitchenManager(HasStaffRole):
    allowed_roles = ["Kitchen_manager"]


class IsDeliveryBoy(HasStaffRole):
    allowed_roles = ["DeliveryBoy"]

class HasActiveSubscription(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if user.is_superuser:
            return True

        if not hasattr(user, "staff_profile"):
            return False

        restaurant = user.staff_profile.restaurant

        if not restaurant:
            return False

        try:
            return restaurant.subscription.is_valid
        except:
            return False