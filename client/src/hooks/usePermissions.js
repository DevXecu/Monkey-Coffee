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

    // Administrador no puede acceder a dashboard y reportes
    if (rol === "administrador") {
      const restrictedRoutes = ["/dashboard", "/reportes"];
      return !restrictedRoutes.includes(route);
    }

    // Empleado por defecto no tiene acceso a rutas administrativas
    // Puedes agregar más restricciones aquí si es necesario
    const adminRoutes = [
      "/dashboard",
      "/reportes",
      "/empleado",
      "/configuracion",
    ];
    
    return !adminRoutes.includes(route);
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

