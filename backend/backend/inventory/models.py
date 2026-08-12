import os
import uuid
from decimal import Decimal

from django.db import models
from django.db.models import Sum
from django.utils import timezone
from menu.models import MenuItem
from users.models import Staff
from restaurants.models import Branch, Restaurant


def purchase_invoice_attachment_upload_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower()
    return (
        "procurement/invoices/"
        f"restaurant_{instance.restaurant_id}/"
        f"branch_{instance.branch_id}/"
        f"invoice_{instance.invoice_id}/"
        f"{uuid.uuid4().hex}{extension}"
    )

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


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="suppliers",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="suppliers",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant", "branch", "name"],
                name="uniq_supplier_rest_branch_name",
            )
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="sup_rest_branch_idx"),
            models.Index(fields=["is_active"], name="sup_active_idx"),
            models.Index(fields=["name"], name="sup_name_idx"),
        ]

    def __str__(self):
        return self.name

    @property
    def total_purchases(self):
        return (
            self.purchase_invoices.exclude(status="draft").aggregate(
                total=Sum("total_amount")
            )["total"]
            or Decimal("0.00")
        )

    @property
    def total_paid(self):
        return (
            self.payments.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

    @property
    def outstanding_balance(self):
        return max(self.total_purchases - self.total_paid, Decimal("0.00"))


class PurchaseInvoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_UNPAID = "unpaid"
    STATUS_PARTIALLY_PAID = "partially_paid"
    STATUS_PAID = "paid"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_UNPAID, "Unpaid"),
        (STATUS_PARTIALLY_PAID, "Partially Paid"),
        (STATUS_PAID, "Paid"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="purchase_invoices",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="purchase_invoices",
        null=True,
        blank=True,
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        related_name="purchase_invoices",
        null=True,
        blank=True,
    )
    invoice_number = models.CharField(max_length=80, blank=True)
    purchase_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_UNPAID,
    )
    is_inventory_posted = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_purchase_invoices",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-purchase_date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="pinv_rest_branch_idx"),
            models.Index(fields=["supplier", "status"], name="pinv_supplier_status_idx"),
            models.Index(fields=["purchase_date"], name="pinv_purchase_date_idx"),
            models.Index(fields=["status"], name="pinv_status_idx"),
        ]

    def __str__(self):
        number = self.invoice_number or f"PINV-{self.id or 'new'}"
        return f"{number} - {self.total_amount}"

    @property
    def remaining_balance(self):
        return max(
            Decimal(self.total_amount or 0) - Decimal(self.amount_paid or 0),
            Decimal("0.00"),
        )

    def refresh_totals_and_status(self, save=True):
        total = (
            self.lines.aggregate(total=Sum("total_price"))["total"]
            or Decimal("0.00")
        )

        if self.status == self.STATUS_DRAFT and not self.is_inventory_posted:
            paid = Decimal("0.00")
            status = self.STATUS_DRAFT
        elif self.supplier_id:
            paid = (
                self.payments.aggregate(total=Sum("amount"))["total"]
                or Decimal("0.00")
            )
            if paid <= 0:
                status = self.STATUS_UNPAID
            elif paid < total:
                status = self.STATUS_PARTIALLY_PAID
            else:
                status = self.STATUS_PAID
        else:
            paid = total
            status = self.STATUS_PAID

        self.total_amount = total
        self.amount_paid = min(paid, total) if total else Decimal("0.00")
        self.status = status

        if save:
            self.save(update_fields=["total_amount", "amount_paid", "status", "updated_at"])

        return self


class PurchaseInvoiceLine(models.Model):
    invoice = models.ForeignKey(
        PurchaseInvoice,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT,
        related_name="purchase_invoice_lines",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=4)
    total_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    stock_movement = models.OneToOneField(
        StockMovement,
        on_delete=models.SET_NULL,
        related_name="purchase_invoice_line",
        null=True,
        blank=True,
    )

    class Meta:
        indexes = [
            models.Index(fields=["invoice"], name="pinv_line_invoice_idx"),
            models.Index(fields=["ingredient"], name="pinv_line_ing_idx"),
        ]

    def save(self, *args, **kwargs):
        self.total_price = (
            Decimal(self.quantity or 0) * Decimal(self.unit_price or 0)
        ).quantize(Decimal("0.01"))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ingredient.name} x {self.quantity}"


class PurchaseInvoiceAttachment(models.Model):
    invoice = models.ForeignKey(
        PurchaseInvoice,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="purchase_invoice_attachments",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="purchase_invoice_attachments",
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to=purchase_invoice_attachment_upload_path)
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_purchase_invoice_attachments",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at", "-id"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="pinv_att_rest_branch_idx"),
            models.Index(fields=["invoice", "uploaded_at"], name="pinv_att_invoice_idx"),
        ]

    @property
    def file_extension(self):
        return os.path.splitext(self.original_filename or self.file.name)[1].lower().lstrip(".")

    @property
    def file_type(self):
        if self.file_extension in ["jpg", "jpeg", "png"]:
            return "image"
        if self.file_extension == "pdf":
            return "pdf"
        return "document"

    def __str__(self):
        return self.original_filename


class SupplierPayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("mobile_money", "Mobile Money"),
        ("other", "Other"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="supplier_payments",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="supplier_payments",
        null=True,
        blank=True,
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    purchase_invoice = models.ForeignKey(
        PurchaseInvoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default="cash",
    )
    reference_number = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_supplier_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="spay_rest_branch_idx"),
            models.Index(fields=["supplier", "date"], name="spay_supplier_date_idx"),
            models.Index(fields=["purchase_invoice"], name="spay_invoice_idx"),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.purchase_invoice_id:
            self.purchase_invoice.refresh_totals_and_status(save=True)

    def delete(self, *args, **kwargs):
        invoice = self.purchase_invoice
        result = super().delete(*args, **kwargs)
        invoice.refresh_totals_and_status(save=True)
        return result

    def __str__(self):
        return f"{self.supplier.name} - {self.amount}"


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
