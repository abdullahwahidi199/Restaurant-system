from rest_framework import serializers
from menu.serializers import MenuItemSerializer
from customers.serializers import CustomerProfileSerializer
from .models import OrderItem,Order
from customers.models import Customer

class OrderItemSerializer(serializers.ModelSerializer):
    item_name=serializers.ReadOnlyField(source='menu_item.name')
    item_price=serializers.ReadOnlyField(source='menu_item.price')
    subtotal=serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'item_name', 'item_price', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return obj.get_subtotal()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=True)
    total=serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'name', 'phone', 'address',
            'order_type', 'status', 'created_at', 'items', 'total'
        ]
        read_only_fields = [ 'created_at', 'total']

    def get_total(self, obj):
        return obj.get_total()
    
    def create(self,validated_data):
        items=validated_data.pop('items',[])
        request = self.context.get('request')   
        if request and request.user.is_authenticated:
            try:
                customer = request.user.customer
                validated_data['customer'] = customer
                validated_data.setdefault('name', customer.user.username)
                validated_data.setdefault('phone', customer.phone)
            except Customer.DoesNotExist:
                pass 
                
        order=Order.objects.create(**validated_data)

        for item in items:
            OrderItem.objects.create(order=order,**item)

        return order