---
id: "operator_reference_interface_component_admin_attendance"
title: "attendance — controls and fields"
module: "employees"
description: "attendance — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["employees", "attendance", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_modules_employees_attendance_shifts", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/attendance", "/operations-manager/attendance"]
source_references: ["frontend/src/component/Admin/attendance.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# attendance — controls and fields

This reference records the controls and fields declared by `attendance`. Use [attendance shifts](../../modules/employees/attendance_shifts.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/attendance.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Mark Shift Attendance`, `Assigned Staff`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | attendance; JSX button; handler () =&gt; setSelectedShiftId(shift.id) |
| Appears when | shifts.length [true branch] AND shiftsLoading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setSelectedShiftId(shift.id) |
| Local UI result | setSelectedShiftId |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: {option.label}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {option.label} |
| Location | attendance; JSX button; handler () =&gt; handleStatusChange(member.id, option.value) |
| Appears when | staff.length [true branch] AND loadError [false branch] AND staffLoading [false branch] AND selectedShiftId |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {option.label}.  |
| Handler / destination | () =&gt; handleStatusChange(member.id, option.value) |
| Local UI result | setAttendance, setMessage |

Trace symbols: `handleStatusChange`.

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | attendance; JSX button; handler handleSave |
| Appears when | selectedShiftId |
| Disabled when | saving \|\| staffLoading \|\| !staff.length |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSave |
| Local UI result | setShowRestriction, setSaving, setMessage |

Trace symbols: `handleSave`.

Requests made by this handler or local helpers:

- `instance.post( ′/users/attendance/mark/${selectedShiftId}/′, payload,`

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setMessage` | ✅ Attendance saved successfully! / ❌ Failed to save attendance. |
| `setMessage` | ❌ Failed to save attendance. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `attendance.save` | Save Attendance | ذخیره حاضری | حاضري ثبت کړه |
