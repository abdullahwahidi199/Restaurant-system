---
id: "operator_reference_interface_modules_contractors_components_contractorprofilemodal"
title: "Contractor Profile Modal — controls and fields"
module: "contractors"
description: "Contractor Profile Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["contractors", "contractor", "profile", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_contractors_services", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables"]
source_references: ["frontend/src/modules/contractors/components/ContractorProfileModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Contractor Profile Modal — controls and fields

This reference records the controls and fields declared by `ContractorProfileModal`. Use [services](../../modules/contractors/services.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/contractors/components/ContractorProfileModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Contracts`, `Open Invoices`, `Ledger Timeline`, `Audit History`

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
| Location | ContractorProfileModal; JSX button; handler () =&gt; onPayment(invoice) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; onPayment(invoice) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.


## Related interface references

- [modules shared erp components modal](modules_shared_erp_components_modal.md)
