# Contractors read tools

All tools operate on the authenticated profile's **trusted active branch** and
restaurant. They never accept restaurant, branch, role, permission or ORM overrides.
Each tool reuses the actual permission classes for its corresponding API operation
and related data sources. The current API permits `Admin`, `BranchAdmin`,
`InventoryManager`, `OperationsManager`, `FinanceManager`. Each handler also checks
authorization when called directly. Record queries constrain parent relationships;
an absent/out-of-scope explicit ID returns the same `RECORD_NOT_AVAILABLE` response.
Role or execution-context denials return `PERMISSION_DENIED`. Unrelated batch
operations may still succeed.

The authoritative callable schemas are in `tools.contractor_definitions()` and are
mirrored in the Contractors domain of the Business Capability Map. Output schemas
describe every returned field. Parameters are closed, typed and constrained;
dates must be real ISO dates, paired lower/upper bounds cannot be reversed, and
sorts are enumerated. No search or tool-specification fetch is required before
calling a known tool. Resolve unknown record names through the relevant list tool.
Database selectors and aggregations live in `contractors/selectors.py`; definitions,
permission bindings, serializers and thin handlers live in `business_analyst/tools.py`.

## Common results and limits

Every result includes `scope: trusted_active_branch`, `currency: AFN`, `date_basis`,
`period: {from,to}` and `balance_basis`. All amounts and service quantities are
fixed two-decimal **strings**, never binary floating-point JSON amounts. Creation
timestamps include their UTC offset; accounting date filters operate on stored
date fields, not on creation timestamps.

List parameters are `page` (default 1, maximum 10,000), `page_size` (default 15,
maximum 50) and optional `sort`. Lists return `results` and
`pagination: {page,page_size,total,has_more}`; counts cover all matches. Detail
history pages have a maximum size of 20 (default 5). Large individual fields or
results fail safely through the existing 40 KB operation-result budget rather
than being silently truncated. Notes and full scalar details are not silently shortened.

All date filters are optional and inclusive. Without bounds, use all-time data.
No tool assumes the current month. Search is a bounded substring (120 characters)
over the fields documented below. Optional `contractor_id` selects one authorized
provider; omission selects all matching providers in the active branch.

## Record tools

| Tool | Required inputs | Optional filters and sort choices | Results / date basis |
|---|---|---|---|
| `list_contractors` | None | `contractor_id`, `is_active`, `search` over name/contact/phone/email; sort ±name, ±created_at, ±balance | Full contacts, activity flag, all-time invoiced/paid/floored balance; no directory date filter |
| `get_contractor_details` | `contractor_id` | None | Full profile, all-time account, contract/payment counts, current invoice totals including explicit draft/recognized populations |
| `list_service_contracts` | None | `contractor_id`, stored `status`, `open_ended`, search title/provider/notes, `date_from/to`; sort ±start_date, ±end_date, ±title, ±contract_value | Agreement fields and current all-time linked recognized charges; date bounds apply to **start_date** |
| `get_service_contract_details` | `contract_id` | None | Full agreement/creator/notes/dates/status and all-time linked invoice totals; agreement status/dates never erase invoices |
| `list_service_invoices` | None | `contractor_id`, `contract_id`, current `status`, invoice/line search, `date_from/to`, `due_from/to`; sort ±invoice_date, ±due_date, ±total_amount, ±invoice_number | Full invoice headers, stored and display references, recognized flag, current Paid/Remaining; primary date bounds apply to **invoice_date**, optional due bounds additionally constrain **due_date** |
| `get_service_invoice_details` | `invoice_id` | `lines_page`, `payments_page`, `attachments_page`, `audit_page` (default 1), `page_size` | Full header and independently paginated lines, all-date payments, attachment metadata and scoped audit changes; counts/has_more expose further history |
| `list_service_invoice_lines` | None | `contractor_id`, `contract_id`, `invoice_id`, parent invoice `status`, exact case-insensitive `service_type`, line-text `search`, `date_from/to`; sort ±id, ±service_type, ±quantity, ±total_price, ±invoice_date | Individual stored rounded lines, parent identifiers/date/status and recognition flag; dates apply to parent **invoice_date** |
| `list_contractor_payments` | None | `contractor_id`, `invoice_id`, `contract_id`, `payment_method`, current `invoice_status`, search provider/stored invoice number/reference/notes, `date_from/to`; sort ±date, ±amount, ±created_at | Full payment transactions and creators; date bounds apply to payment **date**, independent of invoice dates |
| `get_contractor_ledger` | `contractor_id` | `date_from/to`, `page`, `page_size`, `order: ascending/descending` | Paginated invoice/payment events with signed running balances, explicit invoice/payment counts, reconstructed range opening/closing and separate all-time current account |

Contract states: `draft`, `active`, `completed`, `cancelled`, `expired`. Invoice
states: `draft`, `approved`, `partially_paid`, `paid`. Payment methods: `cash`,
`card`, `bank_transfer`, `mobile_money`, `cheque`, `other`. Payment records have no
separate payment status, so `invoice_status` explicitly means the linked invoice's
**current** state, not its state when a payment was recorded. Generated `CINV-id`
references are display labels; invoice search continues to use the stored number.

Invoice attachment results contain only metadata and an existing authenticated
download path, never storage paths or file contents. Audit results include only
that invoice's scoped Contractors change events, not IPs, user agents or unrelated
session/security activity. The same role set can read these events in the existing
audit API. Deleted or foreign-restaurant creator links do not disclose staff names.

## Summary tools

Summaries aggregate in the database and return no individual business records.
Status and payment-method breakdowns group matching records. Invoice service-type
groups are limited to the top ten; `total_groups` and `other_charges` preserve coverage.
In the combined contractor summary, status/method breakdowns are nested inside
`activity` and use that activity's date bounds; `current` contains only separately
labeled all-time balances. Draft and recognized invoice counts are explicit.

| Tool | Filters | Counts, amounts and breakdowns |
|---|---|---|
| `get_contractor_summary` | `contractor_id`, `is_active`, directory search, `date_from/to` | Current directory counts; period agreement count/value on **start_date**, recognized/draft invoice counts and values on **invoice_date**, payment count/value on payment **date**, signed net activity; separate all-time current balances and status/method breakdowns |
| `get_service_contracts_summary` | Same business filters as `list_service_contracts`, without paging/sort | Agreement count/value/open-ended count and stored-status breakdown; current all-time invoice totals linked to the selected agreement cohort, independent of invoice dates |
| `get_service_invoices_summary` | Same business filters as `list_service_invoices`, without paging/sort | Total and draft face value/count; recognized count/charges; current capped Paid/Remaining on that invoice-date cohort; all-date linked payment records; open count including zero-balance Approved rows; status and service-type groups |
| `get_contractor_payments_summary` | Same business filters as `list_contractor_payments`, without paging/sort | Period payment count/value, distinct contractor/invoice counts, method groups and linked invoices' current-status groups |

### Financial meaning

- Agreement value is entered configuration, not incurred expense, debt or payment.
- Non-draft invoice charges are recognized service cost. Draft line/face values
  remain visible separately, with zero recognized cost/payables. Invoice values
  are read as stored; no refresh/save or recalculation service is called.
- Recorded payments are individual disbursements, not extra service expense and
  not proof of external settlement. Future-dated payments already affect current
  stored settlement. Invoice Paid is the stored current capped amount; raw payment
  totals may exceed revised invoice charges in legacy data.
- Current aggregate net outstanding is `max(all recognized charges − all recorded
  payments, 0)`, preserving the Contractors dashboard definition. The summary also
  reports `sum_contractor_balances` (sum of individually floored accounts) and
  `recognized_invoice_balances` (sum of non-draft invoice Remaining), preserving
  Finance's distinct invoice-based payable measure. These can differ with credits.
- Period charges/payments are flows. Their difference is signed `net_activity`,
  not a historical closing balance. Current balances do not inherit period filters.
  Invoice-cohort current Remaining includes payments from **all** dates.

Ledger events use non-draft invoices on `invoice_date`, payments on `date`, then
event type and ID, with invoices before payments on the same day. Running balances
are signed, not zero-floored. Prefix sums include pre-range and preceding-page
activity, so pagination does not reset balances. Opening/range closing are explicit
**reconstructions from current records**, not immutable historical snapshots or
separately posted opening entries. Reverse paging retains the same canonical balances.

## Verification and operational notes

Use `python manage.py test business_analyst --settings=business_analyst.tests.settings`
for isolated SQLite/cache/channel/media tests. Tests use the actual contractor
models and write services to create fixtures; handlers execute only scoped reads.
The complete 13-tool batch is checked for successful contracts and absence of
business INSERT/UPDATE/DELETE statements. List queries have constant query-count
checks. Cross-branch/tenant/inconsistent-parent, mixed-denial, empty, date/cohort,
decimal rounding, credit reconciliation, ledger paging and conversation tests are included.

The existing Stage 0 output budgets and cooperative five-second tool deadline
remain in force. Deployment statement timeouts should be reviewed for very large
ledgers/aggregates; the engine does not forcibly cancel an in-flight database query.
No Customers/other-module tools, write tool, business-calculation change or schema
migration is included. See the implementation report for mocked versus live results.
The engine supplies its trusted server date and timezone for relative-date questions;
it does not automatically add date filters when the user requests all-time data.
