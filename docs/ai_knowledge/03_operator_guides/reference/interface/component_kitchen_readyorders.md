---
id: "operator_reference_interface_component_kitchen_readyorders"
title: "Ready Orders — controls and fields"
module: "kitchen"
description: "Ready Orders — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["kitchen", "ready", "orders", "controls", "fields"]
roles: ["Kitchen_manager"]
related_docs: ["operator_modules_kitchen_preparation", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/kitchen/ready-orders"]
source_references: ["frontend/src/component/kitchen/ReadyOrders.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Ready Orders — controls and fields

This reference records the controls and fields declared by `ReadyOrders`. Use [preparation](../../modules/kitchen/preparation.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/kitchen/ReadyOrders.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ReadyOrders; JSX CompactOrderCard; handler () =&gt; setSelectedOrder(order) |
| Appears when | !loading && !error |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setSelectedOrder(order) |
| Local UI result | setSelectedOrder |

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | error.response?.data?.detail \|\| error.message \|\| "Failed to load ready orders." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.


## Related interface references

- [component kitchen compactordercard](component_kitchen_compactordercard.md)
- [component kitchen orderdetailsidebar](component_kitchen_orderdetailsidebar.md)
