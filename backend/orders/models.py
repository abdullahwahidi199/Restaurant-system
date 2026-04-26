from django.db import models
from menu.models import MenuItem
from users.models import Staff
from django.utils import timezone
from datetime import timedelta
from restaurants.models import Restaurant
from inventory.services import deduct_stock_for_order
import math

from decimal import Decimal
class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('unavailable', 'Unavailable'),
    ]
    restaurant = models.ForeignKey(
    Restaurant,
    on_delete=models.CASCADE,
    related_name="tables",
    null=True,
    blank=True
)
    
    
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allow_free_reservation = models.BooleanField(default=True)

    name = models.CharField(max_length=50,null=True,blank=True)
    capacity = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Table {self.name} ({self.status})"

    @property
    def current_order(self):
        return self.orders.filter(
            status__in=['pending', 'in_progress', 'ready', 'served']
        ).first()



class Reservation(models.Model):
    TYPE_CHOICES = [
        ('free', 'Free'),
        ('fee', 'Reservation Fee'),
        ('prepaid', 'Prepaid'),
    ]

    STATUS_CHOICES = [
        ('reserved', 'Reserved'),
        ('arrived', 'Arrived'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show','No Show')
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reservations')
    table = models.ForeignKey(
    Table,
    on_delete=models.CASCADE,  
    related_name='reservations'
)

    customer_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20, blank=True)

    guests = models.PositiveIntegerField(default=1)
    reservation_date = models.DateField()
    start_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)

    reservation_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='free')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reserved')

    created_by = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True,related_name='reservations')
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.table}"

    def is_active_now(self):
        if not self.start_time:
            return False

        now = timezone.now()
        end = self.end_time

        return self.start_time <= now <= end

    def matches_customer(self, name=None, phone=None):
        if phone and self.phone == phone:
            return True

        if name and self.customer_name and self.customer_name.lower() == name.lower():
            return True

        return False
    @property
    def end_time(self):
        if self.start_time and self.duration_minutes:
            return self.start_time + timedelta(minutes=self.duration_minutes)
        return None
    
    @property
    def total_price(self):
        if not self.duration_minutes:
            return 0

        hours = self.duration_minutes / 60

        # round up to next hour (important for business logic)
        billed_hours = math.ceil(hours)

        return billed_hours * self.table.price_per_hour
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

    #2. if the order is takeaway, once the order is created maybe be a cashier or a specific device, the status will be pending and will be shown in the kitchen
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
    ('cancelled', 'Cancelled'),
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
    restaurant = models.ForeignKey(
    Restaurant,
    on_delete=models.CASCADE,
    related_name="orders",
    null=True,
    blank=True
)
    reservation = models.ForeignKey(
    "Reservation",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="orders"
)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15,null=True,blank=True)
    preparation_start = models.DateTimeField(null=True, blank=True)
    preparation_end = models.DateTimeField(null=True, blank=True)
    stock_deducted = models.BooleanField(default=False)
    address = models.TextField(blank=True)
    table = models.ForeignKey(
        'Table', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True, blank=True)
    
    longitude = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_printed = models.BooleanField(default=False)
    created_by = models.ForeignKey(
    Staff,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='created_orders'
)
    received_by = models.ForeignKey(
    Staff,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='paid_orders')   
    paid_at = models.DateTimeField(null=True, blank=True)
    delivery_boy = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'DeliveryBoy'},
        related_name='deliveries'
    )
    delivery_fee = models.DecimalField(
    max_digits=6,
    decimal_places=2,
    default=0
)
    def __str__(self):
        return f"Order #{self.id} - {self.name}"

    
 

    from decimal import Decimal

    def get_total(self):
        items_total = sum(
            (item.get_subtotal() for item in self.items.all()),
            Decimal("0.00")
        )

        reservation_total = Decimal("0.00")

        if self.reservation:
            r = self.reservation

            if r.reservation_type == "fee":
                reservation_total = r.total_price

            elif r.reservation_type == "prepaid":
                reservation_total = max(
                    r.total_price - r.paid_amount,
                    Decimal("0.00")
                )

        # 🔥 FORCE delivery_fee to Decimal
        delivery_total = Decimal(str(self.delivery_fee)) if self.order_type == "delivery" else Decimal("0.00")

        return items_total + reservation_total + delivery_total
        
    
    @property
    def preparation_time(self):
        if self.preparation_start and self.preparation_end:
            diff = self.preparation_end - self.preparation_start

            return round (diff.total_seconds()/60)
        return None

    def save(self, *args, **kwargs):
 
        old_status = None
        if self.pk:
            old_status = Order.objects.filter(
                pk=self.pk
            ).values_list('status', flat=True).first()

        if old_status != self.status:
            if self.status == 'in_progress' and not self.preparation_start:
                self.preparation_start = timezone.now()
            elif self.status == 'ready' and not self.preparation_end:
                self.preparation_end = timezone.now()

      
        if self.table and self.status not in ['completed', 'cancelled']:
            active_orders = Order.objects.filter(
                table=self.table,
                status__in=['pending', 'in_progress', 'ready', 'served']
            ).exclude(pk=self.pk)

            if active_orders.exists():
                raise ValueError(
                    f"Table {self.table.name} already has an active order "
                    f"(#{active_orders.first().id})."
                )

            self.table.status = 'occupied'

        elif self.table and self.status in ['completed', 'cancelled']:
            self.table.status = 'available'
            print("became available")

        
        super().save(*args, **kwargs)

        
        if self.table:
            self.table.save(update_fields=['status'])
        
        if (
        old_status != self.status
        and self.status == 'in_progress'
        and not self.stock_deducted
    ):
            deduct_stock_for_order(self)
            self.stock_deducted = True
            super().save(update_fields=['stock_deducted'])




class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    is_new = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

    def get_subtotal(self):
        return self.quantity * self.menu_item.price
