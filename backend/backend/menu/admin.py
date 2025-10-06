from django.contrib import admin
from .models import MenuItem,Category,Review
# Register your models here.

admin.site.register(MenuItem)
admin.site.register(Category)
admin.site.register(Review)