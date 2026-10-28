---
id: "operator_reference_backend_users_fields"
title: "Users — backend fields reference"
module: "employees"
description: "Static users implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["users", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_employees_staff", "operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/users/models.py", "backend/backend/users/payroll_services.py", "backend/backend/users/permissions.py", "backend/backend/users/serializers.py", "backend/backend/users/session_views.py", "backend/backend/users/signals.py", "backend/backend/users/views.py"]
status: "source_verified"
---

# Users — backend fields reference

Static implementation reference for `users`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/users/models.py`

### Shift

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="shifts",null=True, blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="shifts", null=True, blank=True, )` |
| `shift_type` | `models.CharField(max_length=50)` |
| `start_time` | `models.TimeField()` |
| `end_time` | `models.TimeField()` |

### Staff

Accepted choice values: `SALARY_TYPE_CHOICES = [ (SALARY_MONTHLY, "Monthly"), (SALARY_WEEKLY, "Weekly"), (SALARY_DAILY, "Daily"), (SALARY_HOURLY, "Hourly"), ]`; `ROLE_CHOICES = [ ('SuperAdmin','Super Admin'), ('Admin','Admin'), ('BranchAdmin','Branch Admin'), ('Manager','Manager'), ('FinanceManager','Finance Manager'), ('OperationsManager','Operations Manager'), ('Cashier','Cashier'), ('Call_operator','Call Operator'), ('Waiter','Waiter'), ('Kitchen_manager','Kitchen Manager'), ('DeliveryBoy','Delivery Boy'), ('InventoryManager', 'Inventory Manager'), ("Other","Other") ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `user` | `models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='staff_profile')` |
| `is_demo` | `models.BooleanField(default=False)` |
| `stations` | `models.ManyToManyField( Station, related_name="assigned_staff", blank=True, help_text="Stations assigned to this kitchen manager." )` |
| `name` | `models.CharField(max_length=100)` |
| `email` | `models.EmailField(unique=True)` |
| `role` | `models.CharField(max_length=20,choices=ROLE_CHOICES)` |
| `restaurant` | `models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="staff",null=True,blank=True)` |
| `branches` | `models.ManyToManyField( Branch, related_name="staff_members", blank=True )` |
| `active_branch` | `models.ForeignKey( Branch, on_delete=models.SET_NULL, related_name="active_staff", null=True, blank=True )` |
| `custom_role` | `models.CharField(max_length=50,null=True,blank=True)` |
| `shift` | `models.ForeignKey(Shift,on_delete=models.SET_NULL,related_name="staff",null=True,blank=True)` |
| `phone` | `models.CharField(max_length=15,unique=True)` |
| `vehicle_number` | `models.CharField(max_length=20, null=True, blank=True)` |
| `hire_date` | `models.DateField(null=True, blank=True)` |
| `status` | `models.CharField( max_length=20, choices=[("Active", "Active"), ("Inactive", "Inactive"), ("Resigned", "Resigned")], default="Active" )` |
| `salary_type` | `models.CharField( max_length=20, choices=SALARY_TYPE_CHOICES, default=SALARY_MONTHLY, )` |
| `payroll_base_salary` | `models.DecimalField( max_digits=12, decimal_places=2, default=0, )` |
| `payment_day` | `models.PositiveSmallIntegerField(default=1)` |
| `payroll_allowances` | `models.DecimalField( max_digits=12, decimal_places=2, default=0, )` |
| `payroll_deductions` | `models.DecimalField( max_digits=12, decimal_places=2, default=0, )` |
| `overtime_rate` | `models.DecimalField( max_digits=12, decimal_places=2, default=0, )` |
| `payroll_notes` | `models.TextField(blank=True)` |
| `is_payroll_active` | `models.BooleanField(default=True)` |
| `image` | `models.ImageField( upload_to="staff_photos/", null=True, blank=True, max_length=500, )` |

### Attendance

Accepted choice values: `STATUS_CHOICES = [ ('Present', 'Present'), ('Absent', 'Absent'), ('Leave', 'Leave'), ]`.

Serializer/model rules: `unique_together = ('staff', 'date','shift')`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff` | `models.ForeignKey(Staff,on_delete=models.CASCADE,related_name='attendances')` |
| `shift` | `models.ForeignKey(Shift,on_delete=models.SET_NULL,null=True,blank=True)` |
| `date` | `models.DateField()` |
| `status` | `models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')` |
| `restaurant` | `models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="attendances",null=True,blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="attendances", null=True, blank=True, )` |

### Payroll

Accepted choice values: `PERIOD_CHOICES = [ (PERIOD_MONTHLY, "Monthly"), (PERIOD_WEEKLY, "Weekly"), ]`; `STATUS_CHOICES = [ (STATUS_DRAFT, "Draft"), (STATUS_APPROVED, "Approved"), (STATUS_PAID, "Paid"), ]`.

Serializer/model rules: `unique_together=('staff','period_start','period_end')`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="payroll_rest_branch_idx"), models.Index(fields=["status"], name="payroll_status_idx"), models.Index(fields=["period_start", "period_end"], name="payroll_period_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff` | `models.ForeignKey(Staff,on_delete=models.CASCADE,related_name="payrolls")` |
| `period_type` | `models.CharField( max_length=20, choices=PERIOD_CHOICES, default=PERIOD_MONTHLY, )` |
| `period_start` | `models.DateField()` |
| `period_end` | `models.DateField()` |
| `base_salary` | `models.DecimalField(max_digits=12,decimal_places=2)` |
| `allowances` | `models.DecimalField(max_digits=12,decimal_places=2, default=0)` |
| `deductions` | `models.DecimalField(max_digits=12,decimal_places=2, default=0)` |
| `bonuses` | `models.DecimalField(max_digits=12, decimal_places=2,default=0)` |
| `overtime_hours` | `models.DecimalField(max_digits=8, decimal_places=2, default=0)` |
| `overtime_rate` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `overtime_amount` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `advance_deductions` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `gross_salary` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `net_salary` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `amount_paid` | `models.DecimalField(max_digits=12, decimal_places=2, default=0)` |
| `status` | `models.CharField( max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, )` |
| `notes` | `models.TextField(blank=True)` |
| `generated_at` | `models.DateTimeField(default=timezone.now)` |
| `approved_at` | `models.DateTimeField(null=True, blank=True)` |
| `paid_at` | `models.DateTimeField(null=True, blank=True)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_payrolls", )` |
| `restaurant` | `models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="payrolls",null=True,blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="payrolls", null=True, blank=True, )` |

### SalaryAdvance

Serializer/model rules: `ordering = ["-date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="adv_rest_branch_idx"), models.Index(fields=["staff", "date"], name="adv_staff_date_idx"), models.Index(fields=["applied_to"], name="adv_applied_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff` | `models.ForeignKey( Staff, on_delete=models.CASCADE, related_name="salary_advances", )` |
| `date` | `models.DateField(default=timezone.localdate)` |
| `amount` | `models.DecimalField(max_digits=12, decimal_places=2)` |
| `reason` | `models.CharField(max_length=200)` |
| `notes` | `models.TextField(blank=True)` |
| `applied_to` | `models.ForeignKey( Payroll, on_delete=models.SET_NULL, related_name="applied_advances", null=True, blank=True, )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="salary_advances", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="salary_advances", null=True, blank=True, )` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_salary_advances", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

### PayrollPayment

Accepted choice values: `PAYMENT_METHOD_CHOICES = [ ("cash", "Cash"), ("card", "Card"), ("bank_transfer", "Bank Transfer"), ("mobile_money", "Mobile Money"), ("cheque", "Cheque"), ("other", "Other"), ]`.

Serializer/model rules: `ordering = ["-date", "-created_at"]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="ppay_rest_branch_idx"), models.Index(fields=["staff", "date"], name="ppay_staff_date_idx"), models.Index(fields=["payroll"], name="ppay_payroll_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `payroll` | `models.ForeignKey( Payroll, on_delete=models.CASCADE, related_name="payments", )` |
| `staff` | `models.ForeignKey( Staff, on_delete=models.CASCADE, related_name="payroll_payments", )` |
| `date` | `models.DateField(default=timezone.localdate)` |
| `amount` | `models.DecimalField(max_digits=12, decimal_places=2)` |
| `payment_method` | `models.CharField( max_length=30, choices=PAYMENT_METHOD_CHOICES, default="cash", )` |
| `reference_number` | `models.CharField(max_length=120, blank=True)` |
| `notes` | `models.TextField(blank=True)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="payroll_payments", null=True, blank=True, )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="payroll_payments", null=True, blank=True, )` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_payroll_payments", )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### LoginRateLimitConfig

Serializer/model rules: `verbose_name = "Login rate limit configuration"`; `verbose_name_plural = "Login rate limit configuration"`.

| Field | Actual type, defaults and constraints |
|---|---|
| `enabled` | `models.BooleanField(default=True)` |
| `max_failed_attempts` | `models.PositiveSmallIntegerField(default=5)` |
| `window_minutes` | `models.PositiveSmallIntegerField(default=15)` |
| `lockout_minutes` | `models.PositiveSmallIntegerField(default=15)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

## `backend/backend/users/serializers.py`

### BranchMiniSerializer

Serializer/model rules: `model = Branch`; `fields = ["id", "name", "code", "is_main_branch", "is_active"]`.


### StaffMiniSerializer

Serializer/model rules: `model=Staff`; `fields=['id','name','role','image','custom_role']`.


### DeliveryAssignmentStaffSerializer

Serializer/model rules: `model = Staff`; `fields = ["id", "name", "phone", "vehicle_number", "image", "status"]`.


### LoginRateLimitConfigSerializer

Serializer/model rules: `model = LoginRateLimitConfig`; `fields = [ "enabled", "max_failed_attempts", "window_minutes", "lockout_minutes", "updated_at", ]`; `read_only_fields = ["updated_at"]`.


### ShiftSerializer

Serializer/model rules: `model=Shift`; `fields="__all__"`; `read_only_fields = ["restaurant", "branch"]`.


### AttendanceSerializer

Serializer/model rules: `model = Attendance`; `fields = "__all__"`; `read_only_fields = ["restaurant", "branch"]`.


### PayrollPaymentSerializer

Serializer/model rules: `model = PayrollPayment`; `fields = [ "id", "payroll", "payroll_period", "staff", "staff_id", "staff_name", "date", "amount", "payment_method", "reference_number", "notes", "restaurant", "branch", "created_by", "remaining_balance", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "branch", "created_by", "created_at", "updated_at", "remaining_balance", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff_id` | `serializers.ReadOnlyField(source="staff.id")` |
| `staff_name` | `serializers.ReadOnlyField(source="staff.name")` |
| `payroll_period` | `serializers.SerializerMethodField()` |
| `remaining_balance` | `serializers.SerializerMethodField()` |

### SalaryAdvanceSerializer

Serializer/model rules: `model = SalaryAdvance`; `fields = [ "id", "staff", "staff_id", "staff_name", "date", "amount", "reason", "notes", "applied_to", "applied_payroll_period", "is_applied", "restaurant", "branch", "created_by", "created_at", ]`; `read_only_fields = [ "restaurant", "branch", "created_by", "created_at", "applied_to", "applied_payroll_period", "is_applied", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff_id` | `serializers.PrimaryKeyRelatedField( source="staff", queryset=Staff.objects.none(), write_only=True, )` |
| `staff_name` | `serializers.ReadOnlyField(source="staff.name")` |
| `applied_payroll_period` | `serializers.SerializerMethodField()` |
| `is_applied` | `serializers.ReadOnlyField()` |

### PayrollSerializer

Serializer/model rules: `model=Payroll`; `fields=[ "id", "staff", "staff_id", "staff_name", "salary_type", "period_type", "period_start", "period_end", "base_salary", "allowances", "bonuses", "overtime_hours", "overtime_rate", "overtime_amount", "deductions", "advance_deductions", "gross_salary", "net_salary", "expense_amount", "amount_paid", "remaining_balance", "status", "notes", "generated_at", "approved_at", "paid_at", "restaurant", "branch", "branch_name", "created_by", "payments", "applied_advances", ]`; `read_only_fields = [ "restaurant", "branch", "net_salary", "gross_salary", "overtime_amount", "amount_paid", "remaining_balance", "expense_amount", "generated_at", "approved_at", "paid_at", "created_by", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff_id` | `serializers.PrimaryKeyRelatedField( source="staff", queryset=Staff.objects.none(), write_only=True, )` |
| `staff_name` | `serializers.ReadOnlyField(source="staff.name")` |
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `salary_type` | `serializers.ReadOnlyField(source="staff.salary_type")` |
| `remaining_balance` | `serializers.DecimalField( max_digits=12, decimal_places=2, read_only=True, )` |
| `expense_amount` | `serializers.DecimalField( max_digits=12, decimal_places=2, read_only=True, )` |

### StaffListSerializer

Serializer/model rules: `model = Staff`; `fields = [ 'id', 'name', 'role', 'phone', 'email', 'shift', 'shift_name', 'status', 'image', 'custom_role', 'hire_date', 'vehicle_number', 'branches', 'active_branch', 'branch_ids', 'salary_type', 'payroll_base_salary', 'payment_day', 'payroll_allowances', 'payroll_deductions', 'overtime_rate', 'payroll_notes', 'is_payroll_active', 'stations', 'station_names' ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `shift_name` | `serializers.SerializerMethodField()` |
| `branch_ids` | `serializers.SerializerMethodField()` |
| `stations` | `serializers.PrimaryKeyRelatedField( many=True, queryset=Station.objects.all(), required=False )` |
| `station_names` | `serializers.SerializerMethodField(read_only=True)` |

### StaffSerializer

Serializer/model rules: `model = Staff`; `fields = ['id','name','shift','is_demo','phone','email','shift_name' ,'hire_date','role','custom_role','deliveries','created_orders','reservations', 'image','status','attendances','payrolls','vehicle_number', 'username','password','branches','branch_ids','active_branch', 'salary_type','payroll_base_salary','payment_day', 'payroll_allowances','payroll_deductions','overtime_rate', "stations", "station_names", 'payroll_notes','is_payroll_active']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `shift` | `serializers.PrimaryKeyRelatedField( queryset=Shift.objects.all(), required=False )` |
| `stations` | `serializers.PrimaryKeyRelatedField( many=True, queryset=Station.objects.all(), required=False )` |
| `station_names` | `serializers.SerializerMethodField(read_only=True)` |
| `shift_name` | `serializers.SerializerMethodField()` |
| `branch_ids` | `serializers.PrimaryKeyRelatedField( many=True, queryset=Branch.objects.none(), write_only=True, required=False, )` |
| `username` | `serializers.CharField(write_only=True,required=False,allow_blank=True)` |
| `password` | `serializers.CharField(write_only=True,required=False,allow_blank=True)` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Create staff accounts, edit employee records, and assign roles](../../modules/employees/staff.md)
- [Create shifts and record daily attendance or leave status](../../modules/employees/attendance_shifts.md)
- [Salary profiles, payroll runs, advances, approval, and payment](../../modules/payroll/payroll.md)
- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
