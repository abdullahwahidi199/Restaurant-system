# Expenses read tools

Five tools are registered under the existing `finance` domain. Canonical closed
parameter/output schemas are in `business_analyst.tools.expense_definitions()` and
are mirrored exactly in the complete capability map sent with every model request.
Queries and database aggregations live in `expenses/selectors.py`, clearly marked
as AI reporting selectors. Existing models, signals, API calculations and Finance
reports are unchanged. No discovery call, category model or payment status is added.

All reads require a freshly validated authenticated staff user, active restaurant
and subscription, an authorized active branch, and the corresponding API operation
permissions. The tools use `expensesApi`, `ExpenseDetailsView` or
`ExpenseHistoryApiView` permission classes, as appropriate. Both restaurant and
branch are mandatory query constraints, even for Admin users. Scope/role/ORM
overrides are rejected. Missing, foreign, unassigned-branch and deleted expense IDs
all return `RECORD_NOT_AVAILABLE`; operation denial returns `PERMISSION_DENIED`.
Failures do not discard other successful batch results.

## Callable contracts

| Tool | Parameters | Result |
|---|---|---|
| `list_expenses` | Optional expense filters, `page`, `page_size`, `sort` | Individual complete current records and matching-record pagination |
| `get_expense_details` | Required `expense_id`; no filters | One complete current expense, with original amount/currency, saved exchange rate, saved AFN equivalent, financial date and description |
| `list_expense_history` | Optional history filters, `page`, `page_size`, `sort` | Event IDs, snapshots, action, local timestamp, description, stored changed fields and event pagination |
| `get_expense_summary` | Optional expense filters | Record count, saved AFN total/average/min/max, first/last expense dates, negative/zero amount and negative-rate counts, currency totals, top ten names and latest twelve expense months with exact remainder counts/totals |
| `get_expense_history_summary` | Optional history filters | Event count, first/last local event timestamps, counts by action/currency and latest twelve event months with remainder count; no money sums |

Expense filters: `currency` (`AFN`/`USD`, original currency), `name`
(case-insensitive exact name, not a unique identifier), `search` (name or description
substring, at most 120 characters), `date_from`, `date_to`. Expense dates use the
stored `Expenses.date`. History filters add `action` (`created`/`updated`/`deleted`)
and apply the same date bounds to `ExpenseHistory.date_time` calendar days in the
server business timezone (`Asia/Kabul`). Inclusive day filtering uses aware
half-open timestamp bounds. Omitted bounds mean all-time; reversed or nonexistent
dates fail validation. The schema exposes no `expense_id` filter for history.

Lists use one-based `page` (default 1, maximum 10,000), `page_size` (default 15,
maximum 50). Sorts are explicit positive/negative field names, with stable ID ties:
expense `date`, `name`, `amount`, `amount_afn`, `id`; history `date_time`, `name`,
`amount`, `amount_afn`, `action`, `id`. Defaults are newest expense/event date.
Pagination returns `page`, `page_size`, `total`, `has_more`; it covers all matches.
Stage 0 rejects oversized results rather than silently truncating fields.

Every output includes `scope: trusted_active_branch`, `reporting_currency: AFN`,
`date_basis`, `timezone`, `period: {from,to}` and `financial_basis`. All monetary
values and rates are fixed two-decimal strings. Empty summary counts/totals are
zero, date extrema are null and breakdowns are empty. An empty summary's displayed
average/min/max of `0.00` describes no observations; check its zero count.

## Financial and audit meaning

Saved expense records immediately contribute on their expense date. The tool sums
saved `amount_afn`, exactly as Finance does. It preserves `amount`, `currency` and
`exchange_rate`; it never recalculates conversion or fetches a live rate. Current
USD amounts are already represented in AFN totals and must not be added again.
Original currency totals are separated by currency. Negative/zero amounts or
rates remain included because the existing models permit them; no refund meaning
or additional validation policy is invented.

Summaries aggregate **the filtered current records**. This intentionally differs
from the existing Expenses screen cards, which ignore table filters. An unfiltered
summary reconciles with the cards; a date-filtered AFN total reconciles with the
Finance report's ordinary expenses and ordinary expense payments for that range
and branch. These are current saved records, not a reconstructed historical
snapshot or independent evidence of cash movement.

History is independent audit data. Created/updated/deleted event amounts are
snapshots, never extra spending; deleting an expense removes it from current totals
while retaining its deletion event. `ExpenseHistory` stores no expense foreign key
or reliable expense-record ID. Names can repeat/change; the tools never manufacture
links or attach name-matched history to an expense detail. Changed fields are
returned as recorded, including the existing JSON numeric representation.

The existing history write signal cannot serialize a changed Python `date` into
its JSON change field. This pre-existing write defect is reported for separate
review; these read-only tools neither repair nor infer missing audit events.
