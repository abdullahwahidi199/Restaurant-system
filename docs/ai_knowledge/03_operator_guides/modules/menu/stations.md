---
id: "operator_modules_menu_stations"
title: "Configure preparation stations and kitchen assignments"
module: "menu"
description: "Create or edit preparation stations, set active/default state, and connect menu routing with staff kitchen assignments."
keywords: ["menu", "configure", "preparation", "stations", "kitchen", "assignments", "preparation station", "Main Kitchen", "station routing"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_employees_staff", "operator_modules_kitchen_preparation", "operator_reference_interface_component_admin_stations_stationsmanagement", "operator_reference_interface_component_admin_stations_stationformmodal", "operator_reference_interface_component_admin_stations_stationdeletemodal", "operator_reference_backend_menu_fields", "operator_reference_backend_menu_validation", "operator_reference_backend_menu_access"]
frontend_routes: ["/admin/dashboard/stations", "/inventory-manager/stations", "/operations-manager/stations"]
source_references: ["frontend/src/component/Admin/stations/StationsManagement.jsx", "frontend/src/component/Admin/stations/StationFormModal.jsx", "frontend/src/component/Admin/stations/StationDeleteModal.jsx", "backend/backend/menu/models.py:Station", "backend/backend/menu/serializers.py:StationSerializer", "backend/backend/menu/views.py", "backend/backend/orders/seriailizers.py:get_order_item_station"]
status: "source_verified"
---

# Configure preparation stations and kitchen assignments

## Open preparation stations

Admin/BranchAdmin: **Restaurant → Stations**, `/admin/dashboard/stations`. Inventory/Operations Manager have equivalent `/stations` routes in their portals. Active restaurant/branch applies. Stations route orders to the right preparation employees; assigning a staff station is done in the staff form, not by editing an order line.

## Create, edit, or delete a station

The station page lists names, localized names, branch, active/default state and description. Search/list controls change only the view. Create action opens **Create Station**; row edit opens **Update Station**. Delete uses `StationDeleteModal`; inspect its dependencies/default warning before accepting. A removed/inactive station can affect kitchen routing. No restore button exists; default constraints and dependent records may reject deletion.

## Station form fields

| Form label | Required/default | Meaning and validation |
|---|---|---|
| Station Name | Yes, empty | Text; custom validation **Station name is required.**; backend model max/unique constraints in menu reference. |
| Name in Dari | Optional, empty | Localized name text. |
| Name in Pashto | Optional, empty | Localized name text. |
| Description | Optional, empty | Notes on what is prepared there. |
| Assigned Branch | Optional selector/context | Allowed branch choices from API. Check active branch; server scoping still applies. |
| Default station | Checkbox, false | Default kitchen selection for unrouted/legacy items; model enforces default behavior when saved. |
| Active | Checkbox, true | Determines availability for active routing/selection. |

## Submit the station form

Open create/edit, fill name and intended branch/status, then **Create Station** or **Update Station**. **Saving...** disables submission; **Cancel**/X closes without saving local edits. Backend errors use detail/name error or **Failed to save station.** Success invokes parent refresh/close. Changes are editable later where allowed; deleting is distinct from marking inactive.

## Assign menu items and staff to stations

Next assign Menu Item/Platter **Station** and staff **Kitchen Stations**. Kitchen whole-order start/ready uses staff assigned stations; an unassigned kitchen employee currently handles all stations. Missing nullable item station resolves to default Main Kitchen where found. Verify that each active item is visible in the intended kitchen queue before service. See [staff](../employees/staff.md) and [preparation](../kitchen/preparation.md).

## Detailed controls, fields, and server rules

- [Stations Management — controls and fields](../../reference/interface/component_admin_stations_stationsmanagement.md)
- [Station Form Modal — controls and fields](../../reference/interface/component_admin_stations_stationformmodal.md)
- [Station Delete Modal — controls and fields](../../reference/interface/component_admin_stations_stationdeletemodal.md)
- [Menu — backend fields reference](../../reference/backend/menu_fields.md)
- [Menu — backend validation reference](../../reference/backend/menu_validation.md)
- [Menu — backend access reference](../../reference/backend/menu_access.md)
