import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

export const RoleProtectedRoute = ({ children, requiredRoute }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, rol } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const route = requiredRoute || location.pathname;
      if (!hasPermission(route)) {
        // Redirigir a la primera página permitida según el rol
        let routes = [];
        
        if (rol === "gerente") {
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
          routes = [
            "/inventario",
            "/asistencia",
            "/solicitudes",
            "/turnos",
          ];
        }
        
        const allowedRoute = routes.find((route) => hasPermission(route)) || "/inventario";
        navigate(allowedRoute, { replace: true });
      }
    }
  }, [loading, isAuthenticated, requiredRoute, location.pathname, hasPermission, navigate, rol]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const route = requiredRoute || location.pathname;
  if (!hasPermission(route)) {
    // Mientras redirige, mostrar loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return children;
};

