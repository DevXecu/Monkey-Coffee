#!/usr/bin/env python
"""
Script para sincronizar las migraciones de Django después de importar el dump SQL.

Este script marca las migraciones como aplicadas sin ejecutarlas realmente,
útil cuando ya tienes las tablas creadas desde un dump SQL.

USO:
    python sync_migrations.py
"""

import os
import sys
import django
from django.core.management import call_command
from django.db import connection

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

def sync_migrations():
    """Sincroniza las migraciones marcándolas como aplicadas."""
    
    print("=" * 60)
    print("SINCRONIZACIÓN DE MIGRACIONES DE DJANGO")
    print("=" * 60)
    print()
    
    # Verificar conexión a la base de datos
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Conexión a la base de datos exitosa")
    except Exception as e:
        print(f"✗ Error al conectar a la base de datos: {e}")
        sys.exit(1)
    
    # Verificar que la tabla django_migrations existe
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS django_migrations (
                    id bigint NOT NULL AUTO_INCREMENT,
                    app varchar(255) NOT NULL,
                    name varchar(255) NOT NULL,
                    applied datetime(6) NOT NULL,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
        print("✓ Tabla django_migrations verificada/creada")
    except Exception as e:
        print(f"✗ Error al crear tabla django_migrations: {e}")
        sys.exit(1)
    
    # Obtener todas las migraciones disponibles
    print()
    print("Marcando migraciones como aplicadas...")
    print("-" * 60)
    
    # Lista de apps y sus migraciones
    apps_migrations = {
        'empleado': ['0001_initial', '0002_add_rol_field'],
        'inventario': ['0001_initial'],
        'sistema': ['0001_initial'],
    }
    
    # Marcar migraciones como aplicadas usando --fake
    for app_name, migrations in apps_migrations.items():
        for migration in migrations:
            try:
                # Usar migrate --fake para marcar como aplicada sin ejecutar
                call_command('migrate', app_name, migration, fake=True, verbosity=0)
                print(f"✓ {app_name}.{migration} marcada como aplicada")
            except Exception as e:
                print(f"✗ Error al marcar {app_name}.{migration}: {e}")
    
    # También marcar las migraciones de Django contrib si es necesario
    print()
    print("Verificando migraciones de Django contrib...")
    print("-" * 60)
    
    contrib_apps = ['contenttypes', 'auth', 'admin', 'sessions']
    for app in contrib_apps:
        try:
            # Intentar hacer migrate --fake para todas las migraciones
            call_command('migrate', app, fake=True, verbosity=0)
            print(f"✓ Migraciones de {app} verificadas")
        except Exception as e:
            # Si falla, puede ser que ya estén aplicadas o que falten
            print(f"⚠ {app}: {e}")
    
    print()
    print("=" * 60)
    print("SINCRONIZACIÓN COMPLETADA")
    print("=" * 60)
    print()
    print("Verificando estado de migraciones...")
    print("-" * 60)
    
    # Mostrar estado final
    try:
        call_command('showmigrations', verbosity=1)
    except Exception as e:
        print(f"Error al mostrar migraciones: {e}")
    
    print()
    print("✓ Proceso completado. Ahora puedes usar 'python manage.py migrate' normalmente.")

if __name__ == '__main__':
    sync_migrations()

