from django.urls import path
from .views import ExpenseDetailsView,expensesApi,ExpenseHistoryApiView

urlpatterns = [
    path('expenses/', expensesApi, name='expenses-api'),
    path('expenses/<int:id>/', ExpenseDetailsView.as_view(), name='expense-details'),
    path('expense-history/', ExpenseHistoryApiView.as_view(), name='expense-history'),
]
