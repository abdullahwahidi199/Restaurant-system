---
id: "operator_reference_interface_component_kitchen_orderitem"
title: "Order Item — controls and fields"
module: "kitchen"
description: "Order Item — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["kitchen", "order", "item", "controls", "fields"]
roles: ["Kitchen_manager"]
related_docs: ["operator_modules_kitchen_preparation", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/kitchen", "/kitchen/ready-orders"]
source_references: ["frontend/src/component/kitchen/OrderItem.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Item — controls and fields

This reference records the controls and fields declared by `OrderItem`. Use [preparation](../../modules/kitchen/preparation.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/kitchen/OrderItem.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Approve

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Approve |
| Location | OrderItem; JSX button; handler () =&gt; updateStatus("approved") |
| Appears when | item.status === "pending" && !readOnly |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Approve.  |
| Handler / destination | () =&gt; updateStatus("approved") |
| Local UI result | setUpdating, setStatusError |

Trace symbols: `updateStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/order-items/${item.id}/status/′, { status,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Re-Pending

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Re-Pending |
| Location | OrderItem; JSX button; handler () =&gt; updateStatus("pending") |
| Appears when | item.status === "approved" && !readOnly |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Re-Pending.  |
| Handler / destination | () =&gt; updateStatus("pending") |
| Local UI result | setUpdating, setStatusError |

Trace symbols: `updateStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/order-items/${item.id}/status/′, { status,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Ready

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Ready |
| Location | OrderItem; JSX button; handler () =&gt; updateStatus("ready") |
| Appears when | item.status === "approved" && !readOnly |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Ready.  |
| Handler / destination | () =&gt; updateStatus("ready") |
| Local UI result | setUpdating, setStatusError |

Trace symbols: `updateStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/order-items/${item.id}/status/′, { status,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.success` | `Item marked as ${status}` |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.approve` | Approve | تایید | منل |
| `legacy.re_pending_4414f78b` | Re-Pending | در انتظار مجدد. | بیا انتظار کې |
| `status.ready` | Ready | آماده | چمتو |
