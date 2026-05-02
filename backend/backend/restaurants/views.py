from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Restaurant, Subscription
from .serializers import RestaurantSerializer, SubscriptionSerializer
from .permissions import IsSuperAdmin,IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import parser_classes

from django.shortcuts import get_object_or_404
# --- RESTAURANT VIEWS ---

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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# GET (Retrieve), PUT/PATCH (Update), DELETE using RetrieveUpdateDestroyAPIView
class RestaurantDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsSuperAdmin]


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

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantAdmin,IsRestaurantActive])
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
        serializer = RestaurantSerializer(
            restaurant,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        

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

    return Response({
        "id": restaurant.id,
        "name": restaurant.name,
        "logo": restaurant.logo.url if restaurant.logo else None,
        "is_active": restaurant.is_active,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "subscription": {
            "is_active": subscription.is_active if subscription else False,
            "is_valid": subscription.is_valid if subscription else False,
            "expires_at": subscription.expires_at if subscription else None,
            "days_left": subscription.days_left if subscription else None,
            "is_expiring_soon": subscription.is_expiring_soon if subscription else False,
        }
    })