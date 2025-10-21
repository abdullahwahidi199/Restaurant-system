from django.urls import path
from .views import SignupView, LoginView,CustomerProfileView,CustomerOrdersView, CustomerReviewsView

urlpatterns = [
    path("profile",CustomerProfileView.as_view()),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('orders/', CustomerOrdersView.as_view(), name='customer-orders'),
    path('reviews/', CustomerReviewsView.as_view(), name='customer-reviews'),
   
]
