import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log(URL);
const empleadoApi = axios.create({
  baseURL: `${URL}/empleado/api/v1/empleado`,
});

export const getAllEmpleado = () => empleadoApi.get("/");

export const getEmpleado = (id) => empleadoApi.get(`/${id}`);

export const createEmpleado = (empleado) => empleadoApi.post("/", empleado);

export const updateEmpleado = (id, empleado) => empleadoApi.put(`/${id}/`, empleado);

export const deleteEmpleado = (id) => empleadoApi.delete(`/${id}`);
