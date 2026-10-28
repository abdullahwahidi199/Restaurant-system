from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("audit", "0003_repair_user_agent_column")]

    operations = [
        migrations.AlterField(
            model_name="auditlog",
            name="action",
            field=models.CharField(
                choices=[
                    ("CREATE", "Create"), ("UPDATE", "Update"), ("DELETE", "Delete"),
                    ("APPROVE", "Approve"), ("REJECT", "Reject"), ("CANCEL", "Cancel"),
                    ("RESTORE", "Restore"), ("PAYMENT", "Payment"),
                    ("STATUS_CHANGE", "Status Change"), ("ASSIGNMENT_CHANGE", "Assignment Change"),
                    ("CONFIG_CHANGE", "Configuration Change"), ("EXPORT", "Export"),
                    ("LOGIN_SUCCESS", "Login Success"), ("LOGIN_FAILED", "Login Failed"),
                    ("LOGOUT", "Logout"), ("SESSION_REVOKED", "Session Revoked"),
                    ("SESSION_EXPIRED", "Session Expired"), ("MIGRATION", "Migration"),
                ],
                max_length=30,
            ),
        ),
    ]
