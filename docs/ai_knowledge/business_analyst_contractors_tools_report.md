# Business Analyst — Contractors read tools

This records the original Contractors implementation. The subsequent
[Expenses refactor report](business_analyst_expenses_refactor_report.md) describes
the current consolidated files, per-operation permissions and 18-tool registry.

Implemented and verified directly on **`main`**, 2026-10-31 (Asia/Kabul).
Only Contractors data tools were implemented. Changes are ready for review;
Customers and other data modules were not implemented.

## Scope and architecture

The existing Business Analyst now registers all **13 requested read-only tools**:
nine record tools and four summaries. The execution path remains
prompt + complete visible capability map → model selection → backend batch →
model interpretation. All tools, callable parameters, defaults/constraints, output
schemas and associated knowledge IDs are declared under Contractors in the map.
The backend registry remains authoritative; there is no specification-discovery call.

Existing contractor models, write services, API query/permission behavior, Finance
report code, eight verified Contractors guides and Stage 0 infrastructure were
inspected. The API's request helpers can auto-select/create branch state and can
permit all-branch Admin queries; its ledger materializes full history and serializes
floats. The new read selectors therefore reuse the model/permission definitions and
financial meanings, but apply the existing Business Analyst's trusted active-branch
scope, bounded SQL queries, precise decimal strings and paginated ledger calculations.
No existing write service or business calculation was refactored or called by a tool.

## Callable contracts

Full field semantics, date bases, allowed sorting/status values, history pagination
and financial definitions are in
[CONTRACTORS.md](../../backend/backend/business_analyst/CONTRACTORS.md).
The complete machine-readable contracts are in the capability map and
`business_analyst.tools.contractor_definitions()` (moved in the subsequent Expenses refactor).

| Stable tool ID | Category | Required parameters | Optional parameters | Result fields beyond common metadata |
|---|---|---|---|---|
| `list_contractors` | Record | None | `contractor_id`, `is_active`, `search`, `page`, `page_size`, `sort` | `results`, `pagination` |
| `get_contractor_details` | Record | `contractor_id` | None | `contractor`, `contract_count`, `invoice_totals`, `payment_count` |
| `list_service_contracts` | Record | None | `contractor_id`, `status`, `open_ended`, `search`, `date_from`, `date_to`, `page`, `page_size`, `sort` | `results`, `pagination` |
| `get_service_contract_details` | Record | `contract_id` | None | `contract`, `linked_invoice_totals` |
| `list_service_invoices` | Record | None | `contractor_id`, `contract_id`, `status`, `search`, `date_from`, `date_to`, `due_from`, `due_to`, `page`, `page_size`, `sort` | `results`, `pagination` |
| `get_service_invoice_details` | Record | `invoice_id` | `lines_page`, `payments_page`, `attachments_page`, `audit_page`, `page_size` | `invoice`, `lines`, `payments`, `attachments`, `audit_changes` |
| `list_service_invoice_lines` | Record | None | `contractor_id`, `contract_id`, `status`, `date_from`, `date_to`, `invoice_id`, `service_type`, `search`, `page`, `page_size`, `sort` | `results`, `pagination` |
| `list_contractor_payments` | Record | None | `contractor_id`, `invoice_id`, `contract_id`, `invoice_status`, `payment_method`, `search`, `date_from`, `date_to`, `page`, `page_size`, `sort` | `results`, `pagination` |
| `get_contractor_ledger` | Record | `contractor_id` | `date_from`, `date_to`, `page`, `page_size`, `order` | `contractor_id`, `results`, `pagination`, `range`, `current` |
| `get_contractor_summary` | Summary | None | `contractor_id`, `is_active`, `search`, `date_from`, `date_to` | `contractors`, `activity`, `current` |
| `get_service_contracts_summary` | Summary | None | `contractor_id`, `status`, `open_ended`, `search`, `date_from`, `date_to` | `count`, `agreement_value`, `open_ended_count`, `by_status`, `current_linked_invoices` |
| `get_service_invoices_summary` | Summary | None | `contractor_id`, `contract_id`, `status`, `search`, `date_from`, `date_to`, `due_from`, `due_to` | `totals`, `by_status`, `service_types` |
| `get_contractor_payments_summary` | Summary | None | `contractor_id`, `invoice_id`, `contract_id`, `invoice_status`, `payment_method`, `search`, `date_from`, `date_to` | `count`, `recorded_payments`, `contractor_count`, `invoice_count`, `by_method`, `by_current_invoice_status` |

Every result includes `scope=trusted_active_branch`, `currency=AFN`, `date_basis`,
`period` and `balance_basis`. Monetary amounts and service quantities are fixed
two-decimal strings. Lists return individual records, total matching count and
`has_more`; default page size is 15, maximum 50. Invoice detail independently pages
lines, payments, attachments and audit changes (default 5, maximum 20 each).
Full scalar notes/details are retained; oversized results return `OUTPUT_TOO_LARGE`
rather than silently truncating. Attachments expose metadata and an existing
authenticated download route, not storage paths or file contents.

### Date and financial semantics

- Omitted dates always mean all-time. The directory has no invented accounting-date
  filter; activity status uses `is_active`. Agreement ranges use **start_date**,
  invoice/line ranges use **invoice_date**, and payment ranges use payment **date**.
  Optional invoice due-date bounds are additional filters, not an aging policy.
- Combined contractor summaries apply bounds independently to agreement, invoice
  and payment dates. Counts/status/method groups are nested under **activity**;
  **current** balances remain all-time for the matching contractor population.
- Agreement value remains configuration, not recognized cost, cash or debt.
  Draft invoice values/counts are explicit and excluded from recognized charges,
  ledger debits and recognized payables. Zero-total Approved rows still count as Open.
- Invoice-cohort Paid/Remaining use current stored settlement from **all payment
  dates**, including future-dated entries; they are not period cash or past snapshots.
  Raw recorded payment totals remain distinct from stored capped invoice Paid.
- The Contractor dashboard's aggregate net debt is preserved as
  `max(non-draft charges − all recorded payments, 0)`. Summed individually floored
  provider balances and summed recognized invoice Remaining are reported separately.
- Ledger ordering is date, invoices-before-payments, then ID. Running balances are
  signed. Pre-range and preceding-page aggregates preserve opening/running balances
  across forward/reverse pagination. Range opening/closing are calculated from
  **current** records and explicitly labeled reconstructions, not historical snapshots.
- The engine now supplies trusted server date/timezone context for relative-date
  questions. This does not create implicit date filters. Record IDs must come from
  user input or authorized listing results; unknown names are resolved before details.
  Summary tools are preferred for totals instead of summing one page of records.

## Permissions and data boundaries

Tool roles match the existing Contractors API: `Admin`, `BranchAdmin`,
`InventoryManager`, `OperationsManager`, `FinanceManager`. The same permission
callback is attached to each tool, and the read-selector boundary rechecks it.
Restaurant, active branch and staff context come from Stage 0's authenticated,
server-reloaded principal; no scope/role overrides exist in the parameters.
Every root and related contractor/contract/invoice/payment query is tenant/branch
constrained. Inconsistent foreign-parent links are excluded, not followed.

Role/context denials return `PERMISSION_DENIED`. An explicit ID that is absent or
outside the authorized scope returns the same **`RECORD_NOT_AVAILABLE`**, preventing
an existence probe. Contradictory authorized parent filters return `INVALID_PARAMETERS`.
Unrelated operations in mixed batches still succeed. Invoice audits are limited to
that scoped invoice's Contractors events, without IPs or user agents; foreign-tenant
creator names are withheld. No file-reading or arbitrary ORM/SQL/Python API is exposed.

The eight Contractors definition guides now allow the same operational roles as
their existing API, so Finance/Inventory/Operations users can interpret permitted
tool results. Other Admin-guide visibility and the entire Operator Mentor policy
remain unchanged. Verified document content was not edited.

## Automated verification

Final complete backend run: **468 tests, 466 passed, two existing failures**,
90.168 seconds; no errors or skips. All **94 Business Analyst tests** passed,
including **35 new Contractors tests**. A dedicated working-checkout run also
passed all 94 tests (19.261 seconds) before the final clarification-only prompt line;
the final full run covers the exact final Python sources.

Coverage includes all thirteen dispatch/output contracts in one real read-only
batch, all-time and date-filtered summaries, one/all providers, individual invoice
and payment records, status/search/due-date/parent filters, inactive providers,
empty periods, unknown/out-of-scope IDs, cross-tenant/branch/inconsistent links,
real role denial, mixed partial success, no business writes, constant list query
counts, decimal line rounding, service-type grouping limits, retained credits,
ledger parity with the existing service, same-day ordering, negative openings,
forward/reverse paging, oversized actual records, fresh tool follow-ups and audits.

Scripted model tests use the **real Django models/selectors/executor/service** and
assert returned values, citations and audit counts. They are mocked model tests,
not evidence of autonomous model selection. These include two-model-call,
one-batch documentation + summary execution, a mixed authorized/foreign-ID batch,
all-tool role denials, and conversations that re-fetch changed amounts rather than
replay an earlier live observation.

The full suite used the existing isolated LF regression copy with the exact final
Business Analyst source/map overlaid. The working checkout's pre-existing Mentor
index/dataset raw-byte drift was not altered to make tests pass. The two unchanged
failures are equivalent UTC/Kabul timestamp-string comparisons in:
`orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
and `test_order_creation_broadcasts_full_order_and_all_created_items`.
These were already reproduced with Business Analyst disabled during Stage 0.

`manage.py check` reports no issues; `makemigrations business_analyst --check --dry-run`
reports no changes. Syntax/whitespace checks passed. All 30 final Python source
files match the tested copy. No production/workspace database migration was performed.

## Real DeepSeek end-to-end behavior

These are **actual successful DeepSeek requests**, using `deepseek-flash`, with
real Django tool execution against isolated **synthetic records**, not production
restaurant figures. The harness compares the complete permitted map on every
model request and records returned function names/arguments, operations and audits.
Only `retrieve_business_context` is exposed as the model function; the IDs below
are the actual backend tools requested inside its batches. No tool-spec discovery
or documentation-search call occurred.

| Scenario | Model requests / batches | Actual tool IDs | Retrieved documentation IDs (unique) | Final outcome |
|---|---:|---|---|---|
| all_time_reconciliation | 2 / 1 | `get_contractor_summary` | `admin_contractors_shared_financial_meaning`, `admin_contractors_payables`, `admin_contractors_service_invoices`, `admin_contractors_dashboard` | answer; all operations succeeded |
| january_activity | 2 / 1 | `get_contractor_summary`, `get_service_contracts_summary`, `get_service_invoices_summary`, `get_contractor_payments_summary` | `admin_contractors_shared_financial_meaning`, `admin_contractors_dashboard`, `admin_contractors_service_contracts`, `admin_contractors_service_invoices`, `admin_contractors_payments`, `admin_contractors_payables`, `admin_contractors_profiles` | answer; all operations succeeded |
| invoice_and_agreement_details | 3 / 2 | `list_service_invoices`, `get_service_invoice_details`, `get_service_contract_details` | `admin_contractors_service_invoices`, `admin_contractors_shared_financial_meaning`, `admin_contractors_service_contracts`, `admin_contractors_payments` | answer; all operations succeeded |
| alpha_ledger | 3 / 2 | `list_contractors`, `get_contractor_ledger` | `admin_contractors_shared_financial_meaning`, `admin_contractors_profiles`, `admin_contractors_service_invoices`, `admin_contractors_payments`, `admin_contractors_payables` | answer; all operations succeeded |
| mixed_record_scope | 2 / 1 | `get_contractor_summary`, `get_contractor_details` | `admin_contractors_shared_financial_meaning`, `admin_contractors_dashboard`, `admin_contractors_profiles`, `admin_contractors_payables` | answer; RECORD_NOT_AVAILABLE |
| permission_denied | 2 / 1 | `get_contractor_summary` | None | limitation; PERMISSION_DENIED, PERMISSION_DENIED, PERMISSION_DENIED, PERMISSION_DENIED, PERMISSION_DENIED, PERMISSION_DENIED |
| today_payments | 2 / 1 | `get_contractor_payments_summary`, `list_contractor_payments` | `admin_contractors_shared_financial_meaning`, `admin_contractors_payments` | answer; all operations succeeded |

Final financial observations, reviewed against the tool results:

- All-time: **7 recognized invoices, AFN 425.00**; one separate AFN 70.00 draft;
  six recorded payments totaling **AFN 150.00**. Aggregate net debt is **AFN 275.00**;
  provider and invoice balance sums are **AFN 285.00**, with a retained AFN 10 credit
  explaining the difference. Agreement value is AFN 2,000.00 and is not expense.
- January: four agreements started with AFN 1,000.00 value; six recognized invoices
  with **AFN 385.00 charges**, one AFN 70.00 draft, and three **AFN 70.00 payments**.
  Current net debt stays AFN 275.00. The invoice-cohort current Remaining of AFN
  245.00 is clearly distinguished from payment activity and January closing debt.
- Invoice ALPHA-JAN: two lines (80.00 and 20.00), Total 100.00, two payments totaling
  50.00, Remaining 50.00, one attachment's metadata and scoped creation audit;
  linked agreement value 1,000.00 versus recognized linked charges 150.00.
- Alpha's January ledger: reconstructed opening **40.00**, four invoice entries
  debiting **175.00**, one payment credit **30.00**, reconstructed closing **185.00**;
  separate current outstanding **105.00**. Unknown names were listed before IDs
  were passed to detail/ledger tools, so those workflows legitimately needed two
  retrieval phases and three model calls.
- Mixed scope: the authorized summary succeeds; the other-branch explicit ID is
  unavailable without contacts/amounts. A Waiter receives a limitation after every
  requested operation is denied, not fabricated zeros. Today's payment check uses
  **2026-10-31, Asia/Kabul**, returns zero payments, and does not substitute the
  all-time AFN 150.00 result.

### Discrepancies found and addressed

1. The pre-existing dashboard-style net balance and Finance's summed invoice
   balances can differ. Both definitions are preserved and labeled; no attempt was
   made to rewrite existing calculations or automatically settle credits.
2. Initial live wording confused total invoice count with recognized invoices and
   total ledger entries with invoice-only entries. Explicit draft/recognized and
   invoice/payment counts were added. A later period answer mislabeled a period
   status group as all-time; nesting those groups under `activity` removed that
   ambiguity. The affected real-model runs were repeated and reviewed successfully.
3. One initial all-time response needed the existing bounded JSON-format repair
   (three model requests, one batch). Its final rerun completed in two requests.
   Evidence validation was not relaxed and unsupported drafts were not persisted.
4. Role-compatible Contractors tools need definition access. The eight-guide
   visibility extension follows the existing API roles, without broadening other
   modules or changing any verified document/Operator Mentor policy.

This task used **26 live API calls**, including targeted retries after output-contract
clarifications. The chat allowance is now **50/100 used; 50 remaining**.
The live tests do not constitute exhaustive model or multilingual quality evaluation.

## Files, preserved content and review items

Added `business_analyst/contractor_access.py`, `contractor_selectors.py`,
`contractor_tools.py`, `CONTRACTORS.md`, `tests/contractor_data.py` and
`tests/test_contractor_tools.py`. Updated registry wiring, Contractors-only guide
visibility, safe record error, prompts/server date context, map declarations,
README and the two Stage 0 tests whose zero-tool assumptions no longer applied.

All 78 verified Admin document IDs/titles/domain mappings remain intact. **553
protected files have unchanged SHA-256 hashes**: verified knowledge and authority,
original contractor models/services/views, Finance reports, Mentor/Gateway code,
operator documents/evaluation material and the working private index. The capability
map is intentionally updated only in the Contractors tools array. Its current
size is **127,913 bytes** readable JSON, **61,261 bytes**
for the complete Admin runtime map, within existing catalog/context limits.

No Contractors-related test failure remains. Review before broader rollout:
active-branch-only scope (even for Admin), legacy retained credits/data consistency,
and deployment SQL statement timeouts for very large datasets. The existing five-second
deadline is cooperative; it cannot forcibly cancel an in-flight query. Invoice
detail histories are explicitly paginated, and single oversized fields fail safely.
Historical accounting snapshots, bank reconciliation, refunds/reversals, write tools
and tools for other domains were not added. Stage 0 audit-retention and general
semantic/multilingual evaluation decisions remain unchanged.

Logs and live traces: `artifacts/business-analyst-contractors/` contains
`final-business-analyst.log`, `review-full-regression.log`, `live-results.json`,
`live-after-counts.json`, `live-period-and-date.json` and the protected hash baseline.
The persisted allowance is `artifacts/business-analyst-stage0/deepseek_call_allowance.json`.

Implementation remains directly on `main`, ready for review.
