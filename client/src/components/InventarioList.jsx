import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InventarioCard } from "./InventarioCard";
import { inventarioAPI } from "../api/inventario.api";
import { formatCurrency, formatInteger } from "../utils/currencyUtils";

export function InventarioList() {
  const navigate = useNavigate();
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const categorias = [
    { value: "", label: "Todas las categorías" },
    { value: "cafe", label: "Café" },
    { value: "insumos", label: "Insumos" },
    { value: "equipamiento", label: "Equipamiento" },
    { value: "desechables", label: "Desechables" },
    { value: "alimentos", label: "Alimentos" },
    { value: "bebidas", label: "Bebidas" },
    { value: "limpieza", label: "Limpieza" },
    { value: "otros", label: "Otros" }
  ];

  const estados = [
    { value: "", label: "Todos los estados" },
    { value: "disponible", label: "Disponible" },
    { value: "agotado", label: "Agotado" },
    { value: "por_vencer", label: "Por vencer" },
    { value: "vencido", label: "Vencido" },
    { value: "en_pedido", label: "En pedido" },
    { value: "descontinuado", label: "Descontinuado" }
  ];

  useEffect(() => {
    loadInventarios();
  }, []);

  const loadInventarios = async () => {
    try {
      setLoading(true);
      const data = await inventarioAPI.getAll();
      setInventarios(data);
    } catch (err) {
      setError("Error al cargar el inventario");
      console.error("Error loading inventarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedInventarios = useMemo(() => {
    let filtered = [...inventarios];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((inv) => {
        const nombre = (inv.nombre_producto || "").toLowerCase();
        const codigo = (inv.codigo_producto || "").toLowerCase();
        const descripcion = (inv.descripcion || "").toLowerCase();
        const proveedor = (inv.proveedor || "").toLowerCase();
        return nombre.includes(searchLower) || 
               codigo.includes(searchLower) ||
               descripcion.includes(searchLower) ||
               proveedor.includes(searchLower);
      });
    }

    if (filterCategory) {
      filtered = filtered.filter((inv) => inv.categoria === filterCategory);
    }

    if (filterEstado) {
      filtered = filtered.filter((inv) => inv.estado === filterEstado);
    }

    if (stockMin !== "") {
      const min = parseInt(stockMin);
      if (!isNaN(min)) {
        filtered = filtered.filter((inv) => inv.cantidad_actual >= min);
      }
    }

    if (stockMax !== "") {
      const max = parseInt(stockMax);
      if (!isNaN(max)) {
        filtered = filtered.filter((inv) => inv.cantidad_actual <= max);
      }
    }

    if (priceMin !== "") {
      const min = parseInt(priceMin);
      if (!isNaN(min)) {
        filtered = filtered.filter((inv) => {
          const precio = inv.precio_unitario || inv.precio_venta || 0;
          return precio >= min;
        });
      }
    }

    if (priceMax !== "") {
      const max = parseInt(priceMax);
      if (!isNaN(max)) {
        filtered = filtered.filter((inv) => {
          const precio = inv.precio_unitario || inv.precio_venta || 0;
          return precio <= max;
        });
      }
    }

    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case "nombre":
          valueA = (a.nombre_producto || "").toLowerCase();
          valueB = (b.nombre_producto || "").toLowerCase();
          break;
        case "stock":
          valueA = a.cantidad_actual || 0;
          valueB = b.cantidad_actual || 0;
          break;
        case "precio":
          valueA = a.precio_unitario || a.precio_venta || 0;
          valueB = b.precio_unitario || b.precio_venta || 0;
          break;
        case "categoria":
          valueA = (a.categoria || "").toLowerCase();
          valueB = (b.categoria || "").toLowerCase();
          break;
        case "estado":
          valueA = (a.estado || "").toLowerCase();
          valueB = (b.estado || "").toLowerCase();
          break;
        case "codigo":
          valueA = (a.codigo_producto || "").toLowerCase();
          valueB = (b.codigo_producto || "").toLowerCase();
          break;
        default:
          valueA = (a.nombre_producto || "").toLowerCase();
          valueB = (b.nombre_producto || "").toLowerCase();
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });

    return filtered;
  }, [inventarios, searchTerm, filterCategory, filterEstado, sortBy, sortDirection, stockMin, stockMax, priceMin, priceMax]);

  const totalPages = Math.ceil(filteredAndSortedInventarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventarios = filteredAndSortedInventarios.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterEstado, stockMin, stockMax, priceMin, priceMax]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const stats = useMemo(() => {
    const total = inventarios.length;
    const disponibles = inventarios.filter(i => i.estado === "disponible").length;
    const agotados = inventarios.filter(i => i.estado === "agotado").length;
    const porVencer = inventarios.filter(i => i.estado === "por_vencer").length;
    const vencidos = inventarios.filter(i => i.estado === "vencido").length;
    const enPedido = inventarios.filter(i => i.estado === "en_pedido").length;
    const stockBajo = inventarios.filter(i => i.cantidad_actual <= i.cantidad_minima && i.estado !== "agotado").length;
    
    const valorTotal = inventarios.reduce((sum, inv) => {
      const precio = inv.precio_unitario || 0;
      const cantidad = inv.cantidad_actual || 0;
      return sum + (precio * cantidad);
    }, 0);

    const valorDisponible = inventarios
      .filter(i => i.estado === "disponible")
      .reduce((sum, inv) => {
        const precio = inv.precio_unitario || 0;
        const cantidad = inv.cantidad_actual || 0;
        return sum + (precio * cantidad);
      }, 0);

    return {
      total,
      disponibles,
      agotados,
      porVencer,
      vencidos,
      enPedido,
      stockBajo,
      valorTotal,
      valorDisponible
    };
  }, [inventarios]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "agotado":
        return "bg-red-100 text-red-800";
      case "por_vencer":
        return "bg-yellow-100 text-yellow-800";
      case "vencido":
        return "bg-red-100 text-red-800";
      case "en_pedido":
        return "bg-blue-100 text-blue-800";
      case "descontinuado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoLabel = (estado) => {
    const estadoObj = estados.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  };

  const getCategoriaLabel = (categoria) => {
    const categoriaObj = categorias.find(c => c.value === categoria);
    return categoriaObj ? categoriaObj.label : categoria;
  };

  const getUnidadLabel = (unidad) => {
    const unidades = {
      unidad: "Unidad",
      kilogramo: "Kg",
      litro: "L",
      gramo: "g",
      mililitro: "ml",
      paquete: "Paq.",
      caja: "Caja",
      bolsa: "Bolsa"
    };
    return unidades[unidad] || unidad;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simplificado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
        </div>
        <button 
          onClick={() => navigate("/inventario-create")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Disponibles</div>
          <div className="text-2xl font-bold text-green-600">{stats.disponibles}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600">{stats.stockBajo}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Valor Total</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</div>
        </div>
      </div>

      {/* Filtros Simplificados */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categorias.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Stock Mínimo</label>
              <input
                type="number"
                placeholder="0"
                value={stockMin}
                onChange={(e) => setStockMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Stock Máximo</label>
              <input
                type="number"
                placeholder="1000"
                value={stockMax}
                onChange={(e) => setStockMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Precio Mínimo</label>
              <input
                type="number"
                placeholder="0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Precio Máximo</label>
              <input
                type="number"
                placeholder="1000000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} filtros avanzados
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Vista:</span>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded ${viewMode === "cards" ? "bg-white shadow-sm" : ""}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="nombre">Nombre</option>
                <option value="codigo">Código</option>
                <option value="stock">Stock</option>
                <option value="precio">Precio</option>
                <option value="categoria">Categoría</option>
                <option value="estado">Estado</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                {sortDirection === "asc" ? (
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista de Productos */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedInventarios.map((inventario) => (
            <InventarioCard
              key={inventario.id}
              inventario={inventario}
              onUpdate={loadInventarios}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("codigo")}
                  >
                    <div className="flex items-center gap-2">
                      Código
                      <SortIcon field="codigo" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("nombre")}
                  >
                    <div className="flex items-center gap-2">
                      Producto
                      <SortIcon field="nombre" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("categoria")}
                  >
                    <div className="flex items-center gap-2">
                      Categoría
                      <SortIcon field="categoria" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("stock")}
                  >
                    <div className="flex items-center gap-2">
                      Stock
                      <SortIcon field="stock" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("precio")}
                  >
                    <div className="flex items-center gap-2">
                      Precio
                      <SortIcon field="precio" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("estado")}
                  >
                    <div className="flex items-center gap-2">
                      Estado
                      <SortIcon field="estado" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInventarios.map((inventario) => {
                  const isLowStock = inventario.cantidad_actual <= inventario.cantidad_minima;
                  
                  return (
                    <tr key={inventario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{inventario.codigo_producto}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{inventario.nombre_producto}</div>
                        {inventario.descripcion && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{inventario.descripcion}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getCategoriaLabel(inventario.categoria)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isLowStock ? "text-red-600" : "text-gray-900"}`}>
                            {formatInteger(inventario.cantidad_actual)} {getUnidadLabel(inventario.unidad_medida)}
                          </span>
                          {isLowStock && (
                            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Mín: {formatInteger(inventario.cantidad_minima)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inventario.precio_unitario ? (
                          <div className="text-sm text-gray-900">{formatCurrency(inventario.precio_unitario)}</div>
                        ) : inventario.precio_venta ? (
                          <div className="text-sm text-gray-900">{formatCurrency(inventario.precio_venta)}</div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(inventario.estado)}`}>
                          {getEstadoLabel(inventario.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/inventario/${inventario.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
                <span className="font-medium">{Math.min(endIndex, filteredAndSortedInventarios.length)}</span> de{" "}
                <span className="font-medium">{filteredAndSortedInventarios.length}</span> productos
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {filteredAndSortedInventarios.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {inventarios.length === 0 
              ? "Comienza agregando tu primer producto al inventario."
              : "No se encontraron productos que coincidan con los filtros aplicados."
            }
          </p>
          {(stockMin || stockMax || priceMin || priceMax || filterCategory || filterEstado || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterEstado("");
                setStockMin("");
                setStockMax("");
                setPriceMin("");
                setPriceMax("");
              }}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
