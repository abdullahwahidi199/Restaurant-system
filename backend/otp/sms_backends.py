class ConsoleSMSBackend:
    """Development backend — prints OTP to console."""

    def send(self, phone, otp):
        print(f"\n{'=' * 40}")
        print(f"  OTP for {phone}: {otp}")
        print(f"  Expires in 5 minutes")
        print(f"{'=' * 40}\n")
        return True


class TwilioSMSBackend:
    """Production backend — sends OTP via Twilio."""

    def __init__(self):
        from django.conf import settings
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_FROM_NUMBER

    def send(self, phone, otp):
        from twilio.rest import Client

        client = Client(self.account_sid, self.auth_token)
        client.messages.create(
            body=f"Your verification code is {otp}. It expires in 5 minutes.",
            from_=self.from_number,
            to=phone,
        )
        return True


def get_sms_backend():
    from django.conf import settings

    backend_path = getattr(
        settings, 'OTP_SMS_BACKEND', 'otp.sms_backends.ConsoleSMSBackend'
    )
    module_path, class_name = backend_path.rsplit('.', 1)
    module = __import__(module_path, fromlist=[class_name])
    return getattr(module, class_name)()