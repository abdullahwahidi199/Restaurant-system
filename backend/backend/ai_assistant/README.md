# Pakhlai documentation assistant backend

Conversations and audits now use the shared multi-agent foundation described in
[UNIFIED_PERSISTENCE.md](UNIFIED_PERSISTENCE.md). Existing Operator Mentor records
are tagged `operator_mentor`; Business Analyst records use `business_analyst` in
the same tables. The engines, permissions, knowledge and chat endpoints stay separate.

The SuperAdmin-only execution audit, privacy/retention policy, API and operating commands are documented in [AUDITING.md](AUDITING.md).

Configurable automatic fetching, conservative selection, evaluation and configuration-only rollback are documented in [RETRIEVAL.md](RETRIEVAL.md). The default retrieval mode remains `legacy`.

The assistant uses the existing [Knowledge Gateway](../knowledge/GATEWAY.md) to teach documented operation. It does not query live sales/invoices, execute SQL, perform business actions, or add a React UI. Only chat conversations/messages are persisted. HTTP responses are non-streaming.

## Components

| Component | Responsibility |
|---|---|
| `provider.py` | HTTPX DeepSeek adapter and provider-neutral `Completion`/`ToolCall` records |
| `prompts.py`, `language.py` | System rules, minimal authenticated context, language hints and controlled social/live-data/clarification messages |
| `orchestrator.py`, `evidence.py` | Bounded search/fetch loop, complete-section evidence, verified citations and follow-up source revalidation |
| `service.py`, `models.py` | Owned/scoped conversation history, bounded model context, atomic turn leases and minimal persistence |
| `views.py`, `serializers.py`, `urls.py` | Authenticated/throttled chat and history API |
| `testing.py`, `tests/` | Explicit fake providers that exercise the real engine/gateway, HTTP transport mocks and isolated API/database tests |
| `management/commands/test_ai_assistant.py` | Explicit mock or separately invoked live CLI using an existing authorized account |

HTTPX 0.28.1 was already installed and declared in project requirements; no OpenAI SDK was installed. The adapter uses the documented OpenAI-compatible REST format directly. DeepSeek-specific serialization stays inside the adapter; the orchestrator receives ordinary dataclasses and uses the existing gateway's exact function definitions/dispatcher.

## Provider configuration and deployment

Configure these **server-side** environment variables using the deployment's existing secret-management process. No key is needed to import the app, run checks, or execute mock tests. Missing credentials never enable a fake-provider fallback in the API.

```dotenv
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash
AI_ASSISTANT_PROVIDER=deepseek
AI_ASSISTANT_THROTTLE_RATE=10/min
```

`DEEPSEEK_API_KEY` is required only for live generation. The configurable base URL must be HTTPS without embedded credentials, query or fragment; it is trusted deployment configuration, never a chat/model argument. A `/v1` prefix may be included when needed; the adapter appends `/chat/completions`. The only implemented provider is DeepSeek; other provider settings fail clearly. No SDK, framework, embeddings or search server is added.

The adapter uses the shared per-turn model/thinking configuration, preserves assistant tool calls and matching tool-message IDs, and requests JSON final output. Thinking defaults to disabled; enabled modes retain required reasoning continuity only in memory and exclude private reasoning from audit storage and frontend responses. Named tool selection is used for initial search/retrieval recovery when compatible with the selected thinking mode. Supported choices and validation live in `model_configuration.py`; both agents expose those same choices.

From `Restaurant-system/backend/backend`, apply the new conversation schema and make the private documentation snapshot available:

```powershell
python manage.py migrate
python manage.py build_knowledge_index --check
python manage.py build_knowledge_index
```

The current schema is the seven-model shared foundation described in `UNIFIED_PERSISTENCE.md`; the data migration also consolidates existing Business Analyst records. Back up the database and stop writers before upgrading. Migration tests use isolated SQLite/PostgreSQL databases; the configured application database is not migrated automatically. Documentation deployment/mounting follows the existing knowledge README. The gateway/indexer algorithms and operator Markdown are unchanged.

The API uses the existing `users.authentication.SessionJWTAuthentication`, including its managed-session validity/cache policy, and existing backend cache settings. Use the existing shared cache in a multi-worker deployment for meaningful shared request throttling. A throttle-storage failure denies requests safely. HTTPX uses explicit timeouts, no automatic retries, no redirects and no implicit environment proxy configuration.

## API

All endpoints require the existing authenticated staff context and the Knowledge Gateway's current access policy. Chat input accepts only `message` and optional `conversation_id`; arbitrary role, user, branch, restaurant, language, sources or provider fields are rejected.

| Method/path | Behavior |
|---|---|
| `POST /api/assistant/chat/` | Start a conversation or append a turn and receive its final response |
| `GET /api/assistant/conversations/?page=0` | List the user's conversations in the current authorized context, 20 per page |
| `GET /api/assistant/conversations/<uuid>/messages/?page=0` | Retrieve owned/scoped history, 40 messages per page |

```json
{
  "conversation_id": null,
  "message": "How do I record a contractor payment?"
}
```

A successful response contains `conversation_id`, a backend-generated `request_id`, and `message`: `id`, `role`, `content`, `kind`, `state`, `error_code`, `sources`, `stale_sources`, `created_at`. Sources are backend-verified objects containing `document_id`, `section_id`, `document_title`, `heading`, `verification_status`, `index_version` and the full section's `content_hash`. No internal prompt, tool transcript, discovery token, credentials or reasoning field is returned. Model output is not a trusted source of titles/metadata.

Own-message history may include failed user turns, with safe error codes. Old assistant answers whose references no longer validate are replaced with an unavailable-context notice and empty source list. History queries for another owner/context return the same 404 behavior as an unavailable conversation. After branch, role, restaurant or relevant permission changes, start a new conversation; the old conversation remains visible only when its original authorized binding applies again.

Validation errors follow DRF's existing field/non-field error format. Service errors use `{error: {code, message}}`, with conversation/request IDs when a turn was already reserved. Expected statuses: 400 invalid payload, 401 authentication, 403 denied/inactive context, 404 unavailable conversation, 409 busy/context drift, 413 request size, 422 evidence/context/tool limits, 429 rate limiting, 502 invalid provider output, 503 missing configuration/storage/index/provider availability, 504 timeout. Failed generation does not create a fabricated assistant message.

## Retrieval and source enforcement

Each non-social turn starts with fresh backend authorization and a compact list of permitted module descriptions from gateway browsing. Provider context includes actual role and scope-presence flags, not account IDs, names, emails, restaurant names, branch names or phone numbers. No preferred-language model field was found; the engine uses question language and a validated request language hint. English, Dari (`fa`, explicitly described as Afghan Persian) and Pashto (`ps`) are supported as response-language hints. This is not a claim of perfect language identification/translation quality.

The state machine moves through `SEARCH_REQUIRED`, `SEARCH_COMPLETE` / `FETCH_REQUIRED`, `EVIDENCE_AVAILABLE` and `ANSWER_ALLOWED`:

1. A new factual question requires an actual gateway search. For questions up to the gateway's 512-character query bound, the engine preserves the original question and adds a model-interpreted/translated query as a smaller topic hint. Longer user messages remain intact in model context; the model supplies a bounded retrieval query. Initial browse-only calls cannot skip the ranked-search requirement.
2. Search results issue the existing signed discovery tokens. Every model tool call passes JSON/size checks and then the allowlisted gateway dispatcher. Multiple calls preserve their assistant batch, order and tool-call IDs. Malformed JSON, unknown functions, invalid/expired tokens and unauthorized requests return safe tool errors or terminate the turn when account/index context is unavailable.
3. New fetches must use discovery from this turn and currently relevant returned IDs. The gateway still verifies token identity/version and permissions. No model-selected function is executed outside those two registered tools.
4. Full section coverage and its hash are verified before the section can support a final answer. A partial page alone is insufficient; subsequent offsets must complete the section. The total number/size of sections and tool results is bounded.
5. Final model JSON must contain `kind`, `content`, and `citations`. An `answer` requires nonempty citations to complete fetched evidence. Titles/status/hashes are attached from the actual index. Unknown, guessed, unfetched or partial references are rejected. Unsupported final text is discarded and bounded retrieval/format recovery runs; it is not replayed as accepted assistant history. Discovery-token or internal orchestration material is rejected from final content.

Task 5 corrected discovery recovery: an expired/invalid/stale token clears that turn's discovery set and returns to bounded `SEARCH_REQUIRED`, allowing a fresh signed search instead of forcing repeated invalid fetches. Provider content/tool-call fields are now type-checked before null normalization. Clear current stock quantities and today's order-count requests use the documentation-only boundary, while ordinary procedural stock-screen questions remain eligible for retrieval.

Backend ambiguity handling conservatively asks which payment process is intended when a generic payment question has several permitted domains and no current conversational disambiguation. A model module hint cannot select an invoice type for the operator. Nonfactual clarification/limitation output uses controlled localized text, with permitted domain choices where applicable. An empty search gets a bounded broader attempt before an unavailable-documentation conclusion. Clear requests for actual current figures or specific live record IDs receive an explicit live-data limitation; no business-query tool exists.

Only exact short greetings/thanks/acknowledgments skip model/retrieval calls. Follow-up evidence reuse is also conservative: a short recognized follow-up must overlap the previous cited material, and its references must still match the same index, hashes, current access policy and conversation authorization binding. The engine restores these already-fetched sections from the existing index, bounded by the evidence limit. Stored source IDs alone never authorize a new arbitrary fetch. Other questions require fresh discovery.

Current tool results remain `tool` messages; revalidated historical evidence and capability descriptions are separate untrusted data messages. They never become system instructions or executable code. Source text is not stored in conversation records. Prior assistant answers with stale/unauthorized sources are withheld from model context. No raw reasoning, search token, complete tool transcript or documentation index is persisted.

Source validation establishes provenance, complete-section retrieval and current access. It cannot mathematically prove that every generated sentence follows from the citations. Real-model answer grounding, multilingual behavior and retrieval quality still need the planned evaluation/live smoke testing.

## Persistence and limits

`Conversation` belongs to its Django user and stores restaurant/branch FKs plus the gateway principal binding. `Message` stores user/final-assistant text, kind/state, safe failure code, source references and index version. Only the latest configured history window reaches the model; older stored messages are preserved. The most recent question and system rules are never silently removed. Oversized active context terminates explicitly rather than trimming critical fetched instructions.

An atomic conditional database update grants one expiring turn lease per conversation across workers. Provider calls run outside database transactions. Expired abandoned pending turns are marked failed when another turn claims the lease. Finishing verifies the same lease before storing the answer. The lease includes a conservative timeout-overrun margin; an old worker cannot overwrite a successor's turn. There is no automatic model retry, background job, conversation summarizer or new shared service.

Settings are read from `AI_ASSISTANT_LIMITS`; each listed environment override supplies its corresponding integer:

| Environment variable | Default | Bound/purpose |
|---|---:|---|
| `AI_HISTORY_MESSAGES` | 12 | Prior model-history messages; supported maximum 200 |
| `AI_INPUT_CHARACTERS` | 4000 | Most recent input; supported maximum 32,000 |
| `AI_REQUEST_BYTES` | 32768 | Chat request body bytes |
| `AI_MODEL_REQUESTS` | 6 | Requests per user turn; maximum 12 |
| `AI_TOOL_CALLS` | 12 | Total calls per turn; maximum 32 |
| `AI_FETCHED_SECTIONS` | 8 | Distinct sections per turn; maximum 20 |
| `AI_TOOL_RESULT_BYTES` | 64000 | One serialized tool result |
| `AI_TOTAL_TOOL_BYTES` | 180000 | Cumulative successful tool-result bytes |
| `AI_EVIDENCE_CHARACTERS` | 48000 | Retrieved/restored evidence characters |
| `AI_CONTEXT_BYTES` | 240000 | Serialized model message context; conservative byte budget, not a tokenizer |
| `AI_OUTPUT_TOKENS` | 1800 | Provider generation limit |
| `AI_OUTPUT_CHARACTERS` | 16000 | Accepted final text limit |
| `AI_PROVIDER_TIMEOUT` | 20 | HTTP phase timeout and response-progress deadline; maximum 120 seconds |
| `AI_TURN_SECONDS` | 90 | Turn deadline checked around requests/tools; maximum 300 seconds |
| `AI_TOOL_ARGUMENT_BYTES` | 32000 | JSON arguments per call |

HTTPX timeouts bound blocking network phases; monotonic checks bound successful response progress and orchestration rounds. A blocked transport can overrun a wall-clock deadline until its phase timeout returns. This is synchronous request handling, not cancellable hard real-time execution. Oversized/unterminated provider bodies are capped at 256,000 bytes. Thinking/streaming are not enabled. Production worker/proxy timeouts should accommodate the configured synchronous limits.

Logs record generated conversation/request IDs, provider status/duration, allowlisted tool name/status/duration, successful selected IDs, orchestration state/counts and termination reason. They omit complete chat text, retrieved content, raw authentication/discovery tokens, provider error bodies and reasoning. Chat content remains private application data in the two new tables; retention/deletion policy should follow deployment requirements.

## Test and development interface

```powershell
python manage.py test ai_assistant knowledge --verbosity 1
python manage.py test_ai_assistant --help
python manage.py test_ai_assistant --mock --user-id <existing-authorized-account-id> --question "How do I create a contractor invoice?"
```

`--mock` uses the real service, scope policy, persistence, orchestrator and gateway with a deterministic provider that visibly returns a **mock reference excerpt**, not a claim of live-model quality. The command prints question, safe tool/discovery/fetch diagnostics, final response and verified sources. It has no unrestricted fake-user, role or branch override. API tests invoke this command with an actual authorized user in their isolated test database.

The separately invoked future smoke-test path is `--live` with the same account/question arguments and an environment key. It is never selected automatically and was **not executed** during implementation. Automated tests use predetermined model calls or HTTPX `MockTransport`; no real key/network is needed. See the [execution report](../../../docs/ai_knowledge/ai_assistant_report.md) for actual commands, counts, coverage and remaining limits.

For repeatable section-level quality, security and resource evaluation, use `python manage.py evaluate_ai_assistant --all`. The [Task 5 evaluation report](../../../docs/ai_knowledge/evaluation/evaluation_report.md) links the frozen 96-question dataset, preserved baseline, final JSON, complete miss analysis and optional human live-review checklist. It distinguishes raw multilingual lexical recall from scripted orchestration and real-model answer quality.

## Live verification and safe diagnostics

Django reads its private `.env` beside `manage.py` for management commands, ASGI and WSGI; externally supplied variables take precedence. Restart the development server after `.env` changes. Never put the provider key into frontend variables or commit the private file.

The explicitly opt-in command below uses an existing account's JWT, the actual `/api/assistant/chat/` view, persistence, gateway and DeepSeek adapter. It sends static operator documentation to DeepSeek and incurs provider charges. Routine tests never invoke it. It has a total cap of ten model-call attempts, includes attempts made during tool-calling rounds, and stops rather than retrying external provider failures. Lower `--max-requests` to respect a smaller test allowance; use `--prior-requests` to include attempts already made in the same test session. Some scenarios will be marked not run when the budget is exhausted.

```powershell
& venv/Scripts/python.exe manage.py smoke_ai_assistant --live --user-id <authorized-account-id> --max-requests 10
```

The `ai_assistant` logger writes allowlisted JSON fields: request/conversation identifiers, failure stage, exception category, safe error code, provider HTTP status, tool, index status and timing/counters. It omits prompts, question/answer text, raw provider bodies, credentials and discovery/authentication tokens. `knowledge_index_failed` includes the configured index path and numeric OS errors for deployment diagnosis. Client errors remain concise; stack traces are never placed in chat responses.

Ordinary greetings, including ?hello how are you?, retain the local conversational response and require neither index reads nor provider calls. Greetings prefixed to a factual question still require search/fetch. ?What fields are required?? can reuse the immediately previous complete, authorized, hash-validated evidence; otherwise normal retrieval applies.

See the [real integration repair report](../../../docs/ai_knowledge/ai_chat_503_integration_report.md) for the Windows permission root cause, live HTTP/browser results and remaining test-budget limits.

## Post-fetch finalization and diagnostics

A complete, relevant fetch makes a normal final JSON answer immediately eligible for citation validation. Tool choice remains `auto` at this point, so additional searches are possible when more support is needed; a successful fetch does not force another tool call. The prompt's answer example uses the valid value `"kind":"answer"`, with the other permitted kind values listed separately.

Fetch results also expose `complete_citation_candidates`: exact document IDs paired with short final citation references such as `evidence_1`. These resolve only to complete evidence already fetched in this turn (or revalidated from history). The backend verifies the paired document and the original section/hash before returning normal source metadata; invented references, mismatched documents and partial evidence still fail. Full exact fetched IDs remain valid for compatibility. Final JSON/schema and citation failures have distinct safe reason codes. A repair prompt names the failed rule and lists only complete, already authorized citation candidates. It replaces the previous repair prompt, never includes rejected text, and does not order another search when complete evidence is available. The backend never manufactures citations or accepts unsupported output. Repeating the same validation failure with unchanged discovery/evidence state returns `answer_repair_stalled` (HTTP 422); genuinely progressing retrieval still has the unchanged configured model/tool limits and `orchestration_limit` handling.

Within an orchestrated turn, the model receives short `search_token` handles such as `discovery_1`. Signed discovery tokens stay backend-side. A fetch handle must resolve in this turn, and the original gateway still checks the corresponding signature, expiry, principal, index version and selected section authorization. Expiry/invalid discovery clears active mappings and requires a fresh search. Direct Knowledge Gateway callers retain its signed-token contract.

Each `assistant_model_call` event includes the request ID, ordinal, state before/after, tool choice, finish reason, number of tool calls, assistant content length, transmitted context byte count, complete evidence count, decision and exact safe decision reason. Tool-error continuations include the gateway error code. Unusable provider completions retain safe shape metadata, including empty content, without logging response bodies or private reasoning. Turn metrics include provider, context, search, fetch and validation durations. Logs never include credentials, auth/discovery tokens, prompts, rejected text or reasoning content.

The [orchestration investigation report](../../../docs/ai_knowledge/ai_orchestration_loop_report.md) distinguishes the historical incident, live replay results and repeatable offline before/after measurements.
