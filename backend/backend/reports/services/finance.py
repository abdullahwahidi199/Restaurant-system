from datetime import datetime, time, timedelta
from decimal import Decimal

from django.db.models import (
    Count, DecimalField, F, Prefetch, Q, Sum
)
from django.utils import timezone
from django.utils.dateparse import parse_date

from contractors.models import ContractorInvoice, ContractorInvoiceLine, ContractorPayment
from expenses.models import Expenses
from inventory.models import PurchaseInvoice, PurchaseInvoiceLine, StockMovement, SupplierPayment
from inventory.services import get_effective_cost_per_unit, get_recipe_items
from orders.models import Order, OrderItem
from users.models import Payroll, PayrollPayment, SalaryAdvance


class FinanceReportService:

    @staticmethod
    def _parse_range(start, end):
        today = timezone.now().date()
        start_date = parse_date(start) if start else today - timedelta(days=30)
        end_date = parse_date(end) if end else today

        start_dt = timezone.make_aware(datetime.combine(start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(end_date, time.max))

        return start_dt, end_dt

    @staticmethod
    def _order_total(order):
        """Replicates Order.get_total() using prefetched items (zero DB hits)."""
        prefetched = getattr(order, "_prefetched_objects_cache", {})
        if "items" in prefetched:
            items = [i for i in prefetched["items"] if i.status != "cancelled"]
        else:
            items = [i for i in order.items.all() if i.status != "cancelled"]

        items_total = sum(
            (i.get_subtotal() for i in items),
            Decimal("0.00")
        )

        reservation_total = Decimal("0.00")
        if order.reservation:
            r = order.reservation
            if r.reservation_type in ("fee", "prepaid"):
                reservation_total = r.total_price

        delivery_total = (
            Decimal(str(order.delivery_fee or 0))
            if order.order_type == "delivery"
            else Decimal("0.00")
        )

        subtotal = items_total + reservation_total + delivery_total
        discount = (subtotal * Decimal(str(order.discount_percent or 0))) / Decimal("100")
        return subtotal - discount

    @staticmethod
    def profit_loss(start, end, restaurant, branch=None):
        SUCCESSFUL_STATUSES = ["completed", "delivered"]
        start_dt, end_dt = FinanceReportService._parse_range(start, end)
        money_field = DecimalField(max_digits=14, decimal_places=2)

        # -------- 1. Load every successful order + full item tree ----------
        order_qs = Order.objects.filter(
                restaurant=restaurant,
                created_at__range=(start_dt, end_dt),
                status__in=SUCCESSFUL_STATUSES,
            )
        if branch:
            order_qs = order_qs.filter(branch=branch)

        orders = list(
            order_qs
            .select_related("reservation__table")
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related(
                        "menu_item", "platter"
                    ).prefetch_related(
                        "platter__items__menu_item"
                    )
                )
            )
        )

        # -------- 2. Revenue (Python-side, no extra queries) ----------
        revenue = sum(
            (FinanceReportService._order_total(o) for o in orders),
            Decimal("0")
        )

        # -------- 3. Gather items & every menu_item ID needed for COGS ----------
        all_items = []
        menu_item_ids = set()

        for order in orders:
            for item in order.items.all():          # uses prefetch cache
                all_items.append(item)
                if item.menu_item_id:
                    menu_item_ids.add(item.menu_item_id)
                elif item.platter_id:
                    for pi in item.platter.items.all():  # uses prefetch cache
                        if pi.menu_item_id:
                            menu_item_ids.add(pi.menu_item_id)

        # -------- 4. Cache branch-effective recipe costs ----------
        cost_cache = {}

        def menu_item_cost(menu_item, cost_branch):
            key = (menu_item.id, cost_branch.id if cost_branch else None)
            if key not in cost_cache:
                total = Decimal("0.00")
                for recipe in get_recipe_items(menu_item, branch=cost_branch):
                    total += (
                        Decimal(recipe.quantity_required)
                        * Decimal(get_effective_cost_per_unit(recipe.ingredient, cost_branch))
                    )
                cost_cache[key] = total
            return cost_cache[key]

        # -------- 5. COGS (pure Python, zero N+1) ----------
        cogs = Decimal("0")
        for item in all_items:
            if item.menu_item_id:
                unit_cost = menu_item_cost(item.menu_item, item.order.branch)
                cogs += Decimal(item.quantity) * unit_cost

            elif item.platter_id:
                platter_cost = Decimal("0")
                for pi in item.platter.items.all():
                    unit_cost = menu_item_cost(pi.menu_item, item.order.branch)
                    platter_cost += Decimal(pi.quantity) * unit_cost
                cogs += Decimal(item.quantity) * platter_cost

        # -------- 6. Procurement: purchase value, payments, payables ----------
        purchase_invoice_qs = PurchaseInvoice.objects.filter(
            restaurant=restaurant,
            purchase_date__range=(start_dt.date(), end_dt.date()),
        ).exclude(status=PurchaseInvoice.STATUS_DRAFT)
        if branch:
            purchase_invoice_qs = purchase_invoice_qs.filter(branch=branch)

        purchase_invoices = list(
            purchase_invoice_qs.select_related("supplier", "branch")
        )
        purchases = sum(
            (Decimal(invoice.total_amount or 0) for invoice in purchase_invoices),
            Decimal("0.00"),
        )

        # Safety net for purchase movements that somehow have no invoice line.
        unlinked_purchase_qs = StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__range=(start_dt, end_dt),
            movement_type="purchase",
            purchase_invoice_line__isnull=True,
        )
        if branch:
            unlinked_purchase_qs = unlinked_purchase_qs.filter(branch=branch)

        for movement in unlinked_purchase_qs.select_related("ingredient", "branch"):
            unit_cost = (
                movement.unit_cost
                if movement.unit_cost is not None
                else get_effective_cost_per_unit(movement.ingredient, movement.branch)
            )
            purchases += Decimal(movement.change_quantity or 0) * Decimal(unit_cost or 0)

        supplier_payment_qs = SupplierPayment.objects.filter(
            restaurant=restaurant,
            date__range=(start_dt.date(), end_dt.date()),
        )
        if branch:
            supplier_payment_qs = supplier_payment_qs.filter(branch=branch)

        supplier_payments = (
            supplier_payment_qs.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        payable_invoice_qs = PurchaseInvoice.objects.filter(
            restaurant=restaurant,
        ).exclude(status=PurchaseInvoice.STATUS_DRAFT)
        if branch:
            payable_invoice_qs = payable_invoice_qs.filter(branch=branch)

        outstanding_supplier_payables = sum(
            (
                Decimal(invoice.remaining_balance)
                for invoice in payable_invoice_qs.select_related("supplier")
                if invoice.supplier_id
            ),
            Decimal("0.00"),
        )

        purchases_by_supplier = {}
        for invoice in purchase_invoices:
            supplier_name = invoice.supplier.name if invoice.supplier_id else "Cash / No Supplier"
            row = purchases_by_supplier.setdefault(
                supplier_name,
                {
                    "supplier": supplier_name,
                    "invoice_count": 0,
                    "purchase_value": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "outstanding": Decimal("0.00"),
                },
            )
            row["invoice_count"] += 1
            row["purchase_value"] += Decimal(invoice.total_amount or 0)
            row["paid"] += Decimal(invoice.amount_paid or 0)
            row["outstanding"] += Decimal(invoice.remaining_balance)

        purchase_lines = PurchaseInvoiceLine.objects.filter(
            invoice__in=purchase_invoice_qs,
        ).select_related("ingredient")

        purchases_by_ingredient = {}
        for line in purchase_lines:
            ingredient_name = line.ingredient.name if line.ingredient_id else "-"
            row = purchases_by_ingredient.setdefault(
                ingredient_name,
                {
                    "ingredient": ingredient_name,
                    "unit": line.ingredient.unit if line.ingredient_id else "",
                    "quantity": Decimal("0.00"),
                    "purchase_value": Decimal("0.00"),
                    "invoice_count": 0,
                },
            )
            row["quantity"] += Decimal(line.quantity or 0)
            row["purchase_value"] += Decimal(line.total_price or 0)
            row["invoice_count"] += 1

        purchases_by_branch = {}
        for invoice in purchase_invoices:
            branch_name = invoice.branch.name if invoice.branch_id else "No Branch"
            row = purchases_by_branch.setdefault(
                branch_name,
                {
                    "branch": branch_name,
                    "invoice_count": 0,
                    "purchase_value": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "outstanding": Decimal("0.00"),
                },
            )
            row["invoice_count"] += 1
            row["purchase_value"] += Decimal(invoice.total_amount or 0)
            row["paid"] += Decimal(invoice.amount_paid or 0)
            row["outstanding"] += Decimal(invoice.remaining_balance)

        unpaid_purchase_invoices = [
            {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number or f"PINV-{invoice.id}",
                "supplier": invoice.supplier.name if invoice.supplier_id else "Cash / No Supplier",
                "branch": invoice.branch.name if invoice.branch_id else "-",
                "purchase_date": invoice.purchase_date.strftime("%Y-%m-%d"),
                "due_date": invoice.due_date.strftime("%Y-%m-%d") if invoice.due_date else None,
                "total_amount": float(round(Decimal(invoice.total_amount or 0), 2)),
                "amount_paid": float(round(Decimal(invoice.amount_paid or 0), 2)),
                "remaining_balance": float(round(Decimal(invoice.remaining_balance), 2)),
                "status": invoice.status,
            }
            for invoice in purchase_invoice_qs.filter(
                status__in=[
                    PurchaseInvoice.STATUS_UNPAID,
                    PurchaseInvoice.STATUS_PARTIALLY_PAID,
                ]
            ).select_related("supplier", "branch")[:25]
        ]

        # -------- 7. Contractor service invoices, payments, and payables ----------
        contractor_invoice_qs = ContractorInvoice.objects.filter(
            restaurant=restaurant,
            invoice_date__range=(start_dt.date(), end_dt.date()),
        ).exclude(status=ContractorInvoice.STATUS_DRAFT)
        if branch:
            contractor_invoice_qs = contractor_invoice_qs.filter(branch=branch)

        contractor_invoices = list(
            contractor_invoice_qs.select_related("contractor", "contract", "branch")
        )
        contractor_expenses = sum(
            (Decimal(invoice.total_amount or 0) for invoice in contractor_invoices),
            Decimal("0.00"),
        )

        contractor_payment_qs = ContractorPayment.objects.filter(
            restaurant=restaurant,
            date__range=(start_dt.date(), end_dt.date()),
        )
        if branch:
            contractor_payment_qs = contractor_payment_qs.filter(branch=branch)

        contractor_payments = (
            contractor_payment_qs.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        payable_contractor_invoice_qs = ContractorInvoice.objects.filter(
            restaurant=restaurant,
        ).exclude(status=ContractorInvoice.STATUS_DRAFT)
        if branch:
            payable_contractor_invoice_qs = payable_contractor_invoice_qs.filter(branch=branch)

        outstanding_contractor_payables = sum(
            (
                Decimal(invoice.remaining_balance)
                for invoice in payable_contractor_invoice_qs.select_related("contractor")
            ),
            Decimal("0.00"),
        )

        expenses_by_contractor = {}
        for invoice in contractor_invoices:
            contractor_name = invoice.contractor.name if invoice.contractor_id else "-"
            row = expenses_by_contractor.setdefault(
                contractor_name,
                {
                    "contractor": contractor_name,
                    "invoice_count": 0,
                    "expense_value": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "outstanding": Decimal("0.00"),
                },
            )
            row["invoice_count"] += 1
            row["expense_value"] += Decimal(invoice.total_amount or 0)
            row["paid"] += Decimal(invoice.amount_paid or 0)
            row["outstanding"] += Decimal(invoice.remaining_balance)

        contractor_lines = ContractorInvoiceLine.objects.filter(
            invoice__in=contractor_invoice_qs,
        )

        expenses_by_service_type = {}
        for line in contractor_lines:
            service_type = line.service_type or "Service"
            row = expenses_by_service_type.setdefault(
                service_type,
                {
                    "service_type": service_type,
                    "line_count": 0,
                    "expense_value": Decimal("0.00"),
                    "quantity": Decimal("0.00"),
                },
            )
            row["line_count"] += 1
            row["expense_value"] += Decimal(line.total_price or 0)
            row["quantity"] += Decimal(line.quantity or 0)

        unpaid_contractor_invoices = [
            {
                "id": invoice.id,
                "invoice_number": invoice.invoice_number or f"CINV-{invoice.id}",
                "contractor": invoice.contractor.name if invoice.contractor_id else "-",
                "branch": invoice.branch.name if invoice.branch_id else "-",
                "invoice_date": invoice.invoice_date.strftime("%Y-%m-%d"),
                "due_date": invoice.due_date.strftime("%Y-%m-%d") if invoice.due_date else None,
                "total_amount": float(round(Decimal(invoice.total_amount or 0), 2)),
                "amount_paid": float(round(Decimal(invoice.amount_paid or 0), 2)),
                "remaining_balance": float(round(Decimal(invoice.remaining_balance), 2)),
                "status": invoice.status,
            }
            for invoice in payable_contractor_invoice_qs.filter(
                status__in=[
                    ContractorInvoice.STATUS_APPROVED,
                    ContractorInvoice.STATUS_PARTIALLY_PAID,
                ]
            ).select_related("contractor", "branch")[:25]
        ]

        # -------- 8. Wastage ----------
        wastage_qs = StockMovement.objects.filter(
                restaurant=restaurant,
                created_at__range=(start_dt, end_dt),
                movement_type="waste",
            )
        if branch:
            wastage_qs = wastage_qs.filter(branch=branch)

        wastage = Decimal("0.00")
        for movement in wastage_qs.select_related("ingredient", "branch"):
            unit_cost = (
                movement.unit_cost
                if movement.unit_cost is not None
                else get_effective_cost_per_unit(movement.ingredient, movement.branch)
            )
            wastage += abs(Decimal(movement.change_quantity or 0)) * Decimal(unit_cost or 0)

        # -------- 9. Daily / operational expenses ----------
        expenses_qs = Expenses.objects.filter(
                restaurant=restaurant,
                date__range=(start_dt.date(), end_dt.date()),
            )
        if branch:
            expenses_qs = expenses_qs.filter(branch=branch)

        operational_expenses = (
            expenses_qs
            .aggregate(total=Sum("amount_afn", output_field=money_field))["total"]
            or Decimal("0")
        )

        # -------- 10. Payroll ----------
        approved_payroll_qs = Payroll.objects.filter(
            restaurant=restaurant,
            status__in=[Payroll.STATUS_APPROVED, Payroll.STATUS_PAID],
        ).filter(
            Q(approved_at__date__range=(start_dt.date(), end_dt.date()))
            | Q(approved_at__isnull=True, period_end__range=(start_dt.date(), end_dt.date()))
        )
        if branch:
            approved_payroll_qs = approved_payroll_qs.filter(branch=branch)

        payrolls = list(approved_payroll_qs.select_related("staff", "branch"))
        payroll_expenses = sum(
            (payroll.expense_amount for payroll in payrolls),
            Decimal("0.00"),
        )

        payroll_payment_qs = PayrollPayment.objects.filter(
            restaurant=restaurant,
            date__range=(start_dt.date(), end_dt.date()),
        )
        if branch:
            payroll_payment_qs = payroll_payment_qs.filter(branch=branch)

        payroll_payments = (
            payroll_payment_qs.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        salary_advance_qs = SalaryAdvance.objects.filter(
            restaurant=restaurant,
            date__range=(start_dt.date(), end_dt.date()),
        )
        if branch:
            salary_advance_qs = salary_advance_qs.filter(branch=branch)

        salary_advances = (
            salary_advance_qs.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        outstanding_payroll_qs = Payroll.objects.filter(
            restaurant=restaurant,
            status=Payroll.STATUS_APPROVED,
        )
        if branch:
            outstanding_payroll_qs = outstanding_payroll_qs.filter(branch=branch)

        outstanding_salaries = sum(
            (payroll.remaining_balance for payroll in outstanding_payroll_qs),
            Decimal("0.00"),
        )

        payroll_by_branch = {}
        for payroll in payrolls:
            branch_name = payroll.branch.name if payroll.branch_id else "No Branch"
            row = payroll_by_branch.setdefault(
                branch_name,
                {
                    "branch": branch_name,
                    "payroll_count": 0,
                    "payroll_cost": Decimal("0.00"),
                    "net_salary": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "outstanding": Decimal("0.00"),
                },
            )
            row["payroll_count"] += 1
            row["payroll_cost"] += payroll.expense_amount
            row["net_salary"] += Decimal(payroll.net_salary or 0)
            row["paid"] += Decimal(payroll.amount_paid or 0)
            row["outstanding"] += payroll.remaining_balance

        payroll_by_employee = {}
        for payroll in payrolls:
            staff_name = payroll.staff.name if payroll.staff_id else "-"
            row = payroll_by_employee.setdefault(
                staff_name,
                {
                    "staff_id": payroll.staff_id,
                    "employee": staff_name,
                    "role": payroll.staff.role if payroll.staff_id else "",
                    "payroll_count": 0,
                    "payroll_cost": Decimal("0.00"),
                    "net_salary": Decimal("0.00"),
                    "deductions": Decimal("0.00"),
                    "advances": Decimal("0.00"),
                    "paid": Decimal("0.00"),
                    "outstanding": Decimal("0.00"),
                },
            )
            row["payroll_count"] += 1
            row["payroll_cost"] += payroll.expense_amount
            row["net_salary"] += Decimal(payroll.net_salary or 0)
            row["deductions"] += Decimal(payroll.deductions or 0)
            row["advances"] += Decimal(payroll.advance_deductions or 0)
            row["paid"] += Decimal(payroll.amount_paid or 0)
            row["outstanding"] += payroll.remaining_balance

        payroll_payment_history = [
            {
                "id": payment.id,
                "date": payment.date.strftime("%Y-%m-%d"),
                "employee": payment.staff.name if payment.staff_id else "-",
                "payroll_id": payment.payroll_id,
                "period": f"{payment.payroll.period_start} - {payment.payroll.period_end}",
                "amount": float(round(Decimal(payment.amount or 0), 2)),
                "payment_method": payment.payment_method,
                "reference_number": payment.reference_number,
            }
            for payment in payroll_payment_qs.select_related("staff", "payroll").order_by("-date", "-created_at")[:30]
        ]

        payroll_trends_map = {}
        for payroll in payrolls:
            key = payroll.period_end.strftime("%Y-%m")
            row = payroll_trends_map.setdefault(
                key,
                {
                    "period": key,
                    "payroll_count": 0,
                    "payroll_cost": Decimal("0.00"),
                    "net_salary": Decimal("0.00"),
                },
            )
            row["payroll_count"] += 1
            row["payroll_cost"] += payroll.expense_amount
            row["net_salary"] += Decimal(payroll.net_salary or 0)

        # -------- 11. Totals ----------
        total_expenses = (
            cogs
            + wastage
            + operational_expenses
            + contractor_expenses
            + payroll_expenses
        )
        gross_profit = revenue - cogs
        net_profit = revenue - total_expenses

        margin = (
            round((net_profit / revenue) * 100, 2)
            if revenue > 0 else Decimal("0")
        )

        return {
            "range": {
                "start": start_dt.strftime("%Y-%m-%d"),
                "end": end_dt.strftime("%Y-%m-%d"),
            },
            "revenue": float(round(revenue, 2)),
            "expenses": {
                "cogs": float(round(cogs, 2)),
                "wastage": float(round(wastage, 2)),
                "stock_purchases": float(round(purchases, 2)),
                "supplier_payments": float(round(supplier_payments, 2)),
                "supplier_payables": float(round(outstanding_supplier_payables, 2)),
                "daily_expenses": float(round(operational_expenses, 2)),
                "operational_expenses": float(round(operational_expenses, 2)),
                "contractor_expenses": float(round(contractor_expenses, 2)),
                "contractor_payments": float(round(contractor_payments, 2)),
                "contractor_payables": float(round(outstanding_contractor_payables, 2)),
                "payroll": float(round(payroll_expenses, 2)),
                "payroll_expenses": float(round(payroll_expenses, 2)),
                "payroll_payments": float(round(payroll_payments, 2)),
                "outstanding_salaries": float(round(outstanding_salaries, 2)),
                "salary_advances": float(round(salary_advances, 2)),
                "total_expenses": float(round(total_expenses, 2)),
            },
            "expense_categories": {
                "supplier_purchases": float(round(purchases, 2)),
                "daily_expenses": float(round(operational_expenses, 2)),
                "contractor_expenses": float(round(contractor_expenses, 2)),
                "payroll": float(round(payroll_expenses, 2)),
            },
            "cash_flow": {
                "cash_in_from_sales": float(round(revenue, 2)),
                "supplier_payments": float(round(supplier_payments, 2)),
                "contractor_payments": float(round(contractor_payments, 2)),
                "daily_expense_payments": float(round(operational_expenses, 2)),
                "payroll_payments": float(round(payroll_payments, 2)),
                "salary_advances": float(round(salary_advances, 2)),
                "known_cash_out": float(
                    round(
                        supplier_payments
                        + contractor_payments
                        + operational_expenses
                        + payroll_payments
                        + salary_advances,
                        2,
                    )
                ),
            },
            "procurement": {
                "purchase_value": float(round(purchases, 2)),
                "payments_made": float(round(supplier_payments, 2)),
                "outstanding_supplier_balance": float(round(outstanding_supplier_payables, 2)),
                "purchases_by_supplier": [
                    {
                        "supplier": row["supplier"],
                        "invoice_count": row["invoice_count"],
                        "purchase_value": float(round(row["purchase_value"], 2)),
                        "paid": float(round(row["paid"], 2)),
                        "outstanding": float(round(row["outstanding"], 2)),
                    }
                    for row in purchases_by_supplier.values()
                ],
                "purchases_by_ingredient": [
                    {
                        "ingredient": row["ingredient"],
                        "unit": row["unit"],
                        "quantity": float(round(row["quantity"], 3)),
                        "purchase_value": float(round(row["purchase_value"], 2)),
                        "invoice_count": row["invoice_count"],
                    }
                    for row in purchases_by_ingredient.values()
                ],
                "purchases_by_branch": [
                    {
                        "branch": row["branch"],
                        "invoice_count": row["invoice_count"],
                        "purchase_value": float(round(row["purchase_value"], 2)),
                        "paid": float(round(row["paid"], 2)),
                        "outstanding": float(round(row["outstanding"], 2)),
                    }
                    for row in purchases_by_branch.values()
                ],
                "unpaid_purchase_invoices": unpaid_purchase_invoices,
            },
            "contractors": {
                "expense_value": float(round(contractor_expenses, 2)),
                "payments_made": float(round(contractor_payments, 2)),
                "outstanding_contractor_balance": float(round(outstanding_contractor_payables, 2)),
                "expenses_by_contractor": [
                    {
                        "contractor": row["contractor"],
                        "invoice_count": row["invoice_count"],
                        "expense_value": float(round(row["expense_value"], 2)),
                        "paid": float(round(row["paid"], 2)),
                        "outstanding": float(round(row["outstanding"], 2)),
                    }
                    for row in expenses_by_contractor.values()
                ],
                "expenses_by_service_type": [
                    {
                        "service_type": row["service_type"],
                        "line_count": row["line_count"],
                        "quantity": float(round(row["quantity"], 2)),
                        "expense_value": float(round(row["expense_value"], 2)),
                    }
                    for row in expenses_by_service_type.values()
                ],
                "unpaid_contractor_invoices": unpaid_contractor_invoices,
            },
            "payroll": {
                "monthly_payroll_cost": float(round(payroll_expenses, 2)),
                "payments_made": float(round(payroll_payments, 2)),
                "outstanding_salaries": float(round(outstanding_salaries, 2)),
                "salary_advances": float(round(salary_advances, 2)),
                "payroll_by_branch": [
                    {
                        "branch": row["branch"],
                        "payroll_count": row["payroll_count"],
                        "payroll_cost": float(round(row["payroll_cost"], 2)),
                        "net_salary": float(round(row["net_salary"], 2)),
                        "paid": float(round(row["paid"], 2)),
                        "outstanding": float(round(row["outstanding"], 2)),
                    }
                    for row in payroll_by_branch.values()
                ],
                "payroll_by_employee": [
                    {
                        "staff_id": row["staff_id"],
                        "employee": row["employee"],
                        "role": row["role"],
                        "payroll_count": row["payroll_count"],
                        "payroll_cost": float(round(row["payroll_cost"], 2)),
                        "net_salary": float(round(row["net_salary"], 2)),
                        "deductions": float(round(row["deductions"], 2)),
                        "advances": float(round(row["advances"], 2)),
                        "paid": float(round(row["paid"], 2)),
                        "outstanding": float(round(row["outstanding"], 2)),
                    }
                    for row in payroll_by_employee.values()
                ],
                "payment_history": payroll_payment_history,
                "payroll_trends": [
                    {
                        "period": row["period"],
                        "payroll_count": row["payroll_count"],
                        "payroll_cost": float(round(row["payroll_cost"], 2)),
                        "net_salary": float(round(row["net_salary"], 2)),
                    }
                    for row in sorted(payroll_trends_map.values(), key=lambda item: item["period"])
                ],
            },
            "gross_profit": float(round(gross_profit, 2)),
            "net_profit": float(round(net_profit, 2)),
            "profit_margin_percent": float(margin),
        }
