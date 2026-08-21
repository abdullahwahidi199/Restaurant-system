from django.db import models
from django.db.models import Sum
from django.utils import timezone
from django.contrib.auth.models import User
from restaurants.models import Restaurant, Branch
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from decimal import Decimal
from menu.models import Station


class Shift(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="shifts",null=True,
    blank=True)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="shifts",
        null=True,
        blank=True,
    )

    shift_type = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.shift_type} - {self.start_time} to {self.end_time}"  
    

class Staff(models.Model):
    BRANCH_ADMIN_ROLE = "BranchAdmin"
    ALL_BRANCH_ACCESS_ROLES = {"Admin", "SuperAdmin"}
    SALARY_MONTHLY = "monthly"
    SALARY_WEEKLY = "weekly"
    SALARY_DAILY = "daily"
    SALARY_HOURLY = "hourly"
    SALARY_TYPE_CHOICES = [
        (SALARY_MONTHLY, "Monthly"),
        (SALARY_WEEKLY, "Weekly"),
        (SALARY_DAILY, "Daily"),
        (SALARY_HOURLY, "Hourly"),
    ]

    ROLE_CHOICES=[
        ('SuperAdmin','Super Admin'),
        ('Admin','Admin'),
        ('BranchAdmin','Branch Admin'),
        ('Manager','Manager'),
        ('FinanceManager','Finance Manager'),
        ('OperationsManager','Operations Manager'),
        ('Cashier','Cashier'),
        ('Call_operator','Call Operator'),
        ('Waiter','Waiter'),
        ('Kitchen_manager','Kitchen Manager'),
        ('DeliveryBoy','Delivery Boy'),
        ('InventoryManager', 'Inventory Manager'),
        ("Other","Other")
        
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='staff_profile')
    is_demo=models.BooleanField(default=False)
    stations = models.ManyToManyField(
        Station,
        related_name="assigned_staff",
        blank=True,
        help_text="Stations assigned to this kitchen manager."
    )
    name=models.CharField(max_length=100)
    email=models.EmailField(unique=True)
    role=models.CharField(max_length=20,choices=ROLE_CHOICES)
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="staff",null=True,blank=True)
    branches = models.ManyToManyField(
        Branch,
        related_name="staff_members",
        blank=True
    )
    active_branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        related_name="active_staff",
        null=True,
        blank=True
    )
    custom_role=models.CharField(max_length=50,null=True,blank=True)
    shift=models.ForeignKey(Shift,on_delete=models.SET_NULL,related_name="staff",null=True,blank=True)
    phone=models.CharField(max_length=15,unique=True)
    vehicle_number = models.CharField(max_length=20, null=True, blank=True)
    hire_date=models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[("Active", "Active"), ("Inactive", "Inactive"), ("Resigned", "Resigned")],
        default="Active"
    )
    # salary=models.FloatField()
    salary_type = models.CharField(
        max_length=20,
        choices=SALARY_TYPE_CHOICES,
        default=SALARY_MONTHLY,
    )
    payroll_base_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    payment_day = models.PositiveSmallIntegerField(default=1)
    payroll_allowances = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    payroll_deductions = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    overtime_rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    payroll_notes = models.TextField(blank=True)
    is_payroll_active = models.BooleanField(default=True)
    image=models.ImageField(
        upload_to="staff_photos/",
        null=True,
        blank=True,
        max_length=500,
    )

    def __str__(self):
        if self.role=="Other" and self.custom_role:
            return f"{self.name} ({self.custom_role})"
        return f"{self.name} ({self.role})"

    @property
    def has_all_branch_access(self):
        return self.role in self.ALL_BRANCH_ACCESS_ROLES

    @property
    def is_branch_admin(self):
        return self.role == self.BRANCH_ADMIN_ROLE

    @property
    def can_switch_branches(self):
        return self.has_all_branch_access

    def get_assigned_branch(self):
        if not self.restaurant_id:
            return None

        assigned = self.branches.filter(
            is_active=True,
            restaurant=self.restaurant,
        )

        if self.active_branch_id and assigned.filter(id=self.active_branch_id).exists():
            return self.active_branch

        return assigned.order_by("id").first()

    def get_available_branches(self):
        if not self.restaurant:
            return Branch.objects.none()

        if self.has_all_branch_access:
            return self.restaurant.branches.filter(is_active=True)

        if self.is_branch_admin:
            assigned_branch = self.get_assigned_branch()
            if assigned_branch:
                return Branch.objects.filter(id=assigned_branch.id)
            return Branch.objects.none()

        return self.branches.filter(is_active=True, restaurant=self.restaurant)

    def can_access_branch(self, branch):
        if not branch or branch.restaurant_id != self.restaurant_id:
            return False

        if self.has_all_branch_access:
            return True

        if self.is_branch_admin:
            assigned_branch = self.get_assigned_branch()
            return bool(assigned_branch and assigned_branch.id == branch.id)

        return self.branches.filter(id=branch.id).exists()

    def get_or_set_active_branch(self):
        branches = self.get_available_branches()

        if self.active_branch and branches.filter(id=self.active_branch_id).exists():
            return self.active_branch

        branch = branches.first()
        if branch:
            self.active_branch = branch
            self.save(update_fields=["active_branch"])

        return branch
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.image:
            img = Image.open(self.image.path)

            # convert to RGB (important for PNGs with transparency)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # 🔥 Resize (optional but highly recommended)
            max_size = (800, 800)
            img.thumbnail(max_size)

            # 🔥 Compress and save
            img_io = BytesIO()
            img.save(img_io, format='JPEG', quality=70, optimize=True)

            # overwrite same file
            self.image.save(
                self.image.name,
                ContentFile(img_io.getvalue()),
                save=False
            )

            super().save(update_fields=['image'])

    
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Leave', 'Leave'),
    ]
    staff=models.ForeignKey(Staff,on_delete=models.CASCADE,related_name='attendances')
    shift=models.ForeignKey(Shift,on_delete=models.SET_NULL,null=True,blank=True)
    date=models.DateField() 
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="attendances",null=True,blank=True)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="attendances",
        null=True,
        blank=True,
    )
    class Meta:
        unique_together = ('staff', 'date','shift')

    def save(self, *args, **kwargs):
        if self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch):
            raise ValueError("Attendance staff cannot access this branch.")

        if self.branch_id and self.shift_id and self.shift.branch_id != self.branch_id:
            raise ValueError("Attendance shift belongs to another branch.")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.staff.name} - {self.date} - {self.status}"

class Payroll(models.Model):
    PERIOD_MONTHLY = "monthly"
    PERIOD_WEEKLY = "weekly"
    STATUS_DRAFT = "draft"
    STATUS_APPROVED = "approved"
    STATUS_PAID = "paid"

    PERIOD_CHOICES = [
        (PERIOD_MONTHLY, "Monthly"),
        (PERIOD_WEEKLY, "Weekly"),
    ]
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_PAID, "Paid"),
    ]

    staff=models.ForeignKey(Staff,on_delete=models.CASCADE,related_name="payrolls")
    period_type = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        default=PERIOD_MONTHLY,
    )
    period_start=models.DateField()
    period_end=models.DateField()
    base_salary=models.DecimalField(max_digits=12,decimal_places=2)
    allowances=models.DecimalField(max_digits=12,decimal_places=2, default=0)
    deductions=models.DecimalField(max_digits=12,decimal_places=2, default=0)
    bonuses=models.DecimalField(max_digits=12, decimal_places=2,default=0)
    overtime_hours=models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_rate=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overtime_amount=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_deductions=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_salary=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid=models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )
    notes = models.TextField(blank=True)
    generated_at=models.DateTimeField(default=timezone.now)
    approved_at=models.DateTimeField(null=True, blank=True)
    paid_at=models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_payrolls",
    )
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name="payrolls",null=True,blank=True)
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="payrolls",
        null=True,
        blank=True,
    )
    class Meta:
        unique_together=('staff','period_start','period_end')
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="payroll_rest_branch_idx"),
            models.Index(fields=["status"], name="payroll_status_idx"),
            models.Index(fields=["period_start", "period_end"], name="payroll_period_idx"),
        ]

    def calculate_net_salary(self):
        base = Decimal(self.base_salary or 0)
        allowances = Decimal(self.allowances or 0)
        bonuses = Decimal(self.bonuses or 0)
        deductions = Decimal(self.deductions or 0)
        overtime_hours = Decimal(self.overtime_hours or 0)
        overtime_rate = Decimal(self.overtime_rate or 0)
        advances = Decimal(self.advance_deductions or 0)

        self.overtime_amount = (overtime_hours * overtime_rate).quantize(Decimal("0.01"))
        self.gross_salary = (
            base + allowances + bonuses + self.overtime_amount
        ).quantize(Decimal("0.01"))
        self.net_salary = max(
            self.gross_salary - deductions - advances,
            Decimal("0.00"),
        ).quantize(Decimal("0.01"))
        return self.net_salary

    @property
    def expense_amount(self):
        return max(
            Decimal(self.gross_salary or 0) - Decimal(self.deductions or 0),
            Decimal("0.00"),
        )

    @property
    def remaining_balance(self):
        return max(
            Decimal(self.net_salary or 0) - Decimal(self.amount_paid or 0),
            Decimal("0.00"),
        )

    def refresh_payment_status(self, save=True):
        paid = self.payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        self.amount_paid = min(Decimal(paid), Decimal(self.net_salary or 0))

        if self.status != self.STATUS_DRAFT and self.remaining_balance <= 0 and self.net_salary > 0:
            self.status = self.STATUS_PAID
            if not self.paid_at:
                self.paid_at = timezone.now()
        elif self.status == self.STATUS_PAID and self.remaining_balance > 0:
            self.status = self.STATUS_APPROVED
            self.paid_at = None

        if save:
            self.save(update_fields=["amount_paid", "status", "paid_at"])
        return self

    def save(self,*args,**kwargs):
        if self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch):
            raise ValueError("Payroll staff cannot access this branch.")

        self.calculate_net_salary()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Payroll: {self.staff.name} ({self.period_start}) - ({self.period_end})"


class SalaryAdvance(models.Model):
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="salary_advances",
    )
    date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    applied_to = models.ForeignKey(
        Payroll,
        on_delete=models.SET_NULL,
        related_name="applied_advances",
        null=True,
        blank=True,
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="salary_advances",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="salary_advances",
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_salary_advances",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="adv_rest_branch_idx"),
            models.Index(fields=["staff", "date"], name="adv_staff_date_idx"),
            models.Index(fields=["applied_to"], name="adv_applied_idx"),
        ]

    @property
    def is_applied(self):
        return self.applied_to_id is not None

    def save(self, *args, **kwargs):
        if self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch):
            raise ValueError("Salary advance staff cannot access this branch.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Advance: {self.staff.name} - {self.amount}"


class PayrollPayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("mobile_money", "Mobile Money"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    payroll = models.ForeignKey(
        Payroll,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="payroll_payments",
    )
    date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default="cash",
    )
    reference_number = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="payroll_payments",
        null=True,
        blank=True,
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="payroll_payments",
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_payroll_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["restaurant", "branch"], name="ppay_rest_branch_idx"),
            models.Index(fields=["staff", "date"], name="ppay_staff_date_idx"),
            models.Index(fields=["payroll"], name="ppay_payroll_idx"),
        ]

    def save(self, *args, **kwargs):
        if self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch):
            raise ValueError("Payroll payment staff cannot access this branch.")
        super().save(*args, **kwargs)
        if self.payroll_id:
            self.payroll.refresh_payment_status(save=True)

    def delete(self, *args, **kwargs):
        payroll = self.payroll
        result = super().delete(*args, **kwargs)
        payroll.refresh_payment_status(save=True)
        return result

    def __str__(self):
        return f"Payroll payment: {self.staff.name} - {self.amount}"


class LoginRateLimitConfig(models.Model):
    enabled = models.BooleanField(default=True)
    max_failed_attempts = models.PositiveSmallIntegerField(default=5)
    window_minutes = models.PositiveSmallIntegerField(default=15)
    lockout_minutes = models.PositiveSmallIntegerField(default=15)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Login rate limit configuration"
        verbose_name_plural = "Login rate limit configuration"

    @classmethod
    def load(cls):
        config, _ = cls.objects.get_or_create(pk=1)
        return config

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        return None

    def __str__(self):
        state = "enabled" if self.enabled else "disabled"
        return f"Login rate limiting {state}"
