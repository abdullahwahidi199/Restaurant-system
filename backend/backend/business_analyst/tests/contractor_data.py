"""Synthetic contractor fixtures; mutation services are used only to arrange tests."""
from decimal import Decimal
from contractors.models import Contractor, ContractorInvoiceAttachment, ServiceContract
from contractors.services import create_contractor_invoice, create_contractor_payment
from audit.models import AuditLog
from audit.constants import AuditModule, AuditAction


def create_data(restaurant, branch, actor):
    alpha = Contractor.objects.create(restaurant=restaurant, branch=branch, name="Alpha Services", contact_person="Synthetic Contact", phone="0700000100", notes="Synthetic profile")
    beta = Contractor.objects.create(restaurant=restaurant, branch=branch, name="Beta Repairs")
    gamma = Contractor.objects.create(restaurant=restaurant, branch=branch, name="Gamma Credit")
    agreements = {}
    for key, provider, status, value, start in (
        ("completed", alpha, "completed", "1000", "2025-12-01"),
        ("active", alpha, "active", "500", "2026-01-15"),
        ("cancelled", alpha, "cancelled", "0", "2026-01-01"),
        ("draft", beta, "draft", "300", "2026-01-05"),
        ("expired", gamma, "expired", "200", "2026-01-01"),
    ):
        agreements[key] = ServiceContract.objects.create(restaurant=restaurant, branch=branch, contractor=provider,
            title=f"Synthetic {status} agreement", status=status, contract_value=value, start_date=start, created_by=actor)
    def invoice(provider, number, amount, day, agreement=None, draft=False, lines=None):
        return create_contractor_invoice({"contractor": provider.pk, "contract": agreement.pk if agreement else None,
            "invoice_number": number, "invoice_date": day, "due_date": "2026-02-15", "status": "draft" if draft else "approved",
            "lines": lines or [{"service_type": "Maintenance", "description": "Synthetic repair", "quantity": "1", "unit_price": amount}]}, restaurant, branch, actor)
    january = invoice(alpha, "ALPHA-JAN", "100", "2026-01-02", agreements["completed"], lines=[
        {"service_type": "Maintenance", "description": "Synthetic repair", "quantity": "2", "unit_price": "40"},
        {"service_type": "Cleaning", "description": "Synthetic cleaning", "quantity": "1", "unit_price": "20"}])
    old = invoice(alpha, "ALPHA-OLD", "40", "2025-12-10")
    draft = invoice(alpha, "ALPHA-DRAFT", "70", "2026-01-12", agreements["active"], draft=True)
    zero = invoice(alpha, "", "0", "2026-01-15")
    paid = invoice(alpha, "ALPHA-PAID", "50", "2026-01-20", agreements["completed"])
    future = invoice(alpha, "ALPHA-FUTURE", "25", "2026-01-25", agreements["active"])
    beta_invoice = invoice(beta, "BETA-JAN", "200", "2026-01-15", agreements["draft"])
    credit_invoice = invoice(gamma, "GAMMA-CREDIT", "20", "2026-01-04", agreements["expired"])
    def pay(provider, target, amount, day, method="cash"):
        return create_contractor_payment({"contractor": provider.pk, "invoice": target.pk, "amount": amount,
                                          "date": day, "payment_method": method}, restaurant, branch, actor)
    pay(alpha, january, "30", "2026-01-10")
    pay(alpha, january, "20", "2026-02-10", "bank_transfer")
    pay(alpha, paid, "50", "2026-02-01", "card")
    pay(alpha, future, "10", "2030-01-01", "mobile_money")
    pay(beta, beta_invoice, "20", "2026-01-16", "bank_transfer")
    pay(gamma, credit_invoice, "20", "2026-01-05")
    # Reproduce retained payments after a legacy charge revision, without changing
    # application calculations or relaxing write-service validation.
    line = credit_invoice.lines.get()
    line.unit_price = Decimal("10")
    line.save()
    credit_invoice.refresh_totals_and_status()
    beta.is_active = False
    beta.save(update_fields=["is_active"])
    attachment = ContractorInvoiceAttachment.objects.create(restaurant=restaurant, branch=branch, invoice=january,
        file="synthetic/proof.pdf", original_filename="proof.pdf", content_type="application/pdf", file_size=100, uploaded_by=actor)
    AuditLog.objects.create(restaurant=restaurant, branch=branch, user=actor.user, module=AuditModule.CONTRACTORS,
        action=AuditAction.CREATE, object_type="ContractorInvoice", object_id=str(january.pk),
        description="Synthetic creation", new_values={"total_amount": "100.00"})
    return {"alpha": alpha, "beta": beta, "gamma": gamma, "agreements": agreements,
            "january": january, "old": old, "draft_invoice": draft, "zero": zero, "paid": paid,
            "future": future, "beta_invoice": beta_invoice, "credit_invoice": credit_invoice, "attachment": attachment}
