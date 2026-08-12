from django.db.models import Q
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

from restaurants.branching import get_requested_branch
from restaurants.permissions import (
    IsFinanceManager,
    IsInventoryManager,
    IsOperationsManager,
    IsRestaurantActive,
    IsRestaurantAdmin,
    IsSameRestaurant,
    IsSuperAdmin,
)

from .constants import AuditAction, AuditModule
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    pagination_class = AuditLogPagination
    permission_classes = [
        IsSuperAdmin | IsRestaurantAdmin | IsInventoryManager | IsOperationsManager | IsFinanceManager,
        IsSameRestaurant,
        IsRestaurantActive,
    ]

    def get_queryset(self):
        user = self.request.user
        qs = AuditLog.objects.select_related(
            "restaurant",
            "branch",
            "user",
            "user__staff_profile",
        )

        if user.is_superuser:
            restaurant_id = self.request.query_params.get("restaurant")
            if restaurant_id:
                qs = qs.filter(restaurant_id=restaurant_id)
        else:
            staff = user.staff_profile
            qs = qs.filter(restaurant=staff.restaurant)
            branch = get_requested_branch(
                self.request,
                allow_all=True,
                raise_exception=False,
            )
            if branch:
                qs = qs.filter(branch=branch)
            elif not staff.has_all_branch_access:
                qs = qs.filter(branch__in=staff.get_available_branches())

        module = self.request.query_params.get("module")
        if module:
            module = module.upper()
            if module in AuditModule.values:
                qs = qs.filter(module=module)

        action = self.request.query_params.get("action")
        if action:
            action = action.upper()
            if action in AuditAction.values:
                qs = qs.filter(action=action)

        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        branch_id = self.request.query_params.get("branch") or self.request.query_params.get("branch_id")
        if branch_id and branch_id != "all":
            qs = qs.filter(branch_id=branch_id)

        object_type = self.request.query_params.get("object_type")
        if object_type:
            qs = qs.filter(object_type__iexact=object_type)

        object_id = self.request.query_params.get("object_id")
        if object_id:
            qs = qs.filter(object_id=str(object_id))

        start_date = self.request.query_params.get("start_date")
        if start_date:
            parsed = parse_datetime(start_date) or parse_date(start_date)
            if parsed:
                qs = qs.filter(created_at__date__gte=parsed if not hasattr(parsed, "date") else parsed.date())

        end_date = self.request.query_params.get("end_date")
        if end_date:
            parsed = parse_datetime(end_date) or parse_date(end_date)
            if parsed:
                qs = qs.filter(created_at__date__lte=parsed if not hasattr(parsed, "date") else parsed.date())

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(description__icontains=search)
                | Q(object_repr__icontains=search)
                | Q(object_type__icontains=search)
                | Q(object_id__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__staff_profile__name__icontains=search)
            )

        ordering = self.request.query_params.get("ordering", "newest")
        return qs.order_by("created_at", "id") if ordering == "oldest" else qs.order_by("-created_at", "-id")

