---
id: "operator_reference_interface_component_waiter_homepage"
title: "Home Page — controls and fields"
module: "orders"
description: "Home Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "home", "page", "controls", "fields"]
roles: ["Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/waiter"]
source_references: ["frontend/src/component/waiter/HomePage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Home Page — controls and fields

This reference records the controls and fields declared by `HomePage`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/HomePage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | err.message |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.


## Related interface references

- [component waiter tablesdisplaymodal](component_waiter_tablesdisplaymodal.md)
