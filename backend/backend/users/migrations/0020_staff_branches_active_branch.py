from django.db import migrations, models
from django.db.models import OuterRef, Subquery
import django.db.models.deletion


def assign_staff_to_main_branch(apps, schema_editor):
    Staff = apps.get_model("users", "Staff")
    Branch = apps.get_model("restaurants", "Branch")
    Restaurant = apps.get_model("restaurants", "Restaurant")

    for restaurant in Restaurant.objects.exclude(branches__is_main_branch=True):
        Branch.objects.create(
            restaurant=restaurant,
            name="Main Branch",
            code=f"MAIN-{restaurant.id}",
            address=getattr(restaurant, "address", "") or "",
            phone=getattr(restaurant, "phone", "") or "",
            email=getattr(restaurant, "email", "") or "",
            is_main_branch=True,
            is_active=True,
        )

    main_branch = Branch.objects.filter(
        restaurant_id=OuterRef("restaurant_id"),
        is_main_branch=True,
    ).values("id")[:1]

    Staff.objects.filter(
        restaurant_id__isnull=False,
        active_branch_id__isnull=True,
    ).update(active_branch_id=Subquery(main_branch))

    through = Staff.branches.through
    staff_table = schema_editor.quote_name(Staff._meta.db_table)
    branch_table = schema_editor.quote_name(Branch._meta.db_table)
    through_table = schema_editor.quote_name(through._meta.db_table)
    staff_id_column = schema_editor.quote_name(
        through._meta.get_field("staff").column,
    )
    branch_id_column = schema_editor.quote_name(
        through._meta.get_field("branch").column,
    )

    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            f"""
            INSERT INTO {through_table} ({staff_id_column}, {branch_id_column})
            SELECT staff.id, branch.id
            FROM {staff_table} staff
            INNER JOIN {branch_table} branch
                ON branch.restaurant_id = staff.restaurant_id
                AND branch.is_main_branch = TRUE
            WHERE staff.restaurant_id IS NOT NULL
            ON CONFLICT DO NOTHING
            """
        )


def clear_staff_branch_assignments(apps, schema_editor):
    Staff = apps.get_model("users", "Staff")
    Staff.branches.through.objects.all().delete()
    Staff.objects.update(active_branch=None)


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
