from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
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

# INGREDIENT CRUD
class IngredientListCreateView(generics.ListCreateAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]


class IngredientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]


# MENU ITEM RECIPE
class MenuItemIngredientListCreateView(generics.ListCreateAPIView):
    queryset = MenuItemIngredient.objects.select_related('menu_item', 'ingredient')
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [AllowAny]


class MenuItemIngredientDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItemIngredient.objects.all()
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [AllowAny]


class StockMovementListView(generics.ListAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [AllowAny]
    pagination_class=StockMovementPagination


    def get_queryset(self):
        qs=(
            StockMovement.objects.select_related('ingredient')
            .filter(movement_type__in=['purchase','waste','adjustment'])
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

        # ingredient=self.request.query_params.get('ingredient')
        # if ingredient:
        #     qs=qs.filter(ingredient__name__icontains=ingredient)
        
        movement_type=self.request.query_params.get('type')
        if movement_type:
            qs=qs.filter(movement_type=movement_type)

        return qs

# LOW STOCK
@api_view(['GET'])
@permission_classes([AllowAny])
def low_stock_items(request):
    items = Ingredient.objects.filter(
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
@permission_classes([AllowAny])
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

    ingredient = Ingredient.objects.get(id=ingredient_id)

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


@api_view(['POST'])
@permission_classes([AllowAny])
def adjust_stock_view(request):
    ingredient_id = request.data.get('ingredient')
    quantity = Decimal(request.data.get('quantity'))
    movement_type = request.data.get('movement_type') 

    if not ingredient_id or not quantity or not movement_type:
        return Response({'detail': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    ingredient = Ingredient.objects.get(id=ingredient_id)

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

    StockMovement.objects.create(
        ingredient=ingredient,
        change_quantity=quantity,
        movement_type=movement_type,
        created_by=getattr(request.user, 'staff_profile', None)
    )

    # Update menu item availability
    for recipe in ingredient.menu_items.select_related('menu_item'):
        update_menu_item_availability(recipe.menu_item)

    return Response({'detail': 'Stock adjusted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])

def inventory_dashboard_summary(request):
    ingredients=Ingredient.objects.filter(is_active=True)
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
    low_stock=Ingredient.objects.filter(
        quantity_available__lte=F('minimum_threshold')
    ).count()

    out_of_stock=Ingredient.objects.filter(quantity_available=0).count()


    since = now() - timedelta(days=30)
    top_consumed_ingredients=(
        StockMovement.objects.filter(
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

