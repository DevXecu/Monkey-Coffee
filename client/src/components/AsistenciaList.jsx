import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllAsistencia } from "../api/asistencia.api";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function AsistenciaList() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState(null); // null, 'hoy', 'semana', 'mes', 'trimestre', 'año'
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);
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

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearHora = (datetime) => {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el rango de fechas según el período
  const obtenerRangoFechas = (periodo) => {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Fin del día de hoy
    
    let inicio = new Date();
    inicio.setHours(0, 0, 0, 0); // Inicio del día
    
    switch (periodo) {
      case 'hoy':
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        inicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        inicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'trimestre':
        inicio.setMonth(hoy.getMonth() - 3);
        break;
      case 'año':
        inicio.setFullYear(hoy.getFullYear() - 1);
        break;
      default:
        return null;
    }
    
    return { inicio, fin: hoy };
  };

  // Filtrar y ordenar asistencias
  const asistenciasFiltradas = useMemo(() => {
    let filtradas = [...asistencias];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtradas = filtradas.filter((a) => {
        const nombreCompleto = `${a.empleado_nombre || ''} ${a.empleado_apellido || ''}`.toLowerCase();
        const rut = formatearRUTParaMostrar(a.empleado_rut || a.empleado_rut_display || '').toLowerCase();
        return nombreCompleto.includes(busquedaLower) || rut.includes(busquedaLower);
      });
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter((a) => a.estado === filtroEstado);
    }

    // Filtro por fecha/período
    if (filtroFecha) {
      const rango = obtenerRangoFechas(filtroFecha);
      if (rango) {
        filtradas = filtradas.filter((a) => {
          if (!a.fecha) return false;
          const fechaAsistencia = new Date(a.fecha);
          fechaAsistencia.setHours(0, 0, 0, 0);
          return fechaAsistencia >= rango.inicio && fechaAsistencia <= rango.fin;
        });
      }
    }

    // Ordenar
    filtradas.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case 'fecha':
          valorA = new Date(a.fecha || 0);
          valorB = new Date(b.fecha || 0);
          break;
        case 'empleado':
          valorA = `${a.empleado_nombre || ''} ${a.empleado_apellido || ''}`.toLowerCase();
          valorB = `${b.empleado_nombre || ''} ${b.empleado_apellido || ''}`.toLowerCase();
          break;
        case 'horas':
          valorA = a.horas_trabajadas || 0;
          valorB = b.horas_trabajadas || 0;
          break;
        default:
          valorA = a.fecha || '';
          valorB = b.fecha || '';
      }

      if (ordenDireccion === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return filtradas;
  }, [asistencias, busqueda, filtroEstado, filtroFecha, ordenarPor, ordenDireccion]);

  // Paginación
  const totalPaginas = Math.ceil(asistenciasFiltradas.length / itemsPorPagina);
  const asistenciasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return asistenciasFiltradas.slice(inicio, fin);
  }, [asistenciasFiltradas, paginaActual, itemsPorPagina]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(Math.max(1, Math.min(nuevaPagina, totalPaginas)));
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroFecha]);

  useEffect(() => {
    async function loadAsistencias() {
      try {
        setLoading(true);
        const res = await getAllAsistencia();
        console.log('Asistencias recibidas:', res.data);
        setAsistencias(res.data || []);
      } catch (error) {
        console.error('Error loading asistencias:', error);
        console.error('Error response:', error.response);
        setAsistencias([]);
        // Mostrar mensaje de error al usuario
        if (error.response) {
          console.error('Error del servidor:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadAsistencias();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Asistencias</h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Entrada</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Salida</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Horas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asistencias</h1>
              <p className="text-gray-600 mt-1">Gestiona las asistencias de los empleados</p>
            </div>
          </div>
          <Link
            to="/asistencia-create"
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Asistencia
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{asistencias.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Presentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asistencias.filter(a => a.estado === 'presente').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tardes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asistencias.filter(a => a.estado === 'tarde').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ausentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asistencias.filter(a => a.estado === 'ausente').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Justificados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asistencias.filter(a => a.estado === 'justificado' || a.estado === 'permiso').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos</option>
                <option value="presente">Presente</option>
                <option value="tarde">Tarde</option>
                <option value="ausente">Ausente</option>
                <option value="justificado">Justificado</option>
                <option value="permiso">Permiso</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="fecha">Fecha</option>
                <option value="empleado">Empleado</option>
                <option value="horas">Horas Trabajadas</option>
              </select>
            </div>

            {/* Botón de orden ascendente/descendente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <button
                onClick={() => setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                {ordenDireccion === 'asc' ? (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Ascendente
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Descendente
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Botones de período rápido */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Períodos rápidos:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroFecha(filtroFecha === 'hoy' ? null : 'hoy')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filtroFecha === 'hoy'
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setFiltroFecha(filtroFecha === 'semana' ? null : 'semana')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filtroFecha === 'semana'
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Última semana
              </button>
              <button
                onClick={() => setFiltroFecha(filtroFecha === 'mes' ? null : 'mes')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filtroFecha === 'mes'
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Último mes
              </button>
              <button
                onClick={() => setFiltroFecha(filtroFecha === 'trimestre' ? null : 'trimestre')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filtroFecha === 'trimestre'
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Último trimestre
              </button>
              <button
                onClick={() => setFiltroFecha(filtroFecha === 'año' ? null : 'año')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filtroFecha === 'año'
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Último año
              </button>
              {(busqueda || filtroEstado !== 'todos' || filtroFecha) && (
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroEstado("todos");
                    setFiltroFecha(null);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asistencias Table */}
      {asistenciasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {asistencias.length === 0 ? 'No hay asistencias' : 'No se encontraron resultados'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {asistencias.length === 0 
              ? 'Comienza agregando una nueva asistencia.' 
              : 'Intenta ajustar los filtros de búsqueda.'}
          </p>
          {asistencias.length === 0 && (
            <Link
              to="/asistencia-create"
              className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Asistencia
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">
                  {asistenciasFiltradas.length > 0 ? (paginaActual - 1) * itemsPorPagina + 1 : 0}
                </span> - <span className="font-semibold text-gray-900">
                  {Math.min(paginaActual * itemsPorPagina, asistenciasFiltradas.length)}
                </span> de <span className="font-semibold text-gray-900">{asistenciasFiltradas.length}</span> resultados
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Horas Trab.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tardanza
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asistenciasPaginadas.map((asistencia) => (
                  <tr
                    key={asistencia.id}
                    onClick={() => navigate(`/asistencia/${asistencia.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-500 font-semibold text-sm">
                            {asistencia.empleado_nombre?.charAt(0) || 'A'}{asistencia.empleado_apellido?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asistencia.empleado_nombre} {asistencia.empleado_apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatearRUTParaMostrar(asistencia.empleado_rut || asistencia.empleado_rut_display)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatearFecha(asistencia.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asistencia.hora_entrada ? formatearHora(asistencia.hora_entrada) : '-'}
                      </div>
                      {asistencia.tipo_entrada && (
                        <div className="text-xs text-gray-500 capitalize">{asistencia.tipo_entrada}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asistencia.hora_salida ? formatearHora(asistencia.hora_salida) : '-'}
                      </div>
                      {asistencia.tipo_salida && (
                        <div className="text-xs text-gray-500 capitalize">{asistencia.tipo_salida}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asistencia.horas_trabajadas !== null && asistencia.horas_trabajadas !== undefined
                          ? `${asistencia.horas_trabajadas}h`
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(asistencia.estado)}`}>
                        {formatearEstado(asistencia.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {asistencia.minutos_tarde > 0 && (
                          <span className="text-yellow-600">⚠️ {asistencia.minutos_tarde} min tarde</span>
                        )}
                        {asistencia.minutos_extras > 0 && (
                          <span className="text-green-600 ml-2">➕ {asistencia.minutos_extras} min extras</span>
                        )}
                        {asistencia.minutos_tarde === 0 && asistencia.minutos_extras === 0 && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/asistencia/${asistencia.id}`);
                        }}
                        className="text-primary-600 hover:text-primary-900 font-medium transition-colors flex items-center gap-1 ml-auto"
                      >
                        Ver detalles
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pagina;
                    if (totalPaginas <= 5) {
                      pagina = i + 1;
                    } else if (paginaActual <= 3) {
                      pagina = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      pagina = totalPaginas - 4 + i;
                    } else {
                      pagina = paginaActual - 2 + i;
                    }
                    return (
                      <button
                        key={pagina}
                        onClick={() => cambiarPagina(pagina)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pagina === paginaActual
                            ? "bg-primary-500 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Página {paginaActual} de {totalPaginas}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

