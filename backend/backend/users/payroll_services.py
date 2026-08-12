from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from django.utils.dateparse import parse_date

from .models import Payroll, PayrollPayment, SalaryAdvance, Staff


MONEY_QUANT = Decimal("0.01")


def decimal_value(value, default="0"):
    if value in [None, ""]:
        return Decimal(default)
    return Decimal(str(value))


def money(value):
    return decimal_value(value).quantize(MONEY_QUANT)


def period_days(period_start, period_end):
    return max((period_end - period_start).days + 1, 1)


def salary_base_for_period(staff, period_start, period_end, regular_days=None, regular_hours=None):
    base = Decimal(staff.payroll_base_salary or 0)

    if staff.salary_type in [Staff.SALARY_MONTHLY, Staff.SALARY_WEEKLY]:
        return money(base)

    if staff.salary_type == Staff.SALARY_DAILY:
        days = decimal_value(regular_days, default=str(period_days(period_start, period_end)))
        return money(base * days)

    if staff.salary_type == Staff.SALARY_HOURLY:
        hours = decimal_value(regular_hours)
        return money(base * hours)

    return money(base)


def available_advances(staff, period_end):
    return SalaryAdvance.objects.filter(
        staff=staff,
        restaurant=staff.restaurant,
        applied_to__isnull=True,
        date__lte=period_end,
    )


@transaction.atomic
def generate_payroll(data, restaurant, branch, created_by=None):
    if not branch:
        raise ValueError("An active branch is required to generate payroll.")

    period_type = data.get("period_type") or Payroll.PERIOD_MONTHLY
    period_start = parse_date(data.get("period_start")) if isinstance(data.get("period_start"), str) else data.get("period_start")
    period_end = parse_date(data.get("period_end")) if isinstance(data.get("period_end"), str) else data.get("period_end")
    if not period_start or not period_end:
        raise ValueError("Period start and end are required.")
    if period_start > period_end:
        raise ValueError("Period end must be after period start.")
    if period_type not in [Payroll.PERIOD_MONTHLY, Payroll.PERIOD_WEEKLY]:
        raise ValueError("Payroll period type must be monthly or weekly.")

    staff_ids = data.get("staff_ids") or data.get("employees") or []
    staff_qs = Staff.objects.filter(
        restaurant=restaurant,
        branches=branch,
        status="Active",
        is_payroll_active=True,
    ).distinct()
    if staff_ids:
        staff_qs = staff_qs.filter(id__in=staff_ids)

    if not staff_qs.exists():
        raise ValueError("No active payroll employees found for this branch.")

    default_bonus = money(data.get("bonus") or data.get("bonuses"))
    default_overtime_hours = decimal_value(data.get("overtime_hours"))
    default_regular_days = data.get("regular_days")
    default_regular_hours = data.get("regular_hours")
    notes = (data.get("notes") or "").strip()

    staff_ids_to_lock = list(
        staff_qs.order_by("id").values_list("id", flat=True)
    )

    created = []
    locked_staff = (
        Staff.objects
        .filter(id__in=staff_ids_to_lock)
        .select_for_update()
        .order_by("id")
    )
    for staff in locked_staff:
        base_salary = salary_base_for_period(
            staff,
            period_start,
            period_end,
            regular_days=default_regular_days,
            regular_hours=default_regular_hours,
        )
        payroll, was_created = Payroll.objects.get_or_create(
            staff=staff,
            period_start=period_start,
            period_end=period_end,
            defaults={
                "period_type": period_type,
                "base_salary": base_salary,
                "restaurant": restaurant,
                "branch": branch,
                "created_by": created_by,
            },
        )

        if not was_created and payroll.status == Payroll.STATUS_PAID:
            continue
        if not was_created and payroll.payments.exists():
            continue

        SalaryAdvance.objects.filter(applied_to=payroll).update(applied_to=None)
        advances = available_advances(staff, period_end)
        advance_total = advances.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        payroll.period_type = period_type
        payroll.restaurant = restaurant
        payroll.branch = branch
        payroll.created_by = payroll.created_by or created_by
        payroll.base_salary = base_salary
        payroll.allowances = money(staff.payroll_allowances)
        payroll.deductions = money(staff.payroll_deductions)
        payroll.bonuses = default_bonus
        payroll.overtime_hours = default_overtime_hours
        payroll.overtime_rate = money(staff.overtime_rate)
        payroll.advance_deductions = money(advance_total)
        payroll.status = Payroll.STATUS_DRAFT
        payroll.approved_at = None
        payroll.paid_at = None
        payroll.amount_paid = Decimal("0.00")
        payroll.notes = notes
        payroll.save()

        advances.update(applied_to=payroll)
        created.append(payroll)

    return created


@transaction.atomic
def approve_payroll(payroll):
    payroll = Payroll.objects.select_for_update().get(pk=payroll.pk)
    if payroll.status == Payroll.STATUS_DRAFT:
        payroll.status = Payroll.STATUS_APPROVED
        payroll.approved_at = timezone.now()
        payroll.save(update_fields=["status", "approved_at"])
    return payroll


@transaction.atomic
def create_payroll_payment(data, restaurant, branch, created_by=None):
    payroll_id = data.get("payroll")
    if not payroll_id:
        raise ValueError("Payroll is required.")

    try:
        payroll = Payroll.objects.select_for_update().select_related("staff").get(
            id=payroll_id,
            restaurant=restaurant,
        )
    except Payroll.DoesNotExist as exc:
        raise ValueError("Payroll record not found.") from exc

    if branch and payroll.branch_id != branch.id:
        raise ValueError("Payroll record belongs to another branch.")
    if payroll.status == Payroll.STATUS_DRAFT:
        raise ValueError("Draft payroll cannot receive payments.")

    amount = money(data.get("amount"))
    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")
    if amount > payroll.remaining_balance:
        raise ValueError("Payment amount cannot exceed the remaining balance.")

    return PayrollPayment.objects.create(
        payroll=payroll,
        staff=payroll.staff,
        restaurant=restaurant,
        branch=payroll.branch,
        date=data.get("date") or timezone.localdate(),
        amount=amount,
        payment_method=data.get("payment_method") or "cash",
        reference_number=(data.get("reference_number") or "").strip(),
        notes=(data.get("notes") or "").strip(),
        created_by=created_by,
    )


def employee_payroll_history(staff):
    payrolls = staff.payrolls.order_by("-period_start", "-generated_at")
    payments = staff.payroll_payments.select_related("payroll").order_by("-date", "-created_at")
    advances = staff.salary_advances.select_related("applied_to").order_by("-date", "-created_at")

    total_earnings = sum((payroll.expense_amount for payroll in payrolls), Decimal("0.00"))
    total_deductions = sum(
        (
            Decimal(payroll.deductions or 0) + Decimal(payroll.advance_deductions or 0)
            for payroll in payrolls
        ),
        Decimal("0.00"),
    )
    total_paid = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    total_advances = advances.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

    return {
        "staff": staff,
        "payrolls": payrolls,
        "payments": payments,
        "advances": advances,
        "total_earnings": total_earnings,
        "total_deductions": total_deductions,
        "total_paid": total_paid,
        "total_advances": total_advances,
    }
