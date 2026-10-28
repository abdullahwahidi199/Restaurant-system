---
id: "operator_reference_interface_component_branch_branchselectionpage"
title: "Branch Selection Page — controls and fields"
module: "navigation"
description: "Branch Selection Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "branch", "selection", "page", "controls", "fields"]
roles: ["Authenticated staff"]
related_docs: ["operator_navigation_application_navigation", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/select-branch"]
source_references: ["frontend/src/component/branch/BranchSelectionPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Branch Selection Page — controls and fields

This reference records the controls and fields declared by `BranchSelectionPage`. Use [application navigation](../../navigation/application_navigation.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/branch/BranchSelectionPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Select branch`, `Select branch`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | BranchSelectionPage; JSX button; handler () =&gt; setSelectedBranchId(branch.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Authenticated staff |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setSelectedBranchId(branch.id) |
| Local UI result | setSelectedBranchId |

Record/status result, downstream effects, failure recovery, and reversal: [application navigation](../../navigation/application_navigation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | BranchSelectionPage; JSX button; handler handleContinue |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !selectedBranchId \|\| loading |
| Permission | Parent route role plus endpoint enforcement. Authenticated staff |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleContinue |
| Local UI result | setLoading |

Trace symbols: `handleContinue`.

Record/status result, downstream effects, failure recovery, and reversal: [application navigation](../../navigation/application_navigation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.switching_8c8980ce` | Switching... | تعویض... | بدلول... |
| `legacy.continue_2e026239` | Continue | ادامه دهید | دوام ورکړه |

## Branch selection procedure

[Sign in, choose a branch, and navigate](../../navigation/application_navigation.md) explains opening this control, active-branch scope and role restrictions.
