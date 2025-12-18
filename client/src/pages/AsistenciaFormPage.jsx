import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createAsistencia, deleteAsistencia, getAsistencia, updateAsistencia } from "../api/asistencia.api";
import { getAllEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { ActivityLogger } from "../utils/activityLogger";
import { limpiarRUT } from "../utils/rutUtils";

export function AsistenciaFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [asistenciaActual, setAsistenciaActual] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  
  // Referencias para los campos
  const empleadoRef = useRef(null);
  const fechaRef = useRef(null);
  const horaEntradaRef = useRef(null);
  const horaSalidaRef = useRef(null);
  const tipoEntradaRef = useRef(null);
  const tipoSalidaRef = useRef(null);
  const estadoRef = useRef(null);
  const minutosTardeRef = useRef(null);
  const minutosExtrasRef = useRef(null);
  const observacionesRef = useRef(null);
  const ubicacionEntradaRef = useRef(null);
  const ubicacionSalidaRef = useRef(null);
  const ipEntradaRef = useRef(null);
  const ipSalidaRef = useRef(null);
  const submitButtonRef = useRef(null);

  const handleFieldKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === 'submit') {
        submitButtonRef.current?.click();
      } else {
        nextRef.current?.focus();
      }
    }
  };

  const calcularHorasTrabajadas = (horaEntrada, horaSalida) => {
    if (!horaEntrada || !horaSalida) return null;
    
    const entrada = new Date(horaEntrada);
    const salida = new Date(horaSalida);
    
    if (salida <= entrada) return null;
    
    const diferencia = salida - entrada;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    // Redondear a horas completas
    return horas + (minutos >= 30 ? 1 : 0);
  };

  const onSubmit = handleSubmit(async (data) => {
    let hasErrors = false;

    // Validar todos los campos requeridos
    if (!data.empleado_rut || data.empleado_rut.trim() === "") {
      setError("empleado_rut", { 
        type: "manual", 
        message: "El empleado es requerido" 
      });
      hasErrors = true;
    }

    if (!data.fecha || data.fecha.trim() === "") {
      setError("fecha", { 
        type: "manual", 
        message: "La fecha es requerida" 
      });
      hasErrors = true;
    }

    // Validar que si hay hora_salida, debe ser después de hora_entrada
    if (data.hora_entrada && data.hora_salida) {
      const entrada = new Date(data.hora_entrada);
      const salida = new Date(data.hora_salida);
      
      if (salida <= entrada) {
        setError("hora_salida", { 
          type: "manual", 
          message: "La hora de salida debe ser posterior a la hora de entrada" 
        });
        hasErrors = true;
      }
    }

    // Si hay errores, detener el envío
    if (hasErrors) {
      toast.error("Por favor completa todos los campos requeridos correctamente", {
        position: "bottom-right",
      });
      return;
    }

    try {
      // Preparar datos para enviar al backend
      const cleanData = {
        empleado_rut: limpiarRUT(data.empleado_rut),
        fecha: data.fecha || new Date().toISOString().split('T')[0],
      };
      
      // Hora de entrada (DateTimeField)
      if (data.hora_entrada) {
        // Si solo tiene fecha, combinar con hora
        const fechaEntrada = data.fecha || cleanData.fecha;
        const horaEntrada = data.hora_entrada.includes('T') 
          ? data.hora_entrada 
          : `${fechaEntrada}T${data.hora_entrada}:00`;
        cleanData.hora_entrada = horaEntrada;
      }
      
      // Hora de salida (DateTimeField)
      if (data.hora_salida) {
        const fechaSalida = data.fecha || cleanData.fecha;
        const horaSalida = data.hora_salida.includes('T') 
          ? data.hora_salida 
          : `${fechaSalida}T${data.hora_salida}:00`;
        cleanData.hora_salida = horaSalida;
      }
      
      // Calcular horas trabajadas si hay entrada y salida (en horas enteras según BD)
      if (cleanData.hora_entrada && cleanData.hora_salida) {
        const horasCalculadas = calcularHorasTrabajadas(
          cleanData.hora_entrada,
          cleanData.hora_salida
        );
        if (horasCalculadas !== null) {
          cleanData.horas_trabajadas = horasCalculadas;
        }
      }
      
      // Campos opcionales
      if (data.tipo_entrada && data.tipo_entrada !== '') {
        cleanData.tipo_entrada = data.tipo_entrada;
      } else {
        cleanData.tipo_entrada = 'manual';
      }
      
      if (data.tipo_salida && data.tipo_salida !== '') {
        cleanData.tipo_salida = data.tipo_salida;
      } else {
        cleanData.tipo_salida = 'manual';
      }
      
      if (data.estado && data.estado !== '') {
        cleanData.estado = data.estado;
      } else {
        cleanData.estado = 'presente';
      }
      
      if (data.minutos_tarde !== undefined && data.minutos_tarde !== null && data.minutos_tarde !== '') {
        cleanData.minutos_tarde = parseInt(data.minutos_tarde) || 0;
      } else {
        cleanData.minutos_tarde = 0;
      }
      
      if (data.minutos_extras !== undefined && data.minutos_extras !== null && data.minutos_extras !== '') {
        cleanData.minutos_extras = parseInt(data.minutos_extras) || 0;
      } else {
        cleanData.minutos_extras = 0;
      }
      
      if (data.observaciones && data.observaciones.trim() !== '') {
        cleanData.observaciones = data.observaciones.trim();
      }
      
      if (data.ubicacion_entrada && data.ubicacion_entrada.trim() !== '') {
        cleanData.ubicacion_entrada = data.ubicacion_entrada.trim();
      }
      
      if (data.ubicacion_salida && data.ubicacion_salida.trim() !== '') {
        cleanData.ubicacion_salida = data.ubicacion_salida.trim();
      }
      
      // Campos de IP (opcionales, pueden capturarse automáticamente)
      if (data.ip_entrada && data.ip_entrada.trim() !== '') {
        cleanData.ip_entrada = data.ip_entrada.trim();
      }
      
      if (data.ip_salida && data.ip_salida.trim() !== '') {
        cleanData.ip_salida = data.ip_salida.trim();
      }
      
      const empleado = empleados.find(e => limpiarRUT(e.rut) === cleanData.empleado_rut);
      const nombreEmpleado = empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado';
      
      if (params.id) {
        await updateAsistencia(params.id, cleanData);
        ActivityLogger.asistenciaUpdated(nombreEmpleado);
        toast.success("Asistencia actualizada correctamente", {
          position: "bottom-right",
        });
      } else {
        await createAsistencia(cleanData);
        ActivityLogger.asistenciaCreated(nombreEmpleado);
        toast.success("Asistencia creada correctamente", {
          position: "bottom-right",
        });
      }
      navigate("/asistencia");
    } catch (error) {
      console.error("Error al guardar:", error);
      console.error("Error response:", error.response);
      
      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        // Error de validación
        if (errorData.empleado_rut) {
          setError("empleado_rut", { 
            type: "manual", 
            message: Array.isArray(errorData.empleado_rut) 
              ? errorData.empleado_rut[0] 
              : errorData.empleado_rut
          });
        }
        
        if (errorData.hora_salida) {
          setError("hora_salida", { 
            type: "manual", 
            message: Array.isArray(errorData.hora_salida) 
              ? errorData.hora_salida[0] 
              : errorData.hora_salida
          });
        }
        
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData.detail || JSON.stringify(errorData));
        toast.error("Error de validación: " + errorMessage, {
          position: "bottom-right",
          duration: 5000,
        });
      } else if (error.response?.data?.detail) {
        toast.error("Error: " + error.response.data.detail, {
          position: "bottom-right",
          duration: 5000,
        });
      } else {
        const errorMessage = error.message || "Error al guardar asistencia";
        toast.error(errorMessage, {
          position: "bottom-right",
          duration: 4000,
        });
      }
    }
  });

  useEffect(() => {
    async function loadEmpleados() {
      try {
        const res = await getAllEmpleado();
        setEmpleados(res.data);
      } catch (error) {
        console.error('Error loading empleados:', error);
      }
    }
    loadEmpleados();
  }, []);

  useEffect(() => {
    async function loadAsistencia() {
      if (params.id) {
        try {
          const { data } = await getAsistencia(params.id);
          setAsistenciaActual(data);
          
          // Formatear RUT del empleado
          setValue("empleado_rut", data.empleado_rut || data.empleado_rut_display || "");
          
          // Formatear fecha
          if (data.fecha) {
            setValue("fecha", data.fecha);
          }
          
          // Formatear hora de entrada (DateTimeField -> datetime-local)
          // El backend envía fechas en formato ISO sin timezone (ej: 2024-01-01T15:00:00)
          // Estas fechas están guardadas tal como aparecen en la BD, así que extraemos
          // la fecha y hora directamente del string tal como está
          if (data.hora_entrada) {
            // Si viene como string ISO, extraer fecha y hora directamente
            if (typeof data.hora_entrada === 'string' && data.hora_entrada.includes('T')) {
              // Formato: 2024-01-01T15:00:00 (sin timezone)
              // Extraer fecha y hora directamente del string tal como está en BD
              const match = data.hora_entrada.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)?/);
              if (match) {
                const fechaLocal = `${match[1]}T${match[2]}:${match[3]}`;
                setValue("hora_entrada", fechaLocal);
              } else {
                // Si no coincide, usar Date pero con timeZone explícito de Chile
                const fechaEntrada = new Date(data.hora_entrada);
                const fechaLocalStr = fechaEntrada.toLocaleString('es-CL', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'America/Santiago'
                });
                const [fechaPart, horaPart] = fechaLocalStr.split(', ');
                const [day, month, year] = fechaPart.split('/');
                const fechaLocal = `${year}-${month}-${day}T${horaPart}`;
                setValue("hora_entrada", fechaLocal);
              }
            } else {
              // Si no es string, usar Date con timeZone explícito de Chile
              const fechaEntrada = new Date(data.hora_entrada);
              const fechaLocalStr = fechaEntrada.toLocaleString('es-CL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Santiago'
              });
              const [fechaPart, horaPart] = fechaLocalStr.split(', ');
              const [day, month, year] = fechaPart.split('/');
              const fechaLocal = `${year}-${month}-${day}T${horaPart}`;
              setValue("hora_entrada", fechaLocal);
            }
          }
          
          // Formatear hora de salida (DateTimeField -> datetime-local)
          if (data.hora_salida) {
            // Si viene como string ISO, extraer fecha y hora directamente
            if (typeof data.hora_salida === 'string' && data.hora_salida.includes('T')) {
              // Formato: 2024-01-01T15:00:00 (sin timezone)
              // Extraer fecha y hora directamente del string tal como está en BD
              const match = data.hora_salida.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)?/);
              if (match) {
                const fechaLocal = `${match[1]}T${match[2]}:${match[3]}`;
                setValue("hora_salida", fechaLocal);
              } else {
                // Si no coincide, usar Date pero con timeZone explícito de Chile
                const fechaSalida = new Date(data.hora_salida);
                const fechaLocalStr = fechaSalida.toLocaleString('es-CL', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'America/Santiago'
                });
                const [fechaPart, horaPart] = fechaLocalStr.split(', ');
                const [day, month, year] = fechaPart.split('/');
                const fechaLocal = `${year}-${month}-${day}T${horaPart}`;
                setValue("hora_salida", fechaLocal);
              }
            } else {
              // Si no es string, usar Date con timeZone explícito de Chile
              const fechaSalida = new Date(data.hora_salida);
              const fechaLocalStr = fechaSalida.toLocaleString('es-CL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Santiago'
              });
              const [fechaPart, horaPart] = fechaLocalStr.split(', ');
              const [day, month, year] = fechaPart.split('/');
              const fechaLocal = `${year}-${month}-${day}T${horaPart}`;
              setValue("hora_salida", fechaLocal);
            }
          }
          
          setValue("tipo_entrada", data.tipo_entrada || "manual");
          setValue("tipo_salida", data.tipo_salida || "manual");
          setValue("estado", data.estado || "presente");
          setValue("minutos_tarde", data.minutos_tarde || 0);
          setValue("minutos_extras", data.minutos_extras || 0);
          setValue("observaciones", data.observaciones || "");
          setValue("ubicacion_entrada", data.ubicacion_entrada || "");
          setValue("ubicacion_salida", data.ubicacion_salida || "");
          setValue("ip_entrada", data.ip_entrada || "");
          setValue("ip_salida", data.ip_salida || "");
        } catch (error) {
          toast.error("Error al cargar asistencia", {
            position: "bottom-right",
          });
        }
      }
    }
    loadAsistencia();
  }, [params.id, setValue]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Editar Asistencia' : 'Nueva Asistencia'}
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          {params.id ? 'Modifica la información de la asistencia' : 'Registra una nueva asistencia de empleado'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-lg border border-gray-200 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empleado */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              ref={empleadoRef}
              {...register("empleado_rut", { required: "El empleado es requerido" })}
              onKeyDown={(e) => handleFieldKeyDown(e, fechaRef)}
              disabled={!!params.id}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.empleado_rut ? 'border-red-300' : 'border-gray-300'
              } ${params.id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              autoFocus={!params.id}
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.rut}>
                  {empleado.nombre} {empleado.apellido} - {empleado.rut}
                </option>
              ))}
            </select>
            {errors.empleado_rut && (
              <p className="mt-1 text-sm text-red-600">{errors.empleado_rut.message}</p>
            )}
            {params.id && (
              <p className="mt-1 text-sm text-gray-500">
                El empleado no puede ser modificado
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              ref={fechaRef}
              type="date"
              {...register("fecha", { required: "La fecha es requerida" })}
              onKeyDown={(e) => handleFieldKeyDown(e, horaEntradaRef)}
              disabled={!!params.id}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha ? 'border-red-300' : 'border-gray-300'
              } ${params.id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
            )}
            {params.id && (
              <p className="mt-1 text-sm text-gray-500">
                La fecha no puede ser modificada
              </p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              ref={estadoRef}
              {...register("estado")}
              onKeyDown={(e) => handleFieldKeyDown(e, tipoEntradaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="presente">Presente</option>
              <option value="tarde">Tarde</option>
              <option value="ausente">Ausente</option>
              <option value="justificado">Justificado</option>
              <option value="permiso">Permiso</option>
            </select>
          </div>

          {/* Separador - Horarios */}
          <div className="md:col-span-2 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horarios
            </h3>
          </div>

          {/* Hora de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Entrada
            </label>
            <input
              ref={horaEntradaRef}
              type="datetime-local"
              {...register("hora_entrada")}
              onKeyDown={(e) => handleFieldKeyDown(e, horaSalidaRef)}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.hora_entrada ? 'border-red-300' : ''
              }`}
            />
            {errors.hora_entrada && (
              <p className="mt-1 text-sm text-red-600">{errors.hora_entrada.message}</p>
            )}
          </div>

          {/* Hora de Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Salida
            </label>
            <input
              ref={horaSalidaRef}
              type="datetime-local"
              {...register("hora_salida")}
              onKeyDown={(e) => handleFieldKeyDown(e, tipoEntradaRef)}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.hora_salida ? 'border-red-300' : ''
              }`}
            />
            {errors.hora_salida && (
              <p className="mt-1 text-sm text-red-600">{errors.hora_salida.message}</p>
            )}
          </div>

          {/* Separador - Tipo de Registro */}
          <div className="md:col-span-2 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tipo de Registro
            </h3>
          </div>

          {/* Tipo de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Entrada
            </label>
            <select
              ref={tipoEntradaRef}
              {...register("tipo_entrada")}
              onKeyDown={(e) => handleFieldKeyDown(e, tipoSalidaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="biometrico">Biométrico</option>
              <option value="manual">Manual</option>
              <option value="app_movil">App Móvil</option>
            </select>
          </div>

          {/* Tipo de Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Salida
            </label>
            <select
              ref={tipoSalidaRef}
              {...register("tipo_salida")}
              onKeyDown={(e) => handleFieldKeyDown(e, minutosTardeRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="biometrico">Biométrico</option>
              <option value="manual">Manual</option>
              <option value="app_movil">App Móvil</option>
            </select>
          </div>

          {/* Separador - Tiempos */}
          <div className="md:col-span-2 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tiempos
            </h3>
          </div>

          {/* Minutos Tarde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutos Tarde
            </label>
            <input
              ref={minutosTardeRef}
              type="number"
              min="0"
              placeholder="0"
              {...register("minutos_tarde")}
              onKeyDown={(e) => handleFieldKeyDown(e, minutosExtrasRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Minutos Extras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minutos Extras
            </label>
            <input
              ref={minutosExtrasRef}
              type="number"
              min="0"
              placeholder="0"
              {...register("minutos_extras")}
              onKeyDown={(e) => handleFieldKeyDown(e, ubicacionEntradaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Separador - Ubicación */}
          <div className="md:col-span-2 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación
            </h3>
          </div>

          {/* Ubicación Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación Entrada
            </label>
            <input
              ref={ubicacionEntradaRef}
              type="text"
              placeholder="Ej: Sucursal Centro"
              {...register("ubicacion_entrada")}
              onKeyDown={(e) => handleFieldKeyDown(e, ubicacionSalidaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Ubicación Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación Salida
            </label>
            <input
              ref={ubicacionSalidaRef}
              type="text"
              placeholder="Ej: Sucursal Centro"
              {...register("ubicacion_salida")}
              onKeyDown={(e) => handleFieldKeyDown(e, ipEntradaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Separador - Información de Red */}
          <div className="md:col-span-2 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Información de Red
            </h3>
          </div>

          {/* IP Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Entrada
            </label>
            <input
              ref={ipEntradaRef}
              type="text"
              placeholder="Ej: 192.168.1.1"
              {...register("ip_entrada")}
              onKeyDown={(e) => handleFieldKeyDown(e, ipSalidaRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se captura automáticamente si se deja vacío
            </p>
          </div>

          {/* IP Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Salida
            </label>
            <input
              ref={ipSalidaRef}
              type="text"
              placeholder="Ej: 192.168.1.1"
              {...register("ip_salida")}
              onKeyDown={(e) => handleFieldKeyDown(e, observacionesRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se captura automáticamente si se deja vacío
            </p>
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              ref={observacionesRef}
              rows="3"
              placeholder="Notas adicionales sobre la asistencia..."
              {...register("observaciones")}
              onKeyDown={(e) => handleFieldKeyDown(e, 'submit')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/asistencia")}
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
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar esta asistencia?");
                  if (accepted) {
                    try {
                      await deleteAsistencia(params.id);
                      if (asistenciaActual) {
                        ActivityLogger.asistenciaDeleted(
                          asistenciaActual.empleado_nombre || 'Asistencia'
                        );
                      }
                      toast.success("Asistencia eliminada correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/asistencia");
                    } catch (error) {
                      console.error("Error al eliminar asistencia:", error);
                      const errorMessage = error.response?.data?.error 
                        ? (typeof error.response.data.error === 'string' 
                            ? error.response.data.error 
                            : JSON.stringify(error.response.data.error))
                        : "Error al eliminar asistencia";
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
              ref={submitButtonRef}
              type="submit"
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {params.id ? 'Actualizar' : 'Crear'} Asistencia
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

