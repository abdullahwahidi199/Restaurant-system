# Restaurant Business Analyst — Stage 0

This app is independent of `ai_assistant` (Operator Mentor). It reuses only the
DeepSeek transport/completion records, model configuration, safe service exception
and existing authenticated staff principal resolver. It never uses or rebuilds
the Mentor knowledge index.

## Execution

Every model request includes a compact Business Capability Map derived from the
compact Admin pack catalog and the authoritative backend registry. The model
selects known document IDs and registered tools in one `retrieve_business_context`
call. The executor fetches exact documents and dispatches validated tools; the
second model call interprets these results. No search/discovery call is needed.
Additional retrieval is bounded to three rounds and five model requests by default.
No production business-data tools are registered in Stage 0.

The catalog contains only `schema_version`, `id` and `domains`; domains contain
`id`, a short `description`, `documents` and `tools`. Document entries contain
only `id`, `title` and a concise selection `description`. All 78 IDs, titles and
domain mappings are preserved; business definitions stay in the verified documents.
`documents.py` derives `docs/<document_id>.md` from each validated stable ID,
confining resolved paths to the configured pack's `docs/` directory. No file path
or cross-reference is needed in the map. It returns exact UTF-8 content,
including frontmatter/newlines, title, ID, SHA-256, source references, status and
authority identity. Missing/corrupt files and oversized documents produce safe
operation errors; documents are never silently truncated. All 78 current Admin
documents are tested against their original bytes.

Backend document visibility allows active, correctly scoped `Admin` and
`BranchAdmin` staff. Branch migration and branch administration guides are
Admin-only. Other roles are denied access to these Admin guides. This conservative
policy lives in `documents.py`; empty YAML `roles` and descriptions grant nothing.
Reading a definition never authorizes the actions/records discussed in it.

## API

Existing Django/DRF `SessionJWTAuthentication`, including managed-session
revocation, authenticates all routes. No separate credentials or scope mechanism
is introduced.

- `POST /api/business-analyst/chat/`: `message`, optional `conversation_id`, `model`
  and `reasoning_effort` (the shared existing model/effort allowlists).
- `GET /api/business-analyst/conversations/?page=0`: 20 conversations per page.
- `GET /api/business-analyst/conversations/<uuid>/messages/?page=0`: 40 messages.

Other chat fields are rejected, including restaurant/branch/role/permission/tool
overrides. Responses contain `conversation_id`, `request_id` and `message` with
content, kind, state and backend-verified sources. All API responses disable caching.

Conversations bind to owner, restaurant, active branch and authorization policy.
Conditional expiring turn leases serialize replies across workers. Failed turns
retain a failed user message and safe error code; they do not create an assistant
answer. Lease recovery marks interrupted turns failed. History is bounded; stale
document references are redacted. Past tool observations are withheld from replay
and require fresh retrieval. Mentor conversations use entirely different tables.

## Batch contract

The internal model function (not a public arbitrary execution endpoint) accepts:

```json
{
  "document_ids": ["admin_dashboard_sales_meaning", "admin_dashboard_sales_trend"],
  "tools": []
}
```

A future registered tool entry has the shape below. This is a schema illustration,
not an available production capability:

```json
{
  "invocation_id": "unique-within-turn",
  "tool_id": "registered.stable_id",
  "parameters": {"contract_defined_parameter": "value"}
}
```

The response is `{"batch_id":"b1","results":[...]}`. Each result has
`evidence_id` (`b1:0`), `kind` (`document` or `tool`), `id` and `ok`, plus either
`data` or `error: {code, message}`. Tools return their ID, invocation ID, associated
knowledge IDs, execution timestamp and contracted `output`. Document results carry
their exact content and provenance. Invalid outer envelopes return a batch error
and an empty results list. Otherwise each operation has its own outcome.

Final model JSON uses `kind` (`answer`, `clarification`, `limitation`), `content`
and `citations` (successful evidence IDs from this turn). Answers require citations;
forged/failed citations are rejected and one repair is permitted. The backend
derives source metadata rather than trusting model source claims and revalidates
document provenance and current user context before persistence. Citation identity
checks cannot prove semantic entailment; response quality still needs evaluation.

## Registering a future tool

Only reviewed server code can construct `ToolDefinition` and add it to
`production_registry()`. A definition must provide unique ID, description, domain,
closed typed JSON parameter schema, output JSON schema, existing knowledge IDs,
an `authorize(context, parameters)` callback, handler, timeout and `read_only=True`.
Schemas validate required/optional values, nested objects/arrays, defaults, types,
enums and numeric/string/array constraints. No remote schema references are allowed.
Parameter schemas cannot accept authorization scope fields. Registries copy their
contracts and freeze before execution; IDs never drive Python imports or `eval`.
For a registered ID, runtime map entries retain declared selection metadata while
the registry supplies the authoritative description, parameter/output contracts
and knowledge IDs. An entry in the JSON map alone never registers a handler or
advertises an unimplemented tool. Complete tool contracts accompany every model
request, alongside the full visible document catalog, without a registry-fetch call.

Authorization callbacks return exactly `True` to allow an operation. Otherwise the
executor returns `PERMISSION_DENIED`. A handler can raise `OperationError` for safe
structured failures. Unexpected exceptions are sanitized. Tool handlers receive
immutable trusted context; they must filter queries by its restaurant/branch and
enforce operation/record permissions themselves. `require_record_scope(record)`
helps check records against the active branch. Scope is active-branch-only even
for an Admin. Context is reloaded before each operation; drift fails closed.

Tools run inside independent database savepoints with a SELECT-only SQL guard on
Django connections. Writes, DDL, stacked statements, SELECT INTO and locking reads
are blocked. This is defense in depth for trusted handlers, not a sandbox for
arbitrary Python or side-effecting SQL functions. Handlers must not open raw
connections, use side-effecting SQL functions, write files or make mutating network
calls. No AI SQL/ORM/Python capability is exposed.

Default limits: 16 operations/batch, 32/turn, 32 KB/document, 40 KB/result,
140 KB/batch, 200 KB cumulative evidence, 320 KB model context, 32 KB arguments,
5 seconds/operation, 20 seconds/provider phase and 90 seconds/engine turn. Provider
transport timeouts and deadline checks apply. Tool deadlines are cooperative,
checked before/after handlers and SQL; they cannot forcibly terminate hung Python,
an in-flight query or a blocking filesystem operation. Future handlers must use
bounded queries and I/O timeouts from `ToolContext.deadline`. Hard cancellation,
if required for Stage 1, needs an isolated worker and database statement timeouts.

`TurnAudit` and ordered `AuditEvent` records retain trusted conversation scope,
model configuration/call counts, operation outcomes, durations, sizes and document
provenance. Raw prompts, provider reasoning, parameters, tool bodies and secrets
are excluded. Chat content resides only in the scoped conversation message tables.
There is no public audit endpoint. Retention remains a deployment policy decision.

## Configuration and verification

`BUSINESS_ANALYST_KNOWLEDGE_ROOT` must point to the pack directory containing
`business_ai_capability_map.json` and `docs/`. `BUSINESS_ANALYST_THROTTLE_RATE`
defaults to `10/min`. `BUSINESS_ANALYST_LIMITS` accepts validated overrides for the
fields in `config.Limits`; it is independent of `AI_ASSISTANT_LIMITS`.
DeepSeek environment settings and model/reasoning choices are reused unchanged.

From `backend/backend`, after normal deployment review:

```powershell
& .\venv\Scripts\python.exe manage.py migrate business_analyst
```

The implementation task generates the migration and runs it only in temporary
test databases. It does not migrate the workspace or deployment database.

```powershell
& .\venv\Scripts\python.exe manage.py test business_analyst ai_assistant knowledge --settings=business_analyst.tests.settings
& .\venv\Scripts\python.exe manage.py test --settings=business_analyst.tests.settings
& .\venv\Scripts\python.exe manage.py makemigrations business_analyst --check --dry-run --settings=business_analyst.tests.settings
```

These explicit test settings use an in-memory SQLite database, local-memory cache,
in-memory channels, temporary media and no provider credential. Tests include real
Admin document bytes, synthetic authorized staff profiles, tool/record scope checks,
mocked DeepSeek HTTP transport and Mentor endpoint/conversation regression coverage.
No frontend, embeddings, vector database or Stage 1 data tool is included.

On Windows, existing Mentor tests also depend on pinned raw-byte checksums in the
operator corpus/evaluation dataset. `core.autocrlf=true` can invalidate those
checksums. Use an isolated copy exported with `git -c core.autocrlf=false archive`
and build the existing operator index there for regression verification. Do not
change frozen checksums or verified knowledge to hide line-ending drift. See the
Stage 0 report for the actual runs and reproduced unrelated timestamp failures.
