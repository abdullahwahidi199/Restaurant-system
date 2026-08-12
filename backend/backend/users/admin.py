from django.contrib import admin
from .models import Attendance, LoginRateLimitConfig, Payroll, PayrollPayment, SalaryAdvance, Staff, Shift

admin.site.register(Staff)
admin.site.register(Shift)
admin.site.register(Attendance)
admin.site.register(Payroll)
admin.site.register(SalaryAdvance)
admin.site.register(PayrollPayment)
admin.site.register(LoginRateLimitConfig)
# Register your models here.
