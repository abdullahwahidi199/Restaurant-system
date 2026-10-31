---
id: admin_finance_expense_detail_history
title: Finance > Expense Detail, Voucher and History
module: finance
namespace: admin
status: current_observed_behavior
summary: Repeat the current expense's original amount, currency, saved conversion and expense date. Voucher number identifies
  that expense; printing/reprinting does not create another expense or p...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- audit
- changes
- delete
- detail
- expense
- finance
- history
- update
- voucher
related_docs:
- admin_finance_expenses
routes: []
source_refs:
- uploaded_admin_reference:lines_409-414
tool_hints:
- records.get
- audit.list
metric_ids: []
---

### Finance > Expense Detail, Voucher and History

- **Detail / voucher amounts:** Repeat the current expense's original amount, currency, saved conversion and expense date. Voucher number identifies that expense; printing/reprinting does not create another expense or payment. A voucher is generated from current values, not an immutable original after later edits; its printing timestamp is separate from expense date.
- **History meaning:** Created, Updated and Deleted entries are change events, not additional spending. Amounts describe the event's expense snapshot; an update records the new values, with changed fields identifying differences. Adding history-row amounts would count the same expense repeatedly.
- **History dates / filters:** From/To inclusively filter the change timestamp's Kabul date, not the expense's financial date. Search matches expense name/description; action filters distinguish creation, updates and deletion. Newest changes appear first; paginated counts refer to events. Deleting a live expense removes it from current totals while retaining its deletion-history entry, rather than recording a financial refund.
