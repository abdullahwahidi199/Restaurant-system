---
id: "operator_reference_interface_component_admin_order_orderperiodbar"
title: "Order Period Bar — controls and fields"
module: "orders"
description: "Order Period Bar — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "order", "period", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_orders_order_lists", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/orders", "/manager"]
source_references: ["frontend/src/component/Admin/order/OrderPeriodBar.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Period Bar — controls and fields

This reference records the controls and fields declared by `OrderPeriodBar`. Use [order lists](../../modules/orders/order_lists.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/order/OrderPeriodBar.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {t(`orders.period.presets.${preset}`)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {t(`orders.period.presets.${preset}`)} |
| Location | OrderPeriodBar; JSX button; handler () =&gt; applyPreset(preset) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {t(`orders.period.presets.${preset}`)}.  |
| Handler / destination | () =&gt; applyPreset(preset) |
| Local UI result | setShowCustom, setError |

Trace symbols: `applyPreset`.

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Custom

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Custom |
| Location | OrderPeriodBar; JSX button; handler () =&gt; { setShowCustom((value) =&gt; !value); setError(""); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Custom.  |
| Handler / destination | () =&gt; { setShowCustom((value) =&gt; !value); setError(""); } |
| Local UI result | setShowCustom, setError |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | OrderPeriodBar; JSX form; handler applyCustom |
| Appears when | showCustom |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | applyCustom |
| Local UI result | setError |

Trace symbols: `applyCustom`.

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Apply period

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Apply period |
| Location | OrderPeriodBar; JSX button; handler applyCustom |
| Appears when | showCustom |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Apply period.  |
| Handler / destination | applyCustom |
| Local UI result | setError |

Trace symbols: `applyCustom`.

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: {t(label)} | date; draft[field] | true | draft[field] | max=getOrderToday() | read-only=false; disabled=false; shown when showCustom |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | t(`orders.period.errors.${validation}`) |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `orders.period.presets.custom` | Custom | دلخواه | ځانګړې موده |
| `orders.period.apply` | Apply period | اعمال بازه | موده پلي کړئ |
