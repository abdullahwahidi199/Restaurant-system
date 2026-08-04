import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0012_ingredient_unique_per_branch"),
        ("menu", "0018_enterprise_menu_overrides"),
        ("restaurants", "0009_branch"),
        ("users", "0021_attendance_branch_payroll_branch_shift_branch"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="ingredient",
            name="unique_ingredient_per_restaurant_branch",
        ),
        migrations.AddConstraint(
            model_name="ingredient",
            constraint=models.UniqueConstraint(
                condition=models.Q(("branch__isnull", True)),
                fields=("restaurant", "name"),
                name="uniq_shared_ingredient",
            ),
        ),
        migrations.AddConstraint(
            model_name="ingredient",
            constraint=models.UniqueConstraint(
                condition=models.Q(("branch__isnull", False)),
                fields=("restaurant", "branch", "name"),
                name="uniq_branch_ingredient",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredient",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="ing_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredient",
            index=models.Index(
                fields=["restaurant", "name"],
                name="ing_rest_name_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredient",
            index=models.Index(
                fields=["is_active"],
                name="ing_active_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="stockmovement",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="stock_move_rest_branch_idx",
            ),
        ),
        migrations.AlterField(
            model_name="stockmovement",
            name="movement_type",
            field=models.CharField(
                choices=[
                    ("purchase", "Purchase"),
                    ("order", "Order"),
                    ("adjustment", "Adjustment"),
                    ("waste", "Waste"),
                    ("production", "Production"),
                    ("production_adjustment", "Production Adjustment"),
                    ("transfer_out", "Transfer Out"),
                    ("transfer_in", "Transfer In"),
                ],
                max_length=30,
            ),
        ),
        migrations.CreateModel(
            name="IngredientStock",
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
                    "quantity_available",
                    models.DecimalField(decimal_places=3, default=0, max_digits=10),
                ),
                (
                    "minimum_threshold",
                    models.DecimalField(decimal_places=3, default=0, max_digits=10),
                ),
                (
                    "cost_per_unit",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ingredient_stocks",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "ingredient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branch_stocks",
                        to="inventory.ingredient",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ingredient_stocks",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RecipeOverride",
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
                    "quantity_required",
                    models.DecimalField(decimal_places=3, max_digits=10),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="recipe_overrides",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_recipe_overrides",
                        to="users.staff",
                    ),
                ),
                (
                    "ingredient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="recipe_overrides",
                        to="inventory.ingredient",
                    ),
                ),
                (
                    "menu_item",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="recipe_overrides",
                        to="menu.menuitem",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="recipe_overrides",
                        to="restaurants.restaurant",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="StockTransfer",
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
                    "quantity",
                    models.DecimalField(decimal_places=3, max_digits=10),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("approved", "Approved"),
                            ("rejected", "Rejected"),
                            ("cancelled", "Cancelled"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "approved_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="approved_stock_transfers",
                        to="users.staff",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="requested_stock_transfers",
                        to="users.staff",
                    ),
                ),
                (
                    "from_branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="outgoing_stock_transfers",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "ingredient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="stock_transfers",
                        to="inventory.ingredient",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="stock_transfers",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "to_branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="incoming_stock_transfers",
                        to="restaurants.branch",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="StockTransferLog",
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
                ("action", models.CharField(max_length=50)),
                ("message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="stock_transfer_logs",
                        to="users.staff",
                    ),
                ),
                (
                    "transfer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="logs",
                        to="inventory.stocktransfer",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="ingredientstock",
            constraint=models.UniqueConstraint(
                fields=("ingredient", "branch"),
                name="uniq_ingredient_stock_branch",
            ),
        ),
        migrations.AddConstraint(
            model_name="recipeoverride",
            constraint=models.UniqueConstraint(
                fields=("branch", "menu_item", "ingredient"),
                name="uniq_recipe_override_branch",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredientstock",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="ing_stock_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredientstock",
            index=models.Index(
                fields=["ingredient", "branch"],
                name="ing_stock_item_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="ingredientstock",
            index=models.Index(
                fields=["is_active"],
                name="ing_stock_active_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="recipeoverride",
            index=models.Index(
                fields=["restaurant", "branch"],
                name="recipe_ov_rest_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="recipeoverride",
            index=models.Index(
                fields=["menu_item", "branch"],
                name="recipe_ov_item_branch_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="stocktransfer",
            index=models.Index(
                fields=["restaurant", "status"],
                name="stock_tx_rest_status_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="stocktransfer",
            index=models.Index(
                fields=["from_branch", "to_branch"],
                name="stock_tx_branches_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="stocktransfer",
            index=models.Index(
                fields=["created_at"],
                name="stock_tx_created_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="stocktransferlog",
            index=models.Index(
                fields=["transfer", "created_at"],
                name="stock_tx_log_transfer_idx",
            ),
        ),
    ]
