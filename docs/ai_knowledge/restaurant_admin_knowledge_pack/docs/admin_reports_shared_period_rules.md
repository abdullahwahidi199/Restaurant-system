---
id: admin_reports_shared_period_rules
title: Finance > Reports > Shared Period and Interpretation
module: reports
namespace: admin
status: current_observed_behavior
summary: Reports contains Orders, Finance, Inventory, Staff Performance and Menu Items. Normal selected-branch scope
  applies; Branch Admins remain branch-restricted. Amounts are AFN unless explici...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- branches
- calculation
- current
- date
- exports
- finance
- historical
- interpretation
- period
- periods
- report
- reports
- shared
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_415-422
tool_hints:
- reports.get
metric_ids: []
---

### Finance > Reports > Shared Period and Interpretation

- **Views / scope:** Reports contains Orders, Finance, Inventory, Staff Performance and Menu Items. Normal selected-branch scope applies; Branch Admins remain branch-restricted. Amounts are AFN unless explicitly identified otherwise. Counts, percentages, quantities and monetary values are distinct measures, even where a caption/format is misleading.
- **Applied period:** Defaults to Today on the browser's local calendar. Today is one date; Last 7/30 includes today and the preceding 6/29 dates; This Month runs from the first day through today. Pending date inputs/presets do not change displayed results until applied. Both applied bounds are inclusive; reversed/empty dates leave the previous valid report. Unlike the main Dashboard's sales chart, future report dates are not prohibited.
- **Date basis:** Timestamp ranges cover complete Asia/Kabul days; business date fields use the selected dates directly. Orders use creation, not completion/payment time. Invoice charges, payments, attendance and payroll have their specific date rules below. A common header period does not mean every card is restricted to it.
- **Current versus historical:** Reports recalculate from current records, statuses, recipes, profiles and balances. A past period is not a locked accounting snapshot or balance as of its end date. Current stock/payables/profile figures can include changes after that period. Data is not a live feed; reapplying identical dates does not necessarily refresh Orders, Finance, Inventory or Staff results.
- **Coverage / exports:** Headline aggregates cover their full eligible populations independently of operational workspace pagination. Some detail tables/lookups intentionally return only the recent/top records specified below; they are not full ledgers. PDFs regenerate data and can have extra sections, shorter tables or separate configuration, so are not exact screen copies. Rounding, differing date/status rules and partial tables can prevent apparent reconciliation.
