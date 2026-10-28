---
id: "operator_reference_interface_component_admin_dailyproduction_dailyproduction"
title: "Daily Production — controls and fields"
module: "production"
description: "Daily Production — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["production", "daily", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "OperationsManager"]
related_docs: ["operator_modules_production_daily_production", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/daily_production", "/inventory-manager/daily-production", "/operations-manager/daily_production", "/kitchen/daily-production", "/kitchen/daily_production"]
source_references: ["frontend/src/component/Admin/DailyProduction/DailyProduction.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Daily Production — controls and fields

This reference records the controls and fields declared by `DailyProduction`. Use [daily production](../../modules/production/daily_production.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DailyProduction/DailyProduction.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Daily Production`, `Clear and refund ingredients? Clear production?`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Downloading PDF... Download PDF

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Downloading PDF... Download PDF |
| Location | DailyProduction; JSX button; handler downloadPdf |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading \|\| !hasLoaded \|\| downloadingPdf |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Downloading PDF... Download PDF.  |
| Handler / destination | downloadPdf |
| Local UI result | setDownloadingPdf, setError, setTimeout |

Trace symbols: `downloadPdf`.

Requests made by this handler or local helpers:

- `instance.get("/menu/production/pdf/", { responseType: "blob",`

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Refresh

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Refresh |
| Location | DailyProduction; JSX button; handler refresh |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading \|\| refreshing |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Refresh.  |
| Handler / destination | refresh |
| Local UI result | setRefreshing |

Trace symbols: `refresh`.

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dismiss error

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dismiss error |
| Location | DailyProduction; JSX button; handler () =&gt; setError("") |
| Appears when | error |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dismiss error.  |
| Handler / destination | () =&gt; setError("") |
| Local UI result | setError |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: {option.label} {option.count}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {option.label} {option.count} |
| Location | DailyProduction; JSX button; handler () =&gt; setFilter(option.id) |
| Appears when | hasLoaded |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {option.label} {option.count}.  |
| Handler / destination | () =&gt; setFilter(option.id) |
| Local UI result | setFilter |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Try again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Try again |
| Location | DailyProduction; JSX button; handler () =&gt; fetchItems({ initial: true }) |
| Appears when | !hasLoaded [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try again.  |
| Handler / destination | () =&gt; fetchItems({ initial: true }) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Clear filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear filters |
| Location | DailyProduction; JSX button; handler () =&gt; { setQuery(""); setFilter("all"); } |
| Appears when | visibleItems.length === 0 [true branch] AND items.length === 0 [false branch] AND !hasLoaded [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear filters.  |
| Handler / destination | () =&gt; { setQuery(""); setFilter("all"); } |
| Local UI result | setQuery, setFilter |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | DailyProduction; JSX button; handler () =&gt; setPendingClear(null) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | pendingClear ? busyItems.has(pendingClear.item.id) : false |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setPendingClear(null) |
| Local UI result | setPendingClear |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Clear production

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear production |
| Location | DailyProduction; JSX button; handler clearProduction |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !pendingClear \|\| busyItems.has(pendingClear.item.id) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear production.  |
| Handler / destination | clearProduction |
| Local UI result | setError, setPendingClear, setBusyItems |

Trace symbols: `clearProduction`, `markBusy`.

Requests made by this handler or local helpers:

- `instance.delete( ′/menu/production/${item.production.id}/?refund=${refund}′,`

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search menu items | search; query | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when hasLoaded |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Could not load production. Please try again. |
| `setError` | The daily production PDF could not be downloaded. |
| `setError` | Production could not be updated. Please try again. |
| `setError` | Production could not be cleared. Please try again. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `production.downloading_pdf` | Downloading PDF... | missing; fallback applies | missing; fallback applies |
| `legacy.download_pdf_98e5ef06` | Download PDF | دانلود PDF | PDF ډاونلوډ کړئ |
| `production.refresh` | Refresh | missing; fallback applies | missing; fallback applies |
| `production.dismiss_error` | Dismiss error | missing; fallback applies | missing; fallback applies |
| `production.try_again` | Try again | missing; fallback applies | missing; fallback applies |
| `production.clear_filters` | Clear filters | missing; fallback applies | missing; fallback applies |
| `production.cancel` | Cancel | missing; fallback applies | missing; fallback applies |
| `production.confirm_clear` | Clear production | missing; fallback applies | missing; fallback applies |
| `production.search` | Search menu items | missing; fallback applies | missing; fallback applies |

## Related interface references

- [component admin dailyproduction productioncard](component_admin_dailyproduction_productioncard.md)
