---
id: "operator_reference_interface_modules_shared_erp_components_confirmmodal"
title: "Confirm Modal — controls and fields"
module: "interface_reference"
description: "Confirm Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "confirm", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "InventoryManager", "Manager", "OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/expenses", "/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/admin/dashboard/activity", "/manager/activity", "/inventory-manager/expenses", "/finance-manager", "/finance-manager/expenses", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id", "/operations-manager/expenses"]
source_references: ["frontend/src/modules/shared/erp/components/ConfirmModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Confirm Modal — controls and fields

This reference records the controls and fields declared by `ConfirmModal`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/shared/erp/components/ConfirmModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ConfirmModal; JSX ActionButton; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Working...

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Working... |
| Location | ConfirmModal; JSX ActionButton; handler onConfirm |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Working....  |
| Handler / destination | onConfirm |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.working_049ac820` | Working... | کار کردن... | کار کول... |

## Related interface references

- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components modal](modules_shared_erp_components_modal.md)
