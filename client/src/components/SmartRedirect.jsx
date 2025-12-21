import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

/**
 * Componente que redirige a la primera página permitida según el rol del usuario
 */
export const SmartRedirect = () => {
  const { hasPermission, rol } = usePermissions();

  // Orden de prioridad de rutas según el rol
  let routes = [];
  
  if (rol === "gerente") {
    // Gerente puede ver todo, prioridad: dashboard primero
    routes = [
      "/dashboard",
      "/inventario",
      "/empleado",
      "/turnos",
      "/asistencia",
      "/proveedores",
      "/ordenes-compra",
      "/solicitudes",
    ];
  } else if (rol === "administrador") {
    // Administrador: inventario, empleado, turnos, etc. (sin dashboard)
    routes = [
      "/inventario",
      "/empleado",
      "/turnos",
      "/asistencia",
      "/proveedores",
      "/ordenes-compra",
      "/solicitudes",
    ];
  } else {
    // Empleado: solo sus páginas permitidas
    routes = [
      "/inventario",
      "/asistencia",
      "/solicitudes",
      "/turnos",
    ];
  }

  // Encontrar la primera ruta permitida
  const allowedRoute = routes.find((route) => hasPermission(route));

  // Si no hay ninguna ruta permitida, redirigir a inventario como fallback
  return <Navigate to={allowedRoute || "/inventario"} replace />;
};

