from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("customers", "0010_remove_customer_restaurant"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="customer",
            name="gender",
        ),
    ]
