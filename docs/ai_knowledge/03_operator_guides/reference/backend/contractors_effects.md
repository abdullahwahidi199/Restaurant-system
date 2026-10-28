---
id: "operator_reference_backend_contractors_effects"
title: "Contractors — backend effects reference"
module: "contractors"
description: "Static contractors implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["contractors", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_contractors_services"]
frontend_routes: []
source_references: ["backend/backend/contractors/models.py", "backend/backend/contractors/serializers.py", "backend/backend/contractors/services.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Contractors — backend effects reference

Static implementation reference for `contractors`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/contractors/models.py`

### ContractorInvoice.refresh_totals_and_status

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.total_amount = total`
- `self.amount_paid = min(paid, total) if total else Decimal("0.00")`
- `self.status = status`
- `self.save(update_fields=["total_amount", "amount_paid", "status", "updated_at"])`

Named effect helpers: `refresh_totals_and_status`.

### ContractorInvoiceLine.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.total_price = ( Decimal(self.quantity or 0) * Decimal(self.unit_price or 0) ).quantize(Decimal("0.01"))`
- `super().save(*args, **kwargs)`

### ContractorPayment.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

Named effect helpers: `refresh_totals_and_status`.

### ContractorPayment.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().delete(*args, **kwargs)`

Named effect helpers: `refresh_totals_and_status`.

## `backend/backend/contractors/serializers.py`

### ServiceContractSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["contractor"].queryset = contractors`

## `backend/backend/contractors/services.py`

### create_contractor_invoice

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ContractorInvoice.objects.create( restaurant=restaurant, branch=branch, contractor=contractor, contract=contract, invoice_number=(data.get("invoice_number") or "").strip(), invoice_date=data.get("invoice_date") or timezone.localdate(), due_date=data.get("due_date") or None, description=(data.get("description") or "").strip(), status=ContractorInvoice.STATUS_DRAFT if is_draft else ContractorInvoice.STATUS_APPROVED, created_by=created_by, )`
- `ContractorInvoiceLine.objects.create( invoice=invoice, service_type=line["service_type"], description=line["description"], quantity=line["quantity"], unit_price=line["unit_price"], total_price=line["total_price"], )`

Named effect helpers: `create_contractor_invoice`, `refresh_totals_and_status`, `create_contractor_payment`.

### approve_contractor_invoice

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `invoice.status = ContractorInvoice.STATUS_APPROVED`
- `invoice.save(update_fields=["status", "updated_at"])`

Named effect helpers: `approve_contractor_invoice`, `refresh_totals_and_status`.

### create_contractor_payment

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ContractorPayment.objects.create( restaurant=restaurant, branch=invoice.branch, contractor=contractor, invoice=invoice, date=data.get("date") or timezone.localdate(), amount=amount, payment_method=data.get("payment_method") or "cash", reference_number=(data.get("reference_number") or "").strip(), notes=(data.get("notes") or "").strip(), created_by=created_by, )`

Named effect helpers: `create_contractor_payment`.

## `backend/backend/contractors/views.py`

### contractor_invoice_attachment_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ContractorInvoiceAttachment.objects.create( invoice=invoice, restaurant=invoice.restaurant, branch=invoice.branch, file=uploaded_file, original_filename=uploaded_file.name, content_type=getattr(uploaded_file, "content_type", "") or "", file_size=getattr(uploaded_file, "size", 0) or 0, uploaded_by=getattr(request.user, "staff_profile", None), )`

### contractor_invoice_attachment_delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `attachment.file.delete(save=False)`
- `attachment.delete()`

### ContractorListCreateView.perform_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `create_audit_log`.

### ContractorRetrieveUpdateView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `create_audit_log`.

### ContractorRetrieveUpdateView.perform_destroy

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.delete()`

Named effect helpers: `create_audit_log`.

### ServiceContractListCreateView.perform_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=branch, created_by=getattr(self.request.user, "staff_profile", None), )`

Named effect helpers: `create_audit_log`.

### ServiceContractRetrieveUpdateView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `create_audit_log`.

## Related operating procedures

- [Manage contractors, service contracts, invoices, and payments](../../modules/contractors/services.md)
