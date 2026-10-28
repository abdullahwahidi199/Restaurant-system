---
id: "operator_reference_backend_contractors_fields"
title: "Contractors — backend fields reference"
module: "contractors"
description: "Static contractors implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["contractors", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_contractors_services"]
frontend_routes: []
source_references: ["backend/backend/contractors/models.py", "backend/backend/contractors/serializers.py", "backend/backend/contractors/services.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Contractors — backend fields reference

Static implementation reference for `contractors`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/contractors/models.py`

### Contractor

Serializer/model rules: `ordering = ["name"]`; `constraints = [ models.UniqueConstraint( fields=["restaurant", "branch", "name"], name="uniq_contractor_rest_branch_name", ) ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="con_rest_branch_idx"), models.Index(fields=["is_active"], name="con_active_idx"), models.Index(fields=["name"], name="con_name_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=200)` |
| `contact_person` | `models.CharField(max_length=120, blank=True)` |
| `phone` | `models.CharField(max_length=30, blank=True)` |
| `email` | `models.EmailField(blank=True)` |
| `address` | `models.TextField(blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `is_active` | `models.BooleanField(default=True)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="contractors", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="contractors", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### ServiceContract

Accepted choice values: `STATUS_CHOICES = [ (STATUS_DRAFT, "Draft"), (STATUS_ACTIVE, "Active"), (STATUS_COMPLETED, "Completed"), (STATUS_CANCELLED, "Cancelled"), (STATUS_EXPIRED, "Expired"), ]`.

Serializer/model rules: `ordering = ["-start_date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="svc_cont_rest_branch_idx"), models.Index(fields=["contractor", "status"], name="svc_cont_con_status_idx"), models.Index(fields=["status"], name="svc_cont_status_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="service_contracts", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="service_contracts", )` |
| `contractor` | `models.ForeignKey( Contractor, on_delete=models.CASCADE, related_name="contracts", )` |
| `title` | `models.CharField(max_length=200)` |
| `start_date` | `models.DateField()` |
| `end_date` | `models.DateField(null=True, blank=True)` |
| `contract_value` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `status` | `models.CharField( max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, )` |
| `notes` | `models.TextField(blank=True)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_service_contracts", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### ContractorInvoice

Accepted choice values: `STATUS_CHOICES = [ (STATUS_DRAFT, "Draft"), (STATUS_APPROVED, "Approved"), (STATUS_PARTIALLY_PAID, "Partially Paid"), (STATUS_PAID, "Paid"), ]`.

Serializer/model rules: `ordering = ["-invoice_date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="cinv_rest_branch_idx"), models.Index(fields=["contractor", "status"], name="cinv_con_status_idx"), models.Index(fields=["contract"], name="cinv_contract_idx"), models.Index(fields=["invoice_date"], name="cinv_invoice_date_idx"), models.Index(fields=["status"], name="cinv_status_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="contractor_invoices", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="contractor_invoices", )` |
| `contractor` | `models.ForeignKey( Contractor, on_delete=models.CASCADE, related_name="invoices", )` |
| `contract` | `models.ForeignKey( ServiceContract, on_delete=models.SET_NULL, related_name="invoices", null=True, blank=True, )` |
| `invoice_number` | `models.CharField(max_length=80, blank=True)` |
| `invoice_date` | `models.DateField(default=timezone.localdate)` |
| `due_date` | `models.DateField(null=True, blank=True)` |
| `description` | `models.TextField(blank=True)` |
| `total_amount` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `amount_paid` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `status` | `models.CharField( max_length=20, choices=STATUS_CHOICES, default=STATUS_APPROVED, )` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_contractor_invoices", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### ContractorInvoiceLine

Serializer/model rules: `indexes = [ models.Index(fields=["invoice"], name="cinv_line_invoice_idx"), models.Index(fields=["service_type"], name="cinv_line_service_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `invoice` | `models.ForeignKey( ContractorInvoice, on_delete=models.CASCADE, related_name="lines", )` |
| `service_type` | `models.CharField(max_length=100, default="Maintenance")` |
| `description` | `models.CharField(max_length=255)` |
| `quantity` | `models.DecimalField(max_digits=10, decimal_places=2, default=1)` |
| `unit_price` | `models.DecimalField(max_digits=12, decimal_places=2)` |
| `total_price` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |

### ContractorInvoiceAttachment

Serializer/model rules: `ordering = ["-uploaded_at", "-id"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="cinv_att_rest_branch_idx"), models.Index(fields=["invoice", "uploaded_at"], name="cinv_att_invoice_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `invoice` | `models.ForeignKey( ContractorInvoice, on_delete=models.CASCADE, related_name="attachments", )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="contractor_invoice_attachments", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="contractor_invoice_attachments", )` |
| `file` | `models.FileField(upload_to=contractor_invoice_attachment_upload_path)` |
| `original_filename` | `models.CharField(max_length=255)` |
| `content_type` | `models.CharField(max_length=120, blank=True)` |
| `file_size` | `models.PositiveBigIntegerField(default=0)` |
| `uploaded_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="uploaded_contractor_invoice_attachments", )` |
| `uploaded_at` | `models.DateTimeField(auto_now_add=True)` |

### ContractorPayment

Accepted choice values: `PAYMENT_METHOD_CHOICES = [ ("cash", "Cash"), ("card", "Card"), ("bank_transfer", "Bank Transfer"), ("mobile_money", "Mobile Money"), ("cheque", "Cheque"), ("other", "Other"), ]`.

Serializer/model rules: `ordering = ["-date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="cpay_rest_branch_idx"), models.Index(fields=["contractor", "date"], name="cpay_contractor_date_idx"), models.Index(fields=["invoice"], name="cpay_invoice_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="contractor_payments", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="contractor_payments", )` |
| `contractor` | `models.ForeignKey( Contractor, on_delete=models.CASCADE, related_name="payments", )` |
| `invoice` | `models.ForeignKey( ContractorInvoice, on_delete=models.CASCADE, related_name="payments", )` |
| `date` | `models.DateField(default=timezone.localdate)` |
| `amount` | `models.DecimalField(max_digits=14, decimal_places=2)` |
| `payment_method` | `models.CharField( max_length=30, choices=PAYMENT_METHOD_CHOICES, default="cash", )` |
| `reference_number` | `models.CharField(max_length=120, blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_contractor_payments", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

## `backend/backend/contractors/serializers.py`

### ContractorSerializer

Serializer/model rules: `model = Contractor`; `validators = []`; `fields = [ "id", "name", "contact_person", "phone", "email", "address", "notes", "is_active", "restaurant", "branch", "branch_name", "total_invoiced", "total_paid", "outstanding_balance", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "total_invoiced", "total_paid", "outstanding_balance", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `total_invoiced` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `total_paid` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `outstanding_balance` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |

### ServiceContractSerializer

Serializer/model rules: `model = ServiceContract`; `fields = [ "id", "restaurant", "branch", "branch_name", "contractor", "contractor_name", "title", "start_date", "end_date", "contract_value", "status", "notes", "created_by", "created_by_name", "invoice_count", "total_invoiced", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "created_by", "created_at", "updated_at", "invoice_count", "total_invoiced", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `contractor_name` | `serializers.ReadOnlyField(source="contractor.name")` |
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `invoice_count` | `serializers.SerializerMethodField()` |
| `total_invoiced` | `serializers.SerializerMethodField()` |

### ContractorInvoiceLineSerializer

Serializer/model rules: `model = ContractorInvoiceLine`; `fields = [ "id", "invoice", "service_type", "description", "quantity", "unit_price", "total_price", ]`; `read_only_fields = ["invoice", "total_price"]`.


### ContractorInvoiceAttachmentSerializer

Serializer/model rules: `model = ContractorInvoiceAttachment`; `fields = [ "id", "invoice", "original_filename", "content_type", "file_size", "file_type", "uploaded_by", "uploaded_by_name", "uploaded_at", "download_url", "preview_url", ]`; `read_only_fields = [ "invoice", "original_filename", "content_type", "file_size", "file_type", "uploaded_by", "uploaded_at", "download_url", "preview_url", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `uploaded_by_name` | `serializers.ReadOnlyField(source="uploaded_by.name")` |
| `file_type` | `serializers.ReadOnlyField()` |
| `download_url` | `serializers.SerializerMethodField()` |
| `preview_url` | `serializers.SerializerMethodField()` |

### ContractorPaymentSerializer

Serializer/model rules: `model = ContractorPayment`; `fields = [ "id", "restaurant", "branch", "contractor", "contractor_name", "invoice", "invoice_number", "date", "amount", "payment_method", "reference_number", "notes", "created_by", "created_by_name", "remaining_balance", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "created_by", "created_at", "updated_at", "remaining_balance", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `contractor_name` | `serializers.ReadOnlyField(source="contractor.name")` |
| `invoice_number` | `serializers.SerializerMethodField()` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `remaining_balance` | `serializers.SerializerMethodField()` |

### ContractorInvoiceSerializer

Serializer/model rules: `model = ContractorInvoice`; `fields = [ "id", "restaurant", "branch", "branch_name", "contractor", "contractor_name", "contract", "contract_title", "invoice_number", "invoice_date", "due_date", "description", "total_amount", "amount_paid", "remaining_balance", "status", "created_by", "created_by_name", "line_count", "lines", "payments", "attachments", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "total_amount", "amount_paid", "remaining_balance", "status", "created_by", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `contractor_name` | `serializers.ReadOnlyField(source="contractor.name")` |
| `contract_title` | `serializers.ReadOnlyField(source="contract.title")` |
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `remaining_balance` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `line_count` | `serializers.SerializerMethodField()` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Manage contractors, service contracts, invoices, and payments](../../modules/contractors/services.md)
