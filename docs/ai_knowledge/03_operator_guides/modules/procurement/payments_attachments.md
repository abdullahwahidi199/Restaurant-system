---
id: "operator_modules_procurement_payments_attachments"
title: "Pay suppliers, inspect ledgers, and manage invoice attachments"
module: "procurement"
description: "Record supplier payments against non-draft purchase invoices, review outstanding balances and ledgers, print payment vouchers, and manage invoice attachments."
keywords: ["procurement", "suppliers", "inspect", "ledgers", "manage", "invoice", "attachments", "supplier payment", "outstanding amount", "payment voucher", "invoice attachment"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_procurement_purchasing", "operator_reference_backend_inventory_validation", "operator_troubleshooting_errors_and_recovery", "operator_reference_interface_modules_procurement_components_supplierpaymentmodal", "operator_reference_interface_modules_procurement_components_purchasepaymenthistory", "operator_reference_interface_modules_procurement_components_paymentvouchermodal", "operator_reference_interface_modules_procurement_components_purchaseattachmentlist", "operator_reference_backend_inventory_fields", "operator_reference_backend_inventory_access"]
frontend_routes: []
source_references: ["frontend/src/modules/procurement/components/SupplierPaymentModal.jsx", "frontend/src/modules/procurement/components/PurchasePaymentHistory.jsx", "frontend/src/modules/procurement/components/PaymentVoucherModal.jsx", "frontend/src/modules/procurement/components/PurchaseAttachmentList.jsx", "frontend/src/modules/procurement/components/SupplierProfileModal.jsx", "frontend/src/modules/procurement/hooks/useProcurementWorkspace.js", "backend/backend/inventory/services.py:create_supplier_payment", "backend/backend/inventory/services.py:supplier_ledger", "backend/backend/inventory/views.py:purchase_invoice_attachment_list_create", "backend/backend/inventory/views.py:supplier_payment_voucher_pdf", "backend/backend/inventory/models.py:SupplierPayment"]
status: "source_verified"
---

# Pay suppliers, inspect ledgers, and manage invoice attachments

Open **Procurement → Supplier Payments**, **Outstanding Payables**, a purchase invoice, or supplier profile under the current permitted portal. These are operational transaction screens; this guide does not define business analytics.

## Record a partial or full supplier payment

1. Find a non-draft invoice with remaining balance and supplier. **Record Payment** opens the payment modal; from the invoice it preselects supplier/invoice and defaults amount to remaining balance.
2. Select **Supplier** and **Purchase Invoice** if not prefilled. The UI filters invoice options by supplier and positive balance; a stale option can still be rejected by server.
3. Enter **Payment Date** (today), **Amount** (required), **Payment Method** (cash default), optional **Reference Number** and **Notes**.
4. Verify actual payment has occurred, then **Record Payment** once. **Cancel** closes without creating payment. While saving, submission is disabled.
5. Server locks invoice and checks same restaurant/supplier, active branch, non-draft status, positive amount and amount≤remaining. It creates SupplierPayment; model callbacks refresh invoice paid amount/status. Partial payment leaves balance; full payment settles it. UI closes modal, refreshes invoices/payments/profile and can open the paid invoice. Notice **Supplier payment recorded.**

Required backend errors: **Supplier and purchase invoice are required.**, **Purchase invoice not found for this supplier.**, **Purchase invoice belongs to another branch.**, **Draft invoices cannot receive payments.**, **Payment amount must be greater than zero.**, **Payment amount cannot exceed the remaining balance.** Correct the selection/amount or have an authorized operator approve draft first. Re-read balance after another operator pays.

The screen records payment; it does not send money. No general supplier-payment edit/delete/refund UI is implemented. After an ambiguous network failure, reload payments and invoice before re-entering money. There is no documented payment idempotency key protecting arbitrary retries.

## Vouchers and ledger

Payment history rows offer voucher preview and PDF download. Inspect supplier, invoice, date, method, amount and balance; print from voucher modal/browser where offered. Downloading/reprinting does not create another payment. Supplier profile/ledger shows invoice debits and payment credits in chronological order; draft invoices are excluded. An active toggle on supplier does not erase this history.

## Attachments

Invoice **Attachments** tab provides file upload and existing file list. Select supported JPG/JPEG/PNG/PDF files, upload, and wait for **Attachment uploaded.** Multiple files are submitted as `files`. Backend checks filename extensions; do not claim an unimplemented file-size or content-scanning limit. Shared FileUploader’s `accept` is a selection hint, not a complete server guarantee.

**Preview** downloads a protected blob into an image/PDF preview modal; **Download** saves the original filename; **Remove** deletes attachment record/file according to handler and refreshes invoice, notice **Attachment removed.** Deleting an attachment does not delete or reverse invoice/payment/stock. No restore is provided; reupload a correct source file if authorized. Check invoice association before deleting.

An upload can fail after invoice creation succeeded because attachments are separate requests. Retain invoice number and upload again from its detail rather than recreating invoice. Protected-file load failures can be permission/network/backend storage issues; do not make files public to work around them.

See [purchasing](purchasing.md), [inventory validation](../../reference/backend/inventory_validation.md), and [errors and recovery](../../troubleshooting/errors_and_recovery.md).

## Detailed controls, fields, and server rules

- [Supplier Payment Modal — controls and fields](../../reference/interface/modules_procurement_components_supplierpaymentmodal.md)
- [Purchase Payment History — controls and fields](../../reference/interface/modules_procurement_components_purchasepaymenthistory.md)
- [Payment Voucher Modal — controls and fields](../../reference/interface/modules_procurement_components_paymentvouchermodal.md)
- [Purchase Attachment List — controls and fields](../../reference/interface/modules_procurement_components_purchaseattachmentlist.md)
- [Inventory — backend fields reference](../../reference/backend/inventory_fields.md)
- [Inventory — backend validation reference](../../reference/backend/inventory_validation.md)
- [Inventory — backend access reference](../../reference/backend/inventory_access.md)
