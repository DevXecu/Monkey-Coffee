# Generated manually to add missing 'rol' field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('empleado', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='empleado',
            name='rol',
            field=models.CharField(blank=True, choices=[('administrador', 'Administrador'), ('gerente', 'Gerente'), ('empleado', 'Empleado')], db_column='rol', default='empleado', max_length=20, null=True),
        ),
    ]

