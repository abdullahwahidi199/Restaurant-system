---
id: "operator_reference_interface_component_ordercancellationtoast"
title: "Order Cancellation Toast — controls and fields"
module: "interface_reference"
description: "Order Cancellation Toast — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "order", "cancellation", "toast", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Cashier", "Manager", "Public/customer", "Waiter"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/orders", "/admin/dashboard/orders", "/manager", "/manager/tables", "/waiter", "/cashier"]
source_references: ["frontend/src/component/OrderCancellationToast.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Cancellation Toast — controls and fields

This reference records the controls and fields declared by `OrderCancellationToast`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/OrderCancellationToast.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: No

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | No |
| Location | OrderCancellationToast; JSX button; handler handleCancel |
| Appears when | show |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Cashier, Manager, Public/customer, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate No.  |
| Handler / destination | handleCancel |
| Local UI result | setShow |

Trace symbols: `handleCancel`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Yes, Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Yes, Cancel |
| Location | OrderCancellationToast; JSX button; handler handleConfirm |
| Appears when | show |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Cashier, Manager, Public/customer, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Yes, Cancel.  |
| Handler / destination | handleConfirm |
| Local UI result | setShow |

Trace symbols: `handleConfirm`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `info.no` | No | خیر | نه |
| `legacy.yes_cancel_610bfbb6` | Yes, Cancel | بله، لغو کن | هو، لغوه کړه |
