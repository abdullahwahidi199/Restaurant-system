---
id: "operator_qa_report"
title: "Documentation verification and maintenance report"
module: "coverage"
description: "Records the original source-inspection scope, structural checks and historical frontend test results; distinguishes static evidence from unperformed UI and database tests."
keywords: ["coverage", "documentation", "verification", "maintenance", "report", "documentation QA", "static inspection", "verification evidence"]
roles: []
related_docs: ["operator_coverage_matrix", "operator_reference_source_disposition", "operator_troubleshooting_verification_register", "operator_retrieval_readiness_report"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/package.json", "backend/backend/orders/tests.py", "backend/backend/menu/test_production_movements.py", "backend/backend/users/test_activity.py", "backend/backend/restaurants/tests.py", "backend/backend/inventory/tests.py"]
status: "source_verified"
---

# Documentation verification and maintenance report

## Scope and evidence

Snapshot reviewed: 2026-10-28. Documentation is confined to `docs/ai_knowledge/03_operator_guides/`; no application behavior, models, migrations, APIs, dependencies or production data changed. Environment secrets and real customer records are excluded.

The inspection parsed 408 React JavaScript/JSX source files and 144 Django application Python files (excluding dependencies/migrations/management commands), traced App routes/imports/reexports, and inspected model/serializer/view/service/signal logic for operating workflows. Flutter customer router/checkout/order sources were reviewed for staff handoff boundaries; its customer-only files are separately inventoried. Source disposition records unmounted, public, marketing/analytics and supporting files without converting them into staff features.

Coverage includes route aliases/layouts/detail pages, declared controls and fields, per-component translated labels, disabled/conditional expressions, handler traces, backend field declarations/read-only/default constraints, explicit server failures, endpoint permission classes, cross-module workflows and role learning guides. Counts include responsive duplicates and wrapper fields and should not be interpreted as unique features. [coverage matrix](coverage_matrix.md) has the itemized inventory; [source disposition](reference/source_disposition.md) explains the scope.

## Automated checks performed

Original generation artifact check (before retrieval refinement): **326 Markdown documents**, **4,894 resolved local links**, **1,377 resolved action/field anchors**, **193 route rows**, **804 control rows**, and **573 field rows**. All required metadata values, unique IDs, related-document IDs, repository source paths, and cited Python symbols passed. These are static inventory counts, including repeated layouts and unmounted declarations; they are not a count of unique features or runtime-certified screens.

- Parsed JSX/JavaScript and Django AST to inventory routes, controls, fields, handlers, models, validators and permission declarations. This is static evidence, not live acceptance.
- Checked Markdown file targets and action/field anchors, required metadata keys/types, unique stable IDs, related-document IDs, repository source paths and cited Python symbols.
- Compared every App route and inventoried control/field against coverage entries; included backend API URL declarations separately.
- Ran existing frontend suite using `npm.cmd test`: **41 passed, 0 failed**. Supports role-route resolution, report/date control helpers, kitchen shortage localization, stale/finalized order snapshot handling, configuration and presence runtime helpers. It does not prove every screen, form, role or business workflow.
- Reviewed backend regression tests for payment integrity/station routing/stock-conflict rollback, production/platter behavior, activity/session isolation and branch migration. **Backend database tests were not executed.** No test database configuration was created, no backend server was started, and no production transaction was performed.
- Checked Git status to ensure all requested changes are documentation only. No application build was needed for this documentation change.

## Manual/source checks with operational implications

Payment completion was traced independently from printing; reservation matching/deposits and free-total discrepancy were checked; line-add/cancel/quantity stock behavior was traced; finance draft/approval/payment differences and payroll eligibility/regeneration were checked; route/menu/API conflicts and unmounted forms were recorded. Destructive table/category relationships and missing UI controls were corrected during review.

[verification register](troubleshooting/verification_register.md) lists source-visible discrepancies and the manual acceptance checklist. Physical printing, SMS/OTP, geolocation, protected storage, WhatsApp, realtime/cache infrastructure, exact responsive rendering and actual role/data fixtures remain **Needs Verification** in a running test deployment. Source verified must never be represented as runtime certified.

## Maintain this knowledge base

When application changes, compare App routes and sidebar configuration first, then follow changed controls into handlers/serializers/views/models/services/signals and tests. Update the operating procedure, component field/action reference, backend contract, role guide and coverage row together. Preserve stable document IDs; add new IDs for new documents. Keep source paths/symbols rather than line-number dependencies.

Every document begins with YAML metadata: id, title, module, description, keywords, roles, related_docs, frontend_routes, source_references, status. Source-verified references may still contain explicitly dynamic labels/conditions; unresolved mounting/runtime impact belongs in the verification register. Planned/placeholder/absent features must remain distinguished from implemented UI. Do not place credentials, sample production records, analytics interpretation or future chatbot instructions here.

## Later retrieval refinement

The counts and frontend test run above describe the original generation pass, not a new runtime verification. See the [retrieval-readiness report](retrieval_readiness_report.md) for the later targeted changes, current structural checks, source-only components and remaining verification boundaries. Existing IDs, technical declarations, action/field anchors and unresolved findings were preserved.
