---
id: "operator_reference_interface_component_customer_homepage"
title: "Home Page — controls and fields"
module: "public_ordering"
description: "Home Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "home", "page", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/:restaurantSlug/:branchSlug", "/:slug"]
source_references: ["frontend/src/component/Customer/HomePage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Home Page — controls and fields

This reference records the controls and fields declared by `HomePage`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/HomePage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | false |
| `setError` | true |
| `setError` | true |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.


## Related interface references

- [component customer header](component_customer_header.md)
- [component customer menupage](component_customer_menupage.md)
- [restaurantnotfoundpage](restaurantnotfoundpage.md)
- [component customer branchselectionpage](component_customer_branchselectionpage.md)
