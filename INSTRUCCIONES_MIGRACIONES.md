# Instrucciones para Resolver Problemas de Migraciones en Otro Computador

## Problema

Cuando importas el archivo `monkeycoffee_app.sql` en otro computador, Django no sabe que las migraciones ya están aplicadas porque la tabla `django_migrations` está vacía. Esto causa errores al ejecutar `python manage.py migrate`.

## Solución

Tienes dos opciones para resolver este problema:

---

## Opción 1: Usar el Script SQL (Recomendado)

### Pasos:

1. **Importa el dump SQL completo:**
   ```bash
   mysql -u root -p monkeycoffee_app < monkeycoffee_app.sql
   ```
   O desde MySQL Workbench, ejecuta el archivo `monkeycoffee_app.sql`

2. **Ejecuta el script de sincronización:**
   ```bash
   mysql -u root -p monkeycoffee_app < sync_migrations.sql
   ```
   O desde MySQL Workbench, ejecuta el archivo `sync_migrations.sql`

3. **Verifica que todo esté correcto:**
   ```bash
   python manage.py migrate --fake
   ```

4. **Listo!** Ahora puedes usar Django normalmente:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

---

## Opción 2: Usar el Script Python (Alternativa)

### Pasos:

1. **Importa el dump SQL completo:**
   ```bash
   mysql -u root -p monkeycoffee_app < monkeycoffee_app.sql
   ```

2. **Asegúrate de tener el entorno virtual activado:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Ejecuta el script de sincronización:**
   ```bash
   python sync_migrations.py
   ```

4. **Verifica que todo esté correcto:**
   ```bash
   python manage.py migrate
   ```

---

## Opción 3: Manual (Si las anteriores no funcionan)

Si prefieres hacerlo manualmente:

1. **Importa el dump SQL:**
   ```bash
   mysql -u root -p monkeycoffee_app < monkeycoffee_app.sql
   ```

2. **Marca las migraciones como aplicadas manualmente:**
   ```bash
   python manage.py migrate --fake empleado 0001_initial
   python manage.py migrate --fake empleado 0002_add_rol_field
   python manage.py migrate --fake inventario 0001_initial
   python manage.py migrate --fake sistema 0001_initial
   ```

3. **Para las migraciones de Django contrib:**
   ```bash
   python manage.py migrate --fake
   ```

---

## Verificar que Funciona

Después de aplicar cualquiera de las soluciones, verifica:

```bash
# Ver el estado de las migraciones
python manage.py showmigrations

# Deberías ver todas las migraciones marcadas con [X]
```

---

## Solución de Problemas

### Error: "Table already exists"
Si ves este error, significa que las tablas ya existen. Usa `--fake`:
```bash
python manage.py migrate --fake
```

### Error: "No such table: django_migrations"
El script SQL crea esta tabla automáticamente. Si no existe, ejecuta:
```sql
CREATE TABLE IF NOT EXISTS django_migrations (
    id bigint NOT NULL AUTO_INCREMENT,
    app varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    applied datetime(6) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Error de conexión a la base de datos
Verifica las credenciales en `api/settings.py`:
- `NAME`: nombre de la base de datos
- `USER`: usuario de MySQL
- `PASSWORD`: contraseña de MySQL
- `HOST`: host (normalmente 'localhost')
- `PORT`: puerto (normalmente 3306)

---

## Notas Importantes

- ⚠️ **NUNCA** ejecutes `python manage.py migrate` sin `--fake` después de importar el SQL, o intentará crear las tablas que ya existen.
- ✅ Siempre importa primero el SQL, luego sincroniza las migraciones.
- ✅ El flag `--fake` le dice a Django que marque la migración como aplicada sin ejecutarla realmente.
- ✅ Una vez sincronizadas las migraciones, puedes usar `python manage.py migrate` normalmente para futuras migraciones.

---

## Para Nuevos Computadores

Cuando configures el proyecto en un computador nuevo:

1. Clona el repositorio
2. Crea el entorno virtual e instala dependencias:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```
3. Importa la base de datos:
   ```bash
   mysql -u root -p monkeycoffee_app < monkeycoffee_app.sql
   ```
4. Sincroniza las migraciones (usa Opción 1 o 2)
5. ¡Listo! El proyecto debería funcionar.

