import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

const turnoApi = axios.create({
  baseURL: `${URL}/api/turno`,
});

// Interceptor para agregar información del empleado en los headers
turnoApi.interceptors.request.use(
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
          config.headers['X-Empleado-Rol'] = empleadoData.rol;
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

turnoApi.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export const getAllTurnos = (params = {}) => {
  // Filtrar parámetros vacíos
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryParams = new URLSearchParams(cleanParams).toString();
  // Django REST Framework espera que las rutas terminen con /
  return turnoApi.get(`/${queryParams ? `?${queryParams}` : ''}`);
};

export const getTurno = (id) => turnoApi.get(`/${id}/`);

export const createTurno = (turno) => turnoApi.post(`/`, turno);

export const updateTurno = (id, turno) => turnoApi.patch(`/${id}/`, turno);

export const deleteTurno = (id) => turnoApi.delete(`/${id}/`);

