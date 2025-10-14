from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Order,Table
from .seriailizers import OrderSerializer,TableSerializer

@api_view(['GET', 'POST'])
def order_list_create(request):
    if request.method == 'GET':
        orders = Order.objects.prefetch_related('items__menu_item', 'customer').select_related('table').all()

        #  Filtering
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            orders = orders.filter(created_at__date__range=[start_date, end_date])

        search = request.query_params.get('search')
        if search:
            orders = orders.filter(Q(name__icontains=search) | Q(phone__icontains=search))

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class OrderRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Order.objects.prefetch_related('items__menu_item', 'customer')
    serializer_class = OrderSerializer


@api_view(['GET',"POST"])
def table_list_create(request):
    if request.method=='GET':
        tables=Table.objects.prefetch_related('orders').all()
        serializer=TableSerializer(tables,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        serializer=TableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TableRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.prefetch_related('orders')
    serializer_class = TableSerializer
