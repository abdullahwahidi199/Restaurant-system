from django.db import models
from menu.models import MenuItem
from users.models import Staff
from django.utils import timezone
from datetime import timedelta
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


    # the statuses vary based on the order type:
    # 1. if it is dine in, first when the waiter created the order the status will be pending which will be displayed
    # in the kitchen and then the kitchen marks that in progress and ready, then the waiter carries that order ot the table, and marks the order as served
    # then this served order will be shown in cashier UI meaning Cashier will only see orders with served status if the type is dine-in
    # and once he prints the bill the status will become comleted

    #2. if the order is takeaway, once the order is created maybe be a watier or a specific device, the status will be pending and will be shown in the kitchen
    # UI and they will mark it in progress and ready respectively, once ready the waiter takes the order to the cashier and tell the customer to pay the 
    # bill and get his order, when the cashier prints the bill for him the status will become picked up and once it is confirmed it will be marked completed 
    # meaning cashier will only see the orders with ready status if the type is takeaway

    #3. if it is online order, upon creation the status will be pending and will be shown in the kitchen and the mark it in progress and ready, once ready
    # the waiter in the kitchen passes the order to the cashier or someone beside him and then he calls for an available dilevey boy and then the 
    # delivery boy will be given the bill of that order while printing that bill
    # the status of the order will also be changed to out for delivery and here the the delivey boy must also be saved for that order
    # # and once he is back after givin the money to the cashier will mark the order as completed
    # meaning here also cashier sees online ordes with status ready
    STATUS_CHOICES = [
    # Common
    ('pending', 'Pending'),
    ('in_progress', 'In Progress'),
    ('ready', 'Ready'),
    ('completed', 'Completed'),

    # Dine-in specific
    ('served', 'Served'),
    

    # Takeaway specific
   
    ('picked_up', 'Picked Up'),

    # Delivery specific
    ('out_for_delivery', 'Out for Delivery'),
    ('delivered', 'Delivered'),
]


    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE,
        related_name='orders', null=True, blank=True
    )
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    preparation_start = models.DateTimeField(null=True, blank=True)
    preparation_end = models.DateTimeField(null=True, blank=True)
    address = models.TextField(blank=True)
    table = models.ForeignKey(
        'Table', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    waiter=models.ForeignKey(Staff,on_delete=models.SET_NULL,null=True,blank=True,related_name='orders')
    delivery_boy = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'DeliveryBoy'},
        related_name='deliveries'
    )
    def __str__(self):
        return f"Order #{self.id} - {self.name}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    @property
    def current_order(self):
        return self.orders.filter(
            status__in=['pending', 'in_progress', 'ready', 'served']
        ).first()
    
    @property
    def preparation_time(self):
        if self.preparation_start and self.preparation_end:
            diff = self.preparation_end - self.preparation_start

            return round (diff.total_seconds()/60)
        return None

    def save(self, *args, **kwargs):
        if self.pk:
            old_status=Order.objects.filter(pk=self.pk).values_list('status',flat=True).first()
            if old_status !=self.status:
                if self.status == 'in_progress' and not self.preparation_start:
                    self.preparation_start = timezone.now()
                elif self.status == 'ready' and not self.preparation_end:
                    self.preparation_end = timezone.now()

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
