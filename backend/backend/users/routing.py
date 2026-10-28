from django.urls import path

from .consumers import ActivityDashboardConsumer


websocket_urlpatterns = [
    path("ws/activity/", ActivityDashboardConsumer.as_asgi()),
]
