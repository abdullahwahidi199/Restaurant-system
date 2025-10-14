from django.db import models

from menu.models import MenuItem

class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        
        ('unavailable', 'Unavailable'),
    ]
    number=models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=4) 
    status=models.CharField(max_length=20, choices=STATUS_CHOICES,default="available")
    note = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"Table {self.number} ({self.status})"
    
class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('dine-in', 'Dine-In'),
        ('takeaway', 'Takeaway'),
        ('delivery', 'Delivery'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE,
        related_name='orders', null=True, blank=True
    )
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    table = models.ForeignKey(
    'Table',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='orders'
)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True, null=True)  # 🔹 For special instructions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # 🔹 To track updates

    def __str__(self):
        return f"Order #{self.id} - {self.name}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    
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
