import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { proveedoresAPI } from "../api/proveedores.api";

export function ProveedorCard({ proveedor, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-gray-100 text-gray-800";
      case "suspendido":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      activo: "Activo",
      inactivo: "Inactivo",
      suspendido: "Suspendido"
    };
    return estados[estado] || estado;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
      return;
    }

    try {
      setLoading(true);
      await proveedoresAPI.delete(proveedor.id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting proveedor:", error);
      alert("Error al eliminar el proveedor");
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
              {proveedor.nombre}
            </h3>
            {proveedor.razon_social && (
              <p className="text-sm text-gray-600 truncate">
                {proveedor.razon_social}
              </p>
            )}
            {proveedor.rut && (
              <p className="text-xs text-gray-500 font-mono mt-1">
                RUT: {proveedor.rut}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => navigate(`/proveedores/${proveedor.id}`)}
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

        {/* Estado */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEstadoColor(proveedor.estado)}`}>
            {getEstadoLabel(proveedor.estado)}
          </span>
          {proveedor.categoria && (
            <span className="text-xs text-gray-500">
              {proveedor.categoria}
            </span>
          )}
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 mb-4">
          {proveedor.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{proveedor.email}</span>
            </div>
          )}
          {proveedor.telefono && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{proveedor.telefono}</span>
            </div>
          )}
          {proveedor.celular && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{proveedor.celular}</span>
            </div>
          )}
        </div>

        {/* Contacto principal */}
        {proveedor.contacto_principal && (
          <div className="mb-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Contacto Principal</div>
            <div className="text-sm font-medium text-gray-900">{proveedor.contacto_principal}</div>
            {proveedor.cargo_contacto && (
              <div className="text-xs text-gray-600">{proveedor.cargo_contacto}</div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total Órdenes:</span>
            <span className="font-semibold text-gray-900">{proveedor.total_ordenes || 0}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Creado: {formatDate(proveedor.fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

