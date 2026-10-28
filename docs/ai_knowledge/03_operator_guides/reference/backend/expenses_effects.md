---
id: "operator_reference_backend_expenses_effects"
title: "Expenses — backend effects reference"
module: "expenses"
description: "Static expenses implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["expenses", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_expenses_expenses"]
frontend_routes: []
source_references: ["backend/backend/expenses/models.py", "backend/backend/expenses/serializers.py", "backend/backend/expenses/signals.py", "backend/backend/expenses/views.py"]
status: "source_verified"
---

# Expenses — backend effects reference

Static implementation reference for `expenses`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/expenses/models.py`

### Expenses.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.amount_afn = self.amount * self.exchange_rate`
- `self.amount_afn = self.amount`
- `super().save(*args, **kwargs)`

## `backend/backend/expenses/signals.py`

### store_old_expense

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance._old_values = Expenses.objects.get(pk=instance.pk)`
- `instance._old_values = None`

### log_expense_save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ExpenseHistory.objects.create( restaurant=instance.restaurant, branch=instance.branch, name=instance.name, amount=instance.amount, currency=instance.currency, exchange_rate=instance.exchange_rate, amount_afn=instance.amount_afn, action='created', description=instance.description )`
- `ExpenseHistory.objects.create( restaurant=instance.restaurant, branch=instance.branch, name=instance.name, amount=instance.amount, currency=instance.currency, exchange_rate=instance.exchange_rate, amount_afn=instance.amount_afn, action='updated', description=instance.description, changed_fields=changes )`

### log_expense_delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `ExpenseHistory.objects.create( restaurant=instance.restaurant, branch=instance.branch, name=instance.name, amount=instance.amount, currency=instance.currency, exchange_rate=instance.exchange_rate, amount_afn=instance.amount_afn, action='deleted', description=instance.description )`

## `backend/backend/expenses/views.py`

### expensesApi

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=get_active_branch(request))`

Named effect helpers: `create_audit_log`.

### ExpenseDetailsView.perform_update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `create_audit_log`.

### ExpenseDetailsView.perform_destroy

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.delete()`

Named effect helpers: `create_audit_log`.

## Related operating procedures

- [Record, edit, print, and review expense history](../../modules/expenses/expenses.md)
