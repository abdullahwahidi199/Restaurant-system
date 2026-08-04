from rest_framework import serializers
from .models import Expenses,ExpenseHistory
class ExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenses
        fields = '__all__'
        read_only_fields = ['restaurant', 'branch']
    
class ExpenseHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model=ExpenseHistory
        fields='__all__'
