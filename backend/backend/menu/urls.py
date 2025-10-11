from django.urls import path
from .views import category_list_create, CategoryRetrieveDestroyView,MenuItemRetrieveUpdateDestroyView,menu_item_list_create_view
from .views import review_list_create,ReviewRetrieveDestroyView

urlpatterns = [
    path('categories/', category_list_create, name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveDestroyView.as_view(), name='category-detail-destroy'),

    path('menu-items/', menu_item_list_create_view, name='menuitem-list-create'),
    path('menu-items/<int:pk>/', MenuItemRetrieveUpdateDestroyView.as_view(), name='menuitem-detail-destroy'),

    path('reviews/', review_list_create, name='review-list-create'),
    path('reviews/<int:pk>/', ReviewRetrieveDestroyView.as_view(), name='review-detail-destroy'),
]
