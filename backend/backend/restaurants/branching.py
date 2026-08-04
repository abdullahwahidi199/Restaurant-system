from rest_framework.exceptions import PermissionDenied

from .models import Branch


BRANCH_HEADER = "HTTP_X_BRANCH_ID"
ALL_BRANCH_ACCESS_ROLES = {"Admin", "SuperAdmin"}
BRANCH_ADMIN_ROLE = "BranchAdmin"


def is_branch_admin(staff):
    return bool(staff and staff.role == BRANCH_ADMIN_ROLE)


def get_branch_admin_assigned_branch(staff):
    if not staff:
        return None
    return staff.get_or_set_active_branch()


def ensure_branch_admin_requested_assigned_branch(staff, requested_branch_id=None):
    assigned_branch = get_branch_admin_assigned_branch(staff)

    if requested_branch_id and (
        not assigned_branch or str(requested_branch_id) != str(assigned_branch.id)
    ):
        raise PermissionDenied("Branch Admins can only access their assigned branch.")

    return assigned_branch


def get_staff_profile(user):
    if not user or not user.is_authenticated:
        return None
    return getattr(user, "staff_profile", None)


def user_has_all_branch_access(user):
    staff = get_staff_profile(user)
    return bool(staff and staff.role in ALL_BRANCH_ACCESS_ROLES)


def get_user_branches(user):
    staff = get_staff_profile(user)
    if not staff:
        return Branch.objects.none()

    return staff.get_available_branches()


def get_main_branch(restaurant):
    if not restaurant:
        return None

    branch = restaurant.branches.filter(is_main_branch=True).first()
    if branch:
        return branch

    return restaurant.branches.create(
        name="Main Branch",
        code=f"MAIN-{restaurant.id}",
        address=restaurant.address or "",
        phone=restaurant.phone or "",
        email=restaurant.email or "",
        is_main_branch=True,
        is_active=True,
    )


def sync_all_branch_access_staff(restaurant):
    if not restaurant:
        return

    staff_queryset = restaurant.staff.filter(role__in=ALL_BRANCH_ACCESS_ROLES)
    active_branches = restaurant.branches.filter(is_active=True)
    for staff in staff_queryset:
        staff.branches.set(active_branches)
        if not staff.active_branch_id or not active_branches.filter(
            id=staff.active_branch_id
        ).exists():
            staff.active_branch = active_branches.first()
            staff.save(update_fields=["active_branch"])


def ensure_staff_branch_assignment(staff, requested_branches=None):
    if not staff or not staff.restaurant:
        return

    active_branches = staff.restaurant.branches.filter(is_active=True)

    if staff.role in ALL_BRANCH_ACCESS_ROLES:
        staff.branches.set(active_branches)
    elif is_branch_admin(staff):
        selected_branch = None

        if requested_branches is not None:
            requested_list = list(requested_branches)
            selected_branch = requested_list[0] if requested_list else None
            if selected_branch and not active_branches.filter(
                id=selected_branch.id,
            ).exists():
                selected_branch = None

        if not selected_branch and staff.active_branch_id:
            selected_branch = active_branches.filter(id=staff.active_branch_id).first()

        if not selected_branch:
            selected_branch = staff.branches.filter(
                is_active=True,
                restaurant=staff.restaurant,
            ).order_by("id").first()

        if not selected_branch:
            selected_branch = get_main_branch(staff.restaurant)

        if selected_branch:
            staff.branches.set([selected_branch])
    elif requested_branches is not None:
        staff.branches.set(requested_branches)
    elif not staff.branches.filter(is_active=True, restaurant=staff.restaurant).exists():
        main_branch = get_main_branch(staff.restaurant)
        if main_branch:
            staff.branches.add(main_branch)

    available_branches = staff.get_available_branches()
    if not staff.active_branch_id or not available_branches.filter(
        id=staff.active_branch_id
    ).exists():
        staff.active_branch = available_branches.first()
        staff.save(update_fields=["active_branch"])


def get_active_branch(request, *, raise_exception=True):
    staff = get_staff_profile(request.user)
    if not staff:
        if raise_exception:
            raise PermissionDenied("No staff profile found for this user.")
        return None

    branch_id = request.META.get(BRANCH_HEADER) or request.headers.get("X-Branch-ID")

    if is_branch_admin(staff):
        branch = ensure_branch_admin_requested_assigned_branch(staff, branch_id)
        if not branch and raise_exception:
            raise PermissionDenied("No active branch is assigned to this user.")
        request.active_branch = branch
        return branch

    branch = None

    if branch_id:
        try:
            branch = Branch.objects.get(
                id=branch_id,
                restaurant=staff.restaurant,
                is_active=True,
            )
        except (Branch.DoesNotExist, ValueError):
            if raise_exception:
                raise PermissionDenied("Invalid active branch.")
            branch = None

        if branch and not staff.can_access_branch(branch):
            if raise_exception:
                raise PermissionDenied("You do not have access to this branch.")
            branch = None

        if branch and staff.active_branch_id != branch.id:
            staff.active_branch = branch
            staff.save(update_fields=["active_branch"])

    if not branch:
        branch = staff.get_or_set_active_branch()

    if not branch and raise_exception:
        raise PermissionDenied("No active branch is assigned to this user.")

    request.active_branch = branch
    return branch


def set_active_branch(user, branch):
    staff = get_staff_profile(user)
    if not staff:
        raise PermissionDenied("No staff profile found for this user.")

    if is_branch_admin(staff):
        assigned_branch = ensure_branch_admin_requested_assigned_branch(
            staff,
            branch.id if branch else None,
        )
        staff.active_branch = assigned_branch
        staff.save(update_fields=["active_branch"])
        return assigned_branch

    if not staff.can_access_branch(branch):
        raise PermissionDenied("You do not have access to this branch.")

    staff.active_branch = branch
    staff.save(update_fields=["active_branch"])
    return branch


def get_requested_branch(request, *, allow_all=False, raise_exception=True):
    staff = get_staff_profile(request.user)
    if not staff:
        if raise_exception:
            raise PermissionDenied("No staff profile found for this user.")
        return None

    query_params = getattr(request, "query_params", request.GET)
    requested = (
        query_params.get("branch")
        or query_params.get("branch_id")
        or query_params.get("scope")
    )

    if is_branch_admin(staff):
        if requested and requested not in ("current", ""):
            if requested == "all":
                raise PermissionDenied(
                    "Branch Admins cannot request all branches."
                )
            return ensure_branch_admin_requested_assigned_branch(staff, requested)
        return get_active_branch(request, raise_exception=raise_exception)

    if allow_all and staff.has_all_branch_access and requested == "all":
        return None

    if requested and requested != "current":
        try:
            branch = Branch.objects.get(
                id=requested,
                restaurant=staff.restaurant,
                is_active=True,
            )
        except (Branch.DoesNotExist, ValueError):
            if raise_exception:
                raise PermissionDenied("Invalid branch.")
            return None

        if not staff.can_access_branch(branch):
            if raise_exception:
                raise PermissionDenied("You do not have access to this branch.")
            return None

        return branch

    return get_active_branch(request, raise_exception=raise_exception)


def filter_queryset_for_request(
    request,
    queryset,
    branch_field="branch",
    *,
    allow_all_for_admin=False,
):
    staff = get_staff_profile(request.user)
    if not staff:
        return queryset.none()

    branch = get_requested_branch(
        request,
        allow_all=allow_all_for_admin,
        raise_exception=False,
    )

    if branch:
        return queryset.filter(**{branch_field: branch})

    if allow_all_for_admin and staff.has_all_branch_access:
        return queryset.filter(**{f"{branch_field}__restaurant": staff.restaurant})

    return queryset.filter(**{f"{branch_field}__in": staff.get_available_branches()})


def filter_queryset_for_active_branch(request, queryset, branch_field="branch"):
    branch = get_active_branch(request)
    return queryset.filter(**{branch_field: branch})


def filter_queryset_for_user_branches(user, queryset, branch_field="branch"):
    staff = get_staff_profile(user)
    if not staff:
        return queryset.none()

    if staff.has_all_branch_access:
        return queryset.filter(**{f"{branch_field}__restaurant": staff.restaurant})

    return queryset.filter(**{f"{branch_field}__in": staff.get_available_branches()})


def object_belongs_to_active_branch(request, obj, branch_field="branch"):
    branch = getattr(obj, branch_field, None)
    if not branch:
        return False

    active_branch = get_active_branch(request, raise_exception=False)
    return bool(active_branch and branch.id == active_branch.id)


class BranchScopedQuerysetMixin:
    branch_field = "branch"

    def get_active_branch(self):
        return get_active_branch(self.request)

    def filter_by_active_branch(self, queryset):
        return filter_queryset_for_active_branch(
            self.request,
            queryset,
            self.branch_field,
        )
