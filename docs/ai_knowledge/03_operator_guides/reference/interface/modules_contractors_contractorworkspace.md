---
id: "operator_reference_interface_modules_contractors_contractorworkspace"
title: "Contractor Workspace — controls and fields"
module: "contractors"
description: "Contractor Workspace — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["contractors", "contractor", "workspace", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_contractors_services", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables"]
source_references: ["frontend/src/modules/contractors/ContractorWorkspace.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Contractor Workspace — controls and fields

This reference records the controls and fields declared by `ContractorWorkspace`. Use [services](../../modules/contractors/services.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/contractors/ContractorWorkspace.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`pageMeta.title`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | pageMeta.title | `tabs` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ContractorWorkspace; JSX CreateContractorInvoice; handler model.submitInvoice |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitInvoice |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Contractor

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Contractor |
| Location | ContractorWorkspace; JSX ActionButton; handler model.startAddContractor |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Contractor.  |
| Handler / destination | model.startAddContractor |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Invoice

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Invoice |
| Location | ContractorWorkspace; JSX Link; handler `${basePath}/contractors/invoices/new` |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Invoice.  |
| Handler / destination | `${basePath}/contractors/invoices/new` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ContractorWorkspace; JSX ContractorFormModal; handler model.submitContractor |
| Appears when | model.showContractorDialog |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitContractor |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ContractorWorkspace; JSX ContractFormModal; handler model.submitContract |
| Appears when | model.showContractDialog |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitContract |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ContractorWorkspace; JSX ContractorPaymentModal; handler model.submitPayment |
| Appears when | model.paymentDialog |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitPayment |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.contractor_76bb2328` | Contractor | پیمانکار | قراردادی |
| `inventory_manager.common.invoice` | Invoice | فاکتور | انوایس |

## Related interface references

- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components alert](modules_shared_erp_components_alert.md)
- [modules shared erp components attachmentpreviewmodal](modules_shared_erp_components_attachmentpreviewmodal.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules contractors components contractformmodal](modules_contractors_components_contractformmodal.md)
- [modules contractors components contractorformmodal](modules_contractors_components_contractorformmodal.md)
- [modules contractors components contractorinvoicedetailmodal](modules_contractors_components_contractorinvoicedetailmodal.md)
- [modules contractors components contractorpaymentmodal](modules_contractors_components_contractorpaymentmodal.md)
- [modules contractors components contractorprofilemodal](modules_contractors_components_contractorprofilemodal.md)
