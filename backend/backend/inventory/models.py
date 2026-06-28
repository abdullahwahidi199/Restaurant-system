from django.db import models
from menu.models import MenuItem
from users.models import Staff
from restaurants.models import Restaurant

class Ingredient(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('ml', 'Milliliter'),
        ('pcs', 'Pieces')
    ]

    name = models.CharField(max_length=100)

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='ingredients',
        null=True,
        blank=True
    )

    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    quantity_available = models.DecimalField(max_digits=10, decimal_places=3)
    minimum_threshold = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['restaurant', 'name'],
                name='unique_ingredient_per_restaurant'
            )
        ]

    def __str__(self):
        return self.name
    
class MenuItemIngredient(models.Model):
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='ingredients'
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name='menu_items'
    )
    quantity_required = models.DecimalField(
        max_digits=10,
        decimal_places=3
    )

    class Meta:
        unique_together = ('menu_item', 'ingredient')

    def __str__(self):
        return f"{self.menu_item.name} → {self.ingredient.name}"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('purchase', 'Purchase'),
        ('order', 'Order'),
        ('adjustment', 'Adjustment'),
        ('waste', 'Waste'),
        ("production", "Production"),                       # 🆕
        ("production_adjustment", "Production Adjustment")
    ]
    restaurant=models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='stock_movements', null=True, blank=True)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    change_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    

    note = models.TextField(
        blank=True,
        null=True
    )

    
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES)
    related_order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['ingredient']),
        ]

    def __str__(self):
        return f"{self.ingredient.name} ({self.change_quantity})"

