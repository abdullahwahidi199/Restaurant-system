from django.db import migrations


def repair_user_agent_column(apps, schema_editor):
    """Repair production databases that still have user_agent as varchar(100)."""
    if schema_editor.connection.vendor != "postgresql":
        return

    AuditLog = apps.get_model("audit", "AuditLog")
    quote_name = schema_editor.quote_name
    table = quote_name(AuditLog._meta.db_table)
    column = quote_name("user_agent")
    schema_editor.execute(
        f"ALTER TABLE {table} ALTER COLUMN {column} TYPE text"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("audit", "0002_alter_auditlog_action_alter_auditlog_module"),
    ]

    operations = [
        migrations.RunPython(repair_user_agent_column, migrations.RunPython.noop),
    ]
