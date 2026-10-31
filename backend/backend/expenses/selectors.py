"""AI reporting selectors for current expenses and independent audit events.

These read-only queries extend the API's date/search/currency semantics with
exact-name filtering and grouped reporting. Saved AFN values are never recomputed.
The caller must authorize the operation and supply both trusted scope IDs.
"""
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, DecimalField, Max, Min, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from .models import Expenses, ExpenseHistory

MONEY = DecimalField(max_digits=28, decimal_places=2)
ZERO = Decimal("0.00")


class ExpenseQueryError(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def amount(value):
    return format(Decimal(value or 0).quantize(Decimal("0.01")), ".2f")


class ExpenseQueries:
    """AI reporting selectors; never call model save/delete or write services."""

    def __init__(self, *, restaurant_id, branch_id, parameters):
        if not restaurant_id or not branch_id:
            raise ExpenseQueryError("PERMISSION_DENIED")
        self.parameters = parameters
        self.scope = {"restaurant_id": restaurant_id, "branch_id": branch_id}
        try:
            self.bounds = {key: date.fromisoformat(parameters[key]) for key in
                           ("date_from", "date_to") if key in parameters}
            if self.bounds.get("date_from", date.min) > self.bounds.get("date_to", date.max):
                raise ValueError
        except (TypeError, ValueError):
            raise ExpenseQueryError("INVALID_PARAMETERS") from None
        self.expenses = Expenses.objects.filter(**self.scope)
        self.history = ExpenseHistory.objects.filter(**self.scope)

    def filtered(self, *, history=False):
        """AI reporting: inclusive business dates or local audit-event dates."""
        qs, p = (self.history if history else self.expenses), self.parameters
        for key, lookup in (("currency", "currency"), ("name", "name__iexact")):
            if key in p:
                qs = qs.filter(**{lookup: p[key]})
        if p.get("search"):
            qs = qs.filter(Q(name__icontains=p["search"]) | Q(description__icontains=p["search"]))
        if history and "action" in p:
            qs = qs.filter(action=p["action"])
        if not history:
            for key, lookup in (("date_from", "date__gte"), ("date_to", "date__lte")):
                if key in self.bounds:
                    qs = qs.filter(**{lookup: self.bounds[key]})
        else:
            # Half-open aware bounds preserve indexes and match inclusive Kabul
            # calendar days, including events around UTC midnight.
            tz = timezone.get_current_timezone()
            if "date_from" in self.bounds:
                lower = timezone.make_aware(datetime.combine(self.bounds["date_from"], time.min), tz)
                qs = qs.filter(date_time__gte=lower)
            if "date_to" in self.bounds:
                upper_date = self.bounds["date_to"]
                if upper_date == date.max:
                    qs = qs.filter(date_time__date__lte=upper_date)
                else:
                    upper = timezone.make_aware(datetime.combine(upper_date + timedelta(days=1), time.min), tz)
                    qs = qs.filter(date_time__lt=upper)
        return qs

    def detail(self, expense_id):
        """AI reporting: one current record, with indistinguishable scope misses."""
        try:
            return self.expenses.get(pk=expense_id)
        except Expenses.DoesNotExist:
            raise ExpenseQueryError("RECORD_NOT_AVAILABLE") from None

    def summary(self):
        """AI reporting: SQL aggregates of current expenses, never history sums."""
        qs = self.filtered()
        stats = qs.aggregate(count=Count("pk"), total=Sum("amount_afn", output_field=MONEY),
            average=Avg("amount_afn", output_field=MONEY), minimum=Min("amount_afn"), maximum=Max("amount_afn"),
            first_date=Min("date"), last_date=Max("date"),
            negative_count=Count("pk", filter=Q(amount__lt=0)), zero_count=Count("pk", filter=Q(amount=0)),
            negative_rate_count=Count("pk", filter=Q(exchange_rate__lt=0)))
        currencies = qs.order_by().values("currency").annotate(count=Count("pk"),
            original=Sum("amount", output_field=MONEY), afn=Sum("amount_afn", output_field=MONEY)).order_by("currency")
        names = qs.order_by().values("name").annotate(count=Count("pk"), afn=Sum("amount_afn", output_field=MONEY))
        top_names = list(names.order_by("-afn", "name")[:10])
        periods = qs.order_by().annotate(month=TruncMonth("date")).values("month").annotate(
            count=Count("pk"), afn=Sum("amount_afn", output_field=MONEY))
        top_periods = list(periods.order_by("-month")[:12])

        def breakdown(rows, total_groups, key):
            return {"groups": [{key: row[key].isoformat() if key == "month" else row[key],
                                "count": row["count"], "total_afn": amount(row["afn"])} for row in rows],
                    "total_groups": total_groups, "other_count": stats["count"] - sum(r["count"] for r in rows),
                    "other_total_afn": amount((stats["total"] or ZERO) - sum((r["afn"] for r in rows), ZERO))}

        return {"totals": {"count": stats["count"], "total_afn": amount(stats["total"]),
                    "average_afn": amount(stats["average"]), "minimum_afn": amount(stats["minimum"]),
                    "maximum_afn": amount(stats["maximum"]),
                    "first_expense_date": stats["first_date"].isoformat() if stats["first_date"] else None,
                    "last_expense_date": stats["last_date"].isoformat() if stats["last_date"] else None,
                    "negative_amount_count": stats["negative_count"], "zero_amount_count": stats["zero_count"],
                    "negative_rate_count": stats["negative_rate_count"]},
                "by_currency": [{"currency": row["currency"], "count": row["count"],
                                 "original_amount": amount(row["original"]), "total_afn": amount(row["afn"])} for row in currencies],
                "by_name": breakdown(top_names, names.count(), "name"),
                "by_month": breakdown(top_periods, periods.count(), "month")}

    def history_summary(self):
        """AI reporting: event counts only; snapshot amounts are not spending."""
        qs = self.filtered(history=True)
        stats = qs.aggregate(count=Count("pk"), first=Min("date_time"), last=Max("date_time"))
        actions = qs.order_by().values("action").annotate(event_count=Count("pk")).order_by("action")
        currencies = qs.order_by().values("currency").annotate(event_count=Count("pk")).order_by("currency")
        periods = qs.order_by().annotate(month=TruncMonth("date_time", tzinfo=timezone.get_current_timezone())).values("month").annotate(event_count=Count("pk"))
        top = list(periods.order_by("-month")[:12])
        return {"event_count": stats["count"],
                "first_event_at": timezone.localtime(stats["first"]).isoformat() if stats["first"] else None,
                "last_event_at": timezone.localtime(stats["last"]).isoformat() if stats["last"] else None,
                "by_action": list(actions), "by_currency": list(currencies),
                "by_month": {"groups": [{"month": row["month"].date().isoformat(), "event_count": row["event_count"]} for row in top],
                             "total_groups": periods.count(), "other_event_count": stats["count"] - sum(r["event_count"] for r in top)}}
