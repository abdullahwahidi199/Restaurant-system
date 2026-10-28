# Initial assessment — 2026-10-29

This assessment precedes production-code hardening for Task 5. The worktree was clean. The existing index contains 328 documents and 3,467 sections, with 22 capability modules. No live provider call is part of this evaluation.

Implemented controls inspected:

- The gateway filters document access before producing previews; token signing binds returned IDs to current principal and index version. Fetch checks exact IDs, authorization, offsets and UTF-8 response size.
- The orchestrator uses the actual gateway dispatcher, forces initial search, rejects unfetched/partial citations, revalidates prior sources, bounds calls/content/history, and separates retrieved text from system instructions.
- The provider is isolated, non-thinking and non-streaming, with error/credential-echo handling. Conversations are user/restaurant/branch/permission scoped. Conditional turn leases protect publication. JWT authentication and DRF throttling protect the API.
- Existing tests cover many protocol/security cases, but retrieval tests primarily assert a document is among several results. They do not establish section-level recall across a representative question set or actual model answer quality.

Evaluation gaps to close before claiming quality:

1. Freeze realistic questions and source-specific expected sections before measuring/tuning; inherited document metadata and the two-results-per-document limit may conceal section ranking failures.
2. Separate raw English/native lexical recall, contextual follow-ups and non-answerable questions. Scripted translated topics must not be counted as native semantic retrieval.
3. Measure load/cache/search/fetch/history/orchestration costs and memory before optimizing.
4. Exercise genuine document/tool/history injection fixtures, concurrent conversation requests and repeated submissions, not only prompt text mentioning an attack.
5. Investigate bounded recovery after expired discovery: `force_fetch` can remain set after gateway token errors. This is an inspection hypothesis pending a regression probe.
6. Probe provider malformed types and evidence/history provenance boundaries. Source-ID integrity is not semantic verification of an answer's claims.

Baseline results will be retained independently of final results, with a dataset digest and implementation fingerprints. Existing business/order timezone regression failures reported in Task 4 remain outside the assistant scope.
