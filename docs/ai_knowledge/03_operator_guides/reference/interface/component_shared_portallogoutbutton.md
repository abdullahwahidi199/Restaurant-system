---
id: "operator_reference_interface_component_shared_portallogoutbutton"
title: "Portal Logout Button — controls and fields"
module: "navigation"
description: "PortalLogoutButton shared mounting and UI reference. RequireAuth renders this logout control for roles outside its header-logout set (Admin, BranchAdmin, FinanceManager and OperationsManager). It is conditionally mounted shared staff UI; actual display depends on authentication and parent role."
keywords: ["interface_reference", "portal", "logout", "button", "controls", "fields"]
roles: ["SuperAdmin", "Manager", "Cashier", "InventoryManager", "Call_operator", "Waiter", "Kitchen_manager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/select-branch", "/super-admin", "/manager", "/manager/new-order", "/inventory-manager", "/waiter", "/waiter/new-order", "/kitchen", "/cashier", "/cashier/takeaway", "/cashier/delivery", "/cashier/reservations", "/call-operator"]
source_references: ["frontend/src/component/shared/PortalLogoutButton.jsx", "frontend/src/i18n.js", "frontend/src/App.jsx", "frontend/src/api/ReauireAuth.jsx"]
status: "needs_verification"
availability: "shared"
---

# Portal Logout Button — controls and fields

This reference records the controls and fields declared by `PortalLogoutButton`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/shared/PortalLogoutButton.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Shared mounting and verification boundary

RequireAuth renders this logout control for roles outside its header-logout set (Admin, BranchAdmin, FinanceManager and OperationsManager). It is conditionally mounted shared staff UI; actual display depends on authentication and parent role. Static mounting is established; the existing `needs_verification` status is retained because no running UI was tested. Parent paths in metadata are context, not additional pages or permission grants.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Logout (translated label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Logout (auth.logout, with English fallback Logout); visible text is hidden on small screens, while title/aria-label remain. |
| Location | PortalLogoutButton; JSX button; handler handleLogout |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement; see shared mounting conditions above. |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {label}.  |
| Handler / destination | handleLogout |
| Local UI result | Navigation: getStaffLoginPath(), { replace: true }) |

Trace symbols: `handleLogout`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.
