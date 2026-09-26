from django.urls import path

from .views import AuditLogListView, ProductionMovementListView


urlpatterns = [
    path("production-movements/", ProductionMovementListView.as_view(), name="production-movement-list"),
    path("", AuditLogListView.as_view(), name="audit-log-list"),
]
