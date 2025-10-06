from django.db import models

from menu.models import MenuItem

class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('dine-in', 'Dine-In'),
        ('takeaway', 'Takeaway'),
        ('delivery', 'Delivery'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    # if a customer is already signed in, so he wont be
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='orders',null=True,blank=True)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    # name and phone are only asked if the user is not logged in. if logged in they should be autofilled.
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return f"Order #{self.id} - {self.customer.user.username}"
    
    def get_total(self):
        total = sum(item.get_subtotal() for item in self.items.all())
        return total
    
    def update_status(self, new_status):
        self.status = new_status
        self.save()

class OrderItem(models.Model):
    order=models.ForeignKey(Order,on_delete=models.CASCADE,related_name='items')
    menu_item=models.ForeignKey(MenuItem,on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"
    
    def get_subtotal(self):
        return self.quantity*self.menu_item.price
