import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OrdenCompraCard } from "../components/OrdenCompraCard";
import { ordenesCompraAPI, proveedoresAPI } from "../api/proveedores.api";
import { formatCurrency } from "../utils/currencyUtils";

export function OrdenCompraPage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterProveedor, setFilterProveedor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "borrador", label: "Borrador" },
    { value: "pendiente", label: "Pendiente" },
    { value: "enviada", label: "Enviada" },
    { value: "confirmada", label: "Confirmada" },
    { value: "en_transito", label: "En Tránsito" },
    { value: "recibida", label: "Recibida" },
    { value: "parcialmente_recibida", label: "Parcialmente Recibida" },
    { value: "cancelada", label: "Cancelada" },
    { value: "facturada", label: "Facturada" }
  ];

  useEffect(() => {
    loadOrdenes();
    loadProveedores();
  }, []);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const data = await ordenesCompraAPI.getAll();
      setOrdenes(data);
    } catch (err) {
      setError("Error al cargar las órdenes de compra");
      console.error("Error loading ordenes:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const data = await proveedoresAPI.getAll();
      setProveedores(data);
    } catch (err) {
      console.error("Error loading proveedores:", err);
    }
  };

  const filteredOrdenes = useMemo(() => {
    let filtered = [...ordenes];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((orden) => {
        const numero = (orden.numero_orden || "").toLowerCase();
        const proveedor = (orden.proveedor_nombre || orden.proveedor?.nombre || "").toLowerCase();
        const factura = (orden.numero_factura || "").toLowerCase();
        return numero.includes(searchLower) || 
               proveedor.includes(searchLower) ||
               factura.includes(searchLower);
      });
    }

    if (filterEstado) {
      filtered = filtered.filter((orden) => orden.estado === filterEstado);
    }

    if (filterProveedor) {
      filtered = filtered.filter((orden) => orden.proveedor === parseInt(filterProveedor));
    }

    filtered.sort((a, b) => {
      return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
    });

    return filtered;
  }, [ordenes, searchTerm, filterEstado, filterProveedor]);

  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrdenes = filteredOrdenes.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterProveedor]);

  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter(o => o.estado === "pendiente").length;
    const recibidas = ordenes.filter(o => o.estado === "recibida").length;
    const totalCompras = ordenes
      .filter(o => ['recibida', 'parcialmente_recibida', 'facturada'].includes(o.estado))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    return {
      total,
      pendientes,
      recibidas,
      totalCompras
    };
  }, [ordenes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando órdenes de compra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadOrdenes}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Órdenes de Compra</h1>
                <p className="text-gray-600 mt-1">Gestiona las órdenes de compra a tus proveedores</p>
              </div>
              <button
                onClick={() => navigate("/ordenes-compra-create")}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Orden
              </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Total Órdenes</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Pendientes</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Recibidas</div>
                <div className="text-2xl font-bold text-green-600">{stats.recibidas}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Total Compras</div>
                <div className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalCompras)}</div>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Buscar por número, proveedor, factura..."
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
                  value={filterProveedor}
                  onChange={(e) => setFilterProveedor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de órdenes */}
          {paginatedOrdenes.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No se encontraron órdenes de compra</p>
              <p className="text-gray-500 text-sm mb-4">
                {searchTerm || filterEstado || filterProveedor
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera orden de compra"}
              </p>
              {!searchTerm && !filterEstado && !filterProveedor && (
                <button
                  onClick={() => navigate("/ordenes-compra-create")}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Crear Orden
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {paginatedOrdenes.map((orden) => (
                  <OrdenCompraCard
                    key={orden.id}
                    orden={orden}
                    onUpdate={loadOrdenes}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <div className="text-sm text-gray-700">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrdenes.length)} de {filteredOrdenes.length} órdenes
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
      </div>
    </div>
  );
}

