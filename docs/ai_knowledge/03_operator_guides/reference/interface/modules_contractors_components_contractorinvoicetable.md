---
id: "operator_reference_interface_modules_contractors_components_contractorinvoicetable"
title: "Contractor Invoice Table — controls and fields"
module: "contractors"
description: "Contractor Invoice Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["contractors", "contractor", "invoice", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_contractors_services", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables"]
source_references: ["frontend/src/modules/contractors/components/ContractorInvoiceTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Contractor Invoice Table — controls and fields

This reference records the controls and fields declared by `ContractorInvoiceTable`. Use [services](../../modules/contractors/services.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/contractors/components/ContractorInvoiceTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| DataTable | Parent supplied | `[ { key: "invoice", header: "Invoice", render: (invoice) =&gt; ( &lt;button type="button" onClick={() =&gt; onOpen(invoice.id)} className="font-semibold theme-text-primary hover:underline"&gt; {getContractorInvoiceNumber(invoice)} &lt;/button&gt; ), }, { key: "contractor", header: "Contractor", render: (invoice) =&gt; invoice.contractor_name }, !compact && { key: "contract", header: "Contract", render: (invoice) =&gt; invoice.contract_title \|\| "-" }, { key: "date", header: "Date", render: (invoice) =&gt; invoice.invoice_date }, { key: "status", header: "Status", render: (invoice) =&gt; &lt;StatusBadge status={invoice.status} /&gt; }, { key: "total", header: "Total", className: "text-right font-semibold tabular-nums theme-text-primary", render: (invoice) =&gt; money(invoice.total_amount) }, { key: "balance", header: "Balance", className: "text-right font-semibold tabular-nums text-[var(--theme-danger)]", render: (invoice) =&gt; money(invoice.remaining_balance) }, { key: "action", header: "Actions", render: (invoice) =&gt; ( &lt;div className="flex justify-end gap-2"&gt; &lt;button type="button" onClick={() =&gt; onOpen(invoice.id)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={Open invoice}&gt; &lt;Eye className="h-4 w-4" /&gt; &lt;/button&gt; {Number(invoice.remaining_balance \|\| 0) &gt; 0 && invoice.status !== "draft" && ( &lt;button type="button" onClick={() =&gt; onPayment(invoice)} className="theme-btn theme-btn-outline theme-btn-icon theme-text-muted" title={Record payment}&gt; &lt;CreditCard className="h-4 w-4" /&gt; &lt;/button&gt; )} &lt;/div&gt; ), }, ].filter(Boolean)` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {getContractorInvoiceNumber(invoice)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {getContractorInvoiceNumber(invoice)} |
| Location | ContractorInvoiceTable; JSX button; handler () =&gt; onOpen(invoice.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {getContractorInvoiceNumber(invoice)}.  |
| Handler / destination | () =&gt; onOpen(invoice.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Open invoice

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open invoice |
| Location | ContractorInvoiceTable; JSX button; handler () =&gt; onOpen(invoice.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open invoice.  |
| Handler / destination | () =&gt; onOpen(invoice.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Record payment

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Record payment |
| Location | ContractorInvoiceTable; JSX button; handler () =&gt; onPayment(invoice) |
| Appears when | Number(invoice.remaining_balance \|\| 0) &gt; 0 && invoice.status !== "draft" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Record payment.  |
| Handler / destination | () =&gt; onPayment(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.open_invoice_587e51ea` | Open invoice | فاکتور باز | خلاص رسید |
| `legacy.record_payment_86e56322` | Record payment | پرداخت رکورد | ریکارډ تادیه |

## Related interface references

- [modules shared erp components datatable](modules_shared_erp_components_datatable.md)
