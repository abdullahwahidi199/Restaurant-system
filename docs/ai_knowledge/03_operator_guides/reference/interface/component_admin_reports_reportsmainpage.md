---
id: "operator_reference_interface_component_admin_reports_reportsmainpage"
title: "Reports Main Page — controls and fields"
module: "reports"
description: "Reports Main Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reports", "main", "page", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_reports_report_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/reports"]
source_references: ["frontend/src/component/Admin/Reports/ReportsMainPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Reports Main Page — controls and fields

This reference records the controls and fields declared by `ReportsMainPage`. Use [report controls](../../modules/reports/report_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Reports/ReportsMainPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Reports`, `Date range`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Reports | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {t(`menu_item_sales.${option.key}`, { defaultValue: option.fallback, })}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {t(`menu_item_sales.${option.key}`, { defaultValue: option.fallback, })} |
| Location | ReportsMainPage; JSX button; handler () =&gt; setReportType(option.value) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {t(`menu_item_sales.${option.key}`, { defaultValue: option.fallback, })}.  |
| Handler / destination | () =&gt; setReportType(option.value) |
| Local UI result | setReportType |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: {preset.label}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {preset.label} |
| Location | ReportsMainPage; JSX button; handler () =&gt; selectPreset(preset) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {preset.label}.  |
| Handler / destination | () =&gt; selectPreset(preset) |
| Local UI result | setStartDate, setEndDate, setDateError |

Trace symbols: `selectPreset`.

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Run report

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Run report |
| Location | ReportsMainPage; JSX button; handler generateReport |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Run report.  |
| Handler / destination | generateReport |
| Local UI result | setDateError, setAppliedRange, setGenerationKey |

Trace symbols: `generateReport`.

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: From | date; startDate | Not declared; see submit validation | today | max=endDate \|\| undefined | read-only=false; disabled=false |
| <a id="field-2"></a> F2: To | date; endDate | Not declared; see submit validation | today | min=startDate \|\| undefined | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `reports.run` | Run report | missing; fallback applies | missing; fallback applies |

## Related interface references

- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [component admin reports ordersreport](component_admin_reports_ordersreport.md)
- [component admin reports menuitemsalesreport](component_admin_reports_menuitemsalesreport.md)
