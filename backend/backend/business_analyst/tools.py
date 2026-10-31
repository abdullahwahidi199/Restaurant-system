"""Business tool contracts, operation permissions, handlers and registration.

Database queries live in their owning Django applications.
"""
from functools import partial, wraps
from types import SimpleNamespace
from django.contrib.auth import get_user_model
from ai_assistant.errors import AssistantError
from contractors.selectors import ContractorQueries, ContractorQueryError, money
from expenses.selectors import ExpenseQueries, ExpenseQueryError
from inventory.selectors import (
    InventoryQueries, InventoryQueryError, authorize_inventory, inventory_operation_views,
    json_values,
)
from .context import principal_for
from .errors import OperationError
from .registry import ToolDefinition


def operation_views(tool_id):
    """Use the actual API policies for every source read by this operation."""
    from contractors import views as c
    from expenses import views as e
    from audit.views import AuditLogListView
    return {
        "list_contractors": (c.ContractorListCreateView, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "get_contractor_details": (c.ContractorRetrieveUpdateView, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls, c.ServiceContractListCreateView),
        "list_service_contracts": (c.ServiceContractListCreateView, c.contractor_invoice_list_create.cls),
        "get_service_contract_details": (c.ServiceContractRetrieveUpdateView, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "list_service_invoices": (c.contractor_invoice_list_create.cls,),
        "get_service_invoice_details": (c.contractor_invoice_detail.cls, c.contractor_payment_list_create.cls, c.contractor_invoice_attachment_list_create.cls, AuditLogListView),
        "list_service_invoice_lines": (c.contractor_invoice_list_create.cls,),
        "list_contractor_payments": (c.contractor_payment_list_create.cls,),
        "get_contractor_ledger": (c.contractor_ledger_view.cls, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "get_contractor_summary": (c.contractor_summary.cls, c.ServiceContractListCreateView, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "get_service_contracts_summary": (c.ServiceContractListCreateView, c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "get_service_invoices_summary": (c.contractor_invoice_list_create.cls, c.contractor_payment_list_create.cls),
        "get_contractor_payments_summary": (c.contractor_payment_list_create.cls, c.contractor_invoice_list_create.cls),
        "list_expenses": (e.expensesApi.cls,),
        "get_expense_details": (e.ExpenseDetailsView,),
        "list_expense_history": (e.ExpenseHistoryApiView,),
        "get_expense_summary": (e.expensesApi.cls,),
        "get_expense_history_summary": (e.ExpenseHistoryApiView,),
    }.get(tool_id, ()) or inventory_operation_views(tool_id)


def authorize_tool(tool_id, context, parameters):
    context.check_deadline()
    principal = context.principal
    if inventory_operation_views(tool_id):
        try:
            authorize_inventory(principal, tool_id)
            return True
        except InventoryQueryError:
            return False
    if not principal.restaurant_id or not principal.branch_id or not principal.staff_id:
        return False
    User = get_user_model()
    try:
        user = User.objects.select_related("staff_profile__restaurant__subscription", "staff_profile__active_branch").get(pk=principal.user_id)
        # Reject stale/forged role, tenant, branch and assignment bindings even
        # when a handler is called outside the batch executor.
        if principal_for(user).binding != principal.binding:
            return False
    except (User.DoesNotExist, AssistantError):
        return False
    request = SimpleNamespace(user=user, method="GET", query_params={})
    views = operation_views(tool_id)
    if not views:
        return False
    for view_class in views:
        view = view_class()
        view.request, view.args, view.kwargs = request, (), {}
        if not all(permission.has_permission(request, view) for permission in view.get_permissions()):
            return False
    return True


def business_tool(handler):
    @wraps(handler)
    def checked(context, parameters):
        if not authorize_tool(handler.__name__, context, parameters):
            raise OperationError("PERMISSION_DENIED")
        try:
            return handler(context, parameters)
        except (ContractorQueryError, ExpenseQueryError, InventoryQueryError) as exc:
            raise OperationError(exc.code) from None
    return checked


def can_read_business_document(principal, document_id):
    # Documentation visibility follows the corresponding operation policy;
    # reading a guide still does not authorize a tool or its individual records.
    from .context import ToolContext
    import time
    policy = {
        "admin_contractors_shared_financial_meaning": "get_contractor_summary",
        "admin_contractors_dashboard": "get_contractor_summary",
        "admin_contractors_profiles": "list_contractors",
        "admin_contractors_service_contracts": "list_service_contracts",
        "admin_contractors_service_invoices": "list_service_invoices",
        "admin_contractors_create_invoice": "list_service_invoices",
        "admin_contractors_payments": "list_contractor_payments",
        "admin_contractors_payables": "get_service_invoices_summary",
        "admin_finance_expenses": "list_expenses",
        "admin_finance_expense_detail_history": "list_expense_history",
    }
    tool_id = policy.get(document_id)
    if document_id.startswith("admin_inventory_"):
        tool_id = {
            "admin_inventory_ingredients": "list_ingredients",
            "admin_inventory_low_stock_alerts": "list_low_stock_ingredients",
            "admin_inventory_stock_movements": "list_stock_movements",
            "admin_inventory_stock_adjustments": "list_stock_movements",
            "admin_inventory_stock_transfers": "list_stock_transfers",
        }.get(document_id, "get_inventory_summary")
    elif document_id.startswith("admin_procurement_"):
        tool_id = "get_procurement_summary"
    return bool(tool_id) and authorize_tool(tool_id, ToolContext(principal, time.monotonic() + 5), {})


def obj(properties, required=None):
    return {"type": "object", "additionalProperties": False,
            "properties": properties, "required": list(properties) if required is None else required}


TEXT = {"type": "string"}
INTEGER = {"type": "integer"}
BOOLEAN = {"type": "boolean"}
AMOUNT = {"type": "string", "pattern": r"^-?\d+\.\d{2}$"}
OPTIONAL_TEXT = {"type": ["string", "null"]}
OPTIONAL_ID = {"type": ["integer", "null"]}
PAGINATION = obj({"page": INTEGER, "page_size": INTEGER, "total": INTEGER, "has_more": BOOLEAN})


def array(item):
    return {"type": "array", "items": item}


COMMON_RECORD = {"id": INTEGER, "created_at": TEXT, "updated_at": TEXT}
CONTRACTOR_RECORD = obj({**COMMON_RECORD, "name": TEXT, "contact_person": TEXT, "phone": TEXT, "email": TEXT,
    "address": TEXT, "notes": TEXT, "is_active": BOOLEAN, "total_invoiced": AMOUNT, "total_paid": AMOUNT, "outstanding_balance": AMOUNT})
CONTRACT_RECORD = obj({**COMMON_RECORD, "contractor_id": INTEGER, "contractor_name": TEXT, "title": TEXT,
    "start_date": TEXT, "end_date": OPTIONAL_TEXT, "agreement_value": AMOUNT, "status": TEXT, "notes": TEXT,
    "created_by_id": OPTIONAL_ID, "created_by_name": OPTIONAL_TEXT, "current_linked_invoiced": AMOUNT})
INVOICE_RECORD = obj({**COMMON_RECORD, "contractor_id": INTEGER, "contractor_name": TEXT,
    "contract_id": OPTIONAL_ID, "contract_title": OPTIONAL_TEXT, "stored_invoice_number": TEXT, "reference": TEXT,
    "invoice_date": TEXT, "due_date": OPTIONAL_TEXT, "description": TEXT, "status": TEXT, "recognized": BOOLEAN,
    "total_amount": AMOUNT, "amount_paid": AMOUNT, "remaining_balance": AMOUNT,
    "created_by_id": OPTIONAL_ID, "created_by_name": OPTIONAL_TEXT})
PAYMENT_RECORD = obj({**COMMON_RECORD, "contractor_id": INTEGER, "contractor_name": TEXT, "invoice_id": INTEGER,
    "invoice_reference": TEXT, "date": TEXT, "amount": AMOUNT, "payment_method": TEXT, "reference_number": TEXT,
    "notes": TEXT, "created_by_id": OPTIONAL_ID, "created_by_name": OPTIONAL_TEXT})
LINE_RECORD = obj({"id": INTEGER, "invoice_id": INTEGER, "invoice_reference": TEXT, "invoice_date": TEXT,
    "contractor_id": INTEGER, "contractor_name": TEXT, "invoice_status": TEXT, "recognized": BOOLEAN,
    "service_type": TEXT, "description": TEXT, "quantity": AMOUNT, "unit_price": AMOUNT, "total_price": AMOUNT})
ATTACHMENT_RECORD = obj({"id": INTEGER, "original_filename": TEXT, "content_type": TEXT, "file_size": INTEGER,
    "file_type": TEXT, "uploaded_at": TEXT, "uploaded_by_id": OPTIONAL_ID, "uploaded_by_name": OPTIONAL_TEXT,
    "authenticated_download_path": TEXT})
# Audit JSON is historical context with arbitrary application-defined change fields.
AUDIT_RECORD = obj({"id": INTEGER, "action": TEXT, "created_at": TEXT, "description": TEXT,
                    "old_values": {"type": "object"}, "new_values": {"type": "object"}})
INVOICE_TOTALS = obj({"count": INTEGER, "face_value_including_drafts": AMOUNT, "draft_count": INTEGER,
    "draft_face_value": AMOUNT, "recognized_count": INTEGER, "recognized_charges": AMOUNT,
    "current_capped_paid": AMOUNT, "current_remaining": AMOUNT, "open_count": INTEGER, "all_date_linked_payments": AMOUNT})
INVOICE_STATUSES = array(obj({"status": TEXT, "count": INTEGER, "face_value": AMOUNT}))
CONTRACT_STATUSES = array(obj({"status": TEXT, "count": INTEGER, "agreement_value": AMOUNT}))
PAYMENT_METHODS = array(obj({"payment_method": TEXT, "count": INTEGER, "amount": AMOUNT}))
CURRENT_ACCOUNT = obj({"total_invoiced": AMOUNT, "total_paid": AMOUNT, "outstanding_balance": AMOUNT})


def paged(record):
    return obj({"results": array(record), "pagination": PAGINATION})


def envelope(fields):
    return obj({"scope": {"const": "trusted_active_branch"}, "currency": {"const": "AFN"}, "date_basis": TEXT, "period": obj({"from": OPTIONAL_TEXT, "to": OPTIONAL_TEXT}),
                "balance_basis": TEXT, **fields})


def metadata(p, date_basis, balance_basis="Current stored records, including all recorded payment dates; not a historical snapshot."):
    return {"scope": "trusted_active_branch", "currency": "AFN", "date_basis": date_basis, "period": {"from": p.get("date_from"), "to": p.get("date_to")},
            "balance_basis": balance_basis}


def page(qs, p, serialize, default_order, sort_map=None, page_key="page"):
    page_number, page_size = p.get(page_key, 1), p.get("page_size", 15)
    order = (sort_map or {}).get(p.get("sort"), default_order)
    count = qs.count()
    rows = qs.order_by(*order)[(page_number - 1) * page_size:page_number * page_size]
    return {"results": [serialize(row) for row in rows],
            "pagination": {"page": page_number, "page_size": page_size, "total": count, "has_more": page_number * page_size < count}}


def record_common(row):
    return {"id": row.pk, "created_at": row.created_at.isoformat(), "updated_at": row.updated_at.isoformat()}


def actor(row):
    # Malformed legacy actor links must not reveal another tenant's staff name.
    person = row.created_by
    return {"created_by_id": person.pk if person and person.restaurant_id == row.restaurant_id else None,
            "created_by_name": person.name if person and person.restaurant_id == row.restaurant_id else None}


def contractor_record(row):
    return {**record_common(row), **{key: getattr(row, key) for key in
            ("name", "contact_person", "phone", "email", "address", "notes", "is_active")},
            "total_invoiced": money(row.invoiced), "total_paid": money(row.paid), "outstanding_balance": money(row.balance)}


def contract_record(row):
    return {**record_common(row), **actor(row), "contractor_id": row.contractor_id, "contractor_name": row.contractor.name,
            "title": row.title, "start_date": row.start_date.isoformat(), "end_date": row.end_date.isoformat() if row.end_date else None,
            "agreement_value": money(row.contract_value), "status": row.status, "notes": row.notes,
            "current_linked_invoiced": money(row.invoiced)}


def reference(invoice):
    return invoice.invoice_number or f"CINV-{invoice.pk}"


def invoice_record(row):
    return {**record_common(row), **actor(row), "contractor_id": row.contractor_id, "contractor_name": row.contractor.name,
            "contract_id": row.contract_id, "contract_title": row.contract.title if row.contract_id else None,
            "stored_invoice_number": row.invoice_number, "reference": reference(row), "invoice_date": row.invoice_date.isoformat(),
            "due_date": row.due_date.isoformat() if row.due_date else None, "description": row.description,
            "status": row.status, "recognized": row.status != "draft", "total_amount": money(row.total_amount),
            "amount_paid": money(row.amount_paid), "remaining_balance": money(row.remaining_balance)}


def payment_record(row):
    return {**record_common(row), **actor(row), "contractor_id": row.contractor_id, "contractor_name": row.contractor.name,
            "invoice_id": row.invoice_id, "invoice_reference": reference(row.invoice), "date": row.date.isoformat(),
            "amount": money(row.amount), "payment_method": row.payment_method, "reference_number": row.reference_number, "notes": row.notes}


def line_record(row):
    return {"id": row.pk, "invoice_id": row.invoice_id, "invoice_reference": reference(row.invoice),
            "invoice_date": row.invoice.invoice_date.isoformat(), "contractor_id": row.invoice.contractor_id,
            "contractor_name": row.invoice.contractor.name, "invoice_status": row.invoice.status, "recognized": row.invoice.status != "draft",
            "service_type": row.service_type, "description": row.description, "quantity": money(row.quantity),
            "unit_price": money(row.unit_price), "total_price": money(row.total_price)}


CONTRACTOR_SORTS = {"name": ("name", "pk"), "-name": ("-name", "-pk"), "created_at": ("created_at", "pk"),
                    "-created_at": ("-created_at", "-pk"), "balance": ("balance", "pk"), "-balance": ("-balance", "-pk")}
CONTRACT_SORTS = {key: (key, "pk") for key in ("start_date", "-start_date", "end_date", "-end_date", "title", "-title", "contract_value", "-contract_value")}
INVOICE_SORTS = {key: (key, "pk") for key in ("invoice_date", "-invoice_date", "due_date", "-due_date", "total_amount", "-total_amount", "invoice_number", "-invoice_number")}
PAYMENT_SORTS = {key: (key, "pk") for key in ("date", "-date", "amount", "-amount", "created_at", "-created_at")}
LINE_SORTS = {key: (key, "pk") for key in ("id", "-id", "service_type", "-service_type", "quantity", "-quantity", "total_price", "-total_price")}
LINE_SORTS.update({"invoice_date": ("invoice__invoice_date", "pk"), "-invoice_date": ("-invoice__invoice_date", "-pk")})


@business_tool
def list_contractors(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    qs = q.financial_contractors(q.filter_contractors())
    return {**metadata(p, "No directory date filter; account totals are all-time."),
            **page(qs, p, contractor_record, ("name", "pk"), CONTRACTOR_SORTS)}


@business_tool
def get_contractor_details(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    row, details = q.profile_detail(p["contractor_id"])
    return {**metadata(p, "All-time contractor account."), "contractor": contractor_record(row),
            **details}


@business_tool
def list_service_contracts(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    qs = q.financial_contracts(q.filter_contracts()).select_related("contractor", "created_by")
    return {**metadata(p, "Inclusive service contract start_date; linked invoiced amounts use all invoice dates."),
            **page(qs, p, contract_record, ("-start_date", "-created_at", "-pk"), CONTRACT_SORTS)}


@business_tool
def get_service_contract_details(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    row, totals = q.agreement_detail(p["contract_id"])
    return {**metadata(p, "Agreement dates are configuration; all-time current linked invoices."),
            "contract": contract_record(row), "linked_invoice_totals": totals}


@business_tool
def list_service_invoices(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    qs = q.filter_invoices().select_related("contractor", "contract", "created_by")
    return {**metadata(p, "Inclusive invoice_date; due_from/due_to additionally filter due_date."),
            **page(qs, p, invoice_record, ("-invoice_date", "-created_at", "-pk"), INVOICE_SORTS)}


@business_tool
def list_service_invoice_lines(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    qs = q.filter_lines().select_related("invoice", "invoice__contractor")
    return {**metadata(p, "Inclusive parent invoice_date; status filters parent invoice status."),
            **page(qs, p, line_record, ("pk",), LINE_SORTS)}


@business_tool
def list_contractor_payments(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    qs = q.filter_payments().select_related("contractor", "invoice", "created_by")
    return {**metadata(p, "Inclusive payment date; amounts are individual recorded disbursements, not invoice charges."),
            **page(qs, p, payment_record, ("-date", "-created_at", "-pk"), PAYMENT_SORTS)}


@business_tool
def get_service_invoice_details(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    row, related = q.invoice_detail(p["invoice_id"])
    def attachment(item):
        actor = item.uploaded_by
        allowed = actor and actor.restaurant_id == row.restaurant_id
        return {"id": item.pk, "original_filename": item.original_filename, "content_type": item.content_type,
                "file_size": item.file_size, "file_type": item.file_type, "uploaded_at": item.uploaded_at.isoformat(),
                "uploaded_by_id": actor.pk if allowed else None, "uploaded_by_name": actor.name if allowed else None,
                "authenticated_download_path": f"/api/contractors/invoices/{row.pk}/attachments/{item.pk}/download/"}
    def audit(item):
        return {"id": item.pk, "action": item.action, "created_at": item.created_at.isoformat(), "description": item.description,
                "old_values": item.old_values, "new_values": item.new_values}
    return {**metadata(p, "Current invoice with all-date related histories; each history is independently paginated."),
            "invoice": invoice_record(row),
            "lines": page(related["lines"], p, line_record, ("pk",), page_key="lines_page"),
            "payments": page(related["payments"], p, payment_record, ("-date", "-created_at", "-pk"), page_key="payments_page"),
            "attachments": page(related["attachments"], p, attachment, ("-uploaded_at", "-pk"), page_key="attachments_page"),
            "audit_changes": page(related["audit_changes"], p, audit, ("-created_at", "-pk"), page_key="audit_page")}


@business_tool
def get_contractor_ledger(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    return {**metadata(p, "Invoices on invoice_date, payments on date, invoices before payments on equal dates.",
                      "Signed balances reconstructed from current non-draft invoices and current payment records, not historical snapshots; current outstanding is separately floored at zero."),
            "contractor_id": p["contractor_id"], **q.ledger(p["contractor_id"])}


@business_tool
def get_contractor_summary(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    return {**metadata(p, "Period: contract start_date, invoice invoice_date, payment date; directory and current balances ignore date bounds."), **q.summary()}


@business_tool
def get_service_contracts_summary(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    return {**metadata(p, "Inclusive contract start_date; linked invoice totals ignore invoice date and include current settlement."), **q.contracts_summary()}


@business_tool
def get_service_invoices_summary(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    return {**metadata(p, "Inclusive invoice_date cohort; current_capped_paid/current_remaining use all payment dates, not period cash or past balances."), **q.invoices_summary()}


@business_tool
def get_contractor_payments_summary(context, p):
    q = ContractorQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)
    return {**metadata(p, "Inclusive payment date; recorded transactions do not independently prove bank or cash reconciliation."), **q.payments_summary()}


def identifier(description):
    return {"type": "integer", "minimum": 1, "description": description}


def choice(values, description):
    return {"type": "string", "enum": list(values), "description": description}


def date_filter(description):
    return {"type": "string", "pattern": r"^\d{4}-\d{2}-\d{2}$", "description": description + "; YYYY-MM-DD, inclusive, omitted means unbounded."}


CONTRACTOR_ID = identifier("One authorized contractor; omit for all contractors in the trusted active branch.")
SEARCH = {"type": "string", "minLength": 1, "maxLength": 120}
PAGING = {"page": {"type": "integer", "minimum": 1, "maximum": 10000, "default": 1},
          "page_size": {"type": "integer", "minimum": 1, "maximum": 50, "default": 15}}
CONTRACTOR_FILTERS = {"contractor_id": CONTRACTOR_ID, "is_active": {"type": "boolean"},
                      "search": {**SEARCH, "description": "Name, contact person, phone or email substring."}}
CONTRACT_FILTERS = {"contractor_id": CONTRACTOR_ID,
    "status": choice(["draft", "active", "completed", "cancelled", "expired"], "Stored contract state; end dates do not automatically expire agreements."),
    "open_ended": {"type": "boolean", "description": "True: no end date; false: an end date is stored."},
    "search": {**SEARCH, "description": "Title, contractor name or notes substring."},
    "date_from": date_filter("Contract start_date lower bound"), "date_to": date_filter("Contract start_date upper bound")}
INVOICE_STATUS = choice(["draft", "approved", "partially_paid", "paid"], "Current invoice settlement state; drafts are excluded from recognized charges/payables.")
INVOICE_FILTERS = {"contractor_id": CONTRACTOR_ID, "contract_id": identifier("One authorized service contract."),
    "status": INVOICE_STATUS, "search": {**SEARCH, "description": "Stored invoice number, contractor, contract title, description or service-line text. Generated CINV labels are display references."},
    "date_from": date_filter("Invoice invoice_date lower bound"), "date_to": date_filter("Invoice invoice_date upper bound"),
    "due_from": date_filter("Additional due_date lower bound; invoices without due dates are excluded"),
    "due_to": date_filter("Additional due_date upper bound; invoices without due dates are excluded")}
PAYMENT_FILTERS = {"contractor_id": CONTRACTOR_ID, "invoice_id": identifier("One authorized invoice."),
    "contract_id": identifier("Payments linked through invoices to one authorized contract."),
    "invoice_status": INVOICE_STATUS,
    "payment_method": choice(["cash", "card", "bank_transfer", "mobile_money", "cheque", "other"], "Recorded payment method, not independently verified bank settlement."),
    "search": {**SEARCH, "description": "Contractor name, stored invoice number, reference or notes substring."},
    "date_from": date_filter("Payment date lower bound"), "date_to": date_filter("Payment date upper bound")}
LINE_FILTERS = {key: value for key, value in INVOICE_FILTERS.items() if key not in {"due_from", "due_to", "search"}}
LINE_FILTERS.update({"invoice_id": identifier("One authorized invoice; omit to list across matching invoices."),
    "service_type": {"type": "string", "minLength": 1, "maxLength": 100, "description": "Case-insensitive exact service type."},
    "search": {**SEARCH, "description": "Line service type or description substring."}})


def listing(filters, sorts):
    return obj({**filters, **PAGING, "sort": choice(sorts, "Whitelisted ordering; a stable ID resolves ties.")}, required=[])


def contractor_definitions():
    shared = "admin_contractors_shared_financial_meaning"
    profiles = "admin_contractors_profiles"
    agreements = "admin_contractors_service_contracts"
    invoices = "admin_contractors_service_invoices"
    payments = "admin_contractors_payments"
    current_summary = obj({**CURRENT_ACCOUNT["properties"], "sum_contractor_balances": AMOUNT,
                           "positive_balance_contractors": INTEGER, "recognized_invoice_balances": AMOUNT})
    detail_pages = {key: {"type": "integer", "minimum": 1, "maximum": 10000, "default": 1}
                    for key in ("lines_page", "payments_page", "attachments_page", "audit_page")}
    specs = [
        (list_contractors, "List contractor contacts and current all-time balances, including inactive providers; no directory date filter.",
         listing(CONTRACTOR_FILTERS, CONTRACTOR_SORTS), envelope(paged(CONTRACTOR_RECORD)["properties"]), (profiles, shared),
         "Paginated contractor contacts/status and complete all-history invoiced, paid and floored outstanding balances for each provider; pagination does not limit account totals."),
        (get_contractor_details, "Get full contractor profile, all-time account totals and related record counts; agreement value is not debt.",
         obj({"contractor_id": CONTRACTOR_ID}), envelope({"contractor": CONTRACTOR_RECORD, "contract_count": INTEGER,
             "invoice_totals": INVOICE_TOTALS, "payment_count": INTEGER}), (profiles, shared),
         "One contractor profile, current all-history recognized invoice charges/payments/balance, contract count, invoice totals including separate drafts and unpaid counts, and payment count."),
        (list_service_contracts, "List agreements using optional start-date bounds; agreement values differ from all-time linked invoice charges.",
         listing(CONTRACT_FILTERS, CONTRACT_SORTS), envelope(paged(CONTRACT_RECORD)["properties"]), (agreements, shared),
         "Paginated agreements with dates, status and contractual value, plus current all-history linked invoiced charges; agreement value is not recognized expense or debt."),
        (get_service_contract_details, "Get full agreement and current all-time linked invoice financial totals, regardless of agreement status or dates.",
         obj({"contract_id": identifier("Authorized service contract ID.")}),
         envelope({"contract": CONTRACT_RECORD, "linked_invoice_totals": INVOICE_TOTALS}), (agreements, invoices),
         "One agreement and current all-history linked invoice counts, recognized/draft amounts, capped paid, remaining balances and payment totals, independent of agreement dates."),
        (list_service_invoices, "List individual invoices by invoice-date cohort, including drafts; Paid/Remaining are current all-date settlement amounts.",
         listing(INVOICE_FILTERS, INVOICE_SORTS), envelope(paged(INVOICE_RECORD)["properties"]), (invoices, shared),
         "Paginated invoices with contractor/contract references, invoice/due dates, status, recognized flag, totals and current cumulative paid/remaining; dates select an invoice cohort."),
        (get_service_invoice_details, "Get full invoice fields and independently paginated lines, all-date payments, attachment metadata and authorized audit changes. No file content.",
         obj({"invoice_id": identifier("Authorized invoice ID."), **detail_pages,
              "page_size": {"type": "integer", "minimum": 1, "maximum": 20, "default": 5}}, required=["invoice_id"]),
         envelope({"invoice": INVOICE_RECORD, "lines": paged(LINE_RECORD), "payments": paged(PAYMENT_RECORD),
                   "attachments": paged(ATTACHMENT_RECORD), "audit_changes": paged(AUDIT_RECORD)}), (invoices, payments),
         "Full invoice and independently paginated service lines, all-date payment rows, attachment metadata/authenticated paths and authorized audit changes; no attachment content."),
        (list_service_invoice_lines, "List rounded service-line records across matching invoices or one invoice; dates/status belong to the parent invoice.",
         listing(LINE_FILTERS, LINE_SORTS), envelope(paged(LINE_RECORD)["properties"]), (invoices, shared),
         "Paginated individual service lines with parent invoice/provider, dates/status, recognized flag, service type, description, quantity, original unit price and rounded line total."),
        (list_contractor_payments, "List individual recorded disbursements by payment date, independent of invoice dates; no implicit month restriction.",
         listing(PAYMENT_FILTERS, PAYMENT_SORTS), envelope(paged(PAYMENT_RECORD)["properties"]), (payments, shared),
         "Paginated individual recorded payments, provider/invoice/contract references, payment dates/methods, amounts and notes; disbursements are not additional invoice expense."),
        (get_contractor_ledger, "Get a paginated contractor ledger: non-draft invoice debits and payment credits, signed running balances; reconstructed from current records, not historical snapshots.",
         obj({"contractor_id": CONTRACTOR_ID, "date_from": date_filter("Transaction date lower bound"),
              "date_to": date_filter("Transaction date upper bound"), **PAGING,
              "order": {"type": "string", "enum": ["ascending", "descending"], "default": "ascending"}}, required=["contractor_id"]),
         envelope({"contractor_id": INTEGER, **paged(obj({"date": TEXT, "type": TEXT, "id": INTEGER, "label": TEXT,
              "status": TEXT, "debit": AMOUNT, "credit": AMOUNT, "running_balance": AMOUNT}))["properties"],
              "range": obj({"invoice_count": INTEGER, "payment_count": INTEGER, "opening_reconstructed": AMOUNT, "invoice_debits": AMOUNT, "payment_credits": AMOUNT, "closing_reconstructed": AMOUNT}),
              "current": CURRENT_ACCOUNT}), (profiles, payments, invoices),
         "Paginated chronological invoice debits/payment credits with signed running balances; range opening, activity and closing reconstruction, counts, and separate current floored account totals."),
        (get_contractor_summary, "Summarize matching contractor accounts: directory counts; period agreement values/start dates, non-draft invoice charges/invoice dates, payments/payment dates; separate all-time current balances. Aggregate net debt can differ from summed provider or invoice balances.",
         obj({**CONTRACTOR_FILTERS, "date_from": date_filter("Activity lower bound on each model's own business date"),
              "date_to": date_filter("Activity upper bound on each model's own business date")}, required=[]),
         envelope({"contractors": obj({"count": INTEGER, "active": INTEGER, "inactive": INTEGER}),
                   "activity": obj({"contract_count": INTEGER, "agreement_value": AMOUNT,
                       "invoice_count_including_drafts": INTEGER, "recognized_invoice_count": INTEGER,
                       "draft_invoice_count": INTEGER, "draft_face_value": AMOUNT,
                       "recognized_charges": AMOUNT, "payment_count": INTEGER, "recorded_payments": AMOUNT, "net_activity": AMOUNT,
                       "invoice_statuses": INVOICE_STATUSES, "contract_statuses": CONTRACT_STATUSES, "payment_methods": PAYMENT_METHODS}),
                   "current": current_summary}),
         (shared, "admin_contractors_dashboard", profiles, "admin_contractors_payables"),
         "Directory counts; period agreement values, recognized invoice charges, separate draft values, payment totals and status/method breakdowns; current all-history net-first debt, summed contractor balances and summed invoice balances for reconciliation."),
        (get_service_contracts_summary, "Aggregate filtered agreements by start_date and stored status; sum agreement values separately from all-time current linked invoice charges and settlement.",
         obj(CONTRACT_FILTERS, required=[]), envelope({"count": INTEGER, "agreement_value": AMOUNT,
              "open_ended_count": INTEGER, "by_status": CONTRACT_STATUSES, "current_linked_invoices": INVOICE_TOTALS}), (agreements, shared),
         "Complete filtered agreement count/value, open-ended count and status breakdown, plus all-history current linked invoice charges, drafts, capped paid and remaining; agreement values stay separate."),
        (get_service_invoices_summary, "Aggregate invoice-date cohorts: counts/statuses, draft face value, recognized charges, current all-date Paid/Remaining and top ten service types. No historical or cash snapshot.",
         obj(INVOICE_FILTERS, required=[]), envelope({"totals": INVOICE_TOTALS, "by_status": INVOICE_STATUSES,
              "service_types": obj({"groups": array(obj({"service_type": TEXT, "line_count": INTEGER, "recognized_charges": AMOUNT})),
                                    "total_groups": INTEGER, "other_charges": AMOUNT})}), (invoices, "admin_contractors_payables", shared),
         "Complete invoice-cohort counts/status amounts, draft face values, recognized charges, current all-date capped paid/remaining, linked payment totals, and top service types with remainder charges."),
        (get_contractor_payments_summary, "Aggregate payment-date disbursements, distinct providers/invoices, payment methods and current invoice states; not service expense or reconciled cash.",
         obj(PAYMENT_FILTERS, required=[]), envelope({"count": INTEGER, "recorded_payments": AMOUNT,
              "contractor_count": INTEGER, "invoice_count": INTEGER, "by_method": PAYMENT_METHODS,
              "by_current_invoice_status": array(obj({"status": TEXT, "count": INTEGER, "amount": AMOUNT}))}), (payments, shared),
         "Complete payment-row count/amount, distinct provider/invoice counts, payment-method and current invoice-status breakdowns; period uses payment dates, not invoice dates."),
    ]
    return tuple(ToolDefinition(id=handler.__name__, description=description, domain="contractors", parameters=parameters,
                                output=output, knowledge_ids=knowledge_ids, authorize=partial(authorize_tool, handler.__name__), handler=handler, returns=returns)
                 for handler, description, parameters, output, knowledge_ids, returns in specs)


EXPENSE_RECORD = obj({"id": INTEGER, "name": TEXT, "amount": AMOUNT, "currency": TEXT,
    "exchange_rate": AMOUNT, "amount_afn": AMOUNT, "date": TEXT, "description": TEXT})
EXPENSE_HISTORY_RECORD = obj({"id": INTEGER, "name": TEXT, "amount": AMOUNT, "currency": TEXT,
    "exchange_rate": AMOUNT, "amount_afn": AMOUNT, "date_time": TEXT, "description": TEXT,
    "action": TEXT, "changed_fields": {"type": ["object", "null"]}})
EXPENSE_SORTS = {key: (key, "pk") for key in
    ("date", "-date", "name", "-name", "amount", "-amount", "amount_afn", "-amount_afn", "id", "-id")}
HISTORY_SORTS = {key: (key, "pk") for key in
    ("date_time", "-date_time", "name", "-name", "amount", "-amount", "amount_afn", "-amount_afn", "action", "-action", "id", "-id")}
EXPENSE_FILTERS = {
    "currency": choice(["AFN", "USD"], "Original recorded currency; all AFN totals include saved conversions."),
    "name": {"type": "string", "minLength": 1, "maxLength": 200, "description": "Case-insensitive exact expense name; not a category or unique record identifier."},
    "search": {**SEARCH, "description": "Expense name or description substring."},
    "date_from": date_filter("Expense date lower bound"), "date_to": date_filter("Expense date upper bound")}
HISTORY_FILTERS = {**EXPENSE_FILTERS,
    "action": choice(["created", "updated", "deleted"], "Recorded audit event action, not an expense status."),
    "date_from": date_filter("Event date_time lower calendar-day bound in the server business timezone"),
    "date_to": date_filter("Event date_time upper calendar-day bound in the server business timezone")}


def expense_envelope(fields):
    return obj({"scope": {"const": "trusted_active_branch"}, "reporting_currency": {"const": "AFN"},
        "date_basis": TEXT, "timezone": TEXT, "period": obj({"from": OPTIONAL_TEXT, "to": OPTIONAL_TEXT}),
        "financial_basis": TEXT, **fields})


def expense_metadata(p, *, history=False, detail=False):
    from django.utils import timezone
    return {"scope": "trusted_active_branch", "reporting_currency": "AFN",
        "date_basis": "Recorded event date_time; inclusive local calendar days." if history else
                      "Current expense record date; inclusive dates." if not detail else "Current expense record date; no history inferred.",
        "timezone": timezone.get_current_timezone_name(), "period": {"from": p.get("date_from"), "to": p.get("date_to")},
        "financial_basis": "Audit snapshots/events only; never additional expense transactions. No expense ID link is recorded." if history else
                           "Saved AFN equivalents of matching current records; omitted dates mean all-time. Original USD amounts are already included in AFN totals; do not add them again. Not a historical snapshot or independently verified cash movement."}


def expense_record(row):
    return {"id": row.pk, "name": row.name, "amount": money(row.amount), "currency": row.currency,
        "exchange_rate": money(row.exchange_rate), "amount_afn": money(row.amount_afn),
        "date": row.date.isoformat(), "description": row.description}


def expense_history_record(row):
    from django.utils import timezone
    return {"id": row.pk, "name": row.name, "amount": money(row.amount), "currency": row.currency,
        "exchange_rate": money(row.exchange_rate), "amount_afn": money(row.amount_afn),
        "date_time": timezone.localtime(row.date_time).isoformat(), "description": row.description,
        "action": row.action, "changed_fields": row.changed_fields}


def expense_queries(context, p):
    return ExpenseQueries(restaurant_id=context.principal.restaurant_id, branch_id=context.principal.branch_id, parameters=p)


@business_tool
def list_expenses(context, p):
    return {**expense_metadata(p), **page(expense_queries(context, p).filtered(), p,
        expense_record, ("-date", "-pk"), EXPENSE_SORTS)}


@business_tool
def get_expense_details(context, p):
    return {**expense_metadata(p, detail=True), "expense": expense_record(expense_queries(context, p).detail(p["expense_id"]))}


@business_tool
def list_expense_history(context, p):
    return {**expense_metadata(p, history=True), **page(expense_queries(context, p).filtered(history=True), p,
        expense_history_record, ("-date_time", "-pk"), HISTORY_SORTS)}


@business_tool
def get_expense_summary(context, p):
    return {**expense_metadata(p), **expense_queries(context, p).summary()}


@business_tool
def get_expense_history_summary(context, p):
    return {**expense_metadata(p, history=True), **expense_queries(context, p).history_summary()}


def expense_definitions():
    expenses = "admin_finance_expenses"
    history = "admin_finance_expense_detail_history"
    def groups(key):
        return obj({"groups": array(obj({key: TEXT, "count": INTEGER, "total_afn": AMOUNT})),
                    "total_groups": INTEGER, "other_count": INTEGER, "other_total_afn": AMOUNT})
    specs = [
        (list_expenses, "List current expense records by expense date, original currency and name/search; saved AFN equivalents, bounded pagination; omitted dates mean all-time.",
         listing(EXPENSE_FILTERS, EXPENSE_SORTS), expense_envelope(paged(EXPENSE_RECORD)["properties"]), (expenses,),
         "Paginated current expense records with original currency/amount, saved exchange rate and AFN equivalent, business date and description; saved conversions are not recomputed."),
        (get_expense_details, "Get one authorized current expense: original amount/currency, saved exchange rate, AFN equivalent, expense date and description. No reliable history-record link exists.",
         obj({"expense_id": identifier("Authorized current expense record ID; obtain from list_expenses or the user.")}),
         expense_envelope({"expense": EXPENSE_RECORD}), (expenses, history),
         "One current expense record with original amount/currency, saved exchange rate, AFN equivalent, date and description; no reliable link to expense-history events."),
        (list_expense_history, "List expense creation/update/deletion snapshots and changed fields by recorded event timestamp in business timezone; audit events are not additional spending and have no expense ID link.",
         listing(HISTORY_FILTERS, HISTORY_SORTS), expense_envelope(paged(EXPENSE_HISTORY_RECORD)["properties"]), (history,),
         "Paginated created/updated/deleted audit snapshots with original and AFN amounts, event timestamps and changed fields; events are not additional spending or reliably linked expense IDs."),
        (get_expense_summary, "Aggregate matching current expenses by expense date: counts, saved AFN totals/statistics, original currency totals, top ten names and latest twelve months with remainder totals. No history sums; USD is included in AFN.",
         obj(EXPENSE_FILTERS, required=[]), expense_envelope({
             "totals": obj({"count": INTEGER, "total_afn": AMOUNT, "average_afn": AMOUNT, "minimum_afn": AMOUNT,
                 "maximum_afn": AMOUNT, "first_expense_date": OPTIONAL_TEXT, "last_expense_date": OPTIONAL_TEXT,
                 "negative_amount_count": INTEGER, "zero_amount_count": INTEGER, "negative_rate_count": INTEGER}),
             "by_currency": array(obj({"currency": TEXT, "count": INTEGER, "original_amount": AMOUNT, "total_afn": AMOUNT})),
             "by_name": groups("name"), "by_month": groups("month")}), (expenses,),
         "Complete current-record counts, AFN total/average/min/max and date bounds; original-currency totals, top names and latest months with remainders. USD is already included in AFN; no audit-snapshot sums."),
        (get_expense_history_summary, "Count audit events by action, original currency and latest twelve event months in business timezone, including first/last timestamps and remaining event counts. Never sum snapshots as expenses.",
         obj(HISTORY_FILTERS, required=[]), expense_envelope({"event_count": INTEGER, "first_event_at": OPTIONAL_TEXT,
             "last_event_at": OPTIONAL_TEXT, "by_action": array(obj({"action": TEXT, "event_count": INTEGER})),
             "by_currency": array(obj({"currency": TEXT, "event_count": INTEGER})),
             "by_month": obj({"groups": array(obj({"month": TEXT, "event_count": INTEGER})),
                              "total_groups": INTEGER, "other_event_count": INTEGER})}), (history,),
         "Event counts and first/last timestamps, action/currency breakdowns and latest event months with remainder counts; audit snapshots are never summed as expenses."),
    ]
    return tuple(ToolDefinition(id=handler.__name__, description=description, domain="finance", parameters=parameters,
        output=output, knowledge_ids=knowledge_ids, authorize=partial(authorize_tool, handler.__name__), handler=handler, returns=returns)
        for handler, description, parameters, output, knowledge_ids, returns in specs)


# Inventory and Procurement contracts and thin handlers stay in this unified file.
# Queries, financial semantics and scope enforcement live in inventory.selectors.
DECIMAL = {"type": "string", "pattern": r"^-?\d+(?:\.\d+)?$"}
NULL_DECIMAL = {"type": ["string", "null"], "pattern": r"^-?\d+(?:\.\d+)?$"}
IP_DATES = {"date": date_filter("One business date; mutually exclusive with range bounds"),
    "date_from": date_filter("Activity lower bound"), "date_to": date_filter("Activity upper bound")}
IP_INGREDIENT = {"ingredient_id": identifier("Ingredient ID in the authorized population."),
    "ingredient_name": {**SEARCH, "description": "Ingredient name substring; detail/profile requires an unambiguous match."}}
IP_SUPPLIER = {"supplier_id": identifier("Supplier ID in the active branch."),
    "supplier_name": {**SEARCH, "description": "Supplier name substring; detail/profile requires an unambiguous match."}}
IP_INVOICE = {"invoice_id": identifier("Purchase invoice ID."),
    "invoice_number": {**SEARCH, "description": "Stored invoice number substring; details require an unambiguous match."}}
IP_STATUS = choice(["draft", "unpaid", "partially_paid", "paid"], "Stored invoice status; draft values are not recognized charges.")
IP_MOVEMENT = choice(["purchase", "order", "adjustment", "waste", "production", "production_adjustment", "transfer_out", "transfer_in"], "Actual recorded stock movement category.")
IP_STOCK_FILTERS = {**IP_INGREDIENT, "is_active": BOOLEAN,
    "unit": choice(["kg", "g", "l", "ml", "pcs"], "Original physical stock unit."),
    "stock_status": choice(["normal", "low_stock", "out_of_stock", "negative", "unknown"], "Current stock status; missing shared branch stock is unknown."),
    "low_stock": BOOLEAN, "out_of_stock": BOOLEAN}
IP_PURCHASE_FILTERS = {**IP_INGREDIENT, **IP_SUPPLIER, **IP_INVOICE, **IP_DATES,
    "status": IP_STATUS, "is_inventory_posted": BOOLEAN}
IP_PAYMENT_FILTERS = {**IP_SUPPLIER, **IP_INVOICE, **IP_DATES,
    "payment_method": choice(["cash", "card", "bank_transfer", "mobile_money", "other"], "Recorded payment method.")}
IP_MOVEMENT_FILTERS = {**IP_INGREDIENT, **IP_DATES, "movement_type": IP_MOVEMENT,
    "movement_types": {"type": "array", "items": IP_MOVEMENT, "minItems": 1, "maxItems": 8, "uniqueItems": True},
    "order_id": identifier("Related order ID; timestamps remain movement event times.")}
IP_TRANSFER_FILTERS = {**IP_INGREDIENT, **IP_DATES,
    "status": choice(["pending", "approved", "rejected", "cancelled"], "Request status; only approved means completed."),
    "from_branch_id": identifier("Source endpoint filter within permitted transfer visibility."),
    "to_branch_id": identifier("Destination endpoint filter within permitted transfer visibility.")}
IP_GROUPING = {**PAGING,
    "ranking": choice(["identity", "highest", "lowest"], "Order groups by their first stated metric; quantities rank within original units, not comparable across units."),
    "group_by": choice(["month", "day"], "Trend interval; omitted means month.")}
IP_SORTS = {
    "ingredients": ("name", "-name", "available", "-available", "stock_value", "-stock_value"),
    "stocks": ("name", "-name", "available", "-available", "stock_value", "-stock_value"),
    "low_stock": ("name", "-name", "available", "-available"),
    "recipes": ("id", "-id", "quantity_required", "-quantity_required"),
    "lines": ("id", "-id", "quantity", "-quantity", "total_price", "-total_price"),
    "history": ("id", "-id", "quantity", "-quantity", "total_price", "-total_price"),
    "movements": ("created_at", "-created_at", "change_quantity", "-change_quantity"),
    "transfers": ("created_at", "-created_at", "quantity", "-quantity"),
    "logs": ("created_at", "-created_at"),
    "suppliers": ("name", "-name", "balance", "-balance", "purchases", "-purchases"),
    "invoices": ("purchase_date", "-purchase_date", "total_amount", "-total_amount", "invoice_number", "-invoice_number"),
    "payments": ("date", "-date", "amount", "-amount"),
}


def ip_queries(context, p, operation):
    return InventoryQueries(principal=context.principal, parameters=p, operation=operation)


def ip_metadata(p):
    return {"scope": "trusted_authorized_scope", "currency": "AFN", "timezone": "Asia/Kabul",
        "period": {"from": p.get("date", p.get("date_from")), "to": p.get("date", p.get("date_to"))},
        "basis": "Current stock and supplier balances ignore activity dates. Purchase dates filter invoice cohorts/lines; payment dates filter payment rows; movement/transfer/log timestamps use inclusive Kabul days. Omitted dates mean all history. Invoice cohort Paid/Remaining include all payment dates and are not historical balances. Ingredient-filtered invoice financials cover whole matching invoices; ingredient line amounts are separate. Stock value is current quantity x current cost, not historical spending/COGS. Movement categories are separate views, not additional purchases. Quantities retain original units; cross-unit numeric rankings are not physical comparisons. Transfers use creation date and count requests once. Ledgers reconstruct current records, not immutable snapshots."}


def ip_result(p, **payload):
    return json_values({**ip_metadata(p), **payload})


def ip_actor(person, restaurant_id):
    allowed = person and person.restaurant_id == restaurant_id
    return {"id": person.pk if allowed else None, "name": person.name if allowed else None}


def ip_ingredient(row):
    def value(key):
        return row.get(key) if isinstance(row, dict) else getattr(row, key)
    return {"id": value("id"), "name": value("name"), "unit": value("unit"), "is_active": value("is_active"),
        "definition_branch_id": value("branch_id"), "shared_definition": value("branch_id") is None,
        "branch_id": value("applicable_branch_id"), "stock_row_id": value("stock_row_id"), "stock_active": value("stock_active"),
        "available_quantity": value("available"), "minimum_threshold": value("threshold"),
        "current_unit_cost": value("cost"), "current_stock_value": value("stock_value"), "stock_status": value("stock_status")}


def ip_supplier(row):
    return {"id": row.pk, "branch_id": row.branch_id,
        **{key: getattr(row, key) for key in ("name", "contact_person", "phone", "email", "address", "notes", "is_active")},
        "recognized_purchases": row.purchases, "recorded_payments": row.paid, "outstanding_balance": row.balance}


def ip_invoice(row):
    return {"id": row.pk, "invoice_number": row.invoice_number, "reference": row.invoice_number or f"PINV-{row.pk}",
        "supplier_id": row.supplier_id, "supplier_name": row.supplier.name if row.supplier_id else None,
        "branch_id": row.branch_id, "purchase_date": row.purchase_date, "due_date": row.due_date,
        "status": row.status, "recognized": row.status != "draft", "total_amount": row.total_amount,
        "stored_paid_amount": row.amount_paid, "current_capped_paid": row.effective_paid, "remaining_balance": row.remaining,
        "is_inventory_posted": row.is_inventory_posted, "notes": row.notes,
        "created_by": ip_actor(row.created_by, row.restaurant_id), "created_at": row.created_at, "updated_at": row.updated_at}


def ip_line(row):
    movement = row.stock_movement
    permitted_movement = movement and movement.restaurant_id == row.invoice.restaurant_id and movement.branch_id == row.invoice.branch_id and movement.ingredient_id == row.ingredient_id
    return {"id": row.pk, "invoice_id": row.invoice_id, "invoice_number": row.invoice.invoice_number,
        "invoice_status": row.invoice.status, "recognized": row.invoice.status != "draft", "purchase_date": row.invoice.purchase_date,
        "supplier_id": row.invoice.supplier_id, "supplier_name": row.invoice.supplier.name if row.invoice.supplier_id else None,
        "ingredient_id": row.ingredient_id, "ingredient_name": row.ingredient.name, "unit": row.ingredient.unit,
        "quantity": row.quantity, "historical_unit_price": row.unit_price, "line_total": row.total_price,
        "stock_movement_id": movement.pk if permitted_movement else None}


def ip_payment(row):
    return {"id": row.pk, "supplier_id": row.supplier_id, "supplier_name": row.supplier.name,
        "invoice_id": row.purchase_invoice_id, "invoice_number": row.purchase_invoice.invoice_number,
        "date": row.date, "amount": row.amount, "payment_method": row.payment_method,
        "reference_number": row.reference_number, "notes": row.notes, "created_by": ip_actor(row.created_by, row.restaurant_id)}


def ip_movement(row):
    return {"id": row.pk, "ingredient_id": row.ingredient_id, "ingredient_name": row.ingredient.name,
        "unit": row.ingredient.unit, "branch_id": row.branch_id, "signed_quantity": row.change_quantity,
        "movement_type": row.movement_type, "unit_cost": row.unit_cost, "notes": row.note,
        "order_id": row.related_order_id, "created_by": ip_actor(row.created_by, row.restaurant_id), "created_at": row.created_at}


def ip_transfer(row):
    return {"id": row.pk, "ingredient_id": row.ingredient_id, "ingredient_name": row.ingredient.name,
        "unit": row.ingredient.unit, "quantity": row.quantity, "status": row.status, "notes": row.notes,
        "from_branch_id": row.from_branch_id, "from_branch_name": row.from_branch.name,
        "to_branch_id": row.to_branch_id, "to_branch_name": row.to_branch.name,
        "created_by": ip_actor(row.created_by, row.restaurant_id), "approved_by": ip_actor(row.approved_by, row.restaurant_id),
        "created_at": row.created_at, "approved_at": row.approved_at, "updated_at": row.updated_at}


def ip_recipe(row):
    return {"id": row.pk, "ingredient_id": row.ingredient_id, "ingredient_name": row.ingredient.name,
        "unit": row.ingredient.unit, "menu_item_id": row.menu_item_id, "menu_item_name": row.menu_item.name,
        "menu_item_available": row.menu_item.is_available, "quantity_required": row.quantity_required}


def ip_list(context, p, operation, kind, serializer):
    q = ip_queries(context, p, operation)
    order = p.get("sort", IP_SORTS[kind][0])
    ordering = (order, "id", "applicable_branch_id") if kind == "stocks" else (order, "id")
    extra = {"excluded_movement_types": q.excluded_movement_types} if kind == "movements" else {}
    return ip_result(p, **page(q.records(kind), p, serializer, ordering), **extra)


@business_tool
def list_ingredients(context, p):
    return ip_list(context, p, "list_ingredients", "ingredients", ip_ingredient)


@business_tool
def get_ingredient_details(context, p):
    row, count = ip_queries(context, p, "get_ingredient_details").ingredient_detail()
    return ip_result(p, ingredient=ip_ingredient(row), recipe_usage_count=count)


@business_tool
def list_ingredient_stocks(context, p):
    return ip_list(context, p, "list_ingredient_stocks", "stocks", ip_ingredient)


@business_tool
def list_ingredient_recipe_usages(context, p):
    return ip_list(context, p, "list_ingredient_recipe_usages", "recipes", ip_recipe)


@business_tool
def list_ingredient_purchase_history(context, p):
    return ip_list(context, p, "list_ingredient_purchase_history", "history", ip_line)


@business_tool
def list_stock_movements(context, p):
    return ip_list(context, p, "list_stock_movements", "movements", ip_movement)


@business_tool
def get_stock_movement_details(context, p):
    q = ip_queries(context, p, "get_stock_movement_details")
    row = q.one(q.records("movements"), p, "movement_id", "unused")
    return ip_result(p, movement=ip_movement(row))


@business_tool
def list_low_stock_ingredients(context, p):
    return ip_list(context, p, "list_low_stock_ingredients", "low_stock", ip_ingredient)


@business_tool
def list_stock_transfers(context, p):
    return ip_list(context, p, "list_stock_transfers", "transfers", ip_transfer)


@business_tool
def get_stock_transfer_details(context, p):
    q = ip_queries(context, p, "get_stock_transfer_details")
    return ip_result(p, transfer=ip_transfer(q.one(q.records("transfers"), p, "transfer_id", "unused")))


@business_tool
def list_stock_transfer_logs(context, p):
    q = ip_queries(context, p, "list_stock_transfer_logs")
    def serialize(row):
        return {"id": row.pk, "transfer_id": row.transfer_id, "action": row.action, "message": row.message,
            "actor": ip_actor(row.actor, q.restaurant_id), "created_at": row.created_at}
    return ip_result(p, **page(q.records("logs"), p, serialize, (p.get("sort", "created_at"), "id")))


@business_tool
def list_suppliers(context, p):
    return ip_list(context, p, "list_suppliers", "suppliers", ip_supplier)


@business_tool
def get_supplier_details(context, p):
    row, details = ip_queries(context, p, "get_supplier_details").supplier_detail()
    return ip_result(p, supplier=ip_supplier(row), **details)


@business_tool
def list_purchase_invoices(context, p):
    return ip_list(context, p, "list_purchase_invoices", "invoices", ip_invoice)


@business_tool
def get_purchase_invoice_details(context, p):
    q = ip_queries(context, p, "get_purchase_invoice_details")
    row, related = q.invoice_detail()
    def attachment(item):
        return {"id": item.pk, "original_filename": item.original_filename, "content_type": item.content_type,
            "file_size": item.file_size, "file_type": item.file_type, "uploaded_at": item.uploaded_at,
            "uploaded_by": ip_actor(item.uploaded_by, q.restaurant_id)}
    return ip_result(p, invoice=ip_invoice(row),
        lines=page(related["lines"], p, ip_line, ("id",), page_key="lines_page"),
        payments=page(related["payments"], p, ip_payment, ("date", "id"), page_key="payments_page"),
        attachments=page(related["attachments"], p, attachment, ("id",), page_key="attachments_page"))


@business_tool
def list_purchase_invoice_lines(context, p):
    return ip_list(context, p, "list_purchase_invoice_lines", "lines", ip_line)


@business_tool
def list_supplier_payments(context, p):
    return ip_list(context, p, "list_supplier_payments", "payments", ip_payment)


@business_tool
def get_supplier_ledger(context, p):
    row, ledger = ip_queries(context, p, "get_supplier_ledger").ledger()
    return ip_result(p, supplier=ip_supplier(row), ledger=ledger)


@business_tool
def get_inventory_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_inventory_summary").inventory_summary())


@business_tool
def get_ingredient_summary(context, p):
    row, summary = ip_queries(context, p, "get_ingredient_summary").ingredient_summary()
    return ip_result(p, current=ip_ingredient(row), **summary)


@business_tool
def get_low_stock_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_low_stock_summary").inventory_summary(low=True))


@business_tool
def get_stock_movements_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_stock_movements_summary").movement_summary())


@business_tool
def get_consumption_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_consumption_summary").movement_summary(source="consumption"))


@business_tool
def get_waste_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_waste_summary").movement_summary(source="waste"))


@business_tool
def get_stock_transfers_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_stock_transfers_summary").transfers_summary())


@business_tool
def get_suppliers_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_suppliers_summary").suppliers_summary())


@business_tool
def get_supplier_summary(context, p):
    row, summary = ip_queries(context, p, "get_supplier_summary").supplier_activity(one=True)
    return ip_result(p, supplier=ip_supplier(row), **summary)


@business_tool
def get_purchase_invoices_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_purchase_invoices_summary").purchase_summary())


@business_tool
def get_supplier_payments_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_supplier_payments_summary").payment_summary())


@business_tool
def get_procurement_summary(context, p):
    return ip_result(p, **ip_queries(context, p, "get_procurement_summary").procurement_summary())


IP_ACTOR = obj({"id": OPTIONAL_ID, "name": OPTIONAL_TEXT})
IP_INGREDIENT_RECORD = obj({"id": INTEGER, "name": TEXT, "unit": TEXT, "is_active": BOOLEAN,
    "definition_branch_id": OPTIONAL_ID, "shared_definition": BOOLEAN, "branch_id": INTEGER,
    "stock_row_id": OPTIONAL_ID, "stock_active": {"type": ["boolean", "null"]}, "available_quantity": NULL_DECIMAL,
    "minimum_threshold": NULL_DECIMAL, "current_unit_cost": NULL_DECIMAL, "current_stock_value": NULL_DECIMAL, "stock_status": TEXT})
IP_SUPPLIER_RECORD = obj({"id": INTEGER, "branch_id": INTEGER, **{key: TEXT for key in ("name", "contact_person", "phone", "email", "address", "notes")},
    "is_active": BOOLEAN, **{key: DECIMAL for key in ("recognized_purchases", "recorded_payments", "outstanding_balance")}})
IP_INVOICE_RECORD = obj({"id": INTEGER, "invoice_number": TEXT, "reference": TEXT, "supplier_id": OPTIONAL_ID,
    "supplier_name": OPTIONAL_TEXT, "branch_id": INTEGER, "purchase_date": TEXT, "due_date": OPTIONAL_TEXT,
    "status": TEXT, "recognized": BOOLEAN, **{key: DECIMAL for key in ("total_amount", "stored_paid_amount", "current_capped_paid", "remaining_balance")},
    "is_inventory_posted": BOOLEAN, "notes": TEXT, "created_by": IP_ACTOR, "created_at": TEXT, "updated_at": TEXT})
IP_LINE_RECORD = obj({"id": INTEGER, "invoice_id": INTEGER, "invoice_number": TEXT, "invoice_status": TEXT,
    "recognized": BOOLEAN, "purchase_date": TEXT, "supplier_id": OPTIONAL_ID, "supplier_name": OPTIONAL_TEXT,
    "ingredient_id": INTEGER, "ingredient_name": TEXT, "unit": TEXT, "quantity": DECIMAL,
    "historical_unit_price": DECIMAL, "line_total": DECIMAL, "stock_movement_id": OPTIONAL_ID})
IP_PAYMENT_RECORD = obj({"id": INTEGER, "supplier_id": INTEGER, "supplier_name": TEXT, "invoice_id": INTEGER,
    "invoice_number": TEXT, "date": TEXT, "amount": DECIMAL, "payment_method": TEXT, "reference_number": TEXT,
    "notes": TEXT, "created_by": IP_ACTOR})
IP_MOVEMENT_RECORD = obj({"id": INTEGER, "ingredient_id": INTEGER, "ingredient_name": TEXT, "unit": TEXT,
    "branch_id": INTEGER, "signed_quantity": DECIMAL, "movement_type": TEXT, "unit_cost": NULL_DECIMAL,
    "notes": OPTIONAL_TEXT, "order_id": OPTIONAL_ID, "created_by": IP_ACTOR, "created_at": TEXT})
IP_TRANSFER_RECORD = obj({"id": INTEGER, "ingredient_id": INTEGER, "ingredient_name": TEXT, "unit": TEXT,
    "quantity": DECIMAL, "status": TEXT, "notes": TEXT, "from_branch_id": INTEGER, "from_branch_name": TEXT,
    "to_branch_id": INTEGER, "to_branch_name": TEXT, "created_by": IP_ACTOR, "approved_by": IP_ACTOR,
    "created_at": TEXT, "approved_at": OPTIONAL_TEXT, "updated_at": TEXT})
IP_RECIPE_RECORD = obj({"id": INTEGER, "ingredient_id": INTEGER, "ingredient_name": TEXT, "unit": TEXT,
    "menu_item_id": INTEGER, "menu_item_name": TEXT, "menu_item_available": BOOLEAN, "quantity_required": DECIMAL})
IP_LOG_RECORD = obj({"id": INTEGER, "transfer_id": INTEGER, "action": TEXT, "message": TEXT, "actor": IP_ACTOR, "created_at": TEXT})
IP_INVOICE_TOTALS = obj({**{key: INTEGER for key in ("count", "recognized_count", "draft_count", "unpaid_count")},
    **{key: DECIMAL for key in ("recognized_charges", "draft_face_value", "current_capped_paid", "current_remaining")}})
IP_CURRENT_SUPPLIERS = obj({**{key: INTEGER for key in ("count", "active", "inactive")},
    **{key: DECIMAL for key in ("recognized_purchases", "recorded_payments", "sum_supplier_balances", "aggregate_net_first_balance", "recognized_invoice_remaining")}})


def ip_group(dimensions, metrics):
    fields = {key: OPTIONAL_ID if key.endswith("_id") else OPTIONAL_TEXT for key in dimensions}
    return paged(obj({**fields, "count": INTEGER, **{key: DECIMAL for key in metrics}}))


IP_PURCHASE_SUMMARY = {"invoice_cohort": IP_INVOICE_TOTALS,
    "by_status": array(obj({"status": TEXT, "count": INTEGER, "face_value": DECIMAL})),
    "by_supplier": ip_group(("supplier_id", "supplier__name"), ("charges",)),
    "ingredients": ip_group(("ingredient_id", "ingredient__name", "ingredient__unit"), ("quantity", "line_charges")),
    "trends": ip_group(("period",), ("charges",))}
IP_PAYMENTS_SUMMARY = {"payment_count": INTEGER, "recorded_payments": DECIMAL,
    "by_method": array(obj({"payment_method": TEXT, "count": INTEGER, "amount": DECIMAL})),
    "by_supplier": ip_group(("supplier_id", "supplier__name"), ("amount",)),
    "by_invoice": ip_group(("purchase_invoice_id", "purchase_invoice__invoice_number"), ("amount",)),
    "trends": ip_group(("period",), ("amount",))}
IP_SUPPLIERS_SUMMARY = {"current": IP_CURRENT_SUPPLIERS, "purchases": obj(IP_PURCHASE_SUMMARY),
    "payments": obj(IP_PAYMENTS_SUMMARY), "supplier_ranking": paged(obj({"id": INTEGER, "name": TEXT,
        "is_active": BOOLEAN, "purchases": DECIMAL, "paid": DECIMAL, "balance": DECIMAL}))}
IP_INVENTORY_SUMMARY = {"current": obj({**{key: INTEGER for key in ("ingredient_count", "active", "inactive", "low_stock", "out_of_stock", "negative", "unknown_stock")}, "valuation": DECIMAL, "valuation_complete": BOOLEAN, "valuation_scope": TEXT}),
    "by_unit_status": array(obj({"unit": TEXT, "stock_status": TEXT, "is_active": BOOLEAN,
        "count": INTEGER, "quantity": NULL_DECIMAL, "threshold": NULL_DECIMAL, "value": NULL_DECIMAL}))}


def ip_movement_output(usage=False):
    metrics = (["net_recorded_usage"] if usage else []) + ["net_quantity", "increases", "decreases"]
    return {"movement_count": INTEGER, "excluded_movement_types": array(TEXT),
        "by_unit": array(obj({"ingredient__unit": TEXT, "count": INTEGER, **{key: DECIMAL for key in metrics}})),
        "by_type_unit": array(obj({"movement_type": TEXT, "ingredient__unit": TEXT, "count": INTEGER, **{key: DECIMAL for key in metrics}})),
        "by_ingredient": ip_group(("ingredient_id", "ingredient__name", "ingredient__unit"), metrics),
        "trends": ip_group(("period", "ingredient__unit", "movement_type"), metrics)}


def ip_envelope(fields):
    return obj({"scope": {"const": "trusted_authorized_scope"}, "currency": {"const": "AFN"},
        "timezone": {"const": "Asia/Kabul"}, "period": obj({"from": OPTIONAL_TEXT, "to": OPTIONAL_TEXT}), "basis": TEXT, **fields})


def inventory_procurement_definitions():
    inv = "admin_inventory_ingredients"
    movement = "admin_inventory_stock_movements"
    transfer = "admin_inventory_dashboard"
    supplier = "admin_procurement_suppliers"
    purchase = "admin_procurement_purchase_invoices"
    payment = "admin_procurement_payments"
    finance = "admin_procurement_shared_financial_meaning"
    specs = []
    def add(handler, description, filters, output, docs, *, domain="inventory", required=(), returns=""):
        specs.append(ToolDefinition(id=handler.__name__, description=description, domain=domain,
            parameters=obj(filters, required=list(required)), output=ip_envelope(output), knowledge_ids=tuple(docs),
            authorize=partial(authorize_tool, handler.__name__), handler=handler, returns=returns))
    def record(handler, kind, filters, schema, docs, description, domain="inventory", required=(), returns=""):
        output = {**paged(schema)["properties"]}
        if kind == "movements":
            output["excluded_movement_types"] = array(TEXT)
        add(handler, description, {**filters, **PAGING, "sort": choice(IP_SORTS[kind], "Stable ordering with ID tie-breaker.")},
            output, docs, domain=domain, required=required, returns=returns)
    record(list_ingredients, "ingredients", IP_STOCK_FILTERS, IP_INGREDIENT_RECORD, [inv], "Current ingredient definitions and authorized branch quantities, thresholds, costs and values; no activity dates.",
        returns="Paginated definitions/status and current authorized branch quantity, unit, threshold, unit cost, value and warning status; shared definitions use branch stock, missing stock is unknown.")
    add(get_ingredient_details, "One current ingredient by ID or unambiguous name; current stock, cost, threshold and recipe relationship count.", IP_INGREDIENT,
        {"ingredient": IP_INGREDIENT_RECORD, "recipe_usage_count": INTEGER}, [inv],
        returns="One current ingredient definition, branch stock identifiers, quantity/unit, threshold, cost/value, status and recipe usage count; no historical stock reconstruction.")
    record(list_ingredient_stocks, "stocks", {**IP_STOCK_FILTERS,
        "stock_branch_ids": {"type": "array", "items": identifier("Branch filter; server verifies all branches against existing access."), "minItems": 1, "maxItems": 20, "uniqueItems": True}},
        IP_INGREDIENT_RECORD, [inv], "Current stock positions; default active branch. Multiple branch filters require existing all-branch access; shared definitions are represented once per branch.",
        returns="Paginated current positions per authorized branch with ingredient/unit, quantity, threshold, cost/value and stock status; shared definitions appear once per branch, with unknown missing positions.")
    record(list_ingredient_recipe_usages, "recipes", {**IP_INGREDIENT, "menu_item_id": identifier("Related menu item."), "menu_item_name": SEARCH},
        IP_RECIPE_RECORD, [inv], "Recipe requirements by ingredient or menu item; quantities are per recipe entry, not actual order consumption.",
        returns="Paginated ingredient/menu-item relationships with recipe quantity, stock unit and menu-item availability; requirements are per recipe entry, not actual consumption.")
    record(list_ingredient_purchase_history, "history", IP_PURCHASE_FILTERS, IP_LINE_RECORD, [inv, purchase], "Historical purchase invoice lines, original prices and supplierless purchases; defaults to non-draft history, explicit status can include drafts.",
        returns="Paginated historical invoice lines with invoice/date/status, supplier including supplierless, ingredient/unit, purchased quantity, original four-decimal price, line total and movement reference; default excludes drafts.")
    record(list_stock_movements, "movements", IP_MOVEMENT_FILTERS, IP_MOVEMENT_RECORD, [movement], "All eight signed movement types, event dates and order references; no default 30-day restriction.",
        returns="Paginated signed movement events with ingredient/unit, category, recorded cost, notes, order, actor and Kabul timestamp; includes all permitted types and explicitly flags excluded transfer categories.")
    add(get_stock_movement_details, "One authorized stock movement and its linked references.", {"movement_id": identifier("Movement ID.")}, {"movement": IP_MOVEMENT_RECORD}, [movement], required=["movement_id"],
        returns="One authorized movement with signed quantity/unit, category, recorded unit cost, notes, order/branch references, actor and event timestamp.")
    record(list_low_stock_ingredients, "low_stock", IP_STOCK_FILTERS, IP_INGREDIENT_RECORD, ["admin_inventory_low_stock_alerts"], "Current threshold warnings, including zero and legacy negative balances; low_stock selects positive quantities at or below threshold, out_of_stock selects exactly zero. No forecast.",
        returns="Paginated current threshold-warning positions, including zero stock and qualifying legacy negatives; quantities, units, thresholds, cost/value and active status; no forecast or reorder quantity.")
    record(list_stock_transfers, "transfers", IP_TRANSFER_FILTERS, IP_TRANSFER_RECORD, [transfer], "Transfer requests visible through an authorized endpoint, filtered by creation dates/status; pending requests have not moved stock.",
        returns="Paginated transfer requests with ingredient/quantity/unit, endpoints, status, creator/approver and creation/approval timestamps; pending requests are not completed stock movements.")
    add(get_stock_transfer_details, "One authorized transfer request with endpoints, actors and timestamps.", {"transfer_id": identifier("Transfer ID.")}, {"transfer": IP_TRANSFER_RECORD}, [transfer], required=["transfer_id"],
        returns="One authorized transfer request with ingredient/quantity/unit, source/destination, status, notes, actors and timestamps; no double-counted outgoing/incoming events.")
    record(list_stock_transfer_logs, "logs", {"transfer_id": identifier("Authorized parent transfer."), "action": SEARCH, **IP_DATES}, IP_LOG_RECORD, [transfer], "Parent-authorized transfer activity logs by action and Kabul event date.", required=["transfer_id"],
        returns="Paginated authorized parent-transfer audit events with action, message, actor and Kabul timestamp; log date is independent of transfer creation/approval.")
    record(list_suppliers, "suppliers", {**IP_SUPPLIER, "is_active": BOOLEAN}, IP_SUPPLIER_RECORD, [supplier, finance], "Supplier directory and complete all-history purchases/payments/current floored balances, independent of pagination.", "procurement",
        returns="Paginated supplier contacts/status and complete all-history recognized purchases, payment rows and current per-supplier floored balance; account totals are independent of pagination.")
    add(get_supplier_details, "One supplier by ID or unambiguous name, contact profile and all-history account/record counts.", IP_SUPPLIER,
        {"supplier": IP_SUPPLIER_RECORD, "invoice_totals": IP_INVOICE_TOTALS, "payment_count": INTEGER}, [supplier, finance], domain="procurement",
        returns="One supplier contact/status profile and current all-history purchase/payment/balance totals, invoice counts/financial totals including separate drafts, and payment count.")
    record(list_purchase_invoices, "invoices", IP_PURCHASE_FILTERS, IP_INVOICE_RECORD, [purchase, finance], "Invoice records by purchase date, supplier, ingredient, status and posting; Paid/Remaining are current all-date values, not period payments.", "procurement",
        returns="Paginated invoices including supplierless purchases and drafts, purchase/due dates, status/posting, total, stored paid and current all-date capped paid/remaining; not historical settlement snapshots.")
    attachment = obj({"id": INTEGER, "original_filename": TEXT, "content_type": TEXT, "file_size": INTEGER, "file_type": TEXT, "uploaded_at": TEXT, "uploaded_by": IP_ACTOR})
    add(get_purchase_invoice_details, "One invoice by ID or unambiguous stored number, historical lines, separately paginated all-date payments and attachment metadata; no file content or URLs.",
        {**IP_INVOICE, "page_size": PAGING["page_size"], **{key: PAGING["page"] for key in ("lines_page", "payments_page", "attachments_page")}},
        {"invoice": IP_INVOICE_RECORD, "lines": paged(IP_LINE_RECORD), "payments": paged(IP_PAYMENT_RECORD), "attachments": paged(attachment)}, [purchase, payment], domain="procurement",
        returns="Full invoice, historical prices/quantities/line totals, current paid/remaining and independently paginated lines, all-date payments and attachment metadata; no file contents or URLs.")
    record(list_purchase_invoice_lines, "lines", IP_PURCHASE_FILTERS, IP_LINE_RECORD, [purchase], "Individual purchase lines with original four-decimal prices, quantities and rounded charges; draft lines explicitly unrecognized.", "procurement",
        returns="Paginated individual purchase lines with invoice/date/status/recognized flag, ingredient/unit, quantity, original price, line total, supplier and permitted inventory movement reference.")
    record(list_supplier_payments, "payments", IP_PAYMENT_FILTERS, IP_PAYMENT_RECORD, [payment], "Individual payment rows using SupplierPayment.date and recorded method, independent of invoice purchase date.", "procurement",
        returns="Paginated payment rows with supplier/invoice references, payment date, amount/method, reference number, notes and actor; supplierless stored paid need not have payment rows.")
    add(get_supplier_ledger, "Reconstructed chronological supplier ledger: non-draft charges, payment credits, signed running balances and pre-range opening; current floored debt stays separate.",
        {**IP_SUPPLIER, **IP_DATES, **PAGING}, {"supplier": IP_SUPPLIER_RECORD, "ledger": obj({**paged(obj({"id": INTEGER, "event_date": TEXT,
            "entry_type": TEXT, "reference": TEXT, "debit": DECIMAL, "credit": DECIMAL, "signed_change": DECIMAL, "running_balance": DECIMAL}))["properties"],
            **{key: DECIMAL for key in ("opening_reconstructed", "invoice_debits", "payment_credits", "closing_reconstructed")}})}, [supplier, finance], domain="procurement",
        returns="Paginated chronological non-draft invoice debits/payment credits, signed changes/running balances, pre-range opening and closing reconstruction; separate current supplier profile/floored debt. Not an immutable snapshot.")
    add(get_inventory_summary, "Current inventory counts, active/inactive and stock warning statuses, valuation and separate unit totals; unknown shared branch stock remains unknown.", IP_STOCK_FILTERS, IP_INVENTORY_SUMMARY, [inv],
        returns="Current definition/active/inactive and stock-status counts, known-position valuation, completeness/population labels and separate unit/status quantity/threshold/value groups; inactive records included unless filtered.")
    add(get_ingredient_summary, "Complete ingredient profile: current branch stock/value and recipe count, separately dated historical purchase lines and signed movements by type, including order/production, corrections, waste and transfers. Purchases and their movements must never be added together.",
        {**IP_INGREDIENT, **IP_DATES, **IP_GROUPING}, {"current": IP_INGREDIENT_RECORD, "recipe_usage_count": INTEGER,
        "purchase_activity": obj({"line_count": INTEGER, "quantity": DECIMAL, "line_charges": DECIMAL}), "movement_activity": obj(ip_movement_output())}, [inv, movement, purchase],
        returns="Current ingredient stock/unit/threshold/cost/value/status and recipe count, separate period purchase quantities/line charges, and movement counts/net signed quantities by type, ingredient/unit and trend; flags excluded categories.")
    add(get_low_stock_summary, "Current warning counts/values and threshold comparisons by unit/status/activity; zero is out-of-stock, positive <= threshold is low, negative is separately identified. No reorder forecast.", IP_STOCK_FILTERS, IP_INVENTORY_SUMMARY, ["admin_inventory_low_stock_alerts"],
        returns="Current warning counts split into positive low, zero, legacy negative and active/inactive populations, valuation/completeness and unit/status quantity-versus-threshold groups; no purchase forecast.")
    add(get_stock_movements_summary, "All-category signed movement counts, positive increases/negative decreases, unit-separated groups and event trends; group pagination never limits totals.", {**IP_MOVEMENT_FILTERS, **IP_GROUPING}, ip_movement_output(), [movement],
        returns="Complete movement count, signed net/increase/decrease quantities by unit and type; paginated ingredient groups/rankings and event trends. Physical units stay separate; excluded categories are explicit.")
    add(get_consumption_summary, "Order versus production ingredient consumption and signed production adjustments/returns. net_recorded_usage is negative of net signed changes; waste, transfers and manual adjustments are excluded. Rank raw quantities only within matching units; event time is not order completion time.",
        {**IP_INGREDIENT, **IP_DATES, **IP_GROUPING, "source": choice(["order", "production"], "Consumption source; omitted includes both, with distinct categories.")}, ip_movement_output(True), [movement],
        returns="Order/production/production-adjustment counts and net recorded usage (negative of signed changes), increases/returns and decreases by ingredient/unit/type, ranked groups and event trends; excludes waste, manual adjustments and transfers.")
    add(get_waste_summary, "Net recorded waste = negative signed waste changes, preserving positive corrections and original units; gross decreases and increases separate. No historical monetary loss from current costs.",
        {**IP_INGREDIENT, **IP_DATES, **IP_GROUPING}, ip_movement_output(True), [movement],
        returns="Waste event count, net recorded waste (negative of signed changes), gross signed decreases and positive corrections, ingredient/unit rankings and trends; no historical monetary-loss estimate.")
    add(get_stock_transfers_summary, "Transfer request counts/statuses and endpoint/ingredient/unit groups; approved completed quantities separated from pending request quantities; creation-date scope, no movement double counting.",
        {**IP_TRANSFER_FILTERS, **IP_GROUPING}, {"transfer_count": INTEGER, "by_status": array(obj({"status": TEXT, "count": INTEGER})),
        "quantities": ip_group(("ingredient_id", "ingredient__name", "ingredient__unit", "status", "from_branch_id", "to_branch_id"), ("request_quantity", "approved_quantity", "pending_quantity"))}, [transfer],
        returns="Transfer request counts/statuses and paginated ingredient/unit/endpoint groups with approved completed quantities and separate pending request quantities; filtered by creation date, each transfer counted once.")
    add(get_suppliers_summary, "Supplier counts, all-history current balances and rankings; separate period purchases/payments and supplierless activity. Exposes per-supplier floored versus aggregate net-first versus per-invoice balances.",
        {**IP_SUPPLIER, "is_active": BOOLEAN, **IP_DATES, **IP_GROUPING}, {**IP_SUPPLIERS_SUMMARY, "supplierless_activity": IP_INVOICE_TOTALS}, [supplier, finance], domain="procurement",
        returns="Supplier counts/current all-history purchases/payments, per-supplier floored versus aggregate net-first debt and invoice remaining; supplier rankings, separate period purchase/payment breakdowns/trends and supplierless activity.")
    add(get_supplier_summary, "Complete supplier by ID or unambiguous name: contact/current debt and all-history totals, separate period invoice charges/drafts/statuses, ingredient purchases, payment methods and trends.",
        {**IP_SUPPLIER, **IP_DATES, **IP_GROUPING}, {"supplier": IP_SUPPLIER_RECORD, **IP_SUPPLIERS_SUMMARY}, [supplier, purchase, payment, finance], domain="procurement",
        returns="One supplier profile and current all-history account; separate period invoice/unpaid counts, recognized charges/drafts/statuses, ingredient quantities/values, payments/methods and purchase/payment trends.")
    add(get_purchase_invoices_summary, "Purchase-date invoice cohorts, statuses/drafts, recognized charges and current all-date settlement; ingredient line analysis remains separate from whole matching invoice balances, without line join multiplication.",
        {**IP_PURCHASE_FILTERS, **IP_GROUPING}, IP_PURCHASE_SUMMARY, [purchase, finance], domain="procurement",
        returns="Complete matching invoice-cohort counts/statuses, drafts/recognized charges and current all-date paid/remaining; supplier/trend groups and separately filtered ingredient line quantities/charges. Line amounts are not whole-invoice balances.")
    add(get_supplier_payments_summary, "Payment-date row counts/amounts by method, supplier, invoice and chronological trend; counts payments rather than cumulative invoice paid values.",
        {**IP_PAYMENT_FILTERS, **IP_GROUPING}, IP_PAYMENTS_SUMMARY, [payment, finance], domain="procurement",
        returns="Complete payment-row count/amount, method totals and paginated supplier/invoice groups and payment-date trends; counts individual payments, not cumulative invoice paid values.")
    add(get_procurement_summary, "Procurement overview: period purchases/drafts/invoice counts, payment rows/trends, supplierless activity, and separate all-history current supplier liabilities/counts. Payments are not additional expense; stock valuation is obtained from inventory tools.",
        {**IP_DATES, **IP_GROUPING}, {"current_supplier_accounts": IP_CURRENT_SUPPLIERS, "purchase_activity": obj(IP_PURCHASE_SUMMARY),
        "payment_activity": obj(IP_PAYMENTS_SUMMARY), "supplierless_activity": IP_INVOICE_TOTALS, "current_supplierless_invoices": IP_INVOICE_TOTALS}, [purchase, payment, finance], domain="procurement",
        returns="Period recognized charges, separate drafts/invoice counts, payment rows/totals and purchase/payment trends with supplier/ingredient groups; separate current all-history supplier accounts/payables and supplierless activity/current invoices. Payments are not extra expense.")
    return tuple(specs)


def definitions():
    return contractor_definitions() + expense_definitions() + inventory_procurement_definitions()


def register_tools(registry):
    for definition in definitions():
        registry.register(definition)
