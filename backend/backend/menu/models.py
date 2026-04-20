from django.db import models
from customers.models import Customer
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
# from orders.models import Order

from decimal import Decimal

class Category(models.Model):
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class MenuItem(models.Model):
    name=models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, related_name='menu_items')

    def __str__(self):
        return self.name
    
    def mark_unavailable(self):
        self.is_available=False
        self.save()

    def mark_available(self):
        self.is_available = True
        self.save()
    def get_cost_per_unit(self):
        return (
            self.ingredients.aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F("quantity_required") * F("ingredient__cost_per_unit"),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )["total"] or 0
        )
    def get_profit_per_unit(self):
        cost=self.get_cost_per_unit()
        return Decimal(self.price) - Decimal(cost)



class Review(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='reviews')
    menu_item=models.ForeignKey(MenuItem,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)
    #every delivery can have reviews
    delivery = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, related_name='review', null=True, blank=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    response = models.TextField(blank=True, null=True)  
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return f"{self.customer} - {self.menu_item.name} ({self.rating}/5)"