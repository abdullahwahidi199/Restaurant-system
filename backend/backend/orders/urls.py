from django.urls import path
from .views import order_list_create, OrderRetrieveDestroyView

urlpatterns = [
    path('orders/', order_list_create, name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveDestroyView.as_view(), name='order-detail-destroy'),
]
