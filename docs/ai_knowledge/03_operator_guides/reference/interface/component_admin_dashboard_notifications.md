---
id: "operator_reference_interface_component_admin_dashboard_notifications"
title: "Notifications — controls and fields"
module: "dashboard"
description: "Notifications — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["dashboard", "notifications", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_dashboard_dashboard", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard"]
source_references: ["frontend/src/component/Admin/dashboard/Notifications.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Notifications — controls and fields

This reference records the controls and fields declared by `Notifications`. Use [dashboard](../../modules/dashboard/dashboard.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/dashboard/Notifications.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Notifications`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Mark read

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Mark read |
| Location | Notifications; JSX button; handler () =&gt; markReadNotification(note.id) |
| Appears when | notifications.length [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Mark read.  |
| Handler / destination | () =&gt; markReadNotification(note.id) |
| Local UI result | setNotifications |

Trace symbols: `markReadNotification`.

Requests made by this handler or local helpers:

- `instance.post(′/reports/notifications/${id}/read/′)`

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `notifications.markRead` | Mark read | خوانده شد | لوستل شو |
