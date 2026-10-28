---
id: "operator_modules_audit_audit_activity"
title: "Audit changes, inspect production movements, and manage staff sessions"
module: "audit"
description: "Inspect audit logs and production changes, monitor staff sessions, and revoke eligible sessions; explains branch scope and explicit monitoring/revocation permissions."
keywords: ["audit", "changes", "inspect", "production", "movements", "manage", "staff", "sessions", "audit trail", "session revocation", "user activity", "production movements"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager", "Explicit activity permissions"]
related_docs: ["operator_reference_backend_users_access", "operator_reference_backend_audit_access", "operator_troubleshooting_errors_and_recovery", "operator_reference_interface_modules_audit_auditlogpage", "operator_reference_interface_modules_audit_components_auditlogfilters", "operator_reference_interface_modules_audit_productionmovementpage", "operator_reference_interface_modules_activity_activitydashboard", "operator_reference_backend_audit_fields", "operator_reference_backend_audit_validation"]
frontend_routes: ["/admin/dashboard/audit-logs", "/finance-manager/audit-logs", "/operations-manager/audit-logs", "/admin/dashboard/daily-production-movements", "/admin/dashboard/activity", "/manager/activity"]
source_references: ["frontend/src/modules/audit/AuditLogPage.jsx", "frontend/src/modules/audit/components/AuditLogFilters.jsx", "frontend/src/modules/audit/components/AuditLogDetailsModal.jsx", "frontend/src/modules/audit/ProductionMovementPage.jsx", "frontend/src/modules/activity/ActivityDashboard.jsx", "backend/backend/audit/views.py", "backend/backend/users/permissions.py:CanMonitorUserActivity", "backend/backend/users/permissions.py:CanRevokeUserSessions", "backend/backend/users/session_views.py", "backend/backend/users/test_activity.py"]
status: "source_verified"
---

# Audit changes, inspect production movements, and manage staff sessions

## Audit Logs

Admin/BranchAdmin **Restaurant → Audit Logs** `/admin/dashboard/audit-logs`; FinanceManager `/finance-manager/audit-logs`; OperationsManager `/operations-manager/audit-logs`. API also permits InventoryManager but its portal has no corresponding route. SuperAdmin API requires restaurant scope; there is no mounted platform audit page in the route tree.

Filters include search, module, action, user, branch, object type/ID, date bounds and newest/oldest controls as rendered by AuditLogFilters. Query page size defaults20. Select row details to open before/after changes, metadata and timeline. Previous/Next load pages; closing detail does not alter the audit record. No create/edit/delete audit controls exist.

Read logs as evidence of the recorded action, not proof of physical cooking, bank transfer or successful printing. Audit services can be best effort and not every legacy action emits identical evidence. Do not use missing audit row as the only test that a transaction failed.

## Production Movements

Admin/BranchAdmin **Operations → Production Movements** `/admin/dashboard/daily-production-movements`; OperationsManager equivalent. API explicitly restricts to those roles (plus superuser), unlike production-operation permissions. Finance/Inventory audit viewers have ProductionMovement object types excluded. Search item/user/order, movement type and date bounds; **Refresh** reloads. Displayed changes include before/after produced/remaining, actor, order link/identifier, movement type and refund flag. It is read-only; corrections occur through production page, creating another movement.

## User activity

Admin/BranchAdmin **Administration → User activity**, `/admin/dashboard/activity`; Manager `/manager/activity` is mounted and has navigation, but backend monitoring requires Admin/BranchAdmin or explicit Django `users.monitor_user_activity`. Ordinary Manager therefore sees a permission error. A permission flag cannot remove frontend portal-role guards elsewhere.

**Live** / history view controls show staff sessions, role/branch, presence and connection information. **Refresh**, search name/username, role/status/branch dropdowns and Previous/Next request filtered server data. Admin defaults branch all; BranchAdmin is confined to assigned branch even if request says all. Idle/offline presence is distinct from session validity; a valid session can be idle and one employee can have multiple devices. This is session monitoring, not employee attendance.

**Revoke** on a valid row and **Revoke all** for account require Admin, superuser or explicit `users.revoke_user_sessions` (UI checks server-provided flag plus Admin; row also checks can_revoke). BranchAdmin does not automatically get revoke authority. Select action, verify user/session, accept ConfirmModal; server marks sessions revoked, blacklists refresh tokens and invalidates access through managed-session authentication. UI shows **Session revoked successfully.** or **All account sessions were revoked.** That employee must sign in again; no “unrevoke” operation exists. Revoking all can include the current session if it matches.

Server revocation scope is restaurant/branch-aware. Do not describe a branch viewer’s Revoke all as an unrestricted global account logout. Errors display backend detail or **The session could not be revoked.** A disconnected presence socket is not grounds to delete staff; page can refresh over HTTP. Realtime/presence uses Redis/cache fallbacks and requires deployment acceptance.

See [users access](../../reference/backend/users_access.md), [audit access](../../reference/backend/audit_access.md), and [errors and recovery](../../troubleshooting/errors_and_recovery.md).

## Detailed controls, fields, and server rules

- [Audit Log Page — controls and fields](../../reference/interface/modules_audit_auditlogpage.md)
- [Audit Log Filters — controls and fields](../../reference/interface/modules_audit_components_auditlogfilters.md)
- [Production Movement Page — controls and fields](../../reference/interface/modules_audit_productionmovementpage.md)
- [Activity Dashboard — controls and fields](../../reference/interface/modules_activity_activitydashboard.md)
- [Audit — backend fields reference](../../reference/backend/audit_fields.md)
- [Audit — backend validation reference](../../reference/backend/audit_validation.md)
- [Audit — backend access reference](../../reference/backend/audit_access.md)
