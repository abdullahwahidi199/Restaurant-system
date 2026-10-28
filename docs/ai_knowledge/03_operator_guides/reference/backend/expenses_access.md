---
id: "operator_reference_backend_expenses_access"
title: "Expenses — backend access reference"
module: "expenses"
description: "Static expenses implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["expenses", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_expenses_expenses"]
frontend_routes: []
source_references: ["backend/backend/expenses/models.py", "backend/backend/expenses/serializers.py", "backend/backend/expenses/signals.py", "backend/backend/expenses/views.py"]
status: "source_verified"
---

# Expenses — backend access reference

Static implementation reference for `expenses`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/expenses/views.py`

### ExpenseDetailsView

`[IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager, IsSameRestaurant, IsRestaurantActive]`

### ExpenseHistoryApiView

`[IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager, IsSameRestaurant, IsRestaurantActive]`

### expensesApi

`api_view(["GET", "POST"])`; `permission_classes([IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager, IsSameRestaurant, IsRestaurantActive])`

## Related operating procedures

- [Record, edit, print, and review expense history](../../modules/expenses/expenses.md)
