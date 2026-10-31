"""Read-only, scope-constrained contractor queries. Never call write services here."""
from datetime import date
from decimal import Decimal

from django.db.models import (
    Case, CharField, Count, DecimalField, F, OuterRef, Q, Subquery, Sum, Value, When,
)
from django.db.models.functions import Cast, Coalesce, Concat, Greatest
from contractors.models import (
    Contractor, ContractorInvoice, ContractorInvoiceAttachment, ContractorInvoiceLine,
    ContractorPayment, ServiceContract,
)
# AI reporting selectors: bounded, read-only queries for the Business Analyst.
# Authorization belongs to the caller; both trusted scope IDs are mandatory.
class ContractorQueryError(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)

ZERO = Decimal("0.00")
MONEY = DecimalField(max_digits=28, decimal_places=2)


def money(value):
    return format(Decimal(value or 0).quantize(Decimal("0.01")), ".2f")


def total(queryset, field):
    return queryset.aggregate(value=Sum(field, output_field=MONEY))["value"] or ZERO


def dates(queryset, field, parameters):
    for parameter, lookup in (("date_from", "gte"), ("date_to", "lte")):
        if parameter in parameters:
            queryset = queryset.filter(**{f"{field}__{lookup}": parameters[parameter]})
    return queryset


def validate_dates(parameters):
    try:
        parsed = {key: date.fromisoformat(parameters[key]) for key in
                  ("date_from", "date_to", "due_from", "due_to") if key in parameters}
        for low, high in (("date_from", "date_to"), ("due_from", "due_to")):
            if low in parsed and high in parsed and parsed[low] > parsed[high]:
                raise ValueError
    except (TypeError, ValueError):
        raise ContractorQueryError("INVALID_PARAMETERS") from None


def correlated_sum(queryset, group, field):
    query = queryset.filter(**{group: OuterRef("pk")}).order_by().values(group).annotate(
        value=Sum(field, output_field=MONEY)).values("value")[:1]
    return Coalesce(Subquery(query, output_field=MONEY), Value(ZERO, output_field=MONEY))


class ContractorQueries:
    def __init__(self, *, restaurant_id, branch_id, parameters):
        if not restaurant_id or not branch_id:
            raise ContractorQueryError("PERMISSION_DENIED")
        validate_dates(parameters)
        self.parameters = parameters
        self.scope = {"restaurant_id": restaurant_id, "branch_id": branch_id}
        parent = {"contractor__restaurant_id": restaurant_id, "contractor__branch_id": branch_id}
        self.contractors = Contractor.objects.filter(**self.scope)
        self.contracts = ServiceContract.objects.filter(**self.scope, **parent)
        self.invoices = ContractorInvoice.objects.filter(**self.scope, **parent).filter(
            Q(contract__isnull=True) | Q(contract_id__in=self.contracts.values("pk"), contract__contractor_id=F("contractor_id")))
        self.payments = ContractorPayment.objects.filter(**self.scope, **parent,
            invoice_id__in=self.invoices.values("pk"), invoice__contractor_id=F("contractor_id"))
        self.lines = ContractorInvoiceLine.objects.filter(invoice_id__in=self.invoices.values("pk"))
        self.attachments = ContractorInvoiceAttachment.objects.filter(**self.scope, invoice_id__in=self.invoices.values("pk"))
        # A nonexistent or out-of-scope explicit ID always has the same safe error.
        for key, qs in (("contractor_id", self.contractors), ("contract_id", self.contracts), ("invoice_id", self.invoices)):
            if key in parameters and not qs.filter(pk=parameters[key]).exists():
                raise ContractorQueryError("RECORD_NOT_AVAILABLE")
        if "contract_id" in parameters and "contractor_id" in parameters:
            if not self.contracts.filter(pk=parameters["contract_id"], contractor_id=parameters["contractor_id"]).exists():
                raise ContractorQueryError("INVALID_PARAMETERS")
        if "invoice_id" in parameters:
            expected = {key: parameters[key] for key in ("contractor_id", "contract_id") if key in parameters}
            if not self.invoices.filter(pk=parameters["invoice_id"], **expected).exists():
                raise ContractorQueryError("INVALID_PARAMETERS")

    def filter_contractors(self):
        qs, p = self.contractors, self.parameters
        if "contractor_id" in p:
            qs = qs.filter(pk=p["contractor_id"])
        if "is_active" in p:
            qs = qs.filter(is_active=p["is_active"])
        if p.get("search"):
            text = p["search"]
            qs = qs.filter(Q(name__icontains=text) | Q(contact_person__icontains=text) | Q(phone__icontains=text) | Q(email__icontains=text))
        return qs

    def filter_contracts(self):
        qs, p = self.contracts, self.parameters
        if "contractor_id" in p:
            qs = qs.filter(contractor_id=p["contractor_id"])
        if "status" in p:
            qs = qs.filter(status=p["status"])
        if "open_ended" in p:
            qs = qs.filter(end_date__isnull=p["open_ended"])
        if p.get("search"):
            text = p["search"]
            qs = qs.filter(Q(title__icontains=text) | Q(contractor__name__icontains=text) | Q(notes__icontains=text))
        return dates(qs, "start_date", p)

    def filter_invoices(self, parameters=None):
        qs, p = self.invoices, self.parameters if parameters is None else parameters
        for key in ("contractor_id", "contract_id", "status"):
            if key in p:
                qs = qs.filter(**{key: p[key]})
        if p.get("search"):
            text = p["search"]
            # EXISTS/subquery rather than a line join avoids multiplying charges.
            line_ids = self.lines.filter(Q(service_type__icontains=text) | Q(description__icontains=text)).values("invoice_id")
            qs = qs.filter(Q(invoice_number__icontains=text) | Q(contractor__name__icontains=text)
                           | Q(contract__title__icontains=text) | Q(description__icontains=text) | Q(pk__in=line_ids))
        for key, lookup in (("due_from", "due_date__gte"), ("due_to", "due_date__lte")):
            if key in p:
                qs = qs.filter(**{lookup: p[key]})
        return dates(qs, "invoice_date", p)

    def filter_payments(self):
        qs, p = self.payments, self.parameters
        for key in ("contractor_id", "invoice_id", "payment_method"):
            if key in p:
                qs = qs.filter(**{key: p[key]})
        if "contract_id" in p:
            qs = qs.filter(invoice__contract_id=p["contract_id"])
        if "invoice_status" in p:
            qs = qs.filter(invoice__status=p["invoice_status"])
        if p.get("search"):
            text = p["search"]
            qs = qs.filter(Q(contractor__name__icontains=text) | Q(invoice__invoice_number__icontains=text)
                           | Q(reference_number__icontains=text) | Q(notes__icontains=text))
        return dates(qs, "date", p)

    def filter_lines(self):
        p = self.parameters
        invoices = self.filter_invoices({key: value for key, value in p.items() if key != "search"})
        qs = self.lines.filter(invoice_id__in=invoices.values("pk"))
        if "invoice_id" in p:
            qs = qs.filter(invoice_id=p["invoice_id"])
        if p.get("service_type"):
            qs = qs.filter(service_type__iexact=p["service_type"])
        if p.get("search"):
            qs = qs.filter(Q(service_type__icontains=p["search"]) | Q(description__icontains=p["search"]))
        return qs

    def financial_contractors(self, qs):
        recognized = self.invoices.exclude(status="draft")
        return qs.annotate(
            invoiced=correlated_sum(recognized, "contractor_id", "total_amount"),
            paid=correlated_sum(self.payments, "contractor_id", "amount"),
        ).annotate(balance=Greatest(F("invoiced") - F("paid"), Value(ZERO), output_field=MONEY))

    def financial_contracts(self, qs):
        return qs.annotate(invoiced=correlated_sum(self.invoices.exclude(status="draft"), "contract_id", "total_amount"))

    def invoice_totals(self, qs):
        recognized = qs.exclude(status="draft")
        remaining = Greatest(F("total_amount") - F("amount_paid"), Value(ZERO), output_field=MONEY)
        aggregates = qs.aggregate(count=Count("pk"), face_value=Sum("total_amount", output_field=MONEY),
                                  draft_count=Count("pk", filter=Q(status="draft")),
                                  draft_face_value=Sum("total_amount", filter=Q(status="draft"), output_field=MONEY))
        totals = recognized.aggregate(count=Count("pk"), charges=Sum("total_amount", output_field=MONEY),
            paid=Sum("amount_paid", output_field=MONEY), remaining=Sum(remaining, output_field=MONEY),
            open_count=Count("pk", filter=Q(status__in=["approved", "partially_paid"])))
        return {"count": aggregates["count"], "face_value_including_drafts": money(aggregates["face_value"]),
                "draft_count": aggregates["draft_count"], "draft_face_value": money(aggregates["draft_face_value"]),
                "recognized_count": totals["count"], "recognized_charges": money(totals["charges"]),
                "current_capped_paid": money(totals["paid"]), "current_remaining": money(totals["remaining"]),
                "open_count": totals["open_count"],
                "all_date_linked_payments": money(total(self.payments.filter(invoice_id__in=qs.values("pk")), "amount"))}

    def invoice_statuses(self, qs):
        return [{"status": row["status"], "count": row["count"], "face_value": money(row["amount"])}
                for row in qs.order_by("status").values("status").annotate(count=Count("pk"), amount=Sum("total_amount", output_field=MONEY))]

    def contract_statuses(self, qs):
        return [{"status": row["status"], "count": row["count"], "agreement_value": money(row["amount"])}
                for row in qs.order_by("status").values("status").annotate(count=Count("pk"), amount=Sum("contract_value", output_field=MONEY))]

    def payment_methods(self, qs):
        return [{"payment_method": row["payment_method"], "count": row["count"], "amount": money(row["amount"])}
                for row in qs.order_by("payment_method").values("payment_method").annotate(count=Count("pk"), amount=Sum("amount", output_field=MONEY))]

    def ledger(self, contractor_id):
        invoices = self.invoices.filter(contractor_id=contractor_id).exclude(status="draft")
        payments = self.payments.filter(contractor_id=contractor_id)
        p = self.parameters
        ranged_invoices, ranged_payments = dates(invoices, "invoice_date", p), dates(payments, "date", p)
        invoice_events = ranged_invoices.order_by().annotate(
            event_date=F("invoice_date"), event_type=Value("invoice"), event_id=F("pk"),
            label=Case(When(invoice_number="", then=Concat(Value("CINV-"), Cast("pk", CharField()))), default=F("invoice_number"), output_field=CharField()),
            debit=F("total_amount"), credit=Value(ZERO, output_field=MONEY), event_status=F("status"),
        ).values("event_date", "event_type", "event_id", "label", "debit", "credit", "event_status")
        method_label = Case(*[When(payment_method=key, then=Value(label)) for key, label in ContractorPayment.PAYMENT_METHOD_CHOICES], default=F("payment_method"), output_field=CharField())
        payment_events = ranged_payments.order_by().annotate(
            event_date=F("date"), event_type=Value("payment"), event_id=F("pk"),
            label=Case(When(reference_number="", then=method_label), default=F("reference_number"), output_field=CharField()),
            debit=Value(ZERO, output_field=MONEY), credit=F("amount"), event_status=Value("paid"),
        ).values("event_date", "event_type", "event_id", "label", "debit", "credit", "event_status")
        events = invoice_events.union(payment_events, all=True)
        page, size = p.get("page", 1), p.get("page_size", 15)
        descending = p.get("order", "ascending") == "descending"
        ordering = ["event_date", "event_type", "event_id"]
        count = events.count()
        rows = list(events.order_by(*[("-" if descending else "") + key for key in ordering])[(page - 1) * size:page * size])
        canonical = sorted(rows, key=lambda row: (row["event_date"], row["event_type"], row["event_id"]))
        if canonical:
            first = canonical[0]
            same_invoice = Q(invoice_date=first["event_date"])
            same_payment = Q(date=first["event_date"])
            if first["event_type"] == "invoice":
                same_invoice &= Q(pk__lt=first["event_id"])
                same_payment &= Q(pk__in=[])
            else:
                same_payment &= Q(pk__lt=first["event_id"])
            before_invoices = invoices.filter(Q(invoice_date__lt=first["event_date"]) | same_invoice)
            before_payments = payments.filter(Q(date__lt=first["event_date"]) | same_payment)
            running = total(before_invoices, "total_amount") - total(before_payments, "amount")
            for row in canonical:
                running += Decimal(row["debit"]) - Decimal(row["credit"])
                row["running_balance"] = money(running)
        opening = (total(invoices.filter(invoice_date__lt=p["date_from"]), "total_amount")
                   - total(payments.filter(date__lt=p["date_from"]), "amount")) if "date_from" in p else ZERO
        debits, credits = total(ranged_invoices, "total_amount"), total(ranged_payments, "amount")
        current_invoiced, current_paid = total(invoices, "total_amount"), total(payments, "amount")
        return {"results": [{"date": row["event_date"].isoformat(), "type": row["event_type"], "id": row["event_id"],
                             "label": row["label"], "status": row["event_status"], "debit": money(row["debit"]),
                             "credit": money(row["credit"]), "running_balance": row["running_balance"]} for row in rows],
                "pagination": {"page": page, "page_size": size, "total": count, "has_more": page * size < count},
                "range": {"invoice_count": ranged_invoices.count(), "payment_count": ranged_payments.count(),
                          "opening_reconstructed": money(opening), "invoice_debits": money(debits),
                          "payment_credits": money(credits), "closing_reconstructed": money(opening + debits - credits)},
                "current": {"total_invoiced": money(current_invoiced), "total_paid": money(current_paid),
                            "outstanding_balance": money(max(current_invoiced - current_paid, ZERO))}}

    # AI reporting: existing financial semantics, aggregated in the database.
    def summary(self):
        q, p = self, self.parameters
        providers = q.filter_contractors()
        invoices = q.invoices.filter(contractor_id__in=providers.values("pk"))
        payments = q.payments.filter(contractor_id__in=providers.values("pk"))
        contracts = q.contracts.filter(contractor_id__in=providers.values("pk"))
        current_providers = q.financial_contractors(providers)
        charges = total(invoices.exclude(status="draft"), "total_amount")
        paid = total(payments, "amount")
        current = {"total_invoiced": money(charges), "total_paid": money(paid), "outstanding_balance": money(max(charges - paid, ZERO)),
                   "sum_contractor_balances": money(total(current_providers, "balance")),
                   "positive_balance_contractors": current_providers.filter(balance__gt=0).count(),
                   "recognized_invoice_balances": q.invoice_totals(invoices)["current_remaining"]}
        period_invoices, period_payments = dates(invoices, "invoice_date", p), dates(payments, "date", p)
        period_contracts = dates(contracts, "start_date", p)
        counts = providers.aggregate(total=Count("pk"), active=Count("pk", filter=Q(is_active=True)))
        recognized_charges = total(period_invoices.exclude(status="draft"), "total_amount")
        disbursements = total(period_payments, "amount")
        invoice_counts = period_invoices.aggregate(total=Count("pk"), recognized=Count("pk", filter=~Q(status="draft")),
            drafts=Count("pk", filter=Q(status="draft")), draft_value=Sum("total_amount", filter=Q(status="draft"), output_field=MONEY))
        return {
                "contractors": {"count": counts["total"], "active": counts["active"], "inactive": counts["total"] - counts["active"]},
                "activity": {"contract_count": period_contracts.count(), "agreement_value": money(total(period_contracts, "contract_value")),
                             "invoice_count_including_drafts": invoice_counts["total"], "recognized_invoice_count": invoice_counts["recognized"],
                             "draft_invoice_count": invoice_counts["drafts"], "draft_face_value": money(invoice_counts["draft_value"]),
                             "recognized_charges": money(recognized_charges),
                             "payment_count": period_payments.count(), "recorded_payments": money(disbursements),
                             "net_activity": money(recognized_charges - disbursements),
                             "invoice_statuses": q.invoice_statuses(period_invoices),
                             "contract_statuses": q.contract_statuses(period_contracts),
                             "payment_methods": q.payment_methods(period_payments)},
                "current": current}

    # AI reporting: existing financial semantics, aggregated in the database.
    def contracts_summary(self):
        q, p = self, self.parameters
        contracts = q.filter_contracts()
        return {
                "count": contracts.count(), "agreement_value": money(total(contracts, "contract_value")),
                "open_ended_count": contracts.filter(end_date__isnull=True).count(),
                "by_status": q.contract_statuses(contracts),
                "current_linked_invoices": q.invoice_totals(q.invoices.filter(contract_id__in=contracts.values("pk")))}

    # AI reporting: existing financial semantics, aggregated in the database.
    def invoices_summary(self):
        q, p = self, self.parameters
        invoices = q.filter_invoices()
        lines = q.lines.filter(invoice_id__in=invoices.exclude(status="draft").values("pk"))
        groups = lines.order_by().values("service_type").annotate(count=Count("pk"), amount=Sum("total_price", output_field=MONEY))
        top = list(groups.order_by("-amount", "service_type")[:10])
        return {
                "totals": q.invoice_totals(invoices), "by_status": q.invoice_statuses(invoices),
                "service_types": {"groups": [{"service_type": r["service_type"], "line_count": r["count"], "recognized_charges": money(r["amount"])} for r in top],
                                  "total_groups": groups.count(), "other_charges": money(total(lines, "total_price") - sum((r["amount"] for r in top), ZERO))}}

    # AI reporting: existing financial semantics, aggregated in the database.
    def payments_summary(self):
        q, p = self, self.parameters
        payments = q.filter_payments()
        statuses = payments.order_by("invoice__status").values("invoice__status").annotate(count=Count("pk"), amount=Sum("amount", output_field=MONEY))
        return {
                "count": payments.count(), "recorded_payments": money(total(payments, "amount")),
                "contractor_count": payments.values("contractor_id").distinct().count(),
                "invoice_count": payments.values("invoice_id").distinct().count(), "by_method": q.payment_methods(payments),
                "by_current_invoice_status": [{"status": row["invoice__status"], "count": row["count"], "amount": money(row["amount"])} for row in statuses]}

    def invoice_audits(self, invoice_id):
        """AI reporting: invoice-only authorized audit context, scoped twice."""
        from audit.constants import AuditModule
        from audit.models import AuditLog
        return AuditLog.objects.filter(**self.scope, module=AuditModule.CONTRACTORS,
            object_type="ContractorInvoice", object_id=str(invoice_id),
            object_id__in=self.invoices.annotate(text_id=Cast("pk", CharField())).values("text_id"))

    def profile_detail(self, contractor_id):
        """AI reporting: current profile and all-date financial relation counts."""
        row = self.financial_contractors(self.contractors).get(pk=contractor_id)
        return row, {"contract_count": self.contracts.filter(contractor_id=row.pk).count(),
            "invoice_totals": self.invoice_totals(self.invoices.filter(contractor_id=row.pk)),
            "payment_count": self.payments.filter(contractor_id=row.pk).count()}

    def agreement_detail(self, contract_id):
        """AI reporting: agreement with current all-date invoice totals."""
        row = self.financial_contracts(self.contracts).select_related("contractor", "created_by").get(pk=contract_id)
        return row, self.invoice_totals(self.invoices.filter(contract_id=row.pk))

    def invoice_detail(self, invoice_id):
        """AI reporting: one scoped invoice and independently bounded relations."""
        row = self.invoices.select_related("contractor", "contract", "created_by").get(pk=invoice_id)
        return row, {
            "lines": self.lines.filter(invoice_id=row.pk).select_related("invoice", "invoice__contractor"),
            "payments": self.payments.filter(invoice_id=row.pk).select_related("invoice", "contractor", "created_by"),
            "attachments": self.attachments.filter(invoice_id=row.pk).select_related("uploaded_by"),
            "audit_changes": self.invoice_audits(row.pk)}
