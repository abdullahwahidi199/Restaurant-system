---
id: "operator_reference_backend_users_validation"
title: "Users — backend validation reference"
module: "employees"
description: "Static users implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["users", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_employees_staff", "operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/users/models.py", "backend/backend/users/payroll_services.py", "backend/backend/users/permissions.py", "backend/backend/users/serializers.py", "backend/backend/users/session_views.py", "backend/backend/users/signals.py", "backend/backend/users/views.py"]
status: "source_verified"
---

# Users — backend validation reference

Static implementation reference for `users`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/users/models.py`

### Attendance.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch)` | `ValueError("Attendance staff cannot access this branch.")` |
| `self.branch_id and self.shift_id and self.shift.branch_id != self.branch_id` | `ValueError("Attendance shift belongs to another branch.")` |

### Payroll.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch)` | `ValueError("Payroll staff cannot access this branch.")` |

### SalaryAdvance.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch)` | `ValueError("Salary advance staff cannot access this branch.")` |

### PayrollPayment.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch)` | `ValueError("Payroll payment staff cannot access this branch.")` |

## `backend/backend/users/payroll_services.py`

### generate_payroll

| Trigger / condition | Server result or message |
|---|---|
| `not branch` | `ValueError("An active branch is required to generate payroll.")` |
| `not period_start or not period_end` | `ValueError("Period start and end are required.")` |
| `period_start &gt; period_end` | `ValueError("Period end must be after period start.")` |
| `period_type not in [Payroll.PERIOD_MONTHLY, Payroll.PERIOD_WEEKLY]` | `ValueError("Payroll period type must be monthly or weekly.")` |
| `not staff_qs.exists()` | `ValueError("No active payroll employees found for this branch.")` |

### create_payroll_payment

| Trigger / condition | Server result or message |
|---|---|
| `not payroll_id` | `ValueError("Payroll is required.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Payroll record not found.")` |
| `branch and payroll.branch_id != branch.id` | `ValueError("Payroll record belongs to another branch.")` |
| `payroll.status == Payroll.STATUS_DRAFT` | `ValueError("Draft payroll cannot receive payments.")` |
| `amount &lt;= 0` | `ValueError("Payment amount must be greater than zero.")` |
| `amount &gt; payroll.remaining_balance` | `ValueError("Payment amount cannot exceed the remaining balance.")` |

## `backend/backend/users/serializers.py`

### LoginRateLimitConfigSerializer.validate_max_failed_attempts

| Trigger / condition | Server result or message |
|---|---|
| `value &lt; 1 or value &gt; 100` | `serializers.ValidationError("Must be between 1 and 100.")` |

### LoginRateLimitConfigSerializer.validate_window_minutes

| Trigger / condition | Server result or message |
|---|---|
| `value &lt; 1 or value &gt; 1440` | `serializers.ValidationError("Must be between 1 and 1440.")` |

### LoginRateLimitConfigSerializer.validate_lockout_minutes

| Trigger / condition | Server result or message |
|---|---|
| `value &lt; 1 or value &gt; 1440` | `serializers.ValidationError("Must be between 1 and 1440.")` |

### SalaryAdvanceSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `branch and staff and not staff.can_access_branch(branch)` | `serializers.ValidationError( {"staff_id": "This staff member cannot access this branch."} )` |
| `attrs.get("amount") is not None and attrs["amount"] &lt;= 0` | `serializers.ValidationError({"amount": "Amount must be greater than zero."})` |

### PayrollSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `branch and staff and not staff.can_access_branch(branch)` | `serializers.ValidationError( {"staff_id": "This staff member cannot access this branch."} )` |
| `period_start and period_end and period_start &gt; period_end` | `serializers.ValidationError( {"period_end": "Period end must be after period start."} )` |

### StaffSerializer.to_internal_value

| Trigger / condition | Server result or message |
|---|---|
| `restaurant and has_branch_ids AND request_staff and request_staff.is_branch_admin AND not allowed_branch_id or str(value) != allowed_branch_id` | `PermissionDenied( "Branch Admins cannot assign users to another branch." )` |

### StaffSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `branch_ids is not None and not branch_ids and role not in GLOBAL_STAFF_ROLES AND NOT (branch)` | `serializers.ValidationError( {"branch_ids": "At least one branch is required for this role."} )` |
| `role == BRANCH_ADMIN_ROLE AND selected_branches is None AND NOT (branch)` | `serializers.ValidationError( {"branch_ids": "Branch Admin must be assigned to one branch."} )` |
| `role == BRANCH_ADMIN_ROLE AND NOT (selected_branches is None) AND len(selected_branches) != 1` | `serializers.ValidationError( {"branch_ids": "Branch Admin must be assigned to exactly one branch."} )` |
| `request_staff and request_staff.is_branch_admin AND not branch` | `PermissionDenied( "No active branch is assigned to this Branch Admin." )` |
| `request_staff and request_staff.is_branch_admin AND target and target.pk != request_staff.pk and target.role in PRIVILEGED_STAFF_ROLES` | `PermissionDenied( "Branch Admins cannot manage administrator accounts." )` |
| `request_staff and request_staff.is_branch_admin AND target and target.pk == request_staff.pk and role != target.role` | `PermissionDenied( "Branch Admins cannot change their own role." )` |
| `request_staff and request_staff.is_branch_admin AND not target and role in PRIVILEGED_STAFF_ROLES` | `PermissionDenied( "Branch Admins cannot create administrator accounts." )` |
| `request_staff and request_staff.is_branch_admin AND target and target.pk != request_staff.pk and role in PRIVILEGED_STAFF_ROLES` | `PermissionDenied( "Branch Admins cannot promote users to administrator roles." )` |
| `request_staff and request_staff.is_branch_admin AND requested_branches and any(b.id != branch.id for b in requested_branches)` | `PermissionDenied( "Branch Admins cannot move users to another branch." )` |
| `branch and shift and shift.branch_id != branch.id` | `serializers.ValidationError( {"shift": "This shift belongs to another branch."} )` |

## `backend/backend/users/session_views.py`

### _viewer_scope

| Trigger / condition | Server result or message |
|---|---|
| `request.user.is_superuser AND not restaurant_id` | `ValidationError({"restaurant": "A restaurant is required for platform-wide monitoring."})` |
| `not staff or not staff.restaurant_id` | `PermissionDenied("No restaurant is assigned to this user.")` |
| `staff.role == "BranchAdmin" AND requested and requested not in ("all", str(getattr(assigned, "id", "")))` | `PermissionDenied("Branch administrators can only monitor their assigned branch.")` |
| `requested == "all"` | `PermissionDenied("You cannot monitor all branches.")` |
| `requested AND not staff.can_access_branch(branch)` | `PermissionDenied("You do not have access to this branch.")` |

### heartbeat

| Trigger / condition | Server result or message |
|---|---|
| `not session_id or not staff or not staff.restaurant_id` | `Response({"detail": "Re-authentication is required to register presence."}, status=status.HTTP_409_CONFLICT)` |

### revoke_session

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Session revoked.", "revoked": 1})` |

### revoke_user_sessions

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Account sessions revoked.", "revoked": len(revoked)})` |

## `backend/backend/users/views.py`

### rate_limit_unavailable_response

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"detail": "Login is temporarily unavailable. Please try again shortly."}, status=status.HTTP_503_SERVICE_UNAVAILABLE, )` |

### staffApi

| Trigger / condition | Server result or message |
|---|---|
| `request.method == 'POST' AND request.user.staff_profile.role not in ['Admin', 'BranchAdmin']` | `Response({'detail':'Only admin can add staff.'}, status=403)` |
| `request.method == 'POST' AND request.user.staff_profile.is_demo` | `Response({'detail':'Action restricted in demo mode.'},status=403)` |
| `request.method == 'POST'` | `Response({'detail':'Only staff can add staff.'}, status=403)` |
| `request.method == 'POST'` | `Response(serializer.errors, status=400)` |

### shiftApi

| Trigger / condition | Server result or message |
|---|---|
| `request.method=='POST' AND request.user.staff_profile.is_demo` | `Response({'detail':'Action restricted in demo mode.'},status=403)` |
| `request.method=='POST' AND serializer.is_valid()` | `Response({'message':'Shift added successfully'})` |
| `request.method=='POST'` | `Response(serializer.errors,status=400)` |

### mark_attendance_view

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( {'detail': 'Action restricted in demo mode.'}, status=status.HTTP_403_FORBIDDEN )` |
| `not attendance_data` | `Response({'error': 'No attendance data provided.'}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'message': 'Attendance marked successfully!'})` |

### payrollView

| Trigger / condition | Server result or message |
|---|---|
| `request.method=='POST' AND serializer.is_valid()` | `Response({'message':'Payroll added successfully'})` |
| `request.method=='POST'` | `Response(serializer.errors,status=400)` |

### payroll_generate_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### payroll_approve_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Payroll record not found."}, status=404)` |

### payroll_payment_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### salary_advance_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### staff_payroll_history_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Staff member not found."}, status=404)` |

### login_rate_limit_config_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### staffDetailsView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### staffDetailsView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |
| `request.user.staff_profile.is_branch_admin and target.role in BRANCH_ADMIN_RESTRICTED_USER_ROLES` | `Response( {'detail': 'Branch Admins cannot delete administrator accounts.'}, status=403, )` |

## Related operating procedures

- [Create staff accounts, edit employee records, and assign roles](../../modules/employees/staff.md)
- [Create shifts and record daily attendance or leave status](../../modules/employees/attendance_shifts.md)
- [Salary profiles, payroll runs, advances, approval, and payment](../../modules/payroll/payroll.md)
- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
