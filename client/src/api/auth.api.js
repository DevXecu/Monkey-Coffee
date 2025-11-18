import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

const authApi = axios.create({
  baseURL: `${URL}/api`,
});

// Interceptor para agregar token si existe
authApi.interceptors.request.use(
  (config) => {
    const empleado = localStorage.getItem("empleado");
    if (empleado) {
      try {
        const empleadoData = JSON.parse(empleado);
        // Si en el futuro se usa token, se puede agregar aquí
        // config.headers.Authorization = `Bearer ${empleadoData.token}`;
      } catch (error) {
        console.error("Error parsing empleado from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (rut, password) => {
  try {
    // Limpiar el RUT de puntos y guiones antes de enviarlo
    const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    const response = await authApi.post("/auth/login/", {
      rut: rutLimpio,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Error al iniciar sesión" };
  }
};

export const logout = () => {
  localStorage.removeItem("empleado");
};

export const getCurrentEmpleado = () => {
  const empleado = localStorage.getItem("empleado");
  if (empleado) {
    try {
      return JSON.parse(empleado);
    } catch (error) {
      console.error("Error parsing empleado from localStorage:", error);
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("empleado");
};

