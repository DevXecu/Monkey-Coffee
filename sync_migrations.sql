-- ============================================================
-- SCRIPT DE SINCRONIZACIÓN DE MIGRACIONES DE DJANGO
-- ============================================================
-- Este script marca las migraciones como aplicadas después de
-- importar el dump SQL completo (monkeycoffee_app.sql)
-- 
-- USO:
-- 1. Importa primero monkeycoffee_app.sql
-- 2. Luego ejecuta este script
-- 3. Después ejecuta: python manage.py migrate --fake
-- ============================================================

USE `monkeycoffee_app`;

-- Asegurar que la tabla django_migrations existe
-- (Django la crea automáticamente, pero por si acaso)
CREATE TABLE IF NOT EXISTS `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpiar migraciones existentes (por si acaso)
DELETE FROM `django_migrations`;

-- Insertar migraciones de Django contrib (si no existen)
INSERT INTO `django_migrations` (`app`, `name`, `applied`) VALUES
('contenttypes', '0001_initial', NOW()),
('contenttypes', '0002_remove_content_type_name', NOW()),
('auth', '0001_initial', NOW()),
('auth', '0002_alter_permission_name_max_length', NOW()),
('auth', '0003_alter_user_email_max_length', NOW()),
('auth', '0004_alter_user_username_opts', NOW()),
('auth', '0005_alter_user_last_login_null', NOW()),
('auth', '0006_require_contenttypes_0002', NOW()),
('auth', '0007_alter_validators_add_error_messages', NOW()),
('auth', '0008_alter_user_username_max_length', NOW()),
('auth', '0009_alter_user_last_name_max_length', NOW()),
('auth', '0010_alter_group_name_max_length', NOW()),
('auth', '0011_update_proxy_permissions', NOW()),
('auth', '0012_alter_user_first_name_max_length', NOW()),
('admin', '0001_initial', NOW()),
('admin', '0002_logentry_remove_auto_add', NOW()),
('admin', '0003_logentry_add_action_flag_choices', NOW()),
('sessions', '0001_initial', NOW());

-- Insertar migraciones de las apps del proyecto
-- Empleado
INSERT INTO `django_migrations` (`app`, `name`, `applied`) VALUES
('empleado', '0001_initial', NOW()),
('empleado', '0002_add_rol_field', NOW());

-- Inventario
INSERT INTO `django_migrations` (`app`, `name`, `applied`) VALUES
('inventario', '0001_initial', NOW());

-- Sistema
INSERT INTO `django_migrations` (`app`, `name`, `applied`) VALUES
('sistema', '0001_initial', NOW());

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_migraciones FROM `django_migrations`;
SELECT * FROM `django_migrations` ORDER BY `app`, `name`;

