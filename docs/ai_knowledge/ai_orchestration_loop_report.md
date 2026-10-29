# Post-fetch orchestration investigation

2026-10-29, Asia/Kabul. Investigated request `af1406b1-4591-434d-a340-6c1e0fceaec1` and repaired the repeat-without-progress finalization path. Grounding, source completeness, discovery authorization and the configured six-model-call limit remain enforced.

## Evidence and limits of the historical diagnosis

The database contains the observed failed user turn with `error_code=orchestration_limit`. Its question was a general request for information about the system. The reported six successful model requests, one successful search/fetch and approximately 32-second duration are consistent with the existing loop consuming its remaining rounds after final-response rejections. Failed tool calls are another possible continuation path; their historical details were not retained either.

**The original four response bodies and rejection reasons were not recorded. Their exact JSON/schema/citation failure cannot be reconstructed from the saved message.** This investigation does not claim that a particular original answer was valid, or that a particular field caused the incident.

A separately approved final three-call HTTP check reproduced a post-fetch rejection under request `59cf611d-c2b9-4b06-acbf-19757077e53a`: the model returned a nonempty final JSON response (`finish_reason=stop`, 2,608 characters, no tool calls) with a citation that was not eligible as complete fetched evidence. The recorded rejection was `citation_not_complete_or_fetched`, while two complete evidence sections existed. Citation validation was correctly refusing that response. The three-call test cap then blocked a fourth transport request. This confirms the failure category for the new replay; it does not recover the original incident's missing citation values.

Code inspection established:

- The provider adapter performs one HTTP request per `complete()` call, with no automatic transport retry.
- After a complete fetch, `force_fetch` is false and `tool_choice` is `auto`. There is no forced-search/fetch defect at `EVIDENCE_AVAILABLE`.
- A valid final answer with verified complete citations returns immediately. Live replay and regressions demonstrate this.
- Every rejected final answer previously received the same generic “Search first, fetch … output … JSON” prompt. The reason was not logged. This happened even when complete evidence already existed.
- Rejections were appended as additional system messages and could consume all remaining calls without meaningful progress.
- The example `"kind":"answer|clarification|limitation"` contradicted the actual validator, which accepts exactly one of those values. Copying the example literally produces a rejected answer. This confirmed prompt-contract defect is fixed, but it cannot be identified as the historical incident's specific cause without its missing response.

The reproduced defect is therefore the **unexplained, generic repair loop after rejected output**, rather than an adapter retry or forced tool selection after a successful fetch.

## Changes

### Final acceptance and recovery

Final decoding now distinguishes invalid JSON, wrong fields/kind/citations, empty content, excessive length, invalid Unicode and protected internal material. Citation diagnostics distinguish missing/over-limit citations, invalid citation shape, and sections not completely fetched. Acceptance remains strict: extra fields, invented IDs, incomplete sections and unsupported factual output still fail.

Repair feedback names the failed rule, explains the actual correction, and supplies only complete authorized citation candidates. It tells the model to answer when the available evidence suffices, while allowing further retrieval for missing support. The backend does not select citations for the model or weaken validation. Only the latest repair instruction remains in context; rejected text is never replayed.

The same validation reason repeated with unchanged discovery/evidence state is detected as no progress and returns `answer_repair_stalled` with HTTP 422. A changed error or new retrieved evidence can continue within the existing six-call limit. A real retrieval/model limit still returns the controlled `orchestration_limit` error. Limits and retry counts were not increased.

### Discovery-token reliability and context size

A live comparison exposed a separate issue: the model returned invalid discovery tokens on three fetch attempts, repeatedly forcing fresh searches. That run never reached a successful fetch and is not evidence of the original post-fetch failure.

The orchestration boundary now gives the model a short per-turn handle (`discovery_1`, etc.) instead of requiring it to copy a long signed discovery token. The backend resolves that handle to the original token. The Knowledge Gateway still checks signature, expiry, authenticated principal, index version, discovered selections and document authorization. Invented handles fail; expired discovery requires a new search. Direct gateway tools and their signed-token contract are unchanged.

This removes signed tokens from model context and tool-call arguments and reduces copying cost/corruption risk. It does not grant new access or bypass search-before-fetch.

The post-fetch replay additionally showed why `EVIDENCE_AVAILABLE` alone does not imply an acceptable final: at least one complete section may exist while a model cites some other unfetched or incomplete section. Fetch results now immediately supply `complete_citation_candidates`, pairing exact document IDs with short references such as `evidence_1`. The model selects a reference; the backend resolves it to an already fetched complete section and applies the existing citation checks. Wrong document/reference pairs, invented handles and partial evidence are rejected. Full exact section IDs remain supported. This reduces long-ID transcription risk and makes citation eligibility explicit before the first final answer. The original citation predicate is retained, with separate new diagnostics for unfetched versus incomplete citations.

### Safe diagnostics

Every attempted model call now emits `assistant_model_call` with:

- request ID and call ordinal;
- state before and after, plus actual tool choice;
- finish reason, tool-call count and assistant-content length;
- context bytes and complete-evidence count;
- accepted/rejected/continued/failed decision and exact safe reason;
- model-operation and iteration duration.

Tool-error continuations name safe gateway codes such as `discovery_invalid` or `unknown_tool`. Empty/unusable provider responses retain safe shape metadata. Turn metrics aggregate provider, context, search, fetch and final-validation durations. No response text, rejected text, credentials, auth/discovery tokens, private reasoning or raw provider bodies are logged. The formatter uses an explicit field allowlist.

## Before/after measurements

### Live replays

With explicit user approval, nine initial diagnostic model calls and three separately approved endpoint-verification calls were made across three replays of the saved question and its historical completed-message context:

| Run | Model calls | Search / successful fetch | Outcome | Duration |
|---|---:|---|---|---:|
| Historical incident, user reported | 6 | 1 / 1 | HTTP 422 `orchestration_limit` | approximately 32 s |
| Instrumentation only, original behavior | 3 | 1 / 1 (three complete sections) | Verified cited answer | 14.664 s |
| Initial recovery fix, before short handles | 6 | 3 / 0; three invalid-discovery fetch attempts | `orchestration_limit` | 27.563 s |
| Short discovery handles, before compact citation candidates | 3 actual calls; fourth blocked before transport | 1 / 1 | Final citation rejected; HTTP 422 `smoke_request_cap` when the test budget stopped repair | 10.484 s engine; 11.282 s including local HTTP setup/shutdown |

The baseline live replay proves the historical failure is not deterministic and a valid post-fetch final can already be accepted. The second run encountered a different failure and must not be presented as a successful latency improvement. Its measured stage totals were provider **26,687 ms**, context **516 ms**, search **203 ms**, failed fetch **157 ms**, final validation **0 ms**. The instrumentation-only replay's provider calls took **1,985 / 7,610 / 4,625 ms**; its successful search and fetch took **78 / 31 ms**. Older logging did not separately measure its context and validation stages.

The final compact-citation version is covered by real-gateway offline tests. All twelve separately authorized live calls have been used; no paid call beyond either approval was made. There is no claim of a live HTTP 200 result for the final compact-citation change.

### Repeatable offline comparison

The committed pre-fix loop and updated loop were run against the same scripted response policies and actual index/gateway/citation checks. These are synthetic reproductions, **not recovered original response bodies**, and the local timings exclude network latency.

| Scenario | Before | After | Total transmitted message-context bytes |
|---|---|---|---:|
| Valid final directly after fetch | 3 calls; answer | 3 calls; answer | 63,387 → 60,276 |
| Invalid literal kind, corrected when given specific feedback | 6 calls; limit error | 4 calls; verified answer | 152,640 → 88,207 |
| Repeated invalid JSON, unchanged evidence | 6 calls; limit error | 4 calls; controlled stalled-repair error | 152,688 → 88,174 |

For the two failure fixtures, calls fall by **33%**, and transmitted context falls by approximately **42%**. The valid path still takes three calls; this task does not add a redundant finalization round. Single-run local CPU durations were 118.236→143.662 ms (valid), 137.340→142.259 ms (recoverable schema), and 154.833→117.595 ms (repeated invalid); these small timings vary with cache/setup and are not evidence of production latency changes. The measured improvement is avoided model requests and context transmission.

Local sanitized receipts and measurements are under ignored `artifacts/ai-orchestrator-*.json`; they contain usage, shapes, source identifiers, tool events and counters, without credentials or raw reasoning.

## Files changed

Relative to `backend/backend/ai_assistant/`:

- `orchestrator.py`: per-call decisions/timing, specific final validation and repair, no-progress detection, compact discovery handles.
- `prompts.py`: valid final-answer example, evidence-ready guidance, exact handle-copying instruction.
- `evidence.py`: short complete-evidence citation references and precise safe rejection categories; original source verification preserved.
- `provider.py`: safe shape metadata for unusable/empty completions; transport behavior and limits preserved.
- `diagnostics.py`: allowlisted model-call and stage-duration fields.
- `tests/test_finalization.py`: sixteen focused finalization/discovery/citation/logging regressions.
- `tests/test_api.py`: authenticated endpoint success after repair, and controlled failure/persistence/lease release.
- `README.md`: updated protocol/diagnostic documentation.

Also added this report. No frontend, business model, database migration, deployment secret or provider-limit configuration was changed. No framework, streaming, embeddings or architecture replacement was introduced.

## Verification

`manage.py test ai_assistant knowledge`: **157 passed**, no skips; Django system checks clean. Coverage includes immediate valid final acceptance; malformed/empty JSON; invalid kind/schema/citations; specific correction and recovery; repeated rejection; new evidence after rejection; unexpected tools; actual provider empty-response parsing; compact discovery/citation handles and original signed-token validation; wrong-document/invented citations; mixed complete/partial fetch eligibility; invented/expired discovery; log redaction; endpoint persistence and lease release; existing authorization, ranking and gateway tests.

`git diff --check`: clean. Routine tests used no network or API credits. The configured six-model-call limit remains unchanged.

## Final live endpoint verification

The user approved exactly three additional calls. The real JWT-authenticated socket HTTP request reached the normal chat route, preserved the conversation ID, searched and fetched successfully, then correctly rejected an ineligible citation. It spent three actual provider calls (18,654 prompt + 1,001 completion = 19,655 tokens). A fourth orchestration attempt was blocked before transport by the explicit test cap, producing HTTP 422 `smoke_request_cap` rather than a fabricated answer. Stage times: provider 9,923 ms, context 436 ms, search 94 ms, fetch 31 ms, final validation rounded below 1 ms.

The final compact citation references were implemented after this diagnostic result. Their acceptance, rejection, partial-section behavior, actual returned source IDs, API persistence and error handling pass offline regressions. **The final change is not yet demonstrated as a successful live endpoint response.** No further paid requests were made after the approved twelve calls. Historical raw responses remain unavailable; the new precise diagnostics prevent that same uncertainty in future investigations.
