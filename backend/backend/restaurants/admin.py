from django.contrib import admin
from .models import Branch, Restaurant, Subscription

# Register your models here.
admin.site.register(Restaurant)
admin.site.register(Subscription)
admin.site.register(Branch)
