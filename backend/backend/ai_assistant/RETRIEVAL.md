# Retrieval modes and rollback

The default is `AI_RETRIEVAL_MODE=legacy`. Development can opt into
`AI_RETRIEVAL_MODE=auto_fetch`; restart Django workers after configuration changes.
Rollback requires only setting the mode back to `legacy` and restarting workers.
No migration, frontend change, index rebuild or documentation edit is required.

```dotenv
AI_RETRIEVAL_MODE=auto_fetch
AI_AUTO_FETCH_MAX_SECTIONS=3
AI_AUTO_FETCH_MAX_DOCUMENTS=2
AI_AUTO_FETCH_EVIDENCE_BYTES=18000
AI_SEARCH_RESULT_BYTES=12000
```

These limits further restrict the existing assistant limits; they do not raise
model, tool, context or evidence limits. Automatic sections/documents/Markdown
bytes are bounded across the turn, and the returned evidence envelope must also
fit the evidence-byte budget. Up to five automatic sections/documents and byte
budgets between 512 and 64,000 are supported. Configuration errors fail closed.
The search budget applies to compact candidate results in auto-fetch mode;
successful evidence results use the evidence budget. Full explicit fetching
retains its existing paging and budget rules.

## Selection policy

`retrieval.py` examines only candidates from the existing ranked gateway search.
It does not search files, build another index or ask a classifier model.
For ranked searches in auto-fetch mode, an omitted model `limit` defaults to 15
candidates rather than the gateway's legacy default of 5. Explicit model limits
are preserved. This widens discovery without changing ranking, authorization or
the evidence-selection policy; the compact/evidence budgets still bound what is
sent to the model. A live trace showed the correct staff overview at rank eight
when attendance topic hints occupied the first five results.

1. The original English question must identify exactly one domain through
   distinctive primary-guide module/keyword terms. Shared terms such as invoice
   cannot select a business domain. Model module/topic hints do not qualify a
   question, even when they affect the existing search ordering.
2. A short overview can select a unique discovered introductory section, such
   as the staff guide's **Page and authority** section. Heading-only sections do
   not count as evidence.
3. A direct task needs all substantive original terms supported in local section
   text, a matching heading/intent, and a verified available primary guide. Its
   score must be at least 72% of the best candidate's lexical score. A competing
   eligible procedure within 15% triggers fallback. These are conservative
   relative comparisons, not calibrated confidence probabilities.
4. One procedure is selected, with discovered navigation from the same guide
   when available. This never means blindly selecting the first three results.
5. Troubleshooting, compound actions, broad teaching requests, untranslated
   Dari/Pashto questions, competing domains, weak/local mismatches, unavailable
   primary guides, partial content and exceeded budgets retain explicit model
   selection. Multilingual translation hints remain supported by normal search.

No section content is shortened to fit. If complete evidence or its provenance
cannot fit, ranked candidates go back to the model for normal explicit fetching.
Fallback may ask for clarification, search again or fetch; it does not force an
unsupported answer. A bounded search payload reports omitted candidates so the
model can refine/browse. Exact identifiers and discovery handles remain intact.

## Authorization, state and audit

Automatic fetching calls the same `KnowledgeGateway.execute` with the original
signed token issued by that search. The ordinary gateway re-resolves identity,
role/branch scope, policy, discovered pairs and index version. The orchestrator
checks context/version again after internal fetching. There is no privileged
path, fabricated discovery token or path-based lookup.

Complete sections are staged and hashed before making them eligible for citations.
Oversized/partial fetch results cannot create unseen citable evidence. Successful
automatic search results include actual Markdown/provenance,
`evidence_available=true`, and complete citation candidates. They omit the
redundant candidate list and discovery data. State moves directly from
`SEARCH_REQUIRED` to `EVIDENCE_AVAILABLE`, with `tool_choice=auto` on the next
model request. Normal final/schema/citation validation still runs. Another search
is allowed for missing support. Legacy transitions and revalidated prior evidence
reuse remain available.

SuperAdmin sees the actual ranked `gateway_result`, a separate automatic
`fetch_documentation` tool call/result with timing, and the subsequent model
request. `automatic=true` distinguishes backend-dispatched calls from model
requests. Actual fetch attempts count toward the existing tool limit. A
`retrieval_selection` event records `legacy` (context/turn metrics), `auto_fetch`
or `auto_fetch_fallback`, plus a concise reason for the latter two. Failed internal
fetches produce actual failure events; declines before execution do not fabricate
fetch events. Existing encrypted payload storage, redaction and SuperAdmin access
controls apply. No reasoning or credentials are added to logs.

## Reproduce offline comparison

From `backend/backend`:

```powershell
.\venv\Scripts\python.exe manage.py test ai_assistant knowledge --noinput
.\venv\Scripts\python.exe manage.py compare_ai_retrieval --output ..\..\artifacts\retrieval-comparison.json
```

The comparison uses all 96 frozen questions and eight separately annotated clear
questions, with the actual index, gateway, orchestration and citation checks.
The provider is scripted; no network/API credits are used. It chooses annotated
sections only after discovery. Missing witnesses remain misses. It measures
protocol/source coverage and context bytes, not real language-model answer
quality, token counts or network latency. Preserved pre-change results, paired
results and limitations are in the [optimization report](../../../docs/ai_knowledge/ai_retrieval_optimization_report.md).

## Controlled live comparison

The prepared command sends two fixed public-behavior questions through the
JWT-authenticated Django route, in both modes, with a total cap of ten provider
attempts and no retries. It creates normal conversations/audits but reads no
restaurant business records. Each question starts a fresh conversation.

```powershell
.\venv\Scripts\python.exe manage.py smoke_retrieval_modes --live --user-id <authorized-existing-user-id> --max-requests 10 --output ..\..\artifacts\retrieval-live-comparison.json
```

It uses real DeepSeek HTTP transport and an in-process authenticated Django
request, including local persistence/audit time. It records actual usage/cache
tokens and per-call duration when returned. A failed route or spent cap stops
further testing. Provider credentials remain in the existing HTTPS header,
outside recorded payloads. The model receives the question, authorized capability
descriptions, role/scope flags and selected operator-documentation context.

Automatic approval review initially blocked the run. The user subsequently
approved the exact documentation payload/destination and up to ten requests.
The 2026-10-29 run spent exactly ten HTTP requests: the employee question completed
in six legacy calls and three auto-mode fallback calls; the contractor test spent
the last request and stopped at the cap. Citation identity checks passed for both
answers, but they were overlong and included some unfetched attendance claims.
This did not demonstrate the two-call automatic path. The widened default above
and tighter overview/claim-grounding instructions were added afterward and
verified offline. See the report for actual token/cache/latency results and limits.
The session's approved live budget is exhausted; further calls require renewed
approval. Keep legacy as the default pending successful live verification of the
final changes.
