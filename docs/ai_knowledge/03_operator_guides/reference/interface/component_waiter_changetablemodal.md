---
id: "operator_reference_interface_component_waiter_changetablemodal"
title: "Change Table Modal — controls and fields"
module: "orders"
description: "Change Table Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "change", "table", "modal", "controls", "fields"]
roles: ["Manager", "Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/manager/tables", "/waiter"]
source_references: ["frontend/src/component/waiter/ChangeTableModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Change Table Modal — controls and fields

This reference records the controls and fields declared by `ChangeTableModal`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/ChangeTableModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Change Table`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | ChangeTableModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Changing... Confirm Change

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Changing... Confirm Change |
| Location | ChangeTableModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !selectedTable \|\| loading |
| Permission | Parent route role plus endpoint enforcement. Manager, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Changing... Confirm Change. Review the confirmation before accepting. |
| Handler / destination | handleSubmit |
| Local UI result | setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/change-table/′, { table: selectedTable,`

Dialog content: `err?.response?.data?.error \|\| "Failed to change table")`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: selectedTable | select; selectedTable | Not declared; see submit validation | "" | ; choices: Select New Table [] | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | err?.response?.data?.error \|\| "Failed to change table" |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.changing_99922775` | Changing... | در حال تغییر... | بدلول... |
| `legacy.confirm_change_ad676c64` | Confirm Change | تأیید تغییر | بدلون تایید کړه |
| `legacy.select_new_table_82a7413c` | Select New Table | انتخاب جدول جدید | نوی جدول انتخاب کړئ |
| `legacy.table_0424f6e7` | Table | جدول | جدول |
