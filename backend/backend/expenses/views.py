from django.db.models import Sum, Q
from django.utils import timezone
from decimal import Decimal
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Expenses, ExpenseHistory
from .serializers import ExpensesSerializer, ExpenseHistorySerializer
from restaurants.permissions import (
    IsRestaurantAdmin, IsSameRestaurant, IsRestaurantActive, IsInventoryManager,
)
from restaurants.branching import filter_queryset_for_request, get_active_branch


class ExpensePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


VALID_CURRENCIES = ["AFN", "USD"]
VALID_ACTIONS = ["created", "updated", "deleted"]
VALID_EXPENSE_SORTS = [
    "date", "-date", "name", "-name",
    "amount", "-amount", "amount_afn", "-amount_afn",
]


def _calc_expense_stats(queryset):
    """All-time aggregate stats for an Expenses queryset."""
    total_afn = queryset.aggregate(t=Sum("amount_afn"))["t"] or Decimal("0")
    total_usd = queryset.filter(currency="USD").aggregate(
        t=Sum("amount")
    )["t"] or Decimal("0")
    now = timezone.now()
    this_month = queryset.filter(
        date__year=now.year, date__month=now.month
    ).aggregate(t=Sum("amount_afn"))["t"] or Decimal("0")
    return {
        "total_count": queryset.count(),
        "total_afn": str(total_afn),
        "total_usd": str(total_usd),
        "this_month_afn": str(this_month),
    }


def _filter_expenses(queryset, params):
    """Apply common filters from query params to an Expenses queryset."""
    search = params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )

    currency = params.get("currency", "").strip()
    if currency in VALID_CURRENCIES:
        queryset = queryset.filter(currency=currency)

    date_from = params.get("date_from", "").strip()
    if date_from:
        queryset = queryset.filter(date__gte=date_from)

    date_to = params.get("date_to", "").strip()
    if date_to:
        queryset = queryset.filter(date__lte=date_to)

    return queryset


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdmin | IsInventoryManager, IsSameRestaurant, IsRestaurantActive])
def expensesApi(request):
    staff = request.user.staff_profile
    restaurant = staff.restaurant

    if request.method == "GET":
        base_qs = filter_queryset_for_request(
            request,
            Expenses.objects.filter(restaurant=restaurant),
            allow_all_for_admin=True,
        )

        # Stats are always all-time (independent of filters)
        stats = _calc_expense_stats(base_qs)

        # Apply user filters
        queryset = _filter_expenses(base_qs, request.query_params)

        # Sorting
        sort_by = request.query_params.get("sort_by", "-date")
        queryset = queryset.order_by(
            sort_by if sort_by in VALID_EXPENSE_SORTS else "-date"
        )

        # Pagination
        paginator = ExpensePagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = ExpensesSerializer(page, many=True)
            response = paginator.get_paginated_response(serializer.data)
            response.data["stats"] = stats
            return response

        serializer = ExpensesSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "next": None, "previous": None,
            "results": serializer.data,
            "stats": stats,
        })

    if request.method == "POST":
        serializer = ExpensesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant, branch=get_active_branch(request))
            return Response(
                {"message": "New Expense saved!"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = ExpensesSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager, IsSameRestaurant, IsRestaurantActive]
    lookup_field = "id"

    def get_queryset(self):
        staff = self.request.user.staff_profile
        return filter_queryset_for_request(
            self.request,
            Expenses.objects.filter(restaurant=staff.restaurant),
            allow_all_for_admin=True,
        )


class ExpenseHistoryApiView(generics.ListAPIView):
    serializer_class = ExpenseHistorySerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager, IsSameRestaurant, IsRestaurantActive]
    pagination_class = ExpensePagination

    def get_queryset(self):
        staff = self.request.user.staff_profile
        qs = filter_queryset_for_request(
            self.request,
            ExpenseHistory.objects.filter(restaurant=staff.restaurant),
            allow_all_for_admin=True,
        )

        action = self.request.query_params.get("action", "").strip()
        if action in VALID_ACTIONS:
            qs = qs.filter(action=action)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        date_from = self.request.query_params.get("date_from", "").strip()
        if date_from:
            qs = qs.filter(date_time__date__gte=date_from)

        date_to = self.request.query_params.get("date_to", "").strip()
        if date_to:
            qs = qs.filter(date_time__date__lte=date_to)

        return qs.order_by("-date_time")
