from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0014_restaurant_cover_image"),
    ]

    operations = [
        migrations.AddField(
            model_name="branch",
            name="latitude",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="branch",
            name="longitude",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
