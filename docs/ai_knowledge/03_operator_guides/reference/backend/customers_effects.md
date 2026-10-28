---
id: "operator_reference_backend_customers_effects"
title: "Customers — backend effects reference"
module: "customers"
description: "Static customers implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["customers", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/customers/models.py", "backend/backend/customers/serializers.py", "backend/backend/customers/views.py"]
status: "source_verified"
---

# Customers — backend effects reference

Static implementation reference for `customers`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/customers/serializers.py`

### CustomerSignupSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `User.objects.create(username=username,email=email)`
- `user.save()`
- `Customer.objects.create( user=user, phone=phone, address=address, date_of_birth=date_of_birth )`

### CustomerAddressSerializer.create

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().create(validated_data)`
- `customer.addresses.exclude(pk=address.pk).update(is_default=False)`

### CustomerAddressSerializer.update

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(instance, validated_data)`
- `address.customer.addresses.exclude(pk=address.pk).update(is_default=False)`

## `backend/backend/customers/views.py`

### CustomerOrdersView.get

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `pagination.page_size = 20`

### CustomerOrderCancelView.post

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.status = "cancelled"`
- `order.save(update_fields=["status", "updated_at"])`

### CustomerAddressListCreateView.post

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(customer=customer)`

### CustomerAddressDetailView.patch

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

### CustomerAddressDetailView.delete

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `address.delete()`
- `replacement.is_default = True`
- `replacement.save(update_fields=["is_default", "updated_at"])`

### SignupView.post

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
