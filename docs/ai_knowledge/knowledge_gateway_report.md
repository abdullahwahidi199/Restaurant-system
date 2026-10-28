# Knowledge Gateway execution report

Implemented and verified on 2026-10-28. The provider-independent gateway exposes `search_documentation` and `fetch_documentation` through an allowlisted Python dispatcher, using the existing Task 2 index. There are no new endpoints, business models, migrations, frontend changes, AI providers or external services.

## Files

Created under `backend/backend/knowledge/`:

| Files | Responsibility |
|---|---|
| `gateway.py`, `errors.py` | Allowlisted tool execution, discovery signing/verification and safe structured errors |
| `search.py`, `ranking.py`, `aliases.json` | Authorized section discovery, capability browsing, weighted lexical relevance and small reviewed aliases |
| `fetch.py` | Exact indexed Markdown, citations, explicit paging and response limits |
| `access.py` | Live Django principal adapter and explicit documentation-read policy |
| `repository.py` | Manifest/artifact invalidation and immutable per-worker snapshot cache |
| `tool_definitions.py`, `validation.py` | Provider-neutral function schemas and bounded runtime validation |
| `management/commands/test_knowledge_gateway.py` | Read-only CLI requiring an existing account ID |
| `tests/gateway_helpers.py` | Controlled test identities and generated-index fixture helpers |
| `tests/test_gateway_access.py` | Principal and document-policy tests |
| `tests/test_gateway_fetch.py` | Discovery, exact content, paging and rejection tests |
| `tests/test_gateway_infrastructure.py` | Cache, integrity, Unicode, CLI and safe-failure tests |
| `tests/test_gateway_search.py` | Actual repository retrieval, ranking, browsing and access filtering |
| `GATEWAY.md` | Invocation, weighting, policy evidence, tokens, deployment and limitations |

Also created this report. Modified `knowledge/loader.py` to expose defensive catalog/section enumeration and a build-version property, and to verify the manifest build checksum. Modified `knowledge/README.md` to link the gateway guide. The indexer was reused; its scanner, schemas, section extraction and capability generator were not rebuilt.

All **328 original operator Markdown files still match their indexed raw-byte hashes**. The existing generated index remains at build hash:

```text
6f1885a21a3976b1f321c7c955bc20a663acce30c71a518e5227dcc4a9a0cbae
```

## Retrieval method

Search uses weighted, length-normalized TF-IDF over section headings, titles, module names, descriptions, keywords, capability labels and indexed content. Base field weights are **12, 7, 6, 4, 6, 9, 1.5**, respectively. Original query terms have weight 1, topic hints 0.55 and verified lexical expansions 0.4. Exact IDs, whole titles/headings and phrase matches receive defined bonuses. Category multipliers favor operator instructions; validation intent raises eligible backend/form/troubleshooting references. Heading-only sections are downweighted. Repeated content terms saturate. Scores are raw relevance units, not confidence percentages.

Module hints add 4 to existing matching candidates and related-module hints add 1; ranked search still considers every authorized module. Bounded one-hop related-document support adds at most 4. Query/topic/alias/content discovery runs in a bounded pass without recursive expansion. Ambiguous queries can receive candidates from multiple near-scoring business modules; normal results are limited to two sections per document. Tie breaks and browse pagination are deterministic. Exact weights, formula and diversity ordering are in [the developer guide](../../backend/backend/knowledge/GATEWAY.md).

Browse mode lists authorized modules, capability procedures and other indexed sections. It also exposes authorized form-only module context, such as order entry for Call_operator. Unknown/inaccessible modules share empty-result behavior. No matches produce an explicit empty result and authorized discovery options, never an invented ID or substituted procedure.

## Security

The gateway reloads the authenticated Django user and staff context on every operation. It checks account/staff activation, supported real role, restaurant/subscription validity through `IsRestaurantActive`, saved active branch ownership/activation, `Staff.get_available_branches()` and `Staff.can_access_branch()`. No branch assignment or mutation helper runs. Relevant real activity permissions are checked through `CanMonitorUserActivity` and `CanRevokeUserSessions`.

The explicit policy in `access.py` maps reviewed document IDs to allowed roles, using inspected backend permission classes/decorators and mounted guide boundaries. It is independent of model-supplied query/module/topic hints and documentation role labels. Empty/generic/unknown roles do not grant broad access. BranchAdmin cannot read the cross-branch transfer guide. Mixed audit/session material requires the relevant actual permissions. Technical references are restricted to actual active Django superusers pending finer-grained policy review. A staff `SuperAdmin` label alone is insufficient. QA, index, inactive, unmounted and unverified documents are excluded from gateway retrieval.

Search tokens are Django-signed with a dedicated salt and a **300-second** lifetime. They bind the discovered document/section pairs to the principal's user/staff/restaurant/branch/role/permission context, documentation policy version and index build hash. Fetch verifies the signature, age, binding, index version and selection, then rechecks document policy. Tokens work across worker instances sharing Django signing settings, with no database or Redis discovery state. Missing, altered, expired, cross-user/context, stale and undiscovered fetches are rejected.

Fetch accepts 1–5 sections, exact IDs and bounded character offsets. It returns exact Markdown slices, heading context, source-relative citations, status and availability. Pages default to 8,000 characters and are capped at 12,000 per section, with a 64,000-byte total UTF-8 JSON response bound. Partial sections carry an explicit notice, range and continuation offset; paging tests reassemble the original source exactly. Oversized responses fail with a safe error. Retrieved content is labeled untrusted reference material and is never executed.

## Commands and results

Actual commands executed from `Restaurant-system/backend/backend`:

```powershell
& venv/Scripts/python.exe -m unittest knowledge.tests.test_gateway_search knowledge.tests.test_gateway_fetch -v
& venv/Scripts/python.exe -m unittest knowledge.tests.test_gateway_access knowledge.tests.test_gateway_search -v
& venv/Scripts/python.exe -m unittest discover -s knowledge/tests -v
& venv/Scripts/python.exe manage.py test knowledge --verbosity 2
& venv/Scripts/python.exe manage.py test_knowledge_gateway --help
& venv/Scripts/python.exe manage.py build_knowledge_index --check
```

From the repository root, `git diff --check` passed; Git noted the repository's normal LF-to-CRLF working-copy conversion for the two modified files. Inspection/verification also used `rg`, source reads and local Python harnesses. No external AI calls, network search, migrations or production record changes were performed.

Final direct-unittest run: **66 tests passed, no skips** (9.833 seconds). Final Django runner: **66 tests passed, no skips** (10.222 seconds), **unused default database setup skipped**, and **system check identified no issues (0 silenced)**. These totals include the original 28 indexing tests plus 38 gateway tests.

The index check confirmed **328 documents, 3,467 sections, 22 capability modules, zero metadata errors, zero unresolved references, zero exclusions and 132 existing warnings**. It wrote no index files. Existing warnings concern role metadata, verification limitations and large sections, as recorded in the [indexing report](knowledge_indexing_report.md).

The final Python harness, using a controlled Admin principal and the actual generated index, executed:

```text
Question: How do I pay a contractor invoice?
First document: operator_modules_contractors_services
First heading: Record a contractor payment and outstanding balance
Raw relevance score: 264.453839
Fetched characters: 1102
Fetched content equals the indexed section: true
```

The same harness confirmed that **How do I pay someone?** returned supplier procurement, customer billing, contractor payment and a salary workflow among its five candidates. Changing the principal to Waiter rejected the old discovery token with `discovery_invalid`. A hash comparison confirmed all 328 source Markdown byte hashes remained unchanged.

Tests verify contractor payments, supplier purchase invoices, cashier settlement, attendance, menu creation, kitchen preparation, reservations, stock adjustments, discount approval, navigation, required fields and troubleshooting against real indexed sections. They also cover exact titles/IDs/phrases, synonyms without erasing payment domains, wrong module/topic hints, deterministic ranks, repetitive content, authorized module browsing, denied previews, actual Dari/Pashto literals, Unicode round trips, token integrity/expiry/user binding, permission/context changes, index generation changes, immutable cache integrity, arbitrary-path rejection, unknown tools, schema bounds, multi-section fetches, paging, response limits, defensive result copies, and independent worker instances.

## Remaining limits and manual checks

- The CLI help and controlled account-fixture search/fetch execution were tested. No live production account was selected. Principal tests exercised actual permission classes with mocked account/branch lookup results. Production database relations, real staff assignments and live session revocation were not exercised end to end.
- The future HTTP/orchestration caller must run existing authentication, including managed-session validation, before passing `request.user`. The gateway does not authenticate raw JWTs or provide a public API. Live authentication integration belongs to that later layer.
- Granular access to 227 interface and 46 backend reference documents remains conservative: superusers only, with unverified/unmounted records still excluded. Custom roles, broad mixed-role technical access, and new document IDs require explicit review. Some mixed-role instruction guides are deliberately restricted to narrower role sets; reading a guide does not authorize every business action it describes.
- Lexical retrieval supports matching available English, Dari and Pashto words and verified aliases. It does not provide cross-language semantic equivalence, unrestricted paraphrase understanding or Arabic/Persian spelling normalization. An English-only instruction may not match a translated question.
- Raw Markdown edits need an explicit index rebuild. Snapshot/token version changes and missing/corrupt artifacts are detected; unindexed source changes are not rescanned per query. Production documentation mounts, shared signing configuration and filesystem publication behavior still require deployment verification.
- Source documentation retains its existing runtime/manual ambiguities. Indexing/retrieval tests do not certify restaurant workflows, printers, payment collection or third-party messaging.

No DeepSeek integration, chatbot UI, conversation history, embeddings, analytics tools or AI answer generation was added.
