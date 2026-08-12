from decimal import Decimal

import django.db.models.deletion
from django.db import migrations, models
from django.utils import timezone


def backfill_payroll_amounts(apps, schema_editor):
    Payroll = apps.get_model("users", "Payroll")

    for payroll in Payroll.objects.all():
        base = Decimal(payroll.base_salary or 0)
        allowances = Decimal(getattr(payroll, "allowances", 0) or 0)
        bonuses = Decimal(payroll.bonuses or 0)
        deductions = Decimal(payroll.deductions or 0)
        overtime_hours = Decimal(getattr(payroll, "overtime_hours", 0) or 0)
        overtime_rate = Decimal(getattr(payroll, "overtime_rate", 0) or 0)
        advance_deductions = Decimal(getattr(payroll, "advance_deductions", 0) or 0)
        overtime_amount = (overtime_hours * overtime_rate).quantize(Decimal("0.01"))
        gross_salary = (base + allowances + bonuses + overtime_amount).quantize(Decimal("0.01"))
        net_salary = max(
            gross_salary - deductions - advance_deductions,
            Decimal("0.00"),
        ).quantize(Decimal("0.01"))

        Payroll.objects.filter(pk=payroll.pk).update(
            overtime_amount=overtime_amount,
            gross_salary=gross_salary,
            net_salary=net_salary,
            status="approved",
            approved_at=payroll.generated_at or timezone.now(),
        )


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0009_branch"),
        ("users", "0022_branch_admin_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="staff",
            name="salary_type",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly"),
                    ("weekly", "Weekly"),
                    ("daily", "Daily"),
                    ("hourly", "Hourly"),
                ],
                default="monthly",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="staff",
            name="payroll_base_salary",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="staff",
            name="payment_day",
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="staff",
            name="payroll_allowances",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="staff",
            name="payroll_deductions",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="staff",
            name="overtime_rate",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="staff",
            name="payroll_notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="staff",
            name="is_payroll_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="payroll",
            name="period_type",
            field=models.CharField(
                choices=[("monthly", "Monthly"), ("weekly", "Weekly")],
                default="monthly",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="payroll",
            name="base_salary",
            field=models.DecimalField(decimal_places=2, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="allowances",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AlterField(
            model_name="payroll",
            name="deductions",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AlterField(
            model_name="payroll",
            name="bonuses",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="overtime_hours",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
        migrations.AddField(
            model_name="payroll",
            name="overtime_rate",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="overtime_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="advance_deductions",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="gross_salary",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AlterField(
            model_name="payroll",
            name="net_salary",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="amount_paid",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payroll",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("approved", "Approved"),
                    ("paid", "Paid"),
                ],
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="payroll",
            name="notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="payroll",
            name="approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payroll",
            name="paid_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payroll",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="created_payrolls",
                to="users.staff",
            ),
        ),
        migrations.CreateModel(
            name="SalaryAdvance",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField(default=timezone.localdate)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("reason", models.CharField(max_length=200)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "applied_to",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="applied_advances",
                        to="users.payroll",
                    ),
                ),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="salary_advances",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_salary_advances",
                        to="users.staff",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="salary_advances",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "staff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="salary_advances",
                        to="users.staff",
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PayrollPayment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField(default=timezone.localdate)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("cash", "Cash"),
                            ("card", "Card"),
                            ("bank_transfer", "Bank Transfer"),
                            ("mobile_money", "Mobile Money"),
                            ("cheque", "Cheque"),
                            ("other", "Other"),
                        ],
                        default="cash",
                        max_length=30,
                    ),
                ),
                ("reference_number", models.CharField(blank=True, max_length=120)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payroll_payments",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_payroll_payments",
                        to="users.staff",
                    ),
                ),
                (
                    "payroll",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="users.payroll",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payroll_payments",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "staff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payroll_payments",
                        to="users.staff",
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
            },
        ),
        migrations.RunPython(backfill_payroll_amounts, migrations.RunPython.noop),
        migrations.AddIndex(
            model_name="payroll",
            index=models.Index(fields=["restaurant", "branch"], name="payroll_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="payroll",
            index=models.Index(fields=["status"], name="payroll_status_idx"),
        ),
        migrations.AddIndex(
            model_name="payroll",
            index=models.Index(fields=["period_start", "period_end"], name="payroll_period_idx"),
        ),
        migrations.AddIndex(
            model_name="salaryadvance",
            index=models.Index(fields=["restaurant", "branch"], name="adv_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="salaryadvance",
            index=models.Index(fields=["staff", "date"], name="adv_staff_date_idx"),
        ),
        migrations.AddIndex(
            model_name="salaryadvance",
            index=models.Index(fields=["applied_to"], name="adv_applied_idx"),
        ),
        migrations.AddIndex(
            model_name="payrollpayment",
            index=models.Index(fields=["restaurant", "branch"], name="ppay_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="payrollpayment",
            index=models.Index(fields=["staff", "date"], name="ppay_staff_date_idx"),
        ),
        migrations.AddIndex(
            model_name="payrollpayment",
            index=models.Index(fields=["payroll"], name="ppay_payroll_idx"),
        ),
    ]
