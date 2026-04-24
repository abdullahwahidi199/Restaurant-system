from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework import status, generics

from .models import Expenses,ExpenseHistory
from .serializers import ExpensesSerializer,ExpenseHistorySerializer
from rest_framework.response import Response
from restaurants.permissions import IsRestaurantAdmin,IsCashier,IsKitchenManager,IsSameRestaurant,IsRestaurantActive
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import RetrieveUpdateDestroyAPIView
# Create your views here.
@api_view(['GET','POST'])
@permission_classes([IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive])
def expensesApi(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    print(restaurant)
    if request.method=='GET':
        expenses=Expenses.objects.filter(restaurant=restaurant).all()
        serializer=ExpensesSerializer(expenses,many=True)
        return Response(serializer.data)
    if request.method=='POST':
        serializer=ExpensesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant)
            return Response({'message':'New Expense saved!'})
        
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class ExpenseDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = ExpensesSerializer
    permission_classes = [IsRestaurantAdmin, IsSameRestaurant,IsRestaurantActive]
    lookup_field = 'id'

    def get_queryset(self):
        staff = self.request.user.staff_profile
        return Expenses.objects.filter(restaurant=staff.restaurant)

class ExpenseHistoryApiView(generics.ListAPIView):
    serializer_class=ExpenseHistorySerializer
    permission_classes = [IsRestaurantAdmin, IsSameRestaurant,IsRestaurantActive]

    def get_queryset(self):
        staff=self.request.user.staff_profile
        return ExpenseHistory.objects.filter(restaurant=staff.restaurant).order_by('-date_time')