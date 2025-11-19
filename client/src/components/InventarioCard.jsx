import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { inventarioAPI } from "../api/inventario.api";
import { formatCurrency, formatInteger } from "../utils/currencyUtils";

export function InventarioCard({ inventario, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    const estados = {
      disponible: "Disponible",
      agotado: "Agotado",
      por_vencer: "Por vencer",
      vencido: "Vencido",
      en_pedido: "En pedido",
      descontinuado: "Descontinuado"
    };
    return estados[estado] || estado;
  };

  const getCategoriaLabel = (categoria) => {
    const categorias = {
      cafe: "Café",
      insumos: "Insumos",
      equipamiento: "Equipamiento",
      desechables: "Desechables",
      alimentos: "Alimentos",
      bebidas: "Bebidas",
      limpieza: "Limpieza",
      otros: "Otros"
    };
    return categorias[categoria] || categoria;
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

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      setLoading(true);
      await inventarioAPI.delete(inventario.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting inventario:", error);
      alert("Error al eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = inventario.cantidad_actual <= inventario.cantidad_minima;
  const isExpired = inventario.estado === "vencido";
  const isExpiringSoon = inventario.estado === "por_vencer";

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {inventario.nombre_producto}
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              {inventario.codigo_producto}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => navigate(`/inventario/${inventario.id}`)}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Editar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Eliminar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estado y Categoría */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEstadoColor(inventario.estado)}`}>
            {getEstadoLabel(inventario.estado)}
          </span>
          <span className="text-xs text-gray-500">
            {getCategoriaLabel(inventario.categoria)}
          </span>
        </div>

        {/* Stock */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-gray-600">Stock</span>
            <span className={`text-lg font-semibold ${isLowStock ? "text-red-600" : isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-gray-900"}`}>
              {formatInteger(inventario.cantidad_actual)} <span className="text-xs font-normal text-gray-500">{getUnidadLabel(inventario.unidad_medida)}</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isLowStock || isExpired ? "bg-red-500" :
                isExpiringSoon ? "bg-yellow-500" :
                "bg-green-500"
              }`}
              style={{ 
                width: `${Math.min(100, Math.max(5, (inventario.cantidad_actual / (inventario.cantidad_maxima || inventario.cantidad_minima * 2)) * 100))}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mín: {formatInteger(inventario.cantidad_minima)}</span>
            {inventario.cantidad_maxima && (
              <span>Máx: {formatInteger(inventario.cantidad_maxima)}</span>
            )}
          </div>
        </div>

        {/* Alertas */}
        {(isLowStock || isExpired || isExpiringSoon) && (
          <div className="mb-4">
            {isLowStock && !isExpired && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-2 py-1.5 rounded">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Stock bajo el mínimo
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-2 py-1.5 rounded">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Producto vencido
              </div>
            )}
            {isExpiringSoon && !isExpired && (
              <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Por vencer pronto
              </div>
            )}
          </div>
        )}

        {/* Precios */}
        {(inventario.precio_unitario || inventario.precio_venta) && (
          <div className="mb-4 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              {inventario.precio_unitario && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio Unitario</span>
                  <span className="font-medium text-gray-900">{formatCurrency(inventario.precio_unitario)}</span>
                </div>
              )}
              {inventario.precio_venta && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio Venta</span>
                  <span className="font-medium text-primary-600">{formatCurrency(inventario.precio_venta)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
          {inventario.proveedor && (
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{inventario.proveedor}</span>
            </div>
          )}
          {inventario.fecha_vencimiento && (
            <div className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Vence: {formatDate(inventario.fecha_vencimiento)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
