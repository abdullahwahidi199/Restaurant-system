from django.db import migrations, models


def backfill_display_order(apps, schema_editor):
    Category = apps.get_model("menu", "Category")
    MenuItem = apps.get_model("menu", "MenuItem")
    Platter = apps.get_model("menu", "Platter")
    db_alias = schema_editor.connection.alias

    for category in Category.objects.using(db_alias).order_by("id"):
        order = 0
        for item in MenuItem.objects.using(db_alias).filter(category=category).order_by("id"):
            item.display_order = order
            item.save(update_fields=["display_order"])
            order += 1
        for platter in Platter.objects.using(db_alias).filter(category=category).order_by("id"):
            platter.display_order = order
            platter.save(update_fields=["display_order"])
            order += 1


class Migration(migrations.Migration):

    dependencies = [
        ("menu", "0022_alter_platteritem_quantity"),
    ]

    operations = [
        migrations.AddField(
            model_name="menuitem",
            name="display_order",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="platter",
            name="display_order",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.RunPython(backfill_display_order, migrations.RunPython.noop),
        migrations.AlterModelOptions(
            name="menuitem",
            options={"ordering": ["category__rank", "display_order", "id"]},
        ),
        migrations.AlterModelOptions(
            name="platter",
            options={"ordering": ["category__rank", "display_order", "id"]},
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(
                fields=["restaurant", "category", "display_order"],
                name="item_rest_cat_order_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="platter",
            index=models.Index(
                fields=["restaurant", "category", "display_order"],
                name="plat_rest_cat_order_idx",
            ),
        ),
    ]
