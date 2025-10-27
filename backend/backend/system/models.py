from django.db import models

# Create your models here.
class RestaurantInfo(models.Model):
    logo=models.ImageField(upload_to='logo/',blank=True,null=True)
    name=models.CharField(max_length=30)
    address=models.CharField(max_length=255)
    phone=models.CharField(max_length=10,blank=True,null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    opening_hours = models.CharField(max_length=100, blank=True, null=True)
    opening_hours = models.CharField(max_length=100, blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    x = models.URLField(blank=True, null=True)
    delivery_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name