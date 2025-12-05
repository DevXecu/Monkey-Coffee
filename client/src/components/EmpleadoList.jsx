import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { EmpleadoCard } from "./EmpleadoCard";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function EmpleadoList() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(12);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const res = await getAllEmpleado();
      setEmpleados(res.data);
    } catch (error) {
      console.error('Error loading empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpleados();
  }, []);

  const handleEmpleadoDeleted = (empleadoId) => {
    // Recargar la lista después de eliminar
    loadEmpleados();
  };

  // Filtrar y ordenar empleados
  const empleadosFiltrados = useMemo(() => {
    let filtradas = [...empleados];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtradas = filtradas.filter((e) => {
        const nombreCompleto = `${e.nombre || ''} ${e.apellido || ''}`.toLowerCase();
        const rut = formatearRUTParaMostrar(e.rut || '').toLowerCase();
        const correo = (e.correo || '').toLowerCase();
        return nombreCompleto.includes(busquedaLower) || 
               rut.includes(busquedaLower) || 
               correo.includes(busquedaLower);
      });
    }

    // Filtro por cargo
    if (filtroCargo !== 'todos') {
      filtradas = filtradas.filter((e) => e.cargo === filtroCargo);
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter((e) => e.estado === filtroEstado);
    }

    // Filtro por activo/inactivo
    if (filtroActivo !== 'todos') {
      const activo = filtroActivo === 'activo';
      filtradas = filtradas.filter((e) => e.activo === activo);
    }

    // Ordenar
    filtradas.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case 'nombre':
          valorA = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
          valorB = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase();
          break;
        case 'cargo':
          valorA = (a.cargo || '').toLowerCase();
          valorB = (b.cargo || '').toLowerCase();
          break;
        case 'fecha_contratacion':
          valorA = new Date(a.fecha_contratacion || 0);
          valorB = new Date(b.fecha_contratacion || 0);
          break;
        case 'departamento':
          valorA = (a.departamento || '').toLowerCase();
          valorB = (b.departamento || '').toLowerCase();
          break;
        default:
          valorA = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
          valorB = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase();
      }

      if (ordenDireccion === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return filtradas;
  }, [empleados, busqueda, filtroCargo, filtroEstado, filtroActivo, ordenarPor, ordenDireccion]);

  // Paginación
  const totalPaginas = Math.ceil(empleadosFiltrados.length / itemsPorPagina);
  const empleadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return empleadosFiltrados.slice(inicio, fin);
  }, [empleadosFiltrados, paginaActual, itemsPorPagina]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(Math.max(1, Math.min(nuevaPagina, totalPaginas)));
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroCargo, filtroEstado, filtroActivo]);

  // Obtener departamentos únicos para el filtro
  const departamentosUnicos = useMemo(() => {
    const depts = empleados
      .map(e => e.departamento)
      .filter(d => d && d.trim() !== '');
    return [...new Set(depts)].sort();
  }, [empleados]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
              <p className="text-gray-600 mt-1">Gestiona el personal de Monkey Coffee</p>
            </div>
          </div>
          <Link
            to="/empleado-create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Empleado
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
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
                {empleados.filter(e => e.activo).length}
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
                {empleados.filter(e => !e.activo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gerentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {empleados.filter(e => e.rol === 'gerente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
                placeholder="Buscar por nombre, RUT o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filtro por Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <select
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="todos">Todos</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
              <option value="Trabajador">Trabajador</option>
            </select>
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="licencia">Licencia</option>
              <option value="desvinculado">Desvinculado</option>
            </select>
          </div>

          {/* Filtro por Activo/Inactivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado General
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
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="nombre">Nombre</option>
            <option value="cargo">Cargo</option>
            <option value="fecha_contratacion">Fecha de Contratación</option>
            <option value="departamento">Departamento</option>
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
            Mostrando {empleadosPaginados.length} de {empleadosFiltrados.length} empleados
          </div>
        </div>
      </div>

      {/* Empleados Grid */}
      {empleadosFiltrados.length === 0 ? (
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {busqueda || filtroCargo !== 'todos' || filtroEstado !== 'todos' || filtroActivo !== 'todos'
              ? 'No se encontraron empleados'
              : 'No hay empleados'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {busqueda || filtroCargo !== 'todos' || filtroEstado !== 'todos' || filtroActivo !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando un nuevo empleado'}
          </p>
          {(!busqueda && filtroCargo === 'todos' && filtroEstado === 'todos' && filtroActivo === 'todos') && (
            <div className="mt-6">
              <Link
                to="/empleado-create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Empleado
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empleadosPaginados.map((empleado) => (
              <EmpleadoCard 
                key={empleado.id} 
                empleado={empleado} 
                onDelete={handleEmpleadoDeleted}
              />
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
