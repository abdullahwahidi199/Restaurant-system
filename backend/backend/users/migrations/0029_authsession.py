import uuid

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("restaurants", "0019_restaurant_show_on_landing"),
        ("users", "0028_alter_staff_image_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="AuthSession",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("role", models.CharField(blank=True, max_length=50)),
                ("refresh_jti", models.CharField(blank=True, max_length=255)),
                ("browser", models.CharField(blank=True, max_length=80)),
                ("operating_system", models.CharField(blank=True, max_length=80)),
                ("device_label", models.CharField(blank=True, max_length=160)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=512)),
                ("started_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("refresh_expires_at", models.DateTimeField()),
                ("ended_at", models.DateTimeField(blank=True, null=True)),
                ("end_reason", models.CharField(blank=True, choices=[("logout", "Logout"), ("revoked", "Administrator revocation"), ("expired", "Expired")], max_length=20)),
                ("revoked_at", models.DateTimeField(blank=True, null=True)),
                ("branch", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="auth_sessions", to="restaurants.branch")),
                ("restaurant", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="auth_sessions", to="restaurants.restaurant")),
                ("revoked_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="revoked_auth_sessions", to=settings.AUTH_USER_MODEL)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="auth_sessions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-started_at"],
                "permissions": [("monitor_user_activity", "Can monitor user activity and sessions"), ("revoke_user_sessions", "Can revoke user sessions")],
            },
        ),
        migrations.AddIndex(model_name="authsession", index=models.Index(fields=["restaurant", "started_at"], name="authsess_rest_start_idx")),
        migrations.AddIndex(model_name="authsession", index=models.Index(fields=["restaurant", "branch"], name="authsess_rest_branch_idx")),
        migrations.AddIndex(model_name="authsession", index=models.Index(fields=["user", "refresh_expires_at"], name="authsess_user_exp_idx")),
        migrations.AddIndex(model_name="authsession", index=models.Index(fields=["restaurant", "ended_at", "refresh_expires_at"], name="authsess_valid_idx")),
    ]
