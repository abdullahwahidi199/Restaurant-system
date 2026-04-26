import random
from django.utils import timezone
from datetime import timedelta
from .models import OTPVerification
from .sms_backends import get_sms_backend


def generate_otp(length=6):
    """Generate a numeric OTP of given length."""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


def send_otp(phone, purpose):
    """
    Generate and send an OTP to the given phone number.
    Invalidates any previous unverified OTPs for the same phone + purpose.
    """
    # Invalidate previous unverified OTPs so only the latest one is valid
    OTPVerification.objects.filter(
        phone=phone,
        purpose=purpose,
        is_verified=False,
    ).update(is_verified=True)

    otp = generate_otp()

    OTPVerification.objects.create(
        phone=phone,
        otp=otp,
        purpose=purpose,
    )

    backend = get_sms_backend()
    backend.send(phone, otp)

    return otp


def verify_otp(phone, otp, purpose):
    """
    Verify the OTP for the given phone and purpose.
    Returns (success: bool, message: str).
    """
    try:
        record = OTPVerification.objects.filter(
            phone=phone,
            purpose=purpose,
            is_verified=False,
        ).latest('created_at')
    except OTPVerification.DoesNotExist:
        return False, "No pending OTP found. Please request a new one."

    if record.is_expired:
        return False, "OTP has expired. Please request a new one."

    if not record.can_attempt:
        return False, "Maximum attempts reached. Please request a new OTP."

    record.attempts += 1

    if record.otp != otp:
        remaining = record.max_attempts - record.attempts
        record.save()
        return False, f"Invalid OTP. {remaining} attempt(s) remaining."

    record.is_verified = True
    record.save()
    return True, "Phone number verified successfully."


def is_phone_verified(phone, purpose, within_minutes=10):
    """
    Check if the phone was verified recently (within_minutes) for the given purpose.
    Used by signup / checkout views to gate actions.
    """
    return OTPVerification.objects.filter(
        phone=phone,
        purpose=purpose,
        is_verified=True,
        created_at__gte=timezone.now() - timedelta(minutes=within_minutes),
    ).exists()