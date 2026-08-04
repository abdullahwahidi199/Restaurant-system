from django.db import migrations, models
import django.db.models.deletion


def assign_staff_to_main_branch(apps, schema_editor):
    Staff = apps.get_model("users", "Staff")
    Branch = apps.get_model("restaurants", "Branch")

    for staff in Staff.objects.filter(restaurant__isnull=False):
        main_branch = Branch.objects.filter(
            restaurant=staff.restaurant,
            is_main_branch=True,
        ).first()

        if not main_branch:
            main_branch = Branch.objects.create(
                restaurant=staff.restaurant,
                name="Main Branch",
                code=f"MAIN-{staff.restaurant_id}",
                address=getattr(staff.restaurant, "address", "") or "",
                phone=getattr(staff.restaurant, "phone", "") or "",
                email=getattr(staff.restaurant, "email", "") or "",
                is_main_branch=True,
                is_active=True,
            )

        staff.branches.add(main_branch)
        staff.active_branch = main_branch
        staff.save(update_fields=["active_branch"])


def clear_staff_branch_assignments(apps, schema_editor):
    Staff = apps.get_model("users", "Staff")
    for staff in Staff.objects.all():
        staff.branches.clear()
        staff.active_branch = None
        staff.save(update_fields=["active_branch"])


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0009_branch"),
        ("users", "0019_alter_staff_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="staff",
            name="active_branch",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="active_staff",
                to="restaurants.branch",
            ),
        ),
        migrations.AddField(
            model_name="staff",
            name="branches",
            field=models.ManyToManyField(
                blank=True,
                related_name="staff_members",
                to="restaurants.branch",
            ),
        ),
        migrations.RunPython(assign_staff_to_main_branch, clear_staff_branch_assignments),
    ]
