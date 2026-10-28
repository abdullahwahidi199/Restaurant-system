---
id: "operator_modules_expenses_expenses"
title: "Record, edit, print, and review expense history"
module: "expenses"
description: "Record and edit AFN or USD expenses, print vouchers, delete with confirmation, and inspect expense history and currency-conversion changes."
keywords: ["expenses", "record", "edit", "print", "review", "expense", "history", "expense voucher", "exchange rate", "expense history"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager", "InventoryManager"]
related_docs: ["operator_reference_backend_expenses_access", "operator_workflows_financial_obligations", "operator_reference_interface_component_admin_expenses_expensesmain", "operator_reference_interface_component_admin_expenses_individualexpense", "operator_reference_interface_component_admin_expenses_expenseshistory", "operator_reference_backend_expenses_fields", "operator_reference_backend_expenses_validation"]
frontend_routes: ["/admin/dashboard/expenses", "/finance-manager/expenses", "/operations-manager/expenses", "/inventory-manager/expenses"]
source_references: ["frontend/src/component/Admin/Expenses/ExpensesMain.jsx", "frontend/src/component/Admin/Expenses/IndividualExpense.jsx", "frontend/src/component/Admin/Expenses/ExpensesHistory.jsx", "frontend/src/component/Admin/Expenses/ExpenseVoucher.jsx", "backend/backend/expenses/models.py:Expenses.save", "backend/backend/expenses/signals.py", "backend/backend/expenses/serializers.py", "backend/backend/expenses/views.py"]
status: "source_verified"
---

# Record, edit, print, and review expense history

## Open

Admin/BranchAdmin **Finance → Expenses**; FinanceManager **Expenses**; Operations/Inventory Manager expense routes also exist. Prefixes `/admin/dashboard`, `/finance-manager`, `/operations-manager`, `/inventory-manager`; suffix `/expenses`, `/expenses/history`, `/expenses/:id`. Server scope and role declarations are in [expenses access](../../reference/backend/expenses_access.md).

The list displays expense records and offers search by name/description, currency filter, from/to dates, sort, reset, page/page-size controls, detail, voucher print, delete, history and **New Expense** actions. A card summary is not an editable expense. This guide does not interpret financial metrics.

## Create form

**New Expense** opens **Add New Expense**. **Expense Name** required text (backend max200); **Date** required in UI, defaults current date; **Amount** required decimal (10,2); **Currency** AFN default, choices AFN/USD; **Exchange Rate (1 USD = AFN)** shown for USD; **Description** optional. Converted AFN amount is calculated/read-only preview; backend recalculates on save.

Enter real expense identity/date/amount; if USD, enter rate; review preview; submit create action in footer. HTML required fields apply because the modal uses a form. **Cancel** closes. Backend plain ModelSerializer supplies numeric/choice/length rules but no custom positive-amount/rate validator is shown; do not invent one. For AFN, amount_afn=amount; for USD, amount×exchange_rate. It creates the branch expense and an ExpenseHistory “created” snapshot via signals. Success closes/resets/reloads parent; failure alerts **Failed to create expense. Please check the fields.**

## Detail/edit/delete/history

Eye/detail navigates to `/expenses/:id`. The detail component’s edit mode exposes editable expense fields; save updates record and derived AFN amount. Signal compares old/new name, amount, currency, rate, AFN amount, date and description; changed fields produce history “updated” with before/after values. Cancel edit discards local changes.

Printer icon opens ExpenseVoucher; inspect and print through browser. This does not mark payroll/supplier/customer payment and creates no second expense. Delete opens confirmation; accept removes expense, signals create “deleted” history snapshot. No restore/undelete control exists. **History** opens `/expenses/history`, with its own filters/pagination and changed-field details; history is evidence, not a restore form.

A failed create/edit/delete can leave the list stale; refresh and check record/history before retrying. **Failed to delete expense** can hide server-specific detail. Demo restrictions are endpoint-specific; use the actual response. Avoid recording supplier/contractor/payroll payments again as a new generic expense merely because a voucher exists; those modules already have their own records/finance behavior. See [financial obligations](../../workflows/financial_obligations.md).

## Detailed controls, fields, and server rules

- [Expenses Main — controls and fields](../../reference/interface/component_admin_expenses_expensesmain.md)
- [Individual Expense — controls and fields](../../reference/interface/component_admin_expenses_individualexpense.md)
- [Expenses History — controls and fields](../../reference/interface/component_admin_expenses_expenseshistory.md)
- [Expenses — backend fields reference](../../reference/backend/expenses_fields.md)
- [Expenses — backend validation reference](../../reference/backend/expenses_validation.md)
- [Expenses — backend access reference](../../reference/backend/expenses_access.md)
