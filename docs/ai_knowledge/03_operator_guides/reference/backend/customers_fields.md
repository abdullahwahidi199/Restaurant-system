---
id: "operator_reference_backend_customers_fields"
title: "Customers — backend fields reference"
module: "customers"
description: "Static customers implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["customers", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/customers/models.py", "backend/backend/customers/serializers.py", "backend/backend/customers/views.py"]
status: "source_verified"
---

# Customers — backend fields reference

Static implementation reference for `customers`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/customers/models.py`

### Customer

| Field | Actual type, defaults and constraints |
|---|---|
| `user` | `models.OneToOneField(User,on_delete=models.SET_NULL,null=True,blank=True)` |
| `phone` | `models.CharField(max_length=15)` |
| `address` | `models.TextField(null=True)` |
| `joined_at` | `models.DateTimeField(auto_now_add=True)` |
| `date_of_birth` | `models.DateField(null=True, blank=True)` |

### CustomerAddress

Serializer/model rules: `ordering = ["-is_default", "-updated_at", "id"]`; `indexes = [ models.Index( fields=["customer", "is_default"], name="cust_addr_default_idx", ), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `customer` | `models.ForeignKey( Customer, on_delete=models.CASCADE, related_name="addresses", )` |
| `label` | `models.CharField(max_length=40, default="Home")` |
| `address_line` | `models.TextField()` |
| `area` | `models.CharField(max_length=120, blank=True)` |
| `city` | `models.CharField(max_length=120, blank=True)` |
| `instructions` | `models.TextField(blank=True)` |
| `latitude` | `models.FloatField(null=True, blank=True)` |
| `longitude` | `models.FloatField(null=True, blank=True)` |
| `is_default` | `models.BooleanField(default=False)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

## `backend/backend/customers/serializers.py`

### CustomerProfileSerializer

Serializer/model rules: `model = Customer`; `fields = ['username','email','id', 'phone', 'joined_at','address','date_of_birth','orders_count']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `username` | `serializers.CharField(source='user.username', read_only=True)` |
| `email` | `serializers.EmailField(source='user.email', read_only=True)` |
| `orders_count` | `serializers.SerializerMethodField()` |

### CustomerSignupSerializer

Serializer/model rules: `model = User`; `fields = [ 'username', 'password', 'email', 'phone', 'address', 'date_of_birth' ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `password` | `serializers.CharField(write_only=True)` |
| `phone` | `serializers.CharField(required=True)` |
| `address` | `serializers.CharField(required=True)` |
| `date_of_birth` | `serializers.DateField(required=True)` |
| `email` | `serializers.EmailField(required=False, allow_blank=True)` |

### CustomerLoginSerializer

| Field | Actual type, defaults and constraints |
|---|---|
| `username` | `serializers.CharField()` |
| `password` | `serializers.CharField(write_only=True)` |

### CustomerAddressSerializer

Serializer/model rules: `model = CustomerAddress`; `fields = [ "id", "label", "address_line", "area", "city", "instructions", "latitude", "longitude", "is_default", "created_at", "updated_at", ]`; `read_only_fields = ["id", "created_at", "updated_at"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `latitude` | `serializers.FloatField(required=False, allow_null=True, min_value=-90, max_value=90)` |
| `longitude` | `serializers.FloatField(required=False, allow_null=True, min_value=-180, max_value=180)` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
