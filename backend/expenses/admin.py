from django.contrib import admin
from .models import Expenses,ExpenseHistory

# Register your models here.
admin.site.register(Expenses)
admin.site.register(ExpenseHistory)