---
id: "operator_reference_interface_component_customer_platterdetails"
title: "Platter Details — controls and fields"
module: "public_ordering"
description: "Platter Details declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["public_ordering", "platter", "details", "controls", "fields"]
roles: []
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Customer/PlatterDetails.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Platter Details — controls and fields

This reference records the controls and fields declared by `PlatterDetails`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/PlatterDetails.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{platter.name?.replace("-", " ")}`, `Ingredients`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | PlatterDetails; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menuDetails.close` | Close | بستن | بندول |
