from rest_framework import serializers
from .models import  Category, MenuItem,Review
from customers.models import Customer
from django.utils import timezone

class ReveiwMiniSerializer(serializers.ModelSerializer):
    customer=serializers.CharField(source="customer.user.username",read_only=True)
    
    class Meta:
        model=Review
        fields=['id','customer','comment','rating']

class MenuItemMiniSerializer(serializers.ModelSerializer):
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price','image','is_available','reviews'] 

class CustomerMiniSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = Customer
        fields = ['id', 'username']  


class CategorySerializer(serializers.ModelSerializer):
    menu_items=MenuItemMiniSerializer(read_only=True,many=True) #dont need to use the actual seriliazer because we just need the id, and other 
                                                                #infos will be accessed using this id in the veiws using prefetch related
    class Meta:
        model = Category
        fields = ['id', 'name', 'description','menu_items']

class ReveiwSerializer(serializers.ModelSerializer):
    # customer = serializers.PrimaryKeyRelatedField(
    #     queryset=Customer.objects.all()
    # )
    # menu_item=MenuItemMiniSerializer(read_only=True)
    menu_item_name=serializers.CharField(source="menu_item.name",read_only=True)
    customerName=serializers.CharField(source='customer.user.username',read_only=True)
    class Meta:
        model=Review
        fields=['id','customer','menu_item','delivery','comment','rating','response','created_at','responded_at','menu_item_name','customerName']

    def update(self, instance, validated_data):
        
        response_text = validated_data.get("response", None)
        if response_text and not instance.responded_at:
            instance.responded_at = timezone.now()
        return super().update(instance, validated_data)
class MenuItemSerializer(serializers.ModelSerializer):
    
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_available','category','reviews']

