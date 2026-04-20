from rest_framework import serializers
from .models import Ingredient,MenuItemIngredient,StockMovement

class IngredientSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = StockMovement
        fields = '__all__'