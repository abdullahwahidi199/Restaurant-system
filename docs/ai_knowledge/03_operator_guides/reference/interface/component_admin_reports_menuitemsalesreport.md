---
id: "operator_reference_interface_component_admin_reports_menuitemsalesreport"
title: "Menu Item Sales Report — controls and fields"
module: "reports"
description: "Menu Item Sales Report — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reports", "menu", "item", "sales", "report", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_reports_report_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/reports"]
source_references: ["frontend/src/component/Admin/Reports/MenuItemSalesReport.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Menu Item Sales Report — controls and fields

This reference records the controls and fields declared by `MenuItemSalesReport`. Use [report controls](../../modules/reports/report_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Reports/MenuItemSalesReport.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`No menu items match your filters. No menu item sales found`, `Unable to load report`, `Filters`, `Top Selling Items`, `Revenue by Category`, `Menu Item Sales`, `Category Performance`, `Sales Trend`, `Insights`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Rank | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Gross Sales | `See parent row data and linked procedure.` |
| th | Discount | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Cancelled Qty | `See parent row data and linked procedure.` |
| th | Category | `See parent row data and linked procedure.` |
| th | Items Sold | `See parent row data and linked procedure.` |
| th | Units Sold | `See parent row data and linked procedure.` |
| th | Gross Sales | `See parent row data and linked procedure.` |
| th | Discount | `See parent row data and linked procedure.` |
| th | Net Sales | `See parent row data and linked procedure.` |
| th | % of Sales | `See parent row data and linked procedure.` |
| th | Avg Item Revenue | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Clear Filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear Filters |
| Location | MenuItemSalesReport; JSX button; handler onReset |
| Appears when | filtered |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear Filters.  |
| Handler / destination | onReset |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: {label}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {label} |
| Location | MenuItemSalesReport; JSX button; handler () =&gt; onSort(field) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {label}.  |
| Handler / destination | () =&gt; onSort(field) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Include Zero-Sales Items

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Include Zero-Sales Items |
| Location | MenuItemSalesReport; JSX form; handler (event) =&gt; { event.preventDefault(); onGenerate(config); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Include Zero-Sales Items.  |
| Handler / destination | (event) =&gt; { event.preventDefault(); onGenerate(config); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | MenuItemSalesReport; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuItemSalesReport; JSX button; handler (event) =&gt; { event.preventDefault(); onGenerate(config); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | generating \|\| config.startDate &gt; config.endDate |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (event) =&gt; { event.preventDefault(); onGenerate(config); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Retry

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Retry |
| Location | MenuItemSalesReport; JSX button; handler () =&gt; setRetryKey((value) =&gt; value + 1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Retry.  |
| Handler / destination | () =&gt; setRetryKey((value) =&gt; value + 1) |
| Local UI result | setRetryKey |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Retry

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Retry |
| Location | MenuItemSalesReport; JSX button; handler () =&gt; setRetryKey((value) =&gt; value + 1) |
| Appears when | error |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Retry.  |
| Handler / destination | () =&gt; setRetryKey((value) =&gt; value + 1) |
| Local UI result | setRetryKey |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | MenuItemSalesReport; JSX button; handler resetFilters |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | resetFilters |
| Local UI result | setFilters |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Advanced Filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Advanced Filters |
| Location | MenuItemSalesReport; JSX button; handler () =&gt; setShowAdvanced((value) =&gt; !value) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Advanced Filters.  |
| Handler / destination | () =&gt; setShowAdvanced((value) =&gt; !value) |
| Local UI result | setShowAdvanced |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuItemSalesReport; JSX button; handler () =&gt; updateFilter("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc") |
| Appears when | showAdvanced |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; updateFilter("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc") |
| Local UI result | setFilters |

Trace symbols: `updateFilter`.

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: From | date; config.startDate | true | config.startDate | max=config.endDate | read-only=false; disabled=false |
| <a id="field-2"></a> F2: To | date; config.endDate | true | config.endDate | min=config.startDate | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Category | select; config.category | Not declared; see submit validation | config.category | ; choices: All Categories [all] | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Report Type | select; config.reportType | Not declared; see submit validation | config.reportType | ; choices: Complete Menu Item Sales Report [complete], Top Selling Items [top], Least Selling Items [bottom], Category Sales Report [category], All Menu Items Ranked [all_ranked] | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Rank By | select; config.rankBy | Not declared; see submit validation | config.rankBy | ; choices: Quantity Sold [quantity], Revenue [revenue] | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Number of Items | select; config.limit | Not declared; see submit validation | config.limit | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=!['top', 'bottom'].includes(config.reportType) |
| <a id="field-7"></a> F7: Sort By | select; config.sortBy | Not declared; see submit validation | config.sortBy | ; choices: Quantity Sold [quantity], Revenue [revenue], Average Price [average_price], Number of Orders [orders] | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Sort Order | select; config.sortOrder | Not declared; see submit validation | config.sortOrder | ; choices: High to Low [desc], Low to High [asc] | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Include Zero-Sales Items | checkbox; config.includeZeroSales | Not declared; see submit validation | config.includeZeroSales | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: {label} | checkbox; config.sections[key] | Not declared; see submit validation | config.sections[key] | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Search item | search; filters.search | Not declared; see submit validation | filters.search | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Category | select; filters.category | Not declared; see submit validation | filters.category | ; choices: All Categories [all] | read-only=false; disabled=false |
| <a id="field-13"></a> F13: Sales Ranking | select; filters.ranking | Not declared; see submit validation | filters.ranking | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-14"></a> F14: Rank By | select; filters.rankBy | Not declared; see submit validation | filters.rankBy | ; choices: Quantity Sold [quantity], Revenue [revenue] | read-only=false; disabled=false |
| <a id="field-15"></a> F15: Sales Status | select; filters.salesStatus | Not declared; see submit validation | filters.salesStatus | ; choices: All [all], Selling [selling], Zero Sales [zero] | read-only=false; disabled=false |
| <a id="field-16"></a> F16: Include Zero-Sales Items | checkbox; filters.includeZeroSales | Not declared; see submit validation | filters.includeZeroSales | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when showAdvanced |
| <a id="field-17"></a> F17: Sort By | select; filters.sortBy | Not declared; see submit validation | filters.sortBy | ; choices: Quantity Sold [quantity], Revenue [revenue], Average Price [average_price], Number of Orders [orders], % of Sales [percentage_sales] | read-only=false; disabled=false; shown when showAdvanced |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | The menu item sales report could not be loaded. |
| `toast.success` | Menu item sales PDF generated. |
| `toast.error` | PDF generation failed. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menu_item_sales.clear_filters` | Clear Filters | پاک‌کردن فیلترها | فلټرونه پاکول |
| `menu_item_sales.cancel` | Cancel | لغو | لغوه |
| `menu_item_sales.generating_pdf` | Generating PDF... | در حال ایجاد PDF... | PDF جوړېږي... |
| `menu_item_sales.generate_pdf` | Generate PDF | ایجاد PDF | PDF جوړول |
| `menu_item_sales.retry` | Retry | تلاش دوباره | بیا هڅه |
| `menu_item_sales.reset` | Reset | بازنشانی | بیا تنظیم |
| `menu_item_sales.advanced_filters` | Advanced Filters | فیلترهای پیشرفته | پرمختللي فلټرونه |
| `menu_item_sales.sort_order` | Sort Order | ترتیب مرتب‌سازی | د ترتیب لوری |
| `menu_item_sales.all_categories` | All Categories | همه دسته‌بندی‌ها | ټولې کټګورۍ |
| `menu_item_sales.pdf_complete` | Complete Menu Item Sales Report | گزارش کامل فروش اقلام منو | د مینو توکو د پلور بشپړ راپور |
| `menu_item_sales.pdf_top` | Top Selling Items | اقلام پرفروش | ډېر پلورل شوي توکي |
| `menu_item_sales.pdf_bottom` | Least Selling Items | اقلام کم‌فروش | کم پلورل شوي توکي |
| `menu_item_sales.pdf_category` | Category Sales Report | گزارش فروش دسته‌بندی | د کټګورۍ د پلور راپور |
| `menu_item_sales.pdf_all_ranked` | All Menu Items Ranked | رتبه‌بندی همه اقلام منو | د مینو د ټولو توکو درجه‌بندي |
| `menu_item_sales.quantity_sold` | Quantity Sold | تعداد فروخته‌شده | پلورل شوی مقدار |
| `menu_item_sales.revenue` | Revenue | درآمد | عاید |
| `menu_item_sales.average_price` | Average Price | میانگین قیمت | منځنۍ بیه |
| `menu_item_sales.number_of_orders` | Number of Orders | تعداد سفارش‌ها | د فرمایشونو شمېر |
| `menu_item_sales.high_to_low` | High to Low | زیاد به کم | له لوړ څخه ټیټ |
| `menu_item_sales.low_to_high` | Low to High | کم به زیاد | له ټیټ څخه لوړ |
| `menu_item_sales.search_item` | Search item | جستجوی قلم | توکی ولټوئ |
| `menu_item_sales.category` | Category | دسته‌بندی | کټګوري |
| `menu_item_sales.sales_ranking` | Sales Ranking | رتبه‌بندی فروش | د پلور درجه‌بندي |
| `menu_item_sales.all_menu_items` | All Menu Items | همه اقلام منو | د مینو ټول توکي |
| `menu_item_sales.rank_by` | Rank By | رتبه‌بندی بر اساس | درجه‌بندي پر |
| `menu_item_sales.sales_status` | Sales Status | وضعیت فروش | د پلور حالت |
| `menu_item_sales.all` | All | همه | ټول |
| `menu_item_sales.selling` | Selling | دارای فروش | پلورل کېدونکي |
| `menu_item_sales.zero_sales` | Zero Sales | بدون فروش | صفر پلور |
| `menu_item_sales.percentage_sales` | % of Sales | درصد فروش | د پلور سلنه |

## Related interface references

- [modules shared erp components tablepagination](modules_shared_erp_components_tablepagination.md)
- [component admin reports reportheader](component_admin_reports_reportheader.md)
- [modules shared erp components modal](modules_shared_erp_components_modal.md)
