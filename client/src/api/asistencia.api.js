import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log("Backend URL:", URL);
const asistenciaApi = axios.create({
  baseURL: `${URL}/api/asistencia`,
});

// Interceptor para agregar información del empleado en los headers
asistenciaApi.interceptors.request.use(
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

asistenciaApi.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export const getAllAsistencia = (params = {}) => {
  // Filtrar parámetros vacíos
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  // Django REST Framework espera que las rutas terminen con /
  return asistenciaApi.get(`/${queryString ? `?${queryString}` : ''}`);
};

export const getAsistencia = (id) => asistenciaApi.get(`/${id}/`);

export const createAsistencia = (asistencia) => asistenciaApi.post("/", asistencia);

export const updateAsistencia = (id, asistencia) => asistenciaApi.patch(`/${id}/`, asistencia);

export const deleteAsistencia = (id) => asistenciaApi.delete(`/${id}/`);

export const getEstadisticasAsistencia = (fecha = null) => {
  const params = fecha ? { fecha } : {};
  const queryString = new URLSearchParams(params).toString();
  // El endpoint está en /api/asistencia/estadisticas/ 
  // Usamos axios directamente con la URL completa
  const url = `${URL}/api/asistencia/estadisticas/${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

