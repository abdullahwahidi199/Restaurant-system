from rest_framework import serializers
from menu.serializers import MenuItemSerializer
from customers.serializers import CustomerProfileSerializer
from .models import OrderItem,Order,Table
from customers.models import Customer
from users.models import Staff

class OrderItemSerializer(serializers.ModelSerializer):
    item_name=serializers.ReadOnlyField(source='menu_item.name')
    item_price=serializers.ReadOnlyField(source='menu_item.price')
    subtotal=serializers.SerializerMethodField()
    table_number = serializers.ReadOnlyField(source="order.table.number")

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'item_name', 'item_price', 'quantity', 'subtotal','table_number','is_new']

    def get_subtotal(self, obj):
        return obj.get_subtotal()

class OrderMiniSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()
    class Meta:
        model=Order
        fields=['name','phone','items','total','id','status']
    
    def get_total(self, obj):
        return obj.get_total()

class DeliveryBoyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'name', 'vehicle_number']

class TableSerializer(serializers.ModelSerializer):
    orders=OrderMiniSerializer(many=True,read_only=True)
    current_order=serializers.SerializerMethodField()
    class Meta:
        model=Table
        fields=['id','number','capacity','note','status','orders','current_order']
    def get_current_order(self,obj):
        current = obj.orders.filter(
            status__in=['pending', 'in_progress', 'ready', 'served']
        ).first()
        if current:
                return OrderMiniSerializer(current).data
        return None

class TableMiniSerializer(serializers.ModelSerializer):
    
    class Meta:
        model=Table
        fields=['number']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), required=False)
    tableNumber=serializers.CharField(source="table.number",read_only=True)
    
    delivery_boy = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.filter(role='DeliveryBoy'),
        required=False,
        allow_null=True
    )
    delivery_boy_details = DeliveryBoyMiniSerializer(source='delivery_boy', read_only=True)
    preparation_time = serializers.ReadOnlyField()
    waiter=serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.filter(role="Waiter"),
        required=False,
        allow_null=True
    )
    waiter_name=serializers.CharField(source="waiter.name",read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'name', 'phone', 'address', 'note','tableNumber',
            'order_type','table', 'order_type_display', 'status', 'status_display','waiter','waiter_name',
            'created_at', 'updated_at','delivery_boy','delivery_boy_details', 'items', 'total','preparation_time',
        ]
        read_only_fields = ['created_at', 'updated_at', 'total']

    def get_total(self, obj):
        return obj.get_total()
    def validate(self, data):
        if data.get('order_type') == 'dine-in' and not data.get('table'):
            raise serializers.ValidationError("A dine-in order must have a table.")
        return data
    

    
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
