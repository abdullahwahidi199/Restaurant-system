# Business Analyst: Contractors refactor and Expenses tools

Implemented directly on `main`, 2026-10-31. Ready for review. No Customers or other
application tools were added. Existing Contractors contracts, financial meanings,
verified knowledge and Operator Mentor implementation are preserved.

## Structure and compatibility

| File | Responsibility |
|---|---|
| `backend/backend/business_analyst/tools.py` | All 18 business tool definitions, handlers, operation permission bindings, serialization and registration |
| `backend/backend/contractors/selectors.py` | Moved read-only Contractors queries, financial aggregations, ledger and scoped invoice relations |
| `backend/backend/expenses/selectors.py` | New read-only expense/history filters and database aggregates, marked as AI reporting selectors |
| `backend/backend/business_analyst/registry.py` | Existing schema validation and dispatch architecture; calls `tools.register_tools()` |
| `backend/backend/business_analyst/documents.py` | Existing direct document-ID retrieval; specialist documentation visibility follows corresponding operation permissions |
| `backend/backend/business_analyst/CONTRACTORS.md` | Preserved Contractors contracts with updated file/permission references |
| `backend/backend/business_analyst/EXPENSES.md` | Exact Expenses parameters, outputs, date bases, limits and financial/audit semantics |

Removed the obsolete `business_analyst/contractor_tools.py`,
`contractor_selectors.py` and `contractor_access.py` after the refactored regression
tests passed. No per-domain AI access files remain. The final regression run uses
the consolidated implementation with those files absent.

All 13 Contractors IDs, descriptions, closed parameter schemas, complete response
schemas and knowledge associations compare equal to the pre-refactor capability
map. Financial query bodies were moved into Contractors selectors without changing
their calculations. The complete capability map still accompanies every model
request. Documentation and multiple tools execute together in one backend batch;
no search, registry fetch or specification-discovery call was introduced.

## Authorization

Removed `READ_ROLES` and the union of unrelated permission-class allowlists. Each
tool is bound explicitly to the real API operation classes that authorize its data
sources. The adapter creates the corresponding read view and evaluates its actual
`get_permissions()` result against a freshly resolved authenticated user. Composite
tools require all relevant source-operation permissions. Agreement details and
agreement summaries, for example, also require payment-read access because their
existing invoice-total response includes all-date linked payments. Invoice details
additionally require attachment-read and audit-read permissions.

These APIs currently happen to allow the same five staff roles: Admin,
BranchAdmin, FinanceManager, InventoryManager and OperationsManager. That existing
policy is preserved; no new role policy is invented. Tests independently deny one
API source and verify that unrelated tools still work while dependent tools fail.

The server revalidates the staff/account/subscription/branch authorization binding;
stale roles or active-branch changes fail. Queries require both trusted restaurant
and branch IDs. Contractors selectors also constrain related-record ownership.
Expense IDs outside that scope are indistinguishable from missing/deleted IDs.
Caller/model scope overrides are rejected. Both executor authorization and direct
handler calls enforce permissions. Stage 0's read-only SQL guards, safe errors,
per-operation savepoints, evidence validation, conversation ownership and audit
recording remain in force.

## Registered tools

The original nine Contractors record tools remain:
`list_contractors`, `get_contractor_details`, `list_service_contracts`,
`get_service_contract_details`, `list_service_invoices`,
`get_service_invoice_details`, `list_service_invoice_lines`,
`list_contractor_payments`, `get_contractor_ledger`.

The original four Contractors summaries remain: `get_contractor_summary`,
`get_service_contracts_summary`, `get_service_invoices_summary`,
`get_contractor_payments_summary`.

The five new tools are in the existing Finance domain:

| Tool | Callable filters/parameters | Expected result |
|---|---|---|
| `list_expenses` | Optional `currency`, `name`, `search`, `date_from`, `date_to`, `page`, `page_size`, `sort` | Individual current expense records, saved original/rate/AFN fields, pagination |
| `get_expense_details` | Required `expense_id` | Complete authorized current expense; no inferred history link |
| `list_expense_history` | Optional `currency`, `name`, `search`, `action`, `date_from`, `date_to`, `page`, `page_size`, `sort` | Creation/update/deletion event snapshots, timestamp, recorded changed fields, pagination |
| `get_expense_summary` | Optional `currency`, `name`, `search`, `date_from`, `date_to` | Counts, AFN total/statistics, currency totals, bounded name/month breakdowns and exact remainders |
| `get_expense_history_summary` | Optional `currency`, `name`, `search`, `action`, `date_from`, `date_to` | Audit-event counts by action/currency/month, first/last event timestamps; no spending totals |

Dates are optional, inclusive and all-time by default. Expenses use `Expenses.date`.
History uses the event timestamp's calendar day in Asia/Kabul, with aware half-open
timestamp bounds. `name` is a case-insensitive exact name, not a category or unique
ID; search matches name/description. All sorting is enumerated and stable. Lists
are one-based, default 15, maximum 50 records per page. Summaries use database
aggregations, top ten names and latest twelve months, with explicit omitted-group
counts/totals. Currency/rate/amount fields use precise two-decimal strings.

Saved AFN equivalents are summed directly, matching Finance. Original USD totals
are kept separately and never added again to AFN totals. Audit snapshots are never
counted as expense transactions. No new financial calculations, live exchange
rates, expense statuses, categories, payment balances or historical snapshots are
introduced.

## Verification against Django data and mocked models

Final focused run: **116 tests passed**, including the existing Contractors tests,
22 new Expenses/integration tests, document coverage, Stage 0 orchestration/API,
conversation handling, evidence validation and executor safety tests.

Final broad run: **490 tests, 488 passed, two known unrelated Orders failures**
(102.599 seconds). The final focused run completed in 29.864 seconds. All Business
Analyst, Operator Mentor and knowledge regressions passed.

Tests use migrated isolated SQLite databases and real Django models, signals and
existing services. They never connect to the configured production database. The
broad suite runs in an ignored LF-source export because this Windows checkout's
CRLF conversion conflicts with pre-existing frozen knowledge/dataset byte hashes.
The actual implementation, new selectors and tests are copied byte-for-byte into
that export. No working-copy Mentor index or verified document is rebuilt/changed.

Covered cases include all-time and open/inclusive date bounds, exact names/search,
original currencies, stable sorting, page traversal/empty pages, saved conversions,
negative/zero values and rates, deleted expenses versus retained events, changed
fields, Kabul event boundaries, empty summaries, bounded grouped remainders,
SQL-level aggregation, tool-specific source denials, each permitted role, denied
roles, cross-restaurant/branch/null-branch IDs, stale scope, mixed modules and partial
failures, actual read-only batches, fresh follow-up retrieval, citations and auditing.

Reconciliation fixtures produce:

- Current expenses: seven records, **AFN 1,850.00**, including USD 12.00 already
  represented by AFN 690.00. Unfiltered figures match existing Expenses cards.
- January expense-date records: five records, **AFN 1,810.00**. This equals both
  Finance `expenses.daily_expenses` and `cash_flow.daily_expense_payments` for the
  same branch/range.
- History: ten events (eight created, one updated, one deleted), **five January
  events** on the event-date basis. A January 31 21:00 UTC event belongs to February
  1 in Kabul; a deleted USD 3.00 / AFN 210.00 snapshot contributes no current cost.
- Preserved Contractors fixture: January recognized charges AFN 385.00, recorded
  payments AFN 70.00, current all-time net debt AFN 275.00, summed provider/invoice
  balances AFN 285.00. Draft exclusions and date/balance distinctions still pass.

The scripted-model service test selects three documents and three tools in one
batch, then produces a supported answer in **two model requests**. Actual selected
documents are `admin_finance_expenses`, `admin_finance_expense_detail_history` and
`admin_contractors_shared_financial_meaning`; tools are `get_expense_summary`,
`get_expense_history_summary`, `get_contractor_summary`. Auditing records all six
operations. Its conversation follow-up re-fetches expense evidence in two requests
and does not reuse the previous tool-sourced answer. These are mocked model
selections through the real service/retrieval/database pipeline, not autonomous
live-model evidence.

## Live DeepSeek execution

**Ten live scenarios completed using 21 successful DeepSeek model requests.** All
operate against synthetic, migrated, in-memory Django fixtures, with actual tool
authorization, selectors, retrieval, conversations, evidence validation and audits.
No production restaurant records were sent. Every request's complete supplied map
was asserted equal to the backend map. Actual returned evidence/amounts and allowed
citations were checked. Calls count against the user's existing 100-call allowance:
**71 used across this chat, 29 remaining**; this task used 21.

Document abbreviations below are exact stable IDs: E = `admin_finance_expenses`,
H = `admin_finance_expense_detail_history`, C =
`admin_contractors_shared_financial_meaning`.

| Scenario | Model calls / batches | Observed tool IDs | Retrieved document IDs | Final outcome |
|---|---|---|---|---|
| All-time ordinary expenses | 2 / 1 | `get_expense_summary` | E, H | Seven records, AFN 1,850.00; currency/name/month breakdowns and no USD double count |
| January expenses versus audit events | 2 / 1 | `get_expense_summary`, `get_expense_history_summary` | E, H | Five expense records / AFN 1,810.00; five audit events, separated by date basis |
| January USD records | 2 / 1 | `list_expenses` | E, H | Fuel USD 10.00, saved rate 70.00, AFN 700.00; complete one-record page |
| Expense detail by supplied ID | 2 / 1 | `get_expense_details` | E, H | Complete Fuel fields; voucher/current-value limitation explained |
| Transport update history | 2 / 1 | `list_expense_history` | E, H | One update, amount change 100 to 120 and snapshot; no invented record link |
| Mixed January Contractors/Expenses | 2 / 1 | `get_expense_summary`, `get_service_invoices_summary`, `get_contractor_payments_summary`, `get_contractor_summary` | E, C, `admin_contractors_service_invoices`, `admin_contractors_payments`, `admin_contractors_payables`, `admin_reports_shared_period_rules` | AFN 1,810 ordinary expenses, 385 recognized service charges, 70 payments; current balances separate |
| Allowed summary plus foreign-branch expense ID | 2 / 1 | `get_expense_summary`, `get_expense_details` | E, H | Summary succeeds; restricted detail returns `RECORD_NOT_AVAILABLE`; supported partial answer |
| Waiter request | 2 / 1 | `list_expenses`, `list_expense_history` | None; E/H retrieval denied | Structured `PERMISSION_DENIED` for docs/tools; limitation with no sources or record disclosure |
| Conversation follow-up to January | 2 / 1 | `get_expense_summary` twice, January and all-time | E, H | Fresh AFN 1,810 versus 1,850 evidence, scoped to the original conversation |
| Final mixed request after source-permission tightening | 3 / 1 | `get_expense_summary`, `get_contractor_summary`, `get_service_invoices_summary`, `get_contractor_payments_summary` | E, C, `admin_contractors_payables`, `admin_contractors_service_invoices`, `admin_contractors_payments`, `admin_contractors_dashboard` | Successful supported answer after existing bounded repair rejected one malformed final JSON response |

Nine live scenarios achieved the normal two-request target. The final repeat needed
one formatting repair, producing three model requests with the same single data
batch. It did not perform discovery or another retrieval. Two requests is the
normal path, not a guarantee of model-format compliance. The invalid response was
not persisted as an accepted answer. No live scenario failed.

## Coverage, size and unchanged boundaries

All **78 document IDs, domain mappings, titles and descriptions** compare equal
before/after this refactor. All verified document bytes remain unchanged, as does
`ADMIN_BUSINESS_KNOWLEDGE.md`. A protected-file SHA-256 comparison covers 303
existing files, including original application models, signals, permissions,
services, Finance reports and Operator Mentor/knowledge code. All match.

| Capability-map representation | Before | After |
|---|---:|---:|
| UTF-8 file bytes | 127,913 | 164,928 |
| File estimated tokens | 31,979 | 41,232 |
| Compact runtime JSON bytes sent per request | 61,261 | 75,072 |
| Runtime estimated tokens | 15,316 | 18,768 |

Estimates use ceiling(UTF-8 bytes / 4), not a DeepSeek tokenizer. The added five
fully specified tools account for the increase. Runtime JSON remains within the
existing context budget, and the file remains below the existing 256,000-byte
catalog limit. The initial nine live scenarios reported actual prompt usage from
16,552 to 26,143 tokens, including system text, documents/results and history where
applicable; these are whole prompts, not isolated-map token counts.

`manage.py check` passes, `makemigrations business_analyst contractors expenses
--check --dry-run` reports no changes, and `git diff --check` reports no whitespace
errors. New files pass Python parsing. No migrations or existing write-path changes
are required. Only Contractors and Expenses are registered data-tool modules.

## Discrepancies and review items

1. **Existing expense-date history write defect:** the signal converts Decimal
   changes to JSON numbers but does not serialize Python `date` changes. Saving a
   changed date can raise `TypeError: Object of type date is not JSON serializable`.
   This surfaced during fixture setup and was traced to unchanged
   `expenses/signals.py`. Read-only reporting cannot repair missing events. Review
   the write-path fix separately; current tools read recorded data faithfully.
2. **History has no reliable expense link:** no FK/expense ID exists. Names are not
   unique or immutable. History tools intentionally expose independent events;
   adding a durable link would require a separately reviewed schema/write change.
3. **Filtered AI summaries versus unfiltered UI cards:** AI summaries honor their
   filters; existing cards ignore table filters. All-time and like-for-like Finance
   comparisons reconcile. This is an intentional scope distinction, not a changed
   business calculation.
4. **Existing financial policies remain:** zero/negative values or rates are
   permitted; USD values are already inside AFN totals; Finance treats saved
   ordinary expense cost as payment without independent cash verification; no
   cross-module duplicate-cost offset or historical snapshot is inferred.
5. **Model formatting can add a request:** one live repeat required the existing
   repair path. No new orchestration defect was observed. Production PostgreSQL
   execution was not exercised; database tests used isolated SQLite.
6. **Unrelated baseline failures:** the two Orders realtime timestamp comparisons
   remain outside this task. Operator Mentor tests pass with unchanged source and
   the established LF regression fixture. Exact failures are
   `orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
   and
   `orders.tests.OrderRealtimeRegressionTests.test_order_creation_broadcasts_full_order_and_all_created_items`.
   Both compare serialized UTC `+00:00` timestamps with Kabul `+04:30` timestamps
   for the same instant, matching the previously reproduced baseline failures.

Detailed local evidence is under ignored `artifacts/business-analyst-expenses/`:
`business-analyst-tests.log`, `full-regression.log`, `mocked-expense-behavior.json`,
`live-expenses-results.json`, `live-final-permissions.json`,
`map-measurements.json`, `protected-baseline.json` and `verify_live.py`.
Implementation stops here for review.
