from django.db import models
from django.utils import timezone
from restaurants.models import Restaurant
# Create your models here.
class Expenses(models.Model):
    name=models.CharField(max_length=200)
    amount=models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    description=models.TextField(blank=True)
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name='expenses')

    def __str__(self):
        return self.name

class ExpenseHistory(models.Model):
    ACTION_CHOICES=[
        ('created','Created'),
        ('updated','Updated'),
        ('deleted','Deleted')
    ]
    name=models.CharField(max_length=200)
    amount=models.DecimalField(max_digits=10, decimal_places=2)
    date_time=models.DateTimeField(default=timezone.now)
    changed_fields=models.JSONField(blank=True,null=True)
    action=models.CharField(max_length=10,choices=ACTION_CHOICES,default='Created')
    description=models.TextField(blank=True)
    restaurant=models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name='expense_histories')

    def __str__(self):
        return f'{self.name} - {self.action} on {self.date_time.strftime('%Y-%m-%d %H:%M')}'