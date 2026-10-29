# AI execution audit: security and operating policy

The read-only viewer is **SuperAdmin → AI Conversation Audit**, at `/super-admin/ai-audit`. Recording starts for newly accepted chat turns; existing conversations are not backfilled with guessed traces. No external provider call is needed to enable, migrate or test this feature.

## Authorization policy

The project's authoritative global SuperAdmin permission is `users.permissions.IsSuperAdmin`, based on an authenticated Django `is_superuser`. Existing restaurant administration and business-audit code already gives this identity global scope. This feature adopts that same global scope explicitly: an active, currently authorized global SuperAdmin can inspect AI turns across restaurants and branches for operational/security investigation.

`is_staff`, a staff role string of `SuperAdmin`, restaurant Admin/BranchAdmin, Manager, FinanceManager, OperationsManager, Cashier, Waiter and delegated business permissions do not grant audit access. The API checks permissions before record lookup and also gates querysets with a fresh database superuser/active check. Ordinary users cannot inspect even their own execution traces. Their existing scoped chat/history endpoints are unchanged.

Only GET/HEAD/OPTIONS audit routes exist. There is no audit edit/delete/export endpoint and no Django-admin registration of payload models. Sensitive detail reads must first append an access record with actor ID, record/sequence, access type and timestamp. Actor IDs survive account deletion. Access recording is not recursively audited. API responses use `Cache-Control: no-store, private` and `X-Robots-Tag: noindex, nofollow`; the existing frontend SEO rule already excludes `/super-admin*`.

## Capture and historical accuracy

`TurnAudit` links the actual request UUID, persisted user/assistant messages and conversation; it retains a snapshot conversation identifier and encrypted original prompt/context identity in case source rows are later deleted. `AuditEvent` has a transactional per-turn sequence, enforced unique in the database. Timestamps alone do not determine order. Events are append-only through the application model.

The actual DeepSeek JSON payload is captured inside `DeepSeekProvider`, after construction and immediately before transport, without HTTP headers. Structured response capture occurs before completion validation, so observable invalid final responses and function-call requests remain inspectable. A strict response allowlist excludes optional/private reasoning. HTTP errors retain safe status/category/code rather than arbitrary provider error bodies. No chain-of-thought is reconstructed or retained.

Explicit test/custom providers without HTTP serialization have a separately labelled `provider_contract` boundary. These records show the actual contract arguments and normalized completion; they do not pretend to be captured DeepSeek wire traffic. Configuration failure before transport is marked `transmitted=false`.

The timeline records backend capability-map browsing, prepared ordered messages, revalidated evidence reuse, individual model requests/responses/decisions, each tool call, effective gateway arguments/raw result, the exact result sent back to the model, generated answer, final persistence and termination/error. Backend capability browsing is marked `model_requested=false`; it is not counted as a model-dispatched search. Multiple calls in a single response retain their call IDs and actual dispatch order. Greetings record their real local path without manufactured provider/tool events.

Fetch/tool-result/model-context content is snapshotted after security redaction into encrypted content-addressed blobs. Large repeated strings share immutable text blobs. `AuditBlobReference` supplies real protective foreign keys for those shared strings, including during retention/concurrent writes. This support table is not an additional event category. No audit read opens a Markdown path or consults today's knowledge index. Original source version/hash/range/partial metadata is preserved; the payload integrity hash describes the redacted snapshot, while source hashes describe the original indexed source.

Follow-up events record actual reused sections, permission/index revalidation and the original recorded retrieval request where available. A pre-audit retrieval has unknown origin rather than a fabricated trace. Later follow-ups carry that original provenance forward. A historical original trace may expire under retention while its recorded identifier remains in a newer trace.

## Redaction, encryption and backups

Payloads are separate from ordinary diagnostic logs. Redaction runs before content addressing and encryption. It removes configured application/database/audit keys; credential/authorization/session/discovery fields; common Bearer/JWT/signed-token/key formats; and private reasoning fields. Nested JSON strings in model messages and tool arguments are inspected. Tool schema declarations remain visible without retaining actual token values. Observable conversation and operator-documentation text is intentionally retained subject to this policy, with redaction markers wherever security filtering changes it.

Fernet authenticated encryption uses the project's existing `cryptography` dependency. By default, audit-specific encryption keys are derived from Django's signing secret and fallback secrets using a separate domain. A dedicated high-entropy key list can be supplied using server-side `AI_AUDIT_ENCRYPTION_KEYS` (comma-separated, newest first). Never place these keys in frontend variables, audit records or Git. Retain old encryption keys for as long as retained snapshots/backups require them; rotation does not automatically re-encrypt historical blobs. Loss of the appropriate key produces a safe unavailable-payload response, not substituted evidence.

Audit payload encryption protects database/backup copies without their separate application secrets. Apply deployment database least-privilege, TLS, filesystem/database-volume encryption and protected backup/key access as usual; this code does not alter infrastructure accounts or claim to configure production backup security. Structured turn/event metadata such as IDs, model, status and timings remains queryable. The audit API serializes only explicit user identity fields, never broad user/password/session serializers.

## Failure and interruption policy

Auditing is mandatory for accepted turns; there is no client-controlled bypass. If initial audit creation fails, the conversation reservation is rolled back and no model operation starts. An audit-write failure during processing stops the turn with safe HTTP 503 `audit_unavailable`; it is not treated as a recoverable tool error. Final message persistence and final audit completion share a short transaction, so audit failure cannot silently publish an unaudited final answer. Already committed earlier events remain available. The chat view opts out of `ATOMIC_REQUESTS` so a deployment-wide request transaction cannot roll back the entire timeline on a later failure. Network operations remain outside database transactions.

Gracefully observed interruption records an interrupted turn. A hard-killed process cannot invent a response or exact finish time. On the next reservation in that conversation, or through the maintenance command, absent/expired/superseded leases are recorded as observed interruptions. The event explicitly marks the interruption time unknown; the timestamp is detection time and duration remains unavailable. Processing traces can remain pending until that recovery runs.

Malformed/unauthenticated/unpermitted HTTP requests rejected before a chat message is accepted are not AI executions and do not create fake conversations. Existing authentication/throttle handling remains responsible for those rejections. A missing index, provider configuration failure and all later failures do create failed traces for accepted turns.

## Retention and bounds

The explicit default policy is **90 days for completed/failed/interrupted AI traces and payloads**, and **365 days for audit-access metadata**. Configure `AI_AUDIT_RETENTION_DAYS` and `AI_AUDIT_ACCESS_RETENTION_DAYS` between 1 and 3650. Existing chat messages retain the application's existing lifecycle; trace retention never deletes them. Active processing turns are reconciled before expiry is reconsidered.

From `backend/backend`, after installing the existing requirements:

```powershell
& venv/Scripts/python.exe manage.py migrate ai_assistant
& venv/Scripts/python.exe manage.py maintain_ai_audits
& venv/Scripts/python.exe manage.py maintain_ai_audits --execute
```

The command defaults to a read-only dry run. Schedule the explicit `--execute` form with the deployment's existing scheduler (for example nightly); this feature installs no service or background worker. It reconciles abandoned leases, deletes expired terminal audit records/access entries, then collects old unreferenced payload roots and orphan shared strings. Protected FK references and a one-day grace prevent deletion of retained/newly committed evidence. Concurrently referenced blobs are retained for a later run. Retention is deliberate and documented, not silent overwriting.

Event payloads are bounded at 1,000,000 redacted JSON bytes. Exceeding the bound fails recording explicitly instead of presenting a silently truncated request as complete. Existing model/context/tool limits remain unchanged. API pagination defaults to 20 and caps at 50; event payloads are loaded separately on demand. Legacy conversation messages are paginated and explicitly labelled trace unavailable.

## Metrics and API

Durations use monotonic `perf_counter` intervals and separate wall-clock display timestamps. Tool results expose actual gateway duration and dispatch/audit overhead separately. Model-operation durations include adapter/recording boundary overhead, not just remote compute time. Persistence is separately measured. Browser typewriter/rendering time is not part of backend duration.

Only observed provider usage is aggregated: prompt/completion/total and available cache hit/miss counters. Omitted metrics remain missing, and partial usage is labelled; failed/unobserved responses are not assigned invented token counts. Turn and conversation aggregates use recorded data. Monetary cost is unavailable because no verified pricing configuration exists.

All routes require the global SuperAdmin permission:

| GET route under `/api/assistant/audit/` | Result |
|---|---|
| `turns/` | Paginated summaries and filters |
| `turns/<request_uuid>/` | Prompt, generated answer, metrics and provenance |
| `turns/<request_uuid>/events/` | Paginated ordered event metadata |
| `turns/<request_uuid>/events/<sequence>/` | Access-logged full redacted payload |
| `conversations/` | Existing conversations and trace-availability labels |
| `conversations/<uuid>/messages/` | Stored messages with per-message trace availability |

Turn filters: `start_date`, `end_date`, `user`, `restaurant`, `branch`, `conversation`, `status`, `model`, `tool`, `error_category`, `error_code`. IDs, dates and enumerations are validated. Payloads are text/JSON or rendered through the existing safe Markdown component; no HTML execution or arbitrary document/filesystem lookup is enabled.

## Verification and deployment boundaries

Run `manage.py test ai_assistant knowledge` and the frontend's `npm.cmd run test:ai-audit`, `npm.cmd run test:ai`, `npm.cmd test`, and `npm.cmd run build`. All routine checks use mocked providers and require no DeepSeek key/credits. The development database in this repository is SQLite; these ORM migrations/types also target PostgreSQL, but PostgreSQL execution was not available in this environment and is not claimed as tested.
