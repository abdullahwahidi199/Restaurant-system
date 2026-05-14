from django.contrib import admin
from .models import MenuItem,Category,Review,Platter,PlatterItem
# Register your models here.

admin.site.register(MenuItem)
admin.site.register(Category)
admin.site.register(Review)
admin.site.register(Platter)
admin.site.register(PlatterItem)