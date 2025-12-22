import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log("Backend URL:", URL);
const empleadoApi = axios.create({
  baseURL: `${URL}/api/empleado`,
});

// Interceptor para agregar información del empleado en los headers
empleadoApi.interceptors.request.use(
  (config) => {
    // Obtener información del empleado desde localStorage
    const empleado = localStorage.getItem("empleado");
    if (empleado) {
      try {
        const empleadoData = JSON.parse(empleado);
        // Agregar RUT y rol del empleado en los headers
        // Normalizar el RUT (quitar puntos y guiones) para que coincida con la comparación del backend
        if (empleadoData.rut) {
          const rutNormalizado = empleadoData.rut.replace(/[^0-9kK]/g, '').toUpperCase();
          config.headers['X-Empleado-Rut'] = rutNormalizado;
        }
        if (empleadoData.rol) {
          // Normalizar el rol a minúsculas para consistencia con el backend
          const rolNormalizado = empleadoData.rol.toLowerCase().trim();
          config.headers['X-Empleado-Rol'] = rolNormalizado;
        }
      } catch (error) {
        console.error("Error parsing empleado from localStorage:", error);
      }
    }
    console.log("Making request to:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

empleadoApi.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export const getAllEmpleado = () => empleadoApi.get("/");

export const getEmpleado = (id) => empleadoApi.get(`/${id}/`);

export const createEmpleado = (empleado) => empleadoApi.post("/", empleado);

export const updateEmpleado = (id, empleado) => empleadoApi.patch(`/${id}/`, empleado);

export const deleteEmpleado = (id) => empleadoApi.delete(`/${id}/`);
