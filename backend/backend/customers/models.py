from django.db import models

from django.contrib.auth.models import User
from restaurants.models import Restaurant
# Create your models here.
#The Customer model is mainly  for registered users, i.e., customers who have accounts and log in.
# if not logged in and dont want to sign up, they will be asked name,phone and address while ordering.
class Customer(models.Model):
    user=models.OneToOneField(User,on_delete=models.SET_NULL,null=True,blank=True)
    # restaurant=models.ForeignKey(Restaurant, on_delete=models.CASCADE,null=True,blank=True,related_name='customers')
    phone = models.CharField(max_length=15)
    address=models.TextField(null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.user.username if self.user else self.phone
    
    def get_active_orders(self):
        return self.orders.filter(status__in=['pending,ready'])
        
    def get_orders_history(self):
        return self.orders.exclude(status__in=['pending', 'preparing', 'ready'])


class CustomerAddress(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    label = models.CharField(max_length=40, default="Home")
    address_line = models.TextField()
    area = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    instructions = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-updated_at", "id"]
        indexes = [
            models.Index(
                fields=["customer", "is_default"],
                name="cust_addr_default_idx",
            ),
        ]

    def __str__(self):
        return f"{self.customer} - {self.label}"
