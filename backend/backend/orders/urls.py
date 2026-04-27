from django.urls import path
from .views import order_list_create, OrderRetrieveDestroyView,add_items_to_order,table_list_create,TableRetrieveUpdateDestroyView,update_order_status,cashier_reservations,mark_reservation_arrived,mark_reservation_no_show
from .views import assign_delivery,cashier_orders,cancel_order,kitchen_orders,create_online_order,cancel_online_order,reservation_list_create,ReservationRetrieveUpdateDestroyView,cancel_reservation,handle_order_bill_print

urlpatterns = [
    path('orders/', order_list_create, name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveDestroyView.as_view(), name='order-detail-destroy'),
    path('orders/<int:pk>/update_status/', update_order_status, name='update_order_status'),
    path('orders/<int:pk>/add-items/', add_items_to_order),
    path('kitchen-orders/',kitchen_orders),
    path('tables/',table_list_create),
    path('tables/<int:pk>/',TableRetrieveUpdateDestroyView.as_view()),
    path('orders/<int:pk>/assign-delivery/', assign_delivery, name='assign_delivery'),
    path('cashier/orders/', cashier_orders),
    path('<int:pk>/cancel/',cancel_order),
    path('print/<int:pk>/',handle_order_bill_print),

    path('online-orders/<slug:slug>/', create_online_order, name='create_online_order'),
    path('online-orders/<slug:slug>/<int:pk>/cancel/', cancel_online_order, name='cancel_online_order'),

    path('reservations/',reservation_list_create),
    path('reservations/<int:pk>/',ReservationRetrieveUpdateDestroyView.as_view()),
    path('cancel-reservation/<int:pk>/',cancel_reservation),

    path('cashier/reservations/',cashier_reservations),
    path('cashier/reservations/<int:pk>/arrive/',mark_reservation_arrived),
    path('cashier/reservations/<int:pk>/no_show/',mark_reservation_no_show),
]
