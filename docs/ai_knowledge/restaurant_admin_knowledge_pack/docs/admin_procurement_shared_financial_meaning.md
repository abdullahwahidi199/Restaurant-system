---
id: admin_procurement_shared_financial_meaning
title: Procurement > Shared Scope and Financial Meaning
module: procurement
namespace: admin
status: current_observed_behavior
summary: Invoice/payment lists include all matching records, newest purchase/payment date first; table pagination does
  not limit coverage. Searches include all matches. Supplier totals/ledgers cov...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- charges
- debt
- financial
- invoices
- meaning
- payments
- procurement
- purchasing
- scope
- shared
- spend
- supplier
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_206-211
tool_hints:
- reports.get
- records.list
metric_ids: []
---

### Procurement > Shared Scope and Financial Meaning

- **Coverage:** Invoice/payment lists include all matching records, newest purchase/payment date first; table pagination does not limit coverage. Searches include all matches. Supplier totals/ledgers cover all related history, independently of invoice/payment search filters. Normal branch scope applies.
- **Period / headers:** No workspace-wide date-range control. Month spend and Payables in page headers repeat the dashboard definitions below; do not add repeated totals. Invoice/payment searches can change totals derived from those lists, without narrowing supplier history. Today/current-month comparisons and form date defaults use the UTC date, which can still be yesterday during early Kabul morning.
- **Distinctions:** Purchases measure invoice charges; supplier payments record disbursements; remaining balances measure current liabilities after recorded payments. Purchases are not automatically expenses, payments are not additional purchase charges, and none of these measures establishes restaurant profit.
