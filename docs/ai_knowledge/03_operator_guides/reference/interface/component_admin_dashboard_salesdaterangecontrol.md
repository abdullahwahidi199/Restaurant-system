---
id: "operator_reference_interface_component_admin_dashboard_salesdaterangecontrol"
title: "Sales Date Range Control — controls and fields"
module: "dashboard"
description: "Sales Date Range Control — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["dashboard", "sales", "date", "range", "control", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_dashboard_dashboard", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard"]
source_references: ["frontend/src/component/Admin/dashboard/SalesDateRangeControl.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Sales Date Range Control — controls and fields

This reference records the controls and fields declared by `SalesDateRangeControl`. Use [dashboard](../../modules/dashboard/dashboard.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/dashboard/SalesDateRangeControl.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{t(′${key}.customize′)}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {t(`${key}.presets.${range.preset}`)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {t(`${key}.presets.${range.preset}`)} |
| Location | SalesDateRangeControl; JSX button; handler () =&gt; { setDraft(range); setError(""); setOpen((value) =&gt; !value); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {t(`${key}.presets.${range.preset}`)}.  |
| Handler / destination | () =&gt; { setDraft(range); setError(""); setOpen((value) =&gt; !value); } |
| Local UI result | setDraft, setError, setOpen |

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: t(`${key}.close`)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | t(`${key}.close`) |
| Location | SalesDateRangeControl; JSX button; handler () =&gt; { setOpen(false); triggerRef.current?.focus(); } |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate t(`${key}.close`).  |
| Handler / destination | () =&gt; { setOpen(false); triggerRef.current?.focus(); } |
| Local UI result | setOpen |

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: {t(`${key}.presets.${preset}`)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {t(`${key}.presets.${preset}`)} |
| Location | SalesDateRangeControl; JSX button; handler () =&gt; apply({ ...getSalesPresetRange(preset), interval: draft.interval, }) |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {t(`${key}.presets.${preset}`)}.  |
| Handler / destination | () =&gt; apply({ ...getSalesPresetRange(preset), interval: draft.interval, }) |
| Local UI result | setError, setOpen |

Trace symbols: `apply`.

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | SalesDateRangeControl; JSX form; handler (event) =&gt; { event.preventDefault(); apply({ ...draft, preset: draft.start === range.start && draft.end === range.end ? range.preset : "custom", }); } |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (event) =&gt; { event.preventDefault(); apply({ ...draft, preset: draft.start === range.start && draft.end === range.end ? range.preset : "custom", }); } |
| Local UI result | setError, setOpen |

Trace symbols: `apply`.

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: {t(`${key}.apply`)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {t(`${key}.apply`)} |
| Location | SalesDateRangeControl; JSX button; handler (event) =&gt; { event.preventDefault(); apply({ ...draft, preset: draft.start === range.start && draft.end === range.end ? range.preset : "custom", }); } |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {t(`${key}.apply`)}.  |
| Handler / destination | (event) =&gt; { event.preventDefault(); apply({ ...draft, preset: draft.start === range.start && draft.end === range.end ? range.preset : "custom", }); } |
| Local UI result | setError, setOpen |

Trace symbols: `apply`.

Record/status result, downstream effects, failure recovery, and reversal: [dashboard](../../modules/dashboard/dashboard.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: {t(`${key}.${field}_date`)} | date; draft[field] | true | draft[field] | max=getSalesToday() | read-only=false; disabled=false; shown when open |
| <a id="field-2"></a> F2: {t(`${key}.group_by`)} | select; draft.interval | Not declared; see submit validation | draft.interval | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when open |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | t(`${key}.errors.${validation}`) |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.
