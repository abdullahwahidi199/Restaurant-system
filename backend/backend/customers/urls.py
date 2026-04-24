from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("<slug:slug>/signup/", SignupView.as_view()),
    path("<slug:slug>/login/", LoginView.as_view()),
    path("<slug:slug>/profile/", CustomerProfileView.as_view()),
    path("<slug:slug>/orders/", CustomerOrdersView.as_view()),
    path("<slug:slug>/reviews/", CustomerReviewsView.as_view()),
    path("customer/token/refresh/", TokenRefreshView.as_view()),
    path("customers/", CustomersView),
]