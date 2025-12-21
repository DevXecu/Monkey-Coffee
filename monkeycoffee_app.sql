-- MySQL Workbench 8.0 CE Compatible SQL Dump
-- Base de datos: monkeycoffee_app
-- Versión mejorada con correcciones y datos adicionales
-- Generado para MySQL 8.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `monkeycoffee_app` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `monkeycoffee_app`;

START TRANSACTION;

-- TABLA: empleados
CREATE TABLE IF NOT EXISTS `empleados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rut` VARCHAR(12) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellido_paterno` VARCHAR(100) NOT NULL,
  `apellido_materno` VARCHAR(100) DEFAULT NULL,
  `apellidos` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(15) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `fecha_nacimiento` DATE DEFAULT NULL,
  `direccion` TEXT,
  `rol` ENUM('administrador','gerente','empleado') DEFAULT 'empleado',
  `cargo` VARCHAR(100) NOT NULL,
  `departamento` VARCHAR(100) DEFAULT NULL,
  `fecha_contratacion` DATE NOT NULL,
  `fecha_termino` DATE DEFAULT NULL,
  `salario` INT DEFAULT NULL,
  `tipo_contrato` ENUM('indefinido','plazo_fijo','full_time','part_time') NOT NULL,
  `estado` ENUM('activo','inactivo','vacaciones','licencia','desvinculado') DEFAULT 'activo',
  `huella_digital` BLOB,
  `foto_perfil` VARCHAR(255) DEFAULT NULL,
  `observaciones` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rut` (`rut`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_estado` (`estado`),
  KEY `idx_cargo` (`cargo`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MIGRACIÓN DE DATOS: Dividir apellidos en paterno y materno
-- Si la tabla ya tiene datos con el campo 'apellidos', ejecutar:
-- UPDATE empleados SET 
--   apellido_paterno = SUBSTRING_INDEX(apellidos, ' ', 1),
--   apellido_materno = CASE 
--     WHEN LOCATE(' ', apellidos) > 0 THEN SUBSTRING(apellidos, LOCATE(' ', apellidos) + 1)
--     ELSE NULL
--   END
-- WHERE apellido_paterno IS NULL OR apellido_paterno = '';

-- TABLA: turnos
CREATE TABLE IF NOT EXISTS `turnos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleados_rut` VARCHAR(12) NOT NULL,
  `nombre_turno` VARCHAR(100) NOT NULL,
  `hora_entrada` TIME NOT NULL,
  `hora_salida` TIME NOT NULL,
  `tolerancia_minutos` INT DEFAULT 15,
  `horas_trabajo` DECIMAL(4,2) NOT NULL,
  `descripcion` TEXT,
  `dias_semana` JSON DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre_turno` (`nombre_turno`),
  KEY `idx_empleados_rut` (`empleados_rut`),
  CONSTRAINT `fk_turnos_empleados` 
    FOREIGN KEY (`empleados_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: configuracion_app
CREATE TABLE IF NOT EXISTS `configuracion_app` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(100) NOT NULL,
  `valor` TEXT NOT NULL,
  `tipo` ENUM('string','number','boolean','json') DEFAULT 'string',
  `descripcion` TEXT,
  `categoria` VARCHAR(50) DEFAULT NULL,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`),
  KEY `idx_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: inventario
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo_producto` VARCHAR(50) NOT NULL,
  `nombre_producto` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `categoria` ENUM('cafe','insumos','equipamiento','desechables','alimentos','bebidas','limpieza','otros') NOT NULL,
  `unidad_medida` ENUM('unidad','kilogramo','litro','gramo','mililitro','paquete','caja','bolsa') NOT NULL,
  `cantidad_actual` INT NOT NULL DEFAULT 0,
  `cantidad_minima` INT NOT NULL,
  `cantidad_maxima` INT DEFAULT NULL,
  `precio_unitario` INT DEFAULT NULL COMMENT 'Precio en pesos chilenos',
  `precio_venta` INT DEFAULT NULL COMMENT 'Precio en pesos chilenos',
  `codigo_qr` VARCHAR(255) DEFAULT NULL,
  `codigo_barra` VARCHAR(100) DEFAULT NULL,
  `ubicacion` VARCHAR(100) DEFAULT NULL,
  `proveedor` VARCHAR(100) DEFAULT NULL,
  `contacto_proveedor` VARCHAR(100) DEFAULT NULL,
  `fecha_ultimo_ingreso` DATETIME DEFAULT NULL,
  `fecha_vencimiento` DATE DEFAULT NULL,
  `lote` VARCHAR(50) DEFAULT NULL,
  `estado` ENUM('disponible','agotado','por_vencer','vencido','en_pedido','descontinuado') DEFAULT 'disponible',
  `requiere_alerta` TINYINT(1) DEFAULT 0,
  `imagen_producto` VARCHAR(255) DEFAULT NULL,
  `notas` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_por` INT DEFAULT NULL,
  `actualizado_por` INT DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_producto` (`codigo_producto`),
  KEY `idx_nombre` (`nombre_producto`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_estado` (`estado`),
  KEY `idx_codigo_qr` (`codigo_qr`),
  KEY `idx_codigo_barra` (`codigo_barra`),
  KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  KEY `creado_por` (`creado_por`),
  KEY `actualizado_por` (`actualizado_por`),
  CONSTRAINT `inventario_ibfk_1` 
    FOREIGN KEY (`creado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL,
  CONSTRAINT `inventario_ibfk_2` 
    FOREIGN KEY (`actualizado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: tipos_solicitudes
CREATE TABLE IF NOT EXISTS `tipos_solicitudes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `requiere_aprobacion` TINYINT(1) DEFAULT 1,
  `dias_anticipacion` INT DEFAULT 1,
  `color_hex` VARCHAR(7) DEFAULT '#007bff',
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: asistencias
CREATE TABLE IF NOT EXISTS `asistencias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleado_rut` VARCHAR(12) NOT NULL,
  `fecha` DATE NOT NULL,
  `hora_entrada` DATETIME DEFAULT NULL,
  `hora_salida` DATETIME DEFAULT NULL,
  `tipo_entrada` ENUM('biometrico','manual','app_movil') DEFAULT 'biometrico',
  `tipo_salida` ENUM('biometrico','manual','app_movil') DEFAULT 'biometrico',
  `minutos_tarde` INT DEFAULT 0,
  `minutos_extras` INT DEFAULT 0,
  `horas_trabajadas` DECIMAL(4,2) DEFAULT NULL,
  `estado` ENUM('presente','tarde','ausente','justificado','permiso') DEFAULT 'presente',
  `observaciones` TEXT,
  `ubicacion_entrada` VARCHAR(255) DEFAULT NULL,
  `ubicacion_salida` VARCHAR(255) DEFAULT NULL,
  `ip_entrada` VARCHAR(45) DEFAULT NULL,
  `ip_salida` VARCHAR(45) DEFAULT NULL,
  `validado_por` INT DEFAULT NULL,
  `fecha_validacion` DATETIME DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_empleado_fecha` (`empleado_rut`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_estado` (`estado`),
  KEY `validado_por` (`validado_por`),
  CONSTRAINT `fk_asistencias_empleado` 
    FOREIGN KEY (`empleado_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` 
    FOREIGN KEY (`validado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: empleados_turnos
CREATE TABLE IF NOT EXISTS `empleados_turnos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleados_rut` VARCHAR(12) NOT NULL,
  `turno_id` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_empleados_rut` (`empleados_rut`),
  KEY `idx_turno_id` (`turno_id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  CONSTRAINT `empleados_turnos_ibfk_1` 
    FOREIGN KEY (`empleados_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE,
  CONSTRAINT `empleados_turnos_ibfk_2` 
    FOREIGN KEY (`turno_id`) 
    REFERENCES `turnos` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: horarios
CREATE TABLE IF NOT EXISTS `horarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleado_rut` VARCHAR(12) NOT NULL,
  `turno_id` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE DEFAULT NULL,
  `dias_semana` JSON DEFAULT NULL,
  `observaciones` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_turno_id` (`turno_id`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_empleado_rut` (`empleado_rut`),
  CONSTRAINT `horarios_ibfk_1` 
    FOREIGN KEY (`empleado_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE,
  CONSTRAINT `horarios_ibfk_2` 
    FOREIGN KEY (`turno_id`) 
    REFERENCES `turnos` (`id`) 
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_venta` VARCHAR(50) NOT NULL,
  `empleado_id` INT NOT NULL,
  `fecha_venta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subtotal` INT NOT NULL DEFAULT 0,
  `descuento` INT DEFAULT 0,
  `impuesto` INT DEFAULT 0,
  `total` INT NOT NULL,
  `metodo_pago` ENUM('efectivo','tarjeta_debito','tarjeta_credito','transferencia','multiple') NOT NULL,
  `estado` ENUM('completada','cancelada','pendiente','reembolsada') DEFAULT 'completada',
  `tipo_venta` ENUM('local','delivery','para_llevar') DEFAULT 'local',
  `mesa_numero` VARCHAR(20) DEFAULT NULL,
  `notas` TEXT,
  `cancelada_por` INT DEFAULT NULL,
  `fecha_cancelacion` DATETIME DEFAULT NULL,
  `motivo_cancelacion` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_venta` (`numero_venta`),
  KEY `idx_empleado_id` (`empleado_id`),
  KEY `idx_fecha_venta` (`fecha_venta`),
  KEY `idx_estado` (`estado`),
  KEY `idx_metodo_pago` (`metodo_pago`),
  KEY `cancelada_por` (`cancelada_por`),
  KEY `idx_fecha_estado` (`fecha_venta`, `estado`),
  CONSTRAINT `ventas_ibfk_1` 
    FOREIGN KEY (`empleado_id`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE RESTRICT,
  CONSTRAINT `ventas_ibfk_2` 
    FOREIGN KEY (`cancelada_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: detalle_ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `venta_id` INT NOT NULL,
  `inventario_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` INT NOT NULL,
  `subtotal` INT NOT NULL,
  `descuento_item` INT DEFAULT 0,
  `total_item` INT NOT NULL,
  `notas_item` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venta_id` (`venta_id`),
  KEY `idx_inventario_id` (`inventario_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` 
    FOREIGN KEY (`venta_id`) 
    REFERENCES `ventas` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `detalle_ventas_ibfk_2` 
    FOREIGN KEY (`inventario_id`) 
    REFERENCES `inventario` (`id`) 
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: alertas_inventario
CREATE TABLE IF NOT EXISTS `alertas_inventario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `inventario_id` INT NOT NULL,
  `tipo_alerta` ENUM('stock_bajo','stock_critico','producto_vencido','por_vencer','sin_stock','sobre_stock') NOT NULL,
  `mensaje` TEXT NOT NULL,
  `estado` ENUM('pendiente','revisada','resuelta','ignorada') DEFAULT 'pendiente',
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `fecha_alerta` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_resolucion` DATETIME DEFAULT NULL,
  `resuelto_por` INT DEFAULT NULL,
  `notas_resolucion` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_inventario_id` (`inventario_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_tipo_alerta` (`tipo_alerta`),
  KEY `idx_prioridad` (`prioridad`),
  KEY `idx_fecha_alerta` (`fecha_alerta`),
  KEY `resuelto_por` (`resuelto_por`),
  CONSTRAINT `alertas_inventario_ibfk_1` 
    FOREIGN KEY (`inventario_id`) 
    REFERENCES `inventario` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `alertas_inventario_ibfk_2` 
    FOREIGN KEY (`resuelto_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: movimientos_inventario
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `inventario_id` INT NOT NULL,
  `tipo_movimiento` ENUM('ingreso','salida','ajuste','merma','devolucion','transferencia','venta') NOT NULL,
  `cantidad` INT NOT NULL,
  `cantidad_anterior` INT NOT NULL,
  `cantidad_nueva` INT NOT NULL,
  `precio_unitario` INT DEFAULT NULL,
  `costo_total` INT DEFAULT NULL,
  `motivo` VARCHAR(255) DEFAULT NULL,
  `documento_referencia` VARCHAR(100) DEFAULT NULL,
  `proveedor` VARCHAR(100) DEFAULT NULL,
  `empleado_id` INT DEFAULT NULL,
  `ubicacion_origen` VARCHAR(100) DEFAULT NULL,
  `ubicacion_destino` VARCHAR(100) DEFAULT NULL,
  `fecha_movimiento` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `notas` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_inventario_id` (`inventario_id`),
  KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  KEY `idx_fecha_movimiento` (`fecha_movimiento`),
  KEY `idx_empleado_id` (`empleado_id`),
  KEY `idx_inventario_fecha_tipo` (`inventario_id`, `fecha_movimiento`, `tipo_movimiento`),
  CONSTRAINT `movimientos_inventario_ibfk_1` 
    FOREIGN KEY (`inventario_id`) 
    REFERENCES `inventario` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `movimientos_inventario_ibfk_2` 
    FOREIGN KEY (`empleado_id`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleado_id` INT NOT NULL,
  `tipo` ENUM('info','alerta','urgente','recordatorio','aprobacion') NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `modulo` VARCHAR(50) DEFAULT NULL,
  `referencia_id` INT DEFAULT NULL,
  `leida` TINYINT(1) DEFAULT 0,
  `fecha_lectura` DATETIME DEFAULT NULL,
  `requiere_accion` TINYINT(1) DEFAULT 0,
  `url_accion` VARCHAR(255) DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_empleado_id` (`empleado_id`),
  KEY `idx_leida` (`leida`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  CONSTRAINT `notificaciones_ibfk_1` 
    FOREIGN KEY (`empleado_id`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: solicitudes
CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleado_rut` VARCHAR(12) DEFAULT NULL,
  `empleado_id` INT NOT NULL,
  `tipo_solicitud_id` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `motivo` TEXT NOT NULL,
  `estado` ENUM('pendiente','aprobada','rechazada','cancelada') DEFAULT 'pendiente',
  `aprobado_por` INT DEFAULT NULL,
  `fecha_aprobacion` DATETIME DEFAULT NULL,
  `comentario_aprobacion` TEXT,
  `documento_adjunto` VARCHAR(255) DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_empleado_id` (`empleado_id`),
  KEY `idx_tipo_solicitud` (`tipo_solicitud_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `aprobado_por` (`aprobado_por`),
  CONSTRAINT `solicitudes_ibfk_1` 
    FOREIGN KEY (`empleado_id`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `solicitudes_ibfk_2` 
    FOREIGN KEY (`tipo_solicitud_id`) 
    REFERENCES `tipos_solicitudes` (`id`) 
    ON DELETE RESTRICT,
  CONSTRAINT `solicitudes_ibfk_3` 
    FOREIGN KEY (`aprobado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: tareas
CREATE TABLE IF NOT EXISTS `tareas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `tipo_tarea` ENUM('general','inventario','mantenimiento','limpieza','atencion_cliente','administrativa','urgente') NOT NULL DEFAULT 'general',
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `estado` ENUM('pendiente','en_proceso','completada','cancelada','pausada') DEFAULT 'pendiente',
  `asignada_a_rut` VARCHAR(12) DEFAULT NULL,
  `creada_por_rut` VARCHAR(12) NOT NULL,
  `fecha_inicio` DATETIME DEFAULT NULL,
  `fecha_vencimiento` DATETIME DEFAULT NULL,
  `fecha_completada` DATETIME DEFAULT NULL,
  `es_recurrente` TINYINT(1) DEFAULT 0,
  `frecuencia_recurrencia` ENUM('diaria','semanal','mensual','anual') DEFAULT NULL,
  `dias_recurrencia` JSON DEFAULT NULL,
  `ubicacion` VARCHAR(100) DEFAULT NULL,
  `modulo_relacionado` VARCHAR(50) DEFAULT NULL,
  `registro_relacionado_id` INT DEFAULT NULL,
  `tiempo_estimado_minutos` INT DEFAULT NULL,
  `tiempo_real_minutos` INT DEFAULT NULL,
  `porcentaje_completado` INT DEFAULT 0,
  `notas` TEXT,
  `archivo_adjunto` VARCHAR(255) DEFAULT NULL,
  `requiere_aprobacion` TINYINT(1) DEFAULT 0,
  `aprobada_por_rut` VARCHAR(12) DEFAULT NULL,
  `fecha_aprobacion` DATETIME DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `asignada_a_rut` (`asignada_a_rut`),
  KEY `creada_por_rut` (`creada_por_rut`),
  KEY `aprobada_por_rut` (`aprobada_por_rut`),
  CONSTRAINT `tareas_ibfk_1` 
    FOREIGN KEY (`asignada_a_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  CONSTRAINT `tareas_ibfk_2` 
    FOREIGN KEY (`creada_por_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `tareas_ibfk_3` 
    FOREIGN KEY (`aprobada_por_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: tareas_comentarios
CREATE TABLE IF NOT EXISTS `tareas_comentarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tarea_id` INT NOT NULL,
  `empleado_rut` VARCHAR(12) NOT NULL,
  `comentario` TEXT NOT NULL,
  `archivo_adjunto` VARCHAR(255) DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tarea_id` (`tarea_id`),
  KEY `empleado_rut` (`empleado_rut`),
  CONSTRAINT `tareas_comentarios_ibfk_1` 
    FOREIGN KEY (`tarea_id`) 
    REFERENCES `tareas` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `tareas_comentarios_ibfk_2` 
    FOREIGN KEY (`empleado_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: tareas_historial
CREATE TABLE IF NOT EXISTS `tareas_historial` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tarea_id` INT NOT NULL,
  `empleado_rut` VARCHAR(12) NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `campo_modificado` VARCHAR(50) DEFAULT NULL,
  `valor_anterior` TEXT,
  `valor_nuevo` TEXT,
  `descripcion` TEXT,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tarea_id` (`tarea_id`),
  KEY `empleado_rut` (`empleado_rut`),
  CONSTRAINT `tareas_historial_ibfk_1` 
    FOREIGN KEY (`tarea_id`) 
    REFERENCES `tareas` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `tareas_historial_ibfk_2` 
    FOREIGN KEY (`empleado_rut`) 
    REFERENCES `empleados` (`rut`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: reportes
CREATE TABLE IF NOT EXISTS `reportes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre_reporte` VARCHAR(200) NOT NULL,
  `tipo_reporte` ENUM('asistencia','inventario','personal','financiero','personalizado') NOT NULL,
  `periodo_inicio` DATE DEFAULT NULL,
  `periodo_fin` DATE DEFAULT NULL,
  `parametros` JSON DEFAULT NULL,
  `archivo_generado` VARCHAR(255) DEFAULT NULL,
  `formato` ENUM('pdf','excel','csv','json') DEFAULT 'pdf',
  `generado_por` INT DEFAULT NULL,
  `fecha_generacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tiempo_generacion` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tipo_reporte` (`tipo_reporte`),
  KEY `idx_fecha_generacion` (`fecha_generacion`),
  KEY `idx_generado_por` (`generado_por`),
  CONSTRAINT `reportes_ibfk_1` 
    FOREIGN KEY (`generado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: logs_actividad
CREATE TABLE IF NOT EXISTS `logs_actividad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empleado_id` INT DEFAULT NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `tabla_afectada` VARCHAR(100) DEFAULT NULL,
  `registro_id` INT DEFAULT NULL,
  `descripcion` TEXT,
  `datos_anteriores` JSON DEFAULT NULL,
  `datos_nuevos` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_empleado_id` (`empleado_id`),
  KEY `idx_modulo` (`modulo`),
  KEY `idx_fecha` (`fecha_registro`),
  KEY `idx_tabla_registro` (`tabla_afectada`,`registro_id`),
  CONSTRAINT `logs_actividad_ibfk_1` 
    FOREIGN KEY (`empleado_id`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: proveedores
CREATE TABLE `proveedores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `razon_social` VARCHAR(200) DEFAULT NULL,
  `rut` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `celular` VARCHAR(20) DEFAULT NULL,
  `sitio_web` VARCHAR(255) DEFAULT NULL,
  `direccion` TEXT,
  `ciudad` VARCHAR(100) DEFAULT NULL,
  `region` VARCHAR(100) DEFAULT NULL,
  `codigo_postal` VARCHAR(20) DEFAULT NULL,
  `pais` VARCHAR(100) DEFAULT 'Chile',
  `contacto_principal` VARCHAR(200) DEFAULT NULL,
  `cargo_contacto` VARCHAR(100) DEFAULT NULL,
  `email_contacto` VARCHAR(100) DEFAULT NULL,
  `telefono_contacto` VARCHAR(20) DEFAULT NULL,
  `estado` ENUM('activo','inactivo','suspendido') DEFAULT 'activo',
  `categoria` VARCHAR(100) DEFAULT NULL,
  `tipo_proveedor` VARCHAR(100) DEFAULT NULL,
  `condiciones_pago` VARCHAR(100) DEFAULT NULL,
  `plazo_entrega` VARCHAR(100) DEFAULT NULL,
  `descuento` DECIMAL(5,2) DEFAULT 0,
  `notas` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_por` INT DEFAULT NULL,
  `actualizado_por` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `rut` (`rut`),
  KEY `idx_estado` (`estado`),
  KEY `idx_activo` (`activo`),
  KEY `idx_creado_por` (`creado_por`),
  KEY `idx_actualizado_por` (`actualizado_por`),
  CONSTRAINT `proveedores_ibfk_1` 
    FOREIGN KEY (`creado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL,
  CONSTRAINT `proveedores_ibfk_2` 
    FOREIGN KEY (`actualizado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: ordenes_compra
CREATE TABLE `ordenes_compra` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_orden` VARCHAR(50) NOT NULL,
  `proveedor_id` INT NOT NULL,
  `fecha_orden` DATE NOT NULL,
  `fecha_entrega_esperada` DATE DEFAULT NULL,
  `fecha_entrega_real` DATE DEFAULT NULL,
  `estado` ENUM('borrador','pendiente','enviada','confirmada','en_transito','recibida','parcialmente_recibida','cancelada','facturada') DEFAULT 'borrador',
  `subtotal` INT DEFAULT 0,
  `descuento` INT DEFAULT 0,
  `impuestos` INT DEFAULT 0,
  `total` INT DEFAULT 0,
  `moneda` VARCHAR(10) DEFAULT 'CLP',
  `condiciones_pago` VARCHAR(200) DEFAULT NULL,
  `metodo_envio` VARCHAR(100) DEFAULT NULL,
  `direccion_entrega` TEXT,
  `notas` TEXT,
  `numero_factura` VARCHAR(50) DEFAULT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_aprobacion` DATETIME DEFAULT NULL,
  `creado_por` INT DEFAULT NULL,
  `aprobado_por` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `idx_proveedor_id` (`proveedor_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_orden` (`fecha_orden`),
  KEY `idx_creado_por` (`creado_por`),
  KEY `idx_aprobado_por` (`aprobado_por`),
  CONSTRAINT `ordenes_compra_ibfk_1` 
    FOREIGN KEY (`proveedor_id`) 
    REFERENCES `proveedores` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `ordenes_compra_ibfk_2` 
    FOREIGN KEY (`creado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL,
  CONSTRAINT `ordenes_compra_ibfk_3` 
    FOREIGN KEY (`aprobado_por`) 
    REFERENCES `empleados` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: items_orden_compra
CREATE TABLE `items_orden_compra` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orden_compra_id` INT NOT NULL,
  `producto_id` INT DEFAULT NULL,
  `codigo_producto` VARCHAR(50) DEFAULT NULL,
  `nombre_producto` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `cantidad` INT NOT NULL,
  `cantidad_recibida` INT DEFAULT 0,
  `unidad_medida` VARCHAR(20) DEFAULT 'unidad',
  `precio_unitario` INT NOT NULL,
  `descuento` INT DEFAULT 0,
  `precio_total` INT NOT NULL,
  `notas` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_orden_compra_id` (`orden_compra_id`),
  KEY `idx_producto_id` (`producto_id`),
  CONSTRAINT `items_orden_compra_ibfk_1` 
    FOREIGN KEY (`orden_compra_id`) 
    REFERENCES `ordenes_compra` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `items_orden_compra_ibfk_2` 
    FOREIGN KEY (`producto_id`) 
    REFERENCES `inventario` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VISTAS

CREATE VIEW `vista_ventas_inventario` AS
SELECT 
    v.id AS venta_id,
    v.numero_venta,
    v.fecha_venta,
    v.total AS total_venta,
    v.estado AS estado_venta,
    dv.id AS detalle_id,
    i.codigo_producto,
    i.nombre_producto,
    i.categoria,
    dv.cantidad AS cantidad_vendida,
    dv.precio_unitario,
    dv.total_item,
    i.cantidad_actual AS stock_actual,
    i.cantidad_minima AS stock_minimo,
    i.estado AS estado_producto,
    CASE 
        WHEN i.cantidad_actual = 0 THEN 'SIN STOCK'
        WHEN i.cantidad_actual <= i.cantidad_minima THEN 'STOCK BAJO'
        ELSE 'STOCK OK'
    END AS alerta_stock,
    e.nombres AS vendedor_nombre,
    CONCAT(e.apellido_paterno, IF(e.apellido_materno IS NOT NULL AND e.apellido_materno != '', CONCAT(' ', e.apellido_materno), '')) AS vendedor_apellido
FROM ventas v
INNER JOIN detalle_ventas dv ON v.id = dv.venta_id
INNER JOIN inventario i ON dv.inventario_id = i.id
INNER JOIN empleados e ON v.empleado_id = e.id
WHERE v.estado = 'completada'
ORDER BY v.fecha_venta DESC;

CREATE VIEW `vista_inventario_precios` AS
SELECT 
    id,
    codigo_producto,
    nombre_producto,
    descripcion,
    categoria,
    unidad_medida,
    cantidad_actual,
    cantidad_minima,
    cantidad_maxima,
    precio_unitario,
    precio_venta,
    ROUND(precio_venta * 1.19) AS precio_con_iva,
    (precio_venta - precio_unitario) AS ganancia,
    ROUND(((precio_venta - precio_unitario) / precio_unitario) * 100, 2) AS margen_porcentaje,
    codigo_qr,
    codigo_barra,
    ubicacion,
    proveedor,
    contacto_proveedor,
    fecha_ultimo_ingreso,
    fecha_vencimiento,
    lote,
    estado,
    requiere_alerta,
    imagen_producto,
    notas,
    fecha_creacion,
    fecha_actualizacion,
    creado_por,
    actualizado_por,
    activo
FROM inventario
WHERE activo = 1;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
