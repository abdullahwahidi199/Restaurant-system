---
id: "operator_reference_backend_users_access"
title: "Users — backend access reference"
module: "employees"
description: "Static users implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["users", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_employees_staff", "operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/users/models.py", "backend/backend/users/payroll_services.py", "backend/backend/users/permissions.py", "backend/backend/users/serializers.py", "backend/backend/users/session_views.py", "backend/backend/users/signals.py", "backend/backend/users/views.py"]
status: "source_verified"
---

# Users — backend access reference

Static implementation reference for `users`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/users/permissions.py`

### HasStaffRole

`None`

### IsRestaurantAdmin

`["Admin", "BranchAdmin"]`

### IsCashier

`["Cashier"]`

### IsWaiter

`["Waiter"]`

### IsKitchenManager

`["Kitchen_manager"]`

### IsDeliveryBoy

`["DeliveryBoy"]`

## `backend/backend/users/session_views.py`

### heartbeat

`api_view(["POST"])`; `permission_classes([IsAuthenticated])`

### activity_overview

`api_view(["GET"])`; `permission_classes([IsAuthenticated, CanMonitorUserActivity])`

### activity_sessions

`api_view(["GET"])`; `permission_classes([IsAuthenticated, CanMonitorUserActivity])`

### activity_history

`api_view(["GET"])`; `permission_classes([IsAuthenticated, CanMonitorUserActivity])`

### revoke_session

`api_view(["POST"])`; `permission_classes([IsAuthenticated, CanRevokeUserSessions])`

### revoke_user_sessions

`api_view(["POST"])`; `permission_classes([IsAuthenticated, CanRevokeUserSessions])`

### logout_session

`api_view(["POST"])`; `permission_classes([IsAuthenticated])`

### activity_socket_ticket

`api_view(["GET"])`; `permission_classes([IsAuthenticated, CanMonitorUserActivity])`

## `backend/backend/users/views.py`

### staffDetailsView

`[IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin\|IsFinanceManager]`

### ShiftDetailsView

`[IsAuthenticated, IsSameRestaurant, IsRestaurantAdmin\|IsOperationsManager]`

### PayrollDetailsView

`[IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin \|IsFinanceManager]`

### SalaryAdvanceDetailsView

`[IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager]`

### staffApi

`api_view(['GET','POST'])`; `permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin\|IsFinanceManager\|IsOperationsManager])`

### shiftApi

`api_view(['GET','POST'])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin\|IsOperationsManager])`

### mark_attendance_view

`api_view(['POST'])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin \| IsOperationsManager])`

### payrollView

`api_view(['GET','POST'])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin \|IsFinanceManager])`

### payroll_dashboard_view

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager])`

### payroll_generate_view

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager])`

### payroll_approve_view

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin ])`

### payroll_payment_list_create

`api_view(["GET", "POST"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager])`

### salary_advance_list_create

`api_view(["GET", "POST"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager])`

### staff_payroll_history_view

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsFinanceManager])`

### DeliveryBoyListView

`api_view(['GET','POST'])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin\|IsCashier ])`

### login_rate_limit_config_view

`api_view(["GET", "PATCH", "PUT"])`; `permission_classes([IsSuperAdmin])`

### recent_month_attendance

`api_view(['GET'])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsOperationsManager])`

## Related operating procedures

- [Create staff accounts, edit employee records, and assign roles](../../modules/employees/staff.md)
- [Create shifts and record daily attendance or leave status](../../modules/employees/attendance_shifts.md)
- [Salary profiles, payroll runs, advances, approval, and payment](../../modules/payroll/payroll.md)
- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
