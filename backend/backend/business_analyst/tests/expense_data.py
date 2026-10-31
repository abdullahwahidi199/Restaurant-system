"""Synthetic real-model fixtures, also used by explicitly authorized live checks."""
from datetime import date, datetime, timezone
from decimal import Decimal

from expenses.models import Expenses, ExpenseHistory


def create_expense_data(restaurant, branch):
    def create(name, amount, day, currency="AFN", rate="1"):
        row = Expenses.objects.create(restaurant=restaurant, branch=branch, name=name,
            amount=Decimal(amount), currency=currency, exchange_rate=Decimal(rate), date=date.fromisoformat(day),
            description="Synthetic operating cost")
        event = ExpenseHistory.objects.filter(restaurant=restaurant, branch=branch, name=name).latest("pk")
        event.date_time = datetime.fromisoformat(day + "T12:00:00+00:00")
        event.save(update_fields=["date_time"])
        return row

    rent = create("Rent", "1000", "2026-01-01")
    fuel = create("Fuel", "10", "2026-01-31", "USD", "70")
    ExpenseHistory.objects.filter(name="Fuel", restaurant=restaurant, branch=branch).update(
        date_time=datetime(2026, 1, 31, 21, tzinfo=timezone.utc))  # Feb 1 in Kabul.
    transport = create("Transport", "100", "2026-01-15")
    transport.amount = Decimal("120")
    transport.save()
    ExpenseHistory.objects.filter(name="Transport", restaurant=restaurant, branch=branch, action="updated").update(
        date_time=datetime(2026, 2, 1, 12, tzinfo=timezone.utc))
    old = create("Old cost", "50", "2025-12-31")
    zero = create("Zero", "0", "2026-01-10")
    negative = create("Adjustment", "-10", "2026-01-20")
    negative_rate = create("Negative rate", "2", "2026-02-05", "USD", "-5")
    deleted = create("Deleted cost", "3", "2026-01-20", "USD", "70")
    deleted_id = deleted.pk
    deleted.delete()
    ExpenseHistory.objects.filter(name="Deleted cost", restaurant=restaurant, branch=branch, action="deleted").update(
        date_time=datetime(2026, 2, 2, 12, tzinfo=timezone.utc))
    return {"rent": rent, "fuel": fuel, "transport": transport, "old": old, "zero": zero,
            "negative": negative, "negative_rate": negative_rate, "deleted_id": deleted_id}
