from django.urls import path
from .views import (
    restaurant_list_create, 
    RestaurantDetailView,
    subscription_list_create, 
    SubscriptionDetailView,
    restaurant_detail,
    disable_subscription,
    my_restaurant
)

urlpatterns = [
    # Restaurant URLs
    path('restaurants/', restaurant_list_create, name='restaurant-list-create'),
    path('restaurants/<int:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('disable-subscription/<int:restaurant_id>/', disable_subscription),
    path('me/',my_restaurant),

    # Subscription URLs
    path('subscriptions/', subscription_list_create, name='subscription-list-create'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('restaurant/', restaurant_detail, name='restaurant-detail'),
]