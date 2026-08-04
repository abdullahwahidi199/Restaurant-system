from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("menu", "0018_enterprise_menu_overrides"),
    ]

    operations = [
        migrations.DeleteModel(name="BranchMenuItemOverride"),
        migrations.DeleteModel(name="BranchPlatterOverride"),
    ]
