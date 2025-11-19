import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { solicitudesAPI } from "../api/solicitudes.api";
import { toast } from "react-hot-toast";

export function SolicitudesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [empleados, setEmpleados] = useState([]);
  const [tiposSolicitud, setTiposSolicitud] = useState([]);
  const [loading, setLoading] = useState(false);

  const estados = [
    { value: "pendiente", label: "Pendiente" },
    { value: "aprobada", label: "Aprobada" },
    { value: "rechazada", label: "Rechazada" },
    { value: "cancelada", label: "Cancelada" }
  ];

  useEffect(() => {
    loadEmpleados();
    loadTiposSolicitudes();
    if (params.id) {
      loadSolicitud();
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

  const loadTiposSolicitudes = async () => {
    try {
      const tipos = await solicitudesAPI.getTiposSolicitudes();
      setTiposSolicitud(tipos);
    } catch (error) {
      console.error("Error loading tipos solicitudes:", error);
    }
  };

  const loadSolicitud = async () => {
    try {
      const data = await solicitudesAPI.getById(params.id);
      setValue("empleado_id", data.empleado_id);
      setValue("tipo_solicitud_id", data.tipo_solicitud_id);
      setValue("fecha_inicio", data.fecha_inicio);
      setValue("fecha_fin", data.fecha_fin);
      setValue("motivo", data.motivo);
      setValue("estado", data.estado);
      setValue("comentario_aprobacion", data.comentario_aprobacion || "");
    } catch (error) {
      console.error("Error loading solicitud:", error);
      toast.error("Error al cargar la solicitud");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const formData = {
        ...data,
        empleado_id: parseInt(data.empleado_id),
        tipo_solicitud_id: parseInt(data.tipo_solicitud_id),
      };

      if (params.id) {
        await solicitudesAPI.update(params.id, formData);
        toast.success("Solicitud actualizada correctamente");
      } else {
        await solicitudesAPI.create(formData);
        toast.success("Solicitud creada correctamente");
      }
      navigate("/solicitudes");
    } catch (error) {
      console.error("Error saving solicitud:", error);
      toast.error("Error al guardar la solicitud");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Editar Solicitud' : 'Nueva Solicitud'}
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          {params.id ? 'Modifica la información de la solicitud' : 'Crea una nueva solicitud de empleado'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              {...register("empleado_id", { required: "El empleado es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.empleado_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
            {errors.empleado_id && (
              <p className="mt-1 text-sm text-red-600">{errors.empleado_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Solicitud *
            </label>
            <select
              {...register("tipo_solicitud_id", { required: "El tipo de solicitud es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.tipo_solicitud_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un tipo</option>
              {tiposSolicitud.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo_solicitud_id && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_solicitud_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio *
            </label>
            <input
              type="date"
              {...register("fecha_inicio", { required: "La fecha de inicio es requerida" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha_inicio ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin *
            </label>
            <input
              type="date"
              {...register("fecha_fin", { required: "La fecha de fin es requerida" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha_fin ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_fin.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <textarea
              rows={4}
              placeholder="Describe el motivo de la solicitud..."
              {...register("motivo", { required: "El motivo es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.motivo ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.motivo && (
              <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>
            )}
          </div>

          {params.id && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  {...register("estado")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario de Aprobación
                </label>
                <textarea
                  rows={3}
                  placeholder="Comentarios sobre la aprobación o rechazo..."
                  {...register("comentario_aprobacion")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/solicitudes")}
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
                {params.id ? 'Actualizar' : 'Crear'} Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

