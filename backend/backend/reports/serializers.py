
from rest_framework import serializers
from .models import Notification
from rest_framework.decorators import api_view

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

