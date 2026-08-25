from django.db import migrations
from django.db.models import F


class Migration(migrations.Migration):

    dependencies = [
        ("menu", "0023_menu_entry_display_order"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="category",
            options={"ordering": [F("rank").asc(nulls_last=True), "id"]},
        ),
        migrations.AlterModelOptions(
            name="menuitem",
            options={
                "ordering": [
                    F("category__rank").asc(nulls_last=True),
                    "category_id",
                    "display_order",
                    "id",
                ],
            },
        ),
        migrations.AlterModelOptions(
            name="platter",
            options={
                "ordering": [
                    F("category__rank").asc(nulls_last=True),
                    "category_id",
                    "display_order",
                    "id",
                ],
            },
        ),
    ]
