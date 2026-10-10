from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0046_discountcard_branch_order_branch_reservation_branch_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="client_order_id",
            field=models.CharField(
                blank=True,
                help_text="Client-generated idempotency key for marketplace orders.",
                max_length=64,
                null=True,
                unique=True,
            ),
        ),
    ]
