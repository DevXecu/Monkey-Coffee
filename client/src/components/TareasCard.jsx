import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";
import { tareasAPI } from "../api/tareas.api";

export function TareasCard({ tarea, onUpdate }) {
  const navigate = useNavigate();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800";
      case "en_proceso":
        return "bg-blue-100 text-blue-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "pausada":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "critica":
        return "bg-red-100 text-red-800";
      case "alta":
        return "bg-orange-100 text-orange-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-200"
      onClick={() => {
        navigate(`/tareas/${tarea.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tarea.titulo}
              </h3>
              {tarea.asignada_a_nombre && (
                <p className="text-sm text-gray-500">
                  Asignada a: {tarea.asignada_a_nombre}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(tarea.estado)}`}>
              {tarea.estado}
            </span>
            
            {tarea.prioridad && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                {tarea.prioridad}
              </span>
            )}

            {tarea.tipo_tarea && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {tarea.tipo_tarea}
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {tarea.fecha_vencimiento && (
              <p>
                📅 Vence: {formatDate(tarea.fecha_vencimiento)}
              </p>
            )}
            
            {tarea.fecha_completada && (
              <p className="text-green-600">
                ✅ Completada: {formatDate(tarea.fecha_completada)}
              </p>
            )}

            {tarea.porcentaje_completado !== null && tarea.porcentaje_completado !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progreso</span>
                  <span>{tarea.porcentaje_completado}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${tarea.porcentaje_completado}%` }}
                  ></div>
                </div>
              </div>
            )}

            {tarea.tiempo_estimado_minutos && (
              <p className="text-xs text-gray-500">
                ⏱️ Estimado: {tarea.tiempo_estimado_minutos} min
              </p>
            )}
          </div>

          {tarea.descripcion && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              📝 {tarea.descripcion}
            </p>
          )}
        </div>
        
        <div className="ml-4 flex flex-col items-end">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

