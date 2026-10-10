from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("signup/", SignupView.as_view()),
    path("login/", LoginView.as_view()),
    path("profile/", CustomerProfileView.as_view()),
    path("orders/", CustomerOrdersView.as_view()),
    path("orders/<int:pk>/", CustomerOrderDetailView.as_view()),
    path("orders/<int:pk>/cancel/", CustomerOrderCancelView.as_view()),
    path("orders/<int:pk>/socket-ticket/", CustomerOrderSocketTicketView.as_view()),
    path("checkout/validate/", MarketplaceCheckoutValidationView.as_view()),
    path("addresses/", CustomerAddressListCreateView.as_view()),
    path("addresses/<int:pk>/", CustomerAddressDetailView.as_view()),
    path("<slug:slug>/reviews/", CustomerReviewsView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view(), name="customer-token-refresh"),
    # Backward-compatible alias for clients that used the previously nested URL.
    path(
        "customer/token/refresh/",
        TokenRefreshView.as_view(),
        name="legacy-customer-token-refresh",
    ),
    # path("customers/", CustomersView),
]
