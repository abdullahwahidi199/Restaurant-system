from django.db import migrations, models
import django.db.models.deletion


def create_main_branches(apps, schema_editor):
    Restaurant = apps.get_model("restaurants", "Restaurant")
    Branch = apps.get_model("restaurants", "Branch")

    for restaurant in Restaurant.objects.all():
        Branch.objects.get_or_create(
            restaurant=restaurant,
            is_main_branch=True,
            defaults={
                "name": "Main Branch",
                "code": f"MAIN-{restaurant.id}",
                "address": restaurant.address or "",
                "phone": restaurant.phone or "",
                "email": restaurant.email or "",
                "is_active": True,
            },
        )


def remove_created_main_branches(apps, schema_editor):
    Branch = apps.get_model("restaurants", "Branch")
    Branch.objects.filter(is_main_branch=True, code__startswith="MAIN-").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0008_restaurant_slogan"),
    ]

    operations = [
        migrations.CreateModel(
            name="Branch",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("code", models.CharField(max_length=50)),
                ("address", models.TextField(blank=True)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("is_main_branch", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branches",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
            options={
                "ordering": ["-is_main_branch", "name"],
                "unique_together": {("restaurant", "code")},
            },
        ),
        migrations.AddConstraint(
            model_name="branch",
            constraint=models.UniqueConstraint(
                condition=models.Q(("is_main_branch", True)),
                fields=("restaurant",),
                name="unique_main_branch_per_restaurant",
            ),
        ),
        migrations.RunPython(create_main_branches, remove_created_main_branches),
    ]
