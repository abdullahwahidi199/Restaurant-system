from rest_framework import serializers
from .models import (
    Category,
    MenuItem,
    Review,
    Platter,
    PlatterItem,
    Production,
    Station
)
from customers.models import Customer
from django.utils import timezone
from decimal import Decimal
from inventory.serializers import MenuItemIngredientSerializer
from restaurants.branching import get_active_branch
from inventory.services import get_effective_quantity, get_recipe_items
# from .serializers import PlatterSerializer


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            "id",
            "restaurant",
            "branch",
            "name",
            "name_dari",
            "name_pashto",
            "description",
            "is_default",
            "is_active",
        ]
        read_only_fields = ["id", "restaurant"]
def get_serializer_branch(serializer):
    branch = serializer.context.get("branch")
    if branch:
        return branch

    request = serializer.context.get("request")
    if request:
        return get_active_branch(request, raise_exception=False)

    return None


def get_serializer_restaurant(serializer):
    restaurant = serializer.context.get("restaurant")
    if restaurant:
        return restaurant

    request = serializer.context.get("request")
    if request and hasattr(request.user, "staff_profile"):
        return request.user.staff_profile.restaurant

    return None

from django.db.models import Q
def scope_menu_related_queryset(queryset, restaurant, branch):
    if branch:
        # Include BOTH branch-specific items AND restaurant-wide items (where branch is NULL)
        return queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
    return queryset

class ReveiwMiniSerializer(serializers.ModelSerializer):
    customer=serializers.CharField(source="customer.user.username",read_only=True)
    
    class Meta:
        model=Review
        fields=['id','customer','comment','rating']

class MenuItemMiniSerializer(serializers.ModelSerializer):
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    image=serializers.SerializerMethodField()
    production_remaining = serializers.SerializerMethodField()
    final_availability = serializers.SerializerMethodField()
    station = serializers.PrimaryKeyRelatedField(
        queryset=Station.objects.all(),
        required=False,
        allow_null=True
    )
    station_name = serializers.CharField(source="station.name", read_only=True) 
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name','name_dari','name_pashto', 'price','image','is_available',
            'is_manually_available',
            'final_availability','category','reviews','uses_daily_production', 'production_remaining','station','station_name'] 
    def get_image(self, obj):
        return obj.image.url if obj.image else None

    def to_representation(self, obj):
        data = super().to_representation(obj)
        branch = get_serializer_branch(self)
        data["price"] = str(obj.get_effective_price(branch))
        data["is_available"] = obj.get_effective_stock_availability(branch)
        data["is_manually_available"] = obj.get_effective_manual_availability(branch)
        data["final_availability"] = obj.is_available_for_branch(branch)
        return data

    def get_production_remaining(self, obj):
        prod = obj.get_production(branch=get_serializer_branch(self))
        return prod.quantity_remaining if prod else 0

    def get_final_availability(self, obj):
        return obj.is_available_for_branch(get_serializer_branch(self))

class CustomerMiniSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = Customer
        fields = ['id', 'username']  


class PlatterItemSerializer(serializers.ModelSerializer):

    menu_item_name = serializers.ReadOnlyField(
        source='menu_item.name'
    )
    quantity = serializers.DecimalField(
        max_digits=8,
        decimal_places=3,
        coerce_to_string=False,
        help_text="Supports float quantities like 0.2 or 0.5."
    )

    class Meta:
        model = PlatterItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'quantity'
        ]

    def validate_quantity(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = get_serializer_restaurant(self)
        branch = get_serializer_branch(self)
        if restaurant:
            self.fields["menu_item"].queryset = scope_menu_related_queryset(
                MenuItem.objects.filter(restaurant=restaurant),
                restaurant,
                branch,
            )

class PlatterSerializer(serializers.ModelSerializer):

    items = PlatterItemSerializer(many=True)
    unavailable_reasons = serializers.SerializerMethodField()
    category_name = serializers.ReadOnlyField(
        source='category.name'
    )

    total_cost = serializers.SerializerMethodField()
    station = serializers.PrimaryKeyRelatedField(
    queryset=Station.objects.all(),
    required=False,
    allow_null=True
)
    station_name = serializers.CharField(source="station.name", read_only=True)
    class Meta:
        model = Platter

        fields = [
            'id',
            'restaurant',
            'branch',
            'category',
            'category_name',
            'name',
            'name_dari',
            'name_pashto',
            'description',
            'description_dari',
            'description_pashto',
            'price',
            'image',
            'is_available',
            'is_manually_available',
            'final_availability',
            'unavailable_reasons',
            'items',
            'total_cost',
            'station',
            'station_name',
        ]

        read_only_fields = [
            'restaurant',
            'branch',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = get_serializer_restaurant(self)
        branch = get_serializer_branch(self)
        if restaurant:
            self.fields["category"].queryset = scope_menu_related_queryset(
                Category.objects.filter(restaurant=restaurant),
                restaurant,
                branch,
            )
            self.fields["items"].child.fields["menu_item"].queryset = (
                scope_menu_related_queryset(
                    MenuItem.objects.filter(restaurant=restaurant),
                    restaurant,
                    branch,
                )
            )
            if "station" in self.fields:
                self.fields["station"].queryset = scope_menu_related_queryset(
                    Station.objects.filter(restaurant=restaurant),
                    restaurant,
                    branch,
                )
    def to_internal_value(self, data):
        import json

        # multipart/form-data comes as QueryDict.
        # Convert it to a normal dict so nested serializer can read "items".
        if hasattr(data, "getlist"):
            data = {key: data.get(key) for key in data.keys()}
        else:
            data = data.copy()

        items = data.get("items")

        if isinstance(items, str):
            try:
                data["items"] = json.loads(items)
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    "items": "Invalid JSON format."
                })

        return super().to_internal_value(data)
    def validate(self, attrs):
        items = attrs.get("items")

        if not items:
            raise serializers.ValidationError({
                "items": "This field is required."
            })

        if len(items) == 0:
            raise serializers.ValidationError({
                "items": "Platter must contain at least one item."
            })

        return attrs
    
    def get_unavailable_reasons(self, obj):
        branch = get_serializer_branch(self)
        if obj.is_available_for_branch(branch):
            return []

        reasons = []

        for item in obj.items.select_related("menu_item"):
            if not item.menu_item.is_available_for_branch(branch):
                reasons.append({
                    "type": "menu_item",
                    "id": item.menu_item.id,
                    "name": item.menu_item.name,
                })

        return reasons

    def get_total_cost(self, obj):

        total = 0
        branch = get_serializer_branch(self)

        for item in obj.items.all():

            total += (
                item.menu_item.get_cost_per_unit(branch=branch)
                * item.quantity
            )

        return total

    def to_representation(self, obj):
        data = super().to_representation(obj)
        branch = get_serializer_branch(self)
        data["price"] = str(obj.get_effective_price(branch))
        data["is_available"] = obj.get_effective_stock_availability(branch)
        data["is_manually_available"] = obj.get_effective_manual_availability(branch)
        data["final_availability"] = obj.is_available_for_branch(branch)
        return data

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
        fields = ['id','rank', 'image','name','name_dari','name_pashto', 'description','branch','menu_items','platters'
]
        read_only_fields = ['branch']

class ReveiwSerializer(serializers.ModelSerializer):
    # customer = serializers.PrimaryKeyRelatedField(
    #     queryset=Customer.objects.all()
    # )
    # menu_item=MenuItemMiniSerializer(read_only=True)
    menu_item_name=serializers.CharField(source="menu_item.name",read_only=True)
    customerName=serializers.CharField(source='customer.user.username',read_only=True)
    class Meta:
        model=Review
        fields=['id','customer','menu_item','delivery','branch','comment','rating','response','created_at','responded_at','menu_item_name','customerName']
        read_only_fields = ['branch']

    def validate(self, attrs):
        delivery = attrs.get("delivery", getattr(self.instance, "delivery", None))
        menu_item = attrs.get("menu_item", getattr(self.instance, "menu_item", None))

        if delivery and menu_item and delivery.restaurant_id != menu_item.restaurant_id:
            raise serializers.ValidationError(
                {"menu_item": "This item belongs to another restaurant."}
            )

        return attrs

    def create(self, validated_data):
        delivery = validated_data.get("delivery")
        menu_item = validated_data.get("menu_item")

        if delivery:
            validated_data.setdefault("restaurant", delivery.restaurant)
            validated_data.setdefault("branch", delivery.branch)
        elif menu_item:
            validated_data.setdefault("restaurant", menu_item.restaurant)

        return super().create(validated_data)

    
    def update(self, instance, validated_data):
        
        response_text = validated_data.get("response", None)
        if response_text and not instance.responded_at:
            instance.responded_at = timezone.now()
        return super().update(instance, validated_data)
class MenuItemSerializer(serializers.ModelSerializer):
    unavailable_reasons = serializers.SerializerMethodField()
    reviews=ReveiwMiniSerializer(read_only=True,many=True)
    ingredients=serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    cost_per_unit = serializers.SerializerMethodField()
    profit_per_unit = serializers.SerializerMethodField()
    final_availability = serializers.SerializerMethodField()

    production_remaining = serializers.SerializerMethodField()
    production_produced = serializers.SerializerMethodField()
    station = serializers.PrimaryKeyRelatedField(
        queryset=Station.objects.all(),
        required=False,
        allow_null=True
    )
    station_name = serializers.CharField(source="station.name", read_only=True) 
    class Meta:
        model = MenuItem
        fields = ['id', 'branch', 'name','name_dari','name_pashto', 'description','description_dari','description_pashto', 'price', 'image', 'is_available',
            'is_manually_available','unavailable_reasons',
            'final_availability','category','reviews','ingredients','cost_per_unit','profit_per_unit',
            'uses_daily_production',         # 🆕
            'production_remaining',          # 🆕
            'production_produced',
             'station','station_name' ]
        read_only_fields = ['branch']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = get_serializer_restaurant(self)
        branch = get_serializer_branch(self)
        if restaurant:
            self.fields["category"].queryset = scope_menu_related_queryset(
                Category.objects.filter(restaurant=restaurant),
                restaurant,
                branch,
            )
            if "station" in self.fields:
                self.fields["station"].queryset = scope_menu_related_queryset(
                    Station.objects.filter(restaurant=restaurant),
                    restaurant,
                    branch,
                )

    
    def get_cost_per_unit(self, obj):
        return obj.get_cost_per_unit(branch=get_serializer_branch(self))

    def get_ingredients(self, obj):
        branch = get_serializer_branch(self)
        recipes = get_recipe_items(obj, branch=branch)
        return MenuItemIngredientSerializer(
            recipes,
            many=True,
            context={**self.context, "branch": branch},
        ).data
    def get_profit_per_unit(self, obj):
        branch = get_serializer_branch(self)
        return Decimal(obj.get_effective_price(branch)) - Decimal(
            obj.get_cost_per_unit(branch=get_serializer_branch(self))
        )

    def get_production_remaining(self, obj):
        prod = obj.get_production(branch=get_serializer_branch(self))
        return prod.quantity_remaining if prod else 0

    def get_production_produced(self, obj):
        prod = obj.get_production(branch=get_serializer_branch(self))
        return prod.quantity_produced if prod else 0

    def get_final_availability(self, obj):
        return obj.is_available_for_branch(get_serializer_branch(self))

    def get_unavailable_reasons(self, obj):
        if self.get_final_availability(obj):
            return []

        reasons = []

        if obj.uses_daily_production:
            prod = obj.get_production(branch=get_serializer_branch(self))
            if not prod:
                reasons.append({
                    "type": "production",
                    "message": "Not cooked yet"
                })
            elif prod.quantity_remaining <= 0:
                reasons.append({
                    "type": "production",
                    "message": "Sold out",
                    "produced": prod.quantity_produced,
                })
            return reasons

        branch = get_serializer_branch(self)
        for recipe in get_recipe_items(obj, branch=branch):
            ingredient = recipe.ingredient

            if get_effective_quantity(ingredient, branch) < recipe.quantity_required:
                reasons.append({
                    "type": "ingredient",
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "required": recipe.quantity_required,
                    "available": get_effective_quantity(ingredient, branch),
                    "unit": ingredient.unit,
                })

        return reasons

    def to_representation(self, obj):
        data = super().to_representation(obj)
        branch = get_serializer_branch(self)
        override = obj.get_branch_override(branch)
        data["base_price"] = str(obj.price)
        data["price"] = str(obj.get_effective_price(branch))
        data["branch_price_override"] = str(override.price) if override and override.price is not None else None
        data["is_available"] = obj.get_effective_stock_availability(branch)
        data["is_manually_available"] = obj.get_effective_manual_availability(branch)
        data["final_availability"] = obj.is_available_for_branch(branch)
        return data

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

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
    

class ProductionSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    is_sold_out = serializers.BooleanField(read_only=True)

    class Meta:
        model = Production
        fields = [
            'id', 'menu_item', 'menu_item_name',
            'quantity_produced', 'quantity_remaining', 'is_sold_out',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['quantity_remaining', 'created_at', 'updated_at']
