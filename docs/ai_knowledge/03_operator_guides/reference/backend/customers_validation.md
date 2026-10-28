---
id: "operator_reference_backend_customers_validation"
title: "Customers — backend validation reference"
module: "customers"
description: "Static customers implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["customers", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/customers/models.py", "backend/backend/customers/serializers.py", "backend/backend/customers/views.py"]
status: "source_verified"
---

# Customers — backend validation reference

Static implementation reference for `customers`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/customers/serializers.py`

### CustomerLoginSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `serializers.ValidationError("Invalid credentials or no customer profile")` |

### CustomerAddressSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `(latitude is None) != (longitude is None)` | `serializers.ValidationError( {"location": "Latitude and longitude must be provided together."} )` |
| `latitude is not None and not (math.isfinite(latitude) and math.isfinite(longitude))` | `serializers.ValidationError({"location": "Enter valid coordinates."})` |

## `backend/backend/customers/views.py`

### CustomerProfileView.get

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response( {"error": "Access denied"}, status=403 )` |

### CustomerOrdersView.get

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |

### CustomerOrdersView.post

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |
| `not order` | `Response( {"detail": "Please review checkout and try again with a new request.", "code": "request_conflict"}, status=status.HTTP_409_CONFLICT, )` |

### MarketplaceCheckoutValidationView.post

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |

### CustomerOrderDetailView.get

| Trigger / condition | Server result or message |
|---|---|
| `not order` | `Response({"detail": "Order not found."}, status=404)` |

### CustomerOrderCancelView.post

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |
| `not order` | `Response({"detail": "Order not found."}, status=404)` |
| `order.status != "pending"` | `Response( {"detail": "This order can no longer be cancelled."}, status=status.HTTP_409_CONFLICT, )` |
| `(timezone.now() - order.created_at).total_seconds() &gt; 120` | `Response( {"detail": "The cancellation window has expired."}, status=status.HTTP_409_CONFLICT, )` |

### CustomerOrderSocketTicketView.post

| Trigger / condition | Server result or message |
|---|---|
| `not order` | `Response({"detail": "Order not found."}, status=404)` |

### CustomerAddressListCreateView.get

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |

### CustomerAddressListCreateView.post

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |

### CustomerAddressDetailView.patch

| Trigger / condition | Server result or message |
|---|---|
| `not address` | `Response({"detail": "Address not found."}, status=404)` |

### CustomerAddressDetailView.delete

| Trigger / condition | Server result or message |
|---|---|
| `not address` | `Response({"detail": "Address not found."}, status=404)` |

### CustomerReviewsView.get

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)` |

### SignupView.post

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=400)` |

### LoginView.post

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Login is temporarily unavailable. Please try again shortly."}, status=status.HTTP_503_SERVICE_UNAVAILABLE, )` |
| `not user` | `Response( {"error": "Login is temporarily unavailable. Please try again shortly."}, status=status.HTTP_503_SERVICE_UNAVAILABLE, )` |
| `not user` | `Response({"error": "Invalid credentials"}, status=401)` |
| `not customer` | `Response( {"error": "Login is temporarily unavailable. Please try again shortly."}, status=status.HTTP_503_SERVICE_UNAVAILABLE, )` |
| `not customer` | `Response( {"error": "Invalid credentials"}, status=401 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Login is temporarily unavailable. Please try again shortly."}, status=status.HTTP_503_SERVICE_UNAVAILABLE, )` |

### CustomerReviewsView.get

| Trigger / condition | Server result or message |
|---|---|
| `not customer` | `Response({"error": "Access denied"}, status=403)` |

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
