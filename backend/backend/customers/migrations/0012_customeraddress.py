import django.db.models.deletion
from django.db import migrations, models


def copy_legacy_addresses(apps, schema_editor):
    Customer = apps.get_model("customers", "Customer")
    CustomerAddress = apps.get_model("customers", "CustomerAddress")
    for customer in Customer.objects.exclude(address__isnull=True).exclude(address=""):
        CustomerAddress.objects.get_or_create(
            customer_id=customer.id,
            defaults={
                "label": "Home",
                "address_line": customer.address,
                "is_default": True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("customers", "0011_remove_customer_gender"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomerAddress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(default="Home", max_length=40)),
                ("address_line", models.TextField()),
                ("area", models.CharField(blank=True, max_length=120)),
                ("city", models.CharField(blank=True, max_length=120)),
                ("instructions", models.TextField(blank=True)),
                ("latitude", models.FloatField(blank=True, null=True)),
                ("longitude", models.FloatField(blank=True, null=True)),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("customer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="addresses", to="customers.customer")),
            ],
            options={
                "ordering": ["-is_default", "-updated_at", "id"],
            },
        ),
        migrations.AddIndex(
            model_name="customeraddress",
            index=models.Index(fields=["customer", "is_default"], name="cust_addr_default_idx"),
        ),
        migrations.RunPython(copy_legacy_addresses, migrations.RunPython.noop),
    ]
