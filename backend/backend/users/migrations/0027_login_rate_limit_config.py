from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0026_alter_staff_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="LoginRateLimitConfig",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("enabled", models.BooleanField(default=True)),
                ("max_failed_attempts", models.PositiveSmallIntegerField(default=5)),
                ("window_minutes", models.PositiveSmallIntegerField(default=15)),
                ("lockout_minutes", models.PositiveSmallIntegerField(default=15)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Login rate limit configuration",
                "verbose_name_plural": "Login rate limit configuration",
            },
        ),
    ]
