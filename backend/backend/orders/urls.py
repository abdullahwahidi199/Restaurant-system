from django.urls import path
from .views import order_list_create, OrderRetrieveDestroyView,add_items_to_order,table_list_create,TableRetrieveUpdateDestroyView,update_order_status
from .views import assign_delivery,cashier_orders

urlpatterns = [
    path('orders/', order_list_create, name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveDestroyView.as_view(), name='order-detail-destroy'),
    path('orders/<int:pk>/update_status/', update_order_status, name='update_order_status'),
    path('orders/<int:pk>/add-items/', add_items_to_order),
    path('tables/',table_list_create),
    path('tables/<int:pk>/',TableRetrieveUpdateDestroyView.as_view()),
    path('orders/<int:pk>/assign-delivery/', assign_delivery, name='assign_delivery'),
    path('cashier/orders/', cashier_orders),
    

]
