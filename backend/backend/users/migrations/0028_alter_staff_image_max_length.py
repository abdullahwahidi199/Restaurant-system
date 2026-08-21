from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0027_login_rate_limit_config"),
    ]

    operations = [
        migrations.AlterField(
            model_name="staff",
            name="image",
            field=models.ImageField(
                blank=True,
                max_length=500,
                null=True,
                upload_to="staff_photos/",
            ),
        ),
    ]
