import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordenesCompraAPI } from "../api/proveedores.api";
import { formatCurrency } from "../utils/currencyUtils";

export function OrdenCompraCard({ orden, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "borrador":
        return "bg-gray-100 text-gray-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "enviada":
        return "bg-blue-100 text-blue-800";
      case "confirmada":
        return "bg-green-100 text-green-800";
      case "en_transito":
        return "bg-purple-100 text-purple-800";
      case "recibida":
        return "bg-green-100 text-green-800";
      case "parcialmente_recibida":
        return "bg-orange-100 text-orange-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "facturada":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      borrador: "Borrador",
      pendiente: "Pendiente",
      enviada: "Enviada",
      confirmada: "Confirmada",
      en_transito: "En Tránsito",
      recibida: "Recibida",
      parcialmente_recibida: "Parcialmente Recibida",
      cancelada: "Cancelada",
      facturada: "Facturada"
    };
    return estados[estado] || estado;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta orden de compra?")) {
      return;
    }

    try {
      setLoading(true);
      await ordenesCompraAPI.delete(orden.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting orden compra:", error);
      alert("Error al eliminar la orden de compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {orden.numero_orden}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {orden.proveedor_nombre || orden.proveedor?.nombre}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => navigate(`/ordenes-compra/${orden.id}`)}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Ver detalles"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

        {/* Estado */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEstadoColor(orden.estado)}`}>
            {getEstadoLabel(orden.estado)}
          </span>
        </div>

        {/* Información */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fecha de Orden:</span>
            <span className="font-medium text-gray-900">{formatDate(orden.fecha_orden)}</span>
          </div>
          {orden.fecha_entrega_esperada && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entrega Esperada:</span>
              <span className="font-medium text-gray-900">{formatDate(orden.fecha_entrega_esperada)}</span>
            </div>
          )}
          {orden.fecha_entrega_real && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entrega Real:</span>
              <span className="font-medium text-gray-900">{formatDate(orden.fecha_entrega_real)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium text-gray-900">{orden.total_items || 0}</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(orden.total || 0)} {orden.moneda || 'CLP'}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Creada: {formatDate(orden.fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

