from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0021_attendance_branch_payroll_branch_shift_branch"),
    ]

    operations = [
        migrations.AlterField(
            model_name="staff",
            name="role",
            field=models.CharField(
                choices=[
                    ("SuperAdmin", "Super Admin"),
                    ("Admin", "Admin"),
                    ("BranchAdmin", "Branch Admin"),
                    ("Manager", "Manager"),
                    ("Cashier", "Cashier"),
                    ("Call_operator", "Call Operator"),
                    ("Waiter", "Waiter"),
                    ("Kitchen_manager", "Kitchen Manager"),
                    ("DeliveryBoy", "Delivery Boy"),
                    ("InventoryManager", "Inventory Manager"),
                    ("Other", "Other"),
                ],
                max_length=20,
            ),
        ),
    ]
