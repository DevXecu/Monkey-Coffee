import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProveedorCard } from "./ProveedorCard";
import { proveedoresAPI } from "../api/proveedores.api";

export function ProveedorList() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
    { value: "suspendido", label: "Suspendido" }
  ];

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedoresAPI.getAll();
      setProveedores(data);
    } catch (err) {
      setError("Error al cargar los proveedores");
      console.error("Error loading proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProveedores = useMemo(() => {
    let filtered = [...proveedores];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((prov) => {
        const nombre = (prov.nombre || "").toLowerCase();
        const razonSocial = (prov.razon_social || "").toLowerCase();
        const rut = (prov.rut || "").toLowerCase();
        const email = (prov.email || "").toLowerCase();
        const telefono = (prov.telefono || "").toLowerCase();
        return nombre.includes(searchLower) || 
               razonSocial.includes(searchLower) ||
               rut.includes(searchLower) ||
               email.includes(searchLower) ||
               telefono.includes(searchLower);
      });
    }

    if (filterEstado) {
      filtered = filtered.filter((prov) => prov.estado === filterEstado);
    }

    if (filterCategoria) {
      filtered = filtered.filter((prov) => prov.categoria === filterCategoria);
    }

    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case "nombre":
          valueA = (a.nombre || "").toLowerCase();
          valueB = (b.nombre || "").toLowerCase();
          break;
        case "estado":
          valueA = (a.estado || "").toLowerCase();
          valueB = (b.estado || "").toLowerCase();
          break;
        case "categoria":
          valueA = (a.categoria || "").toLowerCase();
          valueB = (b.categoria || "").toLowerCase();
          break;
        case "fecha":
          valueA = new Date(a.fecha_creacion || 0);
          valueB = new Date(b.fecha_creacion || 0);
          break;
        default:
          valueA = (a.nombre || "").toLowerCase();
          valueB = (b.nombre || "").toLowerCase();
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });

    return filtered;
  }, [proveedores, searchTerm, filterEstado, filterCategoria, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedProveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProveedores = filteredAndSortedProveedores.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterCategoria]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const categorias = useMemo(() => {
    const cats = new Set(proveedores.map(p => p.categoria).filter(Boolean));
    return Array.from(cats).map(cat => ({ value: cat, label: cat }));
  }, [proveedores]);

  const stats = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter(p => p.estado === "activo").length;
    const inactivos = proveedores.filter(p => p.estado === "inactivo").length;
    const suspendidos = proveedores.filter(p => p.estado === "suspendido").length;
    
    return {
      total,
      activos,
      inactivos,
      suspendidos
    };
  }, [proveedores]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadProveedores}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-600 mt-1">Gestiona tus proveedores y su información de contacto</p>
          </div>
          <button
            onClick={() => navigate("/proveedores-create")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Activos</div>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Inactivos</div>
            <div className="text-2xl font-bold text-gray-600">{stats.inactivos}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Suspendidos</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspendidos}</div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar por nombre, RUT, email, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de proveedores */}
      {paginatedProveedores.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No se encontraron proveedores</p>
          <p className="text-gray-500 text-sm mb-4">
            {searchTerm || filterEstado || filterCategoria
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer proveedor"}
          </p>
          {!searchTerm && !filterEstado && !filterCategoria && (
            <button
              onClick={() => navigate("/proveedores-create")}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Agregar Proveedor
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {paginatedProveedores.map((proveedor) => (
              <ProveedorCard
                key={proveedor.id}
                proveedor={proveedor}
                onUpdate={loadProveedores}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedProveedores.length)} de {filteredAndSortedProveedores.length} proveedores
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

