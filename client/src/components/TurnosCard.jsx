import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function TurnosCard({ turno }) {
  const navigate = useNavigate();

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return timeStr.slice(0, 5);
  };

  const getDiasSemanaLabel = (dias) => {
    if (!dias || dias.length === 0) return 'Sin días asignados';
    
    const diasSemanaOptions = [
      { value: 0, label: 'Dom' },
      { value: 1, label: 'Lun' },
      { value: 2, label: 'Mar' },
      { value: 3, label: 'Mié' },
      { value: 4, label: 'Jue' },
      { value: 5, label: 'Vie' },
      { value: 6, label: 'Sáb' },
    ];
    
    const labels = dias.map(dia => 
      diasSemanaOptions.find(opt => opt.value === dia)?.label || dia
    );
    return labels.join(', ');
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-200"
      onClick={() => {
        navigate(`/turnos/${turno.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {turno.nombre_turno}
              </h3>
              <p className="text-sm text-gray-500">
                {turno.empleado_nombre} {turno.empleado_apellido}
              </p>
              <p className="text-xs text-gray-400">RUT: {formatearRUTParaMostrar(turno.empleados_rut)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              turno.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {turno.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">
                {formatTime(turno.hora_entrada)} - {formatTime(turno.hora_salida)}
              </span>
            </div>
            
            {turno.horas_trabajo && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-700">
                  {turno.horas_trabajo} hrs
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">
                {getDiasSemanaLabel(turno.dias_semana)}
              </span>
            </div>
            
            {turno.tolerancia_minutos && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">
                  Tolerancia: {turno.tolerancia_minutos} min
                </span>
              </div>
            )}
          </div>

          {turno.descripcion && (
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">
              {turno.descripcion}
            </p>
          )}
        </div>
        
        <div className="ml-4 flex flex-col items-end">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center space-x-1 mt-2">
            <div className={`w-2 h-2 rounded-full ${turno.activo ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-500">
              {turno.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

