---
id: "operator_reference_interface_component_admin_order_orderfilters"
title: "Order Filters — controls and fields"
module: "orders"
description: "Order Filters — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "order", "filters", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_orders_order_lists", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/orders", "/manager"]
source_references: ["frontend/src/component/Admin/order/OrderFilters.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Filters — controls and fields

This reference records the controls and fields declared by `OrderFilters`. Use [order lists](../../modules/orders/order_lists.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/order/OrderFilters.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Apply

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Apply |
| Location | OrderFilters; JSX ActionButton; handler () =&gt; onSearch(1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Apply.  |
| Handler / destination | () =&gt; onSearch(1) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search by name or phone | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Search by name or phone | SearchBox; filters.search | Not declared; see submit validation | filters.search | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Status | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Status | select; status | Not declared; see submit validation | filters.status | ; choices: All Statuses [], Pending [pending], In Progress [in_progress], Ready [ready], Completed [completed], Cancelled [cancelled] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `filters.apply` | Apply | اعمال | پلي کول |
| `filters.search_placeholder` | Search by name or phone | جستجو بر اساس نام یا شماره | د نوم یا تلیفون له مخې لټون |
| `table.status` | Status | وضعیت | حالت |
| `filters.all_statuses` | All Statuses | همه وضعیت‌ها | ټول حالتونه |
| `status.pending` | Pending | در انتظار | په انتظار کې |
| `status.in_progress` | In Progress | در حال انجام | د ترسره کېدو په حال کې |
| `status.ready` | Ready | آماده | چمتو |
| `status.completed` | Completed | تکمیل شده | بشپړ شوی |
| `status.cancelled` | Cancelled | لغو شده | لغوه شوی |

## Related interface references

- [modules shared erp components toolbar](modules_shared_erp_components_toolbar.md)
- [modules shared erp components searchbox](modules_shared_erp_components_searchbox.md)
- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
