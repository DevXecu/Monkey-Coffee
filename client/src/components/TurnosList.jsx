import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllTurnos } from "../api/turno.api";
import { TurnosCard } from "./TurnosCard";
import { formatearRUTParaMostrar } from "../utils/rutUtils";
import { useAuth } from "../contexts/AuthContext";

export function TurnosList() {
  const { empleado } = useAuth();
  const rol = empleado?.rol || "empleado";
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("nombre_turno");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(12);

  const loadTurnos = async () => {
    try {
      setLoading(true);
      console.log('[TurnosList] Cargando turnos...');
      console.log('[TurnosList] Rol del usuario:', rol);
      console.log('[TurnosList] RUT del usuario:', empleado?.rut);
      
      const res = await getAllTurnos();
      console.log('[TurnosList] Respuesta completa:', res);
      console.log('[TurnosList] Datos recibidos:', res.data);
      console.log('[TurnosList] Tipo de datos:', Array.isArray(res.data) ? 'Array' : typeof res.data);
      console.log('[TurnosList] Cantidad de turnos:', Array.isArray(res.data) ? res.data.length : 'N/A');
      
      // Verificar si los datos son un array
      if (Array.isArray(res.data)) {
        setTurnos(res.data);
        console.log('[TurnosList] Turnos establecidos correctamente:', res.data.length);
      } else if (res.data && res.data.results && Array.isArray(res.data.results)) {
        // Si viene paginado
        setTurnos(res.data.results);
        console.log('[TurnosList] Turnos paginados establecidos:', res.data.results.length);
      } else {
        console.warn('[TurnosList] Formato de datos inesperado:', res.data);
        setTurnos([]);
      }
    } catch (error) {
      console.error('[TurnosList] Error loading turnos:', error);
      console.error('[TurnosList] Error response:', error.response);
      console.error('[TurnosList] Error message:', error.message);
      setTurnos([]);
      // Mostrar mensaje de error al usuario
      if (error.response) {
        console.error('[TurnosList] Error del servidor:', error.response.data);
        console.error('[TurnosList] Status code:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, []);

  // Filtrar y ordenar turnos
  const turnosFiltrados = useMemo(() => {
    let filtradas = [...turnos];

    // Si es empleado, solo mostrar sus propios turnos
    if (rol === "empleado" && empleado?.rut) {
      const rutEmpleado = empleado.rut.replace(/[^0-9kK]/g, '').toUpperCase();
      filtradas = filtradas.filter((t) => {
        const rutTurno = (t.empleados_rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
        return rutTurno === rutEmpleado;
      });
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtradas = filtradas.filter((t) => {
        const nombreTurno = (t.nombre_turno || '').toLowerCase();
        const nombreEmpleado = `${t.empleado_nombre || ''} ${t.empleado_apellido || ''}`.toLowerCase();
        const rut = formatearRUTParaMostrar(t.empleados_rut || '').toLowerCase();
        const descripcion = (t.descripcion || '').toLowerCase();
        return nombreTurno.includes(busquedaLower) || 
               nombreEmpleado.includes(busquedaLower) || 
               rut.includes(busquedaLower) ||
               descripcion.includes(busquedaLower);
      });
    }

    // Filtro por activo/inactivo
    if (filtroActivo !== 'todos') {
      const activo = filtroActivo === 'activo';
      filtradas = filtradas.filter((t) => t.activo === activo);
    }

    // Ordenar
    filtradas.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case 'nombre_turno':
          valorA = (a.nombre_turno || '').toLowerCase();
          valorB = (b.nombre_turno || '').toLowerCase();
          break;
        case 'empleado':
          valorA = `${a.empleado_nombre || ''} ${a.empleado_apellido || ''}`.toLowerCase();
          valorB = `${b.empleado_nombre || ''} ${b.empleado_apellido || ''}`.toLowerCase();
          break;
        case 'hora_entrada':
          valorA = a.hora_entrada || '';
          valorB = b.hora_entrada || '';
          break;
        case 'horas_trabajo':
          valorA = a.horas_trabajo || 0;
          valorB = b.horas_trabajo || 0;
          break;
        default:
          valorA = (a.nombre_turno || '').toLowerCase();
          valorB = (b.nombre_turno || '').toLowerCase();
      }

      if (ordenDireccion === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return filtradas;
  }, [turnos, busqueda, filtroActivo, ordenarPor, ordenDireccion, rol, empleado]);

  // Paginación
  const totalPaginas = Math.ceil(turnosFiltrados.length / itemsPorPagina);
  const turnosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return turnosFiltrados.slice(inicio, fin);
  }, [turnosFiltrados, paginaActual, itemsPorPagina]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(Math.max(1, Math.min(nuevaPagina, totalPaginas)));
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroActivo]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Turnos</h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
          ))}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Turnos</h1>
              <p className="text-gray-600 mt-1">
                {rol === "empleado" ? "Ver tu turno asignado" : "Gestiona los turnos de trabajo"}
              </p>
            </div>
          </div>
          {rol !== "empleado" && (
            <Link
              to="/turnos-create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Turno
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{turnos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {turnos.filter(t => t.activo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {turnos.filter(t => !t.activo).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
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
                placeholder="Buscar por nombre de turno, empleado o RUT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filtro por Activo/Inactivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="todos">Todos</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>
          </div>

          {/* Vista rápida de resultados */}
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultados
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {turnosFiltrados.length} turno{turnosFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="nombre_turno">Nombre del Turno</option>
            <option value="empleado">Empleado</option>
            <option value="hora_entrada">Hora de Entrada</option>
            <option value="horas_trabajo">Horas de Trabajo</option>
          </select>
          <button
            onClick={() => setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title={ordenDireccion === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
          >
            {ordenDireccion === 'asc' ? (
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <div className="ml-auto text-sm text-gray-600">
            Mostrando {turnosPaginados.length} de {turnosFiltrados.length} turnos
          </div>
        </div>
      </div>

      {/* Turnos Grid */}
      {turnosFiltrados.length === 0 ? (
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {busqueda || filtroActivo !== 'todos'
              ? 'No se encontraron turnos'
              : 'No hay turnos'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {busqueda || filtroActivo !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando un nuevo turno'}
          </p>
          {(!busqueda && filtroActivo === 'todos' && rol !== "empleado") && (
            <div className="mt-6">
              <Link
                to="/turnos-create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Turno
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnosPaginados.map((turno) => (
              <TurnosCard key={turno.id} turno={turno} />
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página <span className="font-medium">{paginaActual}</span> de <span className="font-medium">{totalPaginas}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPaginas)].map((_, i) => {
                    const pagina = i + 1;
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      pagina === 1 ||
                      pagina === totalPaginas ||
                      (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
                    ) {
                      return (
                        <button
                          key={pagina}
                          onClick={() => cambiarPagina(pagina)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            pagina === paginaActual
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {pagina}
                        </button>
                      );
                    } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                      return <span key={pagina} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

