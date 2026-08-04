from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from restaurants.models import Restaurant, Branch
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


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

    ROLE_CHOICES=[
        ('SuperAdmin','Super Admin'),
        ('Admin','Admin'),
        ('BranchAdmin','Branch Admin'),
        ('Manager','Manager'),
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
    image=models.ImageField(upload_to="staff_photos/",null=True,blank=True)

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
    staff=models.ForeignKey(Staff,on_delete=models.CASCADE,related_name="payrolls")
    period_start=models.DateField()
    period_end=models.DateField()
    base_salary=models.DecimalField(max_digits=10,decimal_places=2)
    deductions=models.DecimalField(max_digits=10,decimal_places=2, default=0)
    net_salary=models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonuses=models.DecimalField(max_digits=10, decimal_places=2,default=0)
    generated_at=models.DateTimeField(default=timezone.now)
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

    def calculate_net_salary(self):
        base=self.base_salary or 0
        self.net_salary=base+self.bonuses-self.deductions

        return self.net_salary

    def save(self,*args,**kwargs):
        if self.branch_id and self.staff_id and not self.staff.can_access_branch(self.branch):
            raise ValueError("Payroll staff cannot access this branch.")

        self.calculate_net_salary()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Payroll: {self.staff.name} ({self.period_start}) - ({self.period_end})"
    


