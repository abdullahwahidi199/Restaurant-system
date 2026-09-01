from django.urls import path
from .views import (
    restaurant_list_create, 
    RestaurantDetailView,
    subscription_list_create, 
    SubscriptionDetailView,
    restaurant_detail,
    disable_subscription,
    my_restaurant,
    branch_list_create,
    branch_detail,
    my_branches,
    active_branch_view,
    active_branch_settings,
    branch_data_migrations,
    branch_copy,
    branch_regenerate_qr,
    enterprise_settings,
    public_branch_detail,
    public_restaurant_branches,
    public_restaurant_entry,
    restaurant_discovery,
)

urlpatterns = [
    path('discovery/', restaurant_discovery, name='restaurant-discovery'),
    path('public/<slug:restaurant_slug>/branches/', public_restaurant_branches, name='public-restaurant-branches'),
    path('public/<slug:restaurant_slug>/<slug:branch_slug>/', public_branch_detail, name='public-branch-detail'),
    path('public/<slug:restaurant_slug>/', public_restaurant_entry, name='public-restaurant-entry'),

    # Restaurant URLs
    path('restaurants/', restaurant_list_create, name='restaurant-list-create'),
    path('restaurants/<int:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('disable-subscription/<int:restaurant_id>/', disable_subscription),
    path('me/',my_restaurant),
    path('branches/', branch_list_create, name='branch-list-create'),
    path('branches/my/', my_branches, name='my-branches'),
    path('branches/active/', active_branch_view, name='active-branch'),
    path('branches/active/settings/', active_branch_settings, name='active-branch-settings'),
    path('branch-data-migrations/', branch_data_migrations, name='branch-data-migrations'),
    path('branches/<int:branch_id>/copy/', branch_copy, name='branch-copy'),
    path('branches/<int:branch_id>/regenerate-qr/', branch_regenerate_qr, name='branch-regenerate-qr'),
    path('branches/<int:branch_id>/', branch_detail, name='branch-detail'),
    path('enterprise-settings/', enterprise_settings, name='enterprise-settings'),

    # Subscription URLs
    path('subscriptions/', subscription_list_create, name='subscription-list-create'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('restaurant/', restaurant_detail, name='restaurant-detail'),
]
