---
id: "operator_retrieval_conventions"
title: "Document categories, metadata, and retrieval boundaries"
module: "coverage"
description: "Documentation conventions for deriving document type, interpreting availability and verification, and choosing primary procedures before supporting evidence; no index or gateway implementation."
keywords: ["retrieval readiness", "document type", "availability", "metadata", "verification status"]
roles: []
related_docs: ["operator_index", "operator_coverage_matrix", "operator_troubleshooting_verification_register", "operator_retrieval_readiness_report"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/api/ReauireAuth.jsx", "frontend/src/component/Admin/settings/settingsConfig.js"]
status: "source_verified"
---

# Document categories, metadata, and retrieval boundaries

These conventions describe how the existing Markdown can be interpreted during a later indexing task. They do not implement a catalog, section extractor, search gateway, embeddings, or chatbot. Keep existing document IDs and reference bodies intact.

## Derive document type from location

Apply exact-file exceptions first, then directory rules. Paths below are relative to `03_operator_guides/`. This avoids adding a redundant `document_type` field to every file.

| Path | Derived document type | Intended use |
|---|---|---|
| `coverage_matrix.md`, `qa_report.md`, `retrieval_readiness_report.md`, `retrieval_conventions.md` | `quality_assurance` | Coverage, maintenance evidence, retrieval conventions and remaining checks. |
| `troubleshooting/verification_register.md` | `quality_assurance` | Discrepancies and runtime acceptance, rather than a list of available actions. |
| `reference/source_disposition.md` | `quality_assurance` | Source inventory, exclusions and mounting boundaries. |
| `index.md` | `navigation` | Entry point and document discovery. |
| `modules/**.md` | `operator_guide` | Primary module procedures and supported operator actions. |
| `role_guides/**.md` | `role_guide` | Primary operator training for one or several verified roles. |
| `workflows/**.md` | `workflow` | Complete operations connecting modules and roles. |
| `forms/**.md` | `form` | Field requirements, create/edit differences and submission. |
| `navigation/**.md` | `navigation` | Menus, routes, page locations and common controls. |
| `troubleshooting/**.md` except the register above | `troubleshooting` | Symptoms, causes and safe recovery. |
| `reference/interface/**.md` | `interface_reference` | Exact labels, fields, action conditions and component evidence. |
| `reference/backend/**.md` | `backend_reference` | Validation, permissions, fields, side effects and endpoint evidence. |

`module` identifies subject matter, not document type. Most modules use the directory's functional name. Backend files follow Django namespaces in their filenames; for example, `users_*` spans employees/payroll/activity, while `inventory_*` spans stock/procurement. Their primary-guide links disambiguate the subject. `roles`, `workflows`, `navigation`, `reference`, `interface_reference`, `index` and `coverage` are retained cross-module groupings, not new application modules or roles.

## Interpret frontmatter consistently

Frontmatter is YAML between the first two `---` delimiters. Existing one-line JSON strings and arrays are valid YAML; do not rewrite valid quoted expressions just to change style.

| Field | Meaning and constraints |
|---|---|
| `id` | Stable document identity; unique across this knowledge base. Preserve existing `operator_...` values when paths or titles change. |
| `title` | Human-readable discovery label, not necessarily an exact visible button. |
| `module` | Functional subject or documented cross-module grouping. Do not use it as a route or permission grant. |
| `description` | Short catalog summary of the document's actual scope. Prefer it with title/headings when deciding what to fetch. |
| `keywords` | Verified terminology and a few useful synonyms. Not an exhaustive feature or authorization list. |
| `roles` | Literal role names where established, otherwise scoped descriptive labels. An empty list means role-neutral or no applicable operator role established; it does **not** mean all roles are authorized or all roles are denied. Legacy phrases such as “See access section,” “Public/customer,” or explicit-permission descriptions require the body for interpretation. |
| `related_docs` | Existing document IDs, not paths or section IDs. IDs resolve within this knowledge base. |
| `frontend_routes` | Source-declared routes or verified parent-route contexts. An empty list is valid for cross-module/reference documents. A listed route is not proof of a sidebar item, role access, a mounted button in every state, or runtime success. |
| `source_references` | Repository-relative source paths, optionally `path.py:Class.method` or `path.py:function`. Split an optional symbol after the file path; these are not line ranges or API instructions. |
| `status` | Evidence boundary: existing `source_verified` or `needs_verification`. It does not establish runtime testing. |
| `availability` (optional) | Explicit exception/qualification where directory and routes alone would be misleading. Current explicit values are `shared` and `unmounted`; see precedence below. |

Role-oriented guides now use separate literal role values for Admin/BranchAdmin and the specialist roles. Cross-role navigation, form guidance and QA can use empty roles. Backend reference roles are intentionally neutral because a single contract file can contain endpoints with different policies; inspect its access section and the primary guide. No role metadata replaces backend enforcement.

## Availability and active-guidance boundaries

Use explicit `availability` first. Keep availability separate from verification status.

| Evidence / location | Availability interpretation | Operator retrieval treatment |
|---|---|---|
| `availability: unmounted` | Source declarations have no referenced App import path in this inspection. | Exclude from active instructions. Fetch only for legacy/source questions or to explain why an option is absent. Retain every detailed reference. |
| `availability: shared` | Wrapper/control is mounted through the common route or authorization shell, subject to parent conditions. | Supporting evidence for its parent procedure, not a separate feature or page. |
| QA document type | `qa_only` | Use for limitations and verification questions, not as a recipe for operating a placeholder. |
| Backend reference type | `reference_only` | Use to explain validation, restrictions or effects together with a supported UI procedure. An endpoint is not a new operator action. |
| Interface reference with parent routes and no explicit exception | `mounted_context` | Parent/import context was traced; action-level conditions and role checks still decide visibility and enablement. This does not certify every control as active. |
| Interface reference without parent routes or explicit qualification | `needs_verification` | Do not infer a current operating procedure solely from its existence. |
| `modules/public_ordering/` and customer/public-only interface routes | `customer_context` | Staff handoff explanations; do not mix with staff permissions or impersonate customers. |
| Other primary procedures and navigation | `operator_guidance` | Preferred starting content, subject to role, state, prerequisites and documented discrepancies. |

Shared source paths under `modules/shared/erp/` or `component/ui/` are reusable controls, even when many parent routes are listed. Their callback names are not independent business operations. Individual actions inside any document can be conditionally mounted; preserve the **Appears when**, **Disabled when** and parent-callback evidence. Do not promote those expressions into invented visible labels or run instructions.

The 19 explicitly unmounted interface documents are listed in the [readiness report](retrieval_readiness_report.md#source-only-documents-excluded-from-active-instructions). Three previously misclassified documents—RequireAuth, PortalLogoutButton and RootLayout—are explicitly shared. Their old `needs_verification` status remains because no running UI was tested.

## Select a document and section

Start with the relevant module/role guide, workflow or form. Fetch its directly linked interface reference for exact controls and its server reference for a validation, permission or side-effect question. Use troubleshooting for recovery and QA for unresolved discrepancies. Preserve both frontend and backend rules where they differ.

Descriptions and a small number of verified keywords support discovery without embeddings. For example, contractor service-invoice approval, outstanding amount and payment terms appear in the contractor guide's summary and complete procedure sections. This is a documentation property, not an implemented search algorithm or ranking guarantee.

Use meaningful headings for later automatic section IDs. Keep a numbered procedure, its explanation and field table together; do not make every step or field a separate document. Existing explicit `action-N` and `field-N` HTML anchors remain valid link targets; they are not new document IDs. A future heading-based section scheme must preserve these existing links or provide compatible aliases.

Code, JSX, escaped pipes, backend declarations and dynamic label expressions are intentional evidence when valid Markdown. Keep them available for detailed questions. Primary instructions identify actual visible labels when verified; an expression or filename alone does not establish that a control is mounted.

## Verification evidence is not interchangeable

- **Static source:** `source_verified` means the documented behavior was supported by inspected code. A source defect can still be described accurately.
- **Automated tests:** the [original QA report](qa_report.md) records a historical 41-test frontend run and which helpers it covered. This refinement did not rerun application tests or upgrade all workflow statuses.
- **Running UI:** no live UI verification was performed in either documented pass. Do not infer it from routes, a test result or a Markdown check.
- **Manual checks:** retain `needs_verification`, the [verification register](troubleshooting/verification_register.md) and deployment/printing/OTP/payment uncertainties until matching evidence exists.

The current refinement checks YAML, links, IDs, source references and documentation relationships. Passing those checks makes the structure suitable for a later indexer; it does not fix application discrepancies, certify business transactions, or authorize unavailable operations.
