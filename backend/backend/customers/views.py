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
from rest_framework.decorators import permission_classes


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer profile not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerProfileSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CustomerOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        # You can import and use an OrderSerializer if you have one already
        orders = customer.orders.all().order_by('-created_at')

        data = [
            {
                "id": order.id,
                "order_type": order.order_type,
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

        return Response(data, status=status.HTTP_200_OK)


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
    def post(self, request):
        serializer = CustomerSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes=[AllowAny]
    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if user:
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# this veiw returns all the customers
@api_view(['GET'])
def CustomersView(request):
    if request.method=="GET":
        customers=Customer.objects.all().order_by('-joined_at')
        
        customers_from=request.query_params.get('from')
        to=request.query_params.get('to')

        if customers_from and to:
            customers=customers.filter(joined_at__date__range=[customers_from,to])

        serializer=CustomerProfileSerializer(customers,many=True)
        return Response(serializer.data)
    else:
        return Response("This type of method is not allowed")