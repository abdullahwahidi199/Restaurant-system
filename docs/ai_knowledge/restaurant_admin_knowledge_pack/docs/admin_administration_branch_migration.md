---
id: admin_administration_branch_migration
title: 'Administration > Branches: Configuration Migration'
module: administration
namespace: admin
status: current_observed_behavior
summary: Copies configuration from another active branch in the same restaurant into the current working branch; source
  and destination must differ. Not physical stock transfer, branch consolidati...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- branch
- branches
- configuration
- import
- ingredients
- menu
- migration
- 'no'
- recipe
- stock
related_docs:
- admin_administration_branches
- admin_restaurant_menu
- admin_inventory_ingredients
routes: []
source_refs:
- uploaded_admin_reference:lines_598-607
tool_hints:
- audit.list
- configuration.get
metric_ids: []
---

### Administration > Branches: Configuration Migration

- **Purpose / direction:** Copies configuration from another active branch in the same restaurant into the current working branch; source and destination must differ. Not physical stock transfer, branch consolidation, financial-history migration or continuous synchronization. The branch directory is restaurant-wide, but the migration destination follows the current working branch.
- **Copy types:** Ingredients copies names, stock units, unit costs, minimum thresholds and activity flags; newly copied ingredient quantities start at zero. Menu Categories copies category information. Menu Items also includes category, ingredient and recipe dependencies, prices, descriptions and availability/production-tracking flags. Platters additionally includes component dishes and quantities. Everything combines these supported menu/configuration copies, not every restaurant record.
- **Important exclusions:** No stock quantities, prepared-production batches, stock movements, purchases, transfers, ledgers or order/payment history are copied. Kitchen-station definitions/assignments are not copied. A copied production-tracking flag supplies no prepared portions; availability still follows Restaurant > Menu and Operations > Daily Productions. Copying ingredient costs is not an inventory receipt or expense.
- **Existing matches / legacy data:** Category/ingredient matches use trimmed case-insensitive names; dish/platter matches also use the destination category. Matches are reused rather than overwritten, preserving existing destination prices, ingredient stock and recipe quantities; missing recipe links can still be added. Repeating a copy is not synchronization of later source edits. For each data kind, restaurant-wide legacy definitions are a fallback only when that source branch has none of its own, not automatically merged with all source-branch definitions.
- **Imported / Skipped / Failed:** Counts configuration records/recipes across all included dependency steps, not sold units, stock amounts or distinct menu products; platter component links are not counted separately. Skipped normally means an existing match was reused, not rejected/failed work. Modifiers is a placeholder with no supported modifier data and contributes a skipped step; unit/ingredient-category labels do not create separate editable catalogues.
- **Running / Completed / Failed:** Running means the copy has not finished. Completed means processing finished, not that all menu items are sellable or all relationships succeeded; inspect Failed count as well. A fatal failure rolls back that run's copied data and records Failed with a failure count of one, not necessarily one bad source record; retained step summaries can describe attempted work rather than committed changes. No on-page undo is supplied.
- **History coverage:** Latest 50 migration runs across the restaurant, newest start time first, not just the destination currently selected and not a full all-history ledger. Source/Destination identify each run; Imported/Skipped describe that run rather than current catalogue totals. No history date filter or pagination beyond those 50 entries is provided.
