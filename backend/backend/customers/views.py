from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import CustomerLoginSerializer, CustomerSignupSerializer,CustomerProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Customer
from rest_framework.permissions import AllowAny
from django.core import signing
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant
from orders.models import Order
from .models import CustomerAddress
from .serializers import CustomerAddressSerializer
from .marketplace import (
    MarketplaceCheckoutInputSerializer,
    checkout_payload,
    create_marketplace_order,
    serialize_customer_order,
    sign_checkout_quote,
    validate_marketplace_checkout,
)
from users.login_rate_limit import (
    LoginRateLimitBlocked,
    LoginRateLimitUnavailable,
    check_login_allowed,
    record_failed_login,
    reset_login_attempts,
)
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
    permission_classes = [IsAuthenticated]

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

        orders = customer.orders.select_related(
            "restaurant",
            "branch",
        ).prefetch_related(
            "items__menu_item",
            "items__platter",
        ).order_by("-created_at")

        if "page" in request.query_params:
            pagination = PageNumberPagination()
            pagination.page_size = 20
            page = pagination.paginate_queryset(orders, request, view=self)
            return pagination.get_paginated_response([
                serialize_customer_order(order) for order in page
            ])
        data = [serialize_customer_order(order) for order in orders]

        return Response(data)

    def post(self, request):
        customer = get_customer_by_slug(request)
        if not customer:
            return Response({"error": "Access denied"}, status=403)
        serializer = MarketplaceCheckoutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data.get("idempotency_key"):
            return Response(
                {"idempotency_key": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            order, created = create_marketplace_order(
                customer,
                serializer.validated_data,
            )
        except IntegrityError:
            order = customer.orders.select_related(
                "restaurant", "branch"
            ).prefetch_related(
                "items__menu_item", "items__platter"
            ).filter(
                client_order_id=serializer.validated_data["idempotency_key"]
            ).first()
            if not order:
                return Response(
                    {"detail": "Please review checkout and try again with a new request.", "code": "request_conflict"},
                    status=status.HTTP_409_CONFLICT,
                )
            created = False
        return Response(
            serialize_customer_order(order),
            status=(status.HTTP_201_CREATED if created else status.HTTP_200_OK),
        )


class MarketplaceCheckoutValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer = get_customer_by_slug(request)
        if not customer:
            return Response({"error": "Access denied"}, status=403)
        serializer = MarketplaceCheckoutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        checkout = validate_marketplace_checkout(
            customer,
            serializer.validated_data,
        )
        payload = checkout_payload(checkout)
        payload["quote_token"] = sign_checkout_quote(customer, serializer.validated_data, checkout)
        return Response(payload)


class CustomerOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_order(self, request, pk):
        customer = get_customer_by_slug(request)
        if not customer:
            return None
        return customer.orders.select_related(
            "restaurant", "branch"
        ).prefetch_related(
            "items__menu_item", "items__platter"
        ).filter(pk=pk).first()

    def get(self, request, pk):
        order = self.get_order(request, pk)
        if not order:
            return Response({"detail": "Order not found."}, status=404)
        return Response(serialize_customer_order(order))


class CustomerOrderCancelView(CustomerOrderDetailView):
    @transaction.atomic
    def post(self, request, pk):
        customer = get_customer_by_slug(request)
        if not customer:
            return Response({"error": "Access denied"}, status=403)
        order = Order.objects.select_for_update().filter(
            pk=pk,
            customer=customer,
        ).first()
        if not order:
            return Response({"detail": "Order not found."}, status=404)
        if order.status != "pending":
            return Response(
                {"detail": "This order can no longer be cancelled."},
                status=status.HTTP_409_CONFLICT,
            )
        if (timezone.now() - order.created_at).total_seconds() > 120:
            return Response(
                {"detail": "The cancellation window has expired."},
                status=status.HTTP_409_CONFLICT,
            )
        order.status = "cancelled"
        order.save(update_fields=["status", "updated_at"])
        order = self.get_order(request, pk)
        return Response(serialize_customer_order(order))


class CustomerOrderSocketTicketView(CustomerOrderDetailView):
    def post(self, request, pk):
        order = self.get_order(request, pk)
        if not order:
            return Response({"detail": "Order not found."}, status=404)
        ticket = signing.dumps(
            {"order_id": order.id, "user_id": request.user.id},
            salt="customer-order-socket",
            compress=True,
        )
        return Response({"ticket": ticket, "expires_in": 60})


class CustomerAddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_customer(self, request):
        return get_customer_by_slug(request)

    def get(self, request):
        customer = self.get_customer(request)
        if not customer:
            return Response({"error": "Access denied"}, status=403)
        return Response(CustomerAddressSerializer(customer.addresses.all(), many=True).data)

    def post(self, request):
        customer = self.get_customer(request)
        if not customer:
            return Response({"error": "Access denied"}, status=403)
        serializer = CustomerAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomerAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_address(self, request, pk):
        customer = get_customer_by_slug(request)
        if not customer:
            return None
        return CustomerAddress.objects.filter(customer=customer, pk=pk).first()

    def patch(self, request, pk):
        address = self.get_address(request, pk)
        if not address:
            return Response({"detail": "Address not found."}, status=404)
        serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @transaction.atomic
    def delete(self, request, pk):
        address = self.get_address(request, pk)
        if not address:
            return Response({"detail": "Address not found."}, status=404)
        customer = address.customer
        Customer.objects.select_for_update().get(pk=customer.pk)
        was_default = address.is_default
        address.delete()
        if was_default:
            replacement = customer.addresses.order_by("-updated_at", "id").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=["is_default", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        username = str(request.data.get("username", "")).strip()
        password = request.data.get("password", "")

        try:
            config = check_login_allowed(
                request,
                namespace="customer",
                identifier=username,
            )
        except LoginRateLimitBlocked as exc:
            response = Response(
                {
                    "error": "Too many login attempts. Please try again later.",
                    "retry_after": exc.retry_after,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
            response["Retry-After"] = str(exc.retry_after)
            return response
        except LoginRateLimitUnavailable:
            return Response(
                {"error": "Login is temporarily unavailable. Please try again shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        user = authenticate(username=username, password=password)

        if not user:
            try:
                record_failed_login(
                    request,
                    namespace="customer",
                    identifier=username,
                    config=config,
                )
            except LoginRateLimitUnavailable:
                return Response(
                    {"error": "Login is temporarily unavailable. Please try again shortly."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response({"error": "Invalid credentials"}, status=401)

        customer = Customer.objects.filter(
            user=user
        ).first()

        if not customer:
            try:
                record_failed_login(
                    request,
                    namespace="customer",
                    identifier=username,
                    config=config,
                )
            except LoginRateLimitUnavailable:
                return Response(
                    {"error": "Login is temporarily unavailable. Please try again shortly."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response(
                {"error": "Invalid credentials"},
                status=401
            )

        refresh = RefreshToken.for_user(user)
        try:
            reset_login_attempts(request, namespace="customer", identifier=username)
        except LoginRateLimitUnavailable:
            return Response(
                {"error": "Login is temporarily unavailable. Please try again shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

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
