from rest_framework.permissions import BasePermission

class isStaffRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        try:
            staff = user.staff_profile
        except:
            return False
        allowed = getattr(view, 'allowed_roles', None)
        if allowed is None:
            # if view doesn't specify, default to authenticated staff
            return True
        return staff.role in allowed or (staff.custom_role and staff.custom_role in allowed)