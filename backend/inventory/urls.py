from django.urls import path
from .views import (
    IngredientListCreateView,
    IngredientRetrieveUpdateDestroyView,
    MenuItemIngredientListCreateView,
    MenuItemIngredientDeleteView,
    StockMovementListView,
    low_stock_items,add_stock_view,adjust_stock_view,
    inventory_dashboard_summary
)

urlpatterns = [
    path('ingredients/', IngredientListCreateView.as_view()),
    path('ingredients/<int:pk>/', IngredientRetrieveUpdateDestroyView.as_view()),

    path('recipes/', MenuItemIngredientListCreateView.as_view()),
    path('recipes/<int:pk>/', MenuItemIngredientDeleteView.as_view()),

    path('stock-movements/', StockMovementListView.as_view()),
    path('low-stock/', low_stock_items),
    path('purchases/',add_stock_view),
    path('adjust-stock/', adjust_stock_view),
    path('inventory-summary/',inventory_dashboard_summary)
]