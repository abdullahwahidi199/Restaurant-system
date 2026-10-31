---
id: admin_payroll_payments
title: Payroll > Payroll Payments
module: payroll
namespace: admin
status: current_observed_behavior
summary: Salary disbursement history linked to employee and payroll period. Amount is this transaction, not gross/net
  salary or cumulative Paid. Method (cash, card, bank transfer, mobile money, ch...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- disbursement
- employee
- payment
- payments
- payroll
- salary
- settlement
related_docs:
- admin_payroll_records
- admin_reports_finance_purchase_contractor_payroll
routes: []
source_refs:
- uploaded_admin_reference:lines_332-338
tool_hints:
- reports.get
- records.list
- records.get
metric_ids:
- payroll.payment_disbursements
---

### Payroll > Payroll Payments

- **Purpose / amount:** Salary disbursement history linked to employee and payroll period. Amount is this transaction, not gross/net salary or cumulative Paid. Method (cash, card, bank transfer, mobile money, cheque or other), reference and notes describe the recorded transaction; they do not verify an external transfer.
- **Dates / filters:** Date is the recorded payment date, separate from salary-period dates, approval date and entry time. Newest payment date/creation time first; search matches employee name, reference or notes, without a date-range control. The payment target list includes all matching non-Draft payrolls with positive remaining balance, including older records; current payroll-record filters can narrow those choices.
- **Payment / balance rules:** Amount must be positive and no greater than current remaining net salary; Draft payroll cannot receive it and payment must match its branch. Partial payment leaves Approved status; full payment of positive net changes it to Paid. The completion timestamp reflects recording the final settlement, not necessarily its entered/backdated payment date.
- **Interpretation:** Recording even a future-dated payment immediately changes the current balance/status; these are not scheduled transfers or historical balance snapshots. Advances are excluded from this payment list, and no general refund/reversal screen is provided. Payment reduces the salary liability rather than adding another payroll expense.
