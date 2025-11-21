import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { solicitudesAPI } from "../api/solicitudes.api";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

// Función auxiliar para formatear fechas para mostrar
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    return dateString;
  }
};

export function SolicitudesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const { empleado: empleadoLogueado } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [tiposSolicitud, setTiposSolicitud] = useState([]);
  const [tiposSolicitudCompletos, setTiposSolicitudCompletos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Observar cambios en los campos del formulario
  const fechaInicio = watch("fecha_inicio");
  const fechaFin = watch("fecha_fin");
  const tipoSolicitudId = watch("tipo_solicitud_id");

  const estados = [
    { value: "pendiente", label: "Pendiente" },
    { value: "aprobada", label: "Aprobada" },
    { value: "rechazada", label: "Rechazada" },
    { value: "cancelada", label: "Cancelada" }
  ];

  useEffect(() => {
    loadEmpleados();
    loadTiposSolicitudes();
    if (params.id) {
      loadSolicitud();
    }
  }, [params.id]);
  
  // Prellenar empleado cuando se carguen los empleados y el usuario esté logueado
  useEffect(() => {
    if (!params.id && empleadoLogueado && empleados.length > 0) {
      const empleadoEncontrado = empleados.find(emp => emp.id === empleadoLogueado.id);
      if (empleadoEncontrado) {
        setValue("empleado_id", empleadoLogueado.id);
      }
    }
  }, [empleados, empleadoLogueado, params.id, setValue]);

  const loadEmpleados = async () => {
    try {
      const res = await getAllEmpleado();
      setEmpleados(res.data);
    } catch (error) {
      console.error("Error loading empleados:", error);
    }
  };

  const loadTiposSolicitudes = async () => {
    try {
      const tipos = await solicitudesAPI.getTiposSolicitudes();
      console.log("Tipos de solicitudes recibidos:", tipos);
      
      // Verificar si tipos es un array y tiene datos
      if (Array.isArray(tipos) && tipos.length > 0) {
        // Guardar tipos completos para mostrar información adicional
        setTiposSolicitudCompletos(tipos);
        
        // Mapear los datos de la API al formato esperado por el select
        const tiposMapeados = tipos.map(tipo => ({
          value: tipo.id,
          label: tipo.nombre
        }));
        console.log("Tipos mapeados:", tiposMapeados);
        setTiposSolicitud(tiposMapeados);
      } else {
        // Si no hay datos, usar valores por defecto
        console.warn("No se recibieron tipos de solicitudes, usando valores por defecto");
        setTiposSolicitud([
          { value: 1, label: "Vacaciones" },
          { value: 2, label: "Permiso Personal" },
          { value: 3, label: "Licencia Medica" },
          { value: 4, label: "Permiso Administrativo" },
          { value: 5, label: "Cambio de Turno" },
          { value: 6, label: "Dia Libre" }
        ]);
      }
    } catch (error) {
      console.error("Error loading tipos solicitudes:", error);
      // Si hay error, usar valores por defecto desde la base de datos
      setTiposSolicitud([
        { value: 1, label: "Vacaciones" },
        { value: 2, label: "Permiso Personal" },
        { value: 3, label: "Licencia Medica" },
        { value: 4, label: "Permiso Administrativo" },
        { value: 5, label: "Cambio de Turno" },
        { value: 6, label: "Dia Libre" }
      ]);
    }
  };
  
  // Obtener información del tipo de solicitud seleccionado
  const tipoSolicitudSeleccionado = tiposSolicitudCompletos.find(
    tipo => tipo.id === parseInt(tipoSolicitudId)
  );
  
  // Calcular días solicitados
  const calcularDiasSolicitados = () => {
    if (!fechaInicio || !fechaFin) return null;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (fin < inicio) return null;
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
    return diffDays;
  };
  
  const diasSolicitados = calcularDiasSolicitados();
  
  // Validar días de anticipación
  const validarDiasAnticipacion = (fechaInicio) => {
    if (!fechaInicio || !tipoSolicitudSeleccionado) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicioDate = new Date(fechaInicio);
    fechaInicioDate.setHours(0, 0, 0, 0);
    const diffTime = fechaInicioDate - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diasRequeridos = tipoSolicitudSeleccionado.dias_anticipacion || 0;
    return { diffDays, diasRequeridos, cumple: diffDays >= diasRequeridos };
  };
  
  const validacionAnticipacion = validarDiasAnticipacion(fechaInicio);

  const loadSolicitud = async () => {
    try {
      const data = await solicitudesAPI.getById(params.id);
      
      // Formatear fechas para inputs de tipo date (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        // Si ya está en formato YYYY-MM-DD, retornarlo
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // Si es una fecha ISO completa, extraer solo la parte de la fecha
        if (typeof dateString === 'string' && dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        // Intentar parsear y formatear
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Error formateando fecha:", dateString);
        }
        return dateString;
      };
      
      setValue("empleado_id", data.empleado_id || "");
      setValue("tipo_solicitud_id", data.tipo_solicitud_id || "");
      setValue("fecha_inicio", formatDateForInput(data.fecha_inicio));
      setValue("fecha_fin", formatDateForInput(data.fecha_fin));
      setValue("motivo", data.motivo || "");
      setValue("estado", data.estado || "pendiente");
      setValue("comentario_aprobacion", data.comentario_aprobacion || "");
    } catch (error) {
      console.error("Error loading solicitud:", error);
      toast.error("Error al cargar la solicitud", {
        position: "bottom-right",
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      // Validar que los IDs sean válidos
      const empleadoId = parseInt(data.empleado_id);
      const tipoSolicitudId = parseInt(data.tipo_solicitud_id);
      
      if (isNaN(empleadoId) || empleadoId <= 0) {
        setError("empleado_id", {
          type: "manual",
          message: "Debe seleccionar un empleado válido"
        });
        toast.error("Debe seleccionar un empleado válido", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      if (isNaN(tipoSolicitudId) || tipoSolicitudId <= 0) {
        setError("tipo_solicitud_id", {
          type: "manual",
          message: "Debe seleccionar un tipo de solicitud válido"
        });
        toast.error("Debe seleccionar un tipo de solicitud válido", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      // Limpiar y preparar los datos para enviar
      const formData = {
        empleado_id: empleadoId,
        tipo_solicitud_id: tipoSolicitudId,
        fecha_inicio: data.fecha_inicio || null,
        fecha_fin: data.fecha_fin || null,
        motivo: data.motivo || "",
      };
      
      // Solo incluir estado y comentario_aprobacion si estamos editando
      if (params.id) {
        if (data.estado) {
          formData.estado = data.estado;
        }
        if (data.comentario_aprobacion) {
          formData.comentario_aprobacion = data.comentario_aprobacion;
        }
      } else {
        // Para nuevas solicitudes, establecer estado por defecto
        formData.estado = data.estado || "pendiente";
      }
      
      // Validar campos requeridos
      if (!formData.fecha_inicio) {
        setError("fecha_inicio", {
          type: "manual",
          message: "La fecha de inicio es requerida"
        });
        toast.error("La fecha de inicio es requerida", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      if (!formData.fecha_fin) {
        setError("fecha_fin", {
          type: "manual",
          message: "La fecha de fin es requerida"
        });
        toast.error("La fecha de fin es requerida", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      // Validar que fecha fin sea posterior o igual a fecha inicio
      const fechaInicioDate = new Date(formData.fecha_inicio);
      const fechaFinDate = new Date(formData.fecha_fin);
      if (fechaFinDate < fechaInicioDate) {
        setError("fecha_fin", {
          type: "manual",
          message: "La fecha de fin debe ser posterior o igual a la fecha de inicio"
        });
        toast.error("La fecha de fin debe ser posterior o igual a la fecha de inicio", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      // Validar días de anticipación
      const tipoSeleccionado = tiposSolicitudCompletos.find(
        tipo => tipo.id === tipoSolicitudId
      );
      if (tipoSeleccionado && tipoSeleccionado.dias_anticipacion > 0) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaInicioDate.setHours(0, 0, 0, 0);
        const diffTime = fechaInicioDate - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diasRequeridos = tipoSeleccionado.dias_anticipacion;
        
        if (diffDays < diasRequeridos) {
          setError("fecha_inicio", {
            type: "manual",
            message: `Este tipo de solicitud requiere ${diasRequeridos} día(s) de anticipación. Faltan ${diasRequeridos - diffDays} día(s).`
          });
          toast.error(`Este tipo de solicitud requiere ${diasRequeridos} día(s) de anticipación`, {
            position: "bottom-right",
            duration: 5000,
          });
          setLoading(false);
          return;
        }
      }
      
      if (!formData.motivo || formData.motivo.trim() === "") {
        setError("motivo", {
          type: "manual",
          message: "El motivo es requerido"
        });
        toast.error("El motivo es requerido", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      
      console.log("Datos a enviar:", formData);

      if (params.id) {
        await solicitudesAPI.update(params.id, formData);
        toast.success("Solicitud actualizada correctamente");
      } else {
        await solicitudesAPI.create(formData);
        toast.success("Solicitud creada correctamente");
      }
      navigate("/solicitudes");
    } catch (error) {
      console.error("Error saving solicitud:", error);
      console.error("Error response:", error.response);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log("Error data completo:", errorData);
        
        // Verificar si errorData.error es un objeto con errores de validación por campo
        let validationErrors = null;
        if (errorData.error && typeof errorData.error === 'object' && !Array.isArray(errorData.error)) {
          validationErrors = errorData.error;
        } else if (typeof errorData === 'object' && !errorData.detail && !errorData.error) {
          // Errores de validación de campos (formato Django REST Framework directo)
          validationErrors = errorData;
        }
        
        if (validationErrors) {
          // Errores de validación por campo
          let hasFieldErrors = false;
          Object.keys(validationErrors).forEach((field) => {
            const fieldError = validationErrors[field];
            if (fieldError) {
              hasFieldErrors = true;
              // Manejar arrays de errores o strings simples
              const errorMessage = Array.isArray(fieldError) 
                ? fieldError[0] 
                : (typeof fieldError === 'string' ? fieldError : JSON.stringify(fieldError));
              
              // Mapear nombres de campos del backend al frontend si es necesario
              const fieldName = field === 'empleado_id' ? 'empleado_id' :
                               field === 'tipo_solicitud_id' ? 'tipo_solicitud_id' :
                               field === 'fecha_inicio' ? 'fecha_inicio' :
                               field === 'fecha_fin' ? 'fecha_fin' :
                               field === 'motivo' ? 'motivo' : field;
              
              setError(fieldName, {
                type: "manual",
                message: errorMessage
              });
            }
          });
          
          if (hasFieldErrors) {
            const errorMessages = Object.values(validationErrors)
              .flat()
              .filter(msg => msg)
              .map(msg => Array.isArray(msg) ? msg[0] : msg);
            
            toast.error("Error de validación: " + errorMessages.join(", "), {
              position: "bottom-right",
              duration: 5000,
            });
          } else {
            toast.error("Error al guardar la solicitud", {
              position: "bottom-right",
              duration: 4000,
            });
          }
        } else if (errorData.detail) {
          // Error con campo 'detail'
          const detailMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : (Array.isArray(errorData.detail) 
                ? errorData.detail.join(", ") 
                : JSON.stringify(errorData.detail));
          toast.error("Error: " + detailMsg, {
            position: "bottom-right",
            duration: 5000,
          });
        } else if (errorData.error) {
          // Error con campo 'error' (string o array)
          const errorMsg = typeof errorData.error === 'string' 
            ? errorData.error 
            : (Array.isArray(errorData.error) 
                ? errorData.error.join(", ") 
                : JSON.stringify(errorData.error));
          toast.error("Error: " + errorMsg, {
            position: "bottom-right",
            duration: 5000,
          });
        } else {
          toast.error("Error al guardar la solicitud: " + JSON.stringify(errorData), {
            position: "bottom-right",
            duration: 5000,
          });
        }
      } else {
        const errorMessage = error.message || "Error al guardar la solicitud";
        console.error("Error sin response.data:", error);
        toast.error(errorMessage, {
          position: "bottom-right",
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Editar Solicitud' : 'Nueva Solicitud'}
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          {params.id ? 'Modifica la información de la solicitud' : 'Crea una nueva solicitud de empleado'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-lg border border-gray-200 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información Básica
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              {...register("empleado_id", { required: "El empleado es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.empleado_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
            {errors.empleado_id && (
              <p className="mt-1 text-sm text-red-600">{errors.empleado_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Solicitud *
            </label>
            <select
              {...register("tipo_solicitud_id", { required: "El tipo de solicitud es requerido" })}
              disabled={tiposSolicitud.length === 0}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.tipo_solicitud_id ? 'border-red-300' : 'border-gray-300'
              } ${tiposSolicitud.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {tiposSolicitud.length === 0 ? 'Cargando tipos...' : 'Seleccione un tipo'}
              </option>
              {tiposSolicitud.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo_solicitud_id && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_solicitud_id.message}</p>
            )}
            
            {/* Información del tipo de solicitud seleccionado */}
            {tipoSolicitudSeleccionado && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: tipoSolicitudSeleccionado.color_hex || '#007bff' + '20' }}
                    >
                      <svg className="h-6 w-6" style={{ color: tipoSolicitudSeleccionado.color_hex || '#007bff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Información del tipo de solicitud
                    </h4>
                    {tipoSolicitudSeleccionado.descripcion && (
                      <p className="text-sm text-gray-700 mb-2">
                        {tipoSolicitudSeleccionado.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {tipoSolicitudSeleccionado.dias_anticipacion > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-blue-200 text-blue-700 font-medium">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Requiere {tipoSolicitudSeleccionado.dias_anticipacion} día(s) de anticipación
                        </span>
                      )}
                      {tipoSolicitudSeleccionado.requiere_aprobacion && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-green-200 text-green-700 font-medium">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Requiere aprobación
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register("fecha_inicio", { 
                required: "La fecha de inicio es requerida",
                validate: (value) => {
                  if (!value) return true;
                  const fechaInicioDate = new Date(value);
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  fechaInicioDate.setHours(0, 0, 0, 0);
                  if (fechaInicioDate < hoy) {
                    return "La fecha de inicio no puede ser anterior a hoy";
                  }
                  return true;
                }
              })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha_inicio ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
            )}
            
            {/* Validación de días de anticipación */}
            {validacionAnticipacion && fechaInicio && (
              <div className={`mt-2 p-2 rounded-lg text-xs ${
                validacionAnticipacion.cumple 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                {validacionAnticipacion.cumple ? (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cumple con los días de anticipación requeridos ({validacionAnticipacion.diffDays} día(s) de anticipación)
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Advertencia: Faltan {validacionAnticipacion.diasRequeridos - validacionAnticipacion.diffDays} día(s) para cumplir con la anticipación requerida ({validacionAnticipacion.diasRequeridos} día(s))
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin *
            </label>
            <input
              type="date"
              min={fechaInicio || new Date().toISOString().split('T')[0]}
              {...register("fecha_fin", { 
                required: "La fecha de fin es requerida",
                validate: (value) => {
                  if (!value || !fechaInicio) return true;
                  const fechaInicioDate = new Date(fechaInicio);
                  const fechaFinDate = new Date(value);
                  if (fechaFinDate < fechaInicioDate) {
                    return "La fecha de fin debe ser posterior o igual a la fecha de inicio";
                  }
                  return true;
                }
              })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha_fin ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_fin.message}</p>
            )}
            
            {/* Mostrar días solicitados */}
            {diasSolicitados !== null && fechaInicio && fechaFin && (
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Días solicitados: {diasSolicitados} día{diasSolicitados !== 1 ? 's' : ''}
                    </p>
                    {tipoSolicitudSeleccionado && tipoSolicitudSeleccionado.dias_anticipacion > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        Período: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <textarea
              rows={4}
              placeholder="Describe el motivo de la solicitud..."
              {...register("motivo", { required: "El motivo es requerido" })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.motivo ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.motivo && (
              <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>
            )}
          </div>

          {params.id && (
            <>
              <div className="md:col-span-2 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Gestión de Solicitud
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  {...register("estado", { required: "El estado es requerido" })}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.estado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario de Aprobación/Rechazo
                </label>
                <textarea
                  rows={4}
                  placeholder="Ingresa comentarios sobre la aprobación o rechazo de esta solicitud..."
                  {...register("comentario_aprobacion")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Este comentario será visible para el empleado que realizó la solicitud.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/solicitudes")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            {params.id && (
              <button
                type="button"
                onClick={async () => {
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar esta solicitud?");
                  if (accepted) {
                    try {
                      await solicitudesAPI.delete(params.id);
                      toast.success("Solicitud eliminada correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/solicitudes");
                    } catch (error) {
                      console.error("Error al eliminar solicitud:", error);
                      const errorMessage = error.response?.data?.error 
                        ? (typeof error.response.data.error === 'string' 
                            ? error.response.data.error 
                            : JSON.stringify(error.response.data.error))
                        : error.message || "Error al eliminar solicitud";
                      toast.error(errorMessage, {
                        position: "bottom-right",
                        duration: 4000,
                      });
                    }
                  }
                }}
                className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {params.id ? 'Actualizar' : 'Crear'} Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

