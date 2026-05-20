from rest_framework import serializers
from .models import Ingredient,MenuItemIngredient,StockMovement

class IngredientSerializer(serializers.ModelSerializer):
    menu_items_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Ingredient
        fields = '__all__'

class MenuItemIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    unit = serializers.ReadOnlyField(source='ingredient.unit')
    unit_cost = serializers.ReadOnlyField(source='ingredient.cost_per_unit')

    ingredient_cost = serializers.SerializerMethodField()
    class Meta:
        model=MenuItemIngredient
        fields = [
            'id',
            'menu_item',
            'ingredient',
            'ingredient_name',
            'unit_cost',
            'unit',
            'quantity_required',
            'ingredient_cost',
        ]
    def get_ingredient_cost(self, obj):
        return obj.quantity_required * obj.ingredient.cost_per_unit
class StockMovementSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    createt_by_name=serializers.ReadOnlyField(source='created_by.name')
    ingredient_unit = serializers.CharField(
        source="ingredient.unit",
        read_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "ingredient",
            "ingredient_name",
            "ingredient_unit",  # ADD THIS
            "createt_by_name",
            "change_quantity",
            "unit_cost",
            "note",
            "movement_type",
            "created_at",
            "restaurant",
            "related_order",
            "created_by",
        ]


from rest_framework import serializers
from .models import Ingredient


class IngredientUsageSerializer(serializers.ModelSerializer):

    menu_items = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "unit",
            "quantity_available",
            "minimum_threshold",
            "menu_items"
        ]

    def get_menu_items(self, obj):

        recipes = obj.menu_items.select_related(
            "menu_item"
        ).all()

        return [
            {
                "id": recipe.menu_item.id,
                "name": recipe.menu_item.name,
                "price": recipe.menu_item.price,
                "quantity_required": recipe.quantity_required,
                "is_available": recipe.menu_item.is_available
            }
            for recipe in recipes
        ]