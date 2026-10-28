# Pakhlai AI knowledge evaluation and hardening

Measured 2026-10-29, Asia/Kabul. **English exact-section Recall@5 improved from 92.19% to 95.31%. English Recall@1 improved from 59.38% to 71.88%.** All 87 selected deterministic checks and 16 scripted non-metric behavior cases pass after hardening. These are not measurements of real DeepSeek answer accuracy.

The [initial assessment](initial_assessment.md), [frozen questions](questions.jsonl), [configuration](config.json), [preserved baseline](baseline.json), [final results](results.json), and [complete failure analysis](failure_analysis.json) are separate artifacts outside production operator documentation. No live provider call, real credential, embedding, translation service, new business tool or frontend was used.

## Method and reproducibility

- 96 manually authored realistic questions: 80 source-answerable cases (64 English, 8 Dari, 8 Pashto) and 16 separately evaluated cases (4 ambiguous, 4 unsupported, 4 live-data, 4 contextual follow-ups). The dataset was fixed before search scores were inspected.
- Every answerable target has a real document ID, exact section ID, inspected heading and literal source witness. Validation checks the current index and access policy, independently of search. Source expectations were not broadened or replaced after measuring failures.
- The dataset digest is `3a6321bd5150f8d5758d630219e9b8a4a04732245677b9d53a00f8d54143b53e`. Baseline and final have identical dataset, configuration and index digests. The current index is `6f1885a21a3976b1f321c7c955bc20a663acce30c71a518e5227dcc4a9a0cbae`. All baseline production fingerprints match clean commit `899578e8c9fa44cded746a81839f5c50553c0d53`; final code fingerprints are recorded separately in JSON.
- Recall@k requires an expected **section ID and document ID** within the first k actual gateway results. A right-document/wrong-section result is not a hit. MRR is explicitly **MRR@15**, truncated at the gateway's maximum returned candidate count; no hit contributes zero. Metrics use 80 answerable cases, or the corresponding subgroup denominator. The 16 other cases do not inflate ordinary recall.
- Retrieval uses controlled offline role fixtures (ordinary Admin/Cashier/Waiter/Kitchen_manager/FinanceManager as annotated). Actual Django account/subscription/branch and conversation authorization are tested separately in isolated database/API tests. Two native-literal cases explicitly use a privileged technical-reference fixture; this does not authorize technical references for ordinary staff.
- Matching expected sections found within 15 were fetched through their actual discovery tokens and checked against exact indexed content/hash/heading. Final metric cases yielded 66 such exact source matches; 14 English-only-source/native-question cases were not found. Complete per-case ranks, other same-document candidates, fetch hashes and no-hits remain in JSON.

## Retrieval results

| Cohort/run | N | Recall@1 | Recall@3 | Recall@5 | MRR@15 |
|---|---:|---:|---:|---:|---:|
| All answerable, baseline | 80 | 48.75% | 71.25% | 76.25% | 0.6017 |
| All answerable, final | 80 | 58.75% | 75.00% | 78.75% | 0.6694 |
| English, baseline | 64 | 59.38% | 85.94% | 92.19% | 0.7287 |
| English | 64 | 71.88% | 90.62% | 95.31% | 0.8133 |
| Dari | 8 | 0.00% | 12.50% | 12.50% | 0.0625 |
| Pashto | 8 | 12.50% | 12.50% | 12.50% | 0.1250 |

The English goal of at least 90% Recall@5 is met; it was already met at baseline. The final English result is 61/64 at five and 46/64 at one. Overall mixed-language Recall@5 remains only 63/80. The two native-literal table questions succeed at five; all 14 native operator questions targeting English-only primary instructions miss their targets. No cross-language semantic capability is inferred from these figures. Mocked English topic-generation tests are a different result, not native lexical recall.

### By category

All-language results are shown with English Recall@5 separately. Small cohort sizes are retained rather than hidden.

| Category | N | Recall@1 | Recall@3 | Recall@5 | MRR@15 | English Recall@5 |
|---|---:|---:|---:|---:|---:|---:|
| direct | 19 | 68.42% | 73.68% | 73.68% | 0.7171 | 93.33% |
| form_fields | 12 | 50.00% | 58.33% | 66.67% | 0.5625 | 100.00% |
| native_literal | 2 | 50.00% | 100.00% | 100.00% | 0.7500 | n/a |
| navigation | 6 | 50.00% | 50.00% | 66.67% | 0.5333 | 100.00% |
| no_module | 4 | 75.00% | 100.00% | 100.00% | 0.8333 | 100.00% |
| paraphrase | 5 | 40.00% | 60.00% | 60.00% | 0.5000 | 100.00% |
| permissions | 5 | 80.00% | 80.00% | 80.00% | 0.8250 | 80.00% |
| troubleshooting | 9 | 44.44% | 77.78% | 88.89% | 0.5944 | 88.89% |
| validation | 16 | 62.50% | 87.50% | 87.50% | 0.7292 | 100.00% |
| workflow | 2 | 50.00% | 100.00% | 100.00% | 0.7500 | 100.00% |

### By module

These are the annotated supporting modules, not guessed modules from returned results. Native misses remain in the all-language denominators.

| Module | N all | Recall@1 | Recall@3 | Recall@5 | MRR@15 | N English | English Recall@5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| billing | 4 | 75.00% | 75.00% | 75.00% | 0.7812 | 4 | 75.00% |
| branches | 2 | 100.00% | 100.00% | 100.00% | 1.0000 | 2 | 100.00% |
| contractors | 7 | 42.86% | 71.43% | 71.43% | 0.5476 | 5 | 100.00% |
| discounts | 4 | 50.00% | 100.00% | 100.00% | 0.6667 | 4 | 100.00% |
| employees | 8 | 62.50% | 75.00% | 75.00% | 0.6875 | 4 | 100.00% |
| expenses | 5 | 60.00% | 60.00% | 60.00% | 0.6000 | 3 | 100.00% |
| inventory | 6 | 33.33% | 50.00% | 66.67% | 0.4306 | 4 | 100.00% |
| kitchen | 3 | 100.00% | 100.00% | 100.00% | 1.0000 | 3 | 100.00% |
| menu | 7 | 28.57% | 57.14% | 71.43% | 0.4167 | 5 | 100.00% |
| navigation | 2 | 0.00% | 0.00% | 50.00% | 0.1625 | 2 | 50.00% |
| orders | 5 | 100.00% | 100.00% | 100.00% | 1.0000 | 5 | 100.00% |
| payroll | 6 | 66.67% | 66.67% | 66.67% | 0.6667 | 4 | 100.00% |
| procurement | 4 | 50.00% | 100.00% | 100.00% | 0.7500 | 4 | 100.00% |
| reports | 2 | 100.00% | 100.00% | 100.00% | 1.0000 | 2 | 100.00% |
| reservations | 6 | 66.67% | 66.67% | 66.67% | 0.6667 | 4 | 100.00% |
| settings | 2 | 50.00% | 100.00% | 100.00% | 0.7500 | 2 | 100.00% |
| tables | 3 | 66.67% | 100.00% | 100.00% | 0.8333 | 3 | 100.00% |
| troubleshooting | 2 | 50.00% | 50.00% | 50.00% | 0.5500 | 2 | 50.00% |
| workflows | 2 | 50.00% | 100.00% | 100.00% | 0.7500 | 2 | 100.00% |

## Failure investigation and focused changes

[Failure analysis](failure_analysis.json) accounts for all 41 answerable cases not ranked first in baseline or final, including every miss and regression. No missing index entry, fabricated expected ID or heading-extraction defect was found. Common observed causes were inherited metadata outranking local procedure text, a hard two-section document cap, missing ordinary English variants, diversity displacing a stronger non-business reference, and native questions without matching English source vocabulary.

Changes retained the existing lexical architecture and tool contracts:

1. `knowledge/search.py`, `ranking.py`: local matched-term coverage factor `0.45 + 0.55 * coverage`; section-content weight 1.5 to 3; up to three sections per document; the highest raw-scoring candidate is always retained before business-module diversification. The method label is `weighted_length_normalized_tfidf_v2`; numeric scores remain retrieval units, not confidence.
2. `knowledge/aliases.json`: small verified English variants for dish/item, part/partial, shift/shifts, preparing/preparation, failure/failed, arrival, timeout and sign-in phrases. No question IDs, answer lookup table, payment-domain substitution, native translation dictionary or per-workflow ranking override was added.
3. `knowledge/search.py`: lexical counters are prepared once on first authorized use, bounded by section IDs. Ordinary workers no longer prepare all technical/unmounted/QA source counters at first question. Authorization filtering and snapshot invalidation still run; a later privileged workload can grow the cache toward its bounded full size.
4. `ai_assistant/orchestrator.py`: an expired/invalid discovery response clears current discovery and returns to bounded search, rather than repeatedly forcing an invalid partial fetch. Genuine index/context drift still aborts the pinned turn.
5. `ai_assistant/provider.py`: validate provider content/tool-call types before normalizing null; reject falsey containers/booleans instead of treating them as missing values. Check response size before extending the raw buffer.
6. `ai_assistant/language.py`: obvious current stock quantities and today's order counts use the documentation-only limitation. Procedural stock-screen questions are not swallowed by this new guard. It remains a narrow boundary rule, not a complete intent classifier.

Before fixes, the new probes found 3 failing test methods with 8 failed assertion sites (expiry recovery, two live-record phrasings, malformed provider types). Existing tests and the remaining probes passed. After fixes all 87 selected methods pass. No new models, migrations, conversation/API arguments, role grants, index format, source documents or external service were introduced.

The preserved baseline also contains six negative per-subtest diagnostic durations caused by an early evaluator recorder fallback; the recorder was corrected to use the parent test start time. These invalid diagnostic durations are excluded from performance conclusions. The independently measured load/search/fetch/API benchmark samples use their own timers and are unaffected. Baseline outcomes and rankings remain unchanged.

### Remaining strict English misses at five

| Case | Baseline rank | Final rank | Question |
|---|---:|---:|---|
| EVAL-010 | 5 | 8 | How does a reservation deposit reduce the amount due at checkout? |
| EVAL-060 | not in 15 | 8 | Does a custom role name automatically give access to every staff portal? |
| EVAL-061 | 14 | 10 | The payment request timed out. What should I check before trying again? |

EVAL-010 is a regression: reservation workflow/other reservation sections now occupy more positions before the exact checkout balance calculation. EVAL-060 needs more precise cross-layer custom-role/portal vocabulary; staff/profile pages match much of the same wording. EVAL-061's brief timeout advice is inside a long general recovery table, while payment-action sections dominate lexical terms. A future focused documentation subsection could improve discovery; no guide or expectation was rewritten here. All three exact targets are present by rank 10.

Other rank regressions are retained transparently, even when still within five:

| Case | Baseline | Final |
|---|---:|---:|
| EVAL-010 | 5 | 8 |
| EVAL-014 | 2 | 4 |
| EVAL-021 | 3 | 4 |
| EVAL-059 | 2 | 5 |

The additional local-evidence weighting and document allowance improve the aggregate but do not improve every case. This is not a claim of perfect retrieval or exhaustive coverage of all 328 documents/actions.

## Orchestration, grounding and security

**87/87 selected test methods passed, zero skips; 16/16 scripted behavioral cases passed.** Selection includes 37 engine/provider/hardening methods, 49 gateway/API/authorization/conversation methods and one database performance method. The broader assistant/knowledge run passed **132/132** tests, including independent dataset/metric/cache tests and existing gateway search tests for exact phrases, correct/wrong hints, browsing, related discovery and Unicode.

The scenarios include simple search/fetch/answer, multi-section workflow, additional search, controlled clarification/limitation, live-data refusal, early fetch, unsupported final text, bounded loops, malformed arguments, provider failures, follow-up reuse, permission changes and multiple correctly ordered tool IDs. Source IDs, current version/hash, actual title/heading, full section coverage and policy are checked. Scripted outputs preserve actual UI source text and cannot create new field/rule/role metadata in structured citations. **No automatic semantic-entailment claim is made:** a real model can still misinterpret or invent prose while citing a real fetched section. The [human review checklist](live_review_checklist.md) addresses that remaining acceptance requirement.

Security checks cover unauthenticated API requests, other-owner conversations, wrong restaurant/branch/role, unknown metadata permissions, restricted technical sources, cross-user/expired/modified/stale discovery tokens, arbitrary paths, AI-supplied scope parameters, request/response bounds, provider body/key/log protection and model-generated SQL/unregistered functions. Malicious document content is supplied through an actual temporary index/gateway fetch; malicious user/history/tool text remains data and cannot add an executable tool or higher-priority message. These tests prove backend non-execution and access boundaries; they do not prove that a live model will ignore every injection in its wording.

Conversation tests exercise missing/deleted IDs, long ordered history, latest-question preservation, stale sources, actual role/branch changes, failed providers, lease recovery and a real two-connection simultaneous request: one turn completes and the competing submission receives 409 without publishing another turn. Sequential identical submissions intentionally create distinct ordered turns with different request IDs. The API has no client idempotency-key contract; this limitation is reported rather than silently discarding legitimate repeated questions.

No business-query tool exists. Inspection and tests confirm the only writes are assistant persistence; SQL strings are rejected as unregistered calls, and sample order/ingredient counts do not change through the assistant flow. Existing role and subscription rules remain authoritative. Shared onboarding guides may contain cross-role educational context; read access does not grant business operations.

## Local performance and resources

Timings exclude external model/network latency. The gateway benchmark uses a controlled in-process role; the API benchmark uses real Django authorization and a temporary SQLite database. p95 is the nearest-rank sample percentile. N=10 load/API tails include a cold first-use sample and should not be treated as a robust population-tail estimate or production SLA. Memory instrumentation runs separately from timing.

| Operation | N | Baseline median ms | Final median ms | Final p95 ms |
|---|---:|---:|---:|---:|
| Uncached index load | 10 | 92.870 | 91.299 | 196.876 |
| Cached snapshot validation | 30 | 0.753 | 0.848 | 1.193 |
| Warm gateway search | 30 | 3.610 | 5.128 | 5.958 |
| Internal fetch materialization | 30 | 0.062 | 0.066 | 0.079 |
| Validated gateway fetch/dispatch | 30 | 0.110 | 0.117 | 0.140 |
| Warm mock engine + gateway | 30 | 5.012 | 6.390 | 7.693 |
| Owned history API | 30 | 3.526 | 3.002 | 3.734 |
| Mock full chat API + persistence | 10 | 34.608 | 32.548 | 256.584 |

Traced allocations for loaded index plus prepared ordinary-Admin search decreased from **74.67 MiB to 34.22 MiB** (54.2% lower). The index itself remains 24.11 MiB; peak load allocation remains 78.68 MiB. These are Python allocations, not total process RSS. Lazy preparation reduces steady allocations/first-use work, not the serialized index load peak. A worker serving privileged technical queries may prepare more records later.

Warm search became about 1.5 ms slower while section relevance improved; this tradeoff is explicit. Cached snapshot identity is reused. History stays at 4 queries per page and mock chat at 33 queries per turn in the fixture. Repeated authorization queries are retained for context changes between model/tool operations; no auth cache was introduced to chase small local latency gains. Repeated identical tool calls remain bounded by the existing turn/call limits; no new cross-user query cache or service was added.

## Commands, safety and remaining issues

From `Restaurant-system/backend/backend`, verification commands included:

```powershell
& venv/Scripts/python.exe manage.py test ai_assistant knowledge --verbosity 1
& venv/Scripts/python.exe manage.py evaluate_ai_assistant --retrieval --output ../../docs/ai_knowledge/evaluation/baseline_retrieval.json
& venv/Scripts/python.exe manage.py evaluate_ai_assistant --all --output ../../docs/ai_knowledge/evaluation/baseline.json
& venv/Scripts/python.exe manage.py test ai_assistant.tests.test_evaluation_hardening.OrchestrationHardeningTests --verbosity 2
& venv/Scripts/python.exe manage.py evaluate_ai_assistant --all --baseline ../../docs/ai_knowledge/evaluation/baseline.json --output ../../docs/ai_knowledge/evaluation/results.json
& venv/Scripts/python.exe manage.py test --verbosity 1
```

The duplicate retrieval-only development artifact was removed after confirming its records exactly equal the preserved full baseline. Intermediate final retrieval records likewise equal final JSON. The final benchmark run was isolated from the other test process. `git diff --check`, local documentation-link checks and frozen source/dataset/index checks were also performed. Generated test databases/media are isolated; no production records or migrations were changed. Evaluation cannot enable a real provider: the runner supplies an empty provider key, and provider-specific unit tests use explicit mock transports. No live mode is offered by this command.

The full backend regression run executed **276 tests in 121.566 seconds: 274 passed, 2 failed**. The failures are the same pre-existing `orders.tests.OrderRealtimeRegressionTests.test_kitchen_item_status_broadcasts_item_and_order_snapshots` and `test_order_creation_broadcasts_full_order_and_all_created_items`, comparing UTC versus Asia/Kabul timestamp strings. They were previously reproduced with the assistant disabled in the [Task 4 report](../ai_assistant_report.md); no order/realtime implementation or test was changed here.

Remaining acceptance work:

- Real DeepSeek tool selection, prose grounding, model-level injection resistance, latency/cost and multilingual fluency remain unverified. Mock passing scores do not establish live answer quality.
- Fourteen native questions need reliable interpretation/translated topic generation or verified localized primary documentation. No embedding, translation service, semantic model or invented localized control was added.
- Three strict English targets remain below five; navigation and broad troubleshooting should not be hidden behind the overall English average. All failures and rank regressions remain reproducible.
- Conservative payment/live-data/follow-up heuristics are not complete intent understanding. Missing retrieval must remain uncertainty, not a fabricated feature claim. Real generated answers need human evaluation against actual UI labels, routes, fields, validations, roles and caveats.
- The unchanged technical/custom-role policy is conservative. Unindexed source edits still require an explicit rebuild; deployment/cache/signing/retention and real multi-worker/provider behavior require normal environment validation.
- The two unrelated order timestamp regression failures and lack of a client idempotency key are retained limitations.

Use the [evaluation instructions](README.md) and [optional live-review checklist](live_review_checklist.md) for reproduction and later acceptance. No React interface, business analytics, live data tools, generated chart, new infrastructure or architecture replacement is part of this task.
