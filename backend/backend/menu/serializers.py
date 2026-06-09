from rest_framework import serializers
from .models import  Category, MenuItem,Review,Platter,PlatterItem
from customers.models import Customer
from django.utils import timezone
from inventory.serializers import MenuItemIngredientSerializer
# from .serializers import PlatterSerializer

class ReveiwMiniSerializer(serializers.ModelSerializer):
    customer=serializers.CharField(source="customer.user.username",read_only=True)
    
    class Meta:
        model=Review
        fields=['id','customer','comment','rating']

class MenuItemMiniSerializer(serializers.ModelSerializer):
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    image=serializers.SerializerMethodField()
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price','image','is_available',
            'is_manually_available',
            'final_availability','reviews'] 
    def get_image(self, obj):
        return obj.image.url if obj.image else None

class CustomerMiniSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = Customer
        fields = ['id', 'username']  


class PlatterItemSerializer(serializers.ModelSerializer):

    menu_item_name = serializers.ReadOnlyField(
        source='menu_item.name'
    )

    class Meta:
        model = PlatterItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'quantity'
        ]

class PlatterSerializer(serializers.ModelSerializer):

    items = PlatterItemSerializer(many=True)
    unavailable_reasons = serializers.SerializerMethodField()
    category_name = serializers.ReadOnlyField(
        source='category.name'
    )

    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Platter

        fields = [
            'id',
            'restaurant',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'is_manually_available',
            'final_availability',
            'unavailable_reasons',
            'items',
            'total_cost'
        ]

        read_only_fields = [
            'restaurant'
        ]
    
    def get_unavailable_reasons(self, obj):
        if obj.final_availability:
            return []

        reasons = []

        for item in obj.items.select_related("menu_item"):
            if not item.menu_item.final_availability:
                reasons.append({
                    "type": "menu_item",
                    "id": item.menu_item.id,
                    "name": item.menu_item.name,
                })

        return reasons

    def get_total_cost(self, obj):

        total = 0

        for item in obj.items.all():

            total += (
                item.menu_item.get_cost_per_unit()
                * item.quantity
            )

        return total

    def create(self, validated_data):

        items_data = validated_data.pop('items')

        platter = Platter.objects.create(
            **validated_data
        )

        for item_data in items_data:

            PlatterItem.objects.create(
                platter=platter,
                **item_data
            )

        return platter

    def update(self, instance, validated_data):

        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if items_data is not None:

            instance.items.all().delete()

            for item_data in items_data:

                PlatterItem.objects.create(
                    platter=instance,
                    **item_data
                )

        return instance
    
    def to_internal_value(self, data):
        import json
        data = data.copy()

        items = data.get('items')

        if isinstance(items, str):

            try:
                data['items'] = json.loads(items)
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    'items': 'Invalid JSON format.'
                })

        return super().to_internal_value(data)

    def validate_items(self, value):

        if len(value) == 0:
            raise serializers.ValidationError(
                "Platter must contain at least one item."
            )

        return value

class CategorySerializer(serializers.ModelSerializer):
    platters = PlatterSerializer(
        read_only=True,
        many=True
    )
    menu_items=MenuItemMiniSerializer(read_only=True,many=True) #dont need to use the actual seriliazer because we just need the id, and other 
              
                                                      #infos will be accessed using this id in the veiws using prefetch related
    class Meta:
        model = Category
        fields = ['id', 'name', 'description','menu_items','platters'
]

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
    unavailable_reasons = serializers.SerializerMethodField()
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    ingredients=MenuItemIngredientSerializer(many=True,read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    cost_per_unit = serializers.SerializerMethodField()
    profit_per_unit = serializers.SerializerMethodField()
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_available',
            'is_manually_available','unavailable_reasons',
            'final_availability','category','reviews','ingredients','cost_per_unit','profit_per_unit']
    
    def get_cost_per_unit(self, obj):
        return obj.get_cost_per_unit()
    def get_profit_per_unit(self, obj):
        return obj.get_profit_per_unit()

    def get_unavailable_reasons(self, obj):
        if obj.final_availability:
            return []

        reasons = []

        for recipe in obj.ingredients.select_related("ingredient"):
            ingredient = recipe.ingredient

            if ingredient.quantity_available  < recipe.quantity_required:
                reasons.append({
                    "type": "ingredient",
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "required": recipe.quantity_required,
                    "available": ingredient.quantity_available,
                    "unit": ingredient.unit,
                })

        return reasons

# serializers.py

class MenuItemPrintSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ["name", "ingredients", "price"]

    def get_ingredients(self, obj):
        items = obj.ingredients.select_related("ingredient").all()

        return [
            f"{i.ingredient.name} ({i.quantity_required})"
            for i in items
        ]


class PlatterPrintSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Platter
        fields = ["name", "items", "price"]

    def get_items(self, obj):
        return [
            f"{i.menu_item.name} x{i.quantity}"
            for i in obj.items.select_related("menu_item").all()
        ]