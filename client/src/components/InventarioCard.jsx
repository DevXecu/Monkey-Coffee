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
      kilogramo: "Kilogramo",
      litro: "Litro",
      gramo: "Gramo",
      mililitro: "Mililitro",
      paquete: "Paquete",
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
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {inventario.nombre_producto}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Código: {inventario.codigo_producto}
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => navigate(`/inventario/${inventario.id}`)}
              className="text-primary-500 hover:text-primary-700"
              title="Editar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
              title="Eliminar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status and Category */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(inventario.estado)}`}>
            {getEstadoLabel(inventario.estado)}
          </span>
          <span className="text-sm text-gray-500">
            {getCategoriaLabel(inventario.categoria)}
          </span>
        </div>

        {/* Stock Information */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Stock Actual:</span>
            <span className={`text-sm font-bold ${
              isLowStock ? "text-red-600" : 
              isExpired ? "text-red-600" : 
              isExpiringSoon ? "text-yellow-600" : 
              "text-green-600"
            }`}>
              {formatInteger(inventario.cantidad_actual)} {getUnidadLabel(inventario.unidad_medida)}
            </span>
          </div>
          
          {isLowStock && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Stock bajo (mín: {formatInteger(inventario.cantidad_minima)})
            </div>
          )}

          {isExpired && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Producto vencido
            </div>
          )}

          {isExpiringSoon && (
            <div className="mt-2 flex items-center text-sm text-yellow-600">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Por vencer
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-4 space-y-2">
          {inventario.precio_unitario && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Precio Unitario:</span>
              <span className="font-medium">{formatCurrency(inventario.precio_unitario)}</span>
            </div>
          )}
          
          {inventario.precio_venta && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Precio Venta:</span>
              <span className="font-medium">{formatCurrency(inventario.precio_venta)}</span>
            </div>
          )}

          {inventario.precio_con_iva && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Precio con IVA:</span>
              <span className="font-medium text-blue-600">{formatCurrency(inventario.precio_con_iva)}</span>
            </div>
          )}

          {inventario.ganancia !== null && inventario.ganancia !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ganancia:</span>
              <span className={`font-medium ${
                inventario.ganancia >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(inventario.ganancia)}
              </span>
            </div>
          )}

          {inventario.fecha_vencimiento && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vencimiento:</span>
              <span className={`font-medium ${
                isExpired ? "text-red-600" : 
                isExpiringSoon ? "text-yellow-600" : 
                "text-gray-900"
              }`}>
                {formatDate(inventario.fecha_vencimiento)}
              </span>
            </div>
          )}

          {inventario.proveedor && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Proveedor:</span>
              <span className="font-medium truncate ml-2">{inventario.proveedor}</span>
            </div>
          )}

          {inventario.ubicacion && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ubicación:</span>
              <span className="font-medium">{inventario.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {inventario.descripcion && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {inventario.descripcion}
            </p>
          </div>
        )}

        {/* Notes */}
        {inventario.notas && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              <strong>Notas:</strong> {inventario.notas}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Creado: {formatDate(inventario.fecha_creacion)}</span>
            {inventario.fecha_ultimo_ingreso && (
              <span>Último ingreso: {formatDate(inventario.fecha_ultimo_ingreso)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
