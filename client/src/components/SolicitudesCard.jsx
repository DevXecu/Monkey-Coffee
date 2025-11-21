import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function SolicitudesCard({ solicitud, onUpdate }) {
  const navigate = useNavigate();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "aprobada":
        return "bg-green-100 text-green-800 border-green-200";
      case "rechazada":
        return "bg-red-100 text-red-800 border-red-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelada":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calcular días solicitados
  const calcularDias = () => {
    if (!solicitud.fecha_inicio || !solicitud.fecha_fin) return null;
    try {
      const inicio = new Date(solicitud.fecha_inicio);
      const fin = new Date(solicitud.fecha_fin);
      const diffTime = Math.abs(fin - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch (e) {
      return null;
    }
  };

  const diasSolicitados = calcularDias();

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-lg hover:border-primary-300 cursor-pointer transition-all duration-200 group"
      onClick={() => {
        navigate(`/solicitudes/${solicitud.id}`);
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Header con tipo de solicitud y empleado */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {solicitud.tipo_solicitud_nombre || "Solicitud"}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-700">
                  {solicitud.empleado_nombre} {solicitud.empleado_apellido}
                </p>
                {solicitud.empleado_rut_display && (
                  <span className="text-xs text-gray-500">
                    ({formatearRUTParaMostrar(solicitud.empleado_rut_display)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(solicitud.estado)}`}>
              {getEstadoLabel(solicitud.estado)}
            </span>
          </div>
        </div>
        
        <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Información de fechas */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Desde:</span>
          <span>{formatDate(solicitud.fecha_inicio)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Hasta:</span>
          <span>{formatDate(solicitud.fecha_fin)}</span>
          {diasSolicitados && (
            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              {diasSolicitados} día{diasSolicitados !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Motivo */}
      {solicitud.motivo && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Motivo:</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {solicitud.motivo}
          </p>
        </div>
      )}

      {/* Información de aprobación */}
      {(solicitud.estado === 'aprobada' || solicitud.estado === 'rechazada') && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          {solicitud.fecha_aprobacion && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Procesada:</span>
              <span>{formatDateTime(solicitud.fecha_aprobacion)}</span>
            </div>
          )}
          {solicitud.aprobado_por_nombre && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Por:</span>
              <span>{solicitud.aprobado_por_nombre} {solicitud.aprobado_por_apellido || ''}</span>
            </div>
          )}
          {solicitud.comentario_aprobacion && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs font-medium text-blue-700 mb-1">Comentario:</p>
              <p className="text-xs text-blue-600 line-clamp-2">
                {solicitud.comentario_aprobacion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fecha de creación */}
      {solicitud.fecha_creacion && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Creada: {formatDateTime(solicitud.fecha_creacion)}
          </p>
        </div>
      )}
    </div>
  );
}

