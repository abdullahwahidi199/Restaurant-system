from django.contrib import admin
from .models import OTPVerification


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('phone', 'otp', 'purpose', 'is_verified', 'attempts', 'created_at')
    list_filter = ('purpose', 'is_verified')
    search_fields = ('phone',)
    readonly_fields = ('created_at',)