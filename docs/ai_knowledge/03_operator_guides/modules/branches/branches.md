---
id: "operator_modules_branches_branches"
title: "Manage branches, public links, and configuration migration"
module: "branches"
description: "Create and manage branches, copy public menu links and QR codes, and migrate configuration into the active branch without moving stock or transaction history."
keywords: ["branches", "manage", "public", "links", "configuration", "migration", "branch setup", "configuration migration", "QR code"]
roles: ["Admin"]
related_docs: ["operator_reference_backend_restaurants_fields", "operator_modules_public_ordering_customer_handoff", "operator_workflows_branch_setup", "operator_modules_inventory_transfers", "operator_troubleshooting_verification_register", "operator_reference_interface_component_admin_branches_branchmanagement", "operator_reference_backend_restaurants_validation", "operator_reference_backend_restaurants_access"]
frontend_routes: ["/admin/dashboard/branches"]
source_references: ["frontend/src/component/Admin/branches/BranchManagement.jsx", "backend/backend/restaurants/views.py:branch_list_create", "backend/backend/restaurants/views.py:branch_detail", "backend/backend/restaurants/views.py:branch_data_migrations", "backend/backend/restaurants/data_migration.py:BranchDataMigrationService", "backend/backend/restaurants/models.py:Branch", "backend/backend/restaurants/serializers.py:BranchSerializer", "backend/backend/restaurants/tests.py:BranchDataMigrationServiceTests"]
status: "source_verified"
---

# Manage branches, public links, and configuration migration

## Page and access

Admin **Administration → Branches**, `/admin/dashboard/branches`, is the mounted branch management page. BranchAdmin’s menu hides it and nested route requires Admin. Server branch create/manage is owner/Admin restricted; normal users can list only accessible branches. Subscription branch limits and demo restrictions apply.

The page lists branch records, active/main status, staff count, limits, public link/QR controls and migration area/history. **Add Branch** opens create; edit icon opens update. Fields **Name**, **Code**, **Address**, **Phone**, **Email**, **Latitude**, **Longitude**, **Active** use text/email/number/checkbox controls. Default strings empty, Active true. Backend model/serializer defines field lengths, coordinate types, branch code uniqueness and main-branch rules; see [restaurants fields](../../reference/backend/restaurants_fields.md). Operator forms do not expose arbitrary database branch IDs or sharing-mode configuration.

Create/save assigns current restaurant and generates slug/QR as model logic requires. A new non-main branch needs a valid subscription and available branch capacity. Edit renames/updates same branch; rename may regenerate slug/public QR data. **Activate/Deactivate** toggles is_active through branch update. Main branch cannot deactivate: **Main branch must remain active.** Branch deactivation is blocked if it would leave staff without any active branch. Fix legitimate assignments through supported administration; do not remove staff to evade this restriction.

Delete uses a confirmation dialog. Branch model blocks deleting main branch, a branch with operational/dependent data, or staff that would be left without an assigned branch as implemented by `can_delete`/`delete`; view returns validation messages. Deletion has no restore and is not a method to archive business transactions. Use the actual warning and current `can_delete` state.

## Public link and QR controls

Copy public URL, open menu, download QR, and regenerate QR are separate actions on branch cards. Copy/Download require a produced link/file; regenerate sends server request and refreshes branch QR. Success changes stored QR file, not order state. Current Branch.get_public_path returns `/menu/{restaurant.slug}` for every branch, so do not promise these QRs directly select an individual branch despite per-branch filenames. Scan a generated QR manually after name/domain changes. See [customer handoff](../public_ordering/customer_handoff.md).

## Migrate configuration into the active branch

1. Confirm destination: **current active branch**, not a free destination dropdown.
2. Select another active source branch in the same restaurant. Same source/destination is rejected.
3. Choose **Migrate Ingredients**, **Migrate Menu Categories**, **Migrate Menu Items**, **Migrate Platters**, **Migrate Modifiers**, or **Migrate Everything** card.
4. Read confirmation showing included/excluded data and destination. Confirm once; wait for migration result and inspect imported/skipped/failed step counts/history.
5. Review resulting destination menu/recipes and procure its real stock before taking orders.

Ingredients copies master definitions, units/cost/threshold metadata; destination stock starts0. Menu items include required category/ingredient/recipe dependencies. Platters include item dependencies/composition. Everything copies configuration and menu relationships only. Stock quantities, production batches, movements, purchases, transfers, ledgers and order history are excluded. Existing matches are skipped/reused by service maps; repeat runs are designed to avoid duplicating matching entities. They are not continuous synchronization of later edits.

**Modifiers** is a placeholder because no modifier model is connected; it can report skipped/no model rather than create usable modifier features. Units/ingredient-category steps can also be no-op where there is no standalone model. Do not teach those cards as implemented modifier administration.

Service wraps the migration steps in a transaction and writes a log result; a failed migration is not a partially approved stock transfer. No “undo migration” action exists. Review skipped/matched records before re-running; later editing the source does not automatically update the destination. Errors include **Source and destination branches must be different.**, **Source and destination branches must belong to the same restaurant.**, missing source/active destination and permission errors.

See [branch setup](../../workflows/branch_setup.md), [transfers](../inventory/transfers.md), and [verification register](../../troubleshooting/verification_register.md).

## Detailed controls, fields, and server rules

- [Branch Management — controls and fields](../../reference/interface/component_admin_branches_branchmanagement.md)
- [Restaurants — backend fields reference](../../reference/backend/restaurants_fields.md)
- [Restaurants — backend validation reference](../../reference/backend/restaurants_validation.md)
- [Restaurants — backend access reference](../../reference/backend/restaurants_access.md)
