---
id: "operator_modules_employees_attendance_shifts"
title: "Create shifts and record daily attendance or leave status"
module: "employees"
description: "Create or delete shifts and save today’s Present, Absent or Leave attendance for assigned staff; no leave-approval or automatic payroll-hours workflow is provided."
keywords: ["employees", "create", "shifts", "record", "daily", "attendance", "leave", "status", "daily attendance", "shift assignment", "absence", "leave status"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_modules_payroll_payroll", "operator_workflows_staff_to_payroll", "operator_reference_interface_component_admin_shift_shifts", "operator_reference_interface_component_admin_shift_shiftlist", "operator_reference_interface_component_admin_shift_addshiftmodal", "operator_reference_interface_component_admin_attendance", "operator_reference_backend_users_fields", "operator_reference_backend_users_validation", "operator_reference_backend_users_access"]
frontend_routes: ["/admin/dashboard/shifts", "/admin/dashboard/attendance", "/operations-manager/shifts", "/operations-manager/attendance"]
source_references: ["frontend/src/component/Admin/shift/shifts.jsx", "frontend/src/component/Admin/shift/ShiftList.jsx", "frontend/src/component/Admin/shift/addShiftModal.jsx", "frontend/src/component/Admin/attendance.jsx", "backend/backend/users/models.py:Shift", "backend/backend/users/models.py:Attendance", "backend/backend/users/views.py:mark_attendance_view"]
status: "source_verified"
---

# Create shifts and record daily attendance or leave status

Admin/BranchAdmin **HR → Shifts / Attendance** (`/admin/dashboard/shifts`, `/admin/dashboard/attendance`); OperationsManager **Shifts / Attendance** (`/operations-manager/shifts`, `/operations-manager/attendance`). The Operations Manager home also renders shifts. These APIs require active branch/restaurant for list/create/mark operations and appropriate role. Demo actions are rejected.

## Shifts

Shift cards show shift name/type, start/end, computed displayed duration and assigned staff. Duration display handles an end before start as overnight. This does not establish an overtime or automatic attendance scheduler.

Use add-shift control to open modal. Fields **Shift Name**, **Start Time**, **End Time** are required, empty by default; times use browser time inputs. Submit sends shift_type/start_time/end_time and server associates restaurant/current branch. **Cancel** closes. Failure can use an attendance-themed generic string despite editing a shift; inspect actual record and field error.

Shift **Delete** opens the page’s confirmation. The delete button is disabled while that shift is deleting. Removing a shift changes its staff/attendance relations according to model on_delete rules; no restore action exists. Current mounted ShiftList offers create/delete and staff display; do not invent an edit-shift modal from a generic update endpoint. Assign staff to a shift through the staff form.

## Attendance

1. Open Attendance and confirm the displayed date and active branch. The mounted screen works with **today**; it has no freeform historical attendance date field.
2. Select the shift card/tab. It loads assigned staff and recent attendance. Existing records for that shift/date prefill statuses.
3. For every employee choose **Present**, **Absent**, or **Leave**. Unset staff default to Present when saving; check every row before submit.
4. Use the page’s save-attendance button. It is disabled while saving/loading or with no staff. The payload contains every visible staff member, selected shift and today’s date.
5. Backend update_or_create uses staff+shift+date+branch, so repeat saving updates that date’s records rather than intentionally adding another attendance row. It writes audit evidence. UI shows **✅ Attendance saved successfully!** or **❌ Failed to save attendance.**

**Leave** is an attendance status. There is no implemented leave request, allowance balance, approval calendar or employee self-service request module in the inspected operator routes. There are no clock-in/clock-out fields on this mounted attendance screen.

Backend skips staff IDs not found in restaurant/branch; an invalid shift can fall back to null. A 200 response does not guarantee an erroneous arbitrary payload marked every requested employee. Reload and review the visible rows. Empty attendance payload returns **No attendance data provided.** Correct missing staff assignment through Staff rather than substituting another shift/branch.

Current payroll generation uses salary profiles and entered regular days/hours; it does not automatically derive pay from these attendance statuses. Re-saving attendance does not automatically adjust paid payroll or create a salary deduction. See [payroll](../payroll/payroll.md) and [staff to payroll](../../workflows/staff_to_payroll.md).

## Detailed controls, fields, and server rules

- [shifts — controls and fields](../../reference/interface/component_admin_shift_shifts.md)
- [Shift List — controls and fields](../../reference/interface/component_admin_shift_shiftlist.md)
- [add Shift Modal — controls and fields](../../reference/interface/component_admin_shift_addshiftmodal.md)
- [attendance — controls and fields](../../reference/interface/component_admin_attendance.md)
- [Users — backend fields reference](../../reference/backend/users_fields.md)
- [Users — backend validation reference](../../reference/backend/users_validation.md)
- [Users — backend access reference](../../reference/backend/users_access.md)
