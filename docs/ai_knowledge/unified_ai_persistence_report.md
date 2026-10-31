# Unified AI persistence and auditing

Implemented on `main`, 2026-10-31 (Asia/Kabul). Both existing agents use the single
seven-model persistence/audit foundation in `ai_assistant`. Their chat components,
prompts, knowledge, tools, financial calculations and execution policies remain
independent and unchanged. No additional business module or tool was implemented.

## Final storage and service structure

| Shared model | Purpose and compatibility |
|---|---|
| `Conversation` | Existing UUID/owner/scope/lease/history fields; indexed, server-selected `agent_type`; 128-character authorization binding |
| `Message` | Existing content, state, kinds, sources and per-turn role uniqueness; nullable `legacy_id` and `public_id` preserve imported numeric API IDs |
| `TurnAudit` | Shared agent identity, original conversation UUID, provider/model/configuration, message links, durations, actual usage, model/tool counters and Business Analyst batch/operation counters |
| `AuditEvent` | Existing immutable ordered encrypted-payload event; imported ID retained as `legacy_id`; tool names support up to 100 characters |
| `AuditBlob` | Existing content-addressed encrypted/redacted payload format and immutability |
| `AuditBlobReference` | Existing protected references for shared large payload fragments |
| `AuditAccess` | Existing access logging for sensitive SuperAdmin reads |

`ai_assistant.agents` defines the stable `operator_mentor` and `business_analyst`
identities. Future bounded identifiers work through the same storage; there is no
new per-agent persistence model or table. `AgentStore` in
`ai_assistant/persistence.py` centralizes scope filters, lease reservation,
message/audit creation, answer persistence, failures and lease release. Each agent
instantiates its own store in trusted server code. Agent identity is never taken
from a chat field, tool argument or model output.

Both services use the existing shared encrypted `Trace` and provider audit scope.
The Business Analyst additionally records its actual model boundaries, macro tool
invocations, batch results and individual documentation/data-operation outcomes
through that same implementation. Reported token usage is aggregated once from
provider responses, not duplicated from step metadata. Private reasoning and
credentials are excluded; sensitive observable payloads remain encrypted.

`business_analyst/models.py` and `auditing.py` are compatibility imports only. They
define no Django models or alternative auditing engine. Old callers can import
the same names while using the shared classes. The Business Analyst app has no
remaining persistence tables after the migration.

## Migrations and existing data

1. `ai_assistant/migrations/0005_unified_agent_storage.py` adds/backfills the Mentor
   discriminator, widens compatible fields, adds legacy IDs, public configuration,
   batch/operation counters and indexes for agent-scoped access.
2. `business_analyst/migrations/0002_unify_persistence.py` atomically copies all old
   conversations, messages, turns and events; verifies original values and
   relationships; and removes the four old tables only after verification succeeds.
   PostgreSQL locks both source and destination tables during that transaction.

Conversation/turn UUIDs, request IDs, histories, ordering, timestamps, content,
sources, states and recorded errors are retained. Existing Mentor IDs and encrypted
payloads remain intact. Business Analyst numeric message/event IDs can overlap the
Mentor IDs; imported rows receive distinct internal IDs above the old ranges while
retaining original IDs as `legacy_id`. Both serializers use `Message.public_id`,
so existing Business Analyst message IDs remain stable. Foreign keys point to the
new internal records and database sequences advance past the copied IDs.

Active Business Analyst turns, UUID collisions, payload/integrity failures and
verification mismatches abort without removing source records. There is no reset,
UUID renaming or silent overwrite. Old `complete` becomes canonical `completed`,
with the original status retained in the encrypted import notes.

Imported Business Analyst metadata is encrypted/redacted using the existing blob
format, including literal-marker escaping. Actual recorded model-finished usage
is preserved and summed; partial/missing usage stays marked incomplete. Legacy
provider/language fields that were not recorded remain unavailable. Missing HTTP
payloads and tool-start events are not reconstructed. Tool counts for imported
records reflect observed completed retrieval calls; capture notes explain the
missing start information. Nonnegative elapsed durations can be derived from
recorded turn timestamps and are labeled with that basis; clock-skewed intervals
produce unavailable duration. Extra legacy configuration is retained inside
encrypted snapshots, not forwarded as unencrypted summary metadata.

Shared conversation deletion cascades live messages while retaining audit turns,
events, original conversation UUID and encrypted snapshots through nullable links.
Restaurant/branch deletion nulls shared scope links; live Business Analyst
execution still requires a valid trusted restaurant and branch.

**The configured application database was not migrated.** All upgrade executions
used disposable SQLite/PostgreSQL databases. Deployment requires a verified backup,
retained encryption keys/fallbacks, stopped application writers and `manage.py
migrate` before restarting the new code. Successful consolidation is intentionally
irreversible through `migrate`, preventing rollback from silently discarding new
shared/richer records. Restore the verified database backup and matching release
for a rollback. Full operating details are in
[UNIFIED_PERSISTENCE.md](../../backend/backend/ai_assistant/UNIFIED_PERSISTENCE.md).

## Independence and existing interfaces

Every staff conversation query includes the server-selected agent plus owner,
restaurant, branch and authorization binding. The Business Analyst retains its
existing policy suffix. Cross-agent access fails even when an authorization
binding is intentionally made identical. Both chat serializers, history pagination,
conversation IDs, endpoint paths, model/thinking controls and response DTOs remain
compatible. Both chat bodies reject an attempted `agent_type` override.

No production chat component, hook, style or API adapter was changed by this
refactor. A SHA-256 comparison confirms **202 protected files** remain byte-identical,
covering both chat modules, prompts, verified knowledge/Capability Map, Contractors
and Expenses selectors/models/services and report calculations. Existing financial
tests still pass. The prompt/capability-map selection/batch/answer architecture is
unchanged.

## Centralized SuperAdmin interface

The existing `/super-admin/ai-audit` page and `/api/assistant/audit/` API now cover
both agents. No second dashboard was created. They show agent labels, conversations,
prompts, messages, model settings, model/tool/batch/operation counts, reported usage,
durations, failures and ordered execution events. Conversation messages link to
their recorded execution trace. Imported incomplete captures and stored legacy
answers without original immutable answer snapshots are identified explicitly.

Both turn and conversation views support agent, user, restaurant, branch and date
filters, plus supported status/model/tool/failure filtering. A SuperAdmin-only
`agents/` endpoint supplies known/recorded agents and tool names, including future
agent types. Timeline metadata exposes no raw payloads. Detailed payload reads
remain encrypted at rest, freshly SuperAdmin-authorized, access logged and
non-cacheable. Ordinary Admin/staff requests are denied. Extra legacy model
configuration cannot leak into summary metadata through fallback handling.

## Verification

| Check | Observed result |
|---|---|
| Full Django regression suite | **506 tests: 504 passed, two known unrelated Orders failures**; 160.510 seconds |
| Both assistants | All assistant tests in the full run passed; previous combined focused run: 290 passed |
| SQLite seeded upgrade tests | Four passed in the full run: overlapping IDs/history preservation, collision abort, active-turn abort, clock skew/private legacy configuration |
| Actual isolated PostgreSQL 17 upgrades | **Four passed**, 11.876 seconds, on newly created disposable databases |
| Frontend contracts/preferences/context helpers | **11 passed** |
| ESLint | Existing SuperAdmin page and test-only UI fixture passed |
| Vite production build | Passed; existing large-chunk warnings remain |
| Django checks / migration state | `check` passes; `makemigrations --check --dry-run` reports no changes |
| Source integrity | Protected files unchanged; final implementation/tests match the LF regression export byte-for-byte |

Upgrade tests seed both old schemas, overlapping numeric IDs and preserved Mentor
encrypted data, then run the actual migrations. They verify UUIDs, original/public
IDs, FK rewiring, timestamps, ordering, content/sources, reported/partial usage,
encryption/redaction/literal markers, sequence advancement and removal of old
tables. Failure cases verify retained source history. Runtime integration tests
exercise shared models, forged agent input, identical-binding isolation, existing
API contracts, operation/provider failures, encrypted payload capture, SuperAdmin
access logs/filters, deletion retention and a future agent identifier without new
models.

The broad suite uses the established ignored LF-source export to avoid unrelated
Windows CRLF versus frozen knowledge/index byte hashes. Actual changed Python
files and tests are copied exactly; working-copy knowledge or Mentor indexes are
not rebuilt. The two baseline failures are:

- `orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
- `orders.tests.OrderRealtimeRegressionTests.test_order_creation_broadcasts_full_order_and_all_created_items`

Both compare UTC `+00:00` timestamps against Kabul `+04:30` representations of the
same instant, matching the previously reproduced baseline. They were left outside
this storage/audit refactor.

## Live DeepSeek API execution

Six scenarios succeeded through the real existing Django chat endpoints with
managed-session synthetic staff JWTs, actual orchestration/retrieval/tools,
persistence and encrypted auditing. They used **13 successful DeepSeek requests**.
The configured production restaurant database was never queried. These API checks
are distinguished from browser UI verification below and from mocked transport
tests. All eight model/thinking combinations also pass mocked HTTP-payload tests.

| Scenario | Model / tool calls | Batches / operations | Recorded duration | Reported total tokens | Outcome |
|---|---:|---:|---:|---:|---|
| Business contractor financial definitions | 2 / 1 | 1 / 5 | 9.588 s | 43,855 | Documentation-only supported answer |
| Mentor contractor invoice guide | 4 / 3 | 0 / 0 | 12.249 s | 23,884 | Search/fetch flow recovered from an unavailable section; supported answer |
| Business Contractors + Expenses | 2 / 1 | 1 / 6 | 9.935 s | 45,129 | Real summaries with separate financial meanings |
| Business January follow-up | 2 / 1 | 1 / 8 | 10.058 s | 45,963 | Fresh period data, current balances separate; four saved messages |
| Mentor follow-up | 1 / 0 | 0 / 0 | 3.462 s | 4,659 | Existing verified-evidence reuse; four saved messages |
| Business model/thinking switch | 2 / 1 | 1 / 2 | 9.646 s | 41,667 | Actual `deepseek-v4-pro`, thinking `low`, captured in shared provider/model audit |

Business Analyst model requests were checked against the complete current compact
map (78 documents, 18 tools). Provider usage reconciles with shared turn totals.
Every recorded turn matches its conversation's agent identity. Cross-agent
history/resume and cross-branch history returned **404**; the other branch list
was empty and restoring the original branch restored its conversations. The
SuperAdmin API returned the correct agent-filtered four Business Analyst/two
Mentor turns and recorded audit access. Financial record digests stayed unchanged
across all scenarios.

API-only checks brought the existing chat allowance to **84 used / 16 remaining**.
The live test harness uses disposable records; its browser bootstrap uses isolated
JWT signing keys and does not expose a DeepSeek credential to JavaScript.

## Browser verification status

Browser regression checks are not yet verified. The previous computer-use session
stopped because it could not confidently determine Chrome's current URL. A
loopback fixture is prepared to load the existing production router and chat/audit
components against the migrated synthetic backend, with real authenticated HTTP
and the counted provider. The live successes above are API-level evidence, not a
claim that actual browser interactions succeeded.

## Files changed and remaining limits

New backend files: `ai_assistant/agents.py`, `persistence.py`,
`UNIFIED_PERSISTENCE.md`, `migrations/0005_unified_agent_storage.py`,
`tests/test_unified_storage.py`, `tests/test_unified_migrations.py`, and
`business_analyst/migrations/0002_unify_persistence.py`.

Updated backend files: shared `models.py`, `service.py`, `auditing.py`,
`audit_views.py`, `model_configuration.py`, `urls.py` and README; Business Analyst
`models.py`/`auditing.py` compatibility imports, `context.py`, `service.py`,
`engine.py`, `views.py`, README and affected audit-contract tests. The only
production frontend change is the existing
`frontend/src/superAdmin/AIConversationAudit.jsx`. New frontend files under `tests/`
only bootstrap the existing interfaces for isolated regression checks; they are
not production chat features. No chat redesign was introduced.

Remaining limits: the configured application database still needs the backed-up,
maintenance-window upgrade; old incomplete audit data cannot become full historical
HTTP traces; the existing audit-retention command now governs both agents; and
browser verification remains outstanding as described above. The existing chat
APIs do not add deletion functionality in this refactor; database deletion retains
audits as verified. No additional business module/tool was started.

Detailed local evidence is in ignored `artifacts/unified-ai/`, including seeded
PostgreSQL upgrade logs, frontend build/test logs, live API results/checks,
`verify_live.py`, protected-file hashes and isolated browser fixtures. The complete
Django log is also copied there as `full-regression.log`.
