# Compact Business Analyst Capability Map

The initial map remains the complete entry point for selecting documents and
invoking tools. All 10 domains, 48 registered tools and 78 Admin document entries
are preserved. No discovery endpoint, routing layer, specification fetch or extra
model-selection phase was introduced.

## Generation and authority

`ToolDefinition` retains its complete input schema, nested output schema,
description, knowledge associations, authorization callback, handler, timeout and
read-only flag. It now also carries a concise `returns` description. All 48
production registrations define that metadata next to their existing contracts
in `business_analyst/tools.py`.

`ToolRegistry.get()` still supplies the full internal contract. Registration,
parameter validation, output validation, Decimal formats, required fields,
pagination constraints, scope checks and execution are unchanged.

`ToolRegistry.capabilities(domain)` generates this AI-facing projection:

```text
id, description, parameters (the exact existing input schema), returns, knowledge_ids
```

It omits the nested output schema. After execution, the existing complete
authorized result still appears in the batch's `data.output` field.

`DocumentRepository.capability_map()` derives tool entries from the registry,
including newly registered tools absent from the catalog snapshot. It only
retains optional plain-text legacy `selection_hint` metadata from that snapshot;
stale `output`, input schemas, descriptions or `returns` cannot override the
canonical registration or leak full output schemas back into model context.
The checked-in JSON map is a generated readable snapshot, not another registry.

Registrations without a return description remain discoverable using their tool
description and top-level output field names as a safe fallback. This neither
transmits the full output schema nor requires a specification fetch. Non-string
return descriptions are rejected during registration.

Domain, document and tool ordering and JSON serialization remain deterministic.
There are no timestamps, random values or new user-specific fields in the map.
Existing document visibility remains unchanged. The engine, batch API, provider,
model/thinking selection, persistence, audits, citations, selectors, permissions,
business rules, frontend and Operator Mentor implementations are unchanged.

## Before and after measurements

Measurements use the actual compact UTF-8 `json_bytes()` serialization supplied to
the model, rather than pretty-printed file sizes. The baseline was captured before
implementation from the current 48-tool repository, not the older 18-tool audit.

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Serialized map bytes | 202,790 | 91,956 | 110,834 fewer; 54.65% reduction |
| Output-schema bytes in initial map | 120,097 | 0 | Removed from AI-facing representation |
| Input-schema bytes | 51,287 | 51,287 | Exact preservation |
| Return-description bytes | 0 | 9,215 | Added selection information |
| Full internal output-schema bytes | 120,097 | 120,097 | Exact preservation |
| Domains | 10 | 10 | Unchanged |
| Registered tools | 48 | 48 | Unchanged |
| Document entries | 78 | 78 | Unchanged |
| Estimated map tokens (UTF-8 bytes / 4) | 50,698 | 22,989 | Heuristic only |
| Representative initial engine-contract bytes | 239,512 | 106,708 | Same question, prompt and batch definition |

No suitable tokenizer package was installed locally. The map-only token figures
above are explicitly estimates and are not DeepSeek tokenizer counts. Live API
usage, where reported below, measures complete model requests and is separate
from these estimates. Byte reduction is not a claim of identical API-cost savings.

The original input schemas, output schemas, descriptions and knowledge
associations were fingerprinted for all 48 tools. Their SHA-256 values are exactly
preserved. The ordered domain/document catalog fingerprint is also unchanged.

## Verification

- Seven new Django tests cover complete capability coverage, exact contract
  fingerprints, deterministic serialization, deep-copy isolation, useful return
  descriptions, legacy/future fallback, stale-catalog output exclusion, unchanged
  output validation and authorization, and before/after execution equivalence.
- Six representative scripted questions run against both full and compact
  representations using the same registry and real synthetic Django data. All
  twelve turns use two model calls and one batch, including documentation-only,
  tool-only, mixed, multi-tool, date-filtered and cross-module questions.
- Those cases include the two requested Contractor definition/reconciliation
  questions, Contractor and Expense listings, service invoice/payment summaries,
  current debt, expense totals, and Inventory/Procurement comparisons.
- The full domain regression command collected 172 tests: 170 passed and two
  opt-in live suites were skipped. This includes existing Contractor, Expense,
  Inventory, Procurement, batch, audit, citation and provider regression tests.
- Invalid empty outputs, financial decimal values and pagination values remain
  rejected by the full server-side output schemas. Real batch outputs before and
  after generating the compact projection are identical.

The live comparison ran the four representative questions against both maps using
the existing `deepseek-flash` provider/model with thinking disabled, private server
credentials, and synthetic records in the isolated test database. All eight turns
passed, with no failed tool/document operations and final citations validated by
the unchanged backend. No production restaurant data was sent.

| Live question | Calls before / after | Prompt tokens before / after | Time before / after |
|---|---:|---:|---:|
| Contractor balance versus invoice balances | 2 / 2 | 112,308 / 48,967 | 9.07 s / 7.70 s |
| Agreement, invoice, payment and balance definitions | 2 / 2 | 112,084 / 49,596 | 8.63 s / 10.29 s |
| January contractor charges, payments and operating expenses | 2 / 2 | 113,067 / 51,336 | 9.76 s / 7.79 s |
| Current valuation versus September procurement activity | 3 / 2 | 171,920 / 51,697 | 12.80 s / 8.27 s |
| Total | 9 / 8 | 509,379 / 201,596 | 40.26 s / 34.05 s |

The API-reported cumulative prompt-token reduction in this sample was 60.42%.
That figure includes differences in selected documents and one fewer model call;
it is not a map-only token estimate or a guaranteed cost/latency saving. All model
function calls used `retrieve_business_context`; there were no specification or
discovery calls. The baseline's additional call is not evidence that compaction
will always eliminate a call. One compact answer took longer than its baseline.

Both definition questions selected documentation only. For the January comparison,
both maps selected the same three tools and exact date arguments:
`get_service_invoices_summary`, `get_contractor_payments_summary`, and
`get_expense_summary`, each with January 1-31, 2026 bounds. Their answers passed
checks for AFN 385 recognized charges, AFN 70 payments and AFN 1,810 expenses.
For valuation/procurement, both selected `get_inventory_summary` and
`get_procurement_summary`; the compact invocation additionally specified the
supported `group_by=month`. Both preserved current valuation versus dated activity
and passed amount/incomplete-stock checks. Selected document sets varied, as
expected for nondeterministic model calls; exact IDs and arguments are saved.

Measured prompt-cache utilization was 437,120 hit / 72,259 miss tokens (85.81%)
before, and 161,792 hit / 39,804 miss tokens (80.26%) after. Cache hits remained
available with the deterministic compact prefix; this small interleaved comparison
does not establish a cache-rate improvement. The new prefix naturally starts cold
and the total prompt populations differ. No provider pricing or cost assumptions
were applied.

## Files changed

Modified:

- `backend/backend/business_analyst/registry.py`: return metadata, safe fallback
  and compact AI-facing projection; full validation contracts remain internal.
- `backend/backend/business_analyst/documents.py`: canonical compact map merge
  that cannot reintroduce legacy nested output schemas.
- `backend/backend/business_analyst/tools.py`: 48 adjacent return descriptions;
  original input/output contracts, descriptions, associations and handlers intact.
- `backend/backend/business_analyst/tests/test_behavior.py`: compact projection
  assertion plus an explicit internal full-output-contract assertion.
- `backend/backend/business_analyst/README.md`: current registry count and
  registration/serialization documentation.
- `docs/ai_knowledge/restaurant_admin_knowledge_pack/business_ai_capability_map.json`:
  regenerated compact snapshot with unchanged domains, documents and input schemas.

Created:

- `backend/backend/business_analyst/tests/test_capability_map.py`: contract,
  deterministic projection, execution and representative scripted tests. Its full
  representation adapter is a test-only control derived from the same registry.
- `backend/backend/business_analyst/tests/test_capability_map_live.py`: opt-in
  four-question/eight-turn live before/after comparison, recording selections,
  arguments, operation outcomes, validated citations, usage, cache counts and time.
- `backend/backend/business_analyst/tests/fixtures/capability_contracts_before.sha256.json`:
  historical contract/catalog fingerprints, used only by regression tests.
- `backend/backend/business_analyst/CAPABILITY_MAP_OPTIMIZATION.md`: this report.

Generated inspection artifacts are saved under the existing ignored
`artifacts/business_analyst_capability_map/` directory:

- `before.metrics.json` and `after.metrics.json`
- `before.sample.json` and `after.sample.json`: representative Contractor and
  Expense summary entries, explicitly marked as historical/generated samples
- `live.comparison.json`: actual live questions, selections, arguments, outcomes,
  response text, usage/cache metrics and timings
- `live.summary.json`: per-case and combined measured comparisons

Historical samples and fingerprints are never loaded as runtime tool registries.
The full baseline map used for local inspection is outside the repository at
`E:/pakhlai/business_analyst_capability_map.before.full.json`.

## Limits and trade-offs

The input schemas remain the largest component of the optimized map. This change
intentionally does not compress their descriptions, constraints or invocation
coverage. Return descriptions are selection guidance; only executed results are
business evidence. Exact backend validation remains authoritative.

The representation change naturally changes the cached prefix once. Subsequent
prefixes are deterministic, preserving the existing prompt-cache opportunity;
cache-hit rates and latency depend on provider state and cannot be guaranteed.
Small live comparisons are nondeterministic observations rather than proof of
equal selection or answer quality for every possible question. Further evidence
rounds remain available for genuine business-data needs, not schema discovery.
