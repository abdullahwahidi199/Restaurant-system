from django.db import transaction
from django.db.models import F, Max, Q
from rest_framework import serializers

from .models import Category, MenuItem, Platter


MENU_ENTRY_TYPES = {
    "menu_item": MenuItem,
    "item": MenuItem,
    "platter": Platter,
}


def ordered_categories(queryset):
    return queryset.order_by(F("rank").asc(nulls_last=True), "id")


def ordered_menu_items(queryset):
    return queryset.order_by(
        F("category__rank").asc(nulls_last=True),
        "category_id",
        "display_order",
        "id",
    )


def ordered_platters(queryset):
    return queryset.order_by(
        F("category__rank").asc(nulls_last=True),
        "category_id",
        "display_order",
        "id",
    )


def category_entries(category, restaurant=None, branch=None):
    if restaurant is not None:
        menu_queryset = _scoped_entry_queryset(MenuItem, restaurant, branch).filter(category=category)
        platter_queryset = _scoped_entry_queryset(Platter, restaurant, branch).filter(category=category)
    else:
        menu_queryset = category.menu_items.all()
        platter_queryset = category.platters.all()

    menu_items = [
        {"type": "menu_item", "id": item.id, "display_order": item.display_order}
        for item in menu_queryset
    ]
    platters = [
        {"type": "platter", "id": platter.id, "display_order": platter.display_order}
        for platter in platter_queryset
    ]
    return sorted(
        [*menu_items, *platters],
        key=lambda entry: (entry["display_order"], entry["type"], entry["id"]),
    )


def next_display_order(restaurant, category):
    current_max = max(
        [
            MenuItem.objects.filter(
                restaurant=restaurant,
                category=category,
            ).aggregate(Max("display_order"))["display_order__max"]
            or -1,
            Platter.objects.filter(
                restaurant=restaurant,
                category=category,
            ).aggregate(Max("display_order"))["display_order__max"]
            or -1,
        ]
    )
    return current_max + 1


def _scoped_entry_queryset(model, restaurant, branch):
    queryset = model.objects.select_for_update().filter(restaurant=restaurant)
    if branch:
        return queryset.filter(Q(branch=branch) | Q(branch__isnull=True))
    return queryset.filter(branch__isnull=True)


def _normalize_category(category, restaurant, branch):
    entries = sorted(
        [
            *list(_scoped_entry_queryset(MenuItem, restaurant, branch).filter(category=category)),
            *list(_scoped_entry_queryset(Platter, restaurant, branch).filter(category=category)),
        ],
        key=lambda obj: (obj.display_order, obj.__class__.__name__, obj.id),
    )
    for index, obj in enumerate(entries):
        if obj.display_order != index:
            obj.display_order = index
            obj.save(update_fields=["display_order"])


@transaction.atomic
def reorder_categories(*, scoped_queryset, ordered_ids):
    if not isinstance(ordered_ids, list) or not ordered_ids:
        raise serializers.ValidationError({"categories": "A non-empty list is required."})

    if len(ordered_ids) != len(set(ordered_ids)):
        raise serializers.ValidationError({"categories": "Duplicate category IDs are not allowed."})

    categories = list(scoped_queryset.select_for_update().filter(id__in=ordered_ids))
    if len(categories) != len(ordered_ids):
        raise serializers.ValidationError({"categories": "Invalid or unauthorized category ID."})

    category_by_id = {category.id: category for category in categories}
    for category in categories:
        category.rank = None
        category.save(update_fields=["rank"])

    for index, category_id in enumerate(ordered_ids):
        category = category_by_id[int(category_id)]
        category.rank = index
        category.save(update_fields=["rank"])

    return ordered_categories(scoped_queryset)


@transaction.atomic
def reorder_menu_entries(*, restaurant, branch, category, entries, source_category=None):
    if not isinstance(entries, list) or not entries:
        raise serializers.ValidationError({"items": "A non-empty list is required."})

    seen = set()
    resolved = []

    for raw_entry in entries:
        entry_type = raw_entry.get("type") or raw_entry.get("item_type") or "menu_item"
        model = MENU_ENTRY_TYPES.get(entry_type)
        entry_id = raw_entry.get("id")
        if not model or not entry_id:
            raise serializers.ValidationError({"items": "Each item needs id and type."})

        key = (model.__name__, int(entry_id))
        if key in seen:
            raise serializers.ValidationError({"items": "Duplicate menu entry IDs are not allowed."})
        seen.add(key)

        try:
            obj = _scoped_entry_queryset(model, restaurant, branch).get(id=entry_id)
        except model.DoesNotExist:
            raise serializers.ValidationError({"items": "Invalid or unauthorized menu entry."})

        if obj.category_id not in {category.id, getattr(source_category, "id", None)}:
            raise serializers.ValidationError({"items": "Menu entries must belong to the affected category."})

        if category.branch_id and obj.branch_id and obj.branch_id != category.branch_id:
            raise serializers.ValidationError({"items": "Cannot move entries across branches."})

        resolved.append(obj)

    target_existing = [
        *list(_scoped_entry_queryset(MenuItem, restaurant, branch).filter(category=category)),
        *list(_scoped_entry_queryset(Platter, restaurant, branch).filter(category=category)),
    ]
    target_keys = {(obj.__class__.__name__, obj.id) for obj in target_existing}
    payload_keys = {(obj.__class__.__name__, obj.id) for obj in resolved}
    missing = target_keys - payload_keys
    if missing:
        raise serializers.ValidationError({"items": "Send the complete canonical order for the target category."})

    for index, obj in enumerate(resolved):
        update_fields = []
        if obj.category_id != category.id:
            obj.category = category
            update_fields.append("category")
        if obj.display_order != index:
            obj.display_order = index
            update_fields.append("display_order")
        if update_fields:
            obj.save(update_fields=update_fields)

    if source_category and source_category.id != category.id:
        _normalize_category(source_category, restaurant, branch)

    category.refresh_from_db()
    _normalize_category(category, restaurant, branch)
    return category_entries(category, restaurant, branch)
