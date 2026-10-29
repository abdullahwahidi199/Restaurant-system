# Pakhlai AI chat 503 repair and real integration verification

Verified on 2026-10-29, Asia/Kabul. The original failure is repaired. A real contractor-invoice question completed from the React chat through authenticated HTTP, Django, DeepSeek, authorized documentation search/fetch, persistence and back to React. Follow-up and approval/payment questions also returned HTTP 200 with verified citations.

## Root cause and evidence

The saved failed turn at 09:00:50 local time has `error_code=index_unavailable`. The failing component was `knowledge.repository.IndexRepository`, before any provider call. Its broad exception wrapper concealed the filesystem exception, and React correctly mapped that error code to its documentation-index message.

The artifacts existed and were valid, but the Windows runtime account could not traverse/read the immutable generation. Diagnostics under the actual runtime account reproduced `PermissionError`, errno 13, Windows error 5, on `documents.json`/`capability_map.json`. The build account could load exactly the same files. ACL inspection showed:

- Storage parent: inherited deployment ACL, readable by the runtime account.
- Published generation: protected ACL, owned by the sandbox build account, permitting only OWNER RIGHTS, SYSTEM and administrators.

`publish_index` created staging with `tempfile.mkdtemp`, which applies an owner-only Windows ACL. Atomic directory rename preserved that ACL when staging became the published generation. A normal Django process running as the developer therefore received access denied. Rebuilding unchanged content reused that same immutable generation and did not repair its permissions.

Publication now creates a random, exclusive staging directory under generation storage using normal directory creation, inheriting the configured storage-parent ACL. The existing exact generation's inheritance was enabled after verifying its absolute path stayed inside the index root. No repository-wide or `.env` permission changes were made. The runtime account subsequently loaded the index, passed the published-snapshot validation and completed real retrieval-backed HTTP requests.

Two additional confirmed issues were fixed:

1. Settings used `os.environ` but no Django entry point loaded the backend `.env`. The existing key was nonempty in that file and absent from Django's effective settings. This would have caused a subsequent `provider_not_configured` error. Settings now load the absolute `.env` path with process environment taking precedence.
2. Social routing recognized `hello` but not `hello how are you` or `Hello, how are you?`. These greetings unnecessarily entered the index-dependent factual path. Whole-message recognition now handles them; a greeting prefixed to an operator question still requires retrieval.

## Index, configuration and provider

The original 328 Markdown documents, 3,467 sections and 22 capability modules are intact. Rebuilding produced the identical build hash:

```text
6f1885a21a3976b1f321c7c955bc20a663acce30c71a518e5227dcc4a9a0cbae
```

There are zero build errors, zero unresolved references, and the existing 132 classification/review warnings. No source Markdown was rewritten. Checksums, schemas, section ownership/reconstruction, IDs and capability references pass. The generation is accessible under the runtime account.

Source freshness now uses the scanner's shared eligibility rules. When sources are present, stat fingerprints detect candidate additions/removals/changes; changed fingerprints trigger byte-hash comparison, without parsing/rebuilding per request. Timestamp-only touches with unchanged bytes remain valid. Source or capability-curation drift fails closed until an explicit rebuild. Manifest/artifact changes still refresh worker snapshots and invalidate discovery versions. Snapshot-only deployments remain supported.

Relative configured knowledge paths now resolve against the directory containing `manage.py`, independent of working directory. Index generation remains a separate deployment step. `build_knowledge_index --check --validate-published` additionally checks that the readable published snapshot matches current build inputs; plain `--check` can validate inputs before a snapshot exists.

The existing API key was preserved. The only private `.env` additions were:

```dotenv
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash
```

Django's configured defaults remain a 20-second provider timeout, 90-second turn budget and 1,800 output tokens. Paid workflow tests conservatively lowered output to 1,200 tokens; connectivity used 64. No new dependency was needed: installed HTTPX, python-dotenv, PyYAML and Mistune suffice.

The base URL and `deepseek-flash` identifier match the current [official DeepSeek documentation](https://api-docs.deepseek.com/quick_start/pricing). The existing adapter's Chat Completions format, disabled thinking, named function choices, assistant/tool message ordering and tool-call IDs match the [API reference](https://api-docs.deepseek.com/api/create-chat-completion/) and [tool-call guide](https://api-docs.deepseek.com/guides/tool_calls/). Live search/fetch rounds accepted that format. Multiple-call ordering remains covered by offline regressions. Provider errors now retain a safe HTTP status for diagnostics and distinguish insufficient balance (402).

## Live test results and request accounting

No more than **10 model-call attempts** were made, conservatively counting the initial sandbox-blocked attempt. Nine provider responses succeeded. A persistent shared counter covered tool rounds and a restart; calls stopped at the cap. No load test or automatic transport retries were performed.

| Test/question | Result | Model attempts | Documentation search/fetch | Prompt / completion / total tokens |
|---|---|---:|---|---:|
| Minimal connectivity, no documentation | First attempt blocked by sandbox socket permissions; approved retry authenticated and returned a parsed completion | 2 | None | Successful retry: 41 / 7 / 48 |
| `Hello, how are you?` | Live HTTP 200; local conversational response; saved user/assistant messages. The original `hello how are you` wording also passes the regression. | 0 | Neither needed | 0 |
| `How do I create a contractor invoice?` | HTTP 503 reproduced before ACL repair; HTTP 200 after repair, including real React display | 3 after repair; 0 before | One search, one fetch, complete creation section | 14,795 / 1,298 / 16,093 |
| `What fields are required?` | HTTP 200 in the same conversation; correct invoice fields and validation rules | 1 | Reused previous complete evidence after authorization/hash revalidation | 3,654 / 337 / 3,991 |
| `How do I approve a contractor invoice and then record its payment?` | HTTP 200; correctly distinguishes approval from recording actual payment | 3 | One search, one fetch containing both complete workflow sections | 19,420 / 1,906 / 21,326 |
| Additional browser turn during restart | Interrupted after a successful model response proposed a search; no final assistant answer. Included in the shared budget, not counted as a successful end-to-end test. Conversation text is omitted here. | 1 | Search proposed; no completed fetch | 2,323 / 110 / 2,433 |
| `How do I pay an invoice?` | Not run live: request cap reached. Ambiguity behavior passed mocked tests. | 0 | Not attempted live | — |
| `How do I configure quantum teleportation for kitchen inventory?` | Not run live: request cap reached. Unsupported-information behavior passed mocked tests. | 0 | Not attempted live | — |
| `چگونه فاکتور قراردادی ایجاد کنم؟` | Not run live: request cap reached. Unicode/literal multilingual retrieval and RTL UI passed offline checks. DeepSeek multilingual fluency remains unverified. | 0 | Not attempted live | — |

Recorded successful usage totals **40,233 prompt + 3,658 completion = 43,891 tokens**, including the interrupted turn. A monetary estimate was not calculated: a verified current tariff and per-request cache-hit breakdown were not available in the recorded results. No API key, balance or billing credential is included.

The initial network restriction was Windows socket error 10013. Review initially blocked exporting documentation; the user explicitly approved sending indexed operator-guide text to `https://api.deepseek.com`, with at most eight further attempts. The subsequent approved tests transmitted static application documentation and minimized role/context data. The provider had no tools for accessing customer/financial records or modifying business data.

### Evidence and answer accuracy

All successful factual citations resolve to `operator_modules_contractors_services`, with source status `source_verified` and the current build hash. The actual fetched sections were:

- **Create invoice: fields and submission** — creation answer and required-fields follow-up.
- **Review and approve a draft service invoice** — approval portion of the multi-step answer.
- **Record a contractor payment and outstanding balance** — payment fields, constraints and consequences.

Section IDs and content hashes were checked against the index and current authorization. Creation accurately covered the required contractor, optional matching contract, service lines, defaults, initial-payment restrictions and lack of inventory posting. The multi-step answer accurately covered draft approval, payment after actual transfer, non-draft/positive/outstanding-balance validation, partial/full payments, and timeout refresh guidance. No live business records were claimed. Search-before-fetch, signed discovery, completeness checks and citation authorization remain enforced.

## HTTP, UI, persistence and diagnostics

The browser test used the real API hook, Axios client, converted chat workspace and animations, with an existing account's JWT held only in memory. It sent actual socket HTTP requests; no response interception supplied the successful DeepSeek answer. The successful response had conversation/request identifiers, persisted assistant text, current source metadata and status 200. The conversation continued under the same ID for the required-fields follow-up.

The UI immediately displayed user messages, displayed thinking while awaiting HTTP, stopped thinking on completion, revealed the actual answer through the existing typewriter, and displayed its documentation source. History reopened and no uncaught browser errors occurred. [Local verification screenshot](../../artifacts/ai-chat/live-deepseek-response.png).

Retry handling now reconciles persisted history before resubmission when a failed question has a known conversation ID. A response saved by Django but lost in transport is recovered without another POST. A genuine failed turn may be retried after reconciliation; failed history loading blocks submission pending a reload. Regressions exercise these cases. Streaming and interface design were not changed.

The `ai_assistant` logger now emits allowlisted JSON with request/conversation IDs, failure stage, exception category, safe internal code, provider HTTP status, tool/index status, duration, model count and tool count. Index diagnostics include the configured index path and numeric OS errors. Prompts, conversation bodies, credentials, raw provider bodies and auth/discovery tokens are excluded. Client responses retain concise safe errors; integrity failures still fail, rather than returning HTTP 200 error payloads.

## Modified files

| Area | Files |
|---|---|
| Configuration | `backend/backend/backend/settings.py`; private ignored `backend/backend/.env` |
| Index publication and freshness | `knowledge/storage.py`, `repository.py`, `scanner.py`, `gateway.py`, `management/commands/build_knowledge_index.py` |
| Assistant behavior and diagnostics | `ai_assistant/language.py`, `orchestrator.py`, `service.py`, `provider.py`, `errors.py`, new `diagnostics.py` |
| Opt-in live checks | new `ai_assistant/management/commands/smoke_ai_assistant.py` |
| Backend regressions | `knowledge/tests/test_storage.py`, `test_gateway_infrastructure.py`; `ai_assistant/tests/test_api.py`, `test_engine.py`, `test_provider.py` |
| Frontend retry and regressions | `frontend/src/modules/ai/hooks/useAIChat.js`, `frontend/scripts/ai-chat.test.mjs` |
| Instructions/report | `knowledge/README.md`, `knowledge/GATEWAY.md`, `ai_assistant/README.md`, this report |

Paths in the knowledge/assistant rows are relative to `backend/backend`. Generated artifacts and the repaired Windows ACL are local deployment state, ignored by Git. Temporary live-test harnesses/receipts are under ignored `artifacts/`; the temporary frontend live surface was removed after verification.

## Final verification and remaining limits

- `manage.py test ai_assistant knowledge`: **139 passed**, no skips, Django checks clean. Includes Windows ACL publication, original greeting with unavailable index, factual prefix enforcement, source/cache drift, published freshness, search ranking, discovery/fetch authorization, tool calling, history, error diagnostics and provider handling.
- `npm.cmd run test:ai`: **35 passed**, including the three new retry-reconciliation scenarios. Headless Chrome needed execution outside the sandbox for local sockets; all API traffic in this repeatable suite was mocked, with zero provider charges.
- `npm.cmd test`: **44 passed**.
- `npm.cmd run build`: passed; existing large-chunk advisory remains.
- `manage.py check`: no issues. Published index validation passed under the actual Windows runtime account and from both backend/repository working directories.
- `git diff --check`: clean. Build-only sitemap changes were removed.
- `.env` is ignored and has no tracked history. Exact-key scanning found **zero matches across all 13,608 reachable historical Git blobs**, as well as none in tracked HEAD. The key was never copied into frontend files, examples or reports.
- The temporary capped servers were stopped. A normal Django `manage.py runserver` was already running on port 8000, so it was preserved. A final real JWT-authenticated GET on that server returned **200**, with six saved messages and two cited answers in the verified conversation.

**The end-to-end assistant is working for the real greeting, contractor-invoice, follow-up and approval/payment scenarios.** Live ambiguous/unsupported/multilingual generation remains unverified because the user-specified initial request cap was exhausted. Those cases have offline regression coverage; this report does not claim live success for them. The unrelated full business-application backend suite was not rerun; focused assistant/knowledge and frontend suites passed.
