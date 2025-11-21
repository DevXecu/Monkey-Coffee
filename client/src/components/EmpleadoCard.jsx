import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatearRUTParaMostrar } from "../utils/rutUtils";
import { deleteEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { ActivityLogger } from "../utils/activityLogger";
import { formatCurrency } from "../utils/currencyUtils";

export function EmpleadoCard({ empleado, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const getCargoColor = (cargo) => {
    switch (cargo) {
      case 'Gerente':
        return 'bg-purple-100 text-purple-800';
      case 'Administrador':
        return 'bg-blue-100 text-blue-800';
      case 'Trabajador':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'vacaciones':
        return 'bg-blue-100 text-blue-800';
      case 'licencia':
        return 'bg-yellow-100 text-yellow-800';
      case 'desvinculado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearEstado = (estado) => {
    const estados = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'vacaciones': 'Vacaciones',
      'licencia': 'Licencia',
      'desvinculado': 'Desvinculado'
    };
    return estados[estado] || estado;
  };

  const formatearTipoContrato = (tipo) => {
    const tipos = {
      'indefinido': 'Indefinido',
      'plazo_fijo': 'Plazo Fijo',
      'full_time': 'Full Time',
      'part_time': 'Part Time'
    };
    return tipos[tipo] || tipo;
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/empleado/${empleado.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar a ${nombreCompleto}?`);
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteEmpleado(empleado.id);
      ActivityLogger.empleadoDeleted(nombreCompleto);
      toast.success("Empleado eliminado correctamente", {
        position: "bottom-right",
      });
      if (onDelete) {
        onDelete(empleado.id);
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      const errorMessage = error.response?.data?.error 
        ? (typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error))
        : "Error al eliminar empleado";
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-300 transition-all duration-200 group relative"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-sm">
                {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {empleado.nombre} {empleado.apellido}
              </h3>
              <p className="text-sm text-gray-500">RUT: {formatearRUTParaMostrar(empleado.rut)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCargoColor(empleado.cargo)}`}>
              {empleado.cargo}
            </span>
            
            {empleado.estado && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(empleado.estado)}`}>
                {formatearEstado(empleado.estado)}
              </span>
            )}

            {empleado.tipo_contrato && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {formatearTipoContrato(empleado.tipo_contrato)}
              </span>
            )}
          </div>

          {empleado.departamento && (
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21h16.5M4.5 3h15m-15 18V9.75m15 0V21m-15-11.25h15M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              {empleado.departamento}
            </p>
          )}
          
          {empleado.correo && (
            <p className="text-sm text-gray-600 flex items-center">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {empleado.correo}
            </p>
          )}
          
          {empleado.celular && (
            <p className="text-sm text-gray-600 flex items-center">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              {empleado.celular}
            </p>
          )}

          {empleado.fecha_contratacion && (
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Contratado: {new Date(empleado.fecha_contratacion).toLocaleDateString('es-CL')}
            </p>
          )}

          {empleado.salario && (
            <p className="text-sm text-gray-700 mt-2 flex items-center font-medium">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salario: {formatCurrency(empleado.salario)}
            </p>
          )}
        </div>
        
        <div className="ml-4 flex flex-col items-end gap-2 relative z-20">
          {/* Acciones rápidas */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors relative z-20"
              title="Editar empleado"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
              title="Eliminar empleado"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Estado activo/inactivo */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${empleado.activo ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-500">
              {empleado.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Click para ver detalles */}
      <div 
        className="absolute inset-0 cursor-pointer rounded-xl z-0"
        onClick={() => navigate(`/empleado/${empleado.id}`)}
      ></div>
    </div>
  );
}