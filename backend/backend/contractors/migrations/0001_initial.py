import django.db.models.deletion
import contractors.models
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("restaurants", "0012_disable_shared_modes"),
        ("users", "0022_branch_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="Contractor",
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
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractors",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractors",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="ServiceContract",
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
                ("title", models.CharField(max_length=200)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                (
                    "contract_value",
                    models.DecimalField(decimal_places=2, default=0, max_digits=14),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("active", "Active"),
                            ("completed", "Completed"),
                            ("cancelled", "Cancelled"),
                            ("expired", "Expired"),
                        ],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="service_contracts",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "contractor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contracts",
                        to="contractors.contractor",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_service_contracts",
                        to="users.staff",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="service_contracts",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["-start_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ContractorInvoice",
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
                ("invoice_date", models.DateField(default=timezone.localdate)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("description", models.TextField(blank=True)),
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
                            ("approved", "Approved"),
                            ("partially_paid", "Partially Paid"),
                            ("paid", "Paid"),
                        ],
                        default="approved",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_invoices",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "contract",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="invoices",
                        to="contractors.servicecontract",
                    ),
                ),
                (
                    "contractor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="invoices",
                        to="contractors.contractor",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_contractor_invoices",
                        to="users.staff",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_invoices",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["-invoice_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ContractorInvoiceAttachment",
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
                        upload_to=contractors.models.contractor_invoice_attachment_upload_path,
                    ),
                ),
                ("original_filename", models.CharField(max_length=255)),
                ("content_type", models.CharField(blank=True, max_length=120)),
                ("file_size", models.PositiveBigIntegerField(default=0)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_invoice_attachments",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attachments",
                        to="contractors.contractorinvoice",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_invoice_attachments",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="uploaded_contractor_invoice_attachments",
                        to="users.staff",
                    ),
                ),
            ],
            options={
                "ordering": ["-uploaded_at", "-id"],
            },
        ),
        migrations.CreateModel(
            name="ContractorInvoiceLine",
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
                ("service_type", models.CharField(default="Maintenance", max_length=100)),
                ("description", models.CharField(max_length=255)),
                (
                    "quantity",
                    models.DecimalField(decimal_places=2, default=1, max_digits=10),
                ),
                ("unit_price", models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    "total_price",
                    models.DecimalField(decimal_places=2, default=0, max_digits=14),
                ),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lines",
                        to="contractors.contractorinvoice",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="ContractorPayment",
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
                            ("cheque", "Cheque"),
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
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_payments",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "contractor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="contractors.contractor",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_contractor_payments",
                        to="users.staff",
                    ),
                ),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="contractors.contractorinvoice",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="contractor_payments",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="contractor",
            constraint=models.UniqueConstraint(
                fields=("restaurant", "branch", "name"),
                name="uniq_contractor_rest_branch_name",
            ),
        ),
        migrations.AddIndex(
            model_name="contractor",
            index=models.Index(fields=["restaurant", "branch"], name="con_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="contractor",
            index=models.Index(fields=["is_active"], name="con_active_idx"),
        ),
        migrations.AddIndex(
            model_name="contractor",
            index=models.Index(fields=["name"], name="con_name_idx"),
        ),
        migrations.AddIndex(
            model_name="servicecontract",
            index=models.Index(fields=["restaurant", "branch"], name="svc_cont_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="servicecontract",
            index=models.Index(fields=["contractor", "status"], name="svc_cont_con_status_idx"),
        ),
        migrations.AddIndex(
            model_name="servicecontract",
            index=models.Index(fields=["status"], name="svc_cont_status_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoice",
            index=models.Index(fields=["restaurant", "branch"], name="cinv_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoice",
            index=models.Index(fields=["contractor", "status"], name="cinv_con_status_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoice",
            index=models.Index(fields=["contract"], name="cinv_contract_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoice",
            index=models.Index(fields=["invoice_date"], name="cinv_invoice_date_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoice",
            index=models.Index(fields=["status"], name="cinv_status_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoiceattachment",
            index=models.Index(fields=["restaurant", "branch"], name="cinv_att_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoiceattachment",
            index=models.Index(fields=["invoice", "uploaded_at"], name="cinv_att_invoice_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoiceline",
            index=models.Index(fields=["invoice"], name="cinv_line_invoice_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorinvoiceline",
            index=models.Index(fields=["service_type"], name="cinv_line_service_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorpayment",
            index=models.Index(fields=["restaurant", "branch"], name="cpay_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorpayment",
            index=models.Index(fields=["contractor", "date"], name="cpay_contractor_date_idx"),
        ),
        migrations.AddIndex(
            model_name="contractorpayment",
            index=models.Index(fields=["invoice"], name="cpay_invoice_idx"),
        ),
    ]
