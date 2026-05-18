from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics

from restaurants.models import Restaurant
from .models import Category,MenuItem,Review,PlatterItem,Platter
from .serializers import CategorySerializer,MenuItemSerializer,ReveiwSerializer,PlatterItemSerializer,PlatterSerializer
from reports.models import Notification
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from restaurants.permissions import IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive
from django.shortcuts import get_object_or_404

from django.utils import timezone
from rest_framework.exceptions import NotFound
from .permissions import is_restaurant_active
@api_view(['GET', 'POST'])
@permission_classes([IsSameRestaurant,IsRestaurantActive])
def category_list_create(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    if request.method == 'GET':
        categories = Category.objects.filter(restaurant=restaurant).prefetch_related('menu_items').all() # will also get the related menu_items(optimized version)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsSameRestaurant,IsRestaurantActive]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return Category.objects.filter(restaurant=restaurant).prefetch_related('menu_items')

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])
@permission_classes([IsSameRestaurant,IsRestaurantActive])
def menu_item_list_create_view(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    if request.method=="GET":
        menu_items=MenuItem.objects.filter(restaurant=restaurant).prefetch_related('reviews').prefetch_related('ingredients').select_related('category').all()
        serializer=MenuItemSerializer(menu_items,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer=MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.parsers import MultiPartParser, FormParser

class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [IsSameRestaurant, IsRestaurantActive]

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return MenuItem.objects.filter(
            restaurant=restaurant
        ).prefetch_related('reviews')

    def update(self, request, *args, **kwargs):
        print(request.data)   # DEBUG

        if request.user.staff_profile.is_demo:
            return Response(
                {'detail': 'Action restricted in demo mode.'},
                status=403
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)



@api_view(['GET', "POST"])
@permission_classes([IsSameRestaurant,IsRestaurantActive])
def review_list_create(request):
    

    if request.method == "GET":
        restaurant = getattr(request.user, 'staff_profile', None)
        restaurant = restaurant.restaurant if restaurant else None
        reviews = Review.objects.filter(
            menu_item__restaurant=restaurant
        ).select_related('customer', 'menu_item', 'delivery')

        serializer = ReveiwSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        
        serializer = ReveiwSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def send_review(request,slug):
    restaurant=get_object_or_404(Restaurant,slug=slug)
    serializer = ReveiwSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(restaurant=restaurant)
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)

class ReviewRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReveiwSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        restaurant = getattr(self.request.user, 'staff_profile', None)
        restaurant = restaurant.restaurant if restaurant else None

        return Review.objects.filter(
            menu_item__restaurant=restaurant
        ).select_related('customer', 'menu_item')
    


@api_view(['GET'])
@permission_classes([AllowAny])
def public_categories(request, slug):
    restaurant = get_object_or_404(Restaurant, slug=slug)

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    categories = Category.objects.filter(
        restaurant=restaurant
    ).prefetch_related('menu_items')

    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_items(request, slug):
    restaurant = get_object_or_404(Restaurant, slug=slug)

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    menu_items = MenuItem.objects.filter(
        restaurant=restaurant
    ).select_related('category').prefetch_related('reviews', 'ingredients')

    serializer = MenuItemSerializer(menu_items, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_item_detail(request, slug, pk):
    restaurant = get_object_or_404(Restaurant, slug=slug)

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    item = get_object_or_404(
        MenuItem,
        pk=pk,
        restaurant=restaurant
    )

    serializer = MenuItemSerializer(item)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([
    IsSameRestaurant,
    IsRestaurantActive,

])
def platter_list_create_view(request):

    staff = request.user.staff_profile
    restaurant = staff.restaurant

    # GET
    if request.method == "GET":

        platters = Platter.objects.filter(
            restaurant=restaurant
        ).select_related(
            'category'
        ).prefetch_related(
            'items',
            'items__menu_item'
        )

        serializer = PlatterSerializer(
            platters,
            many=True
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
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                restaurant=restaurant
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
        IsRestaurantActive
    ]

    def get_queryset(self):

        restaurant = (
            self.request.user
            .staff_profile
            .restaurant
        )

        return Platter.objects.filter(
            restaurant=restaurant
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

        return super().update(
            request,
            *args,
            **kwargs
        )

    def destroy(self, request, *args, **kwargs):

        if request.user.staff_profile.is_demo:

            return Response(
                {
                    'detail':
                    'Action restricted in demo mode.'
                },
                status=403
            )

        return super().destroy(
            request,
            *args,
            **kwargs
        )
    

@api_view(['GET'])
@permission_classes([AllowAny])
def public_platters(request, slug):

    restaurant = get_object_or_404(
        Restaurant,
        slug=slug
    )

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    platters = Platter.objects.filter(
        restaurant=restaurant,
        is_available=True
    ).select_related(
        'category'
    ).prefetch_related(
        'items',
        'items__menu_item'
    )

    serializer = PlatterSerializer(
        platters,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_platter_detail(
    request,
    slug,
    pk
):

    restaurant = get_object_or_404(
        Restaurant,
        slug=slug
    )

    if not is_restaurant_active(restaurant):
        raise NotFound("Restaurant not found")

    platter = get_object_or_404(
        Platter,
        pk=pk,
        restaurant=restaurant
    )

    serializer = PlatterSerializer(platter)

    return Response(serializer.data)




# views.py



# Improved PDF Menu Generator

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from io import BytesIO

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
    permission_classes = [IsAuthenticated, IsSameRestaurant, IsRestaurantActive]

    def get(self, request):
        # ✅ GET RESTAURANT FROM STAFF PROFILE
        restaurant = request.user.staff_profile.restaurant

        mode = request.query_params.get("mode", "all")
        category_id = request.query_params.get("category")

        # ✅ BUILD CATEGORIES QUERY
        categories = Category.objects.filter(
            restaurant=restaurant
        ).prefetch_related(
            "menu_items__ingredients__ingredient",
            "platters__items__menu_item"
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
        for cat in categories:
            menu_items = cat.menu_items.all()
            platters = cat.platters.all()

            # Apply mode filter
            if mode == "available":
                menu_items = menu_items.filter(is_available=True)
                platters = platters.filter(is_available=True)
            elif mode == "unavailable":
                menu_items = menu_items.filter(is_available=False)
                platters = platters.filter(is_available=False)

            if not menu_items.exists() and not platters.exists():
                continue

            # Category Header
            elements.append(Paragraph(f"  {cat.name.upper()}", category_style))

            # MENU ITEMS
            for item in menu_items:
                ingredients_list = [
                    f"{i.ingredient.name}({i.quantity_required}{i.ingredient.unit or ''})"
                    for i in item.ingredients.all()
                ]
                ingredients_text = " | ".join(ingredients_list) if ingredients_list else "-"

                item_data = [
                    [
                        Paragraph(item.name, item_name_style),
                        Paragraph(ingredients_text, item_detail_style),
                        Paragraph(f"AFN{item.price:.2f}", price_style)
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
                        Paragraph(f"AFN{platter.price:.2f}", price_style)
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