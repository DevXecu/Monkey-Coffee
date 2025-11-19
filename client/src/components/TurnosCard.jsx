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
      { value: 0, label: 'Dom', short: 'D' },
      { value: 1, label: 'Lun', short: 'L' },
      { value: 2, label: 'Mar', short: 'M' },
      { value: 3, label: 'Mié', short: 'X' },
      { value: 4, label: 'Jue', short: 'J' },
      { value: 5, label: 'Vie', short: 'V' },
      { value: 6, label: 'Sáb', short: 'S' },
    ];
    
    const labels = dias.map(dia => 
      diasSemanaOptions.find(opt => opt.value === dia)?.short || dia
    );
    return labels.join('');
  };

  const calcularDuracion = () => {
    if (!turno.hora_entrada || !turno.hora_salida) return null;
    const entrada = new Date(`2000-01-01T${turno.hora_entrada}`);
    const salida = new Date(`2000-01-01T${turno.hora_salida}`);
    const diffMs = salida - entrada;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs);
  };

  const duracion = calcularDuracion();

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-300 cursor-pointer transition-all duration-200 group"
      onClick={() => {
        navigate(`/turnos/${turno.id}`);
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              turno.activo 
                ? 'bg-primary-100 group-hover:bg-primary-200' 
                : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
              <svg className={`h-6 w-6 ${turno.activo ? 'text-primary-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {turno.nombre_turno}
              </h3>
              <p className="text-sm font-medium text-gray-700">
                {turno.empleado_nombre} {turno.empleado_apellido}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                RUT: {formatearRUTParaMostrar(turno.empleados_rut)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
              turno.activo 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                turno.activo ? 'bg-green-500' : 'bg-gray-400'
              }`}></span>
              {turno.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        <svg className="h-5 w-5 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Horario</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatTime(turno.hora_entrada)} - {formatTime(turno.hora_salida)}
          </span>
        </div>
        
        {turno.horas_trabajo && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-blue-700">Horas Trabajo</span>
            </div>
            <span className="text-sm font-semibold text-blue-900">
              {Math.round(turno.horas_trabajo)} hrs
            </span>
          </div>
        )}

        {duracion && !turno.horas_trabajo && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-blue-700">Duración</span>
            </div>
            <span className="text-sm font-semibold text-blue-900">
              {duracion} hrs
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-purple-700">Días</span>
          </div>
          <div className="flex items-center gap-1">
            {turno.dias_semana && turno.dias_semana.length > 0 ? (
              <>
                <span className="text-xs font-mono font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  {getDiasSemanaLabel(turno.dias_semana)}
                </span>
                <span className="text-xs text-purple-600 ml-1">
                  ({turno.dias_semana.length} día{turno.dias_semana.length !== 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <span className="text-xs text-purple-600">Sin días asignados</span>
            )}
          </div>
        </div>
        
        {turno.tolerancia_minutos && (
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-amber-700">Tolerancia</span>
            </div>
            <span className="text-sm font-semibold text-amber-900">
              {turno.tolerancia_minutos} min
            </span>
          </div>
        )}
      </div>

      {turno.descripcion && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {turno.descripcion}
          </p>
        </div>
      )}
    </div>
  );
}

