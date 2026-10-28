---
id: "operator_reference_interface_api_reauireauth"
title: "RequireAuth — shared authentication and logout wrapper"
module: "navigation"
description: "RequireAuth shared mounting and UI reference. App.jsx wraps the staff routes with this component. It redirects unauthenticated or disallowed-role sessions and conditionally renders PortalLogoutButton; it is shared authorization UI, not a standalone page."
keywords: ["navigation", "authentication", "role guard", "shared logout", "RequireAuth"]
roles: ["SuperAdmin", "Admin", "BranchAdmin", "Manager", "Cashier", "InventoryManager", "FinanceManager", "OperationsManager", "Call_operator", "Waiter", "Kitchen_manager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index", "operator_navigation_application_navigation"]
frontend_routes: ["/select-branch", "/super-admin", "/admin/dashboard", "/manager", "/manager/new-order", "/inventory-manager", "/finance-manager", "/operations-manager", "/waiter", "/waiter/new-order", "/kitchen", "/cashier", "/cashier/takeaway", "/cashier/delivery", "/cashier/reservations", "/call-operator"]
source_references: ["frontend/src/api/ReauireAuth.jsx", "frontend/src/i18n.js", "frontend/src/App.jsx"]
status: "needs_verification"
availability: "shared"
---

# RequireAuth — shared authentication and logout wrapper

This reference records the controls and fields declared by `RequireAuth`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/api/ReauireAuth.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Shared mounting and verification boundary

App.jsx wraps the staff routes with this component. It redirects unauthenticated or disallowed-role sessions and conditionally renders PortalLogoutButton; it is shared authorization UI, not a standalone page. Static mounting is established; the existing `needs_verification` status is retained because no running UI was tested. Parent paths in metadata are context, not additional pages or permission grants.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Conditional PortalLogoutButton child

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Child logout button; English label **Logout** from auth.logout. The wrapper has no separate button. |
| Location | RequireAuth; conditional child PortalLogoutButton |
| Appears when | !rolesWithHeaderLogout.has(role) |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement; see shared mounting conditions above. |
| Operator steps | Use the child Logout control when offered; do not submit a form on this wrapper. |
| Handler / destination | Renders PortalLogoutButton; its handleLogout callback clears the session and navigates to staff login. |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.


## Related interface references

- [component shared portallogoutbutton](component_shared_portallogoutbutton.md)
