---
id: "operator_navigation_application_navigation"
title: "Sign in, choose a branch, and navigate"
module: "navigation"
description: "Sign in to a staff portal, select the active branch, locate exact menu paths and understand role, subscription and branch-access checks."
keywords: ["navigation", "sign", "choose", "branch", "navigate", "staff login", "branch selection", "sidebar menu", "role access"]
roles: []
related_docs: ["operator_navigation_page_directory", "operator_modules_audit_audit_activity", "operator_troubleshooting_verification_register"]
frontend_routes: ["/staff-login", "/select-branch"]
source_references: ["frontend/src/component/StaffLogin.jsx", "frontend/src/component/DomainAwareLogin.jsx", "frontend/src/config/staffRoutes.js", "frontend/src/api/authforRBC.jsx", "frontend/src/api/ReauireAuth.jsx", "frontend/src/api/RequireActiveRestaurant.jsx", "frontend/src/component/Admin/adminNavigation.jsx", "frontend/src/component/branch/BranchSelectionPage.jsx", "frontend/src/component/branch/BranchSwitcher.jsx", "backend/backend/users/models.py", "backend/backend/restaurants/branching.py", "backend/backend/restaurants/views.py"]
status: "source_verified"
---

# Sign in, choose a branch, and navigate

## Start a staff session

1. Open **Staff Login** at `/staff-login` on the staff application domain. `/login` is domain-aware and may present customer login instead. Use the staff entry point for restaurant work.
2. Enter the identifier and password shown by the login form; use the eye control to reveal/hide the password if needed, then submit. The frontend authenticates through the staff token endpoint and loads restaurant/branch context.
3. Select an available branch if the branch selection page appears. `/select-branch` requires a staff access token. The branch picker lists branches returned for this staff account. Selecting a branch updates the server’s active branch and the current managed session’s branch.
4. Confirm the active branch before creating an order, receiving stock, recording attendance, or paying an invoice. A restaurant-wide administrator still needs a concrete branch for most writes.
5. Open the role’s home page below. The frontend’s role guard checks the exact `auth.user.role`; an unauthorized URL redirects to staff login.

The active-restaurant wrapper checks `/restaurant/me/`, restaurant activation, and subscription validity. A failed request also redirects to `/subscription-inactive`; that screen alone does not prove a subscription expired. Ask an administrator to check access/connectivity before changing subscription records.

## Staff home pages and menus

| Role value | Home | Visible workspace |
|---|---|---|
| `Admin`, `BranchAdmin` | `/admin/dashboard` | Dashboard; Operations; Restaurant; HR; Contractors; Finance; Administration. Branches is Admin-only. |
| `Manager` | `/manager` | Orders, Reservations, Tables, read-only Menu, Discount Requests, User activity entry. |
| `Waiter` | `/waiter` | Dining table workspace; new order at `/waiter/new-order`. |
| `Cashier` | `/cashier` | Checkout queue; Reservation, + TakeAway, + Delivery, Refresh Orders, Reset Filters. |
| `Call_operator` | `/call-operator` | Staff delivery-order entry. No cashier home or delivery settlement route. |
| `Kitchen_manager` | `/kitchen` | Kitchen queue, Ready Orders, Menu, Stock, Daily Production. |
| `InventoryManager` | `/inventory-manager` | Inventory pages, menu, stations, tables, platters, daily production, expenses. Some visible routes/actions lack matching API permission; see verification register. |
| `FinanceManager` | `/finance-manager` | Expenses, Procurement, Payroll, Contractors, Audit Logs. |
| `OperationsManager` | `/operations-manager` | Shifts, Attendance, Menu, Stations, Tables, Production, Procurement, Inventory, Expenses, Audit Logs. |
| `SuperAdmin` | `/super-admin` | Restaurant/subscription administration and login security configuration. |

`DeliveryBoy`, `Other`, and non-login employment roles have no staff home mapping in `staffRoutes.js`. A delivery employee record is an assignment target, not a documented independent delivery portal.

## Exact administrator menu paths

- **Operations → Orders / Tables / Reservations / Daily Productions / Production Movements / Discount Requests / Discount Cards**.
- **Restaurant → Menu / Stations / Inventory → Dashboard, Ingredients, Stock Levels, Stock Movements, Stock Adjustments, Low Stock Alerts, Reports**.
- **Restaurant → Procurement → Dashboard, Purchase Invoices, Create Purchase Invoice, Suppliers, Supplier Payments, Outstanding Payables**; **Restaurant → Audit Logs**.
- **HR → Staff / Attendance / Shifts / Payroll → Dashboard, Payroll Wizard, Payroll Records, Salary Advances, Payroll Payments**.
- **Contractors → Dashboard / Contractors / Service Contracts / Service Invoices / Create Invoice / Payments / Payables**.
- **Finance → Expenses / Reports**.
- **Administration → User activity / Branches / Feedbacks**. Settings and All Discount Requests are indexed for search but hidden in the sidebar (`hiddenInSidebar`). Use the top-header settings control or searchable navigation item where offered.

These labels come from `adminNavigation.jsx` and English resources. Translated variants for controls are in the component references. The full route directory distinguishes aliases and detail routes from actual menu items: [page directory](page_directory.md).

## Branch and authorization rules

`Staff.has_all_branch_access` and `Staff.can_access_branch`, not the role’s display name alone, determine branch scope. BranchAdmin is assigned exactly one branch. Ordinary branch staff are restricted to assigned active branches. An unavailable branch may disappear from the picker. `get_active_branch` can recover a valid assigned branch; explicit invalid/unauthorized selections can return **Invalid branch.** or **You do not have access to this branch.**

Frontend route access, sidebar visibility, component `canManage`/demo restrictions, and server permissions are separate. A custom role recognized by `users.permissions.HasStaffRole` does not automatically pass `restaurants.permissions.HasStaffRole` or the frontend route guard. Never use a direct URL as a workaround for a hidden or rejected action.

Use **Logout** in the header or floating portal logout control when finishing. Revoked sessions and expired credentials require a new login. See [audit activity](../modules/audit/audit_activity.md) for authorized session administration and [verification register](../troubleshooting/verification_register.md) for route/API discrepancies.
