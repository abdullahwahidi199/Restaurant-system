from django.urls import path

from .consumers import CustomerOrderConsumer


websocket_urlpatterns = [
    path(
        "ws/customer/orders/<int:order_id>/",
        CustomerOrderConsumer.as_asgi(),
    ),
]
