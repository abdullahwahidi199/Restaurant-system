from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import generics, filters
from django.db.models import F
from .utils import update_menu_item_availability
from .models import Ingredient, MenuItemIngredient, StockMovement
from .pagination import StockMovementPagination
from datetime import timedelta
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.utils.timezone import now
from django.db.models import DecimalField, F, Sum, ExpressionWrapper
from .serializers import (
    IngredientSerializer,
    MenuItemIngredientSerializer,
    StockMovementSerializer
)
from .services import edit_stock_movement
from restaurants.permissions import IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive,IsKitchenManager,IsInventoryManager



# INGREDIENT CRUD
from django.db.models import Count

class IngredientListCreateView(generics.ListCreateAPIView):

    serializer_class = IngredientSerializer
    permission_classes = [
        IsKitchenManager | IsRestaurantAdmin | IsInventoryManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]

    def get_queryset(self):
        return Ingredient.objects.filter(
            restaurant=self.request.user.staff_profile.restaurant
        ).annotate(
            menu_items_count=Count('menu_items', distinct=True)
        )

    def perform_create(self, serializer):
        restaurant = self.request.user.staff_profile.restaurant
        serializer.save(restaurant=restaurant)

class IngredientPaginatedView(generics.ListAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsKitchenManager | IsInventoryManager, IsSameRestaurant, IsRestaurantActive]
    pagination_class = StockMovementPagination

    filter_backends = [filters.SearchFilter]
    search_fields = ['name']  # you can add more fields later

    def get_queryset(self):
        return Ingredient.objects.filter(
            restaurant=self.request.user.staff_profile.restaurant
        ).annotate(
            menu_items_count=Count('menu_items', distinct=True)
        )

class IngredientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager,IsSameRestaurant,IsRestaurantActive]
    def get_queryset(self):
        return Ingredient.objects.filter(
            restaurant=self.request.user.staff_profile.restaurant
        )


# MENU ITEM RECIPE
class MenuItemIngredientListCreateView(generics.ListCreateAPIView):
    queryset = MenuItemIngredient.objects.select_related('menu_item', 'ingredient')
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager, IsSameRestaurant, IsRestaurantActive]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return MenuItemIngredient.objects.filter(
            menu_item__restaurant=restaurant
        ).select_related('menu_item', 'ingredient')

    def perform_create(self, serializer):
        instance = serializer.save()

        # 🔥 update availability after adding ingredient
        update_menu_item_availability(instance.menu_item)


class MenuItemIngredientDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager, IsRestaurantActive, IsSameRestaurant]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return MenuItemIngredient.objects.filter(
            menu_item__restaurant=restaurant
        )

    def perform_update(self, serializer):
        instance = serializer.save()

        # 🔥 update availability after change
        update_menu_item_availability(instance.menu_item)
    def perform_destroy(self, instance):
        menu_item = instance.menu_item
        instance.delete()

        # 🔥 update availability after removal
        update_menu_item_availability(menu_item)

from rest_framework import filters

class StockMovementListView(generics.ListAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [
        IsRestaurantAdmin | IsInventoryManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]
    pagination_class = StockMovementPagination

    filter_backends = [filters.SearchFilter]
    search_fields = ['ingredient__name']

    def get_queryset(self):
        user = self.request.user
        restaurant = user.staff_profile.restaurant

        qs = (
            StockMovement.objects
            .select_related('ingredient')
            .filter(restaurant=restaurant)
            .filter(movement_type__in=['purchase', 'waste', 'adjustment'])
            .order_by('-created_at')
        )

        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')

        if not from_date and not to_date:
            qs = qs.filter(created_at__gte=now() - timedelta(days=30))
        else:
            if from_date:
                qs = qs.filter(created_at__date__gte=from_date)

            if to_date:
                qs = qs.filter(created_at__date__lte=to_date)

        movement_type = self.request.query_params.get('type')

        if movement_type:
            qs = qs.filter(movement_type=movement_type)

        return qs

# LOW STOCK
@api_view(['GET'])
@permission_classes([IsRestaurantAdmin | IsKitchenManager | IsInventoryManager,IsSameRestaurant,IsRestaurantActive])
def low_stock_items(request):
    restaurant = request.user.staff_profile.restaurant

    items = Ingredient.objects.filter(
        restaurant=restaurant,
        quantity_available__lte=F('minimum_threshold')
    )
    serializer = IngredientSerializer(items, many=True)
    return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Ingredient
from .services import add_stock
from decimal import Decimal

@api_view(['POST'])
@permission_classes([IsRestaurantAdmin | IsInventoryManager,IsSameRestaurant,IsRestaurantActive])
def add_stock_view(request):
    print("DATA RECEIVED:", request.data)
    ingredient_id = request.data.get('ingredient')
    quantity = Decimal(request.data.get('quantity'))
    cost = request.data.get('cost_per_unit')

    if quantity <= 0:
        return Response(
            {'detail': 'Quantity must be greater than zero'},
            status=status.HTTP_400_BAD_REQUEST
    )
    if not ingredient_id or not quantity:
        return Response(
            {'detail': 'Ingredient and quantity are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    ingredient = Ingredient.objects.get(id=ingredient_id,restaurant=request.user.staff_profile.restaurant)
    restaurant=request.user.staff_profile.restaurant
    add_stock(
        ingredient=ingredient,
        quantity=quantity,
        created_by=getattr(request.user, 'staff_profile', None),
        cost_per_unit=cost
    )

    return Response(
        {'detail': 'Stock added successfully'},
        status=status.HTTP_200_OK
    )

from decimal import Decimal, InvalidOperation
@api_view(['PUT'])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager,
    IsSameRestaurant,
    IsRestaurantActive
])



def edit_stock_movement_view(request, pk):

    movement = StockMovement.objects.get(
        id=pk,
        restaurant=request.user.staff_profile.restaurant
    )

    if movement.movement_type == "order":
        return Response({"detail": "Order movements cannot be edited"}, status=400)

    try:
        quantity = Decimal(str(request.data.get("quantity")))
    except:
        return Response({"detail": "Invalid quantity"}, status=400)
    
    # movement type
    new_type = request.data.get(
        "movement_type",
        movement.movement_type
    )

    # purchases cannot become other types
    if (
        movement.movement_type == "purchase"
        and new_type != "purchase"
    ):
        return Response(
            {
                "detail":
                "Purchase movements cannot change type"
            },
            status=400
        )

    # only adjustment/waste switch allowed
    if (
        movement.movement_type in ["adjustment", "waste"]
        and new_type not in ["adjustment", "waste"]
    ):
        return Response(
            {
                "detail":
                "Only adjustment and waste are allowed"
            },
        ) 

    unit_cost_raw = request.data.get("new_unit_cost")

    # 🔥 FIX HERE
    try:
        unit_cost = (
            Decimal(str(unit_cost_raw))
            if unit_cost_raw not in [None, ""]
            else None
        )
    except InvalidOperation:
        return Response({"detail": "Invalid unit cost"}, status=400)

    try:
        edit_stock_movement(
            movement=movement,
            new_quantity=quantity,
            new_movement_type=new_type,
            new_unit_cost=unit_cost
        )

        return Response({"detail": "Stock movement updated"})

    except ValueError as e:
        return Response({"detail": str(e)}, status=400)


from django.db.models import Prefetch, Q
from .serializers import IngredientUsageSerializer


@api_view(['GET'])
@permission_classes([
    IsRestaurantAdmin | IsKitchenManager | IsInventoryManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def search_ingredient_usage_view(request):

    query = request.GET.get("q", "").strip()

    if not query:
        return Response([])

    restaurant = request.user.staff_profile.restaurant

    ingredients = (
        Ingredient.objects
        .filter(
            restaurant=restaurant
        )
        .filter(
            Q(name__icontains=query)
        )
        .prefetch_related(
            Prefetch(
                "menu_items",
                queryset=MenuItemIngredient.objects.select_related(
                    "menu_item"
                )
            )
        )
    )

    serializer = IngredientUsageSerializer(
        ingredients,
        many=True
    )

    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsRestaurantAdmin | IsInventoryManager,IsSameRestaurant,IsRestaurantActive])
def adjust_stock_view(request):
    ingredient_id = request.data.get('ingredient')
    quantity = Decimal(request.data.get('quantity'))
    movement_type = request.data.get('movement_type') 

    if not ingredient_id or not quantity or not movement_type:
        return Response({'detail': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    restaurant = request.user.staff_profile.restaurant
    ingredient = Ingredient.objects.get(id=ingredient_id,restaurant=restaurant)

    if ingredient.quantity_available + quantity < 0:
        return Response(
            {
                'detail': (
                    f'Insufficient stock. '
                    f'Available: {ingredient.quantity_available}'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    ingredient.quantity_available += quantity
    ingredient.save(update_fields=['quantity_available'])
    for recipe in ingredient.menu_items.select_related('menu_item'):
        update_menu_item_availability(recipe.menu_item)
    StockMovement.objects.create(
        ingredient=ingredient,
        change_quantity=quantity,
        restaurant=ingredient.restaurant,
        movement_type=movement_type,
        created_by=getattr(request.user, 'staff_profile', None)
    )

    # Update menu item availability
    for recipe in ingredient.menu_items.select_related('menu_item'):
        update_menu_item_availability(recipe.menu_item)

    return Response({'detail': 'Stock adjusted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsRestaurantAdmin | IsKitchenManager | IsInventoryManager,IsSameRestaurant,IsRestaurantActive])

def inventory_dashboard_summary(request):
    restaurant = request.user.staff_profile.restaurant
    ingredients=Ingredient.objects.filter(is_active=True, restaurant=restaurant)
    inventory_value = ingredients.aggregate(
    total=Coalesce(
        Sum(
            ExpressionWrapper(
                F("quantity_available") * F("cost_per_unit"),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ),
        0,
        output_field=DecimalField(max_digits=12, decimal_places=2)
    )
)["total"]
    low_stock = Ingredient.objects.filter(
    restaurant=restaurant,
    quantity_available__lte=F('minimum_threshold')
).count()

    out_of_stock=Ingredient.objects.filter(quantity_available=0, restaurant=restaurant).count()


    since = now() - timedelta(days=30)
    top_consumed_ingredients=(
        StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__gte=since,
            movement_type='order',
            change_quantity__lt=0
        )
        .values('ingredient__name','ingredient__unit')
        .annotate(consumed=Sum('change_quantity'))
        .order_by('consumed')[:5]
    )

    high_waste_ingredients=(
        StockMovement.objects
        .filter(
            restaurant=restaurant,
            created_at__gte=since,
            movement_type='waste'
        )
        .values('ingredient__name', 'ingredient__unit')
        .annotate(wasted=Sum('change_quantity'))
        .order_by('wasted')[:5]
    )

    return Response({
        "total_ingredients":ingredients.count(),
        "inventory_value":inventory_value,
        'low_stock': low_stock,
        "out_of_stock":out_of_stock,
        "top_consumed_ingredients":top_consumed_ingredients,
        "high_waste_ingredients":high_waste_ingredients
    })



from io import BytesIO
from decimal import Decimal

from django.http import HttpResponse
from django.db.models import F
from django.utils.timezone import now

from rest_framework.decorators import api_view, permission_classes

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

from .models import Ingredient
from restaurants.permissions import (
    IsRestaurantAdmin,
    IsKitchenManager,
    IsInventoryManager,
    IsSameRestaurant,
    IsRestaurantActive
)


@api_view(['GET'])
@permission_classes([
    IsRestaurantAdmin | IsKitchenManager | IsInventoryManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def inventory_pdf(request):

    restaurant = request.user.staff_profile.restaurant

    ingredients = Ingredient.objects.filter(
        restaurant=restaurant
    ).order_by("name")

    # =========================
    # QUERY PARAM FILTERS
    # =========================

    low_stock = request.GET.get("low_stock")
    out_of_stock = request.GET.get("out_of_stock")
    

    report_type = request.GET.get("type", "all")

    if report_type == "low_stock":
        ingredients = ingredients.filter(
            quantity_available__lte=F("minimum_threshold"),
            quantity_available__gt=0
        )

    elif report_type == "out_of_stock":
        ingredients = ingredients.filter(
            quantity_available=0
        )

    
    

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=18
    )

    elements = []
    styles = getSampleStyleSheet()


    title = Paragraph(
        f"{restaurant.name} Inventory Report",
        styles['Heading1']
    )

    elements.append(title)

    generated_at = Paragraph(
        f"Generated: {now().strftime('%Y-%m-%d %H:%M')}",
        styles['Normal']
    )

    elements.append(generated_at)

    elements.append(Spacer(1, 16))

 

    data = [[
        "Ingredient",
        "Unit",
        "Available",
        "Minimum",
        "Cost/Unit",
        "Status",
        "Total Value"
    ]]

    total_inventory_value = Decimal("0.00")

    for item in ingredients:

        total_value = (
            item.quantity_available * item.cost_per_unit
        )

        total_inventory_value += total_value

        # Better stock status
        if item.quantity_available == 0:
            status = "Out of Stock"

        elif item.quantity_available <= item.minimum_threshold:
            status = "Low Stock"

        else:
            status = "Good"

        data.append([
            item.name,
            item.unit,
            str(item.quantity_available),
            str(item.minimum_threshold),
            f"AFN{item.cost_per_unit:.2f}",
            status,
            f"AFN{total_value:.2f}"
        ])

    # =========================
    # TABLE
    # =========================

    table = Table(
        data,
        repeatRows=1,
        colWidths=[120, 50, 70, 70, 70, 90, 90]
    )

    table.setStyle(TableStyle([

        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

        # Body
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),

        # Grid
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),

        # Alignment
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),

        # Font size
        ('FONTSIZE', (0, 0), (-1, -1), 9),

        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),

    ]))

    elements.append(table)

    elements.append(Spacer(1, 20))

    # =========================
    # SUMMARY
    # =========================

    summary = Paragraph(
        f"""
        <b>Total Ingredients:</b> {ingredients.count()}
        <br/>
        <b>Total Inventory Value:</b> ${total_inventory_value:.2f}
        """,
        styles['Heading3']
    )

    elements.append(summary)

    # =========================
    # BUILD PDF
    # =========================

    doc.build(elements)

    buffer.seek(0)

    response = HttpResponse(
        buffer,
        content_type='application/pdf'
    )

    response['Content-Disposition'] = (
        'attachment; filename="inventory_report.pdf"'
    )

    return response

