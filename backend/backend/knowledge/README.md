# Offline documentation index

`knowledge` is a Django app without models, migrations, URLs, startup indexing, or model-provider dependencies. It builds the existing operator Markdown into a private, deterministic catalog. Normal builds read only the configured documentation tree and this package's `capabilities.json`; `source_references` are metadata, never instructions to read application files. PyYAML and Mistune are already project dependencies.

The [Knowledge Gateway](GATEWAY.md) adds authorized lexical search, browsing and signed search-before-fetch tools on top of this index. This document describes the indexing/storage layer.

## Regenerate and validate

From `Restaurant-system/backend/backend` in PowerShell, using the existing virtual environment:

```powershell
& venv/Scripts/python.exe manage.py build_knowledge_index --check
& venv/Scripts/python.exe manage.py build_knowledge_index
& venv/Scripts/python.exe manage.py build_knowledge_index --check --validate-published
& venv/Scripts/python.exe -m unittest discover -s knowledge/tests -v
```

`--check` builds and validates entirely in memory and writes no index files. `--verbose-diagnostics` prints individual issues and exclusions; otherwise the command prints summary counts and diagnostic counts. Errors cause a nonzero exit status. Missing documentation and empty source trees fail explicitly. Warnings retain usable records and do not imply runtime verification. Application startup currently prints an existing Redis channel-layer description; the indexer does not use Redis or the database.

Settings in `backend/settings.py`:

| Setting / environment variable | Default relative to repository root | Purpose |
|---|---|---|
| `KNOWLEDGE_DOCUMENTATION_ROOT` | `docs/ai_knowledge/03_operator_guides` | Read-only source Markdown tree |
| `KNOWLEDGE_INDEX_ROOT` | Source root's sibling `.generated` | Private generated storage |

The administrative command also accepts trusted `--source` and `--output` overrides. An override changes the physical root, while record paths always begin with the logical `03_operator_guides/` prefix. Output cannot replace the source root or an ancestor. Output placed inside the source tree must be under a hidden directory that the scanner excludes.

Each refresh performs a full rebuild. Raw source hashes identify changed files; correctness takes priority over incremental caching. No timestamp is generated. Identical source bytes, curation bytes, schema/parser behavior and configuration produce identical artifact and manifest bytes. Dependency upgrades should run this suite and review output differences. CRLF/CR and a UTF-8 BOM are normalized for indexed Markdown; raw-file hashes still detect those changes. English, Dari and Pashto remain UTF-8 text, not ASCII escape sequences.

## Deployment

The repository has no container configuration defining a documentation mount. Include this package and the Markdown tree in the release, or mount the tree read-only inside the backend environment. Configure an absolute `KNOWLEDGE_DOCUMENTATION_ROOT` and a separate writable, private `KNOWLEDGE_INDEX_ROOT` when the repository layout is absent. Run `python manage.py build_knowledge_index --check`, then `python manage.py build_knowledge_index` as an explicit deployment step. The output must be on a filesystem supporting atomic same-filesystem `os.replace`; build on the same storage used by readers.

Alternatively, build during release preparation and deploy the committed `manifest.json` plus its entire referenced generation directory together, then make storage read-only for runtime workers. Deploying a manifest without its generation fails loading. Do not mount generated storage as public static/media files or add a web route for it. Generated files are ignored by Git and must be regenerated or deliberately packaged in the deployment artifact. Indexing is never performed for individual user questions.

Workers can load one committed snapshot and cache it. Refresh by explicitly loading again after deployment; an already loaded `KnowledgeIndex` continues to represent its original snapshot. Retain previous generations while workers/deployments might reference them. There is no automatic deletion or garbage collector. These files are local artifacts, not a substitute for shared-disk/rolling-deployment design.

## Pipeline and failure policy

1. `scanner.scan_documents(root)` recursively finds eligible `.md` files, validates safe YAML metadata and returns documents plus diagnostics. It skips hidden/unrelated/generated directories, temporary Markdown, symlinks and all non-Markdown files, including `.env`. Limits: 8 MiB per source document and 128 KiB frontmatter; YAML aliases and duplicate keys are rejected.
2. `indexer.build_index(root)` creates catalog/section records, validates related IDs and local Markdown links/fragments, and generates a capability map. Markdown link validation uses the scanned registry without opening arbitrary link targets. External HTTP/HTTPS/mailto links are not fetched or verified. Source-code references and frontend routes are preserved, not checked against live application source.
3. Recoverable invalid files are excluded with errors; other valid records remain available for inspection. Every copy of a duplicated document ID is excluded to avoid choosing an arbitrary winner. Missing related IDs, local targets/fragments and stale capability evidence produce errors.
4. `storage.publish_index(result, root)` validates identity, ownership, section reconstruction, hashes and capability references before writing. It stages and reparses three artifacts, installs an immutable generation, then atomically replaces only `manifest.json`. An interrupted build leaves the previous complete generation readable; unused staging files from a killed process can be ignored. In-process failures clean up their own staging files.
5. Errors normally prevent publication and preserve the current manifest. `--allow-partial` is an explicit diagnostic option: valid records can be published with `complete: false`, diagnostics and exclusions. The normal loader refuses this incomplete snapshot. An entirely empty result is never published. Use `--check` to investigate errors without replacing a healthy index; partial publication intentionally replaces the current manifest and is unsuitable for normal deployment.

## Classification and authorization boundaries

Explicit YAML `document_type` and `availability` are authoritative. Missing types follow the established tree conventions: `modules`, `workflows`, `forms`, `navigation`, `troubleshooting`, `role_guides`, `reference/interface`, `reference/backend`, known QA files, and root `index.md`. Legacy `form` is normalized to `form_reference`, with the original value retained in `metadata`. A new location without a convention needs explicit metadata. `role_guide` is an additional category preserving the existing learning guides.

Types: `operator_guide`, `workflow`, `form_reference`, `navigation`, `troubleshooting`, `role_guide`, `interface_reference`, `backend_reference`, `quality_assurance`, `index`.

Availability: `operator_guidance`, `mounted_context`, `shared`, `unmounted`, `inactive`, `customer_context`, `reference_only`, `qa_only`, `needs_verification`. Absent availability uses conservative conventions: QA is `qa_only`, backend references are `reference_only`, interface references with routes are `mounted_context`, route-less references need verification, public customer context is classified separately. These are documentation classifications, not evidence that a route currently works. Mixed guides remain intact; a mention of an inactive control does not remove the whole guide.

`operator_guidance` is a boolean ranking hint limited to primary instruction types with `availability: operator_guidance` and `status: source_verified`. It excludes technical references, QA and indexes by default. It is never an authorization decision. Roles, including `See access section` and empty lists, are copied verbatim. Unknown/generic roles and unspecified roles are flagged, never expanded into guessed permissions. Future gateways must enforce authenticated Django permissions and examine the actual guide's conditional behavior.

## Sections and identity

Mistune parses root Markdown blocks; the index slices the original normalized body at real headings. ATX and setext headings are supported. Headings inside fenced/indented code, quotes or list procedures do not split sections. Tables, numbered procedures, labels and code examples remain intact. A parent section contains its own text up to the next heading, not a duplicate of every descendant. `heading_path` and `parent_section_id` retain hierarchy. A preamble is an independent `Introduction`; documents without headings receive one such section, even with an empty body. Sections above 32,000 characters are reported, not arbitrarily split.

Offsets are Python Unicode-character offsets into normalized Markdown **after frontmatter**, with exclusive end positions. Concatenating a document's sections by `position` exactly reconstructs that body. Each section has a SHA-256 content hash.

Section IDs are opaque `document_id::readable_slug_full_sha256` strings, hashing the full heading hierarchy and occurrence count for duplicate paths. They are deterministic across unchanged runs and body-only edits. Renaming a heading or an ancestor may change IDs. Inserting/reordering identical duplicate heading paths can change which occurrence an ID represents. These IDs do not promise permanent identity across arbitrary editing. Source Markdown fragments (`heading_anchor`, explicit HTML `anchors`) are separate from section IDs; current docs use simple heading fragments and explicit anchors, not a browser-specific rendering contract.

## Capability maintenance

The compact map draws primary descriptions/responsibilities from eligible `source_verified` module guides, and links verified operator workflows that reference those guides. Technical, QA, unmounted, inactive and unverified documents cannot become primary business modules. Public ordering is explicitly `customer_context`. The map is an overview, not a list of every control or a guarantee of availability for every role/state.

`capabilities.json` is the transparent, small curation layer: each business label names a primary document, exact heading, and literal `evidence_text` witness. The generator requires a unique matching section and matching witness, resolves its section ID, and deduplicates labels. This guards against drift; humans must still review whether a label accurately summarizes the whole section and its limitations. Descriptions and relationships are generated deterministically without an LLM. Missing curation produces an empty capability list, a warning, and `review_required: true`; it does not invent actions. Stale/ambiguous evidence is an error. When adding/changing module guides, update the curation alongside them and run checks/tests. Keep customer billing, supplier purchases, contractor services, salary payments and general expenses distinct.

## Artifact schemas (version 1)

```text
.generated/
  manifest.json
  generations/<build_hash>/
    documents.json
    sections.jsonl
    capability_map.json
```

All JSON uses sorted keys, compact separators, UTF-8 and a trailing newline. Arrays follow deterministic source/section/module order. No source Markdown is rewritten. The manifest is the only pointer readers follow; do not assume artifacts live directly beside it.

| Artifact | Structure and fields |
|---|---|
| `manifest.json` | `schema_version`, logical `source_prefix`, sorted `source_hashes` mapping paths to raw SHA-256 hashes, `configuration_hash` of curation bytes, `complete`, `summary`, `diagnostics`, `excluded`, `build_hash`, `generation`, `artifacts` |
| Manifest summary | `markdown_files_scanned` (eligible candidate files, including invalid files), `documents_indexed`, `sections_indexed`, `capability_modules`, `metadata_errors`, `unresolved_references`, total `errors`, `warnings`, `excluded` (records; a skipped directory counts once) |
| Manifest diagnostics | List of `{severity, category, code, path, message}`. Paths are logical relative paths; exclusions are `{path, reason}` relative to the source root. Ignored non-Markdown files are not enumerated. Unreadable/oversized files cannot supply a source hash. |
| Manifest artifacts | Mapping each of the three exact filenames to `{sha256, bytes, path}`. Path must equal `generations/<build_hash>/<filename>`. `build_hash` hashes the canonical manifest base before adding the hash, generation and artifact paths. |
| `documents.json` | `{schema_version, documents: [...]}`. Each document contains `document_id`, `title`, `module`, `description`, `keywords`, `roles`, `related_docs`, `frontend_routes`, `source_references`, `status`, normalized `document_type`, `availability`, `role_metadata_state` (`literal`, `unspecified`, `generic_or_unknown`), boolean `operator_guidance`, original parsed `metadata`, logical `path`, `source_hash`, normalized-body `content_hash`, ordered `section_ids`. No complete Markdown body. |
| `sections.jsonl` | One JSON object per section: `section_id`, `document_id`, `heading`, `heading_level`, `heading_path` (`[{level, heading}, ...]`), nullable `parent_section_id`, zero-based `position`, `start_offset`, `end_offset`, `heading_anchor` (nullable), explicit HTML `anchors`, `content`, `content_hash`, `document_title`, `module`, `path`, `document_type`, `availability`, `status`, `roles`, `keywords`, `frontend_routes`. Other document metadata is resolved through `document_id`. |
| `capability_map.json` | `{schema_version, scope, modules: [...]}`. Each module has `module`, `name`, `description`, `responsibilities`, `capabilities` (`[{label, document_id, section_id}]`), `workflows` (`[{document_id, title}]`), `related_modules`, `primary_documents`, `review_required`, `availability`, `verification: static_documentation_only`. |

## Internal Python interface

Use the configured output directory with `load_index`; no Django initialization is required when using the library directly:

```python
from knowledge.loader import load_index

index = load_index(output_root)
module_ids = index.list_modules()
overview = index.get_capability_map()
guides = index.documents_for_module("contractors")
all_module_documents = index.documents_for_module("contractors", include_supporting=True)
document = index.get_document("operator_modules_contractors_services")
section = index.get_section(document["section_ids"][0])
text = section["content"]
```

These are exact dictionary lookups and enumeration, not search or AI-callable tools. Unknown IDs return `None`; ID text never enters a filesystem path. Returned values are defensive copies. The loader verifies the manifest, artifact checksums/counts, relative paths, section ownership/hierarchy/reconstruction and capability references. It rejects missing, malformed, unsupported or incomplete snapshots with `knowledge.loader.IndexError` (a `ValueError`). `load_index(..., require_complete=False)` is reserved for explicit diagnostic inspection. Do not silently fall back to raw arbitrary file paths on lookup failure.

Tests use `unittest` and temporary local storage, not database test setup, network requests or API keys. The repository integration test reconstructs every source document and checks all existing categories. It skips only when the documentation tree is absent from a packaged deployment. See the [indexing report](../../../docs/ai_knowledge/knowledge_indexing_report.md) for the measured repository build.

## Deployment permissions and freshness

Build the index as an explicit deployment step after installing/updating the Markdown and capability curation; do not build at startup or per chat request. Run `build_knowledge_index --check --validate-published` under the **Django runtime account** after publication. This read-only check validates source metadata, checksums, IDs, capability references and the current published build hash. Plain `--check` validates only build inputs and can run before publication.

Django loads `backend/backend/.env` by absolute path, with process environment taking precedence. Relative knowledge-path overrides are resolved against the directory containing `manage.py`, independent of the working directory.

Windows directory permissions survive an atomic rename. Python `tempfile.mkdtemp` creates an owner-only protected ACL, so it must not become a published generation used by another account. Publication now creates an unpredictable exclusive staging directory that inherits the private generation-storage parent's deployment ACL. Keep that parent private and grant the intended runtime identity read/traverse access. On Linux, the deployment's directory permissions, group and umask determine access.

For an existing Windows generation created by the previous indexer, enable inheritance on that **verified generation path only** (for example `icacls <generation-path> /inheritance:e /T /C`), after checking that its storage parent's ACL grants the intended runtime account access. Do not broaden permissions on `.env` or the repository as part of this repair. Then run the published check under the runtime account. An unchanged rebuild may reuse the same immutable generation and therefore cannot itself repair that old ACL.
