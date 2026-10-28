---
id: "operator_reference_backend_inventory_validation"
title: "Inventory — backend validation reference"
module: "inventory"
description: "Static inventory implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["inventory", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_inventory_stock", "operator_modules_inventory_transfers", "operator_modules_procurement_purchasing", "operator_modules_procurement_payments_attachments"]
frontend_routes: []
source_references: ["backend/backend/inventory/models.py", "backend/backend/inventory/serializers.py", "backend/backend/inventory/services.py", "backend/backend/inventory/utils.py", "backend/backend/inventory/views.py"]
status: "source_verified"
---

# Inventory — backend validation reference

Static implementation reference for `inventory`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/inventory/models.py`

### StockMovement.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.ingredient_id and self.ingredient.branch_id and self.ingredient.branch_id != self.branch_id` | `ValueError("Stock movement ingredient belongs to another branch.")` |
| `self.branch_id and self.related_order_id and self.related_order.branch_id != self.branch_id` | `ValueError("Stock movement order belongs to another branch.")` |

### StockTransfer.clean

| Trigger / condition | Server result or message |
|---|---|
| `self.from_branch_id == self.to_branch_id` | `ValueError("Transfer source and destination branches must differ.")` |
| `self.from_branch.restaurant_id != self.restaurant_id` | `ValueError("Source branch belongs to another restaurant.")` |
| `self.to_branch.restaurant_id != self.restaurant_id` | `ValueError("Destination branch belongs to another restaurant.")` |
| `self.ingredient.restaurant_id != self.restaurant_id` | `ValueError("Ingredient belongs to another restaurant.")` |
| `self.ingredient.branch_id and self.ingredient.branch_id != self.from_branch_id` | `ValueError("Ingredient stock belongs to another source branch.")` |

## `backend/backend/inventory/serializers.py`

### IngredientSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `duplicate.exists()` | `serializers.ValidationError( {"name": "An ingredient with this name already exists for this branch."} )` |

### MenuItemIngredientSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `menu_item and ingredient and menu_item.restaurant_id != ingredient.restaurant_id` | `serializers.ValidationError( {"ingredient": "This ingredient belongs to another restaurant."} )` |
| `branch and menu_item and menu_item.branch_id and menu_item.branch_id != branch.id` | `serializers.ValidationError( {"menu_item": "This menu item belongs to another branch."} )` |
| `branch and ingredient and ingredient.branch_id and ingredient.branch_id != branch.id` | `serializers.ValidationError( {"ingredient": "This ingredient belongs to another branch."} )` |

### StockTransferSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `from_branch and to_branch and from_branch.id == to_branch.id` | `serializers.ValidationError( {"to_branch": "Destination branch must be different."} )` |
| `quantity is not None and quantity &lt;= 0` | `serializers.ValidationError( {"quantity": "Quantity must be greater than zero."} )` |
| `ingredient and from_branch and ingredient.branch_id and ingredient.branch_id != from_branch.id` | `serializers.ValidationError( {"ingredient": "This ingredient does not belong to the source branch."} )` |

## `backend/backend/inventory/services.py`

### change_ingredient_stock

| Trigger / condition | Server result or message |
|---|---|
| `branch and ingredient.branch_id and ingredient.branch_id != branch.id` | `ValueError("Ingredient stock belongs to another branch.")` |
| `new_quantity &lt; 0` | `ValueError(f"Insufficient stock for: {detail}")` |

### _decimal

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Enter a valid amount.")` |

### _supplier_for_invoice

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Supplier not found for this branch.")` |

### _invoice_lines_from_payload

| Trigger / condition | Server result or message |
|---|---|
| `not ingredient_id` | `ValueError(f"Line {index}: ingredient is required.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError(f"Line {index}: ingredient not found for this branch.")` |
| `quantity &lt;= 0` | `ValueError(f"Line {index}: quantity must be greater than zero.")` |
| `unit_price &lt; 0` | `ValueError(f"Line {index}: unit price cannot be negative.")` |
| `not lines` | `ValueError("At least one invoice line is required.")` |

### create_purchase_invoice

| Trigger / condition | Server result or message |
|---|---|
| `not branch` | `ValueError("An active branch is required to create a purchase invoice.")` |
| `initial_paid &gt; invoice.total_amount` | `ValueError("Initial payment cannot exceed invoice total.")` |

### create_supplier_payment

| Trigger / condition | Server result or message |
|---|---|
| `not supplier_id or not invoice_id` | `ValueError("Supplier and purchase invoice are required.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Supplier not found.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Purchase invoice not found for this supplier.")` |
| `branch and invoice.branch_id != branch.id` | `ValueError("Purchase invoice belongs to another branch.")` |
| `invoice.status == PurchaseInvoice.STATUS_DRAFT` | `ValueError("Draft invoices cannot receive payments.")` |
| `amount &lt;= 0` | `ValueError("Payment amount must be greater than zero.")` |
| `amount &gt; invoice.remaining_balance` | `ValueError("Payment amount cannot exceed the remaining balance.")` |

### deduct_batch_stock_for_order_items

| Trigger / condition | Server result or message |
|---|---|
| `ingredient_requirements AND insufficient` | `ValueError(f"Insufficient stock for: {', '.join(insufficient)}")` |

## `backend/backend/inventory/views.py`

### ingredient_purchase_history_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Ingredient not found."}, status=404)` |

### purchase_invoice_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### purchase_invoice_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Purchase invoice not found."}, status=404)` |

### _validate_attachment_file

| Trigger / condition | Server result or message |
|---|---|
| `extension not in ALLOWED_ATTACHMENT_EXTENSIONS` | `ValueError("Only JPG, JPEG, PNG, and PDF files are supported.")` |

### purchase_invoice_attachment_list_create

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Purchase invoice not found."}, status=404)` |
| `not files` | `Response( {"detail": "Select at least one attachment."}, status=status.HTTP_400_BAD_REQUEST, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### purchase_invoice_attachment_download

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Attachment not found."}, status=404)` |

### purchase_invoice_attachment_delete

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Attachment not found."}, status=404)` |

### purchase_invoice_approve

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Purchase invoice not found."}, status=404)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### supplier_payment_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Supplier payment not found."}, status=404)` |

### supplier_payment_voucher

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Supplier payment not found."}, status=404)` |

### supplier_payment_voucher_pdf

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Supplier payment not found."}, status=404)` |

### supplier_payment_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### supplier_ledger_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Supplier not found."}, status=404)` |

### stock_transfer_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "GET" AND staff.is_branch_admin and request.query_params.get("branch") == "all"` | `Response( {"detail": "Branch Admins cannot request all branch transfers."}, status=status.HTTP_403_FORBIDDEN, )` |
| `staff.is_branch_admin` | `Response( {"detail": "Branch Admins cannot perform cross-branch transfers."}, status=status.HTTP_403_FORBIDDEN, )` |
| `serializer.is_valid()` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### stock_transfer_action

| Trigger / condition | Server result or message |
|---|---|
| `staff and staff.is_branch_admin` | `Response( {"detail": "Branch Admins cannot perform cross-branch transfers."}, status=status.HTTP_403_FORBIDDEN, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Transfer not found."}, status=404)` |
| `transfer.status != "pending"` | `Response( {"detail": "Only pending transfers can be changed."}, status=status.HTTP_400_BAD_REQUEST, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### add_stock_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( { 'detail': 'Purchase invoice created successfully', 'invoice': PurchaseInvoiceSerializer(invoice).data, }, status=status.HTTP_200_OK )` |

### edit_stock_movement_view

| Trigger / condition | Server result or message |
|---|---|
| `movement.movement_type == "order"` | `Response({"detail": "Order movements cannot be edited"}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Invalid quantity"}, status=400)` |
| `movement.movement_type == "purchase" and new_type != "purchase"` | `Response( { "detail": "Purchase movements cannot change type" }, status=400 )` |
| `movement.movement_type in ["adjustment", "waste"] and new_type not in ["adjustment", "waste"]` | `Response( { "detail": "Only adjustment and waste are allowed" }, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Invalid unit cost"}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Stock movement updated"})` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(e)}, status=400)` |

### adjust_stock_view

| Trigger / condition | Server result or message |
|---|---|
| `not ingredient_id or not quantity or not movement_type` | `Response({'detail': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)` |
| `get_effective_quantity(ingredient, branch) + quantity &lt; 0` | `Response( { 'detail': ( f'Insufficient stock. ' f'Available: {get_effective_quantity(ingredient, branch)}' ) }, status=status.HTTP_400_BAD_REQUEST )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'detail': 'Stock adjusted successfully'}, status=status.HTTP_200_OK)` |

## Related operating procedures

- [Ingredients, stock levels, adjustments, and movement correction](../../modules/inventory/stock.md)
- [Request and review a cross-branch stock transfer](../../modules/inventory/transfers.md)
- [Suppliers and purchase invoices: draft, receive, and approve](../../modules/procurement/purchasing.md)
- [Pay suppliers, inspect ledgers, and manage invoice attachments](../../modules/procurement/payments_attachments.md)
