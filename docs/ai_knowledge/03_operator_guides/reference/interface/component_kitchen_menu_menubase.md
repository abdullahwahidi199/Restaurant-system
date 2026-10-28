---
id: "operator_reference_interface_component_kitchen_menu_menubase"
title: "Menu Base — controls and fields"
module: "menu"
description: "Menu Base — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "base", "controls", "fields"]
roles: ["Kitchen_manager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/kitchen/menu"]
source_references: ["frontend/src/component/kitchen/Menu/MenuBase.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Menu Base — controls and fields

This reference records the controls and fields declared by `MenuBase`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/kitchen/Menu/MenuBase.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.
