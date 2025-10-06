from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Order, OrderItem
from .seriailizers import OrderSerializer


@api_view(['GET', 'POST'])
def order_list_create(request):
    if request.method == 'GET':
       
        orders = Order.objects.prefetch_related('items__menu_item', 'customer').all()
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
