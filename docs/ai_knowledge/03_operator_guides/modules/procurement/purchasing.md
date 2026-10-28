---
id: "operator_modules_procurement_purchasing"
title: "Suppliers and purchase invoices: draft, receive, and approve"
module: "procurement"
description: "Create or edit suppliers, enter purchase invoice lines, save drafts or receive stock immediately, and approve drafts with inventory and initial-payment effects."
keywords: ["procurement", "suppliers", "purchase", "invoices", "draft", "receive", "approve", "purchase invoice", "supplier", "goods receipt", "draft approval"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_reference_backend_inventory_access", "operator_modules_procurement_payments_attachments", "operator_workflows_restock_and_prepare", "operator_reference_interface_modules_procurement_procurementworkspace", "operator_reference_interface_modules_procurement_components_purchaselineeditor", "operator_reference_interface_modules_procurement_components_supplierformmodal", "operator_reference_backend_inventory_fields", "operator_reference_backend_inventory_validation"]
frontend_routes: ["/admin/dashboard/procurement", "/finance-manager/procurement", "/operations-manager/procurement"]
source_references: ["frontend/src/modules/procurement/ProcurementWorkspace.jsx", "frontend/src/modules/procurement/pages/CreatePurchaseInvoice.jsx", "frontend/src/modules/procurement/components/PurchaseLineEditor.jsx", "frontend/src/modules/procurement/components/SupplierFormModal.jsx", "frontend/src/modules/procurement/hooks/useProcurementWorkspace.js", "frontend/src/modules/procurement/utils/calculations.js", "backend/backend/inventory/services.py:create_purchase_invoice", "backend/backend/inventory/services.py:post_purchase_invoice_inventory", "backend/backend/inventory/models.py:PurchaseInvoice", "backend/backend/inventory/views.py"]
status: "source_verified"
---

# Suppliers and purchase invoices: draft, receive, and approve

## Pages and permissions

Admin/BranchAdmin **Restaurant → Procurement**; Finance/Operations Manager **Procurement**. Prefixes `/admin/dashboard`, `/finance-manager`, `/operations-manager` share suffixes `/procurement`, `/procurement/purchase-invoices`, `/procurement/purchase-invoices/new`, `/procurement/purchase-invoices/:id`, `/procurement/suppliers`, `/procurement/suppliers/:id`, `/procurement/supplier-payments`, `/procurement/payables`.

Supplier/purchase read/create endpoints generally allow Admin/BranchAdmin, InventoryManager, OperationsManager and FinanceManager; InventoryManager lacks these React routes. Approve endpoint permission is narrower where declared; [inventory access](../../reference/backend/inventory_access.md) lists exact endpoint policy. A button does not override it. Active restaurant and branch are needed for writes.

## Supplier create/edit/delete

Use **Supplier** / add-supplier action to open the modal. Fields: **Name** required; **Contact Person**, **Phone**, **Email**, **Address**, **Notes** optional; **Active** checkbox true. Backend text lengths/email format and uniqueness constraints are in inventory fields reference. **Save Supplier** creates/updates; successful notice **Supplier created. / Supplier updated.** and refreshed list. **Cancel** leaves database unchanged.

Supplier list supports search, edit, active toggle, profile/ledger and delete controls. Toggle changes future active selection, not historic invoices. Profile shows supplier and transactions; it is not another payment receipt. Delete removes supplier only if the view’s protections permit it; financial history can block it. No restore UI exists. Duplicate-name database/serializer handling is not uniform, so retain the error and have an administrator check for an existing supplier before trying a new spelling.

## Purchase invoice entry

Open **New Invoice** / **Create Purchase Invoice**. Prepare ingredient definitions and optional supplier first. The creator is current staff; branch is active context.

| Field / control | Required/default | Validation / effect |
|---|---|---|
| Supplier | Optional, blank **Cash purchase** | Select active matching branch supplier for debt/payment tracking; omitted supplier creates a cash purchase. |
| Purchase Date | Required control, today | Date. Service defaults today if omitted. |
| Due Date | Optional, empty→null | Date. No universal due≥purchase custom validation is defined in service. |
| Invoice Number | Payload exists; no current create-page input | Blank causes server’s model numbering. Do not invent an input because constants contain it. |
| Notes | Optional | Text. |
| Ingredient per line | Required for submitted lines | Current branch active ingredient; changing selection clears quantity/prices in frontend. |
| Quantity | Positive | Decimal; unit conversion helper may convert kg/l purchases to g/ml stock units. Follow displayed unit and preview. |
| Unit Price / Total Price | Numbers | Frontend synchronizes quantity×unit price/total; backend recalculates total from normalized quantity×unit price and rejects negative unit price. |
| Amount Paid Initially | Optional, blank→0 | Numeric input permits up to two decimal places; finite and ≤invoice total. UI clears it if supplier is removed and disables it for no supplier. Service has broader cash-purchase behavior; current UI does not collect a separate cash initial amount. |
| Payment Method | Default cash | Dropdown options defined in shared ERP constants. Records method, does not initiate a bank transaction. |
| Total / Remaining | Calculated | Review before submit; server recalculates. |

Use line **Add**/**Remove** controls to compose the purchase. Frontend filters incomplete rows according to submit handler; server requires at least one valid line, positive quantity, nonnegative price, active same-branch ingredient. **Create Invoice** submits non-draft; **Save Draft** stores draft. These are button handlers, so field wrappers’ required indicators are not proof of native submit enforcement.

## What each submit actually does

**Create Invoice:** transaction creates header/lines, computes total, posts all quantities into inventory, sets ingredient cost to line unit cost, creates purchase stock movements linked to invoice lines, recalculates menu/platter availability, sets inventory-posted flag and financial status. Supplier initial amount creates a SupplierPayment. Success **Purchase invoice created.** resets the form and follows `onCreated` navigation/list reload. This is receiving stock, not just storing an invoice image.

**Save Draft:** stores invoice/lines with no inventory posting and no supplier payment. Current initial amount is not preserved as an unapplied future payment record. On detail, **Approve** posts inventory once and sets financial status. Repeated posting is guarded by `is_inventory_posted`. Check details after an uncertain response before approving again.

Invoice detail tabs show lines, payment history, attachments and related information as rendered. List supports search/status and row detail/approval/payment. Draft cannot receive payment. There is no current general edit/delete/void/refund workflow for invoice lines after creation. Do not describe supplier edit or movement edit as invoice correction. If a posted purchase is wrong, preserve evidence and involve the authorized manager before separate supported inventory/financial correction.

Exact failures include **An active branch is required to create a purchase invoice.**, **At least one invoice line is required.**, **Line {n}: ingredient not found for this branch.**, **quantity must be greater than zero**, **unit price cannot be negative**, **Initial payment cannot exceed invoice total.** UI can hide structured field errors behind a generic message. Verify actual records before retrying.

Continue with [payments attachments](payments_attachments.md) and [restock and prepare](../../workflows/restock_and_prepare.md).

## Detailed controls, fields, and server rules

- [Procurement Workspace — controls and fields](../../reference/interface/modules_procurement_procurementworkspace.md)
- [Purchase Line Editor — controls and fields](../../reference/interface/modules_procurement_components_purchaselineeditor.md)
- [Supplier Form Modal — controls and fields](../../reference/interface/modules_procurement_components_supplierformmodal.md)
- [Inventory — backend fields reference](../../reference/backend/inventory_fields.md)
- [Inventory — backend validation reference](../../reference/backend/inventory_validation.md)
- [Inventory — backend access reference](../../reference/backend/inventory_access.md)
