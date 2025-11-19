import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";
import { solicitudesAPI } from "../api/solicitudes.api";

export function SolicitudesCard({ solicitud, onUpdate }) {
  const navigate = useNavigate();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "aprobada":
        return "bg-green-100 text-green-800";
      case "rechazada":
        return "bg-red-100 text-red-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-gray-100 text-gray-800";
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
        navigate(`/solicitudes/${solicitud.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {solicitud.tipo_solicitud_nombre || "Solicitud"}
              </h3>
              <p className="text-sm text-gray-500">
                {solicitud.empleado_nombre} {solicitud.empleado_apellido}
              </p>
              {solicitud.empleado_rut && (
                <p className="text-xs text-gray-400">
                  RUT: {formatearRUTParaMostrar(solicitud.empleado_rut)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
              {solicitud.estado}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p>
              📅 Desde: {formatDate(solicitud.fecha_inicio)}
            </p>
            <p>
              📅 Hasta: {formatDate(solicitud.fecha_fin)}
            </p>
            
            {solicitud.fecha_aprobacion && (
              <p className="text-xs text-green-600">
                ✅ Aprobada: {formatDate(solicitud.fecha_aprobacion)}
              </p>
            )}

            {solicitud.aprobado_por_nombre && (
              <p className="text-xs text-gray-500">
                👤 Aprobado por: {solicitud.aprobado_por_nombre}
              </p>
            )}
          </div>

          {solicitud.motivo && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              📝 {solicitud.motivo}
            </p>
          )}

          {solicitud.comentario_aprobacion && (
            <p className="text-xs text-blue-600 mt-2">
              💬 {solicitud.comentario_aprobacion}
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

