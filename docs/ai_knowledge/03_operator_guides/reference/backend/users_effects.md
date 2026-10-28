---
id: "operator_reference_backend_users_effects"
title: "Users — backend effects reference"
module: "employees"
description: "Static users implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["users", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_employees_staff", "operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/users/models.py", "backend/backend/users/payroll_services.py", "backend/backend/users/permissions.py", "backend/backend/users/serializers.py", "backend/backend/users/session_views.py", "backend/backend/users/signals.py", "backend/backend/users/views.py"]
status: "source_verified"
---

# Users — backend effects reference

Static implementation reference for `users`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/users/models.py`

### Staff.get_or_set_active_branch

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.active_branch = branch`
- `self.save(update_fields=["active_branch"])`

### Staff.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`
- `img.save(img_io, format='JPEG', quality=70, optimize=True)`
- `self.image.save( self.image.name, ContentFile(img_io.getvalue()), save=False )`
- `super().save(update_fields=['image'])`

### Attendance.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

### Payroll.calculate_net_salary

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.overtime_amount = (overtime_hours * overtime_rate).quantize(Decimal("0.01"))`
- `self.gross_salary = ( base + allowances + bonuses + self.overtime_amount ).quantize(Decimal("0.01"))`
- `self.net_salary = max( self.gross_salary - deductions - advances, Decimal("0.00"), ).quantize(Decimal("0.01"))`

### Payroll.refresh_payment_status

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.amount_paid = min(Decimal(paid), Decimal(self.net_salary or 0))`
- `self.status = self.STATUS_PAID`
- `self.paid_at = timezone.now()`
- `self.status = self.STATUS_APPROVED`
- `self.paid_at = None`
- `self.save(update_fields=["amount_paid", "status", "paid_at"])`

Named effect helpers: `refresh_payment_status`.

### Payroll.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args,**kwargs)`

### SalaryAdvance.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

### PayrollPayment.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

Named effect helpers: `refresh_payment_status`.

### PayrollPayment.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().delete(*args, **kwargs)`

Named effect helpers: `refresh_payment_status`.

### LoginRateLimitConfig.load

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `cls.objects.get_or_create(pk=1)`

### LoginRateLimitConfig.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.pk = 1`
- `super().save(*args, **kwargs)`

## `backend/backend/users/payroll_services.py`

### generate_payroll

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Payroll.objects.get_or_create( staff=staff, period_start=period_start, period_end=period_end, defaults={ "period_type": period_type, "base_salary": base_salary, "restaurant": restaurant, "branch": branch, "created_by": created_by, }, )`
- `SalaryAdvance.objects.filter(applied_to=payroll).update(applied_to=None)`
- `payroll.period_type = period_type`
- `payroll.restaurant = restaurant`
- `payroll.branch = branch`
- `payroll.created_by = payroll.created_by or created_by`
- `payroll.base_salary = base_salary`
- `payroll.allowances = money(staff.payroll_allowances)`
- `payroll.deductions = money(staff.payroll_deductions)`
- `payroll.bonuses = default_bonus`
- `payroll.overtime_hours = default_overtime_hours`
- `payroll.overtime_rate = money(staff.overtime_rate)`
- `payroll.advance_deductions = money(advance_total)`
- `payroll.status = Payroll.STATUS_DRAFT`
- `payroll.approved_at = None`
- `payroll.paid_at = None`
- `payroll.amount_paid = Decimal("0.00")`
- `payroll.notes = notes`
- `payroll.save()`
- `advances.update(applied_to=payroll)`

### approve_payroll

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `payroll.status = Payroll.STATUS_APPROVED`
- `payroll.approved_at = timezone.now()`
- `payroll.save(update_fields=["status", "approved_at"])`

Named effect helpers: `approve_payroll`.

### create_payroll_payment

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `PayrollPayment.objects.create( payroll=payroll, staff=payroll.staff, restaurant=restaurant, branch=payroll.branch, date=data.get("date") or timezone.localdate(), amount=amount, payment_method=data.get("payment_method") or "cash", reference_number=(data.get("reference_number") or "").strip(), notes=(data.get("notes") or "").strip(), created_by=created_by, )`

Named effect helpers: `create_payroll_payment`.

## `backend/backend/users/serializers.py`

### SalaryAdvanceSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["staff_id"].queryset = staff.distinct()`

### PayrollSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["staff_id"].queryset = staff.distinct()`

### StaffSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["branch_ids"].queryset = branch_queryset`
- `self.fields["shift"].queryset = shifts`

### StaffSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Staff.objects.create(**validated_data)`
- `staff.stations.set(stations)`
- `User.objects.create(username=username,email=staff.email,first_name=staff.name)`
- `user.save()`
- `staff.user=user`
- `staff.save()`

### StaffSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.save()`
- `instance.stations.set(stations)`
- `User.objects.create(username=username, email=instance.email, first_name=instance.name)`
- `instance.user = user`
- `user.username = username`
- `user.save()`

## `backend/backend/users/session_views.py`

### _record_expired_sessions

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `session.ended_at = session.refresh_expires_at`
- `session.end_reason = AuthSession.END_EXPIRED`
- `session.save(update_fields=["ended_at", "end_reason"])`

Named effect helpers: `create_audit_log`, `broadcast_presence_change`.

### _blacklist_session_jti

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `BlacklistedToken.objects.get_or_create(token=outstanding)`

### _revoke_sessions

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `session.revoked_at = now`
- `session.ended_at = now`
- `session.end_reason = AuthSession.END_REVOKED`
- `session.revoked_by = request.user`
- `session.save(update_fields=["revoked_at", "ended_at", "end_reason", "revoked_by"])`

Named effect helpers: `broadcast_presence_change`.

### logout_session

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `session.ended_at = timezone.now()`
- `session.end_reason = AuthSession.END_LOGOUT`
- `session.save(update_fields=["ended_at", "end_reason"])`

Named effect helpers: `broadcast_presence_change`, `create_audit_log`.

## `backend/backend/users/signals.py`

### shift_created_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, branch=instance.branch, type="system", message=f"New Shift added: {instance.shift_type} ({instance.start_time} - {instance.end_time})" )`

### shift_deleted_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, branch=instance.branch, type="system", message=f"Shift deleted: {instance.shift_type} ({instance.start_time} - {instance.end_time})" )`

### staff_created_updated_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="system", message=f"New Staff added: {instance.name} ({instance.role})" )`
- `Notification.objects.create( restaurant=instance.restaurant, type="system", message=f"{instance.name} updated" )`

### staff_deleted_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="system", message=f"Staff deleted: {instance.name} ({instance.role})" )`

### attendance_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, branch=instance.branch, type="attendance", message="Today's Attendance taken" )`
- `Notification.objects.create( restaurant=instance.restaurant, branch=instance.branch, type="attendance", message="Today's Attendance updated" )`

## `backend/backend/users/views.py`

### staffApi

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant)`

Named effect helpers: `record_instance_create`.

### shiftApi

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

### mark_attendance_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Attendance.objects.update_or_create( staff=staff, shift=shift, date=attendance_date, branch=branch, defaults={ 'status': status_value, 'restaurant': restaurant, } )`

Named effect helpers: `record_instance_create`, `record_instance_update`.

### payrollView

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `record_instance_create`.

### salary_advance_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=get_active_branch(request), created_by=getattr(request.user, "staff_profile", None), )`

Named effect helpers: `record_instance_create`.

### login_rate_limit_config_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `create_audit_log`.

### staffDetailsView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### PayrollDetailsView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### SalaryAdvanceDetailsView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

## Related operating procedures

- [Create staff accounts, edit employee records, and assign roles](../../modules/employees/staff.md)
- [Create shifts and record daily attendance or leave status](../../modules/employees/attendance_shifts.md)
- [Salary profiles, payroll runs, advances, approval, and payment](../../modules/payroll/payroll.md)
- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
