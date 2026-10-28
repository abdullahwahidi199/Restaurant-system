---
id: "operator_reference_interface_rootlayout"
title: "RootLayout — shared application shell"
module: "navigation"
description: "RootLayout shared mounting and UI reference. App.jsx mounts RootLayout inside the root AppDomainGuard and renders routed child pages through Outlet. It is the shared public/staff application shell, not an unmounted or standalone operator feature."
keywords: ["interface_reference", "root", "layout", "controls", "fields"]
roles: []
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/"]
source_references: ["frontend/src/rootLayout.jsx", "frontend/src/i18n.js", "frontend/src/App.jsx", "frontend/src/api/ReauireAuth.jsx"]
status: "needs_verification"
availability: "shared"
---

# RootLayout — shared application shell

This reference records the controls and fields declared by `RootLayout`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/rootLayout.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Shared mounting and verification boundary

App.jsx mounts RootLayout inside the root AppDomainGuard and renders routed child pages through Outlet. It is the shared public/staff application shell, not an unmounted or standalone operator feature. Static mounting is established; the existing `needs_verification` status is retained because no running UI was tested. Parent paths in metadata are context, not additional pages or permission grants.
