---
id: "operator_reference_backend_expenses_fields"
title: "Expenses — backend fields reference"
module: "expenses"
description: "Static expenses implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["expenses", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_expenses_expenses"]
frontend_routes: []
source_references: ["backend/backend/expenses/models.py", "backend/backend/expenses/serializers.py", "backend/backend/expenses/signals.py", "backend/backend/expenses/views.py"]
status: "source_verified"
---

# Expenses — backend fields reference

Static implementation reference for `expenses`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/expenses/models.py`

### Expenses

Accepted choice values: `CURRENCY_CHOICES = [ ('AFN', 'Afghani'), ('USD', 'US Dollar'), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=200)` |
| `amount` | `models.DecimalField( max_digits=10, decimal_places=2, help_text="Original amount entered by user" )` |
| `currency` | `models.CharField( max_length=3, choices=CURRENCY_CHOICES, default='AFN' )` |
| `exchange_rate` | `models.DecimalField( max_digits=10, decimal_places=2, default=1, help_text="1 USD = ? AFN" )` |
| `amount_afn` | `models.DecimalField( max_digits=12, decimal_places=2, editable=False )` |
| `date` | `models.DateField(default=timezone.now)` |
| `description` | `models.TextField(blank=True)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='expenses' )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="expenses", null=True, blank=True, )` |

### ExpenseHistory

Accepted choice values: `ACTION_CHOICES = [ ('created', 'Created'), ('updated', 'Updated'), ('deleted', 'Deleted') ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=200)` |
| `amount` | `models.DecimalField(max_digits=10, decimal_places=2)` |
| `currency` | `models.CharField( max_length=3, choices=Expenses.CURRENCY_CHOICES, default='AFN' )` |
| `exchange_rate` | `models.DecimalField( max_digits=10, decimal_places=2, default=1 )` |
| `amount_afn` | `models.DecimalField( max_digits=12, decimal_places=2 )` |
| `date_time` | `models.DateTimeField(default=timezone.now)` |
| `changed_fields` | `models.JSONField(blank=True, null=True)` |
| `action` | `models.CharField( max_length=10, choices=ACTION_CHOICES, default='created' )` |
| `description` | `models.TextField(blank=True)` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='expense_histories' )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="expense_histories", null=True, blank=True, )` |

## `backend/backend/expenses/serializers.py`

### ExpensesSerializer

Serializer/model rules: `model = Expenses`; `fields = '__all__'`; `read_only_fields = ['restaurant', 'branch']`.


### ExpenseHistorySerializer

Serializer/model rules: `model=ExpenseHistory`; `fields='__all__'`.



A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Record, edit, print, and review expense history](../../modules/expenses/expenses.md)
