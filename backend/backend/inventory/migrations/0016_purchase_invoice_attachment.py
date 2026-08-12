import django.db.models.deletion
import inventory.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0015_procurement"),
        ("restaurants", "0009_branch"),
        ("users", "0022_branch_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="PurchaseInvoiceAttachment",
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
                (
                    "file",
                    models.FileField(
                        upload_to=inventory.models.purchase_invoice_attachment_upload_path,
                    ),
                ),
                ("original_filename", models.CharField(max_length=255)),
                ("content_type", models.CharField(blank=True, max_length=120)),
                ("file_size", models.PositiveBigIntegerField(default=0)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_invoice_attachments",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attachments",
                        to="inventory.purchaseinvoice",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_invoice_attachments",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="uploaded_purchase_invoice_attachments",
                        to="users.staff",
                    ),
                ),
            ],
            options={
                "ordering": ["-uploaded_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="purchaseinvoiceattachment",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="pinv_att_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="purchaseinvoiceattachment",
            index=models.Index(
                fields=["invoice", "uploaded_at"],
                name="pinv_att_invoice_idx",
            ),
        ),
    ]
