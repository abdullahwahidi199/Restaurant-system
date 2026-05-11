from django.contrib import admin
from .models import Order,OrderItem,Table,Reservation,DiscountRequest
# Register your models here.
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Table)
admin.site.register(Reservation)
admin.site.register(DiscountRequest)