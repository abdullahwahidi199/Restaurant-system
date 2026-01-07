from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Shift(models.Model):
    shift_type=models.CharField(max_length=50)
    
    # staff=models.ForeignKey(Staff,on_delete=models.CASCADE,related_name="shifts")
    start_time=models.TimeField()
    end_time=models.TimeField()

    def __str__(self):
        return f"{self.shift_type} - {self.start_time} to {self.end_time}"
    

class Staff(models.Model):
    ROLE_CHOICES=[
        ('Admin','Admin'),
        ('Cashier','Cashier'),
        ('Waiter','Waiter'),
        ('Kitchen_manager','Kitchen_manager'),
        ('DeliveryBoy','Delivery Boy'),
        ("Other","Other")
        
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='staff_profile')
    is_demo=models.BooleanField(default=False)
    name=models.CharField(max_length=100)
    email=models.EmailField(unique=True)
    role=models.CharField(max_length=20,choices=ROLE_CHOICES)
    custom_role=models.CharField(max_length=50,null=True,blank=True)
    shift=models.ForeignKey(Shift,on_delete=models.CASCADE,related_name="staff",null=True,blank=True)
    phone=models.CharField(max_length=15,unique=True)
    vehicle_number = models.CharField(max_length=20, null=True, blank=True)
    hire_date=models.DateField()
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

    class Meta:
        unique_together = ('staff', 'date','shift')

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

    class Meta:
        unique_together=('staff','period_start','period_end')

    def calculate_net_salary(self):
        base=self.base_salary or 0
        self.net_salary=base+self.bonuses-self.deductions

        return self.net_salary

    def save(self,*args,**kwargs):
        self.calculate_net_salary()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Payroll: {self.staff.name} ({self.period_start}) - ({self.period_end})"