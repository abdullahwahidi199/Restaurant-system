from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import CustomerLoginSerializer, CustomerSignupSerializer,CustomerProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from .models import Customer
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant
from rest_framework.decorators import permission_classes
from restaurants.permissions import IsRestaurantAdmin,IsCashier,IsKitchenManager,IsSameRestaurant
from restaurants.models import Restaurant

from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant

def get_customer_by_slug(request):

    customer = Customer.objects.filter(
        user=request.user
    ).first()

    return customer
def get_restaurant_from_user(request):
    """
    Helper to safely get the restaurant from the logged-in user's staff profile.
    """
    if not request.user.is_authenticated:
        return None
    
    # Check if user is superadmin (they might not have a staff profile)
    if request.user.is_superuser:
        # For superadmin, you might allow seeing everything, 
        # or require a header/param to select restaurant. 
        # For now, we return None so they see nothing unless logic is added.
        # Alternatively: return Restaurant.objects.first() 
        pass
        
    if hasattr(request.user, 'staff_profile'):
        return request.user.staff_profile.restaurant
    
    return None
class CustomerProfileView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = get_customer_by_slug(request)

        if not customer:
            return Response(
                {"error": "Access denied"},
                status=403
            )

        serializer = CustomerProfileSerializer(customer)
        return Response(serializer.data)
    
class CustomerOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = get_customer_by_slug(request)

        if not customer:
            return Response({"error": "Access denied"}, status=403)

        orders = customer.orders.all().order_by("-created_at")

        data = [
            {
                "id": order.id,
                "order_type": order.order_type,
                "restaurant": order.restaurant.name if order.restaurant else None,
                "status": order.status,
                "total": order.get_total(),
                "created_at": order.created_at,
                "items": [
                    {
                        "menu_item": item.menu_item.name,
                        "quantity": item.quantity,
                        "subtotal": item.get_subtotal()
                    }
                    for item in order.items.all()
                ]
            }
            for order in orders
        ]

        return Response(data)


class CustomerReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        reviews = customer.reviews.select_related('menu_item').all().order_by('-created_at')

        data = [
            {
                "id": review.id,
                "menu_item": review.menu_item.name,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at
            }
            for review in reviews
        ]

        return Response(data, status=status.HTTP_200_OK)

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, slug):
        # restaurant = get_object_or_404(Restaurant, slug=slug)

        serializer = CustomerSignupSerializer(
            data=request.data,
            
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=201
            )

        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        customer = Customer.objects.filter(
            user=user
        ).first()

        if not customer:
            return Response(
                {"error": "This account does not belong to this restaurant"},
                status=403
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "customer": {
                "id": customer.id,
                "username": user.username
            }
        })

class CustomerReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        customer = get_customer_by_slug(request, slug)

        if not customer:
            return Response({"error": "Access denied"}, status=403)

        reviews = customer.reviews.select_related("menu_item").all().order_by("-created_at")

        data = [
            {
                "id": review.id,
                "menu_item": review.menu_item.name,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at
            }
            for review in reviews
        ]

        return Response(data)
# @api_view(['GET'])
# def CustomersView(request):
#     if request.method=="GET":
#         staff=request.user.staff_profile
#         customers=Customer.objects.filter().all().order_by('-joined_at')
        
#         customers_from=request.query_params.get('from')
#         to=request.query_params.get('to')

#         if customers_from and to:
#             customers=customers.filter(joined_at__date__range=[customers_from,to])

#         serializer=CustomerProfileSerializer(customers,many=True)
#         return Response(serializer.data)
#     else:
#         return Response("This type of method is not allowed")