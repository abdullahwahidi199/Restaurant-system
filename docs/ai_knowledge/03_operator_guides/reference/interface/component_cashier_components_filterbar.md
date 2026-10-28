---
id: "operator_reference_interface_component_cashier_components_filterbar"
title: "Filter Bar — controls and fields"
module: "billing"
description: "Filter Bar — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["billing", "filter", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/components/FilterBar.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Filter Bar — controls and fields

This reference records the controls and fields declared by `FilterBar`. Use [cashier](../../modules/billing/cashier.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/FilterBar.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search orders | text; search | Not declared; see submit validation | f.search | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Filter by type | select; type | Not declared; see submit validation | f.type | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.search_by_order_id_customer_or_table_88f20d66` | Search by Order ID, Customer or Table | جستجو بر اساس شناسه سفارش، مشتری یا جدول | د فرمایش پیژند، پیرودونکی یا جدول له مخې لټون |
| `legacy.search_orders_7ab30154` | Search orders | ترتیب جستجو | د لټون امرونه |
| `legacy.filter_by_type_e55aa1d9` | Filter by type | فیلتر بر اساس نوع | د ډول له مخې فلټر کول |
