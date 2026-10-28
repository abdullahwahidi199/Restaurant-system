---
id: "operator_reference_backend_inventory_fields"
title: "Inventory — backend fields reference"
module: "inventory"
description: "Static inventory implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["inventory", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_inventory_stock", "operator_modules_inventory_transfers", "operator_modules_procurement_purchasing", "operator_modules_procurement_payments_attachments"]
frontend_routes: []
source_references: ["backend/backend/inventory/models.py", "backend/backend/inventory/serializers.py", "backend/backend/inventory/services.py", "backend/backend/inventory/utils.py", "backend/backend/inventory/views.py"]
status: "source_verified"
---

# Inventory — backend fields reference

Static implementation reference for `inventory`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/inventory/models.py`

### Ingredient

Accepted choice values: `UNIT_CHOICES = [ ('kg', 'Kilogram'), ('g', 'Gram'), ('l', 'Liter'), ('ml', 'Milliliter'), ('pcs', 'Pieces') ]`.

Serializer/model rules: `constraints = [ models.UniqueConstraint( fields=['restaurant', 'name'], condition=models.Q(branch__isnull=True), name='uniq_shared_ingredient' ), models.UniqueConstraint( fields=['restaurant', 'branch', 'name'], condition=models.Q(branch__isnull=False), name='uniq_branch_ingredient' ) ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="ing_rest_branch_idx"), models.Index(fields=["restaurant", "name"], name="ing_rest_name_idx"), models.Index(fields=["is_active"], name="ing_active_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=100)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='ingredients', null=True, blank=True )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="ingredients", null=True, blank=True, )` |
| `unit` | `models.CharField(max_length=10, choices=UNIT_CHOICES)` |
| `quantity_available` | `models.DecimalField(max_digits=10, decimal_places=3)` |
| `minimum_threshold` | `models.DecimalField(max_digits=10, decimal_places=3, default=0)` |
| `cost_per_unit` | `models.DecimalField(max_digits=10, decimal_places=2)` |
| `is_active` | `models.BooleanField(default=True)` |

### IngredientStock

Serializer/model rules: `constraints = [ models.UniqueConstraint( fields=["ingredient", "branch"], name="uniq_ingredient_stock_branch", ) ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="ing_stock_rest_branch_idx"), models.Index(fields=["ingredient", "branch"], name="ing_stock_item_branch_idx"), models.Index(fields=["is_active"], name="ing_stock_active_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredient` | `models.ForeignKey( Ingredient, on_delete=models.CASCADE, related_name="branch_stocks", )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="ingredient_stocks", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="ingredient_stocks", )` |
| `quantity_available` | `models.DecimalField(max_digits=10, decimal_places=3, default=0)` |
| `minimum_threshold` | `models.DecimalField(max_digits=10, decimal_places=3, default=0)` |
| `cost_per_unit` | `models.DecimalField(max_digits=10, decimal_places=2, default=0)` |
| `is_active` | `models.BooleanField(default=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### MenuItemIngredient

Serializer/model rules: `unique_together = ('menu_item', 'ingredient')`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_item` | `models.ForeignKey( MenuItem, on_delete=models.CASCADE, related_name='ingredients' )` |
| `ingredient` | `models.ForeignKey( Ingredient, on_delete=models.CASCADE, related_name='menu_items' )` |
| `quantity_required` | `models.DecimalField( max_digits=10, decimal_places=3 )` |

### StockMovement

Serializer/model rules: `indexes = [ models.Index(fields=['created_at']), models.Index(fields=['movement_type']), models.Index(fields=['ingredient']), models.Index(fields=['restaurant', 'branch'], name="stock_move_rest_branch_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='stock_movements', null=True, blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="stock_movements", null=True, blank=True, )` |
| `ingredient` | `models.ForeignKey(Ingredient, on_delete=models.CASCADE)` |
| `change_quantity` | `models.DecimalField(max_digits=10, decimal_places=3)` |
| `unit_cost` | `models.DecimalField( max_digits=10, decimal_places=2, null=True, blank=True )` |
| `note` | `models.TextField( blank=True, null=True )` |
| `movement_type` | `models.CharField(max_length=30, choices=MOVEMENT_TYPES)` |
| `related_order` | `models.ForeignKey( 'orders.Order', on_delete=models.SET_NULL, null=True, blank=True )` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

### Supplier

Serializer/model rules: `ordering = ["name"]`; `constraints = [ models.UniqueConstraint( fields=["restaurant", "branch", "name"], name="uniq_supplier_rest_branch_name", ) ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="sup_rest_branch_idx"), models.Index(fields=["is_active"], name="sup_active_idx"), models.Index(fields=["name"], name="sup_name_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=200)` |
| `contact_person` | `models.CharField(max_length=120, blank=True)` |
| `phone` | `models.CharField(max_length=30, blank=True)` |
| `email` | `models.EmailField(blank=True)` |
| `address` | `models.TextField(blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `is_active` | `models.BooleanField(default=True)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="suppliers", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="suppliers", null=True, blank=True, )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### PurchaseInvoice

Accepted choice values: `STATUS_CHOICES = [ (STATUS_DRAFT, "Draft"), (STATUS_UNPAID, "Unpaid"), (STATUS_PARTIALLY_PAID, "Partially Paid"), (STATUS_PAID, "Paid"), ]`.

Serializer/model rules: `ordering = ["-purchase_date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="pinv_rest_branch_idx"), models.Index(fields=["supplier", "status"], name="pinv_supplier_status_idx"), models.Index(fields=["purchase_date"], name="pinv_purchase_date_idx"), models.Index(fields=["status"], name="pinv_status_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="purchase_invoices", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="purchase_invoices", null=True, blank=True, )` |
| `supplier` | `models.ForeignKey( Supplier, on_delete=models.SET_NULL, related_name="purchase_invoices", null=True, blank=True, )` |
| `invoice_number` | `models.CharField(max_length=80, blank=True)` |
| `purchase_date` | `models.DateField(default=timezone.localdate)` |
| `due_date` | `models.DateField(null=True, blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `total_amount` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `amount_paid` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `status` | `models.CharField( max_length=20, choices=STATUS_CHOICES, default=STATUS_UNPAID, )` |
| `is_inventory_posted` | `models.BooleanField(default=False)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_purchase_invoices", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### PurchaseInvoiceLine

Serializer/model rules: `indexes = [ models.Index(fields=["invoice"], name="pinv_line_invoice_idx"), models.Index(fields=["ingredient"], name="pinv_line_ing_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `invoice` | `models.ForeignKey( PurchaseInvoice, on_delete=models.CASCADE, related_name="lines", )` |
| `ingredient` | `models.ForeignKey( Ingredient, on_delete=models.PROTECT, related_name="purchase_invoice_lines", )` |
| `quantity` | `models.DecimalField(max_digits=10, decimal_places=3)` |
| `unit_price` | `models.DecimalField(max_digits=12, decimal_places=4)` |
| `total_price` | `models.DecimalField(max_digits=14, decimal_places=2, default=0)` |
| `stock_movement` | `models.OneToOneField( StockMovement, on_delete=models.SET_NULL, related_name="purchase_invoice_line", null=True, blank=True, )` |

### PurchaseInvoiceAttachment

Serializer/model rules: `ordering = ["-uploaded_at", "-id"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="pinv_att_rest_branch_idx"), models.Index(fields=["invoice", "uploaded_at"], name="pinv_att_invoice_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `invoice` | `models.ForeignKey( PurchaseInvoice, on_delete=models.CASCADE, related_name="attachments", )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="purchase_invoice_attachments", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="purchase_invoice_attachments", null=True, blank=True, )` |
| `file` | `models.FileField(upload_to=purchase_invoice_attachment_upload_path)` |
| `original_filename` | `models.CharField(max_length=255)` |
| `content_type` | `models.CharField(max_length=120, blank=True)` |
| `file_size` | `models.PositiveBigIntegerField(default=0)` |
| `uploaded_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="uploaded_purchase_invoice_attachments", )` |
| `uploaded_at` | `models.DateTimeField(auto_now_add=True)` |

### SupplierPayment

Accepted choice values: `PAYMENT_METHOD_CHOICES = [ ("cash", "Cash"), ("card", "Card"), ("bank_transfer", "Bank Transfer"), ("mobile_money", "Mobile Money"), ("other", "Other"), ]`.

Serializer/model rules: `ordering = ["-date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="spay_rest_branch_idx"), models.Index(fields=["supplier", "date"], name="spay_supplier_date_idx"), models.Index(fields=["purchase_invoice"], name="spay_invoice_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="supplier_payments", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="supplier_payments", null=True, blank=True, )` |
| `supplier` | `models.ForeignKey( Supplier, on_delete=models.CASCADE, related_name="payments", )` |
| `purchase_invoice` | `models.ForeignKey( PurchaseInvoice, on_delete=models.CASCADE, related_name="payments", )` |
| `date` | `models.DateField(default=timezone.localdate)` |
| `amount` | `models.DecimalField(max_digits=14, decimal_places=2)` |
| `payment_method` | `models.CharField( max_length=30, choices=PAYMENT_METHOD_CHOICES, default="cash", )` |
| `reference_number` | `models.CharField(max_length=120, blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_supplier_payments", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### StockTransfer

Accepted choice values: `STATUS_CHOICES = [ ("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ("cancelled", "Cancelled"), ]`.

Serializer/model rules: `indexes = [ models.Index(fields=["restaurant", "status"], name="stock_tx_rest_status_idx"), models.Index(fields=["from_branch", "to_branch"], name="stock_tx_branches_idx"), models.Index(fields=["created_at"], name="stock_tx_created_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="stock_transfers", )` |
| `ingredient` | `models.ForeignKey( Ingredient, on_delete=models.CASCADE, related_name="stock_transfers", )` |
| `from_branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="outgoing_stock_transfers", )` |
| `to_branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="incoming_stock_transfers", )` |
| `quantity` | `models.DecimalField(max_digits=10, decimal_places=3)` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")` |
| `notes` | `models.TextField(blank=True)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="requested_stock_transfers", )` |
| `approved_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_stock_transfers", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `approved_at` | `models.DateTimeField(null=True, blank=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### StockTransferLog

Serializer/model rules: `indexes = [ models.Index(fields=["transfer", "created_at"], name="stock_tx_log_transfer_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `transfer` | `models.ForeignKey( StockTransfer, on_delete=models.CASCADE, related_name="logs", )` |
| `action` | `models.CharField(max_length=50)` |
| `message` | `models.TextField(blank=True)` |
| `actor` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="stock_transfer_logs", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

## `backend/backend/inventory/serializers.py`

### IngredientSerializer

Serializer/model rules: `model = Ingredient`; `validators = []`; `fields = '__all__'`; `read_only_fields = ["restaurant", "branch"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_items_count` | `serializers.IntegerField(read_only=True)` |

### MenuItemIngredientSerializer

Serializer/model rules: `model=MenuItemIngredient`; `fields = [ 'id', 'menu_item', 'ingredient', 'ingredient_name', 'unit_cost', 'unit', 'quantity_required', 'ingredient_cost', ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredient_name` | `serializers.ReadOnlyField(source='ingredient.name')` |
| `unit` | `serializers.ReadOnlyField(source='ingredient.unit')` |
| `unit_cost` | `serializers.ReadOnlyField(source='ingredient.cost_per_unit')` |
| `ingredient_cost` | `serializers.SerializerMethodField()` |

### StockMovementSerializer

Serializer/model rules: `model = StockMovement`; `fields = [ "id", "ingredient", "ingredient_name", "ingredient_unit", # ADD THIS "createt_by_name", "change_quantity", "unit_cost", "note", "movement_type", "created_at", "restaurant", "related_order", "created_by", "branch", ]`; `read_only_fields = ["restaurant", "branch", "created_by", "related_order"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredient_name` | `serializers.ReadOnlyField(source='ingredient.name')` |
| `createt_by_name` | `serializers.ReadOnlyField(source='created_by.name')` |
| `ingredient_unit` | `serializers.CharField( source="ingredient.unit", read_only=True )` |

### SupplierSerializer

Serializer/model rules: `model = Supplier`; `validators = []`; `fields = [ "id", "name", "contact_person", "phone", "email", "address", "notes", "is_active", "restaurant", "branch", "branch_name", "total_purchases", "total_paid", "outstanding_balance", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "total_purchases", "total_paid", "outstanding_balance", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `total_purchases` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `total_paid` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `outstanding_balance` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |

### PurchaseInvoiceLineSerializer

Serializer/model rules: `model = PurchaseInvoiceLine`; `fields = [ "id", "invoice", "ingredient", "ingredient_name", "ingredient_unit", "quantity", "unit_price", "total_price", "stock_movement", ]`; `read_only_fields = ["invoice", "total_price", "stock_movement"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredient_name` | `serializers.ReadOnlyField(source="ingredient.name")` |
| `ingredient_unit` | `serializers.ReadOnlyField(source="ingredient.unit")` |

### PurchaseInvoiceAttachmentSerializer

Serializer/model rules: `model = PurchaseInvoiceAttachment`; `fields = [ "id", "invoice", "original_filename", "content_type", "file_size", "file_type", "uploaded_by", "uploaded_by_name", "uploaded_at", "download_url", "preview_url", ]`; `read_only_fields = [ "invoice", "original_filename", "content_type", "file_size", "file_type", "uploaded_by", "uploaded_at", "download_url", "preview_url", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `uploaded_by_name` | `serializers.ReadOnlyField(source="uploaded_by.name")` |
| `file_type` | `serializers.ReadOnlyField()` |
| `download_url` | `serializers.SerializerMethodField()` |
| `preview_url` | `serializers.SerializerMethodField()` |

### SupplierPaymentSerializer

Serializer/model rules: `model = SupplierPayment`; `fields = [ "id", "restaurant", "branch", "supplier", "supplier_name", "purchase_invoice", "invoice_number", "voucher_number", "date", "amount", "payment_method", "reference_number", "notes", "created_by", "created_by_name", "remaining_balance", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "created_by", "created_at", "updated_at", "remaining_balance", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `supplier_name` | `serializers.ReadOnlyField(source="supplier.name")` |
| `invoice_number` | `serializers.SerializerMethodField()` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `remaining_balance` | `serializers.SerializerMethodField()` |
| `voucher_number` | `serializers.SerializerMethodField()` |

### PurchaseInvoiceSerializer

Serializer/model rules: `model = PurchaseInvoice`; `fields = [ "id", "restaurant", "branch", "branch_name", "supplier", "supplier_name", "invoice_number", "purchase_date", "due_date", "notes", "total_amount", "amount_paid", "remaining_balance", "status", "is_inventory_posted", "created_by", "created_by_name", "line_count", "lines", "payments", "attachments", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "total_amount", "amount_paid", "remaining_balance", "status", "is_inventory_posted", "created_by", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `supplier_name` | `serializers.ReadOnlyField(source="supplier.name")` |
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `remaining_balance` | `serializers.DecimalField( max_digits=14, decimal_places=2, read_only=True, )` |
| `line_count` | `serializers.SerializerMethodField()` |

### StockTransferLogSerializer

Serializer/model rules: `model = StockTransferLog`; `fields = ["id", "action", "message", "actor", "actor_name", "created_at"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `actor_name` | `serializers.ReadOnlyField(source="actor.name")` |

### StockTransferSerializer

Serializer/model rules: `model = StockTransfer`; `fields = [ "id", "restaurant", "ingredient", "ingredient_name", "from_branch", "from_branch_name", "to_branch", "to_branch_name", "quantity", "status", "notes", "created_by", "created_by_name", "approved_by", "approved_by_name", "created_at", "approved_at", "updated_at", "logs", ]`; `read_only_fields = [ "restaurant", "status", "created_by", "approved_by", "created_at", "approved_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredient_name` | `serializers.ReadOnlyField(source="ingredient.name")` |
| `from_branch_name` | `serializers.ReadOnlyField(source="from_branch.name")` |
| `to_branch_name` | `serializers.ReadOnlyField(source="to_branch.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `approved_by_name` | `serializers.ReadOnlyField(source="approved_by.name")` |

### IngredientUsageSerializer

Serializer/model rules: `model = Ingredient`; `fields = [ "id", "name", "unit", "quantity_available", "minimum_threshold", "menu_items" ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_items` | `serializers.SerializerMethodField()` |
| `quantity_available` | `serializers.SerializerMethodField()` |
| `minimum_threshold` | `serializers.SerializerMethodField()` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Ingredients, stock levels, adjustments, and movement correction](../../modules/inventory/stock.md)
- [Request and review a cross-branch stock transfer](../../modules/inventory/transfers.md)
- [Suppliers and purchase invoices: draft, receive, and approve](../../modules/procurement/purchasing.md)
- [Pay suppliers, inspect ledgers, and manage invoice attachments](../../modules/procurement/payments_attachments.md)
