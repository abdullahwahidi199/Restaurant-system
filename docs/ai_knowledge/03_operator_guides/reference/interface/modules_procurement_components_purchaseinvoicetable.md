---
id: "operator_reference_interface_modules_procurement_components_purchaseinvoicetable"
title: "Purchase Invoice Table — controls and fields"
module: "procurement"
description: "Purchase Invoice Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["procurement", "purchase", "invoice", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_procurement_purchasing", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables"]
source_references: ["frontend/src/modules/procurement/components/PurchaseInvoiceTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Purchase Invoice Table — controls and fields

This reference records the controls and fields declared by `PurchaseInvoiceTable`. Use [purchasing](../../modules/procurement/purchasing.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/procurement/components/PurchaseInvoiceTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| DataTable | Parent supplied | `columns` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {getInvoiceNumber(invoice)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {getInvoiceNumber(invoice)} |
| Location | PurchaseInvoiceTable; JSX button; handler () =&gt; onOpen(invoice) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {getInvoiceNumber(invoice)}.  |
| Handler / destination | () =&gt; onOpen(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Open invoice

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open invoice |
| Location | PurchaseInvoiceTable; JSX button; handler () =&gt; onOpen(invoice) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open invoice.  |
| Handler / destination | () =&gt; onOpen(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Record payment

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Record payment |
| Location | PurchaseInvoiceTable; JSX button; handler () =&gt; onPayment(invoice) |
| Appears when | invoice.supplier && Number(invoice.remaining_balance) &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Record payment.  |
| Handler / destination | () =&gt; onPayment(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.open_invoice_587e51ea` | Open invoice | فاکتور باز | خلاص رسید |
| `legacy.record_payment_86e56322` | Record payment | پرداخت رکورد | ریکارډ تادیه |

## Related interface references

- [modules shared erp components datatable](modules_shared_erp_components_datatable.md)
