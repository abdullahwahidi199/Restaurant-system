# Compact Business Capability Map and Stage 0 compatibility review

Verified 2026-10-31 (Asia/Kabul), on `feature/business-analyst-stage0`.

## Result and size

The map is now a selection catalog: `schema_version`, `id`, `domains`; each domain
has `id`, a short description, `documents`, `tools`; every document has exactly
`id`, `title`, a concise description. All **78 IDs, titles and domain mappings**
are preserved across **10 domains**. Descriptions contain **9–12 words**. Existing
tool arrays were empty and remain empty in production. Authority/scope/coverage,
paths, keywords, topics, related IDs, repeated rules and redundant metadata were removed.

| Measured representation | Before bytes | After bytes | Byte reduction | Estimated tokens before → after |
|---|---:|---:|---:|---:|
| Readable JSON file | 124,071 | 21,175 | 82.93% | 31,018 → 5,294 |
| Actual minified map supplied to an Admin model request | 48,184 | 16,456 | 65.85% | 12,046 → 4,114 |

Token estimates use `ceil(decoded character count / 4)`, not a DeepSeek tokenizer.
The old engine already projected out some file metadata, so the **65.85% runtime
reduction** is the relevant map-input saving; the file reduction is not a claim
about billed token savings. Live fresh documentation prompts reported 4,240–4,250
total input tokens before the targeted denial-guidance adjustment; that includes
system instructions and the question, not just the map. Evidence/history and
registered tool contracts add their own input. The payroll follow-up included
history and reported 4,619 first-request input tokens.

## Implementation and compatibility

- `business_analyst/documents.py` depended on removed document paths. It now validates
  the compact schema and derives `docs/<validated_document_id>.md` inside the configured
  pack, retaining resolved-path containment checks, visibility and exact content/hash
  retrieval. Paths remain in retrieved provenance, not in the selection map.
- Runtime map compilation no longer adds `related_docs` or a top-level `rule` field.
  For an Admin and the empty production registry, the compiled map equals the entire
  compact JSON map. Authorized branch visibility still filters Admin-only guides.
  Every model request, including retrieval/repair/follow-up rounds, receives that
  complete visible catalog. There is no per-question map truncation.
- Known IDs fetch directly. No search, embeddings, vector index or discovery token
  is involved. The model can fetch multiple documents and invoke tools together through
  `retrieve_business_context`; ordinary execution remains two model calls and one batch.
- Source tool entries may retain selection metadata, but only registered handlers
  are advertised. The registry overrides description, parameters, defaults/constraints,
  output contract and knowledge IDs with authoritative values. Test-only registrations
  demonstrated direct invocation without fetching specifications. A JSON entry alone
  cannot register code or authorize an operation.
- Authentication/profile resolution, restaurant/branch checks, record helpers, tool
  authorization, SELECT-only execution, savepoints, limits, conversation ownership,
  leases, stale evidence handling and audit storage retain their existing boundaries.
  No API, authentication, conversation schema or business calculation changed.

### Behavioral defect found and fixed

The first mixed live run selected the correct document and both test tools. The
document and `test.echo` succeeded; `test.denied` independently returned
`PERMISSION_DENIED`. The model then cited the denied operation (`b1:2`) as proof of
the denial. The backend correctly rejected the draft, but generic repair guidance
did not resolve it. A diagnostic reproduction confirmed the same issue: each run
used three model requests and one batch and ended in `unsupported_answer`.

The Business Analyst prompt now explicitly requires `ok=true` for citations and
explains that failures can be described in prose without citing their IDs. Its
JSON example is valid JSON. Repair feedback lists the exact successful IDs and
distinguishes evidence IDs from tool/invocation IDs. **Failed citations are still
rejected; no permission or evidence validation was relaxed.** A new service-level
regression verifies recovery, safe persistence and the bounded repair call. The
targeted live rerun passed in two calls/one batch, citing only `b1:0` and `b1:1`.

## Actual live DeepSeek behavior

These are successful real HTTP requests to the configured DeepSeek service using
`deepseek-flash`, reasoning disabled, under the user-approved allowance. The real
conversation service, engine, document retrieval, registry/executor and audits ran
against an isolated synthetic in-memory database. No production records were queried.

Each accepted case below emitted **one `retrieve_business_context` invocation**,
with multiple document IDs as shown, followed by a final answer. All received the
complete compact map on every request; all required document selections and cited
hashes passed verification. There were **no search or registry-fetch calls**.

| Question / domain | Model calls / batches | Observed retrieved document IDs | Final outcome |
|---|---:|---|---|
| Dashboard: order statuses, revenue, cash and profit | 2 / 1 | `admin_dashboard_sales_meaning`, `admin_dashboard_headline_cards`, `admin_dashboard_overview` | Grounded answer; successful citations only |
| Inventory: alerts, dashboard populations and zero-stock PDF rules | 2 / 1 | `admin_inventory_low_stock_alerts`, `admin_inventory_dashboard`, `admin_inventory_stock_levels` | Grounded answer; successful citations only |
| Procurement: net supplier debt versus invoice balances | 2 / 1 | `admin_procurement_suppliers`, `admin_procurement_purchase_invoices`, `admin_procurement_payables`, `admin_procurement_shared_financial_meaning` | Grounded answer; successful citations only |
| Payroll: earned expense, net salary, advance recovery and payment | 2 / 1 | `admin_payroll_shared_scope_dates`, `admin_payroll_records`, `admin_payroll_salary_advances`, `admin_payroll_payments` | Grounded answer; successful citations only |
| Payroll follow-up: excess advances and unresolved carry-forward policy | 2 / 1 | `admin_payroll_salary_advances`, `admin_payroll_records`, `admin_payroll_shared_scope_dates` | Grounded answer; successful citations only |
| Finance: purchases versus profit and cash-flow reconciliation | 2 / 1 | `admin_reports_finance_profit_cost`, `admin_reports_finance_profit_flow_cash`, `admin_reports_finance_purchase_contractor_payroll`, `admin_reports_shared_period_rules` | Grounded answer; successful citations only |
| Settings: blank, zero and disabled branch overrides | 2 / 1 | `admin_administration_settings_delivery`, `admin_administration_settings_branch`, `admin_administration_settings_scope` | Grounded answer; successful citations only |
| Synthetic mixed batch: definition, allowed echo and denied tool | 2 / 1 | `admin_dashboard_sales_meaning` | Grounded answer; successful citations only |

The seven documentation/follow-up cases used `tools: []`. Their answers were reviewed
against the actual retrieved definitions: status populations differ; stock alerts/PDFs
use different inclusion rules; retained payments explain supplier/invoice discrepancies;
advance recovery and salary payment do not duplicate earned expense; excess advance
recovery remains unresolved; purchase/cash labels do not establish profit/reconciled
cash; branch inheritance distinguishes blanks from explicit zero/disabled values.
The payroll follow-up reused the same conversation (four stored messages after two
turns), retrieved fresh evidence and had its own complete execution audit.

Only the final **synthetic mixed test** injected `test.echo(amount=3)` and
`test.denied(amount=1)` into an isolated registry. It returned three independent
outcomes: document success, echo value 3, permission denial. The answer clearly
identified the latter as unavailable rather than zero. These are **test-only tools**,
never production capabilities, and their contracts were present in the first map.

This refactor consumed **22 live API calls**: 14 for seven documentation/follow-up
cases, six for the original mixed failure and diagnostic reproduction, and two for
the successful fixed rerun. Including the earlier Stage 0 smoke, the allowance is
**24/100 used; 76 remaining**. No further live calls are needed for this change.

## Mocked model behavior through the real pipeline

These tests script the model's selections and final response. They exercise actual
retrieval, permissions, batches, evidence, conversation persistence and auditing;
they **do not measure autonomous selection quality**. Finals use body text obtained
from actual retrieval, and tests compare the entire compact map on every request.

| Domain | Model calls / batches | Actually retrieved IDs |
|---|---:|---|
| dashboard | 2 / 1 | `admin_dashboard_sales_meaning`, `admin_dashboard_headline_cards` |
| operations | 2 / 1 | `admin_operations_orders`, `admin_operations_reservations` |
| restaurant | 2 / 1 | `admin_restaurant_menu`, `admin_restaurant_kitchen_stations` |
| inventory | 2 / 1 | `admin_inventory_low_stock_alerts`, `admin_inventory_dashboard` |
| procurement | 2 / 1 | `admin_procurement_suppliers`, `admin_procurement_purchase_invoices` |
| hr | 2 / 1 | `admin_hr_attendance`, `admin_hr_shifts` |
| payroll | 2 / 1 | `admin_payroll_records`, `admin_payroll_salary_advances`, `admin_payroll_payments` |
| contractors | 2 / 1 | `admin_contractors_service_contracts`, `admin_contractors_service_invoices` |
| finance | 2 / 1 | `admin_reports_finance_profit_cost`, `admin_reports_finance_profit_flow_cash`, `admin_reports_finance_purchase_contractor_payroll` |
| administration | 2 / 1 | `admin_administration_settings_scope`, `admin_administration_settings_branch`, `admin_administration_settings_delivery` |

Additional service-level observations (all produced controlled complete turns):

| Scenario | Model calls / batches | Structured operation errors | Final outcome and successful document IDs |
|---|---:|---|---|
| missing_document_partial_evidence | 2 / 1 | DOCUMENT_UNAVAILABLE | limitation; `admin_dashboard_sales_meaning` |
| invalid_id_recovery | 3 / 2 | INVALID_DOCUMENT_ID | answer; `admin_dashboard_sales_meaning` |
| oversized_arguments | 2 / 0 | LIMIT_EXCEEDED | limitation; None |
| oversized_batch | 2 / 0 | LIMIT_EXCEEDED | limitation; None |
| oversized_document | 2 / 1 | OUTPUT_TOO_LARGE | limitation; None |
| failed_evidence_rejected | 3 / 1 | DOCUMENT_UNAVAILABLE | limitation; None |
| mixed_documents_and_test_tools | 2 / 1 | PERMISSION_DENIED, PERMISSION_DENIED | answer; `admin_dashboard_sales_meaning` |
| denied_citation_repair | 3 / 1 | PERMISSION_DENIED | answer; `admin_dashboard_sales_meaning` |
| followup_initial | 2 / 1 | None | answer; `admin_dashboard_sales_meaning` |
| followup_fresh | 2 / 1 | None | answer; `admin_dashboard_headline_cards` |

Oversized argument/batch envelopes execute no batch operations. Oversized/missing
documents return no truncated success content. Failed IDs cannot become citations.
The mixed mocked batch included an authorized document/test tool and denied document/tool;
unregistered map entries were omitted and registry contracts overrode stale declared
parameter metadata. Existing API tests also cover real managed-session JWT revocation,
wrong owners/restaurants/branches/roles, expired leases, stale citations and audit privacy.

## Verification and protected content

- Final working-checkout Business Analyst run: **59 tests passed**, 2.736 seconds,
  native runner exit code 0. Initial pre-fix run: 58 passed.
- Final full backend run: **433 tests, 431 passed, two existing failures**, 87.783 seconds.
  No errors or skips. All Business Analyst, Operator Mentor and Knowledge Gateway tests passed.
- `manage.py check`: no issues. `makemigrations business_analyst --check --dry-run`:
  no changes. No production/workspace database migration was applied.
- SHA-256 comparison of **520 protected files** found **zero changes**:
  all 78 verified Admin documents, `ADMIN_BUSINESS_KNOWLEDGE.md`, Mentor and Knowledge
  Gateway code, operator source/evaluation material and the working private index.
  Only the capability-map file itself was intentionally changed within the pack.
- The full regression suite used the existing isolated Git export with LF source
  bytes and the exact updated Business Analyst Python files/map overlaid. This avoids
  the working checkout's pre-existing CRLF/index/frozen-dataset checksum drift without
  editing Mentor files or frozen checksums. Operator retrieval and endpoint regression
  tests continued to use the existing Mentor pipeline, not the new Admin catalog.

Remaining full-suite failures are unchanged UTC versus Kabul timestamp-string assertions:
`orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
and `test_order_creation_broadcasts_full_order_and_all_created_items`. They were already
reproduced without the Business Analyst app during Stage 0; no order code was changed.

## Files and remaining review items

Changed: the compact map, `business_analyst/documents.py`, `prompts.py`, `engine.py`,
`tests/test_documents.py`, and `README.md`. Added `tests/test_behavior.py` and this
report; linked the result from the Stage 0 report. Shared provider/registry/executor,
authentication, models and Operator Mentor implementation remain unchanged by this refactor.

No refactor-related failing test or unresolved live failure remains. Before Stage 1,
review cooperative tool deadlines versus hard cancellation, each actual tool's
record/operation permissions and bounded queries, audit retention, and broader
multilingual/semantic answer evaluation. Citation integrity does not itself prove
every sentence is entailed. The existing working Mentor index-byte drift and two
order timestamp tests remain separate maintenance/deployment issues.

Detailed artifacts are under `artifacts/business-analyst-stage0/capability-map-refactor/`:
`measurements.json`, before/after runtime maps, `mocked-behavior.jsonl`,
`stage0-after-fix.log`, `final-full-regression.log`, `live-behavior.json`,
`live-mixed-diagnostic.json`, and `live-mixed-after-fix.json`. The call ledger is
`artifacts/business-analyst-stage0/deepseek_call_allowance.json`.

Reproduce local checks from the repository root with the project's Python:

```powershell
& .\backend\backend\venv\Scripts\python.exe artifacts/business-analyst-stage0/run_refactor_tests.py business_analyst
& .\backend\backend\venv\Scripts\python.exe artifacts/business-analyst-stage0/measure_refactor.py
```

Live runs require the explicit `--live` harness option and consume the persisted
allowance. Existing results are not overwritten implicitly. Stage 1 was not started.
