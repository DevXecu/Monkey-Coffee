import { useEffect, useState } from "react";
import { getAllAsistencias, getEstadisticasAsistencia, createAsistencia, updateAsistencia, deleteAsistencia } from "../api/asistencia.api";
import { getAllEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    presentes: 0,
    ausentes: 0,
    tardes: 0,
    total_empleados: 0,
  });
  const [filtros, setFiltros] = useState({
    fecha: new Date().toISOString().split('T')[0],
    empleado_rut: '',
    estado: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [asistenciaEditando, setAsistenciaEditando] = useState(null);
  const [formData, setFormData] = useState({
    empleado_rut: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_entrada: '',
    hora_salida: '',
    tipo_entrada: 'biometrico',
    tipo_salida: 'biometrico',
    estado: 'presente',
    observaciones: '',
  });

  useEffect(() => {
    loadData();
  }, [filtros.fecha]);

  useEffect(() => {
    loadAsistencias();
  }, [filtros]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asistenciasRes, empleadosRes, statsRes] = await Promise.all([
        getAllAsistencias({ fecha: filtros.fecha }).catch(err => {
          console.error('Error loading asistencias:', err);
          return { data: [] };
        }),
        getAllEmpleado().catch(err => {
          console.error('Error loading empleados:', err);
          return { data: [] };
        }),
        getEstadisticasAsistencia(filtros.fecha).catch(err => {
          console.error('Error loading estadisticas:', err);
          return { data: { presentes: 0, ausentes: 0, tardes: 0, total_empleados: 0 } };
        }),
      ]);
      setAsistencias(asistenciasRes.data || []);
      setEmpleados(empleadosRes.data || []);
      setEstadisticas(statsRes.data || { presentes: 0, ausentes: 0, tardes: 0, total_empleados: 0 });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadAsistencias = async () => {
    try {
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.empleado_rut) params.empleado_rut = filtros.empleado_rut;
      if (filtros.estado) params.estado = filtros.estado;
      
      const res = await getAllAsistencias(params);
      setAsistencias(res.data || []);
    } catch (error) {
      console.error('Error loading asistencias:', error);
      toast.error('Error al cargar las asistencias: ' + (error.response?.data?.error || error.message));
      setAsistencias([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        hora_entrada: formData.hora_entrada ? `${formData.fecha}T${formData.hora_entrada}:00` : null,
        hora_salida: formData.hora_salida ? `${formData.fecha}T${formData.hora_salida}:00` : null,
      };

      if (asistenciaEditando) {
        await updateAsistencia(asistenciaEditando.id, data);
        toast.success("Asistencia actualizada correctamente", {
          position: "bottom-right",
        });
      } else {
        await createAsistencia(data);
        toast.success("Asistencia registrada correctamente", {
          position: "bottom-right",
        });
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
      const errorMessage = error.response?.data?.error 
        ? (typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error))
        : "Error al guardar la asistencia";
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 4000,
      });
    }
  };

  const handleEdit = (asistencia) => {
    console.log('handleEdit called with:', asistencia);
    try {
      setAsistenciaEditando(asistencia);
      const horaEntrada = asistencia.hora_entrada ? new Date(asistencia.hora_entrada).toTimeString().slice(0, 5) : '';
      const horaSalida = asistencia.hora_salida ? new Date(asistencia.hora_salida).toTimeString().slice(0, 5) : '';
      
      setFormData({
        empleado_rut: asistencia.empleado_rut,
        fecha: asistencia.fecha,
        hora_entrada: horaEntrada,
        hora_salida: horaSalida,
        tipo_entrada: asistencia.tipo_entrada,
        tipo_salida: asistencia.tipo_salida,
        estado: asistencia.estado,
        observaciones: asistencia.observaciones || '',
      });
      setShowModal(true);
      console.log('Modal should be open now');
    } catch (error) {
      console.error('Error in handleEdit:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log('handleDelete called with id:', id);
    try {
      const accepted = window.confirm("¿Estás seguro de que quieres eliminar esta asistencia?");
      if (!accepted) {
        console.log('Delete cancelled by user');
        return;
      }
      
      console.log('Deleting asistencia with id:', id);
      await deleteAsistencia(id);
      toast.success("Asistencia eliminada correctamente", {
        position: "bottom-right",
      });
      loadData();
    } catch (error) {
      console.error("Error al eliminar asistencia:", error);
      const errorMessage = error.response?.data?.error 
        ? (typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error))
        : "Error al eliminar la asistencia";
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 4000,
      });
    }
  };

  const resetForm = () => {
    setAsistenciaEditando(null);
    setFormData({
      empleado_rut: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_entrada: '',
      hora_salida: '',
      tipo_entrada: 'biometrico',
      tipo_salida: 'biometrico',
      estado: 'presente',
      observaciones: '',
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800';
      case 'tarde':
        return 'bg-yellow-100 text-yellow-800';
      case 'ausente':
        return 'bg-red-100 text-red-800';
      case 'justificado':
        return 'bg-blue-100 text-blue-800';
      case 'permiso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      presente: 'Presente',
      tarde: 'Tarde',
      ausente: 'Ausente',
      justificado: 'Justificado',
      permiso: 'Permiso',
    };
    return labels[estado] || estado;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-gray-600">Gestiona y registra la asistencia de empleados</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            console.log('Registrar Asistencia button clicked');
            e.preventDefault();
            e.stopPropagation();
            resetForm();
            setShowModal(true);
            console.log('Modal should be open');
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Asistencia
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Presentes Hoy</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{estadisticas.presentes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ausentes</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{estadisticas.ausentes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tardanzas</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{estadisticas.tardes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Empleados</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{estadisticas.total_empleados}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="empleado" className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <select
              id="empleado"
              value={filtros.empleado_rut}
              onChange={(e) => setFiltros({ ...filtros, empleado_rut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los empleados</option>
              {empleados.map((emp) => (
                <option key={emp.rut} value={emp.rut}>
                  {emp.nombre} {emp.apellido} - {formatearRUTParaMostrar(emp.rut)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="estado"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="presente">Presente</option>
              <option value="tarde">Tarde</option>
              <option value="ausente">Ausente</option>
              <option value="justificado">Justificado</option>
              <option value="permiso">Permiso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Salida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Trabajadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistencias.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros de asistencia para esta fecha
                  </td>
                </tr>
              ) : (
                asistencias.map((asistencia) => (
                  <tr key={asistencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asistencia.empleado_nombre} {asistencia.empleado_apellido}
                      </div>
                      <div className="text-sm text-gray-500">{formatearRUTParaMostrar(asistencia.empleado_rut)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(asistencia.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(asistencia.hora_entrada)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(asistencia.hora_salida)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asistencia.horas_trabajadas || '-'} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(asistencia.estado)}`}>
                        {getEstadoLabel(asistencia.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            console.log('Edit button clicked');
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Calling handleEdit with:', asistencia);
                            handleEdit(asistencia);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            console.log('Delete button clicked');
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Calling handleDelete with id:', asistencia.id);
                            handleDelete(asistencia.id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {asistenciaEditando ? 'Editar Asistencia' : 'Registrar Asistencia'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Empleado</label>
                      <select
                        required
                        value={formData.empleado_rut}
                        onChange={(e) => setFormData({ ...formData, empleado_rut: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Seleccione un empleado</option>
                        {empleados.map((emp) => (
                          <option key={emp.rut} value={emp.rut}>
                            {emp.nombre} {emp.apellido} - {formatearRUTParaMostrar(emp.rut)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha</label>
                      <input
                        type="date"
                        required
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Entrada</label>
                        <input
                          type="time"
                          value={formData.hora_entrada}
                          onChange={(e) => setFormData({ ...formData, hora_entrada: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hora Salida</label>
                        <input
                          type="time"
                          value={formData.hora_salida}
                          onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        required
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="presente">Presente</option>
                        <option value="tarde">Tarde</option>
                        <option value="ausente">Ausente</option>
                        <option value="justificado">Justificado</option>
                        <option value="permiso">Permiso</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {asistenciaEditando ? 'Actualizar' : 'Registrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
