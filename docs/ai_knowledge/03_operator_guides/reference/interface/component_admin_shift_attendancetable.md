---
id: "operator_reference_interface_component_admin_shift_attendancetable"
title: "Attendance Table — controls and fields"
module: "employees"
description: "Attendance Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["employees", "attendance", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_modules_employees_attendance_shifts", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/shifts", "/operations-manager", "/operations-manager/shifts"]
source_references: ["frontend/src/component/Admin/shift/AttendanceTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Attendance Table — controls and fields

This reference records the controls and fields declared by `AttendanceTable`. Use [attendance shifts](../../modules/employees/attendance_shifts.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/shift/AttendanceTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Monthly Attendance`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Staff Name | `See parent row data and linked procedure.` |
| th | {dateValue.toLocaleDateString(locale, { weekday: "narrow" })} {new Intl.NumberFormat(locale).format(dateValue.getDate())} | `See parent row data and linked procedure.` |
| th | % | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

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
| Location | AttendanceTable; JSX button; handler () =&gt; setFilterName("") |
| Appears when | filterName |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setFilterName("") |
| Local UI result | setFilterName |

Record/status result, downstream effects, failure recovery, and reversal: [attendance shifts](../../modules/employees/attendance_shifts.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Filter by staff name... | search; filterName | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Filter by shift... | select; filterShift | Not declared; see submit validation | "" | ; choices: Filter by shift... [] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | ❌ Failed to save attendance. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `filter_name` | Filter by staff name... | فیلتر بر اساس نام کارمند... | د کارکوونکي نوم فلټر... |
| `filter_shift` | Filter by shift... | فیلتر بر اساس شیفت... | د شفټ له مخې فلټر... |
