from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics

from restaurants.models import Restaurant
from .models import Category,MenuItem,Review,PlatterItem,Platter,Production,Station
from .serializers import CategorySerializer,MenuItemSerializer,ReveiwSerializer,StationSerializer,PlatterSerializer,ProductionSerializer
from reports.models import Notification
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS
from rest_framework.decorators import permission_classes
from restaurants.permissions import IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin,IsKitchenManager,IsInventoryManager,IsOperationsManager
from django.shortcuts import get_object_or_404
from restaurants.branching import filter_queryset_for_request, get_active_branch
from django.db.models import Prefetch, Q

from .production_utils import (
    create_or_replace_production,
    adjust_production,
    clear_production,
    increment_production,
    decrement_production
)
from django.utils import timezone
from rest_framework.exceptions import NotFound
from .permissions import is_restaurant_active
from audit.constants import AuditModule
from audit.services import (
    actor_name,
    record_instance_create,
    record_instance_delete,
    record_instance_update,
    snapshot_instance,
)

CATEGORY_AUDIT_FIELDS = [
    "name",
    "name_dari",
    "name_pashto",
    "description",
    "rank",
    "branch",
]

MENU_ITEM_AUDIT_FIELDS = [
    "name",
    "name_dari",
    "name_pashto",
    "description",
    "price",
    "is_available",
    "is_manually_available",
    "category",
    "station",
    "uses_daily_production",
    "branch",
]

PLATTER_AUDIT_FIELDS = [
    "name",
    "name_dari",
    "name_pashto",
    "description",
    "price",
    "is_available",
    "is_manually_available",
    "category",
    "station",
    "branch",
]

STATION_AUDIT_FIELDS = [
    "name",
    "name_dari",
    "name_pashto",
    "description",
    "is_default",
    "is_active",
    "branch",
]


class CanReadOrManageMenu(BasePermission):
    read_roles = {
        "Admin",
        "BranchAdmin",
        "InventoryManager",
        "Manager",
        "Cashier",
        "Waiter",
        "Kitchen_manager",
        "Call_operator",
        "OperationsManager"
    }
    write_roles = {"Admin", "BranchAdmin", "InventoryManager","OperationsManager"}

    def has_permission(self, request, view):
        staff = getattr(request.user, "staff_profile", None)
        if not staff:
            return False

        if request.method in SAFE_METHODS:
            return staff.role in self.read_roles

        return staff.role in self.write_roles


def get_menu_scope_branch(request, restaurant):
    return get_active_branch(request)


def filter_menu_queryset(request, queryset, restaurant):
    branch = get_menu_scope_branch(request, restaurant)
    if branch:
        return queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
    return queryset.filter(branch__isnull=True)


def filter_public_menu_queryset(queryset, branch):
    if branch:
        return queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
    return queryset.filter(branch__isnull=True)


def get_public_menu_branch(restaurant, branch_slug=None):
    active_branches = restaurant.branches.filter(is_active=True)
    if branch_slug:
        return get_object_or_404(active_branches, slug=branch_slug)

    return (
        active_branches.filter(is_main_branch=True).first()
        or active_branches.order_by("-is_main_branch", "name").first()
    )


def get_public_menu_context(restaurant_slug, branch_slug=None):
    restaurant = get_object_or_404(
        Restaurant.objects.select_related("subscription"),
        slug=restaurant_slug,
    )

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    branch = get_public_menu_branch(restaurant, branch_slug)
    if not branch:
        raise NotFound("Branch not found")

    return restaurant, branch


def public_menu_item_queryset(restaurant, branch):
    return filter_public_menu_queryset(
        MenuItem.objects.filter(restaurant=restaurant),
        branch,
    ).select_related(
        "category",
    ).prefetch_related(
        "reviews",
        "ingredients__ingredient",
        "productions",
    )


def public_platter_queryset(restaurant, branch):
    return filter_public_menu_queryset(
        Platter.objects.filter(restaurant=restaurant),
        branch,
    ).select_related(
        "category",
    ).prefetch_related(
        "items__menu_item",
        "items__menu_item__productions",
    )


def get_category_menu_prefetches(restaurant, branch):
    return (
        Prefetch(
            "menu_items",
            queryset=public_menu_item_queryset(restaurant, branch),
        ),
        Prefetch(
            "platters",
            queryset=public_platter_queryset(restaurant, branch),
        ),
    )


@api_view(['GET', 'POST'])
@permission_classes([IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu])
def category_list_create(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    if request.method == 'GET':
        branch = get_active_branch(request, raise_exception=False)
        categories = filter_menu_queryset(
            request,
            Category.objects.filter(restaurant=restaurant),
            restaurant,
        ).prefetch_related(*get_category_menu_prefetches(restaurant, branch)).all()
        serializer = CategorySerializer(
            categories,
            many=True,
            context={"request": request, "branch": branch},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer = CategorySerializer(
            data=request.data,
            context={
                "request": request,
                "restaurant": restaurant,
                "branch": get_active_branch(request, raise_exception=False),
            },
        )
        if serializer.is_valid():
            category = serializer.save(
                restaurant=restaurant,
                branch=get_menu_scope_branch(request, restaurant),
            )
            record_instance_create(
                request=request,
                instance=category,
                module=AuditModule.MENU,
                fields=CATEGORY_AUDIT_FIELDS,
                description=f"{actor_name(request)} created menu category {category.name}.",
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        branch = get_active_branch(self.request, raise_exception=False)
        return filter_menu_queryset(
            self.request,
            Category.objects.filter(restaurant=restaurant),
            restaurant,
        ).prefetch_related(*get_category_menu_prefetches(restaurant, branch))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        category = self.get_object()
        old_values = snapshot_instance(category, fields=CATEGORY_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        category.refresh_from_db()
        record_instance_update(
            request=request,
            instance=category,
            old_values=old_values,
            module=AuditModule.MENU,
            fields=CATEGORY_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated menu category {category.name}.",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        category = self.get_object()
        record_instance_delete(
            request=request,
            instance=category,
            module=AuditModule.MENU,
            fields=CATEGORY_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted menu category {category.name}.",
        )
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])
@permission_classes([IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu])
def menu_item_list_create_view(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    if request.method=="GET":
        menu_items=filter_menu_queryset(
            request,
            MenuItem.objects.filter(restaurant=restaurant),
            restaurant,
        ).prefetch_related('reviews').prefetch_related('ingredients').select_related('category').all()
        serializer=MenuItemSerializer(
            menu_items,
            many=True,
            context={"request": request, "branch": get_active_branch(request, raise_exception=False)},
        )
        return Response(serializer.data)
    elif request.method=="POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer=MenuItemSerializer(
            data=request.data,
            context={
                "request": request,
                "restaurant": restaurant,
                "branch": get_active_branch(request, raise_exception=False),
            },
        )
        if serializer.is_valid():
            menu_item = serializer.save(
                restaurant=restaurant,
                branch=get_menu_scope_branch(request, restaurant),
            )
            record_instance_create(
                request=request,
                instance=menu_item,
                module=AuditModule.MENU,
                fields=MENU_ITEM_AUDIT_FIELDS,
                description=f"{actor_name(request)} created menu item {menu_item.name}.",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET", "POST"])
@permission_classes([IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu])
def station_list_create(request):
    staff = request.user.staff_profile
    restaurant = staff.restaurant

    if request.method == "GET":
        stations = filter_menu_queryset(
            request,
            Station.objects.filter(restaurant=restaurant),
            restaurant,
        ).order_by("name")

        serializer = StationSerializer(
            stations,
            many=True,
            context={
                "request": request,
                "branch": get_active_branch(request, raise_exception=False),
            },
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        if staff.is_demo:
            return Response(
                {"detail": "Action is restricted in demo mode"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StationSerializer(
            data=request.data,
            context={
                "request": request,
                "restaurant": restaurant,
                "branch": get_active_branch(request, raise_exception=False),
            },
        )

        if serializer.is_valid():
            station = serializer.save(
                restaurant=restaurant,
                branch=get_menu_scope_branch(request, restaurant),
            )
            record_instance_create(
                request=request,
                instance=station,
                module=AuditModule.KITCHEN_CONFIG,
                fields=STATION_AUDIT_FIELDS,
                description=f"{actor_name(request)} created kitchen station {station.name}.",
                severity="WARNING",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StationSerializer
    permission_classes = [
        IsSameRestaurant,
        IsRestaurantActive,
        CanReadOrManageMenu,
    ]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant

        return filter_menu_queryset(
            self.request,
            Station.objects.filter(restaurant=restaurant),
            restaurant,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(
            self.request,
            raise_exception=False,
        )
        return context

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response(
                {"detail": "Action restricted in demo mode."},
                status=status.HTTP_403_FORBIDDEN,
            )

        station = self.get_object()
        old_values = snapshot_instance(station, fields=STATION_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        station.refresh_from_db()
        record_instance_update(
            request=request,
            instance=station,
            old_values=old_values,
            module=AuditModule.KITCHEN_CONFIG,
            fields=STATION_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated kitchen station {station.name}.",
            severity="WARNING",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response(
                {"detail": "Action restricted in demo mode."},
                status=status.HTTP_403_FORBIDDEN,
            )

        station = self.get_object()
        record_instance_delete(
            request=request,
            instance=station,
            module=AuditModule.KITCHEN_CONFIG,
            fields=STATION_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted kitchen station {station.name}.",
            severity="WARNING",
        )
        return super().destroy(request, *args, **kwargs)
from rest_framework.parsers import MultiPartParser, FormParser

class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu]

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return filter_menu_queryset(
            self.request,
            MenuItem.objects.filter(restaurant=restaurant),
            restaurant,
        ).prefetch_related('reviews')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def update(self, request, *args, **kwargs):
        print(request.data)   # DEBUG

        if request.user.staff_profile.is_demo:
            return Response(
                {'detail': 'Action restricted in demo mode.'},
                status=403
            )

        menu_item = self.get_object()
        old_values = snapshot_instance(menu_item, fields=MENU_ITEM_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        menu_item.refresh_from_db()
        record_instance_update(
            request=request,
            instance=menu_item,
            old_values=old_values,
            module=AuditModule.MENU,
            fields=MENU_ITEM_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated menu item {menu_item.name}.",
            severity="WARNING" if old_values.get("price") != str(menu_item.price) else "INFO",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        menu_item = self.get_object()
        record_instance_delete(
            request=request,
            instance=menu_item,
            module=AuditModule.MENU,
            fields=MENU_ITEM_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted menu item {menu_item.name}.",
            severity="WARNING",
        )
        return super().destroy(request, *args, **kwargs)



@api_view(['GET', "POST"])
@permission_classes([IsSameRestaurant,IsRestaurantActive])
def review_list_create(request):
    

    if request.method == "GET":
        restaurant = getattr(request.user, 'staff_profile', None)
        restaurant = restaurant.restaurant if restaurant else None
        reviews = filter_queryset_for_request(
            request,
            Review.objects.filter(
                restaurant=restaurant
            ),
            allow_all_for_admin=True,
        ).select_related('customer', 'menu_item', 'delivery')

        serializer = ReveiwSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        
        serializer = ReveiwSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                restaurant=request.user.staff_profile.restaurant,
                branch=get_active_branch(request),
            )
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def send_review(request, slug=None, restaurant_slug=None, branch_slug=None):
    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    menu_item_id = request.data.get("menu_item")
    if menu_item_id:
        get_object_or_404(
            public_menu_item_queryset(restaurant, branch),
            id=menu_item_id,
        )

    serializer = ReveiwSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(restaurant=restaurant, branch=branch)
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)

class ReviewRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReveiwSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        restaurant = getattr(self.request.user, 'staff_profile', None)
        restaurant = restaurant.restaurant if restaurant else None

        return filter_queryset_for_request(
            self.request,
            Review.objects.filter(
                restaurant=restaurant
            ),
            allow_all_for_admin=True,
        ).select_related('customer', 'menu_item')
    


@api_view(['GET'])
@permission_classes([AllowAny])
def public_categories(request, slug=None, restaurant_slug=None, branch_slug=None):
    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    categories = filter_public_menu_queryset(
        Category.objects.filter(restaurant=restaurant),
        branch,
    ).prefetch_related(*get_category_menu_prefetches(restaurant, branch))

    serializer = CategorySerializer(
        categories,
        many=True,
        context={"branch": branch, "restaurant": restaurant},
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_items(request, slug=None, restaurant_slug=None, branch_slug=None):
    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    menu_items = public_menu_item_queryset(restaurant, branch)

    serializer = MenuItemSerializer(
        menu_items,
        many=True,
        context={"branch": branch, "restaurant": restaurant},
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_item_detail(request, pk, slug=None, restaurant_slug=None, branch_slug=None):
    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    item = get_object_or_404(
        public_menu_item_queryset(restaurant, branch),
        pk=pk,
    )

    serializer = MenuItemSerializer(
        item,
        context={"branch": branch, "restaurant": restaurant},
    )
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([
    IsSameRestaurant,
    IsRestaurantActive,
    CanReadOrManageMenu,
])
def platter_list_create_view(request):

    staff = request.user.staff_profile
    restaurant = staff.restaurant

    # GET
    if request.method == "GET":

        platters = filter_menu_queryset(
            request,
            Platter.objects.filter(restaurant=restaurant),
            restaurant,
        ).select_related(
            'category'
        ).prefetch_related(
            'items',
            'items__menu_item'
        )

        serializer = PlatterSerializer(
            platters,
            many=True,
            context={"request": request, "branch": get_active_branch(request, raise_exception=False)},
        )

        return Response(serializer.data)

    # POST
    elif request.method == "POST":

        if request.user.staff_profile.is_demo:
            return Response(
                {
                    "detail":
                    "Action is restricted in demo mode"
                },
                status=403
            )

        serializer = PlatterSerializer(
            data=request.data,
            context={"request": request, "branch": get_active_branch(request, raise_exception=False)},
        )

        if serializer.is_valid():

            platter = serializer.save(
                restaurant=restaurant
                ,
                branch=get_menu_scope_branch(request, restaurant),
            )
            record_instance_create(
                request=request,
                instance=platter,
                module=AuditModule.MENU,
                fields=PLATTER_AUDIT_FIELDS,
                description=f"{actor_name(request)} created platter {platter.name}.",
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    

class PlatterRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = PlatterSerializer

    permission_classes = [
        IsSameRestaurant,
        IsRestaurantActive,
        CanReadOrManageMenu,
    ]

    def get_queryset(self):

        restaurant = (
            self.request.user
            .staff_profile
            .restaurant
        )

        return filter_menu_queryset(
            self.request,
            Platter.objects.filter(restaurant=restaurant),
            restaurant,
        ).select_related(
            'category'
        ).prefetch_related(
            'items',
            'items__menu_item'
        )

    def update(self, request, *args, **kwargs):

        if request.user.staff_profile.is_demo:

            return Response(
                {
                    'detail':
                    'Action restricted in demo mode.'
                },
                status=403
            )

        platter = self.get_object()
        old_values = snapshot_instance(platter, fields=PLATTER_AUDIT_FIELDS)
        response = super().update(
            request,
            *args,
            **kwargs
        )
        platter.refresh_from_db()
        record_instance_update(
            request=request,
            instance=platter,
            old_values=old_values,
            module=AuditModule.MENU,
            fields=PLATTER_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated platter {platter.name}.",
            severity="WARNING" if old_values.get("price") != str(platter.price) else "INFO",
        )
        return response

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def destroy(self, request, *args, **kwargs):

        if request.user.staff_profile.is_demo:

            return Response(
                {
                    'detail':
                    'Action restricted in demo mode.'
                },
                status=403
            )

        platter = self.get_object()
        record_instance_delete(
            request=request,
            instance=platter,
            module=AuditModule.MENU,
            fields=PLATTER_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted platter {platter.name}.",
            severity="WARNING",
        )
        return super().destroy(
            request,
            *args,
            **kwargs
        )
    

@api_view(['GET'])
@permission_classes([AllowAny])
def public_platters(request, slug=None, restaurant_slug=None, branch_slug=None):

    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    platters = public_platter_queryset(
        restaurant,
        branch,
    ).filter(
        is_available=True
    )

    serializer = PlatterSerializer(
        platters,
        many=True,
        context={"branch": branch, "restaurant": restaurant},
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_platter_detail(
    request,
    pk,
    slug=None,
    restaurant_slug=None,
    branch_slug=None,
):

    restaurant, branch = get_public_menu_context(restaurant_slug or slug, branch_slug)
    platter = get_object_or_404(
        public_platter_queryset(restaurant, branch),
        pk=pk,
    )

    serializer = PlatterSerializer(
        platter,
        context={"branch": branch, "restaurant": restaurant},
    )

    return Response(serializer.data)




# views.py



# Improved PDF Menu Generator

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from io import BytesIO
from django.db.models import Q

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

from .models import Category


class MenuPrintView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsSameRestaurant,
        IsRestaurantActive,
        CanReadOrManageMenu,
    ]

    def get(self, request):
        # ✅ GET RESTAURANT FROM STAFF PROFILE
        restaurant = request.user.staff_profile.restaurant

        mode = request.query_params.get("mode", "all")
        category_id = request.query_params.get("category")

        # ✅ BUILD CATEGORIES QUERY
        branch = get_active_branch(request, raise_exception=False)
        categories = filter_menu_queryset(
            request,
            Category.objects.filter(restaurant=restaurant),
            restaurant,
        ).prefetch_related(
            *get_category_menu_prefetches(restaurant, branch),
        )

        if category_id:
            categories = categories.filter(id=category_id)

        # ✅ CREATE BUFFER AND PDF DOCUMENT
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=15*mm,
            rightMargin=15*mm,
            topMargin=12*mm,
            bottomMargin=12*mm
        )

        # ✅ STYLES (Compact)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'MenuTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=2,
            alignment=TA_CENTER,
            textColor=HexColor('#1a1a1a')
        )

        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontSize=8,
            spaceAfter=1,
            alignment=TA_CENTER,
            textColor=HexColor('#555555')
        )

        category_style = ParagraphStyle(
            'CategoryHeader',
            parent=styles['Normal'],
            fontSize=10,
            fontName='Helvetica-Bold',
            spaceBefore=6,
            spaceAfter=2,
            textColor=white,
            backColor=HexColor('#2C3E50'),
            borderPadding=(3, 3, 3, 3),
        )

        item_name_style = ParagraphStyle(
            'ItemName',
            parent=styles['Normal'],
            fontSize=9,
            fontName='Helvetica-Bold',
            textColor=black,
            spaceAfter=0
        )

        item_detail_style = ParagraphStyle(
            'ItemDetail',
            parent=styles['Normal'],
            fontSize=8,
            textColor=HexColor('#444444'),
            leftIndent=10,
            spaceAfter=0
        )

        price_style = ParagraphStyle(
            'Price',
            parent=styles['Normal'],
            fontSize=9,
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT,
            textColor=HexColor('#27AE60')
        )

        # ✅ BUILD CONTENT
        elements = []

        # === HEADER ===
        elements.append(Paragraph(f"{restaurant.name} - MENU", title_style))
        elements.append(Paragraph(
            f"Mode: {mode.title()} | "
            + (f"Category: {categories.first().name}" if category_id and categories.first() else "All Categories") +
            f" | {timezone.now().strftime('%d %b %Y, %H:%M')}",
            meta_style
        ))
        elements.append(Spacer(1, 4))

        # === MENU CONTENT ===
        from inventory.services import get_recipe_items

        for cat in categories:
            menu_items = list(cat.menu_items.all())
            platters = list(cat.platters.all())

            # Apply mode filter
            if mode == "available":
                menu_items = [
                    item for item in menu_items
                    if item.is_available_for_branch(branch)
                ]
                platters = [
                    platter for platter in platters
                    if platter.is_available_for_branch(branch)
                ]
            

            elif mode == "unavailable":
                menu_items = [
                    item for item in menu_items
                    if not item.is_available_for_branch(branch)
                ]
                platters = [
                    platter for platter in platters
                    if not platter.is_available_for_branch(branch)
                ]
            if not menu_items and not platters:
                continue

            # Category Header
            elements.append(Paragraph(f"  {cat.name.upper()}", category_style))

            # MENU ITEMS
            for item in menu_items:
                ingredients_list = [
                    f"{i.ingredient.name}({i.quantity_required}{i.ingredient.unit or ''})"
                    for i in get_recipe_items(item, branch=branch)
                ]
                ingredients_text = " | ".join(ingredients_list) if ingredients_list else "-"

                item_data = [
                    [
                        Paragraph(item.name, item_name_style),
                        Paragraph(ingredients_text, item_detail_style),
                        Paragraph(f"AFN{item.get_effective_price(branch):.2f}", price_style)
                    ]
                ]

                item_table = Table(
                    item_data,
                    colWidths=[doc.width * 0.25, doc.width * 0.55, doc.width * 0.20]
                )
                item_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('LINEBELOW', (0, 0), (-1, -1), 0.3, HexColor('#DDDDDD')),
                ]))
                elements.append(item_table)

            # PLATTERS
            for platter in platters:
                items_list = [
                    f"{i.menu_item.name}x{i.quantity}"
                    for i in platter.items.all()
                ]
                items_text = " | ".join(items_list) if items_list else "-"

                platter_data = [
                    [
                        Paragraph(f"{platter.name} (Platter)", item_name_style),
                        Paragraph(items_text, item_detail_style),
                        Paragraph(f"AFN{platter.get_effective_price(branch):.2f}", price_style)
                    ]
                ]

                platter_table = Table(
                    platter_data,
                    colWidths=[doc.width * 0.25, doc.width * 0.55, doc.width * 0.20]
                )
                platter_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('LINEBELOW', (0, 0), (-1, -1), 0.3, HexColor('#DDDDDD')),
                ]))
                elements.append(platter_table)

            elements.append(Spacer(1, 4))

        # ✅ BUILD PDF
        doc.build(elements)
        buffer.seek(0)

        # ✅ RETURN RESPONSE
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{restaurant.name}_menu.pdf"'

        return response
    

from datetime import datetime, time

from django.db.models import (
    Sum,
    F,
    Value,
    Q,
    ExpressionWrapper,
    DecimalField,
    CharField,
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from orders.models import OrderItem
from restaurants.branching import get_active_branch


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive])
def menu_item_sales(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)

    name = (request.GET.get("name") or "").strip()
    start = request.GET.get("start")
    end = request.GET.get("end")

    # ---------------------------------------------------------
    # DATE RANGE
    # ---------------------------------------------------------
    today = timezone.localdate()

    start_date = parse_date(start) if start else today
    end_date = parse_date(end) if end else today

    if not start_date:
        start_date = today

    if not end_date:
        end_date = start_date

    start_dt = timezone.make_aware(
        datetime.combine(start_date, time.min)
    )

    end_dt = timezone.make_aware(
        datetime.combine(end_date, time.max)
    )

    # ---------------------------------------------------------
    # COMMON ORDER FILTERS
    # ---------------------------------------------------------
    order_filters = {
        "order__restaurant": restaurant,
        "order__created_at__range": [start_dt, end_dt],
        "order__status__in": ["ready","served","completed", "delivered"],
    }

    if branch:
        order_filters["order__branch"] = branch

    # ---------------------------------------------------------
    # 1. MENU ITEM SALES
    # ---------------------------------------------------------
    menu_qs = OrderItem.objects.filter(
        menu_item__isnull=False,
        **order_filters,
    )

    if name:
        menu_qs = menu_qs.filter(
            menu_item__name__icontains=name
        )

    menu_grouped = (
        menu_qs
        .values(
            "menu_item__id",
            "menu_item__name",
        )
        .annotate(
            total_sold=Sum("quantity"),
            total_revenue=Sum(
                ExpressionWrapper(
                    F("quantity")
                    * Coalesce(
                        F("price_at_order"),
                        F("menu_item__price"),
                        Value(0),
                        output_field=DecimalField(
                            max_digits=12,
                            decimal_places=2,
                        ),
                    ),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            ),
        )
        .annotate(
            type=Value(
                "menu_item",
                output_field=CharField(),
            )
        )
        .order_by("-total_sold")
    )

    # ---------------------------------------------------------
    # 2. PLATTER SALES
    # ---------------------------------------------------------
    platter_qs = OrderItem.objects.filter(
        platter__isnull=False,
        **order_filters,
    )

    if name:
        platter_qs = platter_qs.filter(
            platter__name__icontains=name
        )

    platter_grouped = (
        platter_qs
        .values(
            "platter__id",
            "platter__name",
        )
        .annotate(
            total_sold=Sum("quantity"),
            total_revenue=Sum(
                ExpressionWrapper(
                    F("quantity")
                    * Coalesce(
                        F("price_at_order"),
                        F("platter__price"),
                        Value(0),
                        output_field=DecimalField(
                            max_digits=12,
                            decimal_places=2,
                        ),
                    ),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            ),
        )
        .annotate(
            type=Value(
                "platter",
                output_field=CharField(),
            )
        )
        .order_by("-total_sold")
    )

    # ---------------------------------------------------------
    # 3. MERGE RESULTS
    # ---------------------------------------------------------
    data = list(menu_grouped) + list(platter_grouped)

    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsKitchenManager | IsInventoryManager | IsOperationsManager])
def production_list_create(request):
    """
    GET: List all menu items that use daily production, with current production state.
    POST: Adjust production.
          Body: { menu_item, action: 'set'|'increment'|'decrement', quantity, notes? }
    """
    restaurant = request.user.staff_profile.restaurant
    if not restaurant:
        return Response({"error": "No restaurant"}, status=403)
    branch = get_active_branch(request)

    if request.method == 'GET':
        menu_items = filter_menu_queryset(
            request,
            MenuItem.objects.filter(
            restaurant=restaurant,
            uses_daily_production=True,
            ),
            restaurant,
        ).select_related('category').prefetch_related('productions').order_by('name')

        data = []
        for mi in menu_items:
            prod = mi.get_production(branch=branch)
            data.append({
                'id': mi.id,
                'name': mi.name,
                'name_dari': mi.name_dari,
                'name_pashto': mi.name_pashto,
                'price': str(mi.price),
                'image': mi.image.url if mi.image else None,
                'category_name': mi.category.name if mi.category else None,
                'uses_daily_production': mi.uses_daily_production,
                'production': {
                    'id': prod.id,
                    'quantity_produced': prod.quantity_produced,
                    'quantity_remaining': prod.quantity_remaining,
                    'notes': prod.notes,
                    'updated_at': prod.updated_at,
                    'created_at': prod.created_at,
                } if prod else None,
            })
        return Response(data)

    # POST
    menu_item_id = request.data.get('menu_item')
    action = request.data.get('action', 'set')
    quantity = request.data.get('quantity')
    notes = request.data.get('notes', '')

    if not menu_item_id or quantity is None:
        return Response({'error': 'menu_item and quantity are required'}, status=400)

    try:
        menu_item = filter_menu_queryset(
            request,
            MenuItem.objects.filter(id=menu_item_id, restaurant=restaurant),
            restaurant,
        ).get()
    except MenuItem.DoesNotExist:
        return Response({'error': 'Menu item not found'}, status=404)

    staff = getattr(request.user, 'staff_profile', None)

    try:
        if action == 'set':
            production = create_or_replace_production(
                menu_item=menu_item, quantity=quantity,
                branch=branch,
                created_by=staff, notes=notes,
            )
        elif action == 'increment':
            production = increment_production(
                menu_item=menu_item, quantity=quantity,
                branch=branch,
                created_by=staff, notes=notes,
            )
        elif action == 'decrement':
            production = decrement_production(
                menu_item=menu_item, quantity=quantity, branch=branch, notes=notes,
            )
        else:
            return Response({'error': f'Invalid action: {action}'}, status=400)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)

    if production is None:
        return Response({'cleared': True}, status=200)
    return Response(ProductionSerializer(production).data, status=200)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsKitchenManager | IsInventoryManager | IsOperationsManager])
def production_detail(request, pk):
    """
    PATCH: Adjust quantity_produced (e.g., cooked more). Body: { quantity, notes }
    DELETE: Clear production. Query param: ?refund=true to refund unsold ingredients.
    """
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)
    try:
        production = Production.objects.get(
            pk=pk,
            restaurant=restaurant,
            branch=branch,
        )
    except Production.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'PATCH':
        try:
            production = adjust_production(
                production,
                new_quantity=request.data.get('quantity', production.quantity_produced),
                notes=request.data.get('notes'),
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        return Response(ProductionSerializer(production).data)

    # DELETE
    refund = request.query_params.get('refund', 'false').lower() == 'true'
    clear_production(production.menu_item, branch=production.branch, refund_remaining=refund)
    return Response(status=204)
