# AI assistant backend execution report

Completed verification on 2026-10-29, Asia/Kabul. The backend now provides an authenticated, non-streaming documentation assistant with a DeepSeek-compatible adapter, secure retrieval orchestration and scoped conversation persistence. All assistant/provider tests used mocks; **no live DeepSeek call or real API key was used**.

## Changes

Created the `backend/backend/ai_assistant/` Django app:

| Files | Purpose |
|---|---|
| `apps.py`, `__init__.py` | App registration without startup indexing/provider calls |
| `config.py`, `errors.py` | Configurable bounded limits and safe service errors |
| `provider.py` | HTTPX DeepSeek transport, normalized completions/tool calls, status/timeout/body validation |
| `prompts.py`, `language.py` | Documentation-only system instructions, minimized user context, English/Dari/Pashto language hints and safe conversational boundaries |
| `orchestrator.py`, `evidence.py` | Retrieval state machine, tool ordering, complete-section/hash checks, citation verification and authorized prior-evidence reuse |
| `models.py`, `migrations/0001_initial.py` | Two chat-only models: `Conversation`, `Message`; indexes and per-turn uniqueness |
| `service.py` | Scoped ownership, bounded history, expiring atomic turn leases and final-message persistence |
| `serializers.py`, `views.py`, `urls.py` | Strict chat payload validation, existing JWT authentication, throttling, chat/list/history endpoints |
| `testing.py` | Scripted fake provider and explicitly marked mock excerpt provider |
| `management/commands/test_ai_assistant.py` | Real service/gateway CLI with explicit `--mock` or separately selected `--live`, authorized account, diagnostics and limits |
| `tests/helpers.py`, `tests/test_engine.py`, `tests/test_provider.py`, `tests/test_api.py` | Actual-index engine tests, HTTP transport mocks, isolated database/API/CLI/JWT tests |
| Package initializer files, `README.md` | Discovery and developer instructions |

Also created this report. Modified only `backend/settings.py` for app registration/server-side configuration and `backend/urls.py` to add `/api/assistant/`. No restaurant business implementation, existing API handler, frontend, Knowledge Gateway, indexer, retrieval algorithm or operator Markdown was changed. No new package dependency was required.

## Architecture and provider compatibility

The project had no suitable chat/conversation models. The two new models retain user/final-assistant text and minimal source metadata; they do not store complete indexes, fetched source bodies, raw reasoning, discovery tokens or complete tool traces. Conversations belong to a Django user and retain restaurant/branch plus the gateway authorization binding. History/list operations require the same owner and current binding. Role/branch/restaurant/relevant permission drift hides the old conversation in the new context. Source drift redacts stale assistant history and withholds it from model context.

A conditional database update claims an expiring conversation turn across workers. Provider requests run outside DB transactions. The finishing worker must still own the lease. Failed user turns remain marked failed; no fabricated assistant answer is persisted. Context truncation removes only older stored history, while the current question and system rules remain mandatory. Excess active context/evidence fails explicitly.

Installed dependencies were checked: Django 5.2, DRF 3.16.0 and HTTPX 0.28.1 were available; OpenAI SDK was not installed. The adapter uses existing HTTPX and the REST Chat Completions format. Official documentation was inspected for [Tool Calls](https://api-docs.deepseek.com/guides/tool_calls/), [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/) and [Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/). It explicitly disables thinking, uses named/automatic tool selection, requests final JSON, and preserves assistant calls plus matching tool-result IDs. No beta strict schema mode is enabled. Unexpected reasoning output is rejected rather than persisted or exposed. Actual live service acceptance/answer quality has not been tested.

The provider adapter is separate from orchestration and storage. The orchestrator consumes ordinary completion/tool-call records, uses the existing gateway definitions, and dispatches only `search_documentation`/`fetch_documentation`. Malformed JSON, unknown functions and unsafe selections cannot execute arbitrary Python, SQL or business operations. Multiple calls in a model response preserve batch order and identifiers. Provider authentication, rate, timeout, invalid response and service failures produce safe errors without automatic request retries or echoed provider bodies. Credential echoes from provider content/arguments are rejected.

## Grounding and access enforcement

New factual questions require a real search and complete, relevant fetched evidence before an `answer` can be accepted. Original short questions remain in retrieval queries; model interpretation/translation supplies additional bounded topics. Search summaries/capability descriptions are discovery context, not evidence. New fetches need this turn's actual signed discovery tokens and relevant discovered IDs; the unchanged gateway independently checks current authorization, tokens and index version.

Evidence paging verifies full coverage and the source hash. Guessed IDs, uncited/unfetched sections, incomplete pages and unsupported proposed finals are rejected. Unsupported text is not replayed as accepted assistant history. Final source titles/headings/status/hashes come from the real index. Valid references are checked again before persistence. Generic payment questions with several permitted domains receive a backend-controlled clarification; model module hints do not select the domain for the user.

Greetings/thanks/simple acknowledgments have controlled replies. Clear live figures/record requests receive a documentation-only limitation. Short follow-ups may reuse the most recent cited material only when lexical relevance, scope, index version, source hash and current document policy all still apply. Rehydration uses trusted server-stored references to already-fetched sections, not user/model-supplied source claims. Other factual questions retrieve again.

Current tool content remains untrusted tool data; restored historical evidence and capability descriptions are separate untrusted reference messages. They are not privileged system instructions. The model receives role/scope flags and a language hint, not account IDs, staff names, phone numbers, restaurant names or branch names. The API has no model/provider/role/branch override or mock-mode parameter. Existing session authentication and its revocation-cache policy remain authoritative.

## API and configuration

- `POST /api/assistant/chat/`: `message` plus optional `conversation_id`; returns final message and verified source metadata.
- `GET /api/assistant/conversations/`: owned conversations in the current scope, 20 per page.
- `GET /api/assistant/conversations/<uuid>/messages/`: owned/scoped history, 40 per page, with stale-source redaction.

The default limits are 4,000 input characters, 32,768 request bytes, 12 prior messages, 6 model requests, 12 tool calls, 8 fetched sections, 48,000 evidence characters, 64,000 bytes per tool result, 180,000 cumulative tool bytes, 240,000 context bytes, 1,800 output tokens, 16,000 final characters, 20-second provider phase timeout/progress deadline and a 90-second checked turn deadline. The default API throttle is 10 requests/minute per authenticated user. Configuration names and supported bounds are in the [developer guide](../../backend/backend/ai_assistant/README.md).

For future live use:

```dotenv
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash
AI_ASSISTANT_PROVIDER=deepseek
AI_ASSISTANT_THROTTLE_RATE=10/min
```

Supply the real key through server environment/secret management, never React or chat payloads. Missing credentials fail with `provider_not_configured`; the app still starts and mock tests still run. Apply `python manage.py migrate ai_assistant` before using conversation endpoints, and make the private generated knowledge snapshot available as documented. The migration was created and applied only in isolated test databases during this task; it was **not applied to the workspace/live database**.

## Actual verification

Selected actual commands from `Restaurant-system/backend/backend`:

```powershell
& venv/Scripts/python.exe manage.py makemigrations ai_assistant --noinput
& venv/Scripts/python.exe manage.py test ai_assistant.tests.test_engine --verbosity 2
& venv/Scripts/python.exe manage.py test ai_assistant.tests.test_provider ai_assistant.tests.test_api --verbosity 2
& venv/Scripts/python.exe manage.py test ai_assistant --verbosity 1
& venv/Scripts/python.exe manage.py test ai_assistant knowledge --verbosity 1
& venv/Scripts/python.exe manage.py test --verbosity 1
& venv/Scripts/python.exe manage.py makemigrations ai_assistant --check --dry-run
& venv/Scripts/python.exe manage.py test_ai_assistant --help
& venv/Scripts/python.exe manage.py build_knowledge_index --check
```

`git diff --check` passed from the repository root. A local Python verification compared every indexed source's raw-byte hash to the current Markdown: **all 328 operator files are unchanged**. The existing index still contains 328 documents, 3,467 sections and 22 capability modules, with zero errors, zero exclusions and the existing 132 warnings. Check mode wrote no index files.

Final focused suite: **116 tests passed, no skips** (18.754 seconds): 50 assistant tests plus the existing 66 knowledge tests. System checks reported **no issues (0 silenced)**. Assistant tests exercised migrations and actual Django account/restaurant/branch relations in a temporary test database; HTTPX provider responses used `MockTransport`. The mock CLI was also exercised through `call_command` with an actual authorized synthetic account in that test database and the real service/orchestrator/gateway. A final focused CLI regression verified its limits display.

Coverage includes the requested A–M scenarios: grounded invoice creation, multi-section workflow, ambiguous payment clarification, absent feature limitation, malformed tool JSON, early fetch rejection, loop limits, unauthorized documentation, conversation continuation/reuse, live-data refusal, provider timeout/rate errors, multiple ordered calls and missing API key. Additional cases cover source forgery, partial-page rejection, changing authorization during generation, stale/missing indexes, token/internal-material echo rejection, context/evidence/tool-size bounds, Unicode/language hints, owned history pagination, wrong owner/branch/restaurant/role, revoked real managed sessions, throttling, failed-message state, expired turn leases, safe logs and unsupported configuration.

The **full backend run executed 260 tests: 258 passed and 2 existing order realtime tests failed**:

- `orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots`
- `orders.tests.OrderRealtimeRegressionTests.test_order_creation_broadcasts_full_order_and_all_created_items`

Both compare equivalent timestamps represented as UTC `+00:00` versus Asia/Kabul `+04:30` strings. They were independently rerun in an isolated process with the new assistant app removed from `INSTALLED_APPS` and the original HEAD URL configuration loaded in memory. **Both failures reproduced with the assistant disabled** (2 tests, 1.861 seconds). No order/realtime code or tests were changed to make this unrelated regression run pass. The existing suite also emitted its expected Redis-unavailable simulation/authentication and signal diagnostics.

## Remaining limits

- Live DeepSeek compatibility, model answer quality and multilingual fluency remain unverified because live requests were prohibited and no real key was available. The wire format was checked against official docs and exercised with mocked HTTP responses through the real adapter and engine.
- Verified source provenance/completeness does not prove semantic entailment of every generated sentence. The planned retrieval/grounding evaluation still matters. Language detection and generic payment/live-record boundaries are deliberately small conservative rules, not complete intent classifiers or cross-language retrieval guarantees.
- The Knowledge Gateway's existing conservative technical-document/custom-role restrictions remain in force. Existing source/runtime ambiguities were not resolved by this assistant task.
- Synchronous HTTP phase timeouts may return after a wall-clock deadline; progress/deadline checks and conservative lease margins bound recovery, but this is not a hard-cancellable background execution system. Production worker/proxy settings should accommodate the documented limits.
- Production migrations, documentation mounts, outbound HTTPS, shared throttle cache, signing configuration, real-account deployment and retention requirements need normal deployment validation. No production/live database migration or paid smoke test was performed.
- The two reproduced order timestamp regression failures remain outside this task's business-logic scope.

No React chat UI, streaming interface, embeddings, live business-data tools, automatic business actions, charts or AI dashboards were implemented.
