from django.db import migrations, models


def force_independent_modes(apps, schema_editor):
    Restaurant = apps.get_model("restaurants", "Restaurant")
    Restaurant.objects.update(
        menu_mode="separate",
        ingredient_mode="separate",
        recipe_mode="separate",
        pricing_mode="branch",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0011_branch_data_migration_log"),
    ]

    operations = [
        migrations.AlterField(
            model_name="restaurant",
            name="menu_mode",
            field=models.CharField(
                choices=[("separate", "Separate")],
                default="separate",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="restaurant",
            name="ingredient_mode",
            field=models.CharField(
                choices=[("separate", "Separate")],
                default="separate",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="restaurant",
            name="recipe_mode",
            field=models.CharField(
                choices=[("separate", "Separate")],
                default="separate",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="restaurant",
            name="pricing_mode",
            field=models.CharField(
                choices=[("branch", "Branch Pricing")],
                default="branch",
                max_length=20,
            ),
        ),
        migrations.RunPython(force_independent_modes, migrations.RunPython.noop),
    ]
