# Generated migration to separate apellidos into apellido_paterno and apellido_materno

from django.db import migrations, models


def migrar_apellidos_existentes(apps, schema_editor):
    """
    Migra los datos existentes del campo 'apellidos' a 'apellido_paterno' y 'apellido_materno'.
    Si el apellido contiene espacios, divide en paterno (primera palabra) y materno (resto).
    Si no contiene espacios, todo va a apellido_paterno.
    """
    Empleado = apps.get_model('empleado', 'Empleado')
    
    for empleado in Empleado.objects.all():
        if empleado.apellido:
            apellidos = empleado.apellido.strip().split()
            if len(apellidos) > 0:
                empleado.apellido_paterno = apellidos[0]
                if len(apellidos) > 1:
                    empleado.apellido_materno = ' '.join(apellidos[1:])
                else:
                    empleado.apellido_materno = None
                empleado.save()


def revertir_migracion_apellidos(apps, schema_editor):
    """
    Revierte la migración combinando apellido_paterno y apellido_materno en apellido.
    """
    Empleado = apps.get_model('empleado', 'Empleado')
    
    for empleado in Empleado.objects.all():
        apellidos = []
        if empleado.apellido_paterno:
            apellidos.append(empleado.apellido_paterno)
        if empleado.apellido_materno:
            apellidos.append(empleado.apellido_materno)
        empleado.apellido = ' '.join(apellidos) if apellidos else None
        empleado.save()


class Migration(migrations.Migration):

    dependencies = [
        ('empleado', '0001_initial'),
    ]

    operations = [
        # Agregar los nuevos campos como nullable primero
        migrations.AddField(
            model_name='empleado',
            name='apellido_paterno',
            field=models.CharField(db_column='apellido_paterno', max_length=100, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='empleado',
            name='apellido_materno',
            field=models.CharField(db_column='apellido_materno', max_length=100, null=True, blank=True),
        ),
        # Migrar los datos existentes
        migrations.RunPython(migrar_apellidos_existentes, revertir_migracion_apellidos),
        # Hacer apellido_paterno requerido (no nullable)
        migrations.AlterField(
            model_name='empleado',
            name='apellido_paterno',
            field=models.CharField(db_column='apellido_paterno', max_length=100),
        ),
        # Hacer apellido nullable (ya no es requerido)
        migrations.AlterField(
            model_name='empleado',
            name='apellido',
            field=models.CharField(db_column='apellidos', max_length=100, null=True, blank=True),
        ),
    ]

