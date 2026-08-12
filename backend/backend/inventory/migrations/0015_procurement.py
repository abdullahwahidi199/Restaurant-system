from decimal import Decimal

import django.db.models.deletion
from django.db import migrations, models
from django.db.models import Sum
from django.utils import timezone


def backfill_purchase_invoices(apps, schema_editor):
    StockMovement = apps.get_model("inventory", "StockMovement")
    PurchaseInvoice = apps.get_model("inventory", "PurchaseInvoice")
    PurchaseInvoiceLine = apps.get_model("inventory", "PurchaseInvoiceLine")

    purchase_movements = (
        StockMovement.objects
        .filter(movement_type="purchase")
        .select_related("ingredient", "restaurant", "branch", "created_by")
        .order_by("id")
    )

    for movement in purchase_movements:
        if PurchaseInvoiceLine.objects.filter(stock_movement_id=movement.id).exists():
            continue

        quantity = Decimal(movement.change_quantity or 0)
        unit_price = movement.unit_cost
        if unit_price is None and movement.ingredient_id:
            unit_price = movement.ingredient.cost_per_unit
        unit_price = Decimal(unit_price or 0)
        total = (quantity * unit_price).quantize(Decimal("0.01"))

        invoice = PurchaseInvoice.objects.create(
            restaurant=movement.restaurant,
            branch=movement.branch or getattr(movement.ingredient, "branch", None),
            supplier=None,
            invoice_number=f"LEGACY-STOCK-{movement.id}",
            purchase_date=movement.created_at.date() if movement.created_at else timezone.localdate(),
            due_date=None,
            notes=f"Migrated from stock movement #{movement.id}.",
            total_amount=total,
            amount_paid=total,
            status="paid",
            is_inventory_posted=True,
            created_by=movement.created_by,
            created_at=movement.created_at,
            updated_at=movement.created_at or timezone.now(),
        )

        PurchaseInvoiceLine.objects.create(
            invoice=invoice,
            ingredient=movement.ingredient,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total,
            stock_movement=movement,
        )


def reverse_backfill_purchase_invoices(apps, schema_editor):
    PurchaseInvoice = apps.get_model("inventory", "PurchaseInvoice")
    PurchaseInvoice.objects.filter(
        supplier__isnull=True,
        invoice_number__startswith="LEGACY-STOCK-",
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0014_remove_recipe_override"),
        ("restaurants", "0009_branch"),
        ("users", "0022_branch_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="Supplier",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("contact_person", models.CharField(blank=True, max_length=120)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("address", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="suppliers",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="suppliers",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="PurchaseInvoice",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("invoice_number", models.CharField(blank=True, max_length=80)),
                ("purchase_date", models.DateField(default=timezone.localdate)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                (
                    "total_amount",
                    models.DecimalField(decimal_places=2, default=0, max_digits=14),
                ),
                (
                    "amount_paid",
                    models.DecimalField(decimal_places=2, default=0, max_digits=14),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("unpaid", "Unpaid"),
                            ("partially_paid", "Partially Paid"),
                            ("paid", "Paid"),
                        ],
                        default="unpaid",
                        max_length=20,
                    ),
                ),
                ("is_inventory_posted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_invoices",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_purchase_invoices",
                        to="users.staff",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_invoices",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "supplier",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="purchase_invoices",
                        to="inventory.supplier",
                    ),
                ),
            ],
            options={
                "ordering": ["-purchase_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PurchaseInvoiceLine",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("quantity", models.DecimalField(decimal_places=3, max_digits=10)),
                ("unit_price", models.DecimalField(decimal_places=4, max_digits=12)),
                (
                    "total_price",
                    models.DecimalField(decimal_places=2, default=0, max_digits=14),
                ),
                (
                    "ingredient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="purchase_invoice_lines",
                        to="inventory.ingredient",
                    ),
                ),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lines",
                        to="inventory.purchaseinvoice",
                    ),
                ),
                (
                    "stock_movement",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="purchase_invoice_line",
                        to="inventory.stockmovement",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="SupplierPayment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField(default=timezone.localdate)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("cash", "Cash"),
                            ("card", "Card"),
                            ("bank_transfer", "Bank Transfer"),
                            ("mobile_money", "Mobile Money"),
                            ("other", "Other"),
                        ],
                        default="cash",
                        max_length=30,
                    ),
                ),
                ("reference_number", models.CharField(blank=True, max_length=120)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="supplier_payments",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_supplier_payments",
                        to="users.staff",
                    ),
                ),
                (
                    "purchase_invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="inventory.purchaseinvoice",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="supplier_payments",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "supplier",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="inventory.supplier",
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="supplier",
            constraint=models.UniqueConstraint(
                fields=("restaurant", "branch", "name"),
                name="uniq_supplier_rest_branch_name",
            ),
        ),
        migrations.AddIndex(
            model_name="supplier",
            index=models.Index(fields=["restaurant", "branch"], name="sup_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="supplier",
            index=models.Index(fields=["is_active"], name="sup_active_idx"),
        ),
        migrations.AddIndex(
            model_name="supplier",
            index=models.Index(fields=["name"], name="sup_name_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoice",
            index=models.Index(fields=["restaurant", "branch"], name="pinv_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoice",
            index=models.Index(fields=["supplier", "status"], name="pinv_supplier_status_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoice",
            index=models.Index(fields=["purchase_date"], name="pinv_purchase_date_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoice",
            index=models.Index(fields=["status"], name="pinv_status_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoiceline",
            index=models.Index(fields=["invoice"], name="pinv_line_invoice_idx"),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoiceline",
            index=models.Index(fields=["ingredient"], name="pinv_line_ing_idx"),
        ),
        migrations.AddIndex(
            model_name="supplierpayment",
            index=models.Index(fields=["restaurant", "branch"], name="spay_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="supplierpayment",
            index=models.Index(fields=["supplier", "date"], name="spay_supplier_date_idx"),
        ),
        migrations.AddIndex(
            model_name="supplierpayment",
            index=models.Index(fields=["purchase_invoice"], name="spay_invoice_idx"),
        ),
        migrations.RunPython(backfill_purchase_invoices, reverse_backfill_purchase_invoices),
    ]
