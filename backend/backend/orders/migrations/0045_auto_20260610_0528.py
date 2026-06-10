from django.db import migrations

def backfill_price_at_order(apps, schema_editor):
    OrderItem = apps.get_model('orders', 'OrderItem')
    MenuItem = apps.get_model('menu', 'MenuItem')  # 👈 change 'menu' if your app has a different name
    Platter = apps.get_model('menu', 'Platter')

    # 1️⃣ Backfill Menu Items
    menu_ids = OrderItem.objects.filter(
        price_at_order__isnull=True, menu_item__isnull=False
    ).values_list('menu_item_id', flat=True).distinct()

    if menu_ids:
        price_map = dict(MenuItem.objects.filter(id__in=menu_ids).values_list('id', 'price'))
        updates = [
            OrderItem(pk=oi_id, price_at_order=price_map[mid])
            for oi_id, mid in OrderItem.objects.filter(
                price_at_order__isnull=True, menu_item__isnull=False
            ).values_list('id', 'menu_item_id')
            if mid in price_map
        ]
        if updates:
            OrderItem.objects.bulk_update(updates, ['price_at_order'], batch_size=2000)

    # 2️⃣ Backfill Platters
    platter_ids = OrderItem.objects.filter(
        price_at_order__isnull=True, platter__isnull=False
    ).values_list('platter_id', flat=True).distinct()

    if platter_ids:
        price_map = dict(Platter.objects.filter(id__in=platter_ids).values_list('id', 'price'))
        updates = [
            OrderItem(pk=oi_id, price_at_order=price_map[pid])
            for oi_id, pid in OrderItem.objects.filter(
                price_at_order__isnull=True, platter__isnull=False
            ).values_list('id', 'platter_id')
            if pid in price_map
        ]
        if updates:
            OrderItem.objects.bulk_update(updates, ['price_at_order'], batch_size=2000)

def reverse_backfill(apps, schema_editor):
    OrderItem = apps.get_model('orders', 'OrderItem')
    OrderItem.objects.filter(price_at_order__isnull=False).update(price_at_order=None)

class Migration(migrations.Migration):
    dependencies = [
        # 👇 Find your last migration name with: python manage.py showmigrations orders
        ('orders', '0044_orderitem_price_at_order'),  # REPLACE THIS
    ]
    operations = [
        migrations.RunPython(backfill_price_at_order, reverse_backfill),
    ]