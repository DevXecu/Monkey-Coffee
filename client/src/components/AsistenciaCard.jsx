import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function AsistenciaCard({ asistencia }) {
  const navigate = useNavigate();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800';
      case 'tarde':
        return 'bg-yellow-100 text-yellow-800';
      case 'ausente':
        return 'bg-red-100 text-red-800';
      case 'justificado':
        return 'bg-blue-100 text-blue-800';
      case 'permiso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearEstado = (estado) => {
    const estados = {
      'presente': 'Presente',
      'tarde': 'Tarde',
      'ausente': 'Ausente',
      'justificado': 'Justificado',
      'permiso': 'Permiso'
    };
    return estados[estado] || estado;
  };

  const formatearTipoEntrada = (tipo) => {
    const tipos = {
      'biometrico': 'Biométrico',
      'manual': 'Manual',
      'app_movil': 'App Móvil'
    };
    return tipos[tipo] || tipo;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    // Si es solo fecha (sin hora), usar directamente
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fecha.split('-');
      return new Date(year, month - 1, day).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Si es datetime, parsear correctamente considerando que viene en UTC
    const fechaObj = new Date(fecha);
    // Si la fecha viene en UTC (termina en Z o tiene offset), JavaScript ya la convierte correctamente
    // Solo necesitamos formatearla en la zona horaria de Chile
    return fechaObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Santiago'
    });
  };

  const formatearHora = (datetime) => {
    if (!datetime) return 'N/A';
    // El backend envía fechas en formato ISO sin timezone (ej: 2024-01-01T15:00:00)
    // Estas fechas están guardadas tal como aparecen en la BD, así que extraemos
    // la hora directamente del string para mostrar exactamente lo que hay en BD
    if (typeof datetime === 'string' && datetime.includes('T')) {
      // Extraer hora y minutos del formato ISO (HH:MM:SS o HH:MM)
      // Esto extrae la hora tal como está guardada en la base de datos
      const match = datetime.match(/T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)?/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      }
    }
    
    // Si no es string o no tiene el formato esperado, usar Date pero
    // especificar explícitamente la zona horaria de Chile para evitar conversiones
    const fechaObj = new Date(datetime);
    // Usar toLocaleTimeString con timeZone explícito para asegurar que se muestre
    // la hora correcta en la zona horaria de Chile
    return fechaObj.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    });
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-200"
      onClick={() => {
        navigate(`/asistencia/${asistencia.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-sm">
                {asistencia.empleado_nombre?.charAt(0) || 'A'}{asistencia.empleado_apellido?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {asistencia.empleado_nombre} {asistencia.empleado_apellido}
              </h3>
              <p className="text-sm text-gray-500">
                RUT: {formatearRUTParaMostrar(asistencia.empleado_rut || asistencia.empleado_rut_display)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(asistencia.estado)}`}>
              {formatearEstado(asistencia.estado)}
            </span>
            
            {asistencia.tipo_entrada && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {formatearTipoEntrada(asistencia.tipo_entrada)}
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p>
              📅 Fecha: {formatearFecha(asistencia.fecha)}
            </p>
            
            {asistencia.hora_entrada && (
              <p>
                🕐 Entrada: {formatearHora(asistencia.hora_entrada)}
              </p>
            )}
            
            {asistencia.hora_salida && (
              <p>
                🕐 Salida: {formatearHora(asistencia.hora_salida)}
              </p>
            )}
            
            {asistencia.horas_trabajadas !== null && asistencia.horas_trabajadas !== undefined && (
              <p>
                ⏱️ Horas trabajadas: {asistencia.horas_trabajadas}h
              </p>
            )}
            
            {asistencia.minutos_tarde > 0 && (
              <p className="text-yellow-600">
                ⚠️ Minutos tarde: {asistencia.minutos_tarde}
              </p>
            )}
            
            {asistencia.minutos_extras > 0 && (
              <p className="text-green-600">
                ➕ Minutos extras: {asistencia.minutos_extras}
              </p>
            )}
            
            {asistencia.ubicacion_entrada && (
              <p className="text-xs text-gray-500">
                📍 Entrada: {asistencia.ubicacion_entrada}
              </p>
            )}
            
            {asistencia.ubicacion_salida && (
              <p className="text-xs text-gray-500">
                📍 Salida: {asistencia.ubicacion_salida}
              </p>
            )}
            
            {asistencia.ip_entrada && (
              <p className="text-xs text-gray-400">
                🌐 IP Entrada: {asistencia.ip_entrada}
              </p>
            )}
            
            {asistencia.ip_salida && (
              <p className="text-xs text-gray-400">
                🌐 IP Salida: {asistencia.ip_salida}
              </p>
            )}
            
            {asistencia.fecha_validacion && (
              <p className="text-xs text-blue-500">
                ✅ Validado: {formatearFecha(asistencia.fecha_validacion)} {formatearHora(asistencia.fecha_validacion)}
              </p>
            )}
          </div>

          {asistencia.observaciones && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              📝 {asistencia.observaciones}
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

