from django.urls import path
from .views import DashboardSummaryAPIView,NotificationListView,MarkAsReadView

urlpatterns=[
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkAsReadView.as_view(), name='notification-read'),
    path('dashboard-summary/',DashboardSummaryAPIView.as_view())
]