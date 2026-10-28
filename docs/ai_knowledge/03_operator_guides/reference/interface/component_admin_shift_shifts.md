---
id: "operator_reference_interface_component_admin_shift_shifts"
title: "shifts — controls and fields"
module: "employees"
description: "shifts — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["employees", "shifts", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_modules_employees_attendance_shifts", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/shifts", "/operations-manager", "/operations-manager/shifts"]
source_references: ["frontend/src/component/Admin/shift/shifts.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# shifts — controls and fields

This reference records the controls and fields declared by `shifts`. Use [attendance shifts](../../modules/employees/attendance_shifts.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/shift/shifts.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Staff Shifts`, `Staff Shifts`, `Delete this shift?`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Add Shift

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Shift |
| Location | shifts; JSX button; handler () =&gt; setShowAddModal(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Shift.  |
| Handler / destination | () =&gt; setShowAddModal(true) |
| Local UI result | setShowAddModal |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Retry

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Retry |
| Location | shifts; JSX button; handler getShifts |
| Appears when | error |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Retry.  |
| Handler / destination | getShifts |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | shifts; JSX button; handler () =&gt; setShiftToDelete(null) |
| Appears when | shiftToDelete |
| Disabled when | Boolean(deletingShiftId) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setShiftToDelete(null) |
| Local UI result | setShiftToDelete |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | shifts; JSX button; handler () =&gt; setShiftToDelete(null) |
| Appears when | shiftToDelete |
| Disabled when | Boolean(deletingShiftId) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setShiftToDelete(null) |
| Local UI result | setShiftToDelete |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | shifts; JSX button; handler handleConfirmDelete |
| Appears when | shiftToDelete |
| Disabled when | Boolean(deletingShiftId) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleConfirmDelete |
| Local UI result | setDeletingShiftId, setShifts, setShiftToDelete, setError |

Trace symbols: `handleConfirmDelete`.

Requests made by this handler or local helpers:

- `instance.delete(′/users/shift/${shiftToDelete.id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | ❌ Failed to save attendance. |
| `setError` | ❌ Failed to save attendance. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `add_shift` | Add Shift | افزودن شیفت | نوی شفټ |
| `menu_item_sales.retry` | Retry | تلاش دوباره | بیا هڅه |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `staff.table.delete` | Delete | حذف | ړنګول |

## Related interface references

- [component admin shift attendancetable](component_admin_shift_attendancetable.md)
- [component admin shift addshiftmodal](component_admin_shift_addshiftmodal.md)
- [component admin shift shiftlist](component_admin_shift_shiftlist.md)
