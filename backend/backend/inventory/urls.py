from django.urls import path
from .views import (
    IngredientListCreateView,
    IngredientPaginatedView,
    IngredientRetrieveUpdateDestroyView,
    MenuItemIngredientListCreateView,
    MenuItemIngredientDeleteView,
    StockMovementListView,
    inventory_pdf,
    low_stock_items,add_stock_view,adjust_stock_view,
    inventory_dashboard_summary,
    edit_stock_movement_view,
    search_ingredient_usage_view
)

urlpatterns = [
    path('ingredients/', IngredientListCreateView.as_view()),
    path('ingredientsPages/',IngredientPaginatedView.as_view()),
    path('ingredients/<int:pk>/', IngredientRetrieveUpdateDestroyView.as_view()),

    path('recipes/', MenuItemIngredientListCreateView.as_view()),
    path('recipes/<int:pk>/', MenuItemIngredientDeleteView.as_view()),

    path('stock-movements/', StockMovementListView.as_view()),
    path('stock-movements/<int:pk>/edit/', edit_stock_movement_view),

    path('low-stock/', low_stock_items),
    path('purchases/',add_stock_view),
    path('adjust-stock/', adjust_stock_view),
    path('inventory-summary/',inventory_dashboard_summary),
    path('inventory-pdf/',inventory_pdf),
    path('ingredient-usage/', search_ingredient_usage_view),
]