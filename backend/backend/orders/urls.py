from django.urls import path
from .views import order_list_create, OrderRetrieveDestroyView,table_list_create,TableRetrieveUpdateDestroyView

urlpatterns = [
    path('orders/', order_list_create, name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveDestroyView.as_view(), name='order-detail-destroy'),
    path('tables/',table_list_create),
    path('tables/<int:pk>/',TableRetrieveUpdateDestroyView.as_view())
]
