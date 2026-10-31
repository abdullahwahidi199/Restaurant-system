---
id: admin_payroll_records
title: Payroll > Payroll Records
module: payroll
namespace: admin
status: current_observed_behavior
summary: Employee-period salary calculations and current settlement. Search matches employee name, stored role or payroll
  notes; status and Monthly/Weekly filters narrow the list. Period type is r...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advance
- approved
- balance
- deductions
- draft
- expense
- gross
- net
- payable
- payroll
- records
related_docs:
- admin_payroll_payments
- admin_payroll_salary_advances
- admin_reports_finance_profit_cost
routes: []
source_refs:
- uploaded_admin_reference:lines_316-325
tool_hints:
- reports.get
- records.list
- records.get
metric_ids:
- payroll.earned_cost
- payroll.current_outstanding
---

### Payroll > Payroll Records

- **Purpose / filters:** Employee-period salary calculations and current settlement. Search matches employee name, stored role or payroll notes; status and Monthly/Weekly filters narrow the list. Period type is run type, not salary basis; no date-range control is exposed. Where period-range filtering is used, inclusion is inclusive overlap, not full containment or prorating.
- **Gross / earnings:** Gross = Base + Allowances + Bonuses + (Overtime Hours × Overtime Rate). Overtime amount, gross and net are rounded to two decimals. Base is the period amount calculated by the wizard, not necessarily the employee's unchanged profile rate.
- **Deductions / Net:** Ordinary deductions and linked salary-advance deductions are separate. Net = max(Gross − Ordinary Deductions − Advance Deductions, 0); it is salary payable after advance recovery, not money already received.
- **Payroll expense:** max(Gross − Ordinary Deductions, 0), before subtracting advances; used in the dashboard only for Approved/Paid records. Advance recovery reduces the later payment obligation, not earned payroll cost. Approval contributes this cost to financial reporting; it does not create a separate ordinary-expense entry.
- **Paid / Balance:** Paid is cumulative linked salary payments, capped at net salary; Balance/Outstanding = max(Net − Paid, 0). These are current all-payment-date balances, not balances as of period end or the displayed payment date. They exclude advances already deducted from Net.
- **Statuses:** Draft is an unapproved calculation, excluded from dashboard cost/outstanding and ineligible for payments. Approved is recognized payroll, possibly unpaid, partly paid or zero-net. Paid requires a positive net salary fully covered by recorded salary payments; zero-net records can remain Approved. Only Admin/Branch Admin can approve, even if Finance Manager sees an approval control.
- **Detail / historical meaning:** Salary Calculation separates earnings from ordinary/advance deductions; Payable Summary repeats Gross, Net, Paid and Outstanding. Payment and Applied Advance tables are the linked records, not extra charges/deductions to add again; audit history is recorded changes, not extra payroll. Profile changes do not automatically recalculate existing amounts, while displayed employee role/salary-type labels use the current profile.
