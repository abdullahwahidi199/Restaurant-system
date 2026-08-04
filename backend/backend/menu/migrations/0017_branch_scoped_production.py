# Generated manually for branch-scoped production

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0016_production_branch_review_branch'),
    ]

    operations = [
        migrations.AlterField(
            model_name='production',
            name='menu_item',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='productions',
                to='menu.menuitem',
            ),
        ),
        migrations.AddConstraint(
            model_name='production',
            constraint=models.UniqueConstraint(
                fields=('menu_item', 'branch'),
                name='unique_production_per_menu_item_branch',
            ),
        ),
    ]
