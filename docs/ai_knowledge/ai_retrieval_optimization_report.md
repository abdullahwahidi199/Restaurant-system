# Retrieval optimization — 2026-10-29 (Asia/Kabul)

Automatic fetching is implemented behind `AI_RETRIEVAL_MODE=auto_fetch`.
`legacy` remains the default and the configuration-only rollback. There are no
frontend/API-contract changes, new migrations, business-data tools, indexer
changes or edits to the operator documentation corpus.

## Implementation and inspection

Inspected the real orchestrator/state transitions, DeepSeek transport and parser,
system prompt/capability map, index loader/repository, ranking/search, gateway
dispatcher, signed discovery/fetch checks, access policy, evidence/citation
validation, conversation persistence, SuperAdmin audit capture/API, and existing
evaluation/performance tests before implementation.

The provider already performs one transport request per completion without
automatic retries. The orchestrator already permits final output after complete
fetching with `tool_choice=auto`; the optimization supplies that complete evidence
during the first search phase instead of forcing a new selection round.

`retrieval.py` selects a primary guide using original-question domain terminology,
local section/heading relevance, document status, relative ranking separation and
bounded related navigation. A strong score alone, or an AI module hint, cannot
qualify a selection. Compound tasks, troubleshooting, near ties, generic payment
questions, missing evidence and untranslated questions fall back. Full policy,
limits and examples are in [RETRIEVAL.md](../../backend/backend/ai_assistant/RETRIEVAL.md).

The backend calls the ordinary fetch dispatcher with the actual signed discovery
token. It still checks identity, role, branch/restaurant context, policy, discovered
document/section pairs, current index version and source hashes. Fetched evidence
is staged atomically: a partial or over-budget response never becomes an unseen
citable source. No procedure, validation table or warning is truncated for auto
fetching. Explicit fetch paging remains available when evidence cannot fit.

A successful search returns actual complete Markdown, exact identifiers, titles,
headings, verification/provenance and complete citation references, without the
redundant candidate list. Fallback returns bounded compact candidates with exact
IDs, title, module, summary, rank and the existing discovery handle. More searches
are permitted when the evidence does not answer the question.

SuperAdmin auditing retains actual ranked search output and a separate automatic
fetch call/result before the second model request. It records `automatic=true`,
actual timings/counters and structured selection/fallback reasons. Existing usage,
cache fields, source origins, persistence events, protected payload storage and
SuperAdmin access checks remain in place. Mode is recorded in context and turn
metrics; automatic decisions also have a `retrieval_selection` event. Declining
before fetching creates no invented fetch event.

## Baseline and method

The saved successful employee turn confirms the example supplied in the task:
3 model calls, 2 tool calls, 14,713 prompt tokens, 877 completion tokens,
9,579.338 ms; cache hit/miss tokens were 10,112/4,601. The supplied approximate
search/fetch payload sizes were 10.5/7.3 KB. This is one observation, not an average
or a paired live result for this change.

Before modifying the retrieval implementation, all **173** existing AI/knowledge
tests passed. A reproducible source baseline was executed from commit
`476f746c6ceee62c98ac005c09f8bd9f1638f5b1` using the same new scripted benchmark
provider and source annotations as the paired comparison. The original 96-case
dataset and its expected sources were not changed. Eight separately annotated
straightforward questions were added in `retrieval_clear_cases.json` so the
intended fast path is explicitly measured rather than inferred from difficult
paraphrases.

Preserved machine-readable results:

- [Pre-change baseline](evaluation/retrieval_baseline.json), including source commit,
  dataset hash, index version, per-case outcomes, counts, timings and byte sizes.
- [Paired modes](evaluation/retrieval_comparison.json), with the same metadata and
  per-case evidence/tool results.
- [Clear-case source annotations](evaluation/retrieval_clear_cases.json), checked
  against actual indexed headings/content independently of retrieval rankings.

The provider performs scripted search/fetch decisions through the actual engine,
gateway, source checks and API/database tests. It selects an annotated section
only if discovered. Missing expected sources are preserved as misses. Scripted
answers contain source witnesses; these metrics test retrieval/protocol behavior,
not real DeepSeek answer quality. No synthetic token usage or API cost is reported.

## Measured offline comparison

| Metric, all 104 cases | Pre-change source | Current legacy | Auto fetch |
|---|---:|---:|---:|
| Model requests | 280 | 280 | 271 |
| Search / fetch executions | 114 / 72 | 114 / 72 | 114 / 72 |
| Tool executions | 186 | 186 | 186 |
| Transmitted message-context bytes across requests | 6,243,421 | 6,460,701 | 4,381,250 |
| Search-tool result bytes, including evidence on success | 1,597,608 | 1,597,608 | 643,821 |
| Fetched Markdown bytes | 100,889 | 100,889 | 102,656 |
| Source-witness/behavior successes | 88/104 | 88/104 | 88/104 |
| Source-reference validity | 104/104 | 104/104 | 104/104 |
| Orchestration errors | 0 | 0 | 0 |
| Local duration, one run | 11,703.990 ms | 11,833.245 ms | 11,925.169 ms |
| Input/output/cache tokens | unavailable | unavailable | unavailable |

Compared with current legacy, auto fetch uses **32.19% fewer message-context
bytes**, **59.70% fewer search-result bytes**, and **3.21% fewer model requests**
across this broad corpus. Context bytes measure JSON messages, not provider token
counts or the separately serialized tool schema. The slightly larger current
legacy context reflects clearer evidence/answer-depth instructions.

The **eight direct clear questions** use 24 legacy versus 17 auto-fetch model
requests. Seven of eight complete in **two calls instead of three**: employee
overview, employee creation, attendance, contractor invoice creation, contractor
payments, supplier payments and reservation creation. Menu-item creation retains
fallback because the policy detects competing terminology. Their aggregate
message-context bytes decrease from 616,679 to 242,402 (**60.69%**). Fetched
Markdown grows from 14,401 to 16,168 bytes because selected navigation is included
when discovered; it is not discarded to improve a payload score.

Only two of the original 96 harder cases take the automatic path; the remaining
ones retain explicit retrieval/clarification/reuse. This conservative coverage is
intentional and reported separately from the added clear fixtures. The unchanged
16 source-witness misses are EVAL-061, EVAL-063 and EVAL-065–078: two existing
English discovery misses and fourteen raw Dari/Pashto queries without translation
hints. The two literal translated-label tests and the follow-up cases are also
included. No expectation was relaxed to improve the score.

The local timings exclude provider/network latency and vary with caches/setup;
they do **not** establish a production latency gain. Actual provider token/cache
and latency observations are reported separately below.

## Regression coverage

The final AI/knowledge suite passes **198 tests**, including the original suite
and 25 new tests. The frozen paired comparison runs inside the regression suite.
Coverage includes correct section selection and full content; competing domains
and misleading AI hints; multi-step fallback; native-language fallback; original
signed discovery; expiry/tampering; forbidden and undiscovered IDs; branch drift;
index drift; complete-section byte budgets; atomic evidence staging; explicit
fetch paging; citation rejection and stalled-repair bounds; provider errors;
prior evidence reuse; the existing mock CLI; unchanged authenticated chat response
shape; conversation persistence/lease release; separate fetch audit spans and
SuperAdmin-only audit access. Two post-live regressions reproduce the exact
topic/module arguments with an omitted limit and preserve explicit model limits.
Routine tests make no real model requests.

## Controlled live test — ten approved requests

Automatic approval review initially rejected execution pending explicit consent
for the internal retrieval context/destination. The user then approved that exact
payload to `api.deepseek.com` with **at most ten total requests**. The normal
JWT-authenticated Django route ran against the configured provider, with fresh
conversations, actual audit/persistence, no transport retries and a shared hard cap.
The route was invoked in-process; the provider transport used real HTTPS.

The `smoke_retrieval_modes` command scheduled these identical questions under both
modes, stopping when the budget was exhausted:

1. “What are employees in Pakhlai?”
2. “How do I record a contractor payment?”

The outbound prompts contained those questions, authorized capability descriptions,
role/scope flags and retrieved operator documentation/provenance. No restaurant
business records, previous conversations, account identifiers or credentials were
put in prompts. The credential stayed in the provider's HTTPS authorization header.

| Question / requested mode | Result | Actual HTTP requests | Model-request attempts | Search / successful fetch | Local route duration |
|---|---|---:|---:|---:|---:|
| Employee overview / legacy | HTTP 200 | 6 | 6 | 2 / 2 | 19,630.469 ms |
| Employee overview / auto fetch | HTTP 200, **fallback** | 3 | 3 | 1 / 1 | 8,432.781 ms |
| Contractor payment / legacy | HTTP 422 `smoke_request_cap` | 1 | 2; second blocked before transport | 1 / 0 | 2,252.671 ms |
| Contractor payment / auto fetch | Not run; cap exhausted | 0 | 0 | — | — |

| Usage | Employee legacy | Employee auto-mode fallback | Contractor partial legacy |
|---|---:|---:|---:|
| Prompt tokens | 38,697 | 11,611 | 2,517 |
| Output tokens | 1,292 | 637 | 89 |
| Total tokens | 39,989 | 12,248 | 2,606 |
| Cache-hit prompt tokens | 27,008 | 8,960 | 2,304 |
| Cache-miss prompt tokens | 11,689 | 2,651 | 213 |
| Tool attempts | 5 | 2 | 1 |
| Search-result bytes sent to model | 22,314 | 3,184 | 12,598 |
| Fetched Markdown bytes | 3,920 | 2,150 | 0 |

All **ten actual HTTP requests** were independently verified from audit events
with `transmitted=true`. The cap-blocked extra attempt is explicitly recorded
with `transmitted=false`, not counted as a paid request. Aggregate actual usage:
52,825 prompt + 2,018 output = 54,843 tokens; 38,272 cache-hit and 14,553 cache-miss
prompt tokens. Usage is complete for the two successful answers; the interrupted
contractor turn is correctly marked incomplete. No further provider calls ran.
Per-call timings, usages, answers, selected references, actual audit timeline and
verification are preserved in [the live receipt](evaluation/retrieval_live_comparison.json).

For this single employee pair, latency fell **57.04%**, input tokens **70.00%** and
total tokens **69.37%**. This is a small sequential sample with different cache
conditions and model choices. It is not an average or proof that automatic
fetching caused the improvement: **automatic fetching did not execute in this
live pair**. The real improvement observed here includes compact fallback payloads
and avoided unsuccessful selection/recovery rounds. Cost is not estimated because
current model pricing was not verified.

### Audit diagnosis, answer review and follow-up fix

Legacy's second model request invented a staff section ID without its required
hash. The gateway correctly rejected it with `section_not_available`. The model
fetched attendance navigation, searched again, then fetched the staff authority
and field sections before answering on call six. No invalid ID was accepted.

Auto mode returned `auto_fetch_fallback` / `overview_not_unique`. The model omitted
`limit`, leaving the gateway default of five results. Its attendance/shifts topic
hints placed the staff authority/overview section at **rank eight**, outside
discovery. Fetching attendance instead would have been inappropriate, so the
policy declined; the model explicitly fetched two sections and answered on call
three. All cited IDs/hashes resolved to authorized, complete, actually retrieved
sections in both completed turns.

Manual claim-by-claim review did **not** pass full semantic grounding/conciseness.
Both answers were too detailed for an overview. The legacy answer added attendance
statuses, leave-approval and automatic-payroll-hours claims absent from its fetched
sections. The fallback answer added a no-leave-approval-workflow claim absent from
its fetched sections. Source-ID integrity alone does not prove that every claim
is supported; these limitations are retained in the receipt rather than scored as
fully correct answers.

The final implementation therefore broadens **only an omitted ranked-search limit
in auto mode to 15**. Explicit model limits and legacy's default remain unchanged.
Ranking, original-question domain checks, discovery authorization and payload/
evidence budgets remain unchanged. Offline replay of the exact live arguments
now retrieves the uniquely appropriate staff authority section and completes in
two scripted calls. Prompts now specify a 2–4 sentence default for module
definitions and require each substantive claim to be supported by fetched text.
No evaluation expectations or gateway validations were weakened.

These final post-live changes are **offline verified only**. The ten-request
approval is exhausted, so they have not received a further real-model check.
Successful live two-call behavior and improved semantic grounding/conciseness
remain unverified. Legacy remains the default.

## Configuration and reproduction

Use [RETRIEVAL.md](../../backend/backend/ai_assistant/RETRIEVAL.md) for exact
commands and configuration. Enable only in development with
`AI_RETRIEVAL_MODE=auto_fetch`, restart workers, run the offline comparison and
approved live smoke tests, and inspect the SuperAdmin timeline. Restore
`AI_RETRIEVAL_MODE=legacy` and restart workers to roll back. No deployment default
was changed. Broader enablement remains pending successful live verification of
the final two-call path and claim grounding/conciseness. Renewed approval is
required before any additional provider calls in this session.
