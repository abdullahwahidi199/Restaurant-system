---
id: "operator_reference_interface_component_admin_menumanagement_catagories"
title: "Catagories — controls and fields"
module: "menu"
description: "Catagories declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["menu", "catagories", "controls", "fields"]
roles: []
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/MenuManagement/Catagories.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Catagories — controls and fields

This reference records the controls and fields declared by `Catagories`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/Catagories.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {c.name}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {c.name} |
| Location | Catagories; JSX button; handler () =&gt; handleCategoryClick(c.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {c.name}.  |
| Handler / destination | () =&gt; handleCategoryClick(c.id) |
| Local UI result | setSelectedCategoryId |

Trace symbols: `handleCategoryClick`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | Catagories; JSX span; handler (e) =&gt; { e.stopPropagation(); setEditingCategory(c); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); setEditingCategory(c); } |
| Local UI result | setEditingCategory |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.double_click_to_edit_015d3e19` | Double click to edit | برای ویرایش دوبار کلیک کنید | د ایډیټ لپاره دوه ځله کلیک وکړئ |

## Related interface references

- [component admin menumanagement categorydeletemodal](component_admin_menumanagement_categorydeletemodal.md)
- [component admin menumanagement editcategorymodal](component_admin_menumanagement_editcategorymodal.md)
- [component admin menumanagement menulist](component_admin_menumanagement_menulist.md)
