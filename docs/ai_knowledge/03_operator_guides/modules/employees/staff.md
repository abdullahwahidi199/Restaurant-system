---
id: "operator_modules_employees_staff"
title: "Create staff accounts, edit employee records, and assign roles"
module: "employees"
description: "Create staff login and employee records, assign role, shift and kitchen stations, edit salary profiles, and understand BranchAdmin restrictions and create/edit differences."
keywords: ["employees", "create", "staff", "accounts", "edit", "employee", "records", "assign", "roles", "employee account", "staff role", "station assignment", "salary profile"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll", "operator_modules_audit_audit_activity", "operator_reference_backend_users_validation", "operator_reference_interface_component_admin_staff_staffmanagement", "operator_reference_interface_component_admin_staff_stafftable", "operator_reference_interface_component_admin_staff_staffformmodal", "operator_reference_backend_users_fields", "operator_reference_backend_users_access"]
frontend_routes: ["/admin/dashboard/staff"]
source_references: ["frontend/src/component/Admin/staff/StaffManagement.jsx", "frontend/src/component/Admin/staff/StaffTable.jsx", "frontend/src/component/Admin/staff/StaffFormModal.jsx", "frontend/src/component/Admin/staff/StaffModal.jsx", "backend/backend/users/models.py:Staff", "backend/backend/users/serializers.py:StaffSerializer", "backend/backend/users/views.py:staffApi", "backend/backend/users/views.py:staffDetailsView"]
status: "source_verified"
---

# Create staff accounts, edit employee records, and assign roles

## Page and authority

Admin/BranchAdmin **HR → Staff** `/admin/dashboard/staff`. Staff table provides search/filter, add, detail, edit and delete controls as rendered. OperationsManager can list staff through API for attendance; FinanceManager can read/update records through payroll salary profiles. Neither gets an unrestricted Staff route in React. Only Admin/BranchAdmin may create staff through `staffApi`.

BranchAdmin cannot create/promote/delete other administrator accounts, move staff to another branch, or change their own role. BranchAdmin is exactly one branch; Admin has broader branch assignment authority. Staff form hides administrator role options unless current role is Admin. User role choices are enumerated in StaffFormModal and `Staff.ROLE_CHOICES`; a custom role label is not a universal authorization override.

## Create form field reference

| Field | Requirement/default | Constraints and meaning |
|---|---|---|
| Full Name | Required, empty | Staff display name; model length constraints in users fields reference. |
| Email | Required | Browser email input; backend email field. |
| Phone | Required | Text; backend field length/uniqueness rules apply. |
| Hire Date | Optional | Date; defaults model date when omitted. |
| Profile Image | Optional | File upload; existing image preserved when no new file on edit. |
| Role | Required | Dropdown of implemented Staff roles; determines portal/access. |
| Kitchen Stations | Conditional on Kitchen_manager | Toggle station chips; submitted as repeated station IDs. No assignment currently means broad kitchen queue, not zero visibility. |
| Shift | Optional | Dropdown from current branch; backend rejects another branch’s shift. |
| Status | Default Active | Staff employment status choices; affects active payroll eligibility. Do not equate display status with managed-session revocation. |
| Custom Role | Conditional/optional | Text for custom role display; permission classes differ in whether they consider it. |
| Vehicle Number | Delivery role condition | Identifies driver vehicle for assignment display. |
| Salary Type | Default monthly | monthly/weekly/daily/hourly; used by payroll generation. |
| Base Salary | Blank→0 in submit | Decimal payroll_base_salary. |
| Payment Day | Default1; blank→1 | Number; use model constraints. Does not schedule an automatic transfer. |
| Allowances / Deductions / Overtime Rate | Blank→0 | Decimal profile inputs used when generating payroll. |
| Payroll Notes | Optional | Text. |
| Payroll Active | Checkbox true | Determines payroll eligibility. |
| Username | Optional | Account login identifier; serializer may generate when absent. Check username uniqueness. |
| Password | Optional in UI/serializer | Enter an approved initial password for a login-capable role; eye control reveals/hides. Generated/default credential literals are deliberately not copied into this knowledge base. |

**Add Staff** opens modal. Enter required identity/role fields, assignment and profile data, then **Add Staff**. Custom validation checks name/role/email/phone. The form sends multipart data, normalizes blank salary amounts to0/payment day1 and includes stations only for Kitchen_manager. Server creates staff and corresponding login account according to serializer role/account logic, assigns branch context, links shift/stations. Success closes modal and parent refreshes. Backend errors are flattened as `field: messages` in form.

## Edit and detail differences

**Edit** preloads fields but initializes password blank and image null. Blank password/username fields are omitted by frontend, so editing other values does not automatically reset password. Submit **Update Staff** changes same staff and related user details handled by serializer. Profile changes affect future payroll generation; already paid payroll records are not recalculated. Changing role can alter next portal access and kitchen assignment behavior; it does not itself revoke every active session.

**View** opens staff detail with employment data and related attendance, payroll, orders/reservations/deliveries exposed by the serializer. Follow the permitted payroll detail links for salary records. **Delete** opens confirmation and removes staff/account relationships according to view/model handlers; it is not an “inactive” toggle or payroll reversal. It has no restore action, and server restricts demo/administrator targets.

## Failures and recovery

**Only admin can add staff.**, **Action restricted in demo mode.**, branch-assignment/shift errors and duplicate username/email/phone errors require a real correction or authorized administrator. Do not invent a separate permissions editor: none is mounted for arbitrary Django permission management. Explicit activity permissions can exist on an account, but there is no documented operator UI to grant them.

See [attendance shifts](attendance_shifts.md), [payroll](../payroll/payroll.md), [audit activity](../audit/audit_activity.md), and [users validation](../../reference/backend/users_validation.md).

## Detailed controls, fields, and server rules

- [Staff Management — controls and fields](../../reference/interface/component_admin_staff_staffmanagement.md)
- [Staff Table — controls and fields](../../reference/interface/component_admin_staff_stafftable.md)
- [Staff Form Modal — controls and fields](../../reference/interface/component_admin_staff_staffformmodal.md)
- [Users — backend fields reference](../../reference/backend/users_fields.md)
- [Users — backend validation reference](../../reference/backend/users_validation.md)
- [Users — backend access reference](../../reference/backend/users_access.md)
