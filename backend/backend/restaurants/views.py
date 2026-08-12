from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.cache import cache
from django.db.models import Prefetch
from django.utils import timezone
from .branching import get_active_branch, set_active_branch
from .data_migration import MIGRATION_TYPES, run_branch_data_migration
from .enterprise import BRANCH_SETTING_FIELDS
from .models import Branch, BranchDataMigrationLog, Restaurant, Subscription
from .serializers import (
    BranchDataMigrationLogSerializer,
    BranchSerializer,
    PublicBranchSerializer,
    PublicRestaurantSerializer,
    RestaurantSerializer,
    SubscriptionSerializer,
)
from .permissions import (
    IsSuperAdmin,
    IsRestaurantAdmin,
    IsSameRestaurant,
    IsRestaurantActive,
    IsRestaurantOwnerOrAdmin,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import parser_classes

from django.shortcuts import get_object_or_404
from audit.constants import AuditAction, AuditModule
from audit.services import (
    actor_name,
    calculate_field_changes,
    changed_new_values,
    changed_old_values,
    create_audit_log,
    record_instance_create,
    record_instance_delete,
    record_instance_update,
    snapshot_instance,
)
# --- RESTAURANT VIEWS ---

RESTAURANT_AUDIT_FIELDS = [
    "name",
    "email",
    "phone",
    "address",
    "logo",
    "cover_image",
    "slogan",
    "is_active",
    "manager_discount_limit",
    "admin_discount_limit",
    "website",
    "opening_hours",
    "facebook",
    "instagram",
    "x",
    "delivery_available",
    "base_delivery_fee",
    "price_per_km",
    "min_order_amount",
    "latitude",
    "longitude",
    "delivery_radius_km",
]

BRANCH_AUDIT_FIELDS = [
    "name",
    "code",
    "address",
    "phone",
    "email",
    "latitude",
    "longitude",
    "receipt_header",
    "receipt_footer",
    "tax_rate",
    "service_charge_rate",
    "kitchen_printer",
    "opening_hours",
    "delivery_available",
    "delivery_radius_km",
    "base_delivery_fee",
    "price_per_km",
    "min_order_amount",
    "cash_drawer_enabled",
    "cash_drawer_name",
    "logo",
    "settings",
    "is_main_branch",
    "is_active",
]

# GET (List) & POST (Create) using @api_view
@api_view(['GET', 'POST'])
@permission_classes([IsSuperAdmin])
@parser_classes([MultiPartParser, FormParser])  
def restaurant_list_create(request):
    if request.method == 'GET':
        restaurants = Restaurant.objects.all()
        serializer = RestaurantSerializer(restaurants, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RestaurantSerializer(data=request.data)
        if serializer.is_valid():
            restaurant = serializer.save()
            record_instance_create(
                request=request,
                instance=restaurant,
                module=AuditModule.RESTAURANT,
                fields=RESTAURANT_AUDIT_FIELDS,
                description=f"{actor_name(request)} created restaurant {restaurant.name}.",
                severity="CRITICAL",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# GET (Retrieve), PUT/PATCH (Update), DELETE using RetrieveUpdateDestroyAPIView
class RestaurantDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsSuperAdmin]

    def update(self, request, *args, **kwargs):
        restaurant = self.get_object()
        old_values = snapshot_instance(restaurant, fields=RESTAURANT_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        restaurant.refresh_from_db()
        record_instance_update(
            request=request,
            instance=restaurant,
            old_values=old_values,
            module=AuditModule.RESTAURANT,
            fields=RESTAURANT_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated restaurant {restaurant.name}.",
            severity="CRITICAL" if old_values.get("is_active") != restaurant.is_active else "WARNING",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        restaurant = self.get_object()
        record_instance_delete(
            request=request,
            instance=restaurant,
            module=AuditModule.RESTAURANT,
            fields=RESTAURANT_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted restaurant {restaurant.name}.",
            severity="CRITICAL",
        )
        return super().destroy(request, *args, **kwargs)


# --- SUBSCRIPTION VIEWS ---

# GET (List) & POST (Create) using @api_view
@api_view(['GET', 'POST'])
@permission_classes([IsSuperAdmin])
def subscription_list_create(request):
    if request.method == 'GET':
        subscriptions = Subscription.objects.all()
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# GET (Retrieve), PUT/PATCH (Update), DELETE using RetrieveUpdateDestroyAPIView
class SubscriptionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsSuperAdmin]


def get_user_restaurant(user):
    return user.staff_profile.restaurant


def get_staff_profile_or_404(user):
    staff = getattr(user, "staff_profile", None)
    if not staff or not staff.restaurant:
        return None
    return staff


def is_owner_or_admin(staff):
    return staff and staff.role in ["Admin", "SuperAdmin"]


def can_manage_branch_migrations(staff):
    return staff and staff.role in ["Admin", "SuperAdmin"]


PUBLIC_RESTAURANT_CACHE_SECONDS = 60


def is_public_restaurant_active(restaurant):
    subscription = getattr(restaurant, "subscription", None)
    today = timezone.now().date()

    return (
        restaurant.is_active
        and subscription
        and subscription.is_active
        and subscription.starts_at <= today <= subscription.expires_at
    )


def active_public_branch_queryset():
    return Branch.objects.select_related("restaurant").filter(
        is_active=True,
    ).order_by("-is_main_branch", "name")


def get_public_restaurant_or_404(restaurant_slug):
    cache_key = f"public_restaurant_entry:{restaurant_slug}"
    restaurant = cache.get(cache_key)

    if restaurant is None:
        restaurant = get_object_or_404(
            Restaurant.objects.select_related("subscription").prefetch_related(
                Prefetch("branches", queryset=active_public_branch_queryset())
            ),
            slug=restaurant_slug,
        )
        cache.set(cache_key, restaurant, PUBLIC_RESTAURANT_CACHE_SECONDS)

    if not is_public_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    return restaurant


def get_prefetched_active_branches(restaurant):
    prefetched = getattr(restaurant, "_prefetched_objects_cache", {})
    if "branches" in prefetched:
        return list(prefetched["branches"])
    return list(active_public_branch_queryset().filter(restaurant=restaurant))


@api_view(["GET"])
@permission_classes([AllowAny])
def public_restaurant_entry(request, restaurant_slug):
    restaurant = get_public_restaurant_or_404(restaurant_slug)
    branches = get_prefetched_active_branches(restaurant)

    if len(branches) == 1:
        mode = "single_branch"
        redirect_to = branches[0].get_public_path()
    elif len(branches) > 1:
        mode = "multi_branch"
        redirect_to = None
    else:
        mode = "unavailable"
        redirect_to = None

    return Response(
        {
            "mode": mode,
            "redirect_to": redirect_to,
            "restaurant": PublicRestaurantSerializer(
                restaurant,
                context={"request": request},
            ).data,
            "branches": PublicBranchSerializer(
                branches,
                many=True,
                context={"request": request},
            ).data,
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def public_restaurant_branches(request, restaurant_slug):
    restaurant = get_public_restaurant_or_404(restaurant_slug)
    branches = get_prefetched_active_branches(restaurant)

    return Response(
        {
            "restaurant": PublicRestaurantSerializer(
                restaurant,
                context={"request": request},
            ).data,
            "branches": PublicBranchSerializer(
                branches,
                many=True,
                context={"request": request},
            ).data,
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def public_branch_detail(request, restaurant_slug, branch_slug):
    restaurant = get_public_restaurant_or_404(restaurant_slug)
    branch = get_object_or_404(
        Branch.objects.select_related("restaurant").filter(
            restaurant=restaurant,
            slug=branch_slug,
            is_active=True,
        )
    )

    return Response(
        {
            "restaurant": PublicRestaurantSerializer(
                restaurant,
                context={"request": request},
            ).data,
            "branch": PublicBranchSerializer(
                branch,
                context={"request": request},
            ).data,
        }
    )


def branch_context_response(request, active_branch=None):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if active_branch is None:
        active_branch = get_active_branch(request, raise_exception=False)
    branches = staff.get_available_branches().select_related("restaurant")

    return Response(
        {
            "active_branch": (
                BranchSerializer(active_branch).data if active_branch else None
            ),
            "branches": BranchSerializer(branches, many=True).data,
            "restaurant_modes": {
                "menu_mode": "separate",
                "ingredient_mode": "separate",
                "recipe_mode": "separate",
                "pricing_mode": "branch",
            },
            "requires_selection": staff.can_switch_branches and branches.count() > 1,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsRestaurantActive])
def branch_list_create(request):
    staff = get_staff_profile_or_404(request.user)
    
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        include_inactive = request.query_params.get("include_inactive") == "true"
        if is_owner_or_admin(staff):
            branches = staff.restaurant.branches.select_related("restaurant").all()
            if not include_inactive:
                branches = branches.filter(is_active=True)
        else:
            branches = staff.get_available_branches().select_related("restaurant")

        subscription = getattr(staff.restaurant, "subscription", None)

        return Response({
            "branches": BranchSerializer(branches, many=True).data,
            "branch_limit": {
                "max_branches": subscription.max_branches if subscription else 0,
                "branches_used": branches.count(),
                "branches_remaining": (
                    subscription.max_branches - branches.count()
                    if subscription
                    else 0
                ),
            }
        })

    if not is_owner_or_admin(staff):
        return Response(
            {"detail": "Only restaurant owners/admins can create branches."},
            status=status.HTTP_403_FORBIDDEN,
        )
    
    subscription = getattr(staff.restaurant, "subscription", None)
    if subscription:
        current_branches = staff.restaurant.branches.count()

        if current_branches >= subscription.max_branches:
            return Response(
                {
                    "detail": (
                        f"This subscription allows only "
                        f"{subscription.max_branches} branches."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = BranchSerializer(
        data=request.data,
        context={"restaurant": staff.restaurant},
    )
    if serializer.is_valid():
        branch = serializer.save()
        record_instance_create(
            request=request,
            instance=branch,
            module=AuditModule.BRANCHES,
            fields=BRANCH_AUDIT_FIELDS,
            description=f"{actor_name(request)} created branch {branch.name}.",
            severity="WARNING",
        )
        branches = staff.restaurant.branches.all()

        return Response(
            {
                "branch": serializer.data,
                "branch_limit": {
                    "max_branches": subscription.max_branches if subscription else 0,
                    "branches_used": branches.count(),
                    "branches_remaining": (
                        subscription.max_branches - branches.count()
                        if subscription else 0
                    ),
                },
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsRestaurantActive])
def my_branches(request):
    return branch_context_response(request)


@api_view(["GET", "PATCH", "POST"])
@permission_classes([IsAuthenticated, IsRestaurantActive])
def active_branch_view(request):
    if request.method == "GET":
        return branch_context_response(request)

    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    branch_id = request.data.get("branch_id")
    if not branch_id:
        return Response(
            {"branch_id": "This field is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    branch = get_object_or_404(
        Branch,
        id=branch_id,
        restaurant=staff.restaurant,
        is_active=True,
    )
    set_active_branch(request.user, branch)
    return branch_context_response(request, active_branch=branch)


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsRestaurantActive])
def branch_detail(request, branch_id):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    branch = get_object_or_404(Branch, id=branch_id, restaurant=staff.restaurant)

    if request.method == "GET":
        if not staff.can_access_branch(branch):
            return Response(
                {"detail": "You do not have access to this branch."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(BranchSerializer(branch).data)

    if not is_owner_or_admin(staff):
        return Response(
            {"detail": "Only restaurant owners/admins can manage branches."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method in ["PATCH", "PUT"]:
        old_values = snapshot_instance(branch, fields=BRANCH_AUDIT_FIELDS)
        serializer = BranchSerializer(
            branch,
            data=request.data,
            partial=request.method == "PATCH",
            context={"restaurant": staff.restaurant},
        )
        if serializer.is_valid():
            branch = serializer.save()
            module = AuditModule.SETTINGS if set(request.data).issubset(set(BRANCH_SETTING_FIELDS)) else AuditModule.BRANCHES
            record_instance_update(
                request=request,
                instance=branch,
                old_values=old_values,
                module=module,
                fields=BRANCH_AUDIT_FIELDS,
                description=f"{actor_name(request)} updated branch {branch.name}.",
                severity="WARNING",
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    old_values = snapshot_instance(branch, fields=BRANCH_AUDIT_FIELDS)
    branch_name = branch.name
    branch_id_for_log = branch.id
    try:
        branch.delete()
    except DjangoValidationError as exc:
        return Response(
            {"detail": exc.messages if hasattr(exc, "messages") else str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    create_audit_log(
        request=request,
        restaurant=staff.restaurant,
        branch=None,
        action=AuditAction.DELETE,
        module=AuditModule.BRANCHES,
        object_type="Branch",
        object_id=branch_id_for_log,
        object_repr=branch_name,
        description=f"{actor_name(request)} deleted branch {branch_name}.",
        old_values=old_values,
        metadata={"severity": "CRITICAL"},
    )
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])
def branch_regenerate_qr(request, branch_id):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    branch = get_object_or_404(Branch, id=branch_id, restaurant=staff.restaurant)
    branch.regenerate_qr_code(force=True)
    create_audit_log(
        request=request,
        restaurant=staff.restaurant,
        branch=branch,
        action=AuditAction.CONFIG_CHANGE,
        module=AuditModule.SETTINGS,
        object_type="Branch",
        object_id=branch.id,
        object_repr=branch.name,
        description=f"{actor_name(request)} regenerated QR code for branch {branch.name}.",
        metadata={"severity": "INFO", "setting": "branch_qr_code"},
    )
    return Response(BranchSerializer(branch, context={"request": request}).data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])
def enterprise_settings(request):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        return Response(
            {
                "menu_mode": "separate",
                "ingredient_mode": "separate",
                "recipe_mode": "separate",
                "pricing_mode": "branch",
                "detail": "Menu sharing has been removed. Branches use independent data.",
            }
        )

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        {
            "menu_mode": "separate",
            "ingredient_mode": "separate",
            "recipe_mode": "separate",
            "pricing_mode": "branch",
            "detail": "Menu sharing has been removed. Use branch data migration instead.",
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantAdmin])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def active_branch_settings(request):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    branch = get_active_branch(request)
    if request.method == "GET":
        return Response(BranchSerializer(branch).data)

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    allowed_fields = set(BRANCH_SETTING_FIELDS)
    data = {
        field: request.data[field]
        for field in allowed_fields
        if field in request.data
    }
    if "logo" in data and not hasattr(data["logo"], "read"):
        data.pop("logo")

    serializer = BranchSerializer(
        branch,
        data=data,
        partial=True,
        context={"restaurant": staff.restaurant},
    )
    if serializer.is_valid():
        old_values = snapshot_instance(branch, fields=BRANCH_AUDIT_FIELDS)
        branch = serializer.save()
        record_instance_update(
            request=request,
            instance=branch,
            old_values=old_values,
            module=AuditModule.SETTINGS,
            fields=BRANCH_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated active branch settings for {branch.name}.",
            severity="WARNING",
        )
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsRestaurantActive])
def branch_data_migrations(request):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not can_manage_branch_migrations(staff):
        return Response(
            {"detail": "You do not have permission to migrate branch data."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        logs = BranchDataMigrationLog.objects.filter(
            restaurant=staff.restaurant,
        ).select_related(
            "source_branch",
            "destination_branch",
            "created_by",
        )[:50]
        return Response(BranchDataMigrationLogSerializer(logs, many=True).data)

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    destination_branch = get_active_branch(request, raise_exception=False)
    source_branch_id = request.data.get("source_branch_id")
    migration_type = request.data.get("migration_type", "everything")

    if not destination_branch:
        return Response(
            {"detail": "No active destination branch is assigned to this user."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not source_branch_id:
        return Response(
            {"source_branch_id": "Source branch is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if migration_type not in MIGRATION_TYPES:
        return Response(
            {"migration_type": "Invalid migration type."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    source_branch = get_object_or_404(
        Branch,
        id=source_branch_id,
        restaurant=staff.restaurant,
        is_active=True,
    )

    try:
        log = run_branch_data_migration(
            source_branch=source_branch,
            destination_branch=destination_branch,
            migration_type=migration_type,
            created_by=staff,
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    create_audit_log(
        request=request,
        restaurant=staff.restaurant,
        branch=destination_branch,
        action=AuditAction.MIGRATION,
        module=AuditModule.MIGRATIONS,
        object_type="BranchDataMigrationLog",
        object_id=log.id,
        object_repr=str(log),
        description=(
            f"{actor_name(request)} migrated {migration_type} from "
            f"{source_branch.name} to {destination_branch.name}."
        ),
        new_values={
            "source_branch": source_branch.name,
            "destination_branch": destination_branch.name,
            "migration_type": migration_type,
            "imported_count": log.imported_count,
            "skipped_count": log.skipped_count,
            "failed_count": log.failed_count,
            "status": log.status,
        },
        metadata={"severity": "WARNING"},
    )
    return Response(BranchDataMigrationLogSerializer(log).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])
def branch_copy(request, branch_id):
    staff = get_staff_profile_or_404(request.user)
    if not staff:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if staff.is_demo:
        return Response(
            {"detail": "Action restricted in demo mode."},
            status=status.HTTP_403_FORBIDDEN,
        )

    target_branch = get_object_or_404(
        Branch,
        id=branch_id,
        restaurant=staff.restaurant,
    )
    source_branch = get_object_or_404(
        Branch,
        id=request.data.get("source_branch_id"),
        restaurant=staff.restaurant,
    )

    migration_type = request.data.get("migration_type") or "everything"
    try:
        log = run_branch_data_migration(
            source_branch=source_branch,
            destination_branch=target_branch,
            migration_type=migration_type,
            created_by=staff,
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    create_audit_log(
        request=request,
        restaurant=staff.restaurant,
        branch=target_branch,
        action=AuditAction.MIGRATION,
        module=AuditModule.MIGRATIONS,
        object_type="BranchDataMigrationLog",
        object_id=log.id,
        object_repr=str(log),
        description=(
            f"{actor_name(request)} copied {migration_type} branch data from "
            f"{source_branch.name} to {target_branch.name}."
        ),
        new_values={
            "source_branch": source_branch.name,
            "destination_branch": target_branch.name,
            "migration_type": migration_type,
            "imported_count": log.imported_count,
            "skipped_count": log.skipped_count,
            "failed_count": log.failed_count,
            "status": log.status,
        },
        metadata={"severity": "WARNING"},
    )
    return Response(
        {
            "detail": "Branch data migrated.",
            "migration": BranchDataMigrationLogSerializer(log).data,
        }
    )

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantOwnerOrAdmin,IsRestaurantActive])
@parser_classes([MultiPartParser, FormParser])
def restaurant_detail(request):
    

    try:
        restaurant = get_user_restaurant(request.user)
    except Exception:
        return Response(
            {"detail": "Restaurant not found for this user."},
            status=status.HTTP_404_NOT_FOUND
        )

    
    if request.method == 'GET':
        serializer = RestaurantSerializer(restaurant)
        return Response(serializer.data)


    

 
    if request.method == 'PATCH':
        old_values = snapshot_instance(restaurant, fields=RESTAURANT_AUDIT_FIELDS)
        serializer = RestaurantSerializer(
            restaurant,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            restaurant = serializer.save()
            record_instance_update(
                request=request,
                instance=restaurant,
                old_values=old_values,
                module=AuditModule.SETTINGS,
                fields=RESTAURANT_AUDIT_FIELDS,
                description=f"{actor_name(request)} updated restaurant settings for {restaurant.name}.",
                severity="WARNING",
            )
            return Response(serializer.data)

        return Response(
            serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
        

@api_view(['POST'])
@permission_classes([IsSuperAdmin])
def disable_subscription(request, restaurant_id):
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)

    subscription = getattr(restaurant, "subscription", None)

    if subscription:
        subscription.is_active = False
        subscription.save()

    restaurant.is_active = False
    restaurant.save()

    return Response(
        {"detail": "Restaurant and subscription disabled successfully."},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_restaurant(request):
    # 🚫 Superuser should not access this endpoint
    if request.user.is_superuser:
        return Response(
            {"detail": "Superuser does not have a restaurant."},
            status=403
        )

    if not hasattr(request.user, "staff_profile") or not request.user.staff_profile.restaurant:
        return Response(
            {"detail": "No restaurant assigned to this user."},
            status=404
        )

    restaurant = request.user.staff_profile.restaurant
    subscription = getattr(restaurant, "subscription", None)
    active_branch = get_active_branch(request, raise_exception=False)
    branches = request.user.staff_profile.get_available_branches()

    return Response({
        "id": restaurant.id,
        "name": restaurant.name,
        "logo": restaurant.logo.url if restaurant.logo else None,
        "cover_image": restaurant.cover_image.url if restaurant.cover_image else None,
        "is_active": restaurant.is_active,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "menu_mode": "separate",
        "ingredient_mode": "separate",
        "recipe_mode": "separate",
        "pricing_mode": "branch",
        "subscription": {
            "is_active": subscription.is_active if subscription else False,
            "is_valid": subscription.is_valid if subscription else False,
            "expires_at": subscription.expires_at if subscription else None,
            "days_left": subscription.days_left if subscription else None,
            "is_expiring_soon": subscription.is_expiring_soon if subscription else False,
        },
        "active_branch": BranchSerializer(active_branch).data if active_branch else None,
        "branches": BranchSerializer(branches, many=True).data,
    })
