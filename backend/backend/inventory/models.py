from django.db import models
from menu.models import MenuItem
from users.models import Staff
from restaurants.models import Branch, Restaurant

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
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="ingredients",
        null=True,
        blank=True,
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
                condition=models.Q(branch__isnull=True),
                name='uniq_shared_ingredient'
            ),
            models.UniqueConstraint(
                fields=['restaurant', 'branch', 'name'],
                condition=models.Q(branch__isnull=False),
                name='uniq_branch_ingredient'
            )
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="ing_rest_branch_idx"),
            models.Index(fields=["restaurant", "name"], name="ing_rest_name_idx"),
            models.Index(fields=["is_active"], name="ing_active_idx"),
        ]

    def __str__(self):
        return self.name

    @property
    def is_shared_definition(self):
        return self.branch_id is None


class IngredientStock(models.Model):
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="branch_stocks",
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="ingredient_stocks",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="ingredient_stocks",
    )
    quantity_available = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    minimum_threshold = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["ingredient", "branch"],
                name="uniq_ingredient_stock_branch",
            )
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="ing_stock_rest_branch_idx"),
            models.Index(fields=["ingredient", "branch"], name="ing_stock_item_branch_idx"),
            models.Index(fields=["is_active"], name="ing_stock_active_idx"),
        ]

    def __str__(self):
        return f"{self.ingredient.name} @ {self.branch.name}"
    
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
        ("production_adjustment", "Production Adjustment"),
        ("transfer_out", "Transfer Out"),
        ("transfer_in", "Transfer In"),
    ]
    restaurant=models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='stock_movements', null=True, blank=True)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="stock_movements",
        null=True,
        blank=True,
    )
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
            models.Index(fields=['restaurant', 'branch'], name="stock_move_rest_branch_idx"),
        ]

    def __str__(self):
        return f"{self.ingredient.name} ({self.change_quantity})"

    def save(self, *args, **kwargs):
        if (
            self.branch_id
            and self.ingredient_id
            and self.ingredient.branch_id
            and self.ingredient.branch_id != self.branch_id
        ):
            raise ValueError("Stock movement ingredient belongs to another branch.")

        if (
            self.branch_id
            and self.related_order_id
            and self.related_order.branch_id != self.branch_id
        ):
            raise ValueError("Stock movement order belongs to another branch.")

        super().save(*args, **kwargs)


class StockTransfer(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="stock_transfers",
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="stock_transfers",
    )
    from_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="outgoing_stock_transfers",
    )
    to_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="incoming_stock_transfers",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="requested_stock_transfers",
    )
    approved_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_stock_transfers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["restaurant", "status"], name="stock_tx_rest_status_idx"),
            models.Index(fields=["from_branch", "to_branch"], name="stock_tx_branches_idx"),
            models.Index(fields=["created_at"], name="stock_tx_created_idx"),
        ]

    def clean(self):
        if self.from_branch_id == self.to_branch_id:
            raise ValueError("Transfer source and destination branches must differ.")

        if self.from_branch.restaurant_id != self.restaurant_id:
            raise ValueError("Source branch belongs to another restaurant.")

        if self.to_branch.restaurant_id != self.restaurant_id:
            raise ValueError("Destination branch belongs to another restaurant.")

        if self.ingredient.restaurant_id != self.restaurant_id:
            raise ValueError("Ingredient belongs to another restaurant.")

        if self.ingredient.branch_id and self.ingredient.branch_id != self.from_branch_id:
            raise ValueError("Ingredient stock belongs to another source branch.")

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.quantity} {self.ingredient.name}: "
            f"{self.from_branch.name} -> {self.to_branch.name}"
        )


class StockTransferLog(models.Model):
    transfer = models.ForeignKey(
        StockTransfer,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    action = models.CharField(max_length=50)
    message = models.TextField(blank=True)
    actor = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transfer_logs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["transfer", "created_at"], name="stock_tx_log_transfer_idx"),
        ]
