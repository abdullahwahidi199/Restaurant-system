from django.urls import path
from .consumers import OrdersConsumer, TestConsumer


websocket_urlpatterns = [
    path("ws/orders/", OrdersConsumer.as_asgi()),
    path("ws/test/", TestConsumer.as_asgi()),
    
]
