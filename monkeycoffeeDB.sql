-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 27-10-2025 a las 12:40:37
-- Versión del servidor: 8.0.37
-- Versión de PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `monkeycoffee`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_inventario`
--

CREATE TABLE `alertas_inventario` (
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

CREATE TABLE `asistencias` (
  `id` int NOT NULL,
  `empleado_id` int NOT NULL,
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
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

CREATE TABLE `detalle_ventas` (
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

CREATE TABLE `empleados` (
  `id` int NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `cargo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_contratacion` date NOT NULL,
  `fecha_termino` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `tipo_contrato` enum('indefinido','plazo_fijo','honorarios','part_time') COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('activo','inactivo','vacaciones','licencia','desvinculado') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `huella_digital` blob,
  `foto_perfil` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int NOT NULL,
  `empleado_id` int NOT NULL,
  `turno_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `dias_semana` json DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
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

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `codigo_producto`, `nombre_producto`, `descripcion`, `categoria`, `unidad_medida`, `cantidad_actual`, `cantidad_minima`, `cantidad_maxima`, `precio_unitario`, `precio_venta`, `codigo_qr`, `codigo_barra`, `ubicacion`, `proveedor`, `contacto_proveedor`, `fecha_ultimo_ingreso`, `fecha_vencimiento`, `lote`, `estado`, `requiere_alerta`, `imagen_producto`, `notas`, `fecha_creacion`, `fecha_actualizacion`, `creado_por`, `actualizado_por`, `activo`) VALUES
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
(24, 'MERCH-401', 'Prensa Francesa Marley 1L', 'Cafetera prensa francesa vidrio', 'equipamiento', 'unidad', 15.00, 5.00, 30.00, 12000.00, 24990.00, 'QR-MERCH-401', '7000000000024', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:42', '2025-10-02 15:07:20', NULL, NULL, 1),
(25, 'MERCH-402', 'Molinillo Manual Marley', 'Molinillo café manual cerámica', 'equipamiento', 'unidad', 12.00, 4.00, 25.00, 18000.00, 34990.00, 'QR-MERCH-402', '7000000000025', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:42', '2025-10-02 15:07:20', NULL, NULL, 1),
(26, 'MERCH-403', 'Set Barista Marley', 'Kit completo: tamper, jarra, cuchara', 'equipamiento', 'unidad', 10.00, 3.00, 20.00, 22000.00, 44990.00, 'QR-MERCH-403', '7000000000026', 'Vitrina Premium', 'Importadora Nacional', NULL, NULL, NULL, NULL, 'disponible', 0, NULL, NULL, '2025-10-02 15:06:42', '2025-10-02 15:07:20', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_actividad`
--

CREATE TABLE `logs_actividad` (
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

CREATE TABLE `movimientos_inventario` (
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

CREATE TABLE `notificaciones` (
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

CREATE TABLE `reportes` (
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

CREATE TABLE `solicitudes` (
  `id` int NOT NULL,
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
-- Estructura de tabla para la tabla `tipos_solicitudes`
--

CREATE TABLE `tipos_solicitudes` (
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

CREATE TABLE `turnos` (
  `id` int NOT NULL,
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
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
-- Estructura Stand-in para la vista `vista_ventas_inventario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_ventas_inventario` (
`alerta_stock` varchar(10)
,`cantidad_vendida` decimal(10,2)
,`categoria` enum('cafe','insumos','equipamiento','desechables','alimentos','bebidas','limpieza','otros')
,`codigo_producto` varchar(50)
,`detalle_id` int
,`estado_producto` enum('disponible','agotado','por_vencer','vencido','en_pedido','descontinuado')
,`estado_venta` enum('completada','cancelada','pendiente','reembolsada')
,`fecha_venta` datetime
,`nombre_producto` varchar(100)
,`numero_venta` varchar(50)
,`precio_unitario` decimal(10,2)
,`stock_actual` decimal(10,2)
,`stock_minimo` decimal(10,2)
,`total_item` decimal(10,2)
,`total_venta` decimal(10,2)
,`vendedor_apellido` varchar(100)
,`vendedor_nombre` varchar(100)
,`venta_id` int
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_ventas_inventario`
--
DROP TABLE IF EXISTS `vista_ventas_inventario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_ventas_inventario`  AS SELECT `v`.`id` AS `venta_id`, `v`.`numero_venta` AS `numero_venta`, `v`.`fecha_venta` AS `fecha_venta`, `v`.`total` AS `total_venta`, `v`.`estado` AS `estado_venta`, `dv`.`id` AS `detalle_id`, `i`.`codigo_producto` AS `codigo_producto`, `i`.`nombre_producto` AS `nombre_producto`, `i`.`categoria` AS `categoria`, `dv`.`cantidad` AS `cantidad_vendida`, `dv`.`precio_unitario` AS `precio_unitario`, `dv`.`total_item` AS `total_item`, `i`.`cantidad_actual` AS `stock_actual`, `i`.`cantidad_minima` AS `stock_minimo`, `i`.`estado` AS `estado_producto`, (case when (`i`.`cantidad_actual` = 0) then 'SIN STOCK' when (`i`.`cantidad_actual` <= `i`.`cantidad_minima`) then 'STOCK BAJO' else 'STOCK OK' end) AS `alerta_stock`, `e`.`nombres` AS `vendedor_nombre`, `e`.`apellidos` AS `vendedor_apellido` FROM (((`ventas` `v` join `detalle_ventas` `dv` on((`v`.`id` = `dv`.`venta_id`))) join `inventario` `i` on((`dv`.`inventario_id` = `i`.`id`))) join `empleados` `e` on((`v`.`empleado_id` = `e`.`id`))) WHERE (`v`.`estado` = 'completada') ORDER BY `v`.`fecha_venta` DESC ;

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
  ADD UNIQUE KEY `unique_empleado_fecha` (`empleado_id`,`fecha`),
  ADD KEY `idx_empleado_fecha` (`empleado_id`,`fecha`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `validado_por` (`validado_por`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD KEY `idx_clave` (`clave`),
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
  ADD KEY `idx_rut` (`rut`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_cargo` (`cargo`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleado_id` (`empleado_id`),
  ADD KEY `idx_turno_id` (`turno_id`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_producto` (`codigo_producto`),
  ADD KEY `idx_codigo_producto` (`codigo_producto`),
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
  ADD KEY `idx_nombre_turno` (`nombre_turno`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_venta` (`numero_venta`),
  ADD KEY `idx_numero_venta` (`numero_venta`),
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
-- AUTO_INCREMENT de la tabla `tipos_solicitudes`
--
ALTER TABLE `tipos_solicitudes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`validado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
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
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`cancelada_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
