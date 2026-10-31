# Restaurant Business Analyst — Stage 0 technical report

Latest review: the capability map was compacted without changing the 78 verified
documents. The runtime map is 65.85% smaller; all 59 Business Analyst tests and eight
live scenarios pass. A denial-citation repair defect was fixed without weakening
authorization. See the [capability map refactor and behavioral report](business_analyst_capability_map_refactor_report.md)
for current measurements, retrieved IDs, model-call counts and remaining review items.
The original implementation verification below records the earlier Stage 0 run.

Implemented on `feature/business-analyst-stage0`, 2026-10-31 (Asia/Kabul).
Stage 1 is not implemented. No production business-data tools or frontend were added.

## Architecture and execution

The new `business_analyst` Django app owns its prompt, execution engine, document
retrieval, registry, conversations, endpoints and audit tables. It reuses the
existing DeepSeek provider/completion protocol, model/reasoning configuration,
safe service error type and server-side staff principal resolver. No Mentor prompt,
retrieval code, tool, conversation model or endpoint was modified.

Normal flow: authenticated question + compact Business Capability Map → first
model request selects document IDs/tools → one backend batch executes operations →
second model request interprets evidence → backend validates citations/context and
persists the answer. The capability map accompanies every model request, including
follow-up rounds. There is no search requirement or tool-discovery model call.

The model can request multiple documents and tools together. Additional retrieval
is allowed when evidence is insufficient, bounded by three retrieval rounds and
five model calls by default. Invalid finals get one repair attempt; unsupported
prose is not replayed as accepted assistant context. Documentation examples are
explicitly distinguished from live restaurant figures. Answers require successful
evidence citations; unavailable live data must be explained as a limitation.

## Files

All paths below are relative to `backend/backend/business_analyst/` unless noted.

| Created | Purpose |
|---|---|
| `documents.py` | Stable catalog IDs, visibility, exact content and provenance, runtime capability map |
| `registry.py`, `executor.py`, `context.py`, `errors.py`, `config.py` | Registered read-only tools, validated contracts/defaults, trusted scope, independent batch results, safe errors and limits |
| `prompts.py`, `engine.py` | Separate analyst behavior, model protocol, evidence validation and bounded retrieval/repair |
| `models.py`, `migrations/0001_initial.py`, `auditing.py`, `service.py` | Four independent tables, ordered audit events, conversation ownership, leases, history and persistence |
| `views.py`, `urls.py`, `apps.py`, package initializers | Authenticated API, strict payloads, throttling, pagination and app registration |
| `tests/helpers.py`, four `test_*.py` files, `tests/settings.py` | Real Admin documents, synthetic authenticated scope, test-only tools, mocked provider transport, isolated test environment |
| `README.md` | Configuration, contracts, security boundaries, migration and developer verification instructions |

Modified only existing `backend/backend/backend/settings.py` (separate app/settings)
and `backend/backend/backend/urls.py` (new route). This report is also new.
Diagnostic scripts/logs and isolated regression copies are in ignored
`artifacts/business-analyst-stage0/`. Existing unrelated Flutter generated-file
changes were preserved.

## Documentation and batch contracts

The unchanged `restaurant_admin_knowledge_pack/business_ai_capability_map.json`
provides the catalog of 78 Admin documents. Backend retrieval validates catalog IDs,
resolves only confined `docs/*.md` paths, checks file identity/namespace/status, and
returns the exact UTF-8 content, including original frontmatter/newlines. Provenance
contains title/ID, relative path, SHA-256, original source references, observed status
and `ADMIN_BUSINESS_KNOWLEDGE.md` authority identity. Missing/corrupt/oversized files
produce structured errors; content is never silently truncated.

The runtime map preserves domain/document descriptions and visible related IDs.
Tool descriptors come only from the authoritative backend registry. Its production
factory is empty and frozen; test-only tools are never advertised in production.
No verified knowledge content or original capability-map bytes were edited, and no
Admin material was added to the Operator Mentor index.

Internal function `retrieve_business_context` accepts:

```json
{
  "document_ids": ["admin_dashboard_sales_meaning", "admin_dashboard_sales_trend"],
  "tools": []
}
```

Future registered invocations use `{"invocation_id":"unique-per-turn",
"tool_id":"registered.id","parameters":{...}}`. Each definition must provide
unique ID, description/domain, closed typed parameter schema, validated defaults,
output JSON schema, associated known document IDs, authorizer, handler and timeout.
Only reviewed server code can register handlers; model strings cannot import code,
execute Python/SQL, access arbitrary ORM models or fetch a registry dynamically.

Responses contain `batch_id` and ordered `results`. Every operation independently
returns `evidence_id`, `kind`, `id`, `ok`, and either `data` or `error: {code,message}`.
Denied/invalid/failed/oversized operations leave authorized peers executable. Tool
outputs include invocation identity and execution time; document outputs include
exact content and provenance. Batch-level malformed envelopes return a safe error.
Final model JSON is `{kind, content, citations:[successful evidence IDs]}`; the
backend constructs source metadata from actual successful operations.

## Security and conversation boundaries

Existing Django/DRF managed-session JWT authentication remains authoritative. The
engine reloads the authenticated staff account, active restaurant/subscription,
assigned active branch and role from server records before each operation and checks
context again before saving the answer. Client/model scope overrides are rejected.
A platform superuser without resolved tenant context is denied rather than granted
an unscoped business context.

Conservative document visibility allows `Admin` and `BranchAdmin`; branch
administration/migration guides are Admin-only. YAML `roles: []` grants no access.
This is document visibility, not permission to perform documented actions.
Individual future tools must authorize operations and filter/check records using
trusted context. `require_record_scope` checks restaurant and active branch, even
for an Admin. Tool denials return `PERMISSION_DENIED` without restricted content.

Each tool runs inside independent database savepoints with a SELECT-only guard on
Django connections. Writes, DDL, stacked SQL, SELECT INTO and locking reads are
blocked. This is defense in depth for trusted handlers, not an arbitrary-Python or
side-effecting-SQL sandbox. Future handlers must not bypass Django connections or
perform mutating external I/O.

Limits bound requests, operations, arguments, full-document/result/batch/evidence
sizes, model context and retrieval rounds. Defaults include 16 operations/batch,
32/turn, 32 KB/document, 40 KB/result, 140 KB/batch, 200 KB/evidence, 320 KB/context,
5 seconds/operation, 20 seconds/provider phase and 90 seconds/engine turn.
Tool deadlines are cooperative and checked around handlers and SQL. Hard-killing
hung Python/in-flight queries is not provided; future handlers need bounded queries
and I/O timeouts, with isolated workers/statement timeouts if hard cancellation is required.

Conversations bind to owner, restaurant, branch and authorization policy, using
separate tables from Mentor. Conditional expiring leases prevent competing replies;
interrupted/failed turns retain a failed user message without fabricating an answer.
History is bounded and stale document citations are redacted. Historical tool
observations require fresh retrieval. Metadata-only audits retain ordered model,
batch, operation, rejection and completion/failure events, counts, scope binding,
sizes, durations and provenance; raw reasoning, arguments, tool bodies and secrets
are excluded. There is no public audit endpoint.

## API and deployment

- `POST /api/business-analyst/chat/`: `message`, optional `conversation_id`, `model`, `reasoning_effort` using existing model/effort allowlists.
- `GET /api/business-analyst/conversations/?page=0`: 20 owned/scoped conversations per page.
- `GET /api/business-analyst/conversations/<uuid>/messages/?page=0`: 40 messages per page.

Responses disable caching. Configuration is independent through
`BUSINESS_ANALYST_KNOWLEDGE_ROOT`, `BUSINESS_ANALYST_THROTTLE_RATE` and validated
`BUSINESS_ANALYST_LIMITS`; DeepSeek transport/model settings remain shared.
The migration was generated and exercised only in temporary databases. Applying
`python manage.py migrate business_analyst` to a deployment database remains a
deployment step. No workspace/production database migration was performed.

## Verification

All **50 new Stage 0 tests passed** (4.444 seconds) in the actual working checkout.
The final full backend run executed **424 tests: 422 passed, 2 existing failures**
(99.791 seconds). There were no errors or skips. All Business Analyst, Mentor and
Knowledge Gateway tests passed in that full run.

| Executed check | Result |
|---|---|
| `manage.py test business_analyst --settings=business_analyst.tests.settings` | 50 passed; actual Admin content and synthetic authenticated profiles |
| `manage.py test --settings=business_analyst.tests.settings` in isolated committed-byte copy with the Stage 0 changes | 422/424 passed; two unrelated order timestamp failures |
| Same two order tests with Business Analyst removed from `INSTALLED_APPS` and original HEAD routes loaded | Both failures reproduced (0.337 seconds) |
| `manage.py check --settings=business_analyst.tests.settings` | No issues |
| `manage.py makemigrations business_analyst --check --dry-run --settings=business_analyst.tests.settings` | No changes detected |
| Python syntax checks, changed-file whitespace checks, source comparison with tested copy | Passed; all 24 Python source files identical to tested copies |
| Before/after SHA-256 comparison of the original knowledge pack and authority | All 79 pack files and `ADMIN_BUSINESS_KNOWLEDGE.md` unchanged |
| Approved live DeepSeek documentation-only smoke | Passed: two model calls, one retrieval batch, three real Admin documents, verified source hashes |

Coverage includes valid/invalid/multiple direct IDs; exact retrieval of all 78 real
documents; registration/default/type/constraint/output validation; unregistered and
Python-like names; independent authorization/exception/database/write/size/timeout
failures; trusted reloaded profiles; cross-restaurant/branch record checks; actual
documentation-only answers; two-model-call/one-batch execution; additional rounds;
forged/failed citations; model limits; mocked real DeepSeek HTTP protocol; conversation
ownership/history/context drift; managed-session revocation; lease recovery; audit
privacy/counts; and Mentor endpoint/table isolation.

The two existing failures are
`orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
and `test_order_creation_broadcasts_full_order_and_all_created_items`. Both compare
equivalent UTC `+00:00` and Kabul `+04:30` timestamp strings. Their code was not changed.

The initial regression run in the Windows working checkout encountered existing
Mentor index source-byte drift and frozen evaluation checksum mismatches. The
dataset's Git blob matches its pinned checksum; CRLF conversion does not. Regression
verification therefore used `git -c core.autocrlf=false archive` in an ignored
isolated copy, overlaid the exact Stage 0 code and unchanged Admin pack, and built
the existing Mentor index only there (328 documents, 3,467 sections, zero errors).
The working Mentor source, index, frozen annotations and checksums were not edited
to make tests pass. Final logs are in
`artifacts/business-analyst-stage0/stage0-tests.log`, `full-lf-regression-tests.log`
and `baseline-regression-tests.log`.

After explicit user approval for up to 100 DeepSeek calls in this chat, the pending
live smoke completed successfully using the existing `deepseek-flash` configuration
with reasoning disabled. The model independently selected
`admin_dashboard_sales_meaning`, `admin_dashboard_overview` and
`admin_reports_orders_cards` in one batch, then answered that dashboard revenue is
operational order value, not verified cash collection or profit. The answer's
citations and source hashes were verified against the unchanged actual documents.
Both provider requests returned HTTP 200; no production database or business-data
tool was used. The test ran against an isolated synthetic in-memory database.

The approved allowance now has **2 calls used, 98 remaining**. Usage is persisted in
`artifacts/business-analyst-stage0/deepseek_call_allowance.json`; the answer, sources
and execution counts are in `live-smoke-result.json`. Failed future attempts count
conservatively against the allowance, and the smoke harness refuses calls once it
is exhausted. This permission applies to user-directed work in this chat.

## Architectural review before Stage 1

No production tool, business calculation, action API, frontend, embedding, vector
database or new search engine was introduced. Stage 1 must review each tool's
operation/record permissions, domain-specific output contract and query/I/O bounds.
Also review broader document-role coverage, any authorized cross-branch reporting,
audit retention and whether tool workloads require hard cancellation.

Citation/provenance validation establishes actual evidence identity and integrity;
it does not prove every generated sentence is semantically entailed. One English
live smoke now confirms provider compatibility and the ordinary retrieval flow;
broader answer-quality and multilingual evaluation remain review work. The earlier
export-approval block was resolved by explicit user authorization before the live
test proceeded. Stage 0 remains ready for architectural review; Stage 1 has not begun.
