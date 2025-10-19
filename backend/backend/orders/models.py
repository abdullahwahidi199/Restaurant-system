from django.db import models
from menu.models import MenuItem

class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('unavailable', 'Unavailable'),
    ]

    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
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
        ('served', 'Served'),
        ('completed', 'Completed'),
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
        'Table', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.name}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    @property
    def current_order(self):
        return self.orders.filter(
            status__in=['pending', 'in_progress', 'ready', 'served']
        ).first()

    def save(self, *args, **kwargs):
    # --- Enforce only one current order per table ---
        if self.table and self.status != 'completed':
            # Check if there’s another active order for the same table
            active_orders = Order.objects.filter(
                table=self.table,
                status__in=['pending', 'in_progress', 'ready', 'served']
            ).exclude(pk=self.pk)

            if active_orders.exists():
                raise ValueError(
                    f"Table {self.table.number} already has an active order (#{active_orders.first().id}). "
                    "Complete or remove it before creating a new one."
                )

            # Table should be occupied if there’s a current order
            self.table.status = 'occupied'

        elif self.table and self.status == 'completed':
            # When order completes, table becomes available
            self.table.status = 'available'

        # Save order first, then table status
        super().save(*args, **kwargs)
        if self.table:
            self.table.save(update_fields=['status'])



class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    is_new = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

    def get_subtotal(self):
        return self.quantity * self.menu_item.price
