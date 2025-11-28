-- MySQL Workbench 8.0 CE Compatible SQL Dump
-- Base de datos: monkeycoffee_app
-- Versión mejorada con correcciones y datos adicionales
-- Generado para MySQL 8.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- CREAR BASE DE DATOS
-- ============================================================
CREATE DATABASE IF NOT EXISTS `monkeycoffee_app` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `monkeycoffee_app`;

START TRANSACTION;

-- ============================================================
-- TABLA: empleados
-- ============================================================
CREATE TABLE IF NOT EXISTS `empleados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rut` VARCHAR(12) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
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

-- ============================================================
-- TABLA: turnos
-- ============================================================
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

-- ============================================================
-- TABLA: configuracion_app
-- ============================================================
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

-- ============================================================
-- TABLA: inventario
-- ============================================================
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

-- ============================================================
-- TABLA: tipos_solicitudes
-- ============================================================
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

-- ============================================================
-- TABLA: asistencias
-- ============================================================
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

-- ============================================================
-- TABLA: empleados_turnos
-- ============================================================
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

-- ============================================================
-- TABLA: horarios
-- ============================================================
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

-- ============================================================
-- TABLA: ventas
-- ============================================================
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

-- ============================================================
-- TABLA: detalle_ventas
-- ============================================================
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

-- ============================================================
-- TABLA: alertas_inventario
-- ============================================================
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

-- ============================================================
-- TABLA: movimientos_inventario
-- ============================================================
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

-- ============================================================
-- TABLA: notificaciones
-- ============================================================
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

-- ============================================================
-- TABLA: solicitudes
-- ============================================================
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

-- ============================================================
-- TABLA: tareas
-- ============================================================
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

-- ============================================================
-- TABLA: tareas_comentarios
-- ============================================================
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

-- ============================================================
-- TABLA: tareas_historial
-- ============================================================
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

-- ============================================================
-- TABLA: reportes
-- ============================================================
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

-- ============================================================
-- TABLA: logs_actividad
-- ============================================================
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

-- ============================================================
-- VISTAS
-- ============================================================

DROP VIEW IF EXISTS `vista_ventas_inventario`;
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
    e.apellidos AS vendedor_apellido
FROM ventas v
INNER JOIN detalle_ventas dv ON v.id = dv.venta_id
INNER JOIN inventario i ON dv.inventario_id = i.id
INNER JOIN empleados e ON v.empleado_id = e.id
WHERE v.estado = 'completada'
ORDER BY v.fecha_venta DESC;

DROP VIEW IF EXISTS `vista_inventario_precios`;
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

-- ============================================================
-- DATOS INICIALES - EMPLEADOS
-- ============================================================

INSERT INTO `empleados` (`rut`, `nombres`, `apellidos`, `email`, `telefono`, `password`, `fecha_nacimiento`, `direccion`, `rol`, `cargo`, `departamento`, `fecha_contratacion`, `salario`, `tipo_contrato`, `estado`, `activo`) VALUES
('18.234.567-9', 'Maria', 'Gonzalez Perez', 'maria.gonzalez@monkeycoffee.cl', '+56912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-05-15', 'Av. Arturo Prat 1234, Iquique', 'gerente', 'Gerente General', 'Administracion', '2023-01-15', 850000, 'indefinido', 'activo', 1),
('19.345.678-2', 'Carlos', 'Ramirez Silva', 'carlos.ramirez@monkeycoffee.cl', '+56923456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1992-08-22', 'Calle Baquedano 567, Iquique', 'empleado', 'Barista Senior', 'Operaciones', '2023-02-01', 550000, 'indefinido', 'activo', 1),
('20.456.789-1', 'Fernanda', 'Torres Morales', 'fernanda.torres@monkeycoffee.cl', '+56934567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1995-11-10', 'Av. Heroes de la Concepcion 890, Alto Hospicio', 'empleado', 'Barista', 'Operaciones', '2023-03-10', 450000, 'indefinido', 'activo', 1),
('17.567.890-5', 'Diego', 'Vargas Castro', 'diego.vargas@monkeycoffee.cl', '+56945678901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1993-03-28', 'Pasaje Los Carrera 234, Iquique', 'empleado', 'Cajero', 'Ventas', '2023-04-05', 420000, 'indefinido', 'activo', 1),
('18.678.901-6', 'Camila', 'Herrera Rojas', 'camila.herrera@monkeycoffee.cl', '+56956789012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1996-07-14', 'Av. La Tirana 1456, Alto Hospicio', 'empleado', 'Barista', 'Operaciones', '2023-05-20', 450000, 'indefinido', 'activo', 1),
('19.789.012-6', 'Sebastian', 'Mendoza Lopez', 'sebastian.mendoza@monkeycoffee.cl', '+56967890123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1991-12-05', 'Calle Sargento Aldea 789, Iquique', 'gerente', 'Supervisor de Turno', 'Operaciones', '2023-01-20', 600000, 'indefinido', 'activo', 1),
('20.890.123-0', 'Valentina', 'Castro Diaz', 'valentina.castro@monkeycoffee.cl', '+56978901234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1994-09-18', 'Av. Esmeralda 321, Iquique', 'empleado', 'Cajera', 'Ventas', '2023-06-01', 420000, 'indefinido', 'activo', 1),
('17.901.234-0', 'Nicolas', 'Jimenez Flores', 'nicolas.jimenez@monkeycoffee.cl', '+56989012345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1997-02-25', 'Calle OHiggins 654, Alto Hospicio', 'empleado', 'Barista', 'Operaciones', '2023-07-15', 450000, 'indefinido', 'activo', 1),
('18.012.345-8', 'Javiera', 'Soto Martinez', 'javiera.soto@monkeycoffee.cl', '+56990123456', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1998-06-30', 'Av. Los Rieles 987, Alto Hospicio', 'empleado', 'Auxiliar de Cocina', 'Operaciones', '2023-08-10', 380000, 'indefinido', 'activo', 1),
('19.123.456-1', 'Andres', 'Contreras Vega', 'andres.contreras@monkeycoffee.cl', '+56901234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1992-10-12', 'Calle Thompson 456, Iquique', 'empleado', 'Encargado de Inventario', 'Logistica', '2023-02-15', 520000, 'indefinido', 'activo', 1),
('21.234.567-9', 'Sofia', 'Munoz Ortiz', 'sofia.munoz@monkeycoffee.cl', '+56912345679', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1999-04-12', 'Av. Tarapaca 2345, Iquique', 'empleado', 'Barista Junior', 'Operaciones', '2024-01-10', 420000, 'indefinido', 'activo', 1),
('16.789.012-1', 'Roberto', 'Paz Salazar', 'roberto.paz@monkeycoffee.cl', '+56923456780', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1989-11-28', 'Calle Vivar 678, Iquique', 'empleado', 'Encargado de Mantencion', 'Mantencion', '2023-03-01', 480000, 'indefinido', 'activo', 1);

-- ============================================================
-- DATOS INICIALES - TURNOS
-- ============================================================

INSERT INTO `turnos` (`empleados_rut`, `nombre_turno`, `hora_entrada`, `hora_salida`, `tolerancia_minutos`, `horas_trabajo`, `descripcion`, `dias_semana`, `activo`) VALUES
('18.234.567-9', 'Turno Administrativo', '08:00:00', '17:00:00', 15, 9.00, 'Turno administrativo de lunes a viernes', '[1, 2, 3, 4, 5]', 1),
('19.345.678-2', 'Turno Manana Barista', '07:00:00', '16:00:00', 15, 9.00, 'Turno manana para barista senior', '[1, 2, 3, 4, 5, 6]', 1),
('20.456.789-1', 'Turno Tarde', '13:00:00', '22:00:00', 15, 9.00, 'Turno tarde de lunes a domingo', '[1, 2, 3, 4, 5, 6, 7]', 1),
('17.567.890-5', 'Turno Manana Cajero', '08:00:00', '17:00:00', 15, 9.00, 'Turno manana para cajero', '[1, 2, 3, 4, 5, 6]', 1),
('18.678.901-6', 'Turno Tarde Barista', '14:00:00', '23:00:00', 15, 9.00, 'Turno tarde para barista', '[1, 2, 3, 4, 5, 6, 7]', 1),
('19.789.012-6', 'Turno Supervisor Manana', '06:00:00', '15:00:00', 15, 9.00, 'Turno supervisor manana', '[1, 2, 3, 4, 5, 6]', 1),
('20.890.123-0', 'Turno Manana Cajera', '08:00:00', '17:00:00', 15, 9.00, 'Turno manana para cajera', '[1, 2, 3, 4, 5, 6]', 1),
('17.901.234-0', 'Turno Noche', '18:00:00', '02:00:00', 15, 8.00, 'Turno noche de jueves a domingo', '[4, 5, 6, 7]', 1),
('18.012.345-8', 'Turno Auxiliar', '10:00:00', '19:00:00', 15, 9.00, 'Turno auxiliar de cocina', '[1, 2, 3, 4, 5, 6]', 1),
('19.123.456-1', 'Turno Logistica', '09:00:00', '18:00:00', 15, 9.00, 'Turno logistica e inventario', '[1, 2, 3, 4, 5]', 1),
('21.234.567-9', 'Turno Barista Junior', '08:00:00', '17:00:00', 15, 9.00, 'Turno manana barista junior', '[1, 2, 3, 4, 5, 6]', 1),
('16.789.012-1', 'Turno Mantencion', '09:00:00', '18:00:00', 15, 9.00, 'Turno mantencion y limpieza', '[1, 2, 3, 4, 5]', 1);

-- ============================================================
-- DATOS INICIALES - TIPOS DE SOLICITUDES
-- ============================================================

INSERT INTO `tipos_solicitudes` (`nombre`, `descripcion`, `requiere_aprobacion`, `dias_anticipacion`, `color_hex`, `activo`) VALUES
('Vacaciones', 'Solicitud de vacaciones anuales', 1, 15, '#4CAF50', 1),
('Permiso Personal', 'Permiso por motivos personales', 1, 2, '#2196F3', 1),
('Licencia Medica', 'Licencia por enfermedad o tratamiento medico', 1, 0, '#F44336', 1),
('Permiso Administrativo', 'Permiso por tramites administrativos', 1, 1, '#FF9800', 1),
('Cambio de Turno', 'Solicitud de cambio de turno', 1, 3, '#9C27B0', 1),
('Dia Libre', 'Solicitud de dia libre compensatorio', 1, 7, '#00BCD4', 1);

-- ============================================================
-- DATOS INICIALES - CONFIGURACION
-- ============================================================

INSERT INTO `configuracion_app` (`clave`, `valor`, `tipo`, `descripcion`, `categoria`) VALUES
('nombre_empresa', 'Monkey Coffee Iquique', 'string', 'Nombre de la empresa', 'General'),
('email_contacto', 'contacto@monkeycoffee.cl', 'string', 'Email de contacto principal', 'General'),
('telefono_contacto', '+56912345678', 'string', 'Telefono de contacto', 'General'),
('direccion', 'Av. Arturo Prat 1234, Iquique, Chile', 'string', 'Direccion fisica del local', 'General'),
('iva_porcentaje', '19', 'number', 'Porcentaje de IVA aplicado', 'Finanzas'),
('stock_minimo_alerta', '10', 'number', 'Cantidad minima para alertas de stock', 'Inventario'),
('dias_vencimiento_alerta', '7', 'number', 'Dias antes del vencimiento para generar alerta', 'Inventario'),
('horario_apertura', '07:00', 'string', 'Hora de apertura del local', 'Operaciones'),
('horario_cierre', '23:00', 'string', 'Hora de cierre del local', 'Operaciones'),
('modulo_ventas_activo', 'true', 'boolean', 'Modulo de ventas activado', 'Modulos'),
('modulo_inventario_activo', 'true', 'boolean', 'Modulo de inventario activado', 'Modulos'),
('modulo_asistencias_activo', 'true', 'boolean', 'Modulo de asistencias activado', 'Modulos');

-- ============================================================
-- DATOS INICIALES - INVENTARIO (Productos principales)
-- ============================================================

INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `estado`, `activo`) VALUES
('CAFE-001', 'Marley Coffee - One Love Organic', 'Cafe organico en grano 340g, tueste medio', 'cafe', 'paquete', 50, 15, 100, 8500, 12990, 'QR-CAFE-001', '7000000000001', 'Bodega A1', 'Distribuidora Marley Chile', 'disponible', 1),
('CAFE-002', 'Marley Coffee - Smile Jamaica', 'Cafe Jamaica Blue Mountain en grano 340g', 'cafe', 'paquete', 30, 10, 80, 9200, 13990, 'QR-CAFE-002', '7000000000002', 'Bodega A1', 'Distribuidora Marley Chile', 'disponible', 1),
('CAFE-003', 'Marley Coffee - Buffalo Soldier', 'Cafe oscuro intenso en grano 340g', 'cafe', 'paquete', 45, 12, 90, 8800, 12990, 'QR-CAFE-003', '7000000000003', 'Bodega A1', 'Distribuidora Marley Chile', 'disponible', 1),
('INS-001', 'Leche Entera Colun 1L', 'Leche entera pasteurizada', 'insumos', 'litro', 150, 50, 300, 850, 1290, NULL, '7801050100015', 'Refrigerador Principal', 'Colun Chile', 'disponible', 1),
('INS-002', 'Azucar Blanca Iansa 1kg', 'Azucar blanca refinada', 'insumos', 'kilogramo', 80, 20, 150, 800, 1590, NULL, '7802420100011', 'Bodega Seca', 'Iansa', 'disponible', 1),
('DES-001', 'Vasos Papel 8oz x100', 'Vasos desechables cafe caliente 8oz', 'desechables', 'paquete', 45, 10, 100, 2800, 0, NULL, NULL, 'Bodega Desechables', 'Papeleria del Norte', 'disponible', 1),
('MERCH-101', 'Taza Marley Coffee Logo', 'Taza ceramica 350ml con logo Marley', 'otros', 'unidad', 100, 20, 200, 3500, 7990, 'QR-MERCH-101', '7000000000010', 'Vitrina Principal', 'Importadora Nacional', 'disponible', 1),
('EQU-001', 'Prensa Francesa 1L', 'Cafetera prensa francesa vidrio', 'equipamiento', 'unidad', 15, 5, 30, 12000, 24990, 'QR-EQU-001', NULL, 'Vitrina Premium', 'Importadora Nacional', 'disponible', 1);

-- ============================================================
-- DATOS INICIALES - ASIGNACION EMPLEADOS A TURNOS
-- ============================================================

INSERT INTO `empleados_turnos` (`empleados_rut`, `turno_id`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
('18.234.567-9', 1, '2023-01-15', NULL, 1),
('19.345.678-2', 2, '2023-02-01', NULL, 1),
('20.456.789-1', 3, '2023-03-10', NULL, 1),
('17.567.890-5', 4, '2023-04-05', NULL, 1),
('18.678.901-6', 5, '2023-05-20', NULL, 1),
('19.789.012-6', 6, '2023-01-20', NULL, 1),
('20.890.123-0', 7, '2023-06-01', NULL, 1),
('17.901.234-0', 8, '2023-07-15', NULL, 1),
('18.012.345-8', 9, '2023-08-10', NULL, 1),
('19.123.456-1', 10, '2023-02-15', NULL, 1),
('21.234.567-9', 11, '2024-01-10', NULL, 1),
('16.789.012-1', 12, '2023-03-01', NULL, 1);

-- ============================================================
-- DATOS INICIALES - HORARIOS
-- ============================================================

INSERT INTO `horarios` (`empleado_rut`, `turno_id`, `fecha_inicio`, `fecha_fin`, `dias_semana`, `observaciones`, `activo`) VALUES
('18.234.567-9', 1, '2023-01-15', NULL, '[1, 2, 3, 4, 5]', 'Horario administrativo', 1),
('19.345.678-2', 2, '2023-02-01', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario barista senior', 1),
('20.456.789-1', 3, '2023-03-10', NULL, '[1, 2, 3, 4, 5, 6, 7]', 'Horario turno tarde', 1),
('17.567.890-5', 4, '2023-04-05', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario cajero manana', 1),
('18.678.901-6', 5, '2023-05-20', NULL, '[1, 2, 3, 4, 5, 6, 7]', 'Horario barista tarde', 1),
('19.789.012-6', 6, '2023-01-20', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario supervisor', 1),
('20.890.123-0', 7, '2023-06-01', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario cajera manana', 1),
('17.901.234-0', 8, '2023-07-15', NULL, '[4, 5, 6, 7]', 'Horario noche fin de semana', 1),
('18.012.345-8', 9, '2023-08-10', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario auxiliar cocina', 1),
('19.123.456-1', 10, '2023-02-15', NULL, '[1, 2, 3, 4, 5]', 'Horario logistica', 1),
('21.234.567-9', 11, '2024-01-10', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario barista junior', 1),
('16.789.012-1', 12, '2023-03-01', NULL, '[1, 2, 3, 4, 5]', 'Horario mantencion', 1);

-- ============================================================
-- DATOS INICIALES - VENTAS DE EJEMPLO
-- ============================================================

INSERT INTO `ventas` (`numero_venta`, `empleado_id`, `fecha_venta`, `subtotal`, `descuento`, `impuesto`, `total`, `metodo_pago`, `estado`, `tipo_venta`) VALUES
('VTA-2024-0001', 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 15990, 0, 3038, 19028, 'efectivo', 'completada', 'local'),
('VTA-2024-0002', 3, DATE_SUB(NOW(), INTERVAL 6 DAY), 8990, 0, 1708, 10698, 'tarjeta_debito', 'completada', 'local'),
('VTA-2024-0003', 4, DATE_SUB(NOW(), INTERVAL 5 DAY), 25980, 2000, 4546, 28526, 'tarjeta_credito', 'completada', 'local'),
('VTA-2024-0004', 2, DATE_SUB(NOW(), INTERVAL 4 DAY), 12990, 0, 2468, 15458, 'efectivo', 'completada', 'para_llevar'),
('VTA-2024-0005', 5, DATE_SUB(NOW(), INTERVAL 3 DAY), 34970, 3000, 6074, 38044, 'transferencia', 'completada', 'local'),
('VTA-2024-0006', 7, DATE_SUB(NOW(), INTERVAL 2 DAY), 19980, 0, 3796, 23776, 'tarjeta_credito', 'completada', 'local'),
('VTA-2024-0007', 8, DATE_SUB(NOW(), INTERVAL 1 DAY), 7990, 0, 1518, 9508, 'efectivo', 'completada', 'para_llevar'),
('VTA-2024-0008', 2, NOW(), 28960, 1500, 5217, 32677, 'tarjeta_debito', 'completada', 'local');

-- ============================================================
-- DATOS INICIALES - DETALLE VENTAS
-- ============================================================

INSERT INTO `detalle_ventas` (`venta_id`, `inventario_id`, `cantidad`, `precio_unitario`, `subtotal`, `descuento_item`, `total_item`) VALUES
(1, 1, 1, 12990, 12990, 0, 12990),
(1, 4, 1, 1290, 1290, 0, 1290),
(1, 6, 1, 1490, 1490, 0, 1490),
(2, 2, 1, 7990, 7990, 0, 7990),
(2, 5, 1, 1000, 1000, 0, 1000),
(3, 1, 2, 12990, 25980, 0, 25980),
(4, 2, 1, 13990, 13990, 1000, 12990),
(5, 1, 2, 12990, 25980, 0, 25980),
(5, 3, 1, 9990, 9990, 1000, 8990),
(6, 2, 1, 12790, 12790, 0, 12790),
(6, 7, 1, 6990, 6990, 0, 6990),
(7, 3, 1, 7990, 7990, 0, 7990),
(8, 1, 2, 12990, 25980, 0, 25980),
(8, 4, 1, 2990, 2990, 0, 2990);

-- ============================================================
-- DATOS INICIALES - ASISTENCIAS
-- ============================================================

-- Asistencias con estado 'presente' (mínimo 5)
INSERT INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`, `ubicacion_entrada`, `ip_entrada`) VALUES
('19.345.678-2', DATE_SUB(CURDATE(), INTERVAL 10 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 07:05:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), ' 16:00:00'), 'biometrico', 'biometrico', 0, 0, 8.92, 'presente', 'Asistencia normal', 'Local Principal', '192.168.1.10'),
('20.456.789-1', DATE_SUB(CURDATE(), INTERVAL 9 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 13:02:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 9 DAY), ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 8.97, 'presente', 'Turno completo', 'Local Principal', '192.168.1.10'),
('17.567.890-5', DATE_SUB(CURDATE(), INTERVAL 8 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 08:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 8 DAY), ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', 'Asistencia puntual', 'Local Principal', '192.168.1.10'),
('18.678.901-6', DATE_SUB(CURDATE(), INTERVAL 7 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 14:01:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 7 DAY), ' 23:00:00'), 'app_movil', 'app_movil', 0, 0, 8.98, 'presente', 'Registro desde app móvil', 'Local Principal', '192.168.1.15'),
('19.789.012-6', DATE_SUB(CURDATE(), INTERVAL 6 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 06:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', 'Supervisor turno mañana', 'Local Principal', '192.168.1.10');

-- Asistencias con estado 'tarde' (mínimo 5)
INSERT INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`, `ubicacion_entrada`, `ip_entrada`) VALUES
('20.890.123-0', DATE_SUB(CURDATE(), INTERVAL 12 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 12 DAY), ' 08:25:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 12 DAY), ' 17:00:00'), 'biometrico', 'biometrico', 25, 0, 8.58, 'tarde', 'Llegó 25 minutos tarde', 'Local Principal', '192.168.1.10'),
('17.901.234-0', DATE_SUB(CURDATE(), INTERVAL 11 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 11 DAY), ' 18:20:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 11 DAY), ' 02:00:00'), 'biometrico', 'biometrico', 20, 0, 7.67, 'tarde', 'Retraso por tráfico', 'Local Principal', '192.168.1.10'),
('21.234.567-9', DATE_SUB(CURDATE(), INTERVAL 13 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 13 DAY), ' 08:18:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 13 DAY), ' 17:00:00'), 'biometrico', 'biometrico', 18, 0, 8.70, 'tarde', 'Llegó tarde al turno', 'Local Principal', '192.168.1.10'),
('18.012.345-8', DATE_SUB(CURDATE(), INTERVAL 14 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 14 DAY), ' 10:22:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 14 DAY), ' 19:00:00'), 'manual', 'biometrico', 22, 0, 8.63, 'tarde', 'Registro manual por retraso', 'Local Principal', '192.168.1.10'),
('19.123.456-1', DATE_SUB(CURDATE(), INTERVAL 15 DAY), CONCAT(DATE_SUB(CURDATE(), INTERVAL 15 DAY), ' 09:30:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 15 DAY), ' 18:00:00'), 'biometrico', 'biometrico', 30, 0, 8.50, 'tarde', 'Retraso significativo', 'Local Principal', '192.168.1.10');

-- Asistencias con estado 'ausente' (mínimo 5)
INSERT INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`) VALUES
('19.345.678-2', DATE_SUB(CURDATE(), INTERVAL 20 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'ausente', 'No se presentó al trabajo'),
('20.456.789-1', DATE_SUB(CURDATE(), INTERVAL 19 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'ausente', 'Ausencia sin justificación'),
('17.567.890-5', DATE_SUB(CURDATE(), INTERVAL 18 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'ausente', 'No asistió al turno'),
('18.678.901-6', DATE_SUB(CURDATE(), INTERVAL 17 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'ausente', 'Ausente sin aviso previo'),
('19.789.012-6', DATE_SUB(CURDATE(), INTERVAL 16 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'ausente', 'Falta injustificada');

-- Asistencias con estado 'justificado' (mínimo 5)
INSERT INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`, `validado_por`, `fecha_validacion`) VALUES
('20.890.123-0', DATE_SUB(CURDATE(), INTERVAL 25 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'justificado', 'Licencia médica presentada', 1, NOW()),
('17.901.234-0', DATE_SUB(CURDATE(), INTERVAL 24 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'justificado', 'Fallecimiento familiar - justificado', 1, NOW()),
('21.234.567-9', DATE_SUB(CURDATE(), INTERVAL 23 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'justificado', 'Accidente de tránsito - justificado', 1, NOW()),
('18.012.345-8', DATE_SUB(CURDATE(), INTERVAL 22 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'justificado', 'Emergencia médica familiar', 1, NOW()),
('19.123.456-1', DATE_SUB(CURDATE(), INTERVAL 21 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'justificado', 'Licencia médica por enfermedad', 1, NOW());

-- Asistencias con estado 'permiso' (mínimo 5)
INSERT INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`, `validado_por`, `fecha_validacion`) VALUES
('19.345.678-2', DATE_SUB(CURDATE(), INTERVAL 30 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'permiso', 'Permiso administrativo aprobado', 1, NOW()),
('20.456.789-1', DATE_SUB(CURDATE(), INTERVAL 29 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'permiso', 'Permiso personal autorizado', 1, NOW()),
('17.567.890-5', DATE_SUB(CURDATE(), INTERVAL 28 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'permiso', 'Día libre compensatorio', 1, NOW()),
('18.678.901-6', DATE_SUB(CURDATE(), INTERVAL 27 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'permiso', 'Permiso por trámite personal', 1, NOW()),
('19.789.012-6', DATE_SUB(CURDATE(), INTERVAL 26 DAY), NULL, NULL, NULL, NULL, 0, 0, 0.00, 'permiso', 'Permiso aprobado por supervisor', 1, NOW());

-- ============================================================
-- DATOS INICIALES - INVENTARIO ADICIONAL (por estado)
-- ============================================================

-- Productos con estado 'disponible' (mínimo 5 adicionales)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('CAFE-004', 'Marley Coffee - Lively Up', 'Cafe en grano tueste medio 340g', 'cafe', 'paquete', 75, 20, 150, 9000, 13990, 'QR-CAFE-004', '7000000000004', 'Bodega A1', 'Distribuidora Marley Chile', '+56912345678', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'LOT-2024-001', 'disponible', 0, 1),
('INS-003', 'Leche Deslactosada Colun 1L', 'Leche deslactosada pasteurizada', 'insumos', 'litro', 120, 40, 250, 950, 1390, NULL, '7801050100016', 'Refrigerador Principal', 'Colun Chile', '+56923456789', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'LOT-2024-002', 'disponible', 0, 1),
('INS-004', 'Leche de Almendras 1L', 'Leche vegetal de almendras', 'insumos', 'litro', 60, 15, 100, 2500, 3990, NULL, '7801050100017', 'Refrigerador Principal', 'Distribuidora Vegana', '+56934567890', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'LOT-2024-003', 'disponible', 0, 1),
('INS-005', 'Miel Natural 500g', 'Miel de abeja natural', 'insumos', 'gramo', 500, 100, 1000, 3500, 5990, NULL, '7801050100018', 'Bodega Seca', 'Apicultura del Norte', '+56945678901', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'LOT-2024-004', 'disponible', 0, 1),
('DES-002', 'Vasos Papel 12oz x100', 'Vasos desechables cafe caliente 12oz', 'desechables', 'paquete', 60, 15, 120, 3200, 0, NULL, NULL, 'Bodega Desechables', 'Papeleria del Norte', '+56956789012', DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, NULL, 'disponible', 0, 1);

-- Productos con estado 'agotado' (mínimo 5)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('CAFE-005', 'Marley Coffee - Get Up Stand Up', 'Cafe en grano tueste oscuro 340g', 'cafe', 'paquete', 0, 15, 100, 9500, 14990, 'QR-CAFE-005', '7000000000005', 'Bodega A1', 'Distribuidora Marley Chile', '+56912345678', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 150 DAY), 'LOT-2023-050', 'agotado', 1, 1),
('INS-006', 'Leche Condensada Nestle 397g', 'Leche condensada azucarada', 'insumos', 'gramo', 0, 10, 50, 1200, 2490, NULL, '7801050100019', 'Bodega Seca', 'Nestle Chile', '+56967890123', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'LOT-2023-051', 'agotado', 1, 1),
('INS-007', 'Canela Molida 100g', 'Canela en polvo para espolvorear', 'insumos', 'gramo', 0, 5, 30, 1500, 2990, NULL, '7801050100020', 'Bodega Seca', 'Especias del Norte', '+56978901234', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 730 DAY), 'LOT-2023-052', 'agotado', 1, 1),
('DES-003', 'Tapas Vasos Calientes x100', 'Tapas plásticas para vasos calientes', 'desechables', 'paquete', 0, 10, 80, 1800, 0, NULL, NULL, 'Bodega Desechables', 'Papeleria del Norte', '+56956789012', DATE_SUB(NOW(), INTERVAL 15 DAY), NULL, NULL, 'agotado', 1, 1),
('EQU-002', 'Molino de Cafe Manual', 'Molino manual para cafe en grano', 'equipamiento', 'unidad', 0, 2, 10, 25000, 49990, 'QR-EQU-002', NULL, 'Vitrina Premium', 'Importadora Nacional', '+56989012345', DATE_SUB(NOW(), INTERVAL 60 DAY), NULL, NULL, 'agotado', 1, 1);

-- Productos con estado 'por_vencer' (mínimo 5)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('INS-008', 'Leche Entera Colun 1L', 'Leche entera - por vencer', 'insumos', 'litro', 25, 50, 300, 850, 1290, NULL, '7801050100021', 'Refrigerador Principal', 'Colun Chile', '+56912345678', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'LOT-2024-005', 'por_vencer', 1, 1),
('INS-009', 'Crema de Leche Nestle 200ml', 'Crema para batir', 'insumos', 'mililitro', 200, 50, 500, 1200, 2490, NULL, '7801050100022', 'Refrigerador Principal', 'Nestle Chile', '+56923456789', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'LOT-2024-006', 'por_vencer', 1, 1),
('INS-010', 'Yogurt Natural 1L', 'Yogurt natural sin azucar', 'insumos', 'litro', 15, 20, 100, 1800, 2990, NULL, '7801050100023', 'Refrigerador Principal', 'Colun Chile', '+56934567890', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'LOT-2024-007', 'por_vencer', 1, 1),
('ALI-001', 'Croissant Mantequilla x6', 'Croissants de mantequilla', 'alimentos', 'paquete', 8, 5, 30, 3500, 5990, NULL, '7801050100024', 'Refrigerador Pasteleria', 'Panaderia Artesanal', '+56945678901', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'LOT-2024-008', 'por_vencer', 1, 1),
('ALI-002', 'Muffin Chocolate x4', 'Muffins de chocolate', 'alimentos', 'paquete', 12, 5, 25, 2800, 4990, NULL, '7801050100025', 'Refrigerador Pasteleria', 'Panaderia Artesanal', '+56956789012', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'LOT-2024-009', 'por_vencer', 1, 1);

-- Productos con estado 'vencido' (mínimo 5)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('INS-011', 'Leche Entera Colun 1L', 'Leche entera vencida', 'insumos', 'litro', 8, 50, 300, 850, 0, NULL, '7801050100026', 'Refrigerador Principal', 'Colun Chile', '+56912345678', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'LOT-2023-060', 'vencido', 1, 1),
('INS-012', 'Crema de Leche Nestle 200ml', 'Crema vencida', 'insumos', 'mililitro', 200, 50, 500, 1200, 0, NULL, '7801050100027', 'Refrigerador Principal', 'Nestle Chile', '+56923456789', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'LOT-2023-061', 'vencido', 1, 1),
('ALI-003', 'Croissant Mantequilla x6', 'Croissants vencidos', 'alimentos', 'paquete', 3, 5, 30, 3500, 0, NULL, '7801050100028', 'Refrigerador Pasteleria', 'Panaderia Artesanal', '+56945678901', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'LOT-2023-062', 'vencido', 1, 1),
('ALI-004', 'Muffin Chocolate x4', 'Muffins vencidos', 'alimentos', 'paquete', 2, 5, 25, 2800, 0, NULL, '7801050100029', 'Refrigerador Pasteleria', 'Panaderia Artesanal', '+56956789012', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'LOT-2023-063', 'vencido', 1, 1),
('BEB-001', 'Jugo de Naranja Natural 1L', 'Jugo natural vencido', 'bebidas', 'litro', 5, 10, 50, 1500, 0, NULL, '7801050100030', 'Refrigerador Principal', 'Jugos del Norte', '+56967890123', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'LOT-2023-064', 'vencido', 1, 1);

-- Productos con estado 'en_pedido' (mínimo 5)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('CAFE-006', 'Marley Coffee - Three Little Birds', 'Cafe en grano tueste suave 340g', 'cafe', 'paquete', 0, 15, 100, 9200, 13990, 'QR-CAFE-006', '7000000000006', 'Bodega A1', 'Distribuidora Marley Chile', '+56912345678', NULL, NULL, NULL, 'en_pedido', 0, 1),
('INS-013', 'Leche de Coco 400ml', 'Leche vegetal de coco', 'insumos', 'mililitro', 0, 20, 100, 2200, 3990, NULL, '7801050100031', 'Bodega Seca', 'Distribuidora Vegana', '+56934567890', NULL, NULL, NULL, 'en_pedido', 0, 1),
('INS-014', 'Chocolate en Polvo 500g', 'Chocolate en polvo para bebidas', 'insumos', 'gramo', 0, 10, 50, 3500, 5990, NULL, '7801050100032', 'Bodega Seca', 'Nestle Chile', '+56967890123', NULL, NULL, NULL, 'en_pedido', 0, 1),
('DES-004', 'Sorbetes Biodegradables x500', 'Sorbetes ecológicos', 'desechables', 'paquete', 0, 5, 20, 4500, 0, NULL, NULL, 'Bodega Desechables', 'Papeleria del Norte', '+56956789012', NULL, NULL, NULL, 'en_pedido', 0, 1),
('EQU-003', 'Tamper para Cafe', 'Pisón profesional para cafe', 'equipamiento', 'unidad', 0, 3, 15, 15000, 29990, 'QR-EQU-003', NULL, 'Vitrina Premium', 'Importadora Nacional', '+56989012345', NULL, NULL, NULL, 'en_pedido', 0, 1);

-- Productos con estado 'descontinuado' (mínimo 5)
INSERT INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `activo`) VALUES
('CAFE-007', 'Marley Coffee - Legend (Descontinuado)', 'Cafe en grano edición limitada', 'cafe', 'paquete', 5, 0, 0, 10000, 0, 'QR-CAFE-007', '7000000000007', 'Bodega A1', 'Distribuidora Marley Chile', '+56912345678', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'LOT-2023-070', 'descontinuado', 0, 0),
('INS-015', 'Leche de Soya (Descontinuado)', 'Leche vegetal de soya', 'insumos', 'litro', 3, 0, 0, 2000, 0, NULL, '7801050100033', 'Bodega Seca', 'Distribuidora Vegana', '+56934567890', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'LOT-2023-071', 'descontinuado', 0, 0),
('DES-005', 'Vasos Plásticos 8oz (Descontinuado)', 'Vasos plásticos descontinuados', 'desechables', 'paquete', 8, 0, 0, 2500, 0, NULL, NULL, 'Bodega Desechables', 'Papeleria del Norte', '+56956789012', DATE_SUB(NOW(), INTERVAL 45 DAY), NULL, NULL, 'descontinuado', 0, 0),
('EQU-004', 'Cafetera Italiana 6 tazas (Descontinuado)', 'Cafetera moka descontinuada', 'equipamiento', 'unidad', 2, 0, 0, 18000, 0, 'QR-EQU-004', NULL, 'Vitrina Premium', 'Importadora Nacional', '+56989012345', DATE_SUB(NOW(), INTERVAL 120 DAY), NULL, NULL, 'descontinuado', 0, 0),
('MERCH-102', 'Taza Vintage Marley (Descontinuado)', 'Taza edición limitada descontinuada', 'otros', 'unidad', 4, 0, 0, 4000, 0, 'QR-MERCH-102', '7000000000011', 'Vitrina Principal', 'Importadora Nacional', '+56989012345', DATE_SUB(NOW(), INTERVAL 100 DAY), NULL, NULL, 'descontinuado', 0, 0);

-- ============================================================
-- FINALIZACION
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- ============================================================
-- IMPORTANTE: SINCRONIZACIÓN DE MIGRACIONES DE DJANGO
-- ============================================================
-- Después de importar este archivo SQL, necesitas sincronizar
-- las migraciones de Django para que el proyecto funcione correctamente.
--
-- OPCIÓN 1 (Recomendada): Ejecuta el script SQL:
--   mysql -u root -p monkeycoffee_app < sync_migrations.sql
--
-- OPCIÓN 2: Ejecuta el script Python:
--   python sync_migrations.py
--
-- OPCIÓN 3: Manualmente con Django:
--   python manage.py migrate --fake
--
-- Para más detalles, consulta: INSTRUCCIONES_MIGRACIONES.md
-- ============================================================