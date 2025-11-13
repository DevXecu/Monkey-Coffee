import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, getCurrentEmpleado } from "../api/auth.api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un empleado guardado al cargar la app
    const empleadoGuardado = getCurrentEmpleado();
    if (empleadoGuardado) {
      setEmpleado(empleadoGuardado);
    }
    setLoading(false);
  }, []);

  const login = async (rut, password) => {
    try {
      const response = await loginApi(rut, password);
      if (response.empleado) {
        localStorage.setItem("empleado", JSON.stringify(response.empleado));
        setEmpleado(response.empleado);
        return { success: true };
      }
      return { success: false, error: response.error || "Error al iniciar sesión" };
    } catch (error) {
      return {
        success: false,
        error: error.error || "Error al iniciar sesión. Verifica tus credenciales.",
      };
    }
  };

  const logout = () => {
    logoutApi();
    setEmpleado(null);
  };

  const value = {
    empleado,
    login,
    logout,
    isAuthenticated: !!empleado,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

