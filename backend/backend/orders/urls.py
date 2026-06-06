from django.urls import path
from .views import order_list_create, OrderRetrieveDestroyView,add_items_to_order,table_list_create,TableRetrieveUpdateDestroyView,update_order_status,cashier_reservations,mark_reservation_arrived,mark_reservation_no_show
from .views import assign_delivery,cashier_orders,cancel_order,kitchen_orders,create_online_order,cancel_online_order,reservation_list_create,ReservationRetrieveUpdateDestroyView,cancel_reservation,handle_order_bill_print
from .views import (bulk_update_order_items,request_discount,approve_discount_or_reject,manager_pending_discount_requests,
                    admin_pending_discount_requests,all_discount_requests,change_order_table,
                    cancel_order_item,update_order_item_status,mark_items_printed_to_kitchen,discount_card_details,discount_cards,
                    apply_discount_card,discount_card_actions,ready_kitchen_orders
                    )

urlpatterns = [
    path('orders/', order_list_create, name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveDestroyView.as_view(), name='order-detail-destroy'),
    path('orders/<int:pk>/update_status/', update_order_status, name='update_order_status'),
    path('orders/<int:pk>/bulk-update-items/',bulk_update_order_items),
    path('orders/<int:pk>/add-items/', add_items_to_order),
    path('order-items/<int:pk>/cancel/',cancel_order_item),
    path(
    "orders/<int:pk>/change-table/",
    change_order_table
),
    path(
    "order-items/<int:pk>/status/",
    update_order_item_status
),
    path("orders/<int:order_id>/discount-request/", request_discount, name="request-discount"),
    path("discount-requests/",all_discount_requests),
    path("discounts/<int:pk>/approveOrReject/", approve_discount_or_reject, name="approve-discount"),
    path('kitchen-orders/',kitchen_orders),
    path('ready-kitchen-orders/',ready_kitchen_orders),
    path(
    "kitchen/<int:order_id>/mark-items-printed/",
    mark_items_printed_to_kitchen,
),
    path('tables/',table_list_create),
    path('tables/<int:pk>/',TableRetrieveUpdateDestroyView.as_view()),
    path('orders/<int:pk>/assign-delivery/', assign_delivery, name='assign_delivery'),
    path('cashier/orders/', cashier_orders),
    path('<int:pk>/cancel/',cancel_order),
    path('print/<int:pk>/',handle_order_bill_print),

    path(
    "manager/discount-requests/pending/",
    manager_pending_discount_requests
),
path(
    "admin/discount-requests/pending/",
    admin_pending_discount_requests
),
    path('online-orders/<slug:slug>/', create_online_order, name='create_online_order'),
    path('online-orders/<slug:slug>/<int:pk>/cancel/', cancel_online_order, name='cancel_online_order'),

    path('reservations/',reservation_list_create),
    path('reservations/<int:pk>/',ReservationRetrieveUpdateDestroyView.as_view()),
    path('cancel-reservation/<int:pk>/',cancel_reservation),

    path('cashier/reservations/',cashier_reservations),
    path('cashier/reservations/<int:pk>/arrive/',mark_reservation_arrived),
    path('cashier/reservations/<int:pk>/no_show/',mark_reservation_no_show),

    path('discount-cards/', discount_cards, name='discount-cards'),
    path('discount-cards/<int:pk>/', discount_card_details, name='discount-card-details'),
    path('discount-cards-actions/<int:pk>/', discount_card_actions, name='discount-card-actions'),
    path('discount-cards/<int:pk>/apply/', apply_discount_card, name='apply-discount-card'),

]
