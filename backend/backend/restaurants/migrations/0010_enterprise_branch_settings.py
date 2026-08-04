from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0009_branch"),
    ]

    operations = [
        migrations.AddField(
            model_name="restaurant",
            name="menu_mode",
            field=models.CharField(
                choices=[("shared", "Shared"), ("separate", "Separate")],
                default="shared",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="ingredient_mode",
            field=models.CharField(
                choices=[("shared", "Shared"), ("separate", "Separate")],
                default="separate",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="recipe_mode",
            field=models.CharField(
                choices=[("shared", "Shared"), ("separate", "Separate")],
                default="separate",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="restaurant",
            name="pricing_mode",
            field=models.CharField(
                choices=[("shared", "Shared Pricing"), ("branch", "Branch Pricing")],
                default="shared",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="receipt_header",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="branch",
            name="receipt_footer",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="branch",
            name="receipt_template",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="branch",
            name="tax_rate",
            field=models.DecimalField(
                blank=True,
                decimal_places=3,
                max_digits=6,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="service_charge_rate",
            field=models.DecimalField(
                blank=True,
                decimal_places=3,
                max_digits=6,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="kitchen_printer",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="branch",
            name="opening_hours",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="branch",
            name="delivery_available",
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="branch",
            name="delivery_radius_km",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=5,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="base_delivery_fee",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=6,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="price_per_km",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=6,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="min_order_amount",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="cash_drawer_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="branch",
            name="cash_drawer_name",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="branch",
            name="logo",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="branch_logos/",
            ),
        ),
        migrations.AddField(
            model_name="branch",
            name="settings",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
