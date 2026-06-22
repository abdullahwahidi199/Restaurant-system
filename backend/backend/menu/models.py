from django.db import models
from customers.models import Customer
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
# from orders.models import Order
from restaurants.models import Restaurant
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
# from inventory.utils import update_platter_availability_from_menu_item


from decimal import Decimal




class Category(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    name_dari = models.CharField(max_length=100, blank=True, null=True)
    name_pashto = models.CharField(max_length=100, blank=True, null=True)

    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True
    )

    rank = models.PositiveIntegerField(blank=True, null=True)
    class Meta:
        ordering = ['rank']
        # Prevent duplicate ranks within the same restaurant
        constraints = [
            models.UniqueConstraint(
                fields=['restaurant', 'rank'],
                name='unique_rank_per_restaurant'
            )
        ]
    def __str__(self):
        return self.name    
    

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.image:
            return

        try:
            img = Image.open(self.image.path)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            img.thumbnail((900, 900))

            img_io = BytesIO()
            img.save(
                img_io,
                format="JPEG",
                quality=70,
                optimize=True
            )

            name = self.image.name.split("/")[-1]

            self.image.save(
                name,
                ContentFile(img_io.getvalue()),
                save=False
            )

            super().save(update_fields=["image"])

        except Exception as e:
            print("Category image processing error:", e)
    
class MenuItem(models.Model):
    name=models.CharField(max_length=150)
    name_dari = models.CharField(max_length=150, blank=True, null=True)
    name_pashto = models.CharField(max_length=150, blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    description_dari = models.TextField(blank=True, null=True)
    description_pashto = models.TextField(blank=True, null=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items', null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_manually_available = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, related_name='menu_items')


    @property
    def final_availability(self):
        return (
            self.is_available
            and self.is_manually_available
        )
    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.image:
            return

        try:
            img = Image.open(self.image.path)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            img.thumbnail((900, 900))

            img_io = BytesIO()
            img.save(img_io, format="JPEG", quality=70, optimize=True)

            # IMPORTANT: prevent recursive filename issues
            name = self.image.name.split("/")[-1]

            self.image.save(
                name,
                ContentFile(img_io.getvalue()),
                save=False
            )

            super().save(update_fields=["image"])

        except Exception as e:
            print("Image processing error:", e)

        
    
    def mark_unavailable(self):
        self.is_available = False
        self.save(update_fields=["is_available"])

        from inventory.utils import (
            update_platter_availability_from_menu_item
        )

        update_platter_availability_from_menu_item(
            self
        )

    def mark_available(self):
        self.is_available = True
        self.save(update_fields=["is_available"])

        from inventory.utils import (
            update_platter_availability_from_menu_item
        )

        update_platter_availability_from_menu_item(
            self
        )

    
    def get_cost_per_unit(self, restaurant=None):
        qs = self.ingredients.all()

        if restaurant:
            qs = qs.filter(menu_item__restaurant=restaurant)

        return qs.aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("quantity_required") * F("ingredient__cost_per_unit"),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            )
        )["total"] or 0
    def get_profit_per_unit(self):
        cost=self.get_cost_per_unit()
        return Decimal(self.price) - Decimal(cost)



class Review(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='reviews')
    menu_item=models.ForeignKey(MenuItem,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)
    #every delivery can have reviews
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)
    delivery = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, related_name='review', null=True, blank=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    response = models.TextField(blank=True, null=True)  
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return f"{self.customer} - {self.menu_item.name} ({self.rating}/5)"

class Platter(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='platters'
    )

    name = models.CharField(max_length=150)

    name_dari = models.CharField(max_length=150, blank=True, null=True)
    name_pashto = models.CharField(max_length=150, blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    description_dari = models.TextField(blank=True, null=True)
    description_pashto = models.TextField(blank=True, null=True)

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to='platters/',
        blank=True,
        null=True
    )

    is_available = models.BooleanField(default=True)
    is_manually_available = models.BooleanField(default=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='platters'
    )

    def __str__(self):
        return self.name
    @property
    def final_availability(self):
        return self.is_available and self.is_manually_available
    
class PlatterItem(models.Model):
    platter = models.ForeignKey(
        Platter,
        on_delete=models.CASCADE,
        related_name='items'
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='platter_items'
    )

    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"
    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)

        from inventory.utils import (
            update_platter_availability
        )

        update_platter_availability(
            self.platter
        )