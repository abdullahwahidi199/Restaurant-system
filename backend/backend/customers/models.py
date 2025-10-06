from django.db import models

from django.contrib.auth.models import User

# Create your models here.
#The Customer model is mainly  for registered users, i.e., customers who have accounts and log in.
# if not logged in and dont want to sign up, they will be asked name,phone and address while ordering.
class Customer(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,null=True,blank=True)
    phone = models.CharField(max_length=15)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username if self.user else self.phone
    
    def get_active_orders(self):
        return self.orders.filter(status__in=['pending,ready'])
        
    def get_orders_history(self):
        return self.orders.exclude(status__in=['pending', 'preparing', 'ready'])