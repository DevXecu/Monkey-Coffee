-- MySQL Workbench 8.0 CE Compatible SQL Dump
-- Base de datos: monkeycoffee_app
-- Generado para MySQL 8.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `monkeycoffee_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `monkeycoffee_app`;

START TRANSACTION;

SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;

-- Nota: Este script usa CREATE TABLE IF NOT EXISTS para evitar errores
-- si las tablas ya existen. Si necesitas recrear las tablas desde cero,
-- descomenta las siguientes líneas para eliminar las tablas primero:
--
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS `vista_ventas_inventario`;
-- DROP TABLE IF EXISTS `tareas_historial`;
-- DROP TABLE IF EXISTS `tareas_comentarios`;
-- DROP TABLE IF EXISTS `tareas`;
-- DROP TABLE IF EXISTS `solicitudes`;
-- DROP TABLE IF EXISTS `notificaciones`;
-- DROP TABLE IF EXISTS `movimientos_inventario`;
-- DROP TABLE IF EXISTS `alertas_inventario`;
-- DROP TABLE IF EXISTS `detalle_ventas`;
-- DROP TABLE IF EXISTS `ventas`;
-- DROP TABLE IF EXISTS `horarios`;
-- DROP TABLE IF EXISTS `empleados_turnos`;
-- DROP TABLE IF EXISTS `turnos`;
-- DROP TABLE IF EXISTS `asistencias`;
-- DROP TABLE IF EXISTS `reportes`;
-- DROP TABLE IF EXISTS `logs_actividad`;
-- DROP TABLE IF EXISTS `inventario`;
-- DROP TABLE IF EXISTS `tipos_solicitudes`;
-- DROP TABLE IF EXISTS `configuracion_app`;
-- DROP TABLE IF EXISTS `empleados`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_inventario`
--

CREATE TABLE IF NOT EXISTS `alertas_inventario` (
  `id` int NOT NULL,
  `inventario_id` int NOT NULL,
  `tipo_alerta` enum('stock_bajo','stock_critico','producto_vencido','por_vencer','sin_stock','sobre_stock') COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('pendiente','revisada','resuelta','ignorada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta','critica') COLLATE utf8mb4_general_ci DEFAULT 'media',
  `fecha_alerta` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_resolucion` datetime DEFAULT NULL,
  `resuelto_por` int DEFAULT NULL,
  `notas_resolucion` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE IF NOT EXISTS `asistencias` (
  `id` int NOT NULL,
  `empleado_rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` datetime DEFAULT NULL,
  `hora_salida` datetime DEFAULT NULL,
  `tipo_entrada` enum('biometrico','manual','app_movil') COLLATE utf8mb4_general_ci DEFAULT 'biometrico',
  `tipo_salida` enum('biometrico','manual','app_movil') COLLATE utf8mb4_general_ci DEFAULT 'biometrico',
  `minutos_tarde` int DEFAULT '0',
  `minutos_extras` int DEFAULT '0',
  `horas_trabajadas` decimal(4,2) DEFAULT NULL,
  `estado` enum('presente','tarde','ausente','justificado','permiso') COLLATE utf8mb4_general_ci DEFAULT 'presente',
  `observaciones` text COLLATE utf8mb4_general_ci,
  `ubicacion_entrada` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ubicacion_salida` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ip_entrada` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ip_salida` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `validado_por` int DEFAULT NULL,
  `fecha_validacion` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `configuracion_app`
--

CREATE TABLE IF NOT EXISTS `configuracion_app` (
  `id` int NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `valor` text COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('string','number','boolean','json') COLLATE utf8mb4_general_ci DEFAULT 'string',
  `descripcion` text COLLATE utf8mb4_general_ci,
  `categoria` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id` int NOT NULL,
  `venta_id` int NOT NULL,
  `inventario_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `descuento_item` decimal(10,2) DEFAULT '0.00',
  `total_item` decimal(10,2) NOT NULL,
  `notas_item` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE IF NOT EXISTS `empleados` (
  `id` int NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `cargo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_contratacion` date NOT NULL,
  `fecha_termino` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `tipo_contrato` enum('indefinido','plazo_fijo','full_time','part_time') COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('activo','inactivo','vacaciones','licencia','desvinculado') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `huella_digital` blob,
  `foto_perfil` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `empleados_turnos`
--

CREATE TABLE IF NOT EXISTS `empleados_turnos` (
  `id` int NOT NULL,
  `empleados_rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `turno_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE IF NOT EXISTS `horarios` (
  `id` int NOT NULL,
  `empleado_rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `turno_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `dias_semana` json DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--
-- Nota: Los datos de ejemplo se insertarán después de crear los empleados y turnos

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE IF NOT EXISTS `inventario` (
  `id` int NOT NULL,
  `codigo_producto` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_producto` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `categoria` enum('cafe','insumos','equipamiento','desechables','alimentos','bebidas','limpieza','otros') COLLATE utf8mb4_general_ci NOT NULL,
  `unidad_medida` enum('unidad','kilogramo','litro','gramo','mililitro','paquete','caja','bolsa') COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_minima` decimal(10,2) NOT NULL,
  `cantidad_maxima` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `codigo_qr` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo_barra` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ubicacion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `proveedor` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contacto_proveedor` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_ultimo_ingreso` datetime DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `lote` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('disponible','agotado','por_vencer','vencido','en_pedido','descontinuado') COLLATE utf8mb4_general_ci DEFAULT 'disponible',
  `requiere_alerta` tinyint(1) DEFAULT '0',
  `imagen_producto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_por` int DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_actividad`
--

CREATE TABLE IF NOT EXISTS `logs_actividad` (
  `id` int NOT NULL,
  `empleado_id` int DEFAULT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `accion` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `registro_id` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_general_ci,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id` int NOT NULL,
  `inventario_id` int NOT NULL,
  `tipo_movimiento` enum('ingreso','salida','ajuste','merma','devolucion','transferencia','venta') COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `cantidad_anterior` decimal(10,2) NOT NULL,
  `cantidad_nueva` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `costo_total` decimal(10,2) DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `documento_referencia` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `proveedor` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `empleado_id` int DEFAULT NULL,
  `ubicacion_origen` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ubicacion_destino` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_movimiento` datetime DEFAULT CURRENT_TIMESTAMP,
  `notas` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int NOT NULL,
  `empleado_id` int NOT NULL,
  `tipo` enum('info','alerta','urgente','recordatorio','aprobacion') COLLATE utf8mb4_general_ci NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_lectura` datetime DEFAULT NULL,
  `requiere_accion` tinyint(1) DEFAULT '0',
  `url_accion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE IF NOT EXISTS `reportes` (
  `id` int NOT NULL,
  `nombre_reporte` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_reporte` enum('asistencia','inventario','personal','financiero','personalizado') COLLATE utf8mb4_general_ci NOT NULL,
  `periodo_inicio` date DEFAULT NULL,
  `periodo_fin` date DEFAULT NULL,
  `parametros` json DEFAULT NULL,
  `archivo_generado` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `formato` enum('pdf','excel','csv','json') COLLATE utf8mb4_general_ci DEFAULT 'pdf',
  `generado_por` int DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `tiempo_generacion` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` int NOT NULL,
  `empleado_rut` varchar(12) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `empleado_id` int NOT NULL,
  `tipo_solicitud_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `motivo` text COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada','cancelada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `aprobado_por` int DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `comentario_aprobacion` text COLLATE utf8mb4_general_ci,
  `documento_adjunto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE IF NOT EXISTS `tareas` (
  `id` int NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `tipo_tarea` enum('general','inventario','mantenimiento','limpieza','atencion_cliente','administrativa','urgente') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'general',
  `prioridad` enum('baja','media','alta','critica') COLLATE utf8mb4_general_ci DEFAULT 'media',
  `estado` enum('pendiente','en_proceso','completada','cancelada','pausada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `asignada_a_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `creada_por_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `fecha_completada` datetime DEFAULT NULL,
  `es_recurrente` tinyint(1) DEFAULT '0',
  `frecuencia_recurrencia` enum('diaria','semanal','mensual','anual') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dias_recurrencia` json DEFAULT NULL,
  `ubicacion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modulo_relacionado` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `registro_relacionado_id` int DEFAULT NULL,
  `tiempo_estimado_minutos` int DEFAULT NULL,
  `tiempo_real_minutos` int DEFAULT NULL,
  `porcentaje_completado` int DEFAULT '0',
  `notas` text COLLATE utf8mb4_general_ci,
  `archivo_adjunto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) DEFAULT '0',
  `aprobada_por_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas_comentarios`
--

CREATE TABLE IF NOT EXISTS `tareas_comentarios` (
  `id` int NOT NULL,
  `tarea_id` int NOT NULL,
  `empleado_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `comentario` text COLLATE utf8mb4_general_ci NOT NULL,
  `archivo_adjunto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas_historial`
--

CREATE TABLE IF NOT EXISTS `tareas_historial` (
  `id` int NOT NULL,
  `tarea_id` int NOT NULL,
  `empleado_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `accion` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `campo_modificado` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `valor_anterior` text COLLATE utf8mb4_general_ci,
  `valor_nuevo` text COLLATE utf8mb4_general_ci,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_solicitudes`
--

CREATE TABLE IF NOT EXISTS `tipos_solicitudes` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `requiere_aprobacion` tinyint(1) DEFAULT '1',
  `dias_anticipacion` int DEFAULT '1',
  `color_hex` varchar(7) COLLATE utf8mb4_general_ci DEFAULT '#007bff',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE IF NOT EXISTS `turnos` (
  `id` int NOT NULL,
  `empleados_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_turno` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time NOT NULL,
  `tolerancia_minutos` int DEFAULT '15',
  `horas_trabajo` decimal(4,2) NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `dias_semana` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `turnos`
--
-- Nota: Los datos de ejemplo se insertarán después de crear los empleados

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE IF NOT EXISTS `ventas` (
  `id` int NOT NULL,
  `numero_venta` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empleado_id` int NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(10,2) DEFAULT '0.00',
  `impuesto` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta_debito','tarjeta_credito','transferencia','multiple') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('completada','cancelada','pendiente','reembolsada') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'completada',
  `tipo_venta` enum('local','delivery','para_llevar') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'local',
  `mesa_numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cancelada_por` int DEFAULT NULL,
  `fecha_cancelacion` datetime DEFAULT NULL,
  `motivo_cancelacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventario_id` (`inventario_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo_alerta` (`tipo_alerta`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_fecha_alerta` (`fecha_alerta`),
  ADD KEY `resuelto_por` (`resuelto_por`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_empleado_fecha` (`empleado_rut`,`fecha`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `validado_por` (`validado_por`);

--
-- Indices de la tabla `configuracion_app`
--
ALTER TABLE `configuracion_app`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD KEY `idx_categoria` (`categoria`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_venta_id` (`venta_id`),
  ADD KEY `idx_inventario_id` (`inventario_id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_cargo` (`cargo`);

--
-- Indices de la tabla `empleados_turnos`
--
ALTER TABLE `empleados_turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleados_rut` (`empleados_rut`),
  ADD KEY `idx_turno_id` (`turno_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_turno_id` (`turno_id`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_empleado_rut` (`empleado_rut`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_producto` (`codigo_producto`),
  ADD KEY `idx_nombre` (`nombre_producto`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_codigo_qr` (`codigo_qr`),
  ADD KEY `idx_codigo_barra` (`codigo_barra`),
  ADD KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `actualizado_por` (`actualizado_por`);

--
-- Indices de la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado_id` (`empleado_id`),
  ADD KEY `idx_modulo` (`modulo`),
  ADD KEY `idx_fecha` (`fecha_registro`),
  ADD KEY `idx_tabla_registro` (`tabla_afectada`,`registro_id`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventario_id` (`inventario_id`),
  ADD KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  ADD KEY `idx_fecha_movimiento` (`fecha_movimiento`),
  ADD KEY `idx_empleado_id` (`empleado_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado_id` (`empleado_id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tipo_reporte` (`tipo_reporte`),
  ADD KEY `idx_fecha_generacion` (`fecha_generacion`),
  ADD KEY `idx_generado_por` (`generado_por`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado_id` (`empleado_id`),
  ADD KEY `idx_tipo_solicitud` (`tipo_solicitud_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `aprobado_por` (`aprobado_por`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asignada_a_rut` (`asignada_a_rut`),
  ADD KEY `creada_por_rut` (`creada_por_rut`),
  ADD KEY `aprobada_por_rut` (`aprobada_por_rut`);

--
-- Indices de la tabla `tareas_comentarios`
--
ALTER TABLE `tareas_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarea_id` (`tarea_id`),
  ADD KEY `empleado_rut` (`empleado_rut`);

--
-- Indices de la tabla `tareas_historial`
--
ALTER TABLE `tareas_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarea_id` (`tarea_id`),
  ADD KEY `empleado_rut` (`empleado_rut`);

--
-- Indices de la tabla `tipos_solicitudes`
--
ALTER TABLE `tipos_solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre_turno` (`nombre_turno`),
  ADD KEY `idx_empleados_rut` (`empleados_rut`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_venta` (`numero_venta`),
  ADD KEY `idx_empleado_id` (`empleado_id`),
  ADD KEY `idx_fecha_venta` (`fecha_venta`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_metodo_pago` (`metodo_pago`),
  ADD KEY `cancelada_por` (`cancelada_por`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `configuracion_app`
--
ALTER TABLE `configuracion_app`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `empleados_turnos`
--
ALTER TABLE `empleados_turnos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tareas_comentarios`
--
ALTER TABLE `tareas_comentarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tareas_historial`
--
ALTER TABLE `tareas_historial`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_solicitudes`
--
ALTER TABLE `tipos_solicitudes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  ADD CONSTRAINT `alertas_inventario_ibfk_1` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alertas_inventario_ibfk_2` FOREIGN KEY (`resuelto_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`validado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_asistencias_empleado` FOREIGN KEY (`empleado_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `empleados_turnos`
--
ALTER TABLE `empleados_turnos`
  ADD CONSTRAINT `empleados_turnos_ibfk_1` FOREIGN KEY (`empleados_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE,
  ADD CONSTRAINT `empleados_turnos_ibfk_2` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`empleado_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`actualizado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `logs_actividad`
--
ALTER TABLE `logs_actividad`
  ADD CONSTRAINT `logs_actividad_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`generado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`tipo_solicitud_id`) REFERENCES `tipos_solicitudes` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `solicitudes_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`asignada_a_rut`) REFERENCES `empleados` (`rut`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`creada_por_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tareas_ibfk_3` FOREIGN KEY (`aprobada_por_rut`) REFERENCES `empleados` (`rut`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `tareas_comentarios`
--
ALTER TABLE `tareas_comentarios`
  ADD CONSTRAINT `tareas_comentarios_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tareas_comentarios_ibfk_2` FOREIGN KEY (`empleado_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tareas_historial`
--
ALTER TABLE `tareas_historial`
  ADD CONSTRAINT `tareas_historial_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tareas_historial_ibfk_2` FOREIGN KEY (`empleado_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD CONSTRAINT `fk_turnos_empleados` FOREIGN KEY (`empleados_rut`) REFERENCES `empleados` (`rut`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`cancelada_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

-- --------------------------------------------------------

--
-- Vista: `vista_ventas_inventario`
--
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

--
-- Volcado de datos para la tabla `inventario`
--

INSERT IGNORE INTO `inventario` (`id`, `codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `imagen_producto`, `notas`, `fecha_creacion`, `fecha_actualizacion`, `creado_por`, `actualizado_por`, `activo`) VALUES
(1, 'CAFE-001', 'Marley Coffee - One Love Organic', 'Café orgánico en grano 340g, tueste medio', 'cafe', 'paquete', 50.00, 15.00, 100.00, 8500.00, 12990.00, 'QR-CAFE-001', '7000000000001', 'Bodega A1', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:47', '2025-10-02 15:07:20', NULL, NULL, 1),
(2, 'CAFE-002', 'Marley Coffee - Smile Jamaica', 'Café Jamaica Blue Mountain en grano 340g', 'cafe', 'paquete', 30.00, 10.00, 80.00, 9200.00, 13990.00, 'QR-CAFE-002', '7000000000002', 'Bodega A1', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:47', '2025-10-02 15:07:20', NULL, NULL, 1),
(3, 'CAFE-003', 'Marley Coffee - Buffalo Soldier', 'Café oscuro intenso en grano 340g', 'cafe', 'paquete', 45.00, 12.00, 90.00, 8800.00, 12990.00, 'QR-CAFE-003', '7000000000003', 'Bodega A1', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:47', '2025-10-02 15:07:20', NULL, NULL, 1),
(4, 'CAFE-004', 'Marley Coffee - Lively Up', 'Café espresso en grano 340g', 'cafe', 'paquete', 40.00, 15.00, 100.00, 8600.00, 12790.00, 'QR-CAFE-004', '7000000000004', 'Bodega A1', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:47', '2025-10-02 15:07:20', NULL, NULL, 1),
(5, 'CAFE-005', 'Marley Coffee - Mystic Morning', 'Café suave descafeinado en grano 340g', 'cafe', 'paquete', 25.00, 8.00, 60.00, 9500.00, 14490.00, 'QR-CAFE-005', '7000000000005', 'Bodega A1', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:47', '2025-10-02 15:07:20', NULL, NULL, 1),
(6, 'CAFE-011', 'Marley Coffee - One Love Molido', 'Café orgánico molido 340g, tueste medio', 'cafe', 'paquete', 60.00, 20.00, 120.00, 8200.00, 12490.00, 'QR-CAFE-011', '7000000000006', 'Bodega A2', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:57', '2025-10-02 15:07:20', NULL, NULL, 1),
(7, 'CAFE-012', 'Marley Coffee - Get Up Stand Up', 'Café molido tueste oscuro 340g', 'cafe', 'paquete', 55.00, 18.00, 110.00, 8400.00, 12690.00, 'QR-CAFE-012', '7000000000007', 'Bodega A2', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:05:57', '2025-10-02 15:07:20', NULL, NULL, 1),
(8, 'CAFE-021', 'Marley Coffee - Cápsulas One Love', 'Cápsulas compatibles Nespresso 10 unid.', 'cafe', 'caja', 80.00, 25.00, 150.00, 4200.00, 6990.00, 'QR-CAFE-021', '7000000000008', 'Bodega A3', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:06', '2025-10-02 15:07:20', NULL, NULL, 1),
(9, 'CAFE-022', 'Marley Coffee - Cápsulas Lively Up', 'Cápsulas compatibles Nespresso 10 unid.', 'cafe', 'caja', 75.00, 25.00, 150.00, 4200.00, 6990.00, 'QR-CAFE-022', '7000000000009', 'Bodega A3', 'Distribuidora Marley Chile', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:06', '2025-10-02 15:07:20', NULL, NULL, 1),
(10, 'MERCH-101', 'Taza Marley Coffee Logo', 'Taza cerámica 350ml con logo Marley', 'otros', 'unidad', 100.00, 20.00, 200.00, 3500.00, 7990.00, 'QR-MERCH-101', '7000000000010', 'Vitrina Principal', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:15', '2025-10-02 15:07:20', NULL, NULL, 1),
(11, 'MERCH-102', 'Taza One Love Edición Especial', 'Taza cerámica premium 400ml', 'otros', 'unidad', 50.00, 15.00, 100.00, 4200.00, 9990.00, 'QR-MERCH-102', '7000000000011', 'Vitrina Principal', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:15', '2025-10-02 15:07:20', NULL, NULL, 1),
(12, 'MERCH-103', 'Mug Térmico Marley', 'Vaso térmico acero inoxidable 500ml', 'otros', 'unidad', 40.00, 10.00, 80.00, 6500.00, 14990.00, 'QR-MERCH-103', '7000000000012', 'Vitrina Principal', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:15', '2025-10-02 15:07:20', NULL, NULL, 1),
(13, 'MERCH-201', 'Polera Marley Coffee - Talla S', 'Polera algodón 100% con estampado', 'otros', 'unidad', 30.00, 8.00, 60.00, 5500.00, 12990.00, 'QR-MERCH-201', '7000000000013', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(14, 'MERCH-202', 'Polera Marley Coffee - Talla M', 'Polera algodón 100% con estampado', 'otros', 'unidad', 40.00, 10.00, 80.00, 5500.00, 12990.00, 'QR-MERCH-202', '7000000000014', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(15, 'MERCH-203', 'Polera Marley Coffee - Talla L', 'Polera algodón 100% con estampado', 'otros', 'unidad', 35.00, 10.00, 70.00, 5500.00, 12990.00, 'QR-MERCH-203', '7000000000015', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(16, 'MERCH-204', 'Polera Marley Coffee - Talla XL', 'Polera algodón 100% con estampado', 'otros', 'unidad', 25.00, 8.00, 50.00, 5500.00, 12990.00, 'QR-MERCH-204', '7000000000016', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(17, 'MERCH-205', 'Gorro Marley Coffee', 'Gorro tejido con logo bordado', 'otros', 'unidad', 45.00, 12.00, 90.00, 4200.00, 9990.00, 'QR-MERCH-205', '7000000000017', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(18, 'MERCH-206', 'Delantal Barista Marley', 'Delantal jean con bolsillos', 'otros', 'unidad', 20.00, 5.00, 40.00, 7800.00, 16990.00, 'QR-MERCH-206', '7000000000018', 'Bodega Merchandising', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:26', '2025-10-02 15:07:20', NULL, NULL, 1),
(19, 'MERCH-301', 'Llavero Marley Coffee', 'Llavero metal con logo grabado', 'otros', 'unidad', 150.00, 30.00, 300.00, 800.00, 2990.00, 'QR-MERCH-301', '7000000000019', 'Mostrador', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:35', '2025-10-02 15:07:20', NULL, NULL, 1),
(20, 'MERCH-302', 'Botella Reutilizable Marley', 'Botella plástico libre BPA 750ml', 'otros', 'unidad', 60.00, 15.00, 120.00, 3200.00, 7990.00, 'QR-MERCH-302', '7000000000020', 'Vitrina Principal', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:35', '2025-10-02 15:07:20', NULL, NULL, 1),
(21, 'MERCH-303', 'Bolsa Tote Marley Coffee', 'Bolsa tela ecológica reutilizable', 'otros', 'unidad', 80.00, 20.00, 150.00, 2500.00, 5990.00, 'QR-MERCH-303', '7000000000021', 'Mostrador', 'Textil Express', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:35', '2025-10-02 15:07:20', NULL, NULL, 1),
(22, 'MERCH-304', 'Sticker Pack Marley', 'Pack 5 stickers adhesivos variados', 'otros', 'paquete', 200.00, 50.00, 400.00, 500.00, 1990.00, 'QR-MERCH-304', '7000000000022', 'Mostrador', 'Imprenta Digital', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:35', '2025-10-02 15:07:20', NULL, NULL, 1),
(23, 'MERCH-305', 'Imán Refrigerador Marley', 'Imán decorativo con diseños Marley', 'otros', 'unidad', 120.00, 30.00, 250.00, 600.00, 1990.00, 'QR-MERCH-305', '7000000000023', 'Mostrador', 'Imprenta Digital', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:35', '2025-10-02 15:07:20', NULL, NULL, 1),
(24, 'MERCH-401', 'Prensa Francesa Marley 1L', 'Cafetera prensa francesa vidrio', 'otros', 'unidad', 15.00, 5.00, 30.00, 12000.00, 24990.00, 'QR-MERCH-401', '7000000000024', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, '', '2025-10-02 15:06:42', '2025-11-06 18:00:17', NULL, NULL, 1),
(25, 'MERCH-402', 'Molinillo Manual Marley', 'Molinillo café manual cerámica', 'equipamiento', 'unidad', 12.00, 4.00, 25.00, 18000.00, 34990.00, 'QR-MERCH-402', '7000000000025', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:42', '2025-10-02 15:07:20', NULL, NULL, 1),
(26, 'MERCH-403', 'Set Barista Marley', 'Kit completo: tamper, jarra, cuchara', 'equipamiento', 'unidad', 10.00, 3.00, 20.00, 22000.00, 44990.00, 'QR-MERCH-403', '7000000000026', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:42', '2025-10-02 15:07:20', NULL, NULL, 1),
(27, 'MWLE63109', 'Poleras Marley Coffee', 'Polera algodón 100% con estampado\n', 'equipamiento', 'unidad', 12.00, 0.00, 9999.00, 9990.00, 12990.00, 'MWLE63109', NULL, 'Vitrina ', NULL, NULL, NULL, NULL, NULL, 'disponible', 0, NULL, 'Polera algodón 100% con estampado\n', '2025-11-06 11:06:53', '2025-11-06 18:01:24', NULL, NULL, 1),
(28, '5391519890707', 'Café Selección ', 'CAFÉ FINA SELECCIÓN ', 'cafe', 'unidad', 20.00, 0.00, 9999.00, 2990.00, 4990.00, '5391519890707', NULL, 'Bodega A', NULL, NULL, NULL, NULL, NULL, 'disponible', 0, NULL, 'CAFÉ FINA SELECCIÓN ', '2025-11-06 14:04:15', '2025-11-06 14:04:15', NULL, NULL, 1);

-- Productos ficticios
--
-- 10 Productos Agotados
--

INSERT IGNORE INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `imagen_producto`, `notas`, `creado_por`, `activo`) VALUES
('AGOT-001', 'Café Tarapacá Premium', 'Café en grano tostado artesanalmente, origen Tarapacá', 'cafe', 'kilogramo', 0.00, 5.00, 50.00, 12000.00, 18990.00, 'QR-AGOT-001', '7000000000101', 'Bodega A1', 'Cafetalera del Norte', '+56987654321', '2024-12-15 10:00:00', NULL, 'LOTE-2024-12', 'agotado', 1, NULL, 'Producto agotado - Reposición pendiente', NULL, 1),
('AGOT-002', 'Leche Condensada La Lechera', 'Leche condensada 397g, ideal para postres y café', 'alimentos', 'unidad', 0.00, 20.00, 200.00, 1200.00, 2490.00, 'QR-AGOT-002', '7000000000102', 'Bodega Refrigerada', 'Distribuidora Lácteos Norte', '+56976543210', '2024-12-10 14:30:00', '2026-12-31', 'LOTE-LEC-2024-12', 'agotado', 1, NULL, 'Stock agotado - Alta demanda', NULL, 1),
('AGOT-003', 'Azúcar Blanca Iansa', 'Azúcar blanca refinada 1kg', 'alimentos', 'kilogramo', 0.00, 10.00, 100.00, 800.00, 1590.00, 'QR-AGOT-003', '7000000000103', 'Bodega Seca', 'Distribuidora Iansa Chile', '+56965432109', '2024-12-05 09:00:00', NULL, 'LOTE-AZU-2024-12', 'agotado', 1, NULL, 'Producto básico agotado', NULL, 1),
('AGOT-004', 'Vasos Desechables 12oz', 'Vasos desechables para café caliente, 12oz, 100 unidades', 'desechables', 'paquete', 0.00, 5.00, 50.00, 3500.00, 5990.00, 'QR-AGOT-004', '7000000000104', 'Bodega Desechables', 'Papelería del Norte', '+56954321098', '2024-11-28 11:00:00', NULL, 'LOTE-VAS-2024-11', 'agotado', 1, NULL, 'Agotado - Pedido urgente', NULL, 1),
('AGOT-005', 'Tazas Cerámicas Personalizadas', 'Tazas cerámicas con logo Monkey Coffee, 350ml', 'otros', 'unidad', 0.00, 15.00, 150.00, 4500.00, 8990.00, 'QR-AGOT-005', '7000000000105', 'Vitrina Principal', 'Cerámica Artesanal Iquique', '+56943210987', '2024-11-20 15:00:00', NULL, 'LOTE-TAZ-2024-11', 'agotado', 1, NULL, 'Producto popular agotado', NULL, 1),
('AGOT-006', 'Café Molido Express', 'Café molido para espresso, 500g', 'cafe', 'kilogramo', 0.00, 8.00, 80.00, 9500.00, 14990.00, 'QR-AGOT-006', '7000000000106', 'Bodega A2', 'Tostaduría del Desierto', '+56932109876', '2024-12-01 08:00:00', NULL, 'LOTE-EXP-2024-12', 'agotado', 1, NULL, 'Alta rotación - Agotado', NULL, 1),
('AGOT-007', 'Canela Molida Premium', 'Canela molida de calidad premium, 100g', 'alimentos', 'gramo', 0.00, 500.00, 5000.00, 2500.00, 4990.00, 'QR-AGOT-007', '7000000000107', 'Bodega Especias', 'Especias del Norte', '+56921098765', '2024-11-25 12:00:00', '2026-11-25', 'LOTE-CAN-2024-11', 'agotado', 1, NULL, 'Producto estacional agotado', NULL, 1),
('AGOT-008', 'Servilletas Personalizadas', 'Servilletas con logo Monkey Coffee, 2 capas, 100 unidades', 'desechables', 'paquete', 0.00, 10.00, 100.00, 2800.00, 4990.00, 'QR-AGOT-008', '7000000000108', 'Bodega Desechables', 'Papelería del Norte', '+56910987654', '2024-11-30 10:00:00', NULL, 'LOTE-SER-2024-11', 'agotado', 1, NULL, 'Stock agotado', NULL, 1),
('AGOT-009', 'Chocolate en Polvo Nestlé', 'Chocolate en polvo para bebidas, 400g', 'alimentos', 'gramo', 0.00, 10.00, 100.00, 3200.00, 5990.00, 'QR-AGOT-009', '7000000000109', 'Bodega Seca', 'Distribuidora Nestlé Chile', '+56909876543', '2024-12-08 13:00:00', '2026-12-08', 'LOTE-CHO-2024-12', 'agotado', 1, NULL, 'Producto agotado', NULL, 1),
('AGOT-010', 'Filtros para Prensa Francesa', 'Filtros metálicos reutilizables para prensa francesa', 'equipamiento', 'unidad', 0.00, 5.00, 50.00, 8500.00, 14990.00, 'QR-AGOT-010', '7000000000110', 'Vitrina Premium', 'Equipos Barista Chile', '+56998765432', '2024-11-15 16:00:00', NULL, 'LOTE-FIL-2024-11', 'agotado', 1, NULL, 'Equipamiento agotado', NULL, 1);

--
-- 10 Productos Por Vencer
--

INSERT IGNORE INTO `inventario` (`codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `imagen_producto`, `notas`, `creado_por`, `activo`) VALUES
('VEN-001', 'Leche Entera Colun', 'Leche entera pasteurizada 1L, vence en 7 días', 'alimentos', 'litro', 45.00, 20.00, 200.00, 850.00, 1290.00, 'QR-VEN-001', '7000000000201', 'Bodega Refrigerada', 'Colun Chile', '+56987654321', '2024-12-10 08:00:00', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'LOTE-LEC-2024-12-10', 'por_vencer', 1, NULL, 'Vence en 7 días - Prioridad alta', NULL, 1),
('VEN-002', 'Yogurt Natural', 'Yogurt natural sin azúcar, 1kg, vence en 5 días', 'alimentos', 'kilogramo', 30.00, 15.00, 150.00, 2200.00, 3990.00, 'QR-VEN-002', '7000000000202', 'Bodega Refrigerada', 'Lácteos del Norte', '+56976543210', '2024-12-08 10:00:00', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'LOTE-YOG-2024-12-08', 'por_vencer', 1, NULL, 'Vence en 5 días - Urgente', NULL, 1),
('VEN-003', 'Mermelada de Fresa', 'Mermelada de fresa artesanal, 250g, vence en 10 días', 'alimentos', 'gramo', 25.00, 10.00, 100.00, 1800.00, 3490.00, 'QR-VEN-003', '7000000000203', 'Bodega Seca', 'Mermeladas Artesanales', '+56965432109', '2024-12-05 11:00:00', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'LOTE-MER-2024-12-05', 'por_vencer', 1, NULL, 'Vence en 10 días', NULL, 1),
('VEN-004', 'Crema para Batir', 'Crema para batir 500ml, vence en 6 días', 'alimentos', 'mililitro', 40.00, 20.00, 200.00, 2800.00, 4990.00, 'QR-VEN-004', '7000000000204', 'Bodega Refrigerada', 'Lácteos Premium', '+56954321098', '2024-12-09 09:00:00', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'LOTE-CRE-2024-12-09', 'por_vencer', 1, NULL, 'Vence en 6 días - Revisar', NULL, 1),
('VEN-005', 'Miel de Abeja Natural', 'Miel de abeja 100% natural, 500g, vence en 15 días', 'alimentos', 'gramo', 35.00, 12.00, 120.00, 4500.00, 7990.00, 'QR-VEN-005', '7000000000205', 'Bodega Seca', 'Apicultura Tarapacá', '+56943210987', '2024-12-01 14:00:00', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'LOTE-MIE-2024-12-01', 'por_vencer', 1, NULL, 'Vence en 15 días', NULL, 1),
('VEN-006', 'Queso Crema', 'Queso crema para bagels y tostadas, 200g, vence en 8 días', 'alimentos', 'gramo', 28.00, 15.00, 150.00, 1800.00, 3490.00, 'QR-VEN-006', '7000000000206', 'Bodega Refrigerada', 'Quesería del Norte', '+56932109876', '2024-12-07 12:00:00', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'LOTE-QUE-2024-12-07', 'por_vencer', 1, NULL, 'Vence en 8 días', NULL, 1),
('VEN-007', 'Mantequilla sin Sal', 'Mantequilla sin sal 250g, vence en 12 días', 'alimentos', 'gramo', 50.00, 20.00, 200.00, 2200.00, 3990.00, 'QR-VEN-007', '7000000000207', 'Bodega Refrigerada', 'Lácteos Premium', '+56921098765', '2024-12-03 10:00:00', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'LOTE-MAN-2024-12-03', 'por_vencer', 1, NULL, 'Vence en 12 días', NULL, 1),
('VEN-008', 'Jugo de Naranja Natural', 'Jugo de naranja 100% natural, 1L, vence en 4 días', 'bebidas', 'litro', 60.00, 25.00, 250.00, 1500.00, 2990.00, 'QR-VEN-008', '7000000000208', 'Bodega Refrigerada', 'Jugos Naturales Chile', '+56910987654', '2024-12-11 08:00:00', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'LOTE-JUG-2024-12-11', 'por_vencer', 1, NULL, 'Vence en 4 días - Muy urgente', NULL, 1),
('VEN-009', 'Pan de Molde Integral', 'Pan de molde integral, 600g, vence en 3 días', 'alimentos', 'gramo', 20.00, 10.00, 100.00, 1800.00, 3290.00, 'QR-VEN-009', '7000000000209', 'Bodega Seca', 'Panadería Artesanal', '+56909876543', '2024-12-12 07:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'LOTE-PAN-2024-12-12', 'por_vencer', 1, NULL, 'Vence en 3 días - Crítico', NULL, 1),
('VEN-010', 'Galletas de Avena', 'Galletas de avena caseras, 300g, vence en 9 días', 'alimentos', 'gramo', 42.00, 18.00, 180.00, 2500.00, 4490.00, 'QR-VEN-010', '7000000000210', 'Bodega Seca', 'Repostería del Norte', '+56998765432', '2024-12-06 13:00:00', DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'LOTE-GAL-2024-12-06', 'por_vencer', 1, NULL, 'Vence en 9 días', NULL, 1);

--
-- Empleados ficticios de Iquique/Alto Hospicio
--

INSERT IGNORE INTO `empleados` (`rut`, `nombres`, `apellidos`, `email`, `telefono`, `password`, `fecha_nacimiento`, `direccion`, `cargo`, `departamento`, `fecha_contratacion`, `salario`, `tipo_contrato`, `estado`, `activo`) VALUES
('18.234.567-8', 'María', 'González Pérez', 'maria.gonzalez@monkeycoffee.cl', '+56912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-05-15', 'Av. Arturo Prat 1234, Iquique', 'Gerente General', 'Administración', '2023-01-15', 850000.00, 'indefinido', 'activo', 1),
('19.345.678-9', 'Carlos', 'Ramírez Silva', 'carlos.ramirez@monkeycoffee.cl', '+56923456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1992-08-22', 'Calle Baquedano 567, Iquique', 'Barista Senior', 'Operaciones', '2023-02-01', 550000.00, 'indefinido', 'activo', 1),
('20.456.789-0', 'Fernanda', 'Torres Morales', 'fernanda.torres@monkeycoffee.cl', '+56934567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1995-11-10', 'Av. Héroes de la Concepción 890, Alto Hospicio', 'Barista', 'Operaciones', '2023-03-10', 450000.00, 'indefinido', 'activo', 1),
('17.567.890-1', 'Diego', 'Vargas Castro', 'diego.vargas@monkeycoffee.cl', '+56945678901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1993-03-28', 'Pasaje Los Carrera 234, Iquique', 'Cajero', 'Ventas', '2023-04-05', 420000.00, 'indefinido', 'activo', 1),
('18.678.901-2', 'Camila', 'Herrera Rojas', 'camila.herrera@monkeycoffee.cl', '+56956789012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1996-07-14', 'Av. La Tirana 1456, Alto Hospicio', 'Barista', 'Operaciones', '2023-05-20', 450000.00, 'indefinido', 'activo', 1),
('19.789.012-3', 'Sebastián', 'Mendoza López', 'sebastian.mendoza@monkeycoffee.cl', '+56967890123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1991-12-05', 'Calle Sargento Aldea 789, Iquique', 'Supervisor de Turno', 'Operaciones', '2023-01-20', 600000.00, 'indefinido', 'activo', 1),
('20.890.123-4', 'Valentina', 'Castro Díaz', 'valentina.castro@monkeycoffee.cl', '+56978901234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1994-09-18', 'Av. Esmeralda 321, Iquique', 'Cajera', 'Ventas', '2023-06-01', 420000.00, 'indefinido', 'activo', 1),
('17.901.234-5', 'Nicolás', 'Jiménez Flores', 'nicolas.jimenez@monkeycoffee.cl', '+56989012345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1997-02-25', 'Calle O''Higgins 654, Alto Hospicio', 'Barista', 'Operaciones', '2023-07-15', 450000.00, 'indefinido', 'activo', 1),
('18.012.345-6', 'Javiera', 'Soto Martínez', 'javiera.soto@monkeycoffee.cl', '+56990123456', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1998-06-30', 'Av. Los Rieles 987, Alto Hospicio', 'Auxiliar de Cocina', 'Operaciones', '2023-08-10', 380000.00, 'indefinido', 'activo', 1),
('19.123.456-7', 'Andrés', 'Contreras Vega', 'andres.contreras@monkeycoffee.cl', '+56901234567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1992-10-12', 'Calle Thompson 456, Iquique', 'Encargado de Inventario', 'Logística', '2023-02-15', 520000.00, 'indefinido', 'activo', 1);

--
-- Turnos para los nuevos empleados
--

INSERT IGNORE INTO `turnos` (`id`, `empleados_rut`, `nombre_turno`, `hora_entrada`, `hora_salida`, `tolerancia_minutos`, `horas_trabajo`, `descripcion`, `dias_semana`, `activo`) VALUES
(2, '18.234.567-8', 'Turno Administrativo', '08:00:00', '17:00:00', 15, 9.00, 'Turno administrativo de lunes a viernes', '[1, 2, 3, 4, 5]', 1),
(3, '19.345.678-9', 'Turno Mañana Barista', '07:00:00', '16:00:00', 15, 9.00, 'Turno mañana para barista senior', '[1, 2, 3, 4, 5, 6]', 1),
(4, '20.456.789-0', 'Turno Tarde', '13:00:00', '22:00:00', 15, 9.00, 'Turno tarde de lunes a domingo', '[1, 2, 3, 4, 5, 6, 7]', 1),
(5, '17.567.890-1', 'Turno Mañana Cajero', '08:00:00', '17:00:00', 15, 9.00, 'Turno mañana para cajero', '[1, 2, 3, 4, 5, 6]', 1),
(6, '18.678.901-2', 'Turno Tarde Barista', '14:00:00', '23:00:00', 15, 9.00, 'Turno tarde para barista', '[1, 2, 3, 4, 5, 6, 7]', 1),
(7, '19.789.012-3', 'Turno Supervisor Mañana', '06:00:00', '15:00:00', 15, 9.00, 'Turno supervisor mañana', '[1, 2, 3, 4, 5, 6]', 1),
(8, '20.890.123-4', 'Turno Mañana Cajera', '08:00:00', '17:00:00', 15, 9.00, 'Turno mañana para cajera', '[1, 2, 3, 4, 5, 6]', 1),
(9, '17.901.234-5', 'Turno Noche', '18:00:00', '02:00:00', 15, 8.00, 'Turno noche de jueves a domingo', '[4, 5, 6, 7]', 1),
(10, '18.012.345-6', 'Turno Auxiliar', '10:00:00', '19:00:00', 15, 9.00, 'Turno auxiliar de cocina', '[1, 2, 3, 4, 5, 6]', 1),
(11, '19.123.456-7', 'Turno Logística', '09:00:00', '18:00:00', 15, 9.00, 'Turno logística e inventario', '[1, 2, 3, 4, 5]', 1);

--
-- Asignación de empleados a turnos
--

INSERT IGNORE INTO `empleados_turnos` (`empleados_rut`, `turno_id`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
('18.234.567-8', 2, '2023-01-15', NULL, 1),
('19.345.678-9', 3, '2023-02-01', NULL, 1),
('20.456.789-0', 4, '2023-03-10', NULL, 1),
('17.567.890-1', 5, '2023-04-05', NULL, 1),
('18.678.901-2', 6, '2023-05-20', NULL, 1),
('19.789.012-3', 7, '2023-01-20', NULL, 1),
('20.890.123-4', 8, '2023-06-01', NULL, 1),
('17.901.234-5', 9, '2023-07-15', NULL, 1),
('18.012.345-6', 10, '2023-08-10', NULL, 1),
('19.123.456-7', 11, '2023-02-15', NULL, 1);

--
-- Horarios para los empleados
--

INSERT IGNORE INTO `horarios` (`empleado_rut`, `turno_id`, `fecha_inicio`, `fecha_fin`, `dias_semana`, `observaciones`, `activo`) VALUES
('18.234.567-8', 2, '2023-01-15', NULL, '[1, 2, 3, 4, 5]', 'Horario administrativo', 1),
('19.345.678-9', 3, '2023-02-01', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario barista senior', 1),
('20.456.789-0', 4, '2023-03-10', NULL, '[1, 2, 3, 4, 5, 6, 7]', 'Horario turno tarde', 1),
('17.567.890-1', 5, '2023-04-05', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario cajero mañana', 1),
('18.678.901-2', 6, '2023-05-20', NULL, '[1, 2, 3, 4, 5, 6, 7]', 'Horario barista tarde', 1),
('19.789.012-3', 7, '2023-01-20', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario supervisor', 1),
('20.890.123-4', 8, '2023-06-01', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario cajera mañana', 1),
('17.901.234-5', 9, '2023-07-15', NULL, '[4, 5, 6, 7]', 'Horario noche fin de semana', 1),
('18.012.345-6', 10, '2023-08-10', NULL, '[1, 2, 3, 4, 5, 6]', 'Horario auxiliar cocina', 1),
('19.123.456-7', 11, '2023-02-15', NULL, '[1, 2, 3, 4, 5]', 'Horario logística', 1);

--
-- Asistencias de ejemplo para los últimos 7 días
--

INSERT IGNORE INTO `asistencias` (`empleado_rut`, `fecha`, `hora_entrada`, `hora_salida`, `tipo_entrada`, `tipo_salida`, `minutos_tarde`, `minutos_extras`, `horas_trabajadas`, `estado`, `observaciones`, `ubicacion_entrada`, `ubicacion_salida`) VALUES
('18.234.567-8', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 08:05:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 17:10:00'), 'biometrico', 'biometrico', 5, 5, 9.08, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.234.567-8', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.234.567-8', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 08:02:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 17:05:00'), 'biometrico', 'biometrico', 2, 3, 9.05, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 07:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 16:05:00'), 'biometrico', 'biometrico', 0, 5, 9.08, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 07:10:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 16:00:00'), 'biometrico', 'biometrico', 10, 0, 8.83, 'tarde', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 07:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 16:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 07:05:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 16:10:00'), 'biometrico', 'biometrico', 5, 5, 9.08, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 07:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 16:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.345.678-9', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 07:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 16:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 13:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 13:05:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 22:05:00'), 'biometrico', 'biometrico', 5, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 13:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 13:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 13:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 13:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 22:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.456.789-0', CURDATE(), CONCAT(CURDATE(), ' 13:00:00'), NULL, 'biometrico', NULL, 0, 0, NULL, 'presente', NULL, 'Monkey Coffee Iquique', NULL),
('17.567.890-1', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.567.890-1', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 08:10:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 10, 0, 8.83, 'tarde', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.567.890-1', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.567.890-1', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.567.890-1', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.567.890-1', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 14:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 23:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.678.901-2', CURDATE(), CONCAT(CURDATE(), ' 14:00:00'), NULL, 'biometrico', NULL, 0, 0, NULL, 'presente', NULL, 'Monkey Coffee Iquique', NULL),
('19.789.012-3', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.789.012-3', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.789.012-3', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.789.012-3', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.789.012-3', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.789.012-3', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 06:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 15:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('20.890.123-4', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.901.234-5', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 18:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 02:00:00'), 'biometrico', 'biometrico', 0, 0, 8.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.901.234-5', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 18:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 02:00:00'), 'biometrico', 'biometrico', 0, 0, 8.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('17.901.234-5', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 18:00:00'), CONCAT(CURDATE(), ' 02:00:00'), 'biometrico', 'biometrico', 0, 0, 8.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 6 DAY, CONCAT(CURDATE() - INTERVAL 6 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 6 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('18.012.345-6', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 10:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 19:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.123.456-7', CURDATE() - INTERVAL 5 DAY, CONCAT(CURDATE() - INTERVAL 5 DAY, ' 09:00:00'), CONCAT(CURDATE() - INTERVAL 5 DAY, ' 18:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.123.456-7', CURDATE() - INTERVAL 4 DAY, CONCAT(CURDATE() - INTERVAL 4 DAY, ' 09:00:00'), CONCAT(CURDATE() - INTERVAL 4 DAY, ' 18:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.123.456-7', CURDATE() - INTERVAL 3 DAY, CONCAT(CURDATE() - INTERVAL 3 DAY, ' 09:00:00'), CONCAT(CURDATE() - INTERVAL 3 DAY, ' 18:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.123.456-7', CURDATE() - INTERVAL 2 DAY, CONCAT(CURDATE() - INTERVAL 2 DAY, ' 09:00:00'), CONCAT(CURDATE() - INTERVAL 2 DAY, ' 18:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique'),
('19.123.456-7', CURDATE() - INTERVAL 1 DAY, CONCAT(CURDATE() - INTERVAL 1 DAY, ' 09:00:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 18:00:00'), 'biometrico', 'biometrico', 0, 0, 9.00, 'presente', NULL, 'Monkey Coffee Iquique', 'Monkey Coffee Iquique');

COMMIT;

SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;
