from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0013_enterprise_inventory"),
    ]

    operations = [
        migrations.DeleteModel(name="RecipeOverride"),
    ]
