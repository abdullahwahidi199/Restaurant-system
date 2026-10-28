---
id: "operator_reference_interface_component_ui_restauranttablecard"
title: "Restaurant Table Card — controls and fields"
module: "tables"
description: "Restaurant Table Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "restaurant", "table", "card", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Manager", "OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index", "operator_modules_orders_waiter_tables"]
frontend_routes: ["/admin/dashboard/tables", "/manager/tables", "/inventory-manager/tables", "/operations-manager/tables"]
source_references: ["frontend/src/component/ui/RestaurantTableCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Restaurant Table Card — controls and fields

This reference records the controls and fields declared by `RestaurantTableCard`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/ui/RestaurantTableCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections



## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: `${actionLabel}: ${title}`

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | `${actionLabel}: ${title}` |
| Location | RestaurantTableCard; JSX button; handler onClick |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate `${actionLabel}: ${title}`.  |
| Handler / destination | onClick |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

Table operation context: [operate tables and correct orders](../../modules/orders/waiter_tables.md). The shared card/toolbar delegates actions to its parent and does not independently grant a table mutation.
