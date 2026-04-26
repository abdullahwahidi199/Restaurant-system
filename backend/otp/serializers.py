from rest_framework import serializers


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    purpose = serializers.ChoiceField(choices=['signup', 'checkout'])


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=4)
    purpose = serializers.ChoiceField(choices=['signup', 'checkout'])