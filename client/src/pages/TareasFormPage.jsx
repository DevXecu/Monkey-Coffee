import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { tareasAPI } from "../api/tareas.api";
import { toast } from "react-hot-toast";

export function TareasFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  const tiposTarea = [
    { value: "general", label: "General" },
    { value: "inventario", label: "Inventario" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "limpieza", label: "Limpieza" },
    { value: "atencion_cliente", label: "Atención Cliente" },
    { value: "administrativa", label: "Administrativa" },
    { value: "urgente", label: "Urgente" }
  ];

  const prioridades = [
    { value: "baja", label: "Baja" },
    { value: "media", label: "Media" },
    { value: "alta", label: "Alta" },
    { value: "critica", label: "Crítica" }
  ];

  const estados = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_proceso", label: "En Proceso" },
    { value: "completada", label: "Completada" },
    { value: "cancelada", label: "Cancelada" },
    { value: "pausada", label: "Pausada" }
  ];

  useEffect(() => {
    loadEmpleados();
    if (params.id) {
      loadTarea();
    }
  }, [params.id]);

  const loadEmpleados = async () => {
    try {
      const res = await getAllEmpleado();
      setEmpleados(res.data);
    } catch (error) {
      console.error("Error loading empleados:", error);
    }
  };

  const loadTarea = async () => {
    try {
      const data = await tareasAPI.getById(params.id);
      setValue("titulo", data.titulo);
      setValue("descripcion", data.descripcion || "");
      setValue("tipo_tarea", data.tipo_tarea);
      setValue("prioridad", data.prioridad);
      setValue("estado", data.estado);
      setValue("asignada_a_rut", data.asignada_a_rut || "");
      setValue("fecha_vencimiento", data.fecha_vencimiento ? data.fecha_vencimiento.slice(0, 16) : "");
      setValue("tiempo_estimado_minutos", data.tiempo_estimado_minutos || "");
      setValue("porcentaje_completado", data.porcentaje_completado || 0);
      setValue("ubicacion", data.ubicacion || "");
      setValue("notas", data.notas || "");
    } catch (error) {
      console.error("Error loading tarea:", error);
      toast.error("Error al cargar la tarea");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const formData = {
        ...data,
        asignada_a_rut: data.asignada_a_rut || null,
        tiempo_estimado_minutos: data.tiempo_estimado_minutos ? parseInt(data.tiempo_estimado_minutos) : null,
        porcentaje_completado: data.porcentaje_completado ? parseInt(data.porcentaje_completado) : 0,
        ubicacion: data.ubicacion || null,
        notas: data.notas || null,
      };

      // Obtener el RUT del empleado actual (en producción esto vendría del contexto de autenticación)
      // Por ahora, usamos el primer empleado como creador por defecto
      if (!formData.creada_por_rut && empleados.length > 0) {
        formData.creada_por_rut = empleados[0].rut;
      }

      if (params.id) {
        await tareasAPI.update(params.id, formData);
        toast.success("Tarea actualizada correctamente");
      } else {
        await tareasAPI.create(formData);
        toast.success("Tarea creada correctamente");
      }
      navigate("/tareas");
    } catch (error) {
      console.error("Error saving tarea:", error);
      toast.error("Error al guardar la tarea");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Editar Tarea' : 'Nueva Tarea'}
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          {params.id ? 'Modifica la información de la tarea' : 'Crea una nueva tarea para asignar'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-lg border border-gray-200 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información Básica
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              placeholder="Título de la tarea"
              {...register("titulo", { required: "El título es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              rows={4}
              placeholder="Descripción detallada de la tarea..."
              {...register("descripcion")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Tarea *
            </label>
            <select
              {...register("tipo_tarea", { required: "El tipo de tarea es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.tipo_tarea ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un tipo</option>
              {tiposTarea.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo_tarea && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_tarea.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad *
            </label>
            <select
              {...register("prioridad", { required: "La prioridad es requerida" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.prioridad ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una prioridad</option>
              {prioridades.map((prioridad) => (
                <option key={prioridad.value} value={prioridad.value}>
                  {prioridad.label}
                </option>
              ))}
            </select>
            {errors.prioridad && (
              <p className="mt-1 text-sm text-red-600">{errors.prioridad.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              {...register("estado", { required: "El estado es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.estado ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignada a
            </label>
            <select
              {...register("asignada_a_rut")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sin asignar</option>
              {empleados.map((emp) => (
                <option key={emp.rut} value={emp.rut}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              type="datetime-local"
              {...register("fecha_vencimiento")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo Estimado (minutos)
            </label>
            <input
              type="number"
              step="1"
              placeholder="60"
              {...register("tiempo_estimado_minutos", { min: 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje Completado
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              defaultValue={0}
              {...register("porcentaje_completado", { min: 0, max: 100 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Ubicación donde se realizará la tarea"
              {...register("ubicacion")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              rows={3}
              placeholder="Notas adicionales sobre la tarea..."
              {...register("notas")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/tareas")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {params.id ? 'Actualizar' : 'Crear'} Tarea
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

