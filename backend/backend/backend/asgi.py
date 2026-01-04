"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# backend/asgi.py  (update path to your project name if different)
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import orders.routing  # we'll create this file

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(  # optional auth middleware
            URLRouter(
                orders.routing.websocket_urlpatterns
            )
        ),
    }
)
