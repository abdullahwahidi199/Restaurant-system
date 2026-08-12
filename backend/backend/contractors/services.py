from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import (
    Contractor,
    ContractorInvoice,
    ContractorInvoiceLine,
    ContractorPayment,
    ServiceContract,
)


MONEY_QUANT = Decimal("0.01")


def _decimal(value, default="0"):
    if value in [None, ""]:
        return Decimal(default)
    return Decimal(str(value))


def _money(value):
    return _decimal(value).quantize(MONEY_QUANT)


def _contractor_for_invoice(contractor_id, restaurant, branch):
    if not contractor_id:
        raise ValueError("Contractor is required.")

    try:
        return Contractor.objects.get(
            id=contractor_id,
            restaurant=restaurant,
            branch=branch,
            is_active=True,
        )
    except Contractor.DoesNotExist as exc:
        raise ValueError("Contractor not found for this branch.") from exc


def _contract_for_invoice(contract_id, contractor, restaurant, branch):
    if not contract_id:
        return None

    try:
        return ServiceContract.objects.get(
            id=contract_id,
            contractor=contractor,
            restaurant=restaurant,
            branch=branch,
        )
    except ServiceContract.DoesNotExist as exc:
        raise ValueError("Service contract not found for this contractor.") from exc


def _invoice_lines_from_payload(data):
    raw_lines = data.get("lines")

    if not raw_lines:
        raw_lines = [
            {
                "service_type": data.get("service_type") or "Maintenance",
                "description": data.get("description") or "Contractor service",
                "quantity": 1,
                "unit_price": data.get("total_amount") or data.get("amount") or 0,
            }
        ]

    lines = []
    for index, line in enumerate(raw_lines, start=1):
        service_type = (line.get("service_type") or "Maintenance").strip()
        description = (line.get("description") or service_type).strip()
        quantity = _decimal(line.get("quantity"), default="1")
        unit_price = _decimal(line.get("unit_price"))

        if not service_type:
            raise ValueError(f"Line {index}: service type is required.")
        if not description:
            raise ValueError(f"Line {index}: description is required.")
        if quantity <= 0:
            raise ValueError(f"Line {index}: quantity must be greater than zero.")
        if unit_price < 0:
            raise ValueError(f"Line {index}: unit price cannot be negative.")

        lines.append(
            {
                "service_type": service_type,
                "description": description,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": _money(quantity * unit_price),
            }
        )

    if not lines:
        raise ValueError("At least one invoice line is required.")

    return lines


@transaction.atomic
def create_contractor_invoice(data, restaurant, branch, created_by=None):
    if not branch:
        raise ValueError("An active branch is required to create a contractor invoice.")

    contractor = _contractor_for_invoice(data.get("contractor"), restaurant, branch)
    contract = _contract_for_invoice(data.get("contract"), contractor, restaurant, branch)
    lines = _invoice_lines_from_payload(data)
    requested_status = data.get("status")
    is_draft = requested_status == ContractorInvoice.STATUS_DRAFT

    invoice = ContractorInvoice.objects.create(
        restaurant=restaurant,
        branch=branch,
        contractor=contractor,
        contract=contract,
        invoice_number=(data.get("invoice_number") or "").strip(),
        invoice_date=data.get("invoice_date") or timezone.localdate(),
        due_date=data.get("due_date") or None,
        description=(data.get("description") or "").strip(),
        status=ContractorInvoice.STATUS_DRAFT if is_draft else ContractorInvoice.STATUS_APPROVED,
        created_by=created_by,
    )

    for line in lines:
        ContractorInvoiceLine.objects.create(
            invoice=invoice,
            service_type=line["service_type"],
            description=line["description"],
            quantity=line["quantity"],
            unit_price=line["unit_price"],
            total_price=line["total_price"],
        )

    invoice.refresh_totals_and_status(save=True)

    initial_paid = _money(
        data.get("amount_paid")
        if "amount_paid" in data
        else data.get("amount_paid_initial")
    )
    if initial_paid > invoice.total_amount:
        raise ValueError("Initial payment cannot exceed invoice total.")
    if is_draft and initial_paid > 0:
        raise ValueError("Draft invoices cannot receive payments.")

    if not is_draft and initial_paid > 0:
        create_contractor_payment(
            {
                "contractor": contractor.id,
                "invoice": invoice.id,
                "date": data.get("invoice_date"),
                "amount": initial_paid,
                "payment_method": data.get("payment_method") or "cash",
                "reference_number": data.get("payment_reference") or "",
                "notes": "Initial contractor invoice payment.",
            },
            restaurant=restaurant,
            branch=branch,
            created_by=created_by,
        )
    else:
        invoice.refresh_totals_and_status(save=True)

    return (
        ContractorInvoice.objects
        .select_related("contractor", "contract", "branch", "created_by")
        .prefetch_related("lines", "payments", "attachments")
        .get(pk=invoice.pk)
    )


@transaction.atomic
def approve_contractor_invoice(invoice):
    invoice = ContractorInvoice.objects.select_for_update().get(pk=invoice.pk)
    if invoice.status != ContractorInvoice.STATUS_DRAFT:
        return invoice
    invoice.status = ContractorInvoice.STATUS_APPROVED
    invoice.save(update_fields=["status", "updated_at"])
    invoice.refresh_totals_and_status(save=True)
    return invoice


@transaction.atomic
def create_contractor_payment(data, restaurant, branch, created_by=None):
    contractor_id = data.get("contractor")
    invoice_id = data.get("invoice")
    if not contractor_id or not invoice_id:
        raise ValueError("Contractor and invoice are required.")

    try:
        contractor = Contractor.objects.get(
            id=contractor_id,
            restaurant=restaurant,
        )
    except Contractor.DoesNotExist as exc:
        raise ValueError("Contractor not found.") from exc

    try:
        invoice = ContractorInvoice.objects.select_for_update().get(
            id=invoice_id,
            restaurant=restaurant,
            contractor=contractor,
        )
    except ContractorInvoice.DoesNotExist as exc:
        raise ValueError("Contractor invoice not found for this contractor.") from exc

    if branch and invoice.branch_id != branch.id:
        raise ValueError("Contractor invoice belongs to another branch.")

    if invoice.status == ContractorInvoice.STATUS_DRAFT:
        raise ValueError("Draft invoices cannot receive payments.")

    amount = _money(data.get("amount"))
    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")
    if amount > invoice.remaining_balance:
        raise ValueError("Payment amount cannot exceed the remaining balance.")

    payment = ContractorPayment.objects.create(
        restaurant=restaurant,
        branch=invoice.branch,
        contractor=contractor,
        invoice=invoice,
        date=data.get("date") or timezone.localdate(),
        amount=amount,
        payment_method=data.get("payment_method") or "cash",
        reference_number=(data.get("reference_number") or "").strip(),
        notes=(data.get("notes") or "").strip(),
        created_by=created_by,
    )
    return payment


def contractor_ledger(contractor):
    entries = []

    for invoice in contractor.invoices.exclude(status=ContractorInvoice.STATUS_DRAFT).all():
        entries.append(
            {
                "date": invoice.invoice_date,
                "type": "invoice",
                "id": invoice.id,
                "label": invoice.invoice_number or f"CINV-{invoice.id}",
                "debit": Decimal(invoice.total_amount or 0),
                "credit": Decimal("0.00"),
                "status": invoice.status,
            }
        )

    for payment in contractor.payments.all():
        entries.append(
            {
                "date": payment.date,
                "type": "payment",
                "id": payment.id,
                "label": payment.reference_number or payment.get_payment_method_display(),
                "debit": Decimal("0.00"),
                "credit": Decimal(payment.amount or 0),
                "status": "paid",
            }
        )

    entries.sort(key=lambda item: (item["date"], item["type"], item["id"]))

    balance = Decimal("0.00")
    for entry in entries:
        balance += entry["debit"] - entry["credit"]
        entry["debit"] = float(entry["debit"])
        entry["credit"] = float(entry["credit"])
        entry["running_balance"] = float(balance)

    return {
        "contractor": contractor,
        "entries": entries,
        "total_invoiced": contractor.total_invoiced,
        "total_paid": contractor.total_paid,
        "outstanding_balance": contractor.outstanding_balance,
    }
