# Knowledge Gateway

The gateway exposes two provider-independent Python tools, `search_documentation` and `fetch_documentation`, using the [existing generated index](README.md). It has no HTTP endpoints, model calls, embeddings, migrations or restaurant mutations. Reuse one `KnowledgeGateway` instance per worker; it lazily loads a complete index and prepares lexical records once per index version.

## Invocation

The application must authenticate the execution context before dispatch, using the existing Django/DRF authentication layer. In particular, `users.authentication.SessionJWTAuthentication` owns managed-session expiry/revocation checks. Never take a user, role, branch, restaurant or principal resolver from model arguments.

```python
from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway
from knowledge.tool_definitions import get_tool_definitions

gateway = KnowledgeGateway()  # settings.KNOWLEDGE_INDEX_ROOT; reuse per worker
definitions = get_tool_definitions()

try:
    found = gateway.execute(
        name="search_documentation",
        arguments={"query": "How do I pay a contractor invoice?", "limit": 5},
        user=request.user,  # already authenticated by the application
    )
    if found["results"]:
        candidate = found["results"][0]
        fetched = gateway.execute(
            name="fetch_documentation",
            arguments={
                "search_token": found["search_token"],
                "sections": [{"document_id": candidate["document_id"],
                              "section_id": candidate["section_id"]}],
            },
            user=request.user,
        )
except GatewayError as exc:
    safe_tool_error = exc.as_result()
```

Convenience methods `gateway.search_documentation(user=..., **arguments)` and `gateway.fetch_documentation(user=..., **arguments)` use the same dispatcher and validation. Unknown tools and unexpected argument fields fail. Definitions are plain `{name, description, parameters}` JSON-schema-compatible dictionaries. The future DeepSeek adapter can wrap each definition in its provider envelope and dispatch returned calls by name. It must pass the original user question in `query`, inject the authenticated execution context separately, handle safe errors, and treat returned Markdown as reference material. Model conversation handling, retries, prompt isolation and answer generation belong to that later adapter.

## Search, browsing and bounded discovery

Ranked search accepts a nonblank `query` up to 512 Unicode characters, optional module hint, up to 8 topic strings of 64 characters each, and `limit` from 1 to 15 (default 5). A query never requires an exact identifier. Search returns real indexed IDs, heading context, source-derived description prefixes, document classification/status, rank and raw relevance score. It does not return section bodies. Original query text is returned unchanged.

`mode: "browse"` allows an omitted query. Without a module, it lists authorized modules and gives no discovery token. With a module, it lists authorized sections, capability sections first, then operator-guidance records, document ID and section order. `offset` / `next_offset` pages this deterministic listing; offset is bounded to 10,000. A module in ranked mode is a hint; in browse mode it defines the requested listing. An unknown or inaccessible module returns the same empty listing behavior.

Capability names/section IDs come from Task 2's evidence-backed map. The gateway filters capabilities, primary documents, workflow links and related modules before exposing them. `module_context` includes authorized `documents`, `primary_documents`, `capabilities`, `workflows` and `related_modules`; `available_modules` is a compact list of names and source descriptions. Modules with accessible forms but restricted primary guides remain discoverable, such as order entry for Call_operator. General navigation/workflow/role/form collections can also be browsed. Technical component names do not become standalone business modules.

The search runs a bounded pass across all authorized sections and fields, with lexical aliases, capability labels and one-hop related-document support. Broad content/title/description matches remain available when headings do not match. There is no recursive expansion or hard module filter in ranked search. A wrong module hint cannot eliminate a correct result elsewhere. Topic hints augment the original question with smaller term weights. No matches produce an empty result, explanation and authorized module choices; no unrelated procedure is silently substituted.

## Ranking definition

`ranking.py` uses weighted, length-normalized TF-IDF. Scores are retrieval units, not probabilities or confidence percentages. For the current principal's visible sections:

```text
idf(term) = 1 + log((visible_section_count + 1) / (visible_frequency(term) + 1))
field_term_score = field_weight * query_weight * idf(term)
                   * (2.2 * tf / (tf + 1.2 * (0.25 + 0.75 * field_length / average_field_length)))
```

Document frequency, field averages and relation support use authorized records. Query terms are deduplicated; repeated content terms saturate and long fields are normalized. Query weights are 1.0 for original terms, 0.55 for additional topics and 0.4 for alias expansions. `aliases.json` is a small reviewed equivalence list: bill/invoice, pay/settle/payment, employee/staff, a few operator actions/plurals, and dining/restaurant table phrases. It does not translate languages or equate supplier, customer, contractor and salary domains. Distinct domain words in the question continue to contribute independently.

| Field | Weight |
|---|---:|
| Section heading | 12 |
| Capability label attached to its evidence section | 9 |
| Document title | 7 |
| Module ID/name | 6 |
| Keywords | 6 |
| Description | 4 |
| Section content | 3 |

Quoted exact phrases, or the normalized multiword query, add substring bonuses: heading 30, title 22, capability 16, description 6, content 2. Exact document ID adds 120, exact section ID 160, exact whole document title 80 and exact whole heading 90. These are casefold/NFC matches. Generic English question/stop words are removed from term matching; Dari/Pashto words are not subjected to English stemming. Punctuation separates terms; Unicode letters/marks remain in returned source text. No aggressive Arabic/Persian character folding is performed.

Category multipliers: operator guide 1.35, workflow/form reference 1.25, troubleshooting 1.2, role guide 1.0, navigation 0.85, interface reference 0.65, backend reference 0.55. Validation intent words (`validation`, `invalid`, `reject`, `rejected`, `server`, `serializer`, `required`, `error`, `errors`) multiply backend references by 2.4 and form/troubleshooting records by 1.3. Technical references still require authorization. Heading-only sections receive a 0.3 multiplier so a title-only section does not crowd out actual procedures.

A section-local coverage factor (`0.45 + 0.55 * coverage`) downweights matches that occur only in inherited document metadata. Coverage is the weighted IDF mass matched in the heading/content/capability divided by mass matched anywhere in that record. This distinguishes a guide's actual procedure from another section sharing its title and keywords. Task 5 added verified English variants such as dish/item, part/partial, preparing/preparation and failure/failed, plus timeout/sign-in phrase variants; native-language semantic equivalence is not implied.

A matching module hint adds 4, or a related-module match adds 1, only to an already matching candidate. One-hop related-document support adds at most 4 (`0.06 * best related document score`). Candidates sort by descending score, document ID, section position and section ID. At most three sections per document fill the normal result list, so a third validation section is not silently excluded. For ambiguous queries without a module hint or distinctive module/capability term, the best raw candidate is retained first, then up to five near-scoring business modules contribute diverse candidates before remaining positions fill. This diversity ordering helps distinguish payment domains; later ranks can differ from raw score order. Browse results use their explicit browse order, with score zero. The method label is `weighted_length_normalized_tfidf_v2`; tool arguments and response fields are unchanged. See the [frozen evaluation](../../../docs/ai_knowledge/evaluation/evaluation_report.md) for gains, regressions and unresolved exact-section misses.

## Authentication and documentation policy

`access.resolve_principal` reloads the current Django user and staff/restaurant/active branch on **every call**, independent of discovery tokens and frontmatter. It requires an authenticated, active Django account. Ordinary accounts must have an Active staff record, a supported staff role, restaurant context, and an active restaurant/subscription using the real `restaurants.permissions.IsRestaurantActive`. The saved active branch must be active, belong to that restaurant, appear in `Staff.get_available_branches()` and pass `Staff.can_access_branch()`. These are read-only checks; gateway execution does not auto-select a branch or invoke assignment/save helpers. The CLI/future caller must select branch context through the existing application first.

An actual active Django superuser can read all verified, available non-QA documentation, including technical references and platform administration. A staff role label `SuperAdmin` does not grant that status. Custom roles, Other/DeliveryBoy, customers and ambiguous new roles are denied until explicitly reviewed. Unavailable, unmounted, inactive, QA, index and unverified documents are excluded even for superusers. Existing documentation roles remain descriptive metadata, not authorization grants.

`access.DOCUMENT_ROLES` is the explicit reviewed **documentation-read** mapping. It grants no business operation and does not imply every action in a mixed guide is available to its reader. Mixed handoff guides retain their own per-action role caveats and actual text. All unknown document IDs fail closed for ordinary users, including those with empty or apparently matching role metadata. Policy changes should update `POLICY_VERSION` and tests.

| Guidance | Allowed ordinary roles / conservative restriction | Inspected implementation evidence |
|---|---|---|
| Contractors | Admin, BranchAdmin, FinanceManager; API-only InventoryManager/OperationsManager not included | `contractors.views.CONTRACTOR_PERMISSIONS`; documented mounted workspace routes |
| Procurement, supplier payments, expenses | Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager | `inventory.views.purchase_invoice_list_create`, `supplier_payment_list_create`; `expenses.views` permission classes |
| Payroll and financial obligations | Admin, BranchAdmin, FinanceManager | Payroll/salary/advance decorators in `users.views`; broad financial handoff restricted because it combines domains |
| Staff records | Admin, BranchAdmin | Staff creation/edit route plus `users.views` staff permissions; stricter than some list APIs |
| Attendance/shifts | Admin, BranchAdmin, OperationsManager | `users.views` shift/attendance decorators |
| Menu management, stations, stock guide | Admin, BranchAdmin, InventoryManager, OperationsManager | `menu.views.CanReadOrManageMenu.write_roles`; `inventory.views` management permissions; mixed management guides exclude read-only roles |
| Transfers | Admin, InventoryManager, OperationsManager | `inventory.views.stock_transfer_list_create`, `stock_transfer_action` explicitly reject BranchAdmin; FinanceManager lacks mounted inventory route |
| Production | Admin, BranchAdmin, InventoryManager, OperationsManager, Kitchen_manager | `menu.views` daily-production decorators |
| Kitchen | Admin, BranchAdmin, Kitchen_manager | `orders.views` kitchen preparation permissions |
| Cashier | Admin, BranchAdmin, Cashier | Cashier/settlement decorators in `orders.views`; guide describes exact conditional UI |
| Order lists / waiter tables / entry form | Admin/BranchAdmin plus Manager; Waiter for tables/entry; Cashier/Call_operator for entry only | `orders.views` order/table decorators; actual role portals and `forms/order_entry.md` |
| Reservations, discount requests/cards | Admin, BranchAdmin, Manager, Cashier | Corresponding `orders.views` permission decorators; guide-specific UI limitations preserved |
| Table setup | Admin, BranchAdmin, OperationsManager | `orders.views.table_list_create`; mounted setup roles |
| Branch administration | Admin only | `restaurants.permissions.IsRestaurantOwnerOrAdmin`; BranchAdmin route restriction |
| Settings, feedback, dashboard, reports | Admin, BranchAdmin | `restaurants.views`, `menu.views`, mounted administrator portal; report guide only covers controls |
| Audit/session mixed guide | Admin/BranchAdmin with both real monitor and revoke permissions | `audit.views.ProductionMovementListView`; `users.permissions.CanMonitorUserActivity`, `CanRevokeUserSessions`; BranchAdmin normally cannot revoke |
| Shared onboarding/common controls | Supported login roles | `users.models.Staff` roles, read-only `Staff` branch helpers, inspected staff portal navigation; explicitly shared educational context |
| Role guides and cross-module workflows | Explicit ID mapping; own role or constrained participant set; mixed specialist/form/troubleshooting directories restricted to administrators | Existing workflow guide role boundaries and the corresponding backend modules above |
| Technical references | Superusers only pending finer-grained review | Conservative policy for 227 interface/46 backend references; avoids granting broad technical access from empty/generic roles |

Source guides contain cross-role context and links to technical references. Authorized guide text is returned intact; its links do not authorize fetching the linked document. Fine-grained technical, custom-role and mixed-guide expansion remains a policy review task. This is deliberately narrower than some backend read APIs. Missing policy is a denial, not a prompt to guess a permission.

## Enforced search before fetch

Nonempty search results issue a Django-signed, timestamped discovery token with a 300-second lifetime. The signed payload contains a format version, principal binding digest, index build hash and only the returned `(document_id, section_id)` pairs. It is signed with Django's configured signing secret/fallback keys and the dedicated `pakhlai.knowledge.discovery.v1` salt. Tokens are integrity-protected, not encrypted; the IDs were already returned by search. No Redis/database discovery table is used.

The principal binding covers user/staff/restaurant/branch, actual role, superuser status, relevant monitor/revoke permissions and documentation policy version. Fetch reloads the account/context and rechecks policy. Missing, altered, expired, cross-user/context, stale-version, undiscovered, unknown, mismatched or forbidden selections are rejected. A correctly signed token never grants permission independently. Multiple selected sections or later pages may use the same valid token. A new search can authorize additional sections; exact IDs may also be searched subject to the same policy.

Workers using the same signing settings can consume each other's tokens. There is no shared in-memory session requirement. Changing branch/role/restaurant/permissions requires fresh discovery. Authentication/session validity remains the outer application's responsibility; the gateway does not accept or authenticate raw JWTs itself.

## Fetch limits and safe source handling

Fetch accepts 1–5 unique section selections per call, with exact IDs and optional Unicode-character `offset`. `max_characters` defaults to 8,000 and is bounded to 1–12,000 per section. The complete serialized UTF-8 response is bounded to 64,000 bytes; an oversized response fails with a safe error and asks for fewer sections or a smaller page size.

Content is an exact slice of indexed Markdown. Every result includes heading hierarchy, source-relative path, source references, availability, verification status and the original full section's content hash. It also includes `content_range: {start, end, total, unit}`, `is_partial`, `next_offset` and an explicit partial-source warning. Continue the same discovered section at `next_offset` until it is null, retaining earlier pages. Last pages with nonzero starting offsets remain marked partial because they are only one part of the source section. Reassemble all pages before relying on a procedure; a page may cut across a table, code block or validation explanation. Source wording is never summarized or silently trimmed to fit.

Retrieved content is labeled `untrusted_reference_material`. No command, link, embedded instruction or code example in Markdown is executed or fetched by the gateway. The future orchestrator must prevent that material from overriding its higher-priority instructions.

## Refresh, errors and tests

`IndexRepository` reads the small atomic manifest and checks the three immutable artifact stat fingerprints on each operation. It loads/validates the complete snapshot on change and retains an in-process snapshot otherwise. `SearchEngine` prepares and caches lexical records on first authorized use, bounded by the immutable section registry. An ordinary worker does not tokenize every technical/unmounted/QA section at first use. Later queries still filter authorization before using cached records. The existing loader also verifies the manifest's build checksum. Missing/corrupt artifacts fail closed even after a previous successful cache load. A changed build hash invalidates existing discovery tokens. When the configured Markdown tree is present, the repository checks the same eligible file set and file stat fingerprints. It hashes source/curation bytes only when those fingerprints or the snapshot change; it never reparses or rebuilds the index on a question. Unchanged bytes (including a timestamp-only touch) remain valid. Added, removed or changed source/curation bytes fail closed until an explicit rebuild. Snapshot-only deployments remain supported when sources are not packaged. Structured logs include the index path, error category and safe integrity reason.

Safe errors are `GatewayError` instances with `.code`, `.message`, `.as_result()`. Examples include `invalid_arguments`, `unknown_tool`, `authentication_required`, `access_denied`, `restaurant_unavailable`, `branch_required`, `authorization_unavailable`, `index_unavailable`, `discovery_invalid`, `discovery_expired`, `discovery_stale`, `section_not_available`, `invalid_offset`, `response_too_large`. Unknown/forbidden/undiscovered section selections share the same message. Private OS/database error details are not returned.

From `Restaurant-system/backend/backend`:

```powershell
& venv/Scripts/python.exe manage.py build_knowledge_index --check
& venv/Scripts/python.exe manage.py build_knowledge_index
& venv/Scripts/python.exe -m unittest discover -s knowledge/tests -v
& venv/Scripts/python.exe manage.py test knowledge --verbosity 2
& venv/Scripts/python.exe manage.py test_knowledge_gateway --help
```

Use the read-only CLI with an existing account that is authorized for the selected guidance:

```powershell
python manage.py test_knowledge_gateway --user-id <existing-account-id> --query "How do I pay a contractor invoice?"
python manage.py test_knowledge_gateway --user-id <existing-account-id> --browse --module payroll
```

These last two commands are templates requiring an actual account ID and database availability. They do not offer a role, branch, superuser or authorization bypass flag. The CLI displays query, ranked IDs/titles/descriptions, fetch success and a 400-character partial preview; it does not print signing tokens or account details. Tests exercise its dispatch with controlled account/storage fixtures. Repository tests use the generated Task 2 index; rebuild before testing. They explicitly skip if that artifact directory is absent, so deployment CI should build first and check for skips.

Known limits: lexical search matches available words/aliases, not arbitrary paraphrases or cross-language semantics. Actual Dari/Pashto literals and Unicode round trips are tested; a Dari/Pashto question cannot reliably discover an English-only explanation without overlapping indexed terms. No Arabic/Persian spelling-variant equivalence or language-wide stemming is claimed. New policy IDs/technical scope require review. Source availability is documentation verification, not runtime certification. See the [execution report](../../../docs/ai_knowledge/knowledge_gateway_report.md) for actual commands, tests and remaining deployment/authentication checks.
