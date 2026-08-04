from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0010_enterprise_branch_settings"),
        ("users", "0021_attendance_branch_payroll_branch_shift_branch"),
    ]

    operations = [
        migrations.CreateModel(
            name="BranchDataMigrationLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "migration_type",
                    models.CharField(
                        choices=[
                            ("ingredients", "Ingredients"),
                            ("categories", "Menu Categories"),
                            ("menu_items", "Menu Items"),
                            ("platters", "Platters"),
                            ("modifiers", "Modifiers"),
                            ("everything", "Everything"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("running", "Running"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                        ],
                        default="running",
                        max_length=20,
                    ),
                ),
                ("started_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("finished_at", models.DateTimeField(blank=True, null=True)),
                ("imported_count", models.PositiveIntegerField(default=0)),
                ("skipped_count", models.PositiveIntegerField(default=0)),
                ("failed_count", models.PositiveIntegerField(default=0)),
                ("summary", models.JSONField(blank=True, default=dict)),
                ("error_message", models.TextField(blank=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="branch_data_migrations",
                        to="users.staff",
                    ),
                ),
                (
                    "destination_branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="incoming_data_migrations",
                        to="restaurants.branch",
                    ),
                ),
                (
                    "restaurant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="branch_data_migrations",
                        to="restaurants.restaurant",
                    ),
                ),
                (
                    "source_branch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="outgoing_data_migrations",
                        to="restaurants.branch",
                    ),
                ),
            ],
            options={
                "ordering": ["-started_at"],
            },
        ),
        migrations.AddIndex(
            model_name="branchdatamigrationlog",
            index=models.Index(fields=["restaurant", "started_at"], name="bdm_rest_started_idx"),
        ),
        migrations.AddIndex(
            model_name="branchdatamigrationlog",
            index=models.Index(fields=["destination_branch", "status"], name="bdm_dest_status_idx"),
        ),
    ]
