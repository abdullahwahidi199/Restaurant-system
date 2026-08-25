from django.db import models
from customers.models import Customer
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
# from orders.models import Order
from restaurants.models import Branch, Restaurant
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
# from inventory.utils import update_platter_availability_from_menu_item


from django.db import models
from django.utils.translation import gettext_lazy as _

class Station(models.Model):
    """
    Represents a kitchen preparation station (e.g., Main Kitchen, Juice Bar, Grill, Bakery).
    """
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="stations"
    )
    branch = models.ForeignKey(
        "restaurants.Branch",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="stations",
        help_text="Optional: If null, the station applies to all branches of the restaurant."
    )
    name = models.CharField(max_length=100)
    name_dari = models.CharField(max_length=100, blank=True, null=True)
    name_pashto = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_default = models.BooleanField(
        default=False,
        help_text="True if this is the default station (Main Kitchen) for the restaurant."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "name"]
        indexes = [
            models.Index(fields=["restaurant", "is_active"], name="station_rest_act_idx"),
            models.Index(fields=["restaurant", "is_default"], name="station_rest_def_idx"),
        ]
        unique_together = [["restaurant", "name", "branch"]]

    def __str__(self):
        if self.branch:
            return f"{self.name} ({self.branch.name})"
        return self.name

from decimal import Decimal




class Category(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="categories",
        null=True,
        blank=True,
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
        ordering = [F("rank").asc(nulls_last=True), "id"]
        # Prevent duplicate ranks within the same restaurant
        constraints = [
            models.UniqueConstraint(
                fields=['restaurant', 'rank'],
                condition=models.Q(branch__isnull=True),
                name='uniq_shared_category_rank'
            ),
            models.UniqueConstraint(
                fields=['restaurant', 'branch', 'rank'],
                condition=models.Q(branch__isnull=False),
                name='uniq_branch_category_rank'
            )
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="cat_rest_branch_idx"),
            models.Index(fields=["restaurant", "rank"], name="cat_rest_rank_idx"),
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
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="menu_items",
        null=True,
        blank=True,
    )
    station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="menu_items",
        help_text="The kitchen station responsible for preparing this item."
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_manually_available = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, related_name='menu_items')
    display_order = models.PositiveIntegerField(default=0)
    uses_daily_production = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = [
            F("category__rank").asc(nulls_last=True),
            "category_id",
            "display_order",
            "id",
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="item_rest_branch_idx"),
            models.Index(fields=["restaurant", "category"], name="item_rest_cat_idx"),
            models.Index(fields=["restaurant", "is_available"], name="item_rest_avail_idx"),
            models.Index(fields=["restaurant", "category", "display_order"], name="item_rest_cat_order_idx"),
        ]

    def get_production(self, branch=None):
        """Get current active production, optionally for a specific branch."""
        if not self.uses_daily_production:
            return None

        qs = self.productions.all()
        if branch:
            qs = qs.filter(branch=branch)
        return qs.order_by('-created_at').first()
    @property
    def production_remaining(self):
        prod = self.get_production()
        return prod.quantity_remaining if prod else 0
    @property
    def production_produced(self):
        prod = self.get_production()
        return prod.quantity_produced if prod else 0
    @property
    def final_availability(self):
        # Production-based items: must have an active production with remaining qty
        if self.uses_daily_production:
            prod = self.get_production()
            if not prod or prod.quantity_remaining <= 0:
                return False
            return self.is_manually_available
        # Normal items: ingredient-based availability
        return self.is_available and self.is_manually_available

    def get_branch_override(self, branch=None):
        return None

    def get_effective_price(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.price is not None:
            return override.price
        return self.price

    def get_effective_manual_availability(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.is_manually_available is not None:
            return override.is_manually_available
        return self.is_manually_available

    def get_effective_stock_availability(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.is_available is not None:
            return override.is_available
        return self.is_available

    def is_available_for_branch(self, branch=None):
        manual = self.get_effective_manual_availability(branch)
        if self.uses_daily_production:
            prod = self.get_production(branch=branch)
            return bool(prod and prod.quantity_remaining > 0 and manual)
        return self.get_effective_stock_availability(branch) and manual
        
    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        process_image = False

        if self.pk is None:
            process_image = bool(self.image)
        else:
            old = MenuItem.objects.filter(pk=self.pk).only("image").first()
            if old and old.image != self.image:
                process_image = True

        super().save(*args, **kwargs)

        if not process_image:
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

        
    
    def mark_unavailable(self, branch=None):
        self.is_available = False
        self.save(update_fields=["is_available"])

        from inventory.utils import (
            update_platter_availability_from_menu_item
        )

        update_platter_availability_from_menu_item(
            self
        )

    def mark_available(self, branch=None):
        self.is_available = True
        self.save(update_fields=["is_available"])

        from inventory.utils import (
            update_platter_availability_from_menu_item
        )

        update_platter_availability_from_menu_item(
            self
        )

    
    def get_cost_per_unit(self, restaurant=None, branch=None):
        from inventory.services import get_effective_cost_per_unit, get_recipe_items

        total = Decimal("0.00")
        for recipe in get_recipe_items(self, branch=branch):
            total += (
                Decimal(recipe.quantity_required)
                * Decimal(get_effective_cost_per_unit(recipe.ingredient, branch))
            )
        return total
    def get_profit_per_unit(self):
        cost=self.get_cost_per_unit()
        return Decimal(self.price) - Decimal(cost)

class Production(models.Model):
    """
    Tracks current cooked quantity for menu items that use production-based availability.
    E.g., Qabuli is cooked in bulk; stays available until sold out or manually cleared.
    No date dependency — one active production per menu item at a time.
    """
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='productions'
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='productions'
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="productions",
        null=True,
        blank=True,
    )
    quantity_produced = models.PositiveIntegerField(
        help_text="Total portions cooked in this batch"
    )
    quantity_remaining = models.PositiveIntegerField(
        help_text="Portions still available to sell"
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'users.Staff',  # adjust to your Staff model path
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['menu_item', 'branch'],
                name='unique_production_per_menu_item_branch'
            )
        ]

    def __str__(self):
        return f"{self.menu_item.name} ({self.quantity_remaining}/{self.quantity_produced})"

    @property
    def is_sold_out(self):
        return self.quantity_remaining <= 0

class Review(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='reviews')
    menu_item=models.ForeignKey(MenuItem,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)
    #every delivery can have reviews
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
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
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="platters",
        null=True,
        blank=True,
    )
    station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="platters",
        help_text="The kitchen station responsible for preparing this platter."
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
    display_order = models.PositiveIntegerField(default=0)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='platters'
    )

    class Meta:
        ordering = [
            F("category__rank").asc(nulls_last=True),
            "category_id",
            "display_order",
            "id",
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="plat_rest_branch_idx"),
            models.Index(fields=["restaurant", "category"], name="plat_rest_cat_idx"),
            models.Index(fields=["restaurant", "is_available"], name="plat_rest_avail_idx"),
            models.Index(fields=["restaurant", "category", "display_order"], name="plat_rest_cat_order_idx"),
        ]

    def __str__(self):
        return self.name
    @property
    def final_availability(self):
        return self.is_available and self.is_manually_available

    def get_branch_override(self, branch=None):
        return None

    def get_effective_price(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.price is not None:
            return override.price
        return self.price

    def get_effective_manual_availability(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.is_manually_available is not None:
            return override.is_manually_available
        return self.is_manually_available

    def get_effective_stock_availability(self, branch=None):
        override = self.get_branch_override(branch)
        if override and override.is_available is not None:
            return override.is_available
        return self.is_available

    def is_available_for_branch(self, branch=None):
        return (
            self.get_effective_stock_availability(branch)
            and self.get_effective_manual_availability(branch)
        )
    def save(self, *args, **kwargs):
        process_image = False

        if self.pk is None:
            # New platter
            process_image = bool(self.image)
        else:
            old = Platter.objects.filter(pk=self.pk).only("image").first()
            if old and old.image != self.image:
                process_image = True

        super().save(*args, **kwargs)

        if not process_image:
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
                optimize=True,
            )

            name = self.image.name.rsplit(".", 1)[0] + ".jpg"

            self.image.save(
                name,
                ContentFile(img_io.getvalue()),
                save=False,
            )

            super().save(update_fields=["image"])

        except Exception as e:
            print("Platter image processing error:", e)
    
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

    quantity = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        default=Decimal('1.000'),
        help_text="Quantity of the menu item included in this platter (supports fractional amounts like 0.5 or 0.2)."
    )

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
