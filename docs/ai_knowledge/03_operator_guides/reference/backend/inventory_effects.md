---
id: "operator_reference_backend_inventory_effects"
title: "Inventory — backend effects reference"
module: "inventory"
description: "Static inventory implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["inventory", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_inventory_stock", "operator_modules_inventory_transfers", "operator_modules_procurement_purchasing", "operator_modules_procurement_payments_attachments"]
frontend_routes: []
source_references: ["backend/backend/inventory/models.py", "backend/backend/inventory/serializers.py", "backend/backend/inventory/services.py", "backend/backend/inventory/utils.py", "backend/backend/inventory/views.py"]
status: "source_verified"
---

# Inventory — backend effects reference

Static implementation reference for `inventory`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/inventory/models.py`

### StockMovement.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

### PurchaseInvoice.refresh_totals_and_status

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.total_amount = total`
- `self.amount_paid = min(paid, total) if total else Decimal("0.00")`
- `self.status = status`
- `self.save(update_fields=["total_amount", "amount_paid", "status", "updated_at"])`

Named effect helpers: `refresh_totals_and_status`.

### PurchaseInvoiceLine.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.total_price = ( Decimal(self.quantity or 0) * Decimal(self.unit_price or 0) ).quantize(Decimal("0.01"))`
- `super().save(*args, **kwargs)`

### SupplierPayment.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

Named effect helpers: `refresh_totals_and_status`.

### SupplierPayment.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().delete(*args, **kwargs)`

Named effect helpers: `refresh_totals_and_status`.

### StockTransfer.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

## `backend/backend/inventory/serializers.py`

### MenuItemIngredientSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["menu_item"].queryset = menu_items`
- `self.fields["ingredient"].queryset = ingredients`

### StockTransferSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["ingredient"].queryset = ingredients`
- `self.fields["from_branch"].queryset = Branch.objects.filter( restaurant=restaurant, is_active=True, )`
- `self.fields["to_branch"].queryset = Branch.objects.filter( restaurant=restaurant, is_active=True, )`

## `backend/backend/inventory/services.py`

### get_or_create_ingredient_stock

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `IngredientStock.objects.get_or_create( ingredient=ingredient, branch=branch, defaults={ "restaurant": ingredient.restaurant, "quantity_available": ingredient.quantity_available, "minimum_threshold": ingredient.minimum_threshold, "cost_per_unit": ingredient.cost_per_unit, "is_active": ingredient.is_active, }, )`

### change_ingredient_stock

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ingredient.quantity_available = new_quantity`
- `ingredient.cost_per_unit = Decimal(str(cost_per_unit))`
- `ingredient.save(update_fields=["quantity_available", "cost_per_unit"])`

Named effect helpers: `change_ingredient_stock`.

### deduct_menu_item_stock

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `StockMovement.objects.bulk_create(stock_movements, batch_size=100)`

Named effect helpers: `deduct_menu_item_stock`, `consume_production`, `change_ingredient_stock`.

### post_purchase_invoice_inventory

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `invoice.status = _invoice_status(invoice.total_amount, invoice.amount_paid)`
- `StockMovement.objects.create( ingredient=ingredient, restaurant=invoice.restaurant, branch=invoice.branch, change_quantity=line.quantity, movement_type="purchase", created_by=created_by or invoice.created_by, unit_cost=line.unit_price, note=( f"Purchase invoice {invoice.invoice_number or invoice.id}" + (f" from {invoice.supplier.name}" if invoice.supplier_id else "") ), )`
- `PurchaseInvoiceLine.objects.filter(pk=line.pk).update(stock_movement=movement)`
- `invoice.is_inventory_posted = True`
- `invoice.save(update_fields=["is_inventory_posted", "status", "updated_at"])`

Named effect helpers: `post_purchase_invoice_inventory`, `change_ingredient_stock`, `update_menu_item_availability`, `refresh_totals_and_status`.

### create_purchase_invoice

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `PurchaseInvoice.objects.create( restaurant=restaurant, branch=branch, supplier=supplier, invoice_number=(data.get("invoice_number") or "").strip(), purchase_date=data.get("purchase_date") or timezone.localdate(), due_date=data.get("due_date") or None, notes=(data.get("notes") or "").strip(), status=PurchaseInvoice.STATUS_DRAFT if is_draft else PurchaseInvoice.STATUS_UNPAID, created_by=created_by, )`
- `PurchaseInvoiceLine.objects.create( invoice=invoice, ingredient=line["ingredient"], quantity=line["quantity"], unit_price=line["unit_price"], total_price=line["total_price"], )`
- `invoice.amount_paid = initial_paid`
- `invoice.status = _invoice_status(invoice.total_amount, initial_paid)`
- `invoice.save(update_fields=["amount_paid", "status", "updated_at"])`

Named effect helpers: `create_purchase_invoice`, `refresh_totals_and_status`, `post_purchase_invoice_inventory`, `create_supplier_payment`.

### create_supplier_payment

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `SupplierPayment.objects.create( restaurant=restaurant, branch=invoice.branch, supplier=supplier, purchase_invoice=invoice, date=data.get("date") or timezone.localdate(), amount=amount, payment_method=data.get("payment_method") or "cash", reference_number=(data.get("reference_number") or "").strip(), notes=(data.get("notes") or "").strip(), created_by=created_by, )`

Named effect helpers: `create_supplier_payment`.

### deduct_batch_stock_for_order_items

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `StockMovement.objects.bulk_create(stock_movements, batch_size=100)`

Named effect helpers: `deduct_batch_stock_for_order_items`, `consume_production`, `change_ingredient_stock`.

### edit_stock_movement

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `movement.change_quantity = new_effect`
- `movement.movement_type = new_movement_type`
- `movement.unit_cost = Decimal( new_unit_cost )`
- `movement.save()`
- `linked_line.quantity = new_effect`
- `linked_line.unit_price = Decimal(movement.unit_cost or 0)`
- `linked_line.save()`

Named effect helpers: `change_ingredient_stock`, `refresh_totals_and_status`, `update_menu_item_availability`.

## `backend/backend/inventory/utils.py`

### update_platter_availability

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `platter.is_available = False`
- `platter.save(update_fields=["is_available"])`
- `platter.is_available = is_available`

## `backend/backend/inventory/views.py`

### purchase_invoice_attachment_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `PurchaseInvoiceAttachment.objects.create( invoice=invoice, restaurant=invoice.restaurant, branch=invoice.branch, file=uploaded_file, original_filename=uploaded_file.name, content_type=getattr(uploaded_file, "content_type", "") or "", file_size=getattr(uploaded_file, "size", 0) or 0, uploaded_by=getattr(request.user, "staff_profile", None), )`

### purchase_invoice_attachment_delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `attachment.file.delete(save=False)`
- `attachment.delete()`

### supplier_payment_voucher_pdf

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `p.save()`

### stock_transfer_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, created_by=getattr(request.user, "staff_profile", None), )`
- `StockTransferLog.objects.create( transfer=transfer, action="created", actor=getattr(request.user, "staff_profile", None), message="Transfer requested.", )`

Named effect helpers: `record_instance_create`.

### stock_transfer_action

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `transfer.status = "rejected" if action == "reject" else "cancelled"`
- `transfer.approved_by = staff`
- `transfer.approved_at = now()`
- `transfer.save(update_fields=["status", "approved_by", "approved_at", "updated_at"])`
- `StockTransferLog.objects.create( transfer=transfer, action=transfer.status, actor=staff, message=f"Transfer {transfer.status}.", )`
- `Ingredient.objects.get_or_create( restaurant=restaurant, branch=transfer.to_branch, name=ingredient.name, defaults={ "unit": ingredient.unit, "quantity_available": 0, "minimum_threshold": ingredient.minimum_threshold, "cost_per_unit": ingredient.cost_per_unit, "is_active": ingredient.is_active, }, )`
- `StockMovement.objects.create( restaurant=restaurant, branch=transfer.from_branch, ingredient=ingredient, change_quantity=-transfer.quantity, movement_type="transfer_out", created_by=staff, note=f"Transfer #{transfer.id} to {transfer.to_branch.name}", )`
- `StockMovement.objects.create( restaurant=restaurant, branch=transfer.to_branch, ingredient=destination_ingredient, change_quantity=transfer.quantity, movement_type="transfer_in", created_by=staff, note=f"Transfer #{transfer.id} from {transfer.from_branch.name}", )`
- `transfer.status = "approved"`
- `StockTransferLog.objects.create( transfer=transfer, action="approved", actor=staff, message="Transfer approved and inventory moved.", )`

Named effect helpers: `record_instance_update`, `change_ingredient_stock`, `update_menu_item_availability`.

### adjust_stock_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `StockMovement.objects.create( ingredient=ingredient, change_quantity=quantity, restaurant=ingredient.restaurant, branch=branch, movement_type=movement_type, created_by=getattr(request.user, 'staff_profile', None) )`

Named effect helpers: `adjust_stock_view`, `change_ingredient_stock`, `update_menu_item_availability`, `record_instance_create`.

### IngredientListCreateView.perform_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `record_instance_create`.

### IngredientRetrieveUpdateDestroyView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_update`.

### IngredientRetrieveUpdateDestroyView.perform_destroy

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.delete()`

Named effect helpers: `record_instance_delete`.

### MenuItemIngredientListCreateView.perform_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_create`, `update_menu_item_availability`.

### MenuItemIngredientDeleteView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_update`, `update_menu_item_availability`.

### MenuItemIngredientDeleteView.perform_destroy

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.delete()`

Named effect helpers: `record_instance_delete`, `update_menu_item_availability`.

### SupplierListCreateView.perform_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `create_audit_log`.

### SupplierRetrieveUpdateView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `create_audit_log`.

### SupplierRetrieveUpdateView.perform_destroy

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.delete()`

Named effect helpers: `create_audit_log`.

## Related operating procedures

- [Ingredients, stock levels, adjustments, and movement correction](../../modules/inventory/stock.md)
- [Request and review a cross-branch stock transfer](../../modules/inventory/transfers.md)
- [Suppliers and purchase invoices: draft, receive, and approve](../../modules/procurement/purchasing.md)
- [Pay suppliers, inspect ledgers, and manage invoice attachments](../../modules/procurement/payments_attachments.md)
