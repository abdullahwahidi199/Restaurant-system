---
id: admin_operations_production_movements
title: Operations > Production Movements
module: operations
namespace: admin
status: current_observed_behavior
summary: History explaining changes to prepared portions and who/what was recorded. Total movements counts matching events
  across all pages after search, movement-type and date filters; it counts...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- batch
- cleared
- consumed
- events
- history
- movement
- movements
- operations
- portions
- prepared
- production
- reduced
- restored
related_docs:
- admin_operations_daily_productions
- admin_inventory_stock_movements
routes: []
source_refs:
- uploaded_admin_reference:lines_114-122
tool_hints:
- movements.list
- records.list
metric_ids:
- production.remaining_prepared
---

### Operations > Production Movements

- **Purpose / Total movements:** History explaining changes to prepared portions and who/what was recorded. Total movements counts matching events across all pages after search, movement-type and date filters; it counts neither portions nor orders. No date filter means available history, not just today.
- **When / dates:** When is the movement record's creation time. Start/end filters include both dates using Kabul calendar days, not order creation date or the batch's original cooking date.
- **Change / Balance:** Change = remaining portions after the event minus remaining before it; Balance shows those two historical values. Positive adds availability, negative removes it, zero can represent a notes-only adjustment. The after-balance is not necessarily today's balance or stock produced during the selected period.
- **Types:** Created starts a batch; Added increases it; Reduced corrects it downward; Adjusted records an absolute correction; Standalone order consumes portions; Restored returns portions up to the batch's produced quantity; Cleared removes the batch; Replaced swaps in a new batch and reports the net remaining change, not gross portions cooked.
- **Done by / Reference:** Recorded actor plus order number or notes. Consumption is attributed to the order creator, not necessarily the person starting kitchen work. Restored is a supported movement type, but current order cancellation does not automatically generate it.
- **Interpretation:** Negative changes include consumption, corrections, clearing and replacement; they are not all sales or wastage. Prepared-portion movements differ from raw-ingredient stock movements and contain no cash amount or production-cost measure. Date-filtered rows describe activity, not a reconstructed period-end stock balance.
