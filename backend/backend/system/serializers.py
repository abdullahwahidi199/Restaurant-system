from rest_framework import serializers

from .models import RestaurantInfo
class ResInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model=RestaurantInfo
        fields="__all__"