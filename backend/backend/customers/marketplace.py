from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json

from django.core import signing
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import NotFound

from menu.models import MenuItem, Platter, PlatterItem
from orders.models import Order, OrderItem
from orders.utils.distance import calculate_distance_km
from restaurants.models import Branch, Restaurant

from .models import CustomerAddress


MONEY_STEP = Decimal("0.01")
FINAL_ORDER_STATUSES = {"completed", "delivered", "picked_up", "served", "cancelled"}


def money(value):
    return Decimal(str(value or 0)).quantize(MONEY_STEP, rounding=ROUND_HALF_UP)


class MarketplaceCartLineInputSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=("menu_item", "platter"))
    item_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=99)
    note = serializers.CharField(required=False, allow_blank=True, max_length=500)


class MarketplaceCheckoutInputSerializer(serializers.Serializer):
    restaurant_slug = serializers.SlugField()
    branch_slug = serializers.SlugField()
    order_type = serializers.ChoiceField(choices=("delivery", "takeaway"))
    address_id = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    contact_phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    note = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    delivery_instructions = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
    )
    idempotency_key = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=64,
    )
    quote_token = serializers.CharField(required=False, max_length=4096)
    items = MarketplaceCartLineInputSerializer(many=True, allow_empty=False)

    def validate(self, attrs):
        if attrs["order_type"] == "delivery" and not attrs.get("address_id"):
            raise serializers.ValidationError(
                {"address_id": "Choose a delivery address."}
            )
        if len(attrs["items"]) > 100:
            raise serializers.ValidationError({"items": "The cart has too many items."})
        identities = [
            (item["item_type"], item["item_id"])
            for item in attrs["items"]
        ]
        if len(identities) != len(set(identities)):
            raise serializers.ValidationError(
                {"items": "Each item may only appear once in the cart."}
            )
        return attrs


def get_marketplace_context(restaurant_slug, branch_slug, *, lock=False):
    today = timezone.localdate()
    restaurants = Restaurant.objects.select_related("subscription")
    if lock:
        restaurants = restaurants.select_for_update(of=("self",))
    restaurant = (
        restaurants
        .filter(
            slug=restaurant_slug,
            is_active=True,
            subscription__is_active=True,
            subscription__starts_at__lte=today,
            subscription__expires_at__gte=today,
        )
        .first()
    )
    if not restaurant:
        raise NotFound("This restaurant is currently unavailable.")
    branch = Branch.objects.filter(
        restaurant=restaurant,
        slug=branch_slug,
        is_active=True,
    ).first()
    if not branch:
        raise NotFound("This branch is currently unavailable.")
    from restaurants.serializers import _branch_is_open
    if _branch_is_open(branch) is False:
        raise serializers.ValidationError({"detail": "This branch is currently closed."})
    return restaurant, branch


def branch_value(branch, restaurant, field_name):
    value = getattr(branch, field_name, None)
    return value if value is not None else getattr(restaurant, field_name)


def _address_text(address):
    return ", ".join(
        value.strip()
        for value in (address.address_line, address.area, address.city)
        if value and value.strip()
    )


def _resolve_lines(restaurant, branch, raw_lines, *, lock=False):
    menu_ids = [
        line["item_id"] for line in raw_lines if line["item_type"] == "menu_item"
    ]
    platter_ids = [
        line["item_id"] for line in raw_lines if line["item_type"] == "platter"
    ]
    branch_scope = Q(branch=branch) | Q(branch__isnull=True)
    menu_queryset = MenuItem.objects.filter(id__in=menu_ids, restaurant=restaurant).filter(branch_scope)
    platter_queryset = Platter.objects.filter(id__in=platter_ids, restaurant=restaurant).filter(branch_scope)
    if lock:
        menu_queryset = menu_queryset.select_for_update()
        platter_queryset = platter_queryset.select_for_update()
    menu_items = {
        item.id: item
        for item in menu_queryset
    }
    platters = {
        item.id: item
        for item in platter_queryset
    }

    resolved = []
    for line in raw_lines:
        item = (
            menu_items.get(line["item_id"])
            if line["item_type"] == "menu_item"
            else platters.get(line["item_id"])
        )
        if item is None:
            raise serializers.ValidationError(
                {
                    "code": "item_unavailable",
                    "items": [
                        {
                            "item_type": line["item_type"],
                            "item_id": line["item_id"],
                            "message": "This item is no longer on the selected branch menu.",
                        }
                    ],
                }
            )
        if not item.is_available_for_branch(branch):
            raise serializers.ValidationError(
                {
                    "code": "item_unavailable",
                    "items": [
                        {
                            "item_type": line["item_type"],
                            "item_id": line["item_id"],
                            "message": f"{item.name} is no longer available.",
                        }
                    ],
                }
            )
        if isinstance(item, MenuItem) and item.uses_daily_production:
            production = item.get_production(branch=branch)
            remaining = production.quantity_remaining if production else 0
            if line["quantity"] > remaining:
                raise serializers.ValidationError(
                    {
                        "code": "item_quantity_unavailable",
                        "items": [
                            {
                                "item_type": line["item_type"],
                                "item_id": line["item_id"],
                                "available_quantity": remaining,
                                "message": f"Only {remaining} {item.name} remaining.",
                            }
                        ],
                    }
                )
        unit_price = money(item.get_effective_price(branch))
        resolved.append(
            {
                **line,
                "object": item,
                "name": item.name,
                "unit_price": unit_price,
                "subtotal": money(unit_price * line["quantity"]),
            }
        )
    production_demands = {}
    for line in resolved:
        item = line["object"]
        components = [(item, Decimal(line["quantity"]))] if isinstance(item, MenuItem) else [
            (component.menu_item, Decimal(component.quantity) * line["quantity"])
            for component in PlatterItem.objects.filter(platter=item).select_related("menu_item")
        ]
        for component, quantity in components:
            if component.restaurant_id != restaurant.id or component.branch_id not in (None, branch.id):
                raise serializers.ValidationError({"detail": f"{item.name} is unavailable at this branch."})
            if not component.is_available_for_branch(branch):
                raise serializers.ValidationError({"detail": f"{item.name} is currently unavailable."})
            if component.uses_daily_production:
                production_demands.setdefault(component.id, [component, Decimal("0")])[1] += quantity
    for component, quantity in production_demands.values():
        production = component.get_production(branch=branch)
        if not production or quantity > production.quantity_remaining:
            raise serializers.ValidationError({"detail": f"There are not enough portions of {component.name} for this cart."})
    return resolved


def validate_marketplace_checkout(customer, validated_data, *, lock=False):
    restaurant, branch = get_marketplace_context(
        validated_data["restaurant_slug"],
        validated_data["branch_slug"],
        lock=lock,
    )
    lines = _resolve_lines(restaurant, branch, validated_data["items"], lock=lock)
    subtotal = money(sum((line["subtotal"] for line in lines), Decimal("0.00")))
    order_type = validated_data["order_type"]
    address = None
    distance_km = None
    delivery_fee = Decimal("0.00")

    if order_type == "delivery":
        delivery_available = branch_value(
            branch,
            restaurant,
            "delivery_available",
        )
        if not delivery_available:
            raise serializers.ValidationError(
                {"code": "delivery_unavailable", "detail": "Delivery is not available from this branch."}
            )
        address = CustomerAddress.objects.filter(
            pk=validated_data.get("address_id"),
            customer=customer,
        ).first()
        if not address:
            raise serializers.ValidationError(
                {"address_id": "Choose a valid delivery address."}
            )
        if address.latitude is None or address.longitude is None:
            raise serializers.ValidationError(
                {
                    "code": "address_location_required",
                    "detail": "Add a map location to this address before requesting delivery.",
                }
            )
        origin_lat = branch.latitude if branch.latitude is not None else restaurant.latitude
        origin_lng = branch.longitude if branch.longitude is not None else restaurant.longitude
        if origin_lat is None or origin_lng is None:
            raise serializers.ValidationError(
                {
                    "code": "delivery_location_unavailable",
                    "detail": "Delivery location is not configured for this branch yet.",
                }
            )
        distance_km = calculate_distance_km(
            origin_lat,
            origin_lng,
            address.latitude,
            address.longitude,
        )
        radius = float(branch_value(branch, restaurant, "delivery_radius_km"))
        if distance_km > radius:
            raise serializers.ValidationError(
                {
                    "code": "outside_delivery_area",
                    "detail": "This address is outside the branch delivery area.",
                }
            )
        base_fee = money(branch_value(branch, restaurant, "base_delivery_fee"))
        price_per_km = money(branch_value(branch, restaurant, "price_per_km"))
        delivery_fee = money(
            base_fee + Decimal(str(distance_km)) * price_per_km
        )
        minimum = money(branch_value(branch, restaurant, "min_order_amount"))
        if subtotal < minimum:
            raise serializers.ValidationError(
                {
                    "code": "minimum_order",
                    "minimum_order": str(minimum),
                    "detail": f"The minimum delivery order is {minimum} AFN.",
                }
            )

    total = money(subtotal + delivery_fee)
    return {
        "restaurant": restaurant,
        "branch": branch,
        "address": address,
        "lines": lines,
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": total,
        "distance_km": round(distance_km, 2) if distance_km is not None else None,
        "order_type": order_type,
        "contact_phone": validated_data.get("contact_phone", "").strip() or customer.phone,
        "note": validated_data.get("note", "").strip(),
        "delivery_instructions": validated_data.get("delivery_instructions", address.instructions if address else "").strip(),
        "idempotency_key": validated_data.get("idempotency_key"),
    }


def quote_fingerprint(customer, data, checkout):
    scope = {
        "customer": customer.id,
        "restaurant": checkout["restaurant"].id,
        "branch": checkout["branch"].id,
        "type": checkout["order_type"],
        "address": _address_text(checkout["address"]) if checkout["address"] else None,
        "address_id": data.get("address_id") if checkout["address"] else None,
        "phone": checkout["contact_phone"],
        "note": checkout["note"],
        "instructions": checkout["delivery_instructions"],
        "coordinates": [checkout["address"].latitude, checkout["address"].longitude] if checkout["address"] else None,
        "saved_instructions": checkout["address"].instructions if checkout["address"] else None,
        "total": str(checkout["total"]),
        "items": [
            [line["item_type"], line["item_id"], line["quantity"], str(line["unit_price"]), line.get("note", "")]
            for line in checkout["lines"]
        ],
    }
    return hashlib.sha256(json.dumps(scope, sort_keys=True).encode()).hexdigest()


def sign_checkout_quote(customer, data, checkout):
    return signing.dumps(quote_fingerprint(customer, data, checkout), salt="marketplace-checkout-quote")


def checkout_payload(checkout):
    return {
        "valid": True,
        "restaurant": {
            "id": checkout["restaurant"].id,
            "name": checkout["restaurant"].name,
            "slug": checkout["restaurant"].slug,
        },
        "branch": {
            "id": checkout["branch"].id,
            "name": checkout["branch"].name,
            "slug": checkout["branch"].slug,
        },
        "order_type": checkout["order_type"],
        "payment_method": (
            "cash_on_delivery"
            if checkout["order_type"] == "delivery"
            else "cash_on_pickup"
        ),
        "distance_km": checkout["distance_km"],
        "subtotal": str(checkout["subtotal"]),
        "delivery_fee": str(checkout["delivery_fee"]),
        "discount": "0.00",
        "total": str(checkout["total"]),
        "items": [
            {
                "item_type": line["item_type"],
                "item_id": line["item_id"],
                "name": line["name"],
                "quantity": line["quantity"],
                "unit_price": str(line["unit_price"]),
                "subtotal": str(line["subtotal"]),
                "available": True,
            }
            for line in checkout["lines"]
        ],
    }


def serialize_customer_order(order):
    items = list(order.items.all())
    item_subtotal = sum(
        (item.get_subtotal() for item in items if item.status != "cancelled"),
        Decimal("0.00"),
    )
    total = money(order.get_total())
    discount = money(item_subtotal + order.delivery_fee - total)
    return {
        "id": order.id,
        "order_number": order.order_number or order.id,
        "order_type": order.order_type,
        "restaurant": order.restaurant.name if order.restaurant else None,
        "restaurant_slug": order.restaurant.slug if order.restaurant else None,
        "branch": order.branch.name if order.branch else None,
        "branch_slug": order.branch.slug if order.branch else None,
        "status": order.status,
        "status_display": order.get_status_display(),
        "subtotal": str(money(item_subtotal)),
        "delivery_fee": str(money(order.delivery_fee)),
        "discount": str(discount),
        "total": str(total),
        "address": order.address or None,
        "latitude": order.latitude,
        "longitude": order.longitude,
        "phone": order.phone,
        "note": order.note,
        "payment_method": (
            "cash_on_delivery" if order.order_type == "delivery" else "cash_on_pickup"
        ),
        "preparation_time": order.preparation_time,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "paid_at": order.paid_at,
        "is_final": order.status in FINAL_ORDER_STATUSES,
        "items": [
            {
                "id": item.id,
                "item_id": item.menu_item_id or item.platter_id,
                "type": "menu_item" if item.menu_item_id else "platter",
                "name": (
                    item.menu_item.name
                    if item.menu_item_id
                    else item.platter.name if item.platter_id else "Item"
                ),
                "quantity": item.quantity,
                "unit_price": str(money(item.price_at_order)),
                "subtotal": str(money(item.get_subtotal())),
                "note": item.description,
                "status": item.status,
            }
            for item in items
        ],
    }


@transaction.atomic
def create_marketplace_order(customer, validated_data):
    idempotency_key = validated_data["idempotency_key"]
    existing = (
        Order.objects.select_related("restaurant", "branch")
        .prefetch_related("items__menu_item", "items__platter")
        .filter(customer=customer, client_order_id=idempotency_key)
        .first()
    )
    if existing:
        return existing, False

    checkout = validate_marketplace_checkout(customer, validated_data, lock=True)
    try:
        expected = signing.loads(
            validated_data.get("quote_token", ""),
            salt="marketplace-checkout-quote",
            max_age=900,
        )
    except signing.BadSignature:
        raise serializers.ValidationError({"code": "quote_expired", "detail": "Review your cart total again before placing this order."})
    if expected != quote_fingerprint(customer, validated_data, checkout):
        raise serializers.ValidationError({"code": "price_changed", "detail": "Your checkout details or prices changed. Review the updated total before ordering."})
    address = checkout["address"]
    notes = [checkout["note"]]
    if checkout["delivery_instructions"]:
        notes.append(checkout["delivery_instructions"])
    order = Order.objects.create(
        customer=customer,
        restaurant=checkout["restaurant"],
        branch=checkout["branch"],
        order_type=checkout["order_type"],
        name=customer.user.get_full_name() or customer.user.username,
        phone=checkout["contact_phone"],
        address=_address_text(address) if address else "",
        latitude=address.latitude if address else None,
        longitude=address.longitude if address else None,
        note="\n".join(note for note in notes if note) or None,
        delivery_fee=checkout["delivery_fee"],
        client_order_id=idempotency_key,
    )
    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                menu_item=line["object"] if line["item_type"] == "menu_item" else None,
                platter=line["object"] if line["item_type"] == "platter" else None,
                quantity=line["quantity"],
                price_at_order=line["unit_price"],
                description=line.get("note", "").strip() or None,
            )
            for line in checkout["lines"]
        ]
    )
    order = (
        Order.objects.select_related("restaurant", "branch")
        .prefetch_related("items__menu_item", "items__platter")
        .get(pk=order.pk)
    )
    return order, True
