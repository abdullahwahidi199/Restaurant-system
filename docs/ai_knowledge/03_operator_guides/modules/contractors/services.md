---
id: "operator_modules_contractors_services"
title: "Manage contractors, service contracts, invoices, and payments"
module: "contractors"
description: "Create contractor profiles, service contracts and service invoices, approve drafts, record partial or full payments, and review outstanding amounts and attachments."
keywords: ["contractors", "manage", "service", "contracts", "invoices", "payments", "service invoice", "approval", "outstanding amount", "partial payment"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_reference_backend_contractors_access", "operator_workflows_financial_obligations", "operator_modules_procurement_payments_attachments", "operator_reference_interface_modules_contractors_contractorworkspace", "operator_reference_interface_modules_contractors_components_contractformmodal", "operator_reference_interface_modules_contractors_components_contractorformmodal", "operator_reference_interface_modules_contractors_components_contractorpaymentmodal", "operator_reference_backend_contractors_fields", "operator_reference_backend_contractors_validation"]
frontend_routes: ["/admin/dashboard/contractors", "/finance-manager/contractors"]
source_references: ["frontend/src/modules/contractors/ContractorWorkspace.jsx", "frontend/src/modules/contractors/hooks/useContractorWorkspace.js", "frontend/src/modules/contractors/pages/CreateContractorInvoice.jsx", "frontend/src/modules/contractors/components/ContractFormModal.jsx", "frontend/src/modules/contractors/components/ContractorFormModal.jsx", "frontend/src/modules/contractors/components/ContractorPaymentModal.jsx", "frontend/src/modules/contractors/constants.js", "backend/backend/contractors/models.py", "backend/backend/contractors/serializers.py", "backend/backend/contractors/services.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Manage contractors, service contracts, invoices, and payments

## Open the service workspace

Admin/BranchAdmin **Contractors** and FinanceManager **Contractors**. Prefix `/admin/dashboard` or `/finance-manager`; suffixes `/contractors`, `/contractors/contractors`, `/contractors/contractors/:id`, `/contractors/contracts`, `/contractors/invoices`, `/contractors/invoices/new`, `/contractors/invoices/:id`, `/contractors/payments`, `/contractors/payables`. These records are branch scoped. The mounted portals cover Admin/BranchAdmin and FinanceManager; the broader contractor API also permits InventoryManager/OperationsManager, whose portals have no contractor routes. Endpoint declarations are in [contractors access](../../reference/backend/contractors_access.md).

Contractor invoices record service work and balances. They do not add ingredients, consume stock or create purchase stock movements. A service contract is optional context, not an automatic recurring billing scheduler.

## Create or edit a contractor profile

Use the workspace add-contractor control to open profile form. **Name** is required; **Contact Person**, **Phone**, **Email**, **Address**, **Notes** optional; **Active** defaults true. Save creates/updates a branch contractor; Cancel discards unsaved values. List actions open profile/ledger, edit and delete with the page’s confirmation. Change Active through the edit form; no separate list toggle is mounted. Delete/history protections apply; no restore is supplied.

## Create a service contract

**Service Contracts → Contract** opens contract form: **Contractor** required, **Title** required, **Start Date** today, optional **End Date**, **Contract Value**, **Status** default active, **Notes**. Backend checks contractor branch/restaurant. The model’s choices and decimal constraints are in contractor fields reference; a displayed date pair does not prove end≥start is validated. The mounted Service Contracts table has create/search/status filtering and display, with no edit/delete row actions. A generic update API does not establish an operator edit workflow. Existing invoices remain separate records. **Save Contract** creates the agreement; Start Date is required in the form. Its draft option currently uses a translation that can display “Purchase”; the sent value is draft.

## Create invoice: fields and submission

Select **Create Invoice**/new service invoice. Select active **Contractor** (required), optional matching **Service Contract**, **Invoice Number** where rendered (blank can use server numbering), **Invoice Date** (today), optional **Due Date**, **Description**, initial **Status** (approved default, draft alternative), **Amount Paid Initially**, **Payment Method**, **Payment Reference**, and service lines.

Each line has **Service Type** (default Maintenance), **Description**, positive **Quantity** (default1), and **Unit Price** (nonnegative). Service dropdown includes Electrician, Plumbing, AC Maintenance, Kitchen Equipment, Construction, Cleaning, Maintenance, Interior Design, Sign Board, Installation, Other. Line add/remove acts locally until submission. Service must have a nonblank type/description after service defaults; total is recomputed quantity×unit price server-side. Exact UI field requirements and values are in `CreateContractorInvoice` reference.

Submit draft or approved creation action as rendered. Frontend resets/reloads on success and uses module error banner on failure. Backend transaction creates invoice/lines, computes total and, for a non-draft positive initial amount, creates ContractorPayment. Draft with positive initial amount rejects **Draft invoices cannot receive payments.**; an initial amount exceeding total rejects **Initial payment cannot exceed invoice total.** No inventory is posted.

## Review and approve a draft service invoice

Invoices list has search/status controls and detail links. Detail tabs show line items, payment history and attachments. **Approve** appears for draft where rendered; server promotes draft to approved and recalculates status. It does not pay the contractor. A repeated approve on non-draft returns the current invoice.

## Record a contractor payment and outstanding balance

**Record Payment** opens contractor/invoice selection, **Payment Date** today, **Amount** default remaining when opened from invoice, **Payment Method** cash, optional **Reference Number**/**Notes**. Methods: Cash, Bank Transfer, Mobile Money, Card, Other; selecting one records how money was paid and does not move funds.

Submit after actual payment. Server checks contractor/invoice relationship, restaurant/branch, non-draft and 0<amount≤remaining, creates payment, updates invoice paid/status through model callbacks. UI refreshes invoice, lists and profile. Partial payments leave an outstanding balance; full payment settles it. No general UI edit/delete/void/refund operation exists for posted service invoices/payments. Refresh before retrying a timeout to avoid duplicate money records.

**Payables** lists outstanding invoices with permitted payment/detail actions. Contractor **Profile** shows ledger entries and invoice/payment history; drafts are excluded from invoice ledger totals. Toggling active does not remove historic debt.

## Attachments and errors

Invoice attachment upload/preview/download/remove follows the same separate-request pattern as purchase attachments: supported image/PDF extensions as checked by contractor view, upload attributed to current user, protected blob preview, removal does not reverse service invoice. No automatic size limit or bank integration is promised.

Important failures: **Contractor is required.**, **Contractor not found for this branch.**, **Service contract not found for this contractor.**, **Contractor and invoice are required.**, **Contractor invoice belongs to another branch.**, **Payment amount cannot exceed the remaining balance.** Correct actual selection or ask the authorized approver; do not change branches to escape a restriction. Structured API errors can be replaced by a generic UI fallback.

See [financial obligations](../../workflows/financial_obligations.md) and [payments attachments](../procurement/payments_attachments.md) for the parallel supplier workflow, which has different stock effects.

## Detailed controls, fields, and server rules

- [Contractor Workspace — controls and fields](../../reference/interface/modules_contractors_contractorworkspace.md)
- [Contract Form Modal — controls and fields](../../reference/interface/modules_contractors_components_contractformmodal.md)
- [Contractor Form Modal — controls and fields](../../reference/interface/modules_contractors_components_contractorformmodal.md)
- [Contractor Payment Modal — controls and fields](../../reference/interface/modules_contractors_components_contractorpaymentmodal.md)
- [Contractors — backend fields reference](../../reference/backend/contractors_fields.md)
- [Contractors — backend validation reference](../../reference/backend/contractors_validation.md)
- [Contractors — backend access reference](../../reference/backend/contractors_access.md)
