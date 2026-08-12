import os
import uuid
from decimal import Decimal

from django.db import models
from django.db.models import Sum
from django.utils import timezone

from restaurants.models import Branch, Restaurant
from users.models import Staff


def contractor_invoice_attachment_upload_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower()
    return (
        "contractors/invoices/"
        f"restaurant_{instance.restaurant_id}/"
        f"branch_{instance.branch_id}/"
        f"invoice_{instance.invoice_id}/"
        f"{uuid.uuid4().hex}{extension}"
    )


class Contractor(models.Model):
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
        related_name="contractors",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="contractors",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant", "branch", "name"],
                name="uniq_contractor_rest_branch_name",
            )
        ]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="con_rest_branch_idx"),
            models.Index(fields=["is_active"], name="con_active_idx"),
            models.Index(fields=["name"], name="con_name_idx"),
        ]

    def __str__(self):
        return self.name

    @property
    def total_invoiced(self):
        return (
            self.invoices.exclude(status=ContractorInvoice.STATUS_DRAFT).aggregate(
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
        return max(self.total_invoiced - self.total_paid, Decimal("0.00"))


class ServiceContract(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="service_contracts",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="service_contracts",
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name="contracts",
    )
    title = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    contract_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_service_contracts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="svc_cont_rest_branch_idx"),
            models.Index(fields=["contractor", "status"], name="svc_cont_con_status_idx"),
            models.Index(fields=["status"], name="svc_cont_status_idx"),
        ]

    def __str__(self):
        return f"{self.title} - {self.contractor.name}"


class ContractorInvoice(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_APPROVED = "approved"
    STATUS_PARTIALLY_PAID = "partially_paid"
    STATUS_PAID = "paid"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_PARTIALLY_PAID, "Partially Paid"),
        (STATUS_PAID, "Paid"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="contractor_invoices",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="contractor_invoices",
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    contract = models.ForeignKey(
        ServiceContract,
        on_delete=models.SET_NULL,
        related_name="invoices",
        null=True,
        blank=True,
    )
    invoice_number = models.CharField(max_length=80, blank=True)
    invoice_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_APPROVED,
    )
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_contractor_invoices",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-invoice_date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="cinv_rest_branch_idx"),
            models.Index(fields=["contractor", "status"], name="cinv_con_status_idx"),
            models.Index(fields=["contract"], name="cinv_contract_idx"),
            models.Index(fields=["invoice_date"], name="cinv_invoice_date_idx"),
            models.Index(fields=["status"], name="cinv_status_idx"),
        ]

    def __str__(self):
        number = self.invoice_number or f"CINV-{self.id or 'new'}"
        return f"{number} - {self.contractor.name}"

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

        if self.status == self.STATUS_DRAFT:
            paid = Decimal("0.00")
            status = self.STATUS_DRAFT
        else:
            paid = (
                self.payments.aggregate(total=Sum("amount"))["total"]
                or Decimal("0.00")
            )
            if paid <= 0:
                status = self.STATUS_APPROVED
            elif paid < total:
                status = self.STATUS_PARTIALLY_PAID
            else:
                status = self.STATUS_PAID

        self.total_amount = total
        self.amount_paid = min(paid, total) if total else Decimal("0.00")
        self.status = status

        if save:
            self.save(update_fields=["total_amount", "amount_paid", "status", "updated_at"])

        return self


class ContractorInvoiceLine(models.Model):
    invoice = models.ForeignKey(
        ContractorInvoice,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    service_type = models.CharField(max_length=100, default="Maintenance")
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=["invoice"], name="cinv_line_invoice_idx"),
            models.Index(fields=["service_type"], name="cinv_line_service_idx"),
        ]

    def save(self, *args, **kwargs):
        self.total_price = (
            Decimal(self.quantity or 0) * Decimal(self.unit_price or 0)
        ).quantize(Decimal("0.01"))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.service_type} - {self.description}"


class ContractorInvoiceAttachment(models.Model):
    invoice = models.ForeignKey(
        ContractorInvoice,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="contractor_invoice_attachments",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="contractor_invoice_attachments",
    )
    file = models.FileField(upload_to=contractor_invoice_attachment_upload_path)
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_contractor_invoice_attachments",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at", "-id"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="cinv_att_rest_branch_idx"),
            models.Index(fields=["invoice", "uploaded_at"], name="cinv_att_invoice_idx"),
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


class ContractorPayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("mobile_money", "Mobile Money"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="contractor_payments",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="contractor_payments",
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    invoice = models.ForeignKey(
        ContractorInvoice,
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
        related_name="created_contractor_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="cpay_rest_branch_idx"),
            models.Index(fields=["contractor", "date"], name="cpay_contractor_date_idx"),
            models.Index(fields=["invoice"], name="cpay_invoice_idx"),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.invoice_id:
            self.invoice.refresh_totals_and_status(save=True)

    def delete(self, *args, **kwargs):
        invoice = self.invoice
        result = super().delete(*args, **kwargs)
        invoice.refresh_totals_and_status(save=True)
        return result

    def __str__(self):
        return f"{self.contractor.name} - {self.amount}"
