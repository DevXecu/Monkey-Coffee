import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log("Backend URL:", URL);
const empleadoApi = axios.create({
  baseURL: `${URL}/empleado/api/v1/empleado`,
});

// Interceptor para debugging
empleadoApi.interceptors.request.use(
  (config) => {
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

export const getEmpleado = (id) => empleadoApi.get(`/${id}`);

export const createEmpleado = (empleado) => empleadoApi.post("/", empleado);

export const updateEmpleado = (id, empleado) => empleadoApi.put(`/${id}/`, empleado);

export const deleteEmpleado = (id) => empleadoApi.delete(`/${id}`);
