---
id: "operator_reference_interface_modules_procurement_components_purchaseinvoicedetailmodal"
title: "Purchase Invoice Detail Modal — controls and fields"
module: "procurement"
description: "Purchase Invoice Detail Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["procurement", "purchase", "invoice", "detail", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_procurement_purchasing", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables"]
source_references: ["frontend/src/modules/procurement/components/PurchaseInvoiceDetailModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Purchase Invoice Detail Modal — controls and fields

This reference records the controls and fields declared by `PurchaseInvoiceDetailModal`. Use [purchasing](../../modules/procurement/purchasing.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/procurement/components/PurchaseInvoiceDetailModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| Panel | Supplier | `See parent row data and linked procedure.` |
| Panel | Purchase Date | `See parent row data and linked procedure.` |
| Panel | Due Date | `See parent row data and linked procedure.` |
| Panel | Status | `See parent row data and linked procedure.` |
| Panel | Invoice Total | `See parent row data and linked procedure.` |
| Panel | Paid | `See parent row data and linked procedure.` |
| Panel | Remaining | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {React.createElement(Icon, { className: "h-4 w-4" })} {label}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {React.createElement(Icon, { className: "h-4 w-4" })} {label} |
| Location | PurchaseInvoiceDetailModal; JSX button; handler () =&gt; setActiveTab(key) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {React.createElement(Icon, { className: "h-4 w-4" })} {label}.  |
| Handler / destination | () =&gt; setActiveTab(key) |
| Local UI result | setActiveTab |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Approve

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Approve |
| Location | PurchaseInvoiceDetailModal; JSX button; handler () =&gt; onApprove(invoice) |
| Appears when | invoice.status === "draft" |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Approve.  |
| Handler / destination | () =&gt; onApprove(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Record Payment

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Record Payment |
| Location | PurchaseInvoiceDetailModal; JSX button; handler () =&gt; onPayment(invoice) |
| Appears when | invoice.supplier && Number(invoice.remaining_balance) &gt; 0 && invoice.status !== "draft" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Record Payment.  |
| Handler / destination | () =&gt; onPayment(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Unlabelled control (see binding) | FileUploader;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=saving; shown when activeTab === "attachments" |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.approve` | Approve | تایید | منل |
| `legacy.record_payment_6577ced3` | Record Payment | پرداخت رکورد | ریکارډ تادیه |

## Related interface references

- [modules shared erp components fileuploader](modules_shared_erp_components_fileuploader.md)
- [modules shared erp components modal](modules_shared_erp_components_modal.md)
- [modules shared erp components panel](modules_shared_erp_components_panel.md)
- [modules procurement components purchaseattachmentlist](modules_procurement_components_purchaseattachmentlist.md)
- [modules procurement components purchaseinvoicelinestable](modules_procurement_components_purchaseinvoicelinestable.md)
- [modules procurement components purchasepaymenthistory](modules_procurement_components_purchasepaymenthistory.md)
