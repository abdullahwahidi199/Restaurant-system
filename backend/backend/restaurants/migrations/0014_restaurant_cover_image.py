from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0013_branch_public_slug_qr"),
    ]

    operations = [
        migrations.AddField(
            model_name="restaurant",
            name="cover_image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="restaurant_covers/",
            ),
        ),
    ]
