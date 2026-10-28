# Documentation indexing report

Measured on 2026-10-28 against the existing `03_operator_guides` tree. The indexing infrastructure and generated artifacts are complete. Operator Markdown was not rewritten. The report is outside the scanned operator tree to avoid indexing its own build counts.

| Result | Actual count |
|---|---:|
| Eligible Markdown files scanned | 328 |
| Documents indexed | 328 |
| Sections indexed | 3,467 |
| Capability modules | 22 |
| Metadata errors | 0 |
| Unresolved references | 0 |
| Total errors | 0 |
| Warnings | 132 |
| Documents excluded | 0 |

All related-document IDs and local Markdown targets/fragments resolved. External URLs were not fetched. Source-code references and route strings are preserved metadata; normal indexing does not inspect application source or certify live routes.

## Generated output

The private index is at `docs/ai_knowledge/.generated/`, with a committed manifest and three artifacts under its immutable generation. This generated directory is ignored by Git; regenerate during deployment or package the entire committed snapshot. The build hash is:

```text
6f1885a21a3976b1f321c7c955bc20a663acce30c71a518e5227dcc4a9a0cbae
```

| Artifact | Bytes |
|---|---:|
| `documents.json` | 1,353,956 |
| `sections.jsonl` | 7,775,212 |
| `capability_map.json` | 36,000 |

Rebuilding with unchanged sources produced byte-identical manifest and artifact files. Running check mode afterward preserved both manifest bytes and modification time. Independent Python loading resolved `operator_modules_contractors_services` and its first section, headed **Manage contractors, service contracts, invoices, and payments**. Integration tests also loaded and reconstructed every indexed document exactly from its sections, preserving normalized Unicode Markdown and original role metadata.

## Coverage and classification

| Document type | Count |
|---|---:|
| `operator_guide` | 28 |
| `workflow` | 7 |
| `form_reference` | 2 |
| `navigation` | 4 |
| `troubleshooting` | 1 |
| `role_guide` | 6 |
| `interface_reference` | 227 |
| `backend_reference` | 46 |
| `quality_assurance` | 6 |
| `index` | 1 |

All ten supported document categories are represented. Availability classifications are: 48 `operator_guidance`, 187 `mounted_context`, 46 `reference_only`, 19 `customer_context`, 19 `unmounted`, 6 `qa_only`, and 3 `shared`. The 19 unmounted records remain indexed as references; they are not primary available capabilities. Technical references, QA and indexes are not marked as ordinary operator guidance. Customer ordering retains customer context.

The capability map has distinct modules for administration, audit, billing, branches, contractors, customers, dashboard, discounts, employees, expenses, inventory, kitchen, menu, orders, payroll, procurement, production, public ordering, reports, reservations, settings and tables. Business labels are grounded in primary-guide heading/text evidence through the reviewed curation layer. In particular, customer collection, supplier purchasing, contractor services, employee salaries and general expenses remain separate.

## Warnings requiring interpretation

| Diagnostic | Count | Meaning and handling |
|---|---:|---|
| `role_metadata_unspecified` | 76 | Empty role lists preserved; future authorization must use authenticated Django permission logic. |
| `generic_or_unknown_roles` | 29 | Generic/unknown labels preserved verbatim; no guessed role lists. |
| `manual_or_source_only` | 23 | Documents requiring verification or describing unmounted functionality remain classified accordingly. This is a document warning, not exclusion. |
| `large_section` | 4 | Entire sections retained for review; tables/procedures were not split. |

Large sections occur twice in `coverage_matrix.md` (positions 1 and 2), once in `navigation/page_directory.md` (position 0), and once in `reference/source_disposition.md` (position 1). Positions are zero-based. The operator documentation's runtime/manual ambiguities remain in the source guides and verification register; successful indexing does not resolve those application behaviors. There were no excluded documents or exclusion reasons in this repository build.

## Commands and verification

Executed from `Restaurant-system/backend/backend` in PowerShell:

```powershell
& venv/Scripts/python.exe manage.py build_knowledge_index --check
& venv/Scripts/python.exe manage.py build_knowledge_index
& venv/Scripts/python.exe -m unittest discover -s knowledge/tests -v
& venv/Scripts/python.exe manage.py check
```

The build command and check command were run again through a Python verification harness using `subprocess.run([sys.executable, 'manage.py', 'build_knowledge_index', ...], check=True)`. The harness compared all artifact bytes and manifest bytes across rebuilds, asserted check-mode preservation of the manifest modification time, and called `knowledge.loader.load_index` for independent document/section lookup and category counts.

From the repository root, `git diff --check` passed. A targeted `rg` check found no developer-specific workspace paths or private-key headers in operator sources. The scanner did not read `.env` files. No external AI service, embedding service or API key was used.

**Automated result: 28 tests passed.** Coverage includes recursive discovery, malformed/missing metadata, duplicate IDs and YAML keys, safe paths, exclusions, Unicode/BOM/newlines, H1/H2/H3/setext hierarchy, duplicate headings, code/list/quote handling, tables/procedures, headingless/empty bodies, non-overlapping reconstruction, deterministic output, related links, availability separation, capability evidence drift, exact-ID lookup, checksum/path tampering, explicit partial snapshots, interrupted atomic publication and full repository round trips. `manage.py check` reported **no issues (0 silenced)**. Tests require no database setup and do not exercise restaurant transactions.

## Deployment and remaining boundaries

The repository has no deployment/container manifest defining how documentation reaches the backend. The [developer guide](../../backend/backend/knowledge/README.md) provides settings, mounting/packaging instructions, refresh behavior, schemas and failure policy. A deployment must supply the Markdown tree at build time or package a complete generated snapshot, and keep generated files private. Production-specific mounts/filesystem atomicity remain to be verified in the actual deployment environment.

Changes are limited to the knowledge package, its tests/curation/developer guide, two knowledge-path settings, Django app registration, the generated-output ignore rule, generated local artifacts and this report. There are no business models, migrations, endpoints, frontend changes, AI tools or search algorithms in this task.
