# Generated manually for Pakhlai audit logging.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("restaurants", "0016_subscription_max_branches"),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(choices=[("CREATE", "Create"), ("UPDATE", "Update"), ("DELETE", "Delete"), ("APPROVE", "Approve"), ("REJECT", "Reject"), ("CANCEL", "Cancel"), ("RESTORE", "Restore"), ("PAYMENT", "Payment"), ("STATUS_CHANGE", "Status Change")], max_length=30)),
                ("module", models.CharField(choices=[("PROCUREMENT", "Procurement"), ("EXPENSES", "Expenses"), ("CONTRACTORS", "Contractors")], max_length=40)),
                ("object_type", models.CharField(max_length=120)),
                ("object_id", models.CharField(max_length=80)),
                ("object_repr", models.CharField(blank=True, max_length=255)),
                ("description", models.TextField(blank=True)),
                ("old_values", models.JSONField(blank=True, default=dict)),
                ("new_values", models.JSONField(blank=True, default=dict)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("branch", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="audit_logs", to="restaurants.branch")),
                ("restaurant", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="audit_logs", to="restaurants.restaurant")),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="audit_logs", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["restaurant", "created_at"], name="audit_rest_created_idx"),
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["restaurant", "branch"], name="audit_rest_branch_idx"),
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["restaurant", "user"], name="audit_rest_user_idx"),
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["module", "action"], name="audit_module_action_idx"),
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["object_type", "object_id"], name="audit_object_idx"),
        ),
        migrations.AddIndex(
            model_name="auditlog",
            index=models.Index(fields=["created_at"], name="audit_created_idx"),
        ),
    ]
