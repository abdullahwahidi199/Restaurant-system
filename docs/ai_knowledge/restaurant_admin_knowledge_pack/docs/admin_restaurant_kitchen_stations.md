---
id: admin_restaurant_kitchen_stations
title: Restaurant > Kitchen Stations
module: restaurant
namespace: admin
status: current_observed_behavior
summary: Separates preparation responsibility, such as Main Kitchen, Grill and Juice Bar, by routing menu-item/platter
  order lines to assigned kitchen staff. A station is not a separate inventory...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- assignments
- bar
- grill
- juice
- kitchen
- restaurant
- routing
- staff
- stations
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_154-161
tool_hints:
- records.list
- configuration.get
metric_ids: []
---

### Restaurant > Kitchen Stations

- **Purpose:** Separates preparation responsibility, such as Main Kitchen, Grill and Juice Bar, by routing menu-item/platter order lines to assigned kitchen staff. A station is not a separate inventory balance, supplier account or sales total.
- **Routing / example:** A burger assigned to Grill and juice assigned to Juice Bar can belong to the same order. Grill staff handle the burger line; Juice Bar staff handle the juice line. The order remains in progress while another station has unfinished lines and becomes Ready when all non-cancelled lines are ready. A platter routes by its own station, not separately by each component's station.
- **Default / Custom:** Default Main Kitchen provides the fallback for entries without an assigned station; an active branch default takes precedence over a restaurant-wide default. Custom identifies another configured station; it does not measure workload or performance.
- **Active / Inactive:** Configuration status, separate from menu-item availability. Kitchen staff use their active station assignments; staff with no active assignments currently handle all stations. Inactivating a station alone therefore does not reliably stop orders or make related dishes unavailable.
- **Branch / filters:** Branch-specific stations apply to their branch; branchless stations apply restaurant-wide. Search and branch filters narrow the already loaded stations, not access scope. The Assigned Branch caption can incorrectly show All branches for a branch-specific station; its intended display needs verification.
