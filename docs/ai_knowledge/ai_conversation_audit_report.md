# SuperAdmin AI conversation audit implementation

Implemented 2026-10-29, Asia/Kabul. Open **SuperAdmin → AI Conversation Audit**, or `/super-admin/ai-audit` after signing in with the actual global SuperAdmin account.

## Delivered

- Persistent turn lifecycle linked to the existing request UUID, conversation and actual message records.
- Transactionally ordered events for local greetings, capability context, model requests/responses/decisions, multi-tool dispatch, ranked search results, fetched source snapshots, evidence reuse, persistence and errors/interruption.
- Actual DeepSeek JSON request capture at the adapter boundary, with ordered messages/tool definitions/generation parameters, and observable structured response capture before final validation. Private reasoning and credentials are excluded.
- Encrypted immutable payload/evidence snapshots with content-addressed deduplication. Historical reads never load today's Markdown/index or an AI-supplied path.
- Global SuperAdmin-only read API, fresh backend authorization and queryset gates. Ordinary Admin/BranchAdmin/Manager/FinanceManager/Cashier/Waiter and staff-only or role-label-only accounts are denied.
- Server-side filters/pagination, turn summaries, conversation totals, access-logged expandable event payloads and a responsive vertical timeline. Existing conversations show stored messages with execution trace unavailable.
- Recorded model/tool counts, monotonic timing, real usage/cache counters when supplied, missing/partial usage labels and unavailable monetary cost.
- Explicit encryption/key rotation, redaction, mandatory audit failure handling, interruption recovery and configurable retention.

## Storage and authorization choices

Five small models live in the existing assistant app: `TurnAudit`, `AuditEvent`, encrypted shared `AuditBlob`, its protective `AuditBlobReference` link, and `AuditAccess`. The reference link exists to protect deduplicated text during concurrent retention/writes; it is not a table per event category. Original user/answer snapshots retain accurate redacted content even if underlying rows or docs change. Runtime state is updated on the turn; event and payload application models are immutable.

Existing `IsSuperAdmin` is authoritative (`is_superuser`, not `is_staff` or a staff role string). This task explicitly adopts the project's existing global SuperAdmin scope across restaurants/branches. Other users' normal own-conversation history remains unchanged. No broad existing user serializer or permission grant was reused.

All payloads are redacted then encrypted using the existing cryptography package. Large repeated text is shared. Optional dedicated audit secrets are supported; otherwise separately derived Django secret/fallback keys are used. No `.env`, provider credential, business model or AI request-limit change was required. Payloads never enter ordinary logs. Access reads are separately recorded without recursive payload auditing.

The retention policy defaults to 90 days for terminal traces and 365 for access records, with a separate one-day unreferenced-blob grace. `maintain_ai_audits` is dry-run by default; `--execute` is the explicit scheduler/administrative action. Chat messages are never deleted by audit retention. Abandoned leases are marked as observed interruptions without manufacturing missing responses or exact finish durations.

Audit writes fail closed: a reservation rolls back before unrecorded processing, a mid-turn storage failure stops the turn, and final answer/audit completion share a short transaction. Earlier events remain committed. The chat view is non-atomic at the request level so a deployment-wide `ATOMIC_REQUESTS` setting cannot erase an otherwise recorded failed timeline.

## Files

Backend (`backend/backend/`):

- `ai_assistant/models.py`, migrations `0002`–`0004`.
- New `ai_assistant/auditing.py`, `audit_payloads.py`, `audit_views.py`.
- Hooks in `ai_assistant/service.py`, `orchestrator.py`, `provider.py`; cache usage parsing and short transaction boundaries remain within the existing design.
- `ai_assistant/views.py`, `urls.py`, `backend/settings.py`.
- New `ai_assistant/management/commands/maintain_ai_audits.py` and `tests/test_auditing.py`.
- `ai_assistant/AUDITING.md` and README link.

Frontend (`frontend/`):

- New `src/superAdmin/AIConversationAudit.jsx` and scoped `ai-audit.css` typography.
- Protected route in `src/App.jsx` and link in `src/superAdmin/SuperAdminMain.jsx`.
- New `scripts/ai-audit.test.mjs`, `tests/ai-audit.html`, `tests/ai-audit-harness.jsx`; `test:ai-audit` package script.

No ranking, Knowledge Gateway policy, RAG architecture, chat design/typewriter, business data or streaming implementation was replaced.

## Actual validation

- Additive migrations `0002`–`0004` applied successfully to the configured development database. `makemigrations --check --dry-run` reports no pending model changes; Django checks are clean.
- **173 backend tests passed**: existing assistant/knowledge coverage plus sixteen audit tests. New coverage includes greetings; normalized and actual HTTPX adapter boundaries; search/fetch ordering, multi-tool/multi-search/multi-fetch; original evidence provenance across follow-ups; exact historical snapshots; usage/cache aggregation; timeout/index/malformed/unauthorized/limit failures; graceful interruption and abandoned leases; audit storage failure; encryption/dedup/key rotation/immutable references; all role denials; fresh revocation; read-only methods; pagination/filters/legacy data; access logging and explicit retention.
- **8 audit browser checks passed** (parent plus seven scenarios): server filtering/pagination, ordered context/timeline, expandable ranks/evidence, XSS/remote-image suppression, mobile/desktop fit, legacy disclosure, failure/denial handling and ordinary-role route denial. The fixture uses the real application Tailwind stylesheet. Screenshots are local in `artifacts/ai-chat/audit-desktop.png` and `audit-mobile.png`.
- **35 existing chat browser checks passed**, including history, animations, errors, identity/context changes and the real app route.
- **44 frontend unit tests passed**; targeted frontend lint and production build passed. The existing bundle-size advisory remains.
- A real JWT-authenticated greeting through the chat view returned **200**, persisted a completed audit with five genuine events and **zero model calls**. SuperAdmin detail/timeline returned **200** and an ordinary Admin audit read returned **403**.
- Actual socket HTTP checks against the normal server on port 8000 returned **200** for SuperAdmin detail/timeline, **403** for ordinary Admin, and `Cache-Control: no-store, private`. The runtime record queried had 21 recorded events and three model calls; no new provider request was initiated by those reads. A further full model-request event read returned 200 with `capture_boundary=deepseek_http`, three ordered initial messages, and no provider key in the response.
- The retention command's actual development run was a dry run and reported zero expired records. Destructive retention behavior was tested only in the isolated test database.

No paid DeepSeek request was initiated for this task; routine providers and browser HTTP traffic were mocked. The workspace's real provider key was preserved and was not printed or copied into artifacts/frontend/Git.

## Deployment notes

The task referred to an existing PostgreSQL database, but actual Django settings use SQLite in this workspace. The new models/migrations use portable Django ORM/JSON/foreign-key types; PostgreSQL-specific execution has not been tested here. Apply the migrations in the actual deployment before enabling traffic to the new code, retain the required encryption keys, and schedule the explicit maintenance command using the existing deployment scheduler. Database/volume/backup access controls remain deployment responsibilities; application payload encryption is implemented.

See [the operating and security policy](../../backend/backend/ai_assistant/AUDITING.md) for endpoints, filter names, retention/key settings, historical limitations and failure behavior.
