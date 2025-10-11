from rest_framework import serializers
from .models import  Category, MenuItem,Review
from customers.models import Customer


class MenuItemMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price','image'] 

class CustomerMiniSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = Customer
        fields = ['id', 'username']  
class ReveiwMiniSerializer(serializers.ModelSerializer):
    customer=serializers.CharField(source="customer.user.username",read_only=True)
    
    class Meta:
        model=Review
        fields=['id','customer','comment','rating']

class CategorySerializer(serializers.ModelSerializer):
    menu_items=MenuItemMiniSerializer(read_only=True,many=True) #dont need to use the actual seriliazer because we just need the id, and other 
                                                                #infos will be accessed using this id in the veiws using prefetch related
    class Meta:
        model = Category
        fields = ['id', 'name', 'description','menu_items']

class ReveiwSerializer(serializers.ModelSerializer):
    customer=CustomerMiniSerializer(read_only=True)
    menu_item=MenuItemMiniSerializer(read_only=True)
    class Meta:
        model=Review
        fields=['id','customer','menu_item','comment','rating']
class MenuItemSerializer(serializers.ModelSerializer):
    
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_available','category','reviews']

