from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from .models import OTPVerification
from .serializers import SendOTPSerializer, VerifyOTPSerializer
from .services import send_otp, verify_otp


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']

        # Rate limit: 1 OTP per minute per phone per purpose
        recent_exists = OTPVerification.objects.filter(
            phone=phone,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(minutes=1),
        ).exists()

        if recent_exists:
            return Response(
                {'error': 'Please wait 60 seconds before requesting another OTP'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        send_otp(phone, purpose)

        return Response(
            {'message': 'OTP sent successfully'},
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        purpose = serializer.validated_data['purpose']

        success, message = verify_otp(phone, otp, purpose)

        if success:
            return Response({'message': message}, status=status.HTTP_200_OK)
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)