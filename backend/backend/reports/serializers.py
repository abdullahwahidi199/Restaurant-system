
from rest_framework import serializers
from .models import Notification
from rest_framework.decorators import api_view
from django.utils import timezone


class DashboardSalesQuerySerializer(serializers.Serializer):
    start_date = serializers.DateField(input_formats=["%Y-%m-%d"])
    end_date = serializers.DateField(input_formats=["%Y-%m-%d"])
    interval = serializers.ChoiceField(choices=["auto", "day", "week", "month"], default="auto")

    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError({"end_date": "End date must be on or after start date."})
        if attrs["end_date"] > timezone.localdate():
            raise serializers.ValidationError({"end_date": "End date cannot be in the future."})
        return attrs

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

