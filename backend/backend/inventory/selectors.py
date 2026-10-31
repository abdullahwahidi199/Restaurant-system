"""Read-only Business Analyst selectors; no stock initialization or write services.

The API permission classes remain authoritative. Explicit filters only narrow a
server-resolved tenant/branch population, including malformed legacy relations.
"""
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.db.models import (
    Case, CharField, Count, DecimalField, ExpressionWrapper, F, IntegerField,
    OuterRef, Q, Subquery, Sum, Value, When,
)
from django.db.models.functions import Coalesce, Greatest, Least, TruncDay, TruncMonth
from knowledge.access import resolve_principal
from knowledge.errors import GatewayError
from .models import (
    Ingredient, IngredientStock, MenuItemIngredient, PurchaseInvoice,
    PurchaseInvoiceAttachment, PurchaseInvoiceLine, StockMovement, StockTransfer,
    StockTransferLog, Supplier, SupplierPayment,
)

ZERO = Decimal("0")
NUMBER = DecimalField(max_digits=32, decimal_places=5)
KABUL = ZoneInfo("Asia/Kabul")


class InventoryQueryError(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def decimal_string(value):
    return format(Decimal(value or 0), "f")


def json_values(value):
    if isinstance(value, Decimal):
        return decimal_string(value)
    if isinstance(value, datetime):
        return value.astimezone(KABUL).isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: json_values(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_values(item) for item in value]
    return value


def inventory_operation_views(operation):
    """Reuse each source's actual GET policy, never a union of domain roles."""
    from . import views as v
    stock = (v.IngredientListCreateView,)
    movements = (v.StockMovementListView,)
    recipes = (v.MenuItemIngredientListCreateView,)
    invoices = (v.purchase_invoice_list_create.cls,)
    suppliers = (v.SupplierListCreateView,)
    payments = (v.supplier_payment_list_create.cls,)
    transfers = (v.stock_transfer_list_create.cls,)
    return {
        "list_ingredients": stock,
        "get_ingredient_details": (v.IngredientRetrieveUpdateDestroyView,) + recipes,
        "list_ingredient_stocks": stock,
        "list_ingredient_recipe_usages": recipes,
        "list_ingredient_purchase_history": (v.ingredient_purchase_history_view.cls,),
        "list_stock_movements": movements, "get_stock_movement_details": movements,
        "list_low_stock_ingredients": (v.low_stock_items.cls,),
        "list_stock_transfers": transfers, "get_stock_transfer_details": transfers,
        "list_stock_transfer_logs": transfers,
        "list_suppliers": suppliers + invoices + payments,
        "get_supplier_details": (v.SupplierRetrieveUpdateView,) + invoices + payments,
        "list_purchase_invoices": invoices,
        "get_purchase_invoice_details": (v.purchase_invoice_detail.cls, v.purchase_invoice_attachment_list_create.cls) + payments,
        "list_purchase_invoice_lines": invoices,
        "list_supplier_payments": payments,
        "get_supplier_ledger": (v.supplier_ledger_view.cls,) + invoices + payments,
        "get_inventory_summary": (v.inventory_dashboard_summary.cls,),
        "get_ingredient_summary": stock + recipes + movements + invoices,
        "get_low_stock_summary": (v.low_stock_items.cls,),
        "get_stock_movements_summary": movements, "get_consumption_summary": movements,
        "get_waste_summary": movements, "get_stock_transfers_summary": transfers,
        "get_suppliers_summary": suppliers + invoices + payments,
        "get_supplier_summary": suppliers + invoices + payments,
        "get_purchase_invoices_summary": invoices,
        "get_supplier_payments_summary": payments,
        "get_procurement_summary": suppliers + invoices + payments,
    }.get(operation, ())


def authorize_inventory(principal, operation):
    """Used by registry authorization AND direct selector callers."""
    try:
        user = get_user_model().objects.select_related(
            "staff_profile__restaurant__subscription", "staff_profile__active_branch"
        ).get(pk=principal.user_id)
        if not principal.staff_id or resolve_principal(user).binding != principal.binding:
            raise InventoryQueryError("PERMISSION_DENIED")
    except (get_user_model().DoesNotExist, GatewayError, ValueError):
        raise InventoryQueryError("PERMISSION_DENIED") from None
    if not operation_permitted(user, operation):
        raise InventoryQueryError("PERMISSION_DENIED")
    return user


def operation_permitted(user, operation):
    """Check another source policy against the already revalidated account."""
    request = SimpleNamespace(user=user, method="GET", query_params={})
    policies = inventory_operation_views(operation)
    if not policies:
        return False
    for policy in policies:
        view = policy()
        view.request, view.args, view.kwargs = request, (), {}
        if not all(p.has_permission(request, view) for p in view.get_permissions()):
            return False
    return True


def total(qs, field):
    return qs.aggregate(value=Sum(field, output_field=NUMBER))["value"] or ZERO


def correlated_total(qs, group, field):
    sub = qs.filter(**{group: OuterRef("pk")}).order_by().values(group).annotate(
        value=Sum(field, output_field=NUMBER)).values("value")[:1]
    return Coalesce(Subquery(sub, output_field=NUMBER), Value(ZERO, output_field=NUMBER))


def group_page(qs, dimensions, metrics, p):
    """DB aggregates across the complete population; paginate groups only."""
    groups = qs.order_by().values(*dimensions).annotate(count=Count("pk"), **metrics)
    sort = p.get("ranking", "identity")
    metric = next(iter(metrics), "count")
    ordering = ([f"-{metric}"] if sort == "highest" else [metric] if sort == "lowest" else []) + list(dimensions)
    return paginate(groups, p, ordering)


def paginate(qs, p, ordering):
    size, number = p.get("page_size", 15), p.get("page", 1)
    count = qs.count()
    return {"results": list(qs.order_by(*ordering)[(number - 1) * size:number * size]),
            "pagination": {"page": number, "page_size": size, "total": count, "has_more": number * size < count}}


class InventoryQueries:
    """AI-specific selectors with fresh authorization and mandatory trusted scope."""
    def __init__(self, *, principal, operation, parameters):
        self.user = authorize_inventory(principal, operation)
        self.principal, self.p, self.operation = principal, dict(parameters), operation
        self.restaurant_id, self.branch_id = int(principal.restaurant_id), int(principal.branch_id)
        try:
            parsed = {key: date.fromisoformat(self.p[key]) for key in ("date", "date_from", "date_to") if key in self.p}
            if "date" in parsed and ("date_from" in parsed or "date_to" in parsed):
                raise ValueError
            if parsed.get("date_from", date.min) > parsed.get("date_to", date.max):
                raise ValueError
        except (ValueError, TypeError):
            raise InventoryQueryError("INVALID_PARAMETERS") from None
        scope = dict(restaurant_id=self.restaurant_id, branch_id=self.branch_id)
        self.ingredients = Ingredient.objects.filter(restaurant_id=self.restaurant_id).filter(
            Q(branch_id=self.branch_id) | Q(branch__isnull=True))
        self.suppliers = Supplier.objects.filter(**scope)
        self.invoices = PurchaseInvoice.objects.filter(**scope).filter(
            Q(supplier__isnull=True) | Q(supplier_id__in=self.suppliers.values("pk")))
        self.lines = PurchaseInvoiceLine.objects.filter(invoice_id__in=self.invoices.values("pk"),
                                                       ingredient_id__in=self.ingredients.values("pk"))
        self.payments = SupplierPayment.objects.filter(**scope, supplier_id__in=self.suppliers.values("pk"),
            purchase_invoice_id__in=self.invoices.values("pk"), purchase_invoice__supplier_id=F("supplier_id"))
        self.movements = StockMovement.objects.filter(**scope, ingredient_id__in=self.ingredients.values("pk")).filter(
            Q(related_order__isnull=True) | Q(related_order__restaurant_id=self.restaurant_id, related_order__branch_id=self.branch_id))
        self.excluded_movement_types = []
        if not operation_permitted(self.user, "list_stock_transfers"):
            self.excluded_movement_types = ["transfer_in", "transfer_out"]
            self.movements = self.movements.exclude(movement_type__in=self.excluded_movement_types)
        self.recipes = MenuItemIngredient.objects.filter(ingredient_id__in=self.ingredients.values("pk"),
            menu_item__restaurant_id=self.restaurant_id).filter(Q(menu_item__branch_id=self.branch_id) | Q(menu_item__branch__isnull=True))
        # Transfer GET permits either endpoint in the active branch, including
        # read-only visibility for BranchAdmin. It does not grant unrelated stock.
        self.transfers = StockTransfer.objects.filter(restaurant_id=self.restaurant_id,
            from_branch__restaurant_id=self.restaurant_id, to_branch__restaurant_id=self.restaurant_id,
            ingredient__restaurant_id=self.restaurant_id).filter(
                Q(from_branch_id=self.branch_id) | Q(to_branch_id=self.branch_id)).filter(
                Q(ingredient__branch__isnull=True) | Q(ingredient__branch_id=F("from_branch_id")))

    def dates(self, qs, field, *, timestamp=False):
        lower = self.p.get("date", self.p.get("date_from"))
        upper = self.p.get("date", self.p.get("date_to"))
        for bound, lookup in ((lower, "gte"), (upper, "lt" if timestamp else "lte")):
            if bound:
                value = date.fromisoformat(bound)
                if timestamp:
                    if lookup == "lt":
                        value += timedelta(days=1)
                    value = datetime.combine(value, time.min, tzinfo=KABUL)
                qs = qs.filter(**{f"{field}__{lookup}": value})
        return qs

    def related(self, qs, relation, prefix=""):
        for suffix, lookup in (("id", f"{prefix}{relation}_id"), ("name", f"{prefix}{relation}__name__icontains")):
            key = f"{relation}_{suffix}"
            if key in self.p:
                qs = qs.filter(**{lookup: self.p[key]})
        return qs

    def ingredient_filter(self, qs):
        p = self.p
        if "ingredient_id" in p:
            qs = qs.filter(pk=p["ingredient_id"])
        if "ingredient_name" in p:
            qs = qs.filter(name__icontains=p["ingredient_name"])
        if "unit" in p:
            qs = qs.filter(unit=p["unit"])
        if "is_active" in p:
            qs = qs.filter(is_active=p["is_active"])
        return qs

    def positions(self, branch_id=None):
        branch_id = branch_id or self.branch_id
        qs = Ingredient.objects.filter(restaurant_id=self.restaurant_id).filter(Q(branch_id=branch_id) | Q(branch__isnull=True))
        stocks = IngredientStock.objects.filter(restaurant_id=self.restaurant_id, branch_id=branch_id, ingredient_id=OuterRef("pk"))
        # Branch-owned definitions use Ingredient. Shared definitions use only
        # their branch row. Missing shared rows are explicitly unknown, never a
        # fallback to a restaurant-wide quantity or a get_or_create side effect.
        for alias, field in (("available", "quantity_available"), ("threshold", "minimum_threshold"), ("cost", "cost_per_unit")):
            qs = qs.annotate(**{alias: Case(When(branch__isnull=True, then=Subquery(stocks.values(field)[:1])),
                default=F(field), output_field=NUMBER)})
        qs = qs.annotate(stock_row_id=Subquery(stocks.values("pk")[:1]),
            stock_active=Case(When(branch__isnull=True, then=Subquery(stocks.values("is_active")[:1])), default=F("is_active")),
            applicable_branch_id=Value(branch_id, output_field=IntegerField()),
            stock_status=Case(When(available__isnull=True, then=Value("unknown")),
                When(available=0, then=Value("out_of_stock")), When(available__lt=0, then=Value("negative")),
                When(available__lte=F("threshold"), then=Value("low_stock")), default=Value("normal"), output_field=CharField()),
            stock_value=ExpressionWrapper(F("available") * F("cost"), output_field=NUMBER))
        qs = self.ingredient_filter(qs)
        if "stock_status" in self.p:
            qs = qs.filter(stock_status=self.p["stock_status"])
        for key, status in (("low_stock", "low_stock"), ("out_of_stock", "out_of_stock")):
            if key in self.p:
                qs = qs.filter(stock_status=status) if self.p[key] else qs.exclude(stock_status=status)
        return qs

    def stock_positions(self):
        ids = self.p.get("stock_branch_ids", [self.branch_id])
        staff = self.user.staff_profile
        if ids != [self.branch_id] and not staff.has_all_branch_access:
            raise InventoryQueryError("PERMISSION_DENIED")
        permitted = set(staff.get_available_branches().filter(restaurant_id=self.restaurant_id, is_active=True, pk__in=ids).values_list("pk", flat=True))
        if permitted != set(ids):
            raise InventoryQueryError("PERMISSION_DENIED")
        columns = ("id", "name", "unit", "is_active", "branch_id", "available", "threshold", "cost",
                   "stock_row_id", "stock_active", "applicable_branch_id", "stock_status", "stock_value")
        queries = [self.positions(b).order_by().values(*columns) for b in sorted(permitted)]
        return queries[0].union(*queries[1:], all=True) if len(queries) > 1 else queries[0]

    @staticmethod
    def one(qs, p, id_key, name_key, name_field="name"):
        if id_key in p:
            qs = qs.filter(pk=p[id_key])
        if name_key in p:
            qs = qs.filter(**{f"{name_field}__icontains": p[name_key]})
        if id_key not in p and name_key not in p:
            raise InventoryQueryError("INVALID_PARAMETERS")
        matches = list(qs.order_by("pk")[:2])
        if not matches:
            raise InventoryQueryError("RECORD_NOT_AVAILABLE")
        if len(matches) > 1:
            raise InventoryQueryError("AMBIGUOUS_RECORD")
        return matches[0]

    def filtered_movements(self):
        requested = set(self.p.get("movement_types", [])) | {self.p.get("movement_type")}
        if requested.intersection(self.excluded_movement_types):
            raise InventoryQueryError("PERMISSION_DENIED")
        qs = self.related(self.movements, "ingredient")
        if "movement_type" in self.p:
            qs = qs.filter(movement_type=self.p["movement_type"])
        if "movement_types" in self.p:
            qs = qs.filter(movement_type__in=self.p["movement_types"])
        if "order_id" in self.p:
            qs = qs.filter(related_order_id=self.p["order_id"])
        return self.dates(qs, "created_at", timestamp=True)

    def filtered_transfers(self):
        qs = self.related(self.transfers, "ingredient")
        for key in ("status", "from_branch_id", "to_branch_id"):
            if key in self.p:
                qs = qs.filter(**{key: self.p[key]})
        return self.dates(qs, "created_at", timestamp=True)

    def filtered_suppliers(self):
        qs = self.suppliers
        if "supplier_id" in self.p:
            qs = qs.filter(pk=self.p["supplier_id"])
        if "supplier_name" in self.p:
            qs = qs.filter(name__icontains=self.p["supplier_name"])
        if "is_active" in self.p:
            qs = qs.filter(is_active=self.p["is_active"])
        return qs

    def financial_suppliers(self, qs):
        # Supplier properties: recognized invoice sum - ALL payment rows, floored
        # per supplier. Correlated subqueries prevent invoice/payment join fanout.
        return qs.annotate(purchases=correlated_total(self.invoices.exclude(status="draft"), "supplier_id", "total_amount"),
            paid=correlated_total(self.payments, "supplier_id", "amount")).annotate(
                balance=Greatest(F("purchases") - F("paid"), Value(ZERO), output_field=NUMBER))

    def financial_invoices(self, qs):
        return qs.annotate(linked_paid=correlated_total(self.payments, "purchase_invoice_id", "amount")).annotate(
            effective_paid=Case(When(status="draft", then=Value(ZERO)),
                When(supplier__isnull=False, then=Least(F("linked_paid"), F("total_amount"))),
                default=Least(F("amount_paid"), F("total_amount")), output_field=NUMBER)).annotate(
            remaining=Case(When(status="draft", then=Value(ZERO)),
                default=Greatest(F("total_amount") - F("effective_paid"), Value(ZERO)), output_field=NUMBER))

    def filtered_invoices(self):
        qs = self.related(self.invoices, "supplier")
        for key in ("invoice_id", "invoice_number", "status", "is_inventory_posted"):
            if key in self.p:
                lookup = "pk" if key == "invoice_id" else "invoice_number__icontains" if key == "invoice_number" else key
                qs = qs.filter(**{lookup: self.p[key]})
        if "ingredient_id" in self.p or "ingredient_name" in self.p:
            qs = qs.filter(pk__in=self.related(self.lines, "ingredient").values("invoice_id"))
        return self.dates(qs, "purchase_date")

    def filtered_lines(self, *, history=False):
        invoices = self.filtered_invoices()
        if history and "status" not in self.p:
            invoices = invoices.exclude(status="draft")
        return self.related(self.lines.filter(invoice_id__in=invoices.values("pk")), "ingredient")

    def filtered_payments(self):
        qs = self.related(self.payments, "supplier")
        if "invoice_id" in self.p:
            qs = qs.filter(purchase_invoice_id=self.p["invoice_id"])
        if "invoice_number" in self.p:
            qs = qs.filter(purchase_invoice__invoice_number__icontains=self.p["invoice_number"])
        if "payment_method" in self.p:
            qs = qs.filter(payment_method=self.p["payment_method"])
        return self.dates(qs, "date")

    def inventory_summary(self, *, low=False):
        qs = self.positions()
        if low:
            qs = qs.filter(Q(available__lte=F("threshold")) | Q(stock_status="out_of_stock"))
        current = qs.aggregate(ingredient_count=Count("pk"), active=Count("pk", filter=Q(is_active=True)),
            inactive=Count("pk", filter=Q(is_active=False)), low_stock=Count("pk", filter=Q(stock_status="low_stock")),
            out_of_stock=Count("pk", filter=Q(stock_status="out_of_stock")), negative=Count("pk", filter=Q(stock_status="negative")),
            unknown_stock=Count("pk", filter=Q(stock_status="unknown")), valuation=Sum("stock_value", default=ZERO, output_field=NUMBER))
        current["valuation_complete"] = current["unknown_stock"] == 0
        current["valuation_scope"] = (
            "All matching ingredient definitions, INCLUDING INACTIVE unless is_active is explicitly filtered. "
            "Valuation sums their known branch positions; negative positions offset the total. "
            "Unknown shared branch stock is excluded as unknown, never valued at zero. "
            "This population can differ from the ordinary UI dashboard's active-only valuation."
        )
        return {"current": current,
            "by_unit_status": list(qs.order_by().values("unit", "stock_status", "is_active").annotate(count=Count("pk"),
                quantity=Sum("available"), threshold=Sum("threshold"), value=Sum("stock_value")))}

    def movement_summary(self, *, source=None):
        qs = self.filtered_movements()
        if source == "consumption":
            types = {"order": ["order"], "production": ["production", "production_adjustment"]}.get(
                self.p.get("source"), ["order", "production", "production_adjustment"])
            qs = qs.filter(movement_type__in=types)
        elif source == "waste":
            qs = qs.filter(movement_type="waste")
        metrics = {"net_quantity": Sum("change_quantity", default=ZERO),
            "increases": Sum("change_quantity", filter=Q(change_quantity__gt=0), default=ZERO),
            "decreases": Sum("change_quantity", filter=Q(change_quantity__lt=0), default=ZERO)}
        if source:
            metrics = {"net_recorded_usage": -Sum("change_quantity", default=ZERO), **metrics}
        trend = TruncDay if self.p.get("group_by") == "day" else TruncMonth
        return {"movement_count": qs.count(),
            "excluded_movement_types": self.excluded_movement_types if not source else [],
            "by_unit": list(qs.order_by().values("ingredient__unit").annotate(count=Count("pk"), **metrics)),
            "by_type_unit": list(qs.order_by().values("movement_type", "ingredient__unit").annotate(count=Count("pk"), **metrics)),
            "by_ingredient": group_page(qs, ("ingredient_id", "ingredient__name", "ingredient__unit"), metrics, self.p),
            "trends": group_page(qs.annotate(period=trend("created_at", tzinfo=KABUL)),
                ("period", "ingredient__unit", "movement_type"), metrics, self.p)}

    def transfers_summary(self):
        qs = self.filtered_transfers()
        return {"transfer_count": qs.count(), "by_status": list(qs.order_by().values("status").annotate(count=Count("pk"))),
            "quantities": group_page(qs, ("ingredient_id", "ingredient__name", "ingredient__unit", "status", "from_branch_id", "to_branch_id"),
                {"request_quantity": Sum("quantity"),
                 "approved_quantity": Sum("quantity", filter=Q(status="approved"), default=ZERO),
                 "pending_quantity": Sum("quantity", filter=Q(status="pending"), default=ZERO)}, self.p)}

    def invoice_totals(self, qs):
        qs = self.financial_invoices(qs)
        return qs.aggregate(count=Count("pk"), recognized_count=Count("pk", filter=~Q(status="draft")),
            draft_count=Count("pk", filter=Q(status="draft")),
            recognized_charges=Sum("total_amount", filter=~Q(status="draft"), default=ZERO, output_field=NUMBER),
            draft_face_value=Sum("total_amount", filter=Q(status="draft"), default=ZERO, output_field=NUMBER),
            current_capped_paid=Sum("effective_paid", default=ZERO, output_field=NUMBER),
            current_remaining=Sum("remaining", default=ZERO, output_field=NUMBER),
            unpaid_count=Count("pk", filter=~Q(status="draft") & Q(remaining__gt=0)))

    def purchase_summary(self):
        qs = self.filtered_invoices()
        lines = self.filtered_lines().exclude(invoice__status="draft")
        trend = TruncDay if self.p.get("group_by") == "day" else TruncMonth
        return {"invoice_cohort": self.invoice_totals(qs),
            "by_status": list(qs.order_by().values("status").annotate(count=Count("pk"), face_value=Sum("total_amount"))),
            "by_supplier": group_page(qs.exclude(status="draft"), ("supplier_id", "supplier__name"), {"charges": Sum("total_amount")}, self.p),
            "ingredients": group_page(lines, ("ingredient_id", "ingredient__name", "ingredient__unit"),
                {"quantity": Sum("quantity"), "line_charges": Sum("total_price")}, self.p),
            "trends": group_page(qs.exclude(status="draft").annotate(period=trend("purchase_date")),
                ("period",), {"charges": Sum("total_amount")}, self.p)}

    def payment_summary(self):
        qs = self.filtered_payments()
        trend = TruncDay if self.p.get("group_by") == "day" else TruncMonth
        return {"payment_count": qs.count(), "recorded_payments": total(qs, "amount"),
            "by_method": list(qs.order_by().values("payment_method").annotate(count=Count("pk"), amount=Sum("amount"))),
            "by_supplier": group_page(qs, ("supplier_id", "supplier__name"), {"amount": Sum("amount")}, self.p),
            "by_invoice": group_page(qs, ("purchase_invoice_id", "purchase_invoice__invoice_number"), {"amount": Sum("amount")}, self.p),
            "trends": group_page(qs.annotate(period=trend("date")), ("period",), {"amount": Sum("amount")}, self.p)}

    def current_suppliers(self, suppliers=None):
        qs = self.financial_suppliers(self.filtered_suppliers() if suppliers is None else suppliers)
        sums = qs.aggregate(count=Count("pk"), active=Count("pk", filter=Q(is_active=True)),
            inactive=Count("pk", filter=Q(is_active=False)), recognized_purchases=Sum("purchases", default=ZERO),
            recorded_payments=Sum("paid", default=ZERO), sum_supplier_balances=Sum("balance", default=ZERO))
        sums["aggregate_net_first_balance"] = max(sums["recognized_purchases"] - sums["recorded_payments"], ZERO)
        sums["recognized_invoice_remaining"] = self.invoice_totals(self.invoices.filter(supplier_id__in=qs.values("pk")))["current_remaining"]
        return sums

    def supplier_activity(self, *, one=False):
        suppliers = self.filtered_suppliers()
        row = None
        if one:
            row = self.one(self.financial_suppliers(suppliers), self.p, "supplier_id", "supplier_name")
            suppliers = suppliers.filter(pk=row.pk)
        # Restrict BOTH activity sources to the same supplier population while
        # retaining their independent purchase/payment dates.
        self.invoices = self.invoices.filter(supplier_id__in=suppliers.values("pk"))
        self.lines = self.lines.filter(invoice_id__in=self.invoices.values("pk"))
        self.payments = self.payments.filter(supplier_id__in=suppliers.values("pk"))
        ranking = self.p.get("ranking", "highest")
        ordering = ["name", "pk"] if ranking == "identity" else ["balance" if ranking == "lowest" else "-balance", "pk"]
        return row, {"current": self.current_suppliers(suppliers),
            "purchases": self.purchase_summary(), "payments": self.payment_summary(),
            "supplier_ranking": paginate(self.financial_suppliers(suppliers).values("id", "name", "is_active", "purchases", "paid", "balance"),
                self.p, ordering)}

    def ledger(self):
        supplier = self.one(self.financial_suppliers(self.suppliers), self.p, "supplier_id", "supplier_name")
        invoices = self.invoices.filter(supplier_id=supplier.pk).exclude(status="draft")
        payments = self.payments.filter(supplier_id=supplier.pk)
        lower = self.p.get("date", self.p.get("date_from"))
        opening = total(invoices.filter(purchase_date__lt=lower), "total_amount") - total(payments.filter(date__lt=lower), "amount") if lower else ZERO
        period_invoices, period_payments = self.dates(invoices, "purchase_date"), self.dates(payments, "date")
        # Same date/type/id order as supplier_ledger, but DB pagination and
        # Decimal arithmetic avoid its float conversion and unbounded row load.
        debits = period_invoices.order_by().annotate(event_date=F("purchase_date"), entry_type=Value("invoice"),
            reference=F("invoice_number"), debit=F("total_amount"), credit=Value(ZERO, output_field=NUMBER)).values(
                "id", "event_date", "entry_type", "reference", "debit", "credit")
        credits = period_payments.order_by().annotate(event_date=F("date"), entry_type=Value("payment"),
            reference=F("reference_number"), debit=Value(ZERO, output_field=NUMBER), credit=F("amount")).values(
                "id", "event_date", "entry_type", "reference", "debit", "credit")
        entries = paginate(debits.union(credits, all=True), self.p, ["event_date", "entry_type", "id"])
        for entry in entries["results"]:
            day, pk, kind = entry["event_date"], entry["id"], entry["entry_type"]
            entry["reference"] = entry["reference"] or (f"PINV-{pk}" if kind == "invoice" else f"PAY-{pk}")
            inv_before = Q(purchase_date__lt=day) | (Q(purchase_date=day, pk__lte=pk) if kind == "invoice" else Q(purchase_date=day))
            pay_before = Q(date__lt=day) | (Q(date=day, pk__lte=pk) if kind == "payment" else Q(pk__in=[]))
            entry["signed_change"] = entry["debit"] - entry["credit"]
            entry["running_balance"] = total(invoices.filter(inv_before), "total_amount") - total(payments.filter(pay_before), "amount")
        charges, paid = total(period_invoices, "total_amount"), total(period_payments, "amount")
        return supplier, {**entries, "opening_reconstructed": opening, "invoice_debits": charges,
            "payment_credits": paid, "closing_reconstructed": opening + charges - paid}

    def records(self, kind):
        """AI record selectors; all related objects are tenant/branch constrained."""
        if kind == "ingredients":
            return self.positions()
        if kind == "stocks":
            return self.stock_positions()
        if kind == "low_stock":
            return self.positions().filter(Q(available__lte=F("threshold")) | Q(stock_status="out_of_stock"))
        if kind == "recipes":
            qs = self.related(self.related(self.recipes, "ingredient"), "menu_item")
            return qs.select_related("ingredient", "menu_item")
        if kind in {"lines", "history"}:
            return self.filtered_lines(history=kind == "history").select_related("invoice__supplier", "ingredient", "stock_movement")
        if kind == "movements":
            return self.filtered_movements().select_related("ingredient", "created_by", "related_order")
        if kind == "transfers":
            return self.filtered_transfers().select_related("ingredient", "from_branch", "to_branch", "created_by", "approved_by")
        if kind == "logs":
            parent = self.one(self.transfers, self.p, "transfer_id", "unused")
            qs = StockTransferLog.objects.filter(transfer=parent).select_related("actor")
            if "action" in self.p:
                qs = qs.filter(action=self.p["action"])
            return self.dates(qs, "created_at", timestamp=True)
        if kind == "suppliers":
            return self.financial_suppliers(self.filtered_suppliers())
        if kind == "invoices":
            return self.financial_invoices(self.filtered_invoices()).select_related("supplier", "created_by")
        if kind == "payments":
            return self.filtered_payments().select_related("supplier", "purchase_invoice", "created_by")
        raise ValueError("Unknown server-owned selector")

    def ingredient_detail(self):
        row = self.one(self.positions(), self.p, "ingredient_id", "ingredient_name")
        return row, self.recipes.filter(ingredient_id=row.pk).count()

    def supplier_detail(self):
        row = self.one(self.financial_suppliers(self.suppliers), self.p, "supplier_id", "supplier_name")
        return row, {"invoice_totals": self.invoice_totals(self.invoices.filter(supplier_id=row.pk)),
                     "payment_count": self.payments.filter(supplier_id=row.pk).count()}

    def invoice_detail(self):
        row = self.one(self.records("invoices"), self.p, "invoice_id", "invoice_number", "invoice_number")
        return row, {
            "lines": self.lines.filter(invoice=row).select_related("invoice__supplier", "ingredient", "stock_movement"),
            "payments": self.payments.filter(purchase_invoice=row).select_related("supplier", "purchase_invoice", "created_by"),
            "attachments": PurchaseInvoiceAttachment.objects.filter(invoice=row, restaurant_id=self.restaurant_id,
                branch_id=self.branch_id).select_related("uploaded_by")}

    def ingredient_summary(self):
        row, recipe_count = self.ingredient_detail()
        self.p["ingredient_id"] = row.pk
        lines = self.filtered_lines(history=True).exclude(invoice__status="draft")
        return row, {"recipe_usage_count": recipe_count,
            "purchase_activity": lines.aggregate(line_count=Count("pk"), quantity=Sum("quantity", default=ZERO),
                line_charges=Sum("total_price", default=ZERO)),
            "movement_activity": self.movement_summary()}

    def procurement_summary(self):
        return {"current_supplier_accounts": self.current_suppliers(),
            "purchase_activity": self.purchase_summary(), "payment_activity": self.payment_summary(),
            "supplierless_activity": self.invoice_totals(self.filtered_invoices().filter(supplier__isnull=True)),
            "current_supplierless_invoices": self.invoice_totals(self.invoices.filter(supplier__isnull=True))}

    def suppliers_summary(self):
        supplierless = self.invoice_totals(self.filtered_invoices().filter(supplier__isnull=True))
        _, summary = self.supplier_activity()
        return {**summary, "supplierless_activity": supplierless}
