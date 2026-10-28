---
id: "operator_reference_interface_component_admin_staff_staffmanagement"
title: "Staff Management — controls and fields"
module: "employees"
description: "Staff Management — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["employees", "staff", "management", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_employees_staff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/staff"]
source_references: ["frontend/src/component/Admin/staff/StaffManagement.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Staff Management — controls and fields

This reference records the controls and fields declared by `StaffManagement`. Use [staff](../../modules/employees/staff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/staff/StaffManagement.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Staff Management`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Staff Management | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Add Staff

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Staff |
| Location | StaffManagement; JSX ActionButton; handler openAdd |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Staff.  |
| Handler / destination | openAdd |
| Local UI result | setEditingStaff, setFormOpen |

Trace symbols: `openAdd`.

Record/status result, downstream effects, failure recovery, and reversal: [staff](../../modules/employees/staff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search by name or role... | SearchBox; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.add` | Add Staff | افزودن کارمند | کارکوونکی اضافه کول |
| `staff.search` | Search by name or role... | جستجو بر اساس نام یا وظیفه... | د نوم یا دندې له مخې لټون... |

## Related interface references

- [component admin staff stafftable](component_admin_staff_stafftable.md)
- [component admin staff staffformmodal](component_admin_staff_staffformmodal.md)
- [component admin confirmdeletemodal](component_admin_confirmdeletemodal.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components searchbox](modules_shared_erp_components_searchbox.md)
