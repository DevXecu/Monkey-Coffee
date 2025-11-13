import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

const asistenciaApi = axios.create({
  baseURL: `${URL}/api/asistencia`,
});

// Interceptor para debugging
asistenciaApi.interceptors.request.use(
  (config) => {
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

export const getAllAsistencias = (params = {}) => {
  // Filtrar parámetros vacíos
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  );
  const queryParams = new URLSearchParams(cleanParams).toString();
  return asistenciaApi.get(`/${queryParams ? `?${queryParams}` : ''}`);
};

export const getAsistencia = (id) => asistenciaApi.get(`/${id}/`);

export const createAsistencia = (asistencia) => asistenciaApi.post("/", asistencia);

export const updateAsistencia = (id, asistencia) => asistenciaApi.patch(`/${id}/`, asistencia);

export const deleteAsistencia = (id) => asistenciaApi.delete(`/${id}/`);

export const getEstadisticasAsistencia = (fecha = null) => {
  const params = fecha ? `?fecha=${fecha}` : '';
  return axios.get(`${URL}/api/asistencia/estadisticas${params}`);
};

