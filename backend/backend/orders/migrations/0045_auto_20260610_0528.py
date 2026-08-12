from django.db import migrations
from django.db.models import OuterRef, Subquery


def backfill_price_at_order(apps, schema_editor):
    OrderItem = apps.get_model("orders", "OrderItem")
    MenuItem = apps.get_model("menu", "MenuItem")
    Platter = apps.get_model("menu", "Platter")

    menu_price = MenuItem.objects.filter(
        pk=OuterRef("menu_item_id"),
    ).values("price")[:1]
    platter_price = Platter.objects.filter(
        pk=OuterRef("platter_id"),
    ).values("price")[:1]

    OrderItem.objects.filter(
        price_at_order__isnull=True,
        menu_item_id__isnull=False,
    ).update(price_at_order=Subquery(menu_price))

    OrderItem.objects.filter(
        price_at_order__isnull=True,
        platter_id__isnull=False,
    ).update(price_at_order=Subquery(platter_price))


def reverse_backfill(apps, schema_editor):
    OrderItem = apps.get_model("orders", "OrderItem")
    OrderItem.objects.filter(price_at_order__isnull=False).update(price_at_order=None)


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0044_orderitem_price_at_order"),
    ]

    operations = [
        migrations.RunPython(backfill_price_at_order, reverse_backfill),
    ]
