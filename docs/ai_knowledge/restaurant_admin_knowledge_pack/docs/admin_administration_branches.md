---
id: admin_administration_branches
title: Administration > Branches
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant-wide branch directory and configuration overview, available in the Admin portal rather than Branch
  Admin's branch-restricted menu. Includes active and inactive branches, indepe...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- active
- administration
- branch
- branches
- limit
- main
- quota
- staff
- subscription
related_docs:
- admin_administration_settings_scope
- admin_administration_branch_migration
routes: []
source_refs:
- uploaded_admin_reference:lines_588-597
tool_hints:
- records.list
- configuration.get
metric_ids: []
---

### Administration > Branches

- **Purpose / scope:** Restaurant-wide branch directory and configuration overview, available in the Admin portal rather than Branch Admin's branch-restricted menu. Includes active and inactive branches, independently of the current working branch; main branch first, then name. No date, search or historical-headcount filter. This page is not a branch revenue/profit comparison.
- **Branches Used / Maximum / Remaining:** Used counts all current branches, including Main and inactive branches; Maximum is the subscription's configured branch allowance; Remaining is allowance minus Used, with Limit Reached shown when nonpositive. These are current subscription-capacity figures, not operating capacity or branches opened during a period. Inactivation does not free a slot; a new additional branch requires a valid subscription and available quota.
- **Staff column:** Count of current branch-assigned staff profiles, including inactive/resigned employees and automatically assigned administrator profiles. Not staff currently online, attending or working only at that branch. The same employee can appear in several branch counts; adding counts can exceed unique restaurant headcount. Admin profiles are automatically assigned to active branches.
- **Main / Active / Inactive:** Main is the designated primary branch, not the most profitable/largest one; only one is permitted and it must remain active. Active means enabled, distinct from the current active branch used as a working context. Inactivation retains branch records/history and is not liquidation or settlement of obligations; ordinary selection/public availability is restricted to active branches.
- **Branch code / contacts:** Code is unique within the restaurant and normalized to uppercase, not a performance rank or count. Contact/location details describe the branch; their presence does not verify business activity or customer reach.
- **Public Menu / QR:** Link and QR are customer menu-entry references, not sales, scan counts or proof that ordering is available. Currently every branch's generated link/QR uses the same restaurant-level menu entry point rather than directly selecting its individual branch, despite separate branch labels/files. Regeneration does not create or change an order.
- **Deactivation / deletion limits:** Main cannot be deactivated or deleted. Deactivation is blocked if any assigned employee other than Admin/SuperAdmin would have no other active assigned branch; Branch Admin is not exempt. Deletion is restricted by linked records and staff assignments; setup, audit, migration or session history can matter even with no sales. Current staff eligibility checking can also block deletion when assigned staff already have other branches, including an automatically assigned Admin; intended handling of that case remains unverified. Deletion is not the archival alternative to inactivation, and no restore function is supplied.
