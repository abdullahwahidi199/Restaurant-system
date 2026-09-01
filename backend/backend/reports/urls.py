from django.urls import path
from .views import DashboardSummaryAPIView,NotificationListView,MarkAsReadView,generate_report,orders_pdf_report,finance_pdf_report,inventory_pdf_report
from .views import staff_pdf_report
from .menu_item_views import menu_item_sales_pdf
urlpatterns=[
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkAsReadView.as_view(), name='notification-read'),
    path('dashboard-summary/',DashboardSummaryAPIView.as_view()),
    path('generate_report/', generate_report, name='generate_report'),
    path('finance-pdf/',finance_pdf_report),
    path("orders-pdf/", orders_pdf_report),
    path("inventory-pdf/", inventory_pdf_report),
    path('staff-pdf/',staff_pdf_report),
    path('menu-items-pdf/', menu_item_sales_pdf, name='menu-item-sales-pdf'),

]
