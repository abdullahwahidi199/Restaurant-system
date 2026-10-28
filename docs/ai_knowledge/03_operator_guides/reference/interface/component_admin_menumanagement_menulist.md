---
id: "operator_reference_interface_component_admin_menumanagement_menulist"
title: "Menu List — controls and fields"
module: "menu"
description: "Menu List declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["menu", "list", "controls", "fields"]
roles: []
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/MenuManagement/MenuList.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Menu List — controls and fields

This reference records the controls and fields declared by `MenuList`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/MenuList.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{item.name}`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Delete Category

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete Category |
| Location | MenuList; JSX button; handler onDeleteCategory |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete Category.  |
| Handler / destination | onDeleteCategory |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Add Item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Item |
| Location | MenuList; JSX button; handler () =&gt; setItemAddModal(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Item.  |
| Handler / destination | () =&gt; setItemAddModal(true) |
| Local UI result | setItemAddModal |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Add Platter

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Platter |
| Location | MenuList; JSX button; handler () =&gt; setPlatterAddModal(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Platter.  |
| Handler / destination | () =&gt; setPlatterAddModal(true) |
| Local UI result | setPlatterAddModal |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuList; JSX Link; handler item.items ? `${dashboardBase}/menu/platter/${item.id}` : `${dashboardBase}/menu/item/${item.id}` |
| Appears when | filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | item.items ? `${dashboardBase}/menu/platter/${item.id}` : `${dashboardBase}/menu/item/${item.id}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search menu items... | text; searchTerm | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `delete_category` | Delete Category | حذف دسته‌بندی | کټګوري ړنګه کړئ |
| `add_item` | Add Item | افزودن آیتم | توکی اضافه کړئ |
| `legacy.add_platter_058c3dc3` | Add Platter | Add Platter | Add Platter |
| `no_image` | No image | تصویر موجود نیست | انځور نشته |
| `legacy.afs_2050680c` | Afs | Afs | Afs |
| `no_data` | N/A | ندارد | نه شته |
| `search_menu_items` | Search menu items... | جستجوی آیتم‌های منو... | د مېنو توکي ولټوئ... |

## Related interface references

- [component admin menumanagement additemmodal](component_admin_menumanagement_additemmodal.md)
- [component admin menumanagement platteraddmodal](component_admin_menumanagement_platteraddmodal.md)
