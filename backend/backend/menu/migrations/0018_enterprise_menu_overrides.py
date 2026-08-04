import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("menu", "0017_branch_scoped_production"),
        ("restaurants", "0009_branch"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="branch",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="categories",
                to="restaurants.branch",
            ),
        ),
        migrations.AddField(
            model_name="menuitem",
            name="branch",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="menu_items",
                to="restaurants.branch",
            ),
        ),
        migrations.AddField(
            model_name="platter",
            name="branch",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="platters",
                to="restaurants.branch",
            ),
        ),
        migrations.RemoveConstraint(
            model_name="category",
            name="unique_rank_per_restaurant",
        ),
        migrations.AddConstraint(
            model_name="category",
            constraint=models.UniqueConstraint(
                condition=models.Q(("branch__isnull", True)),
                fields=("restaurant", "rank"),
                name="uniq_shared_category_rank",
            ),
        ),
        migrations.AddConstraint(
            model_name="category",
            constraint=models.UniqueConstraint(
                condition=models.Q(("branch__isnull", False)),
                fields=("restaurant", "branch", "rank"),
                name="uniq_branch_category_rank",
            ),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="cat_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(
                fields=["restaurant", "rank"],
                name="cat_rest_rank_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="item_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(
                fields=["restaurant", "category"],
                name="item_rest_cat_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(
                fields=["restaurant", "is_available"],
                name="item_rest_avail_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="platter",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="plat_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="platter",
            index=models.Index(
                fields=["restaurant", "category"],
                name="plat_rest_cat_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="platter",
            index=models.Index(
                fields=["restaurant", "is_available"],
                name="plat_rest_avail_idx",
            ),
        ),
        migrations.CreateModel(
            name="BranchMenuItemOverride",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "price",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=8,
                        null=True,
                    ),
                ),
                ("is_available", models.BooleanField(blank=True, null=True)),
                ("is_manually_available", models.BooleanField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="menu_item_overrides",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "menu_item",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branch_overrides",
                        to="menu.menuitem",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="menu_item_overrides",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="BranchPlatterOverride",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "price",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=8,
                        null=True,
                    ),
                ),
                ("is_available", models.BooleanField(blank=True, null=True)),
                ("is_manually_available", models.BooleanField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="platter_overrides",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "platter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branch_overrides",
                        to="menu.platter",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="platter_overrides",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="branchmenuitemoverride",
            constraint=models.UniqueConstraint(
                fields=("branch", "menu_item"),
                name="uniq_item_override_branch",
            ),
        ),
        migrations.AddConstraint(
            model_name="branchplatteroverride",
            constraint=models.UniqueConstraint(
                fields=("branch", "platter"),
                name="uniq_plat_override_branch",
            ),
        ),
        migrations.AddIndex(
            model_name="branchmenuitemoverride",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="item_ov_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="branchmenuitemoverride",
            index=models.Index(
                fields=["menu_item", "branch"],
                name="item_ov_item_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="branchplatteroverride",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="plat_ov_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="branchplatteroverride",
            index=models.Index(
                fields=["platter", "branch"],
                name="plat_ov_item_branch_idx",
            ),
        ),
    ]
