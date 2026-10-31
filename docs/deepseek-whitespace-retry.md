# DeepSeek whitespace response retry

The shared `DeepSeekProvider` now retries a single generation at most once when an otherwise valid HTTP 200 Chat Completions response has `finish_reason="stop"`, a nonempty string containing only whitespace, and no tool calls. The response remains invalid: `parse_completion` still raises `provider_invalid_response`, with an internal `whitespace_only` classification. The adapter catches only that classification for its one retry.

Empty/missing content, malformed envelopes or tool calls, unexpected reasoning, oversized responses, truncation, authentication/rate-limit/network errors, and other invalid responses retain their existing failure behavior. A valid tool call may have blank content and succeeds without retrying.

The retry sends the identical payload: messages (including already retrieved tool results), model, thinking mode, reasoning effort, tool definitions/choice, JSON format and output limit. It does not append the whitespace response to history, rerun orchestration, execute tools again, or create another persisted chat message. Both attempts share the original provider-call timeout, which is already limited by the remaining turn time. Exhaustion raises the existing safe error and HTTP 502. Ordinary successful generations still make one HTTP request. Both Business Analyst and Operator Mentor use this shared boundary.

## Centralized audit

Each HTTP attempt gets its own existing `model_request` and `model_response` events, with the same logical `model_ordinal` and a `provider_attempt` of 1 or 2 in their payloads. Responses preserve the existing redacted response/usage snapshot and per-attempt duration. A `provider_attempt_finished` event records success/failure, safe error code/category, response condition, validation shape summary, duration and whether a retry was scheduled. Attempt events contain no private reasoning or credentials.

Turn-level `model_calls`, `completed_model_calls`, and reported token usage include both physical provider attempts, including rejected whitespace output. Logical orchestration request counts still refer to generation steps; they do not restart when an adapter retries. Tool/batch counts stay unchanged. Existing audit immutability and encryption apply; no schema migration is needed.

## Investigation of request configuration

The recorded failed request `ca0561ec-60ed-4e78-9784-98340084a923` belonged to SanaullahAdmin / Business Analyst / Afiyat Main Branch. Its first generation retrieved six documentation pages successfully. The second returned 3,176 whitespace characters, no tool calls, `finish_reason="stop"`, and 606 completion tokens. The preceding failed request returned 284 whitespace characters.

The captured wire configuration was:

- `model="deepseek-flash"`, thinking disabled, no reasoning-effort override on the wire.
- `response_format={"type":"json_object"}`, `tool_choice="auto"`, `stream=false`.
- `max_tokens=2400`; no explicit `stop` sequences.
- System instructions explicitly request JSON and include the required example object. The second request includes the previously retrieved documentation as a tool result.

DeepSeek's official [JSON Output documentation](https://api-docs.deepseek.com/guides/json_mode/) describes replacing non-JSON output with spaces, potentially returning whitespace with a `stop` finish reason, and recommends handling blank content with retry. This is consistent with the observed symptom; the stored response does not establish why the model produced unrecognizable output. There is no evidence here of a missing JSON instruction, a custom stop sequence, or token-limit truncation. Both agents already have JSON instructions/examples. No model, prompt, formatting, token-limit or stop configuration was changed on that basis.

## Verification

Only HTTP transport is mocked in integration tests; the real adapter, orchestration, tools, persistence and audit code run against Django's test database. Tests cover recovery, exhaustion, unchanged wire payload and reasoning/model selection, remaining timeout, unaffected validation, normal answers/tool calls, complete attempt usage/durations, one execution of an already completed tool, one persisted user/assistant pair after recovery, and a single failed user message with no assistant message after exhaustion. Operator Mentor is tested after search/fetch to ensure its evidence and execution counts are preserved too.

Relevant test modules:

```powershell
python manage.py test ai_assistant.tests.test_provider ai_assistant.tests.test_auditing ai_assistant.tests.test_model_selection business_analyst.tests.test_provider_retry --noinput
```

The local published Mentor index was stale before this change. For verification an isolated current index was built at `E:\pakhlai\retry-test-knowledge-index` and selected through a process-local `KNOWLEDGE_INDEX_ROOT` override. The application's published index and configuration were left untouched. The final test harness also disables live credentials, uses a separate in-memory cache and temporary media directory, and raises only the test process's Analyst throttle limit. This isolates existing tests that otherwise inherit local credentials or accumulate requests against shared throttling state.

Final verification: **79 selected tests passed**, covering the modules above plus shared agent storage, Analyst HTTP API and chat integration. Django system checks, Python compilation and `git diff --check` also passed. This uses mocked HTTP; it does not assert that the live provider will always recover after one retry.

Exact local command from `backend/backend`:

```powershell
E:\pakhlai\.venv\Scripts\python.exe manage.py shell -c "exec(open('E:/pakhlai/run_retry_regression_checks.py', encoding='utf-8').read())"
```

Test output: `E:\pakhlai\retry_all_checks.txt`. The helper and output are local verification artifacts outside the repository, not application runtime code. No production conversation writes are required by verification.
