import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

/**
 * Componente que redirige a la primera página permitida según el rol del usuario
 */
export const SmartRedirect = () => {
  const { hasPermission } = usePermissions();

  // Orden de prioridad de rutas a intentar
  const routes = [
    "/dashboard",
    "/inventario",
    "/empleado",
    "/turnos",
    "/asistencia",
    "/proveedores",
    "/ordenes-compra",
    "/solicitudes",
  ];

  // Encontrar la primera ruta permitida
  const allowedRoute = routes.find((route) => hasPermission(route));

  // Si no hay ninguna ruta permitida, redirigir a inventario como fallback
  return <Navigate to={allowedRoute || "/inventario"} replace />;
};

