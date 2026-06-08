from django.db import models
from django.utils import timezone
from decimal import Decimal
from restaurants.models import Restaurant


class Expenses(models.Model):
    CURRENCY_CHOICES = [
        ('AFN', 'Afghani'),
        ('USD', 'US Dollar'),
    ]

    name = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Original amount entered by user"
    )

    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='AFN'
    )

    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        help_text="1 USD = ? AFN"
    )

    amount_afn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False
    )

    date = models.DateField(default=timezone.now)

    description = models.TextField(blank=True)

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='expenses'
    )

    def save(self, *args, **kwargs):
        if self.currency == 'USD':
            self.amount_afn = self.amount * self.exchange_rate
        else:
            self.amount_afn = self.amount

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ExpenseHistory(models.Model):
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted')
    ]

    name = models.CharField(max_length=200)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    currency = models.CharField(
        max_length=3,
        choices=Expenses.CURRENCY_CHOICES,
        default='AFN'
    )

    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1
    )

    amount_afn = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    date_time = models.DateTimeField(default=timezone.now)

    changed_fields = models.JSONField(blank=True, null=True)

    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES,
        default='created'
    )

    description = models.TextField(blank=True)

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='expense_histories'
    )

    def __str__(self):
        return (
            f"{self.name} - {self.action} on "
            f"{self.date_time.strftime('%Y-%m-%d %H:%M')}"
        )