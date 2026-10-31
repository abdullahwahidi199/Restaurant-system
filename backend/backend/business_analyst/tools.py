"""Business tool contracts, operation permissions, handlers and registration.

Database queries live in their owning Django applications.
"""
from functools import partial, wraps
from types import SimpleNamespace
from django.contrib.auth import get_user_model
from ai_assistant.errors import AssistantError
from contractors.selectors import ContractorQueries, ContractorQueryError, money
from expenses.selectors import ExpenseQueries, ExpenseQueryError
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
    }.get(tool_id, ())


def authorize_tool(tool_id, context, parameters):
    context.check_deadline()
    principal = context.principal
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
        except (ContractorQueryError, ExpenseQueryError) as exc:
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
         listing(CONTRACTOR_FILTERS, CONTRACTOR_SORTS), envelope(paged(CONTRACTOR_RECORD)["properties"]), (profiles, shared)),
        (get_contractor_details, "Get full contractor profile, all-time account totals and related record counts; agreement value is not debt.",
         obj({"contractor_id": CONTRACTOR_ID}), envelope({"contractor": CONTRACTOR_RECORD, "contract_count": INTEGER,
             "invoice_totals": INVOICE_TOTALS, "payment_count": INTEGER}), (profiles, shared)),
        (list_service_contracts, "List agreements using optional start-date bounds; agreement values differ from all-time linked invoice charges.",
         listing(CONTRACT_FILTERS, CONTRACT_SORTS), envelope(paged(CONTRACT_RECORD)["properties"]), (agreements, shared)),
        (get_service_contract_details, "Get full agreement and current all-time linked invoice financial totals, regardless of agreement status or dates.",
         obj({"contract_id": identifier("Authorized service contract ID.")}),
         envelope({"contract": CONTRACT_RECORD, "linked_invoice_totals": INVOICE_TOTALS}), (agreements, invoices)),
        (list_service_invoices, "List individual invoices by invoice-date cohort, including drafts; Paid/Remaining are current all-date settlement amounts.",
         listing(INVOICE_FILTERS, INVOICE_SORTS), envelope(paged(INVOICE_RECORD)["properties"]), (invoices, shared)),
        (get_service_invoice_details, "Get full invoice fields and independently paginated lines, all-date payments, attachment metadata and authorized audit changes. No file content.",
         obj({"invoice_id": identifier("Authorized invoice ID."), **detail_pages,
              "page_size": {"type": "integer", "minimum": 1, "maximum": 20, "default": 5}}, required=["invoice_id"]),
         envelope({"invoice": INVOICE_RECORD, "lines": paged(LINE_RECORD), "payments": paged(PAYMENT_RECORD),
                   "attachments": paged(ATTACHMENT_RECORD), "audit_changes": paged(AUDIT_RECORD)}), (invoices, payments)),
        (list_service_invoice_lines, "List rounded service-line records across matching invoices or one invoice; dates/status belong to the parent invoice.",
         listing(LINE_FILTERS, LINE_SORTS), envelope(paged(LINE_RECORD)["properties"]), (invoices, shared)),
        (list_contractor_payments, "List individual recorded disbursements by payment date, independent of invoice dates; no implicit month restriction.",
         listing(PAYMENT_FILTERS, PAYMENT_SORTS), envelope(paged(PAYMENT_RECORD)["properties"]), (payments, shared)),
        (get_contractor_ledger, "Get a paginated contractor ledger: non-draft invoice debits and payment credits, signed running balances; reconstructed from current records, not historical snapshots.",
         obj({"contractor_id": CONTRACTOR_ID, "date_from": date_filter("Transaction date lower bound"),
              "date_to": date_filter("Transaction date upper bound"), **PAGING,
              "order": {"type": "string", "enum": ["ascending", "descending"], "default": "ascending"}}, required=["contractor_id"]),
         envelope({"contractor_id": INTEGER, **paged(obj({"date": TEXT, "type": TEXT, "id": INTEGER, "label": TEXT,
              "status": TEXT, "debit": AMOUNT, "credit": AMOUNT, "running_balance": AMOUNT}))["properties"],
              "range": obj({"invoice_count": INTEGER, "payment_count": INTEGER, "opening_reconstructed": AMOUNT, "invoice_debits": AMOUNT, "payment_credits": AMOUNT, "closing_reconstructed": AMOUNT}),
              "current": CURRENT_ACCOUNT}), (profiles, payments, invoices)),
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
         (shared, "admin_contractors_dashboard", profiles, "admin_contractors_payables")),
        (get_service_contracts_summary, "Aggregate filtered agreements by start_date and stored status; sum agreement values separately from all-time current linked invoice charges and settlement.",
         obj(CONTRACT_FILTERS, required=[]), envelope({"count": INTEGER, "agreement_value": AMOUNT,
              "open_ended_count": INTEGER, "by_status": CONTRACT_STATUSES, "current_linked_invoices": INVOICE_TOTALS}), (agreements, shared)),
        (get_service_invoices_summary, "Aggregate invoice-date cohorts: counts/statuses, draft face value, recognized charges, current all-date Paid/Remaining and top ten service types. No historical or cash snapshot.",
         obj(INVOICE_FILTERS, required=[]), envelope({"totals": INVOICE_TOTALS, "by_status": INVOICE_STATUSES,
              "service_types": obj({"groups": array(obj({"service_type": TEXT, "line_count": INTEGER, "recognized_charges": AMOUNT})),
                                    "total_groups": INTEGER, "other_charges": AMOUNT})}), (invoices, "admin_contractors_payables", shared)),
        (get_contractor_payments_summary, "Aggregate payment-date disbursements, distinct providers/invoices, payment methods and current invoice states; not service expense or reconciled cash.",
         obj(PAYMENT_FILTERS, required=[]), envelope({"count": INTEGER, "recorded_payments": AMOUNT,
              "contractor_count": INTEGER, "invoice_count": INTEGER, "by_method": PAYMENT_METHODS,
              "by_current_invoice_status": array(obj({"status": TEXT, "count": INTEGER, "amount": AMOUNT}))}), (payments, shared)),
    ]
    return tuple(ToolDefinition(id=handler.__name__, description=description, domain="contractors", parameters=parameters,
                                output=output, knowledge_ids=knowledge_ids, authorize=partial(authorize_tool, handler.__name__), handler=handler)
                 for handler, description, parameters, output, knowledge_ids in specs)


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
         listing(EXPENSE_FILTERS, EXPENSE_SORTS), expense_envelope(paged(EXPENSE_RECORD)["properties"]), (expenses,)),
        (get_expense_details, "Get one authorized current expense: original amount/currency, saved exchange rate, AFN equivalent, expense date and description. No reliable history-record link exists.",
         obj({"expense_id": identifier("Authorized current expense record ID; obtain from list_expenses or the user.")}),
         expense_envelope({"expense": EXPENSE_RECORD}), (expenses, history)),
        (list_expense_history, "List expense creation/update/deletion snapshots and changed fields by recorded event timestamp in business timezone; audit events are not additional spending and have no expense ID link.",
         listing(HISTORY_FILTERS, HISTORY_SORTS), expense_envelope(paged(EXPENSE_HISTORY_RECORD)["properties"]), (history,)),
        (get_expense_summary, "Aggregate matching current expenses by expense date: counts, saved AFN totals/statistics, original currency totals, top ten names and latest twelve months with remainder totals. No history sums; USD is included in AFN.",
         obj(EXPENSE_FILTERS, required=[]), expense_envelope({
             "totals": obj({"count": INTEGER, "total_afn": AMOUNT, "average_afn": AMOUNT, "minimum_afn": AMOUNT,
                 "maximum_afn": AMOUNT, "first_expense_date": OPTIONAL_TEXT, "last_expense_date": OPTIONAL_TEXT,
                 "negative_amount_count": INTEGER, "zero_amount_count": INTEGER, "negative_rate_count": INTEGER}),
             "by_currency": array(obj({"currency": TEXT, "count": INTEGER, "original_amount": AMOUNT, "total_afn": AMOUNT})),
             "by_name": groups("name"), "by_month": groups("month")}), (expenses,)),
        (get_expense_history_summary, "Count audit events by action, original currency and latest twelve event months in business timezone, including first/last timestamps and remaining event counts. Never sum snapshots as expenses.",
         obj(HISTORY_FILTERS, required=[]), expense_envelope({"event_count": INTEGER, "first_event_at": OPTIONAL_TEXT,
             "last_event_at": OPTIONAL_TEXT, "by_action": array(obj({"action": TEXT, "event_count": INTEGER})),
             "by_currency": array(obj({"currency": TEXT, "event_count": INTEGER})),
             "by_month": obj({"groups": array(obj({"month": TEXT, "event_count": INTEGER})),
                              "total_groups": INTEGER, "other_event_count": INTEGER})}), (history,)),
    ]
    return tuple(ToolDefinition(id=handler.__name__, description=description, domain="finance", parameters=parameters,
        output=output, knowledge_ids=knowledge_ids, authorize=partial(authorize_tool, handler.__name__), handler=handler)
        for handler, description, parameters, output, knowledge_ids in specs)


def definitions():
    return contractor_definitions() + expense_definitions()


def register_tools(registry):
    for definition in definitions():
        registry.register(definition)
