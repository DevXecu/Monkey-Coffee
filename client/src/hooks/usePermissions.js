import { useAuth } from "../contexts/AuthContext";

/**
 * Hook para verificar permisos basados en el rol del empleado
 */
export const usePermissions = () => {
  const { empleado } = useAuth();
  const rol = empleado?.rol || "empleado";

  /**
   * Verifica si el usuario tiene permiso para acceder a una ruta específica
   * @param {string} route - La ruta a verificar (ej: '/dashboard', '/reportes')
   * @returns {boolean} - true si tiene permiso, false si no
   */
  const hasPermission = (route) => {
    // Gerente tiene acceso a todo
    if (rol === "gerente") {
      return true;
    }

    // Administrador puede ver: empleados, turnos, asistencias, inventario, proveedores, ordenes de compra, solicitudes
    if (rol === "administrador") {
      const allowedRoutes = [
        "/empleado",
        "/turnos",
        "/asistencia",
        "/inventario",
        "/proveedores",
        "/ordenes-compra",
        "/solicitudes",
        "/profile",
        "/configuracion",
      ];
      // También permitir rutas de creación y edición de estas páginas
      return (
        allowedRoutes.includes(route) ||
        route.startsWith("/empleado") ||
        route.startsWith("/turnos") ||
        route.startsWith("/asistencia") ||
        route.startsWith("/inventario") ||
        route.startsWith("/proveedores") ||
        route.startsWith("/ordenes-compra") ||
        route.startsWith("/solicitudes") ||
        route.startsWith("/profile") ||
        route.startsWith("/configuracion")
      );
    }

    // Empleado solo puede ver: su asistencia, el inventario, sus solicitudes y su turno
    if (rol === "empleado") {
      const allowedRoutes = [
        "/asistencia",
        "/inventario",
        "/solicitudes",
        "/turnos",
        "/profile",
      ];
      // También permitir rutas de creación y edición de estas páginas
      return (
        allowedRoutes.includes(route) ||
        route.startsWith("/asistencia") ||
        route.startsWith("/inventario") ||
        route.startsWith("/solicitudes") ||
        route.startsWith("/turnos") ||
        route.startsWith("/profile")
      );
    }

    // Por defecto, no tiene acceso
    return false;
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - El rol a verificar
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return rol === role;
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles a verificar
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    return roles.includes(rol);
  };

  return {
    rol,
    hasPermission,
    hasRole,
    hasAnyRole,
  };
};

