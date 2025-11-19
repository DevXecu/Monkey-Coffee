import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tareasAPI } from "../api/tareas.api";
import { TareasCard } from "./TareasCard";

export function TareasList() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterPrioridad, setFilterPrioridad] = useState("");

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "pendiente", label: "Pendiente" },
    { value: "en_proceso", label: "En Proceso" },
    { value: "completada", label: "Completada" },
    { value: "cancelada", label: "Cancelada" },
    { value: "pausada", label: "Pausada" }
  ];

  const prioridades = [
    { value: "", label: "Todas las prioridades" },
    { value: "critica", label: "Crítica" },
    { value: "alta", label: "Alta" },
    { value: "media", label: "Media" },
    { value: "baja", label: "Baja" }
  ];

  useEffect(() => {
    const loadTareas = async () => {
      try {
        setLoading(true);
        const data = await tareasAPI.getAll();
        setTareas(data);
      } catch (err) {
        console.error("Error loading tareas:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTareas();
  }, []);

  const filteredTareas = tareas.filter((tarea) => {
    const matchesSearch = tarea.titulo
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      tarea.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    
    const matchesEstado = !filterEstado || tarea.estado === filterEstado;
    const matchesPrioridad = !filterPrioridad || tarea.prioridad === filterPrioridad;

    return matchesSearch && matchesEstado && matchesPrioridad;
  });

  const tareasPendientes = filteredTareas.filter(t => t.estado === 'pendiente').length;
  const tareasCompletadas = filteredTareas.filter(t => t.estado === 'completada').length;
  const tareasEnProceso = filteredTareas.filter(t => t.estado === 'en_proceso').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            <p className="text-gray-600">Gestiona las tareas del equipo</p>
          </div>
        </div>
        
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">Gestiona las tareas del equipo</p>
        </div>
        <button
          onClick={() => navigate("/tareas-create")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Tarea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredTareas.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{tareasPendientes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Proceso</p>
              <p className="text-2xl font-semibold text-gray-900">{tareasEnProceso}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completadas</p>
              <p className="text-2xl font-semibold text-gray-900">{tareasCompletadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              id="prioridad"
              value={filterPrioridad}
              onChange={(e) => setFilterPrioridad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {prioridades.map((prioridad) => (
                <option key={prioridad.value} value={prioridad.value}>
                  {prioridad.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tareas Grid */}
      {filteredTareas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {tareas.length === 0 
              ? "Comienza creando una nueva tarea para el equipo."
              : "No se encontraron tareas que coincidan con los filtros aplicados."
            }
          </p>
          {tareas.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => navigate("/tareas-create")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Tarea
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTareas.map((tarea) => (
            <TareasCard key={tarea.id} tarea={tarea} />
          ))}
        </div>
      )}
    </div>
  );
}

