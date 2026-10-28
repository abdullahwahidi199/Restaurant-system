---
id: "operator_workflows_financial_obligations"
title: "Choose the correct purchasing, service, payroll, or expense workflow"
module: "workflows"
description: "Choose between supplier, contractor, payroll, expense and customer collection records and avoid recording the same payment twice."
keywords: ["workflows", "choose", "correct", "purchasing", "service", "payroll", "expense", "workflow", "financial workflow", "supplier versus contractor", "partial payment"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager", "Cashier"]
related_docs: ["operator_modules_procurement_payments_attachments", "operator_modules_contractors_services", "operator_modules_payroll_payroll", "operator_modules_expenses_expenses", "operator_modules_billing_cashier"]
frontend_routes: []
source_references: ["backend/backend/inventory/services.py", "backend/backend/contractors/services.py", "backend/backend/users/payroll_services.py", "backend/backend/expenses/models.py", "backend/backend/orders/views.py:update_order_status"]
status: "source_verified"
---

# Choose the correct purchasing, service, payroll, or expense workflow

## Choose the correct financial record

| Real operation | Starting screen | Records created | Approval/payment sequence | Stock effect |
|---|---|---|---|---|
| Receive ingredients | Procurement → New Invoice | PurchaseInvoice, lines, optional SupplierPayment; movements on posting | Draft→Approve to receive, or immediate non-draft; record permitted partial/full payments | Adds ingredient quantity on posting only |
| Pay for contractor work | Contractors → Create Invoice | ContractorInvoice/lines, optional payment; optional ServiceContract link | Draft→Approve, then partial/full ContractorPayment | None |
| Pay employee salary | Payroll Wizard / Records | Payroll, applied advances, PayrollPayment | Generate draft→Admin/BranchAdmin approve→partial/full payments | None |
| Record general expense | Expenses → New Expense | Expenses plus ExpenseHistory | Save; separate voucher/history | None |
| Collect customer bill | Cashier order | Existing Order paid/status metadata | Prepare→receipt print→Mark Paid or Confirm Cash | Prior preparation deduction; printing/collection is not another receipt of stock |

## Record actual payments and inspect balances

Use each module’s due/payable/history controls to locate the actual outstanding record, verify branch and recipient, record only the amount actually paid, then verify updated balance/history. Method choices record Cash/Bank Transfer/Mobile Money/Card/Other; they do not initiate a transfer or card gateway charge.

## Avoid duplicate payments and unsupported reversals

Do not record the same supplier/service/payroll payment again as generic expense solely to print a voucher. No universal refund/reversal/credit-note workflow was found. For incorrect posted money, preserve identifier and histories and seek authorized correction; never instruct manual database edits or a fabricated offset.

Partial payment support exists for supplier, contractor and payroll records, not ordinary customer order Mark Paid. Reservation paid_amount is the customer deposit mechanism. See [payments attachments](../modules/procurement/payments_attachments.md), [services](../modules/contractors/services.md), [payroll](../modules/payroll/payroll.md), [expenses](../modules/expenses/expenses.md), and [cashier](../modules/billing/cashier.md).
