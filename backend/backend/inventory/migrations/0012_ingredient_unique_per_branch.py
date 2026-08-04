# Generated manually for branch-scoped inventory uniqueness

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0011_ingredient_branch_stockmovement_branch'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='ingredient',
            name='unique_ingredient_per_restaurant',
        ),
        migrations.AddConstraint(
            model_name='ingredient',
            constraint=models.UniqueConstraint(
                fields=('restaurant', 'branch', 'name'),
                name='unique_ingredient_per_restaurant_branch',
            ),
        ),
    ]
