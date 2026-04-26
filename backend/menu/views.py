from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics

from restaurants.models import Restaurant
from .models import Category,MenuItem,Review
from .serializers import CategorySerializer,MenuItemSerializer,ReveiwSerializer
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

class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [IsSameRestaurant,IsRestaurantActive]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return MenuItem.objects.filter(restaurant=restaurant).prefetch_related('reviews')

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
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