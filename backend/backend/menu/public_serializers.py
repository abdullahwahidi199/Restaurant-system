"""Customer whitelists. Never reuse serializers containing recipes or costs."""
from rest_framework import serializers

from .models import Category, MenuItem, Platter
from .serializers import get_serializer_branch


class PublicMenuItemSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    final_availability = serializers.SerializerMethodField()
    production_remaining = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id", "branch", "category", "category_name", "name", "name_dari",
            "name_pashto", "description", "description_dari", "description_pashto",
            "price", "image", "is_available", "final_availability", "display_order",
            "uses_daily_production", "production_remaining",
        ]

    def get_price(self, obj):
        return str(obj.get_effective_price(get_serializer_branch(self)))

    def get_is_available(self, obj):
        return obj.is_available_for_branch(get_serializer_branch(self))

    def get_final_availability(self, obj):
        return self.get_is_available(obj)

    def get_production_remaining(self, obj):
        if not obj.uses_daily_production:
            return None
        production = obj.get_production(branch=get_serializer_branch(self))
        return production.quantity_remaining if production else 0


class PublicPlatterSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    final_availability = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Platter
        fields = [
            "id", "branch", "category", "category_name", "name", "name_dari",
            "name_pashto", "description", "description_dari", "description_pashto",
            "price", "image", "is_available", "final_availability", "display_order",
        ]

    def get_price(self, obj):
        return str(obj.get_effective_price(get_serializer_branch(self)))

    def get_is_available(self, obj):
        return obj.is_available_for_branch(get_serializer_branch(self))

    def get_final_availability(self, obj):
        return self.get_is_available(obj)


class PublicCategorySerializer(serializers.ModelSerializer):
    menu_items = PublicMenuItemSerializer(many=True, read_only=True)
    platters = PublicPlatterSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "rank", "image", "name", "name_dari", "name_pashto", "description", "branch", "menu_items", "platters"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.context.get("summary_only"):
            self.fields.pop("menu_items")
            self.fields.pop("platters")
