import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createTurno, deleteTurno, getTurno, updateTurno } from "../api/turno.api";
import { getAllEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function TurnosFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm();
  
  const horaEntrada = watch("hora_entrada");
  const horaSalida = watch("hora_salida");
  const navigate = useNavigate();
  const params = useParams();
  const [turnoActual, setTurnoActual] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [diasSemana, setDiasSemana] = useState([]);

  const diasSemanaOptions = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  // Referencias para los campos
  const empleadoRef = useRef(null);
  const nombreTurnoRef = useRef(null);
  const horaEntradaRef = useRef(null);
  const horaSalidaRef = useRef(null);
  const toleranciaRef = useRef(null);
  const horasTrabajoRef = useRef(null);
  const descripcionRef = useRef(null);
  const activoRef = useRef(null);
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

  const handleDiaSemanaChange = (dia) => {
    setDiasSemana(prev => {
      const newDias = prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia].sort();
      setValue("dias_semana", newDias);
      return newDias;
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    let hasErrors = false;

    // Validar todos los campos requeridos
    if (!data.empleados_rut || data.empleados_rut.trim() === "") {
      setError("empleados_rut", { 
        type: "manual", 
        message: "El empleado es requerido" 
      });
      hasErrors = true;
    }

    if (!data.nombre_turno || data.nombre_turno.trim() === "") {
      setError("nombre_turno", { 
        type: "manual", 
        message: "El nombre del turno es requerido" 
      });
      hasErrors = true;
    }

    if (!data.hora_entrada || data.hora_entrada.trim() === "") {
      setError("hora_entrada", { 
        type: "manual", 
        message: "La hora de entrada es requerida" 
      });
      hasErrors = true;
    }

    if (!data.hora_salida || data.hora_salida.trim() === "") {
      setError("hora_salida", { 
        type: "manual", 
        message: "La hora de salida es requerida" 
      });
      hasErrors = true;
    }

    // Validar que hora_salida sea posterior a hora_entrada
    if (data.hora_entrada && data.hora_salida) {
      const entrada = new Date(`2000-01-01T${data.hora_entrada}`);
      const salida = new Date(`2000-01-01T${data.hora_salida}`);
      if (salida <= entrada) {
        setError("hora_salida", { 
          type: "manual", 
          message: "La hora de salida debe ser posterior a la hora de entrada" 
        });
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast.error("Por favor completa todos los campos requeridos", {
        position: "bottom-right",
      });
      return;
    }

    try {
      const cleanData = {
        empleados_rut: data.empleados_rut.trim(),
        nombre_turno: data.nombre_turno.trim(),
        hora_entrada: data.hora_entrada,
        hora_salida: data.hora_salida,
        tolerancia_minutos: data.tolerancia_minutos ? parseInt(data.tolerancia_minutos) : 15,
        horas_trabajo: data.horas_trabajo ? parseInt(data.horas_trabajo, 10) : null,
        descripcion: data.descripcion && data.descripcion.trim() !== '' ? data.descripcion.trim() : null,
        dias_semana: diasSemana.length > 0 ? diasSemana : null,
        activo: data.activo !== undefined ? Boolean(data.activo) : true,
      };

      if (params.id) {
        await updateTurno(params.id, cleanData);
        toast.success("Turno actualizado correctamente", {
          position: "bottom-right",
        });
      } else {
        await createTurno(cleanData);
        toast.success("Turno creado correctamente", {
          position: "bottom-right",
        });
      }
      navigate("/turnos");
    } catch (error) {
      console.error("Error al guardar:", error);
      console.error("Error response:", error.response);
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData.detail || JSON.stringify(errorData));
        toast.error("Error: " + errorMessage, {
          position: "bottom-right",
          duration: 5000,
        });
      } else if (error.response?.data?.detail) {
        toast.error("Error: " + error.response.data.detail, {
          position: "bottom-right",
          duration: 5000,
        });
      } else {
        const errorMessage = error.message || "Error al guardar turno";
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
        console.error("Error loading empleados:", error);
      }
    }
    loadEmpleados();
  }, []);

  // Función para calcular horas de trabajo
  const calcularHorasTrabajo = () => {
    if (horaEntrada && horaSalida) {
      try {
        const entrada = new Date(`2000-01-01T${horaEntrada}`);
        const salida = new Date(`2000-01-01T${horaSalida}`);
        
        if (salida > entrada) {
          const diffMs = salida - entrada;
          const diffHrs = diffMs / (1000 * 60 * 60);
          // Restar 1 hora de almuerzo/descanso por defecto
          const horasTrabajo = Math.max(0, diffHrs - 1);
          // Redondear a entero
          return Math.round(horasTrabajo);
        }
      } catch (error) {
        console.error("Error calculando horas:", error);
      }
    }
    return null;
  };

  // Calcular horas de trabajo automáticamente cuando cambian las horas
  useEffect(() => {
    if (horaEntrada && horaSalida) {
      const horasCalculadas = calcularHorasTrabajo();
      if (horasCalculadas !== null) {
        setValue("horas_trabajo", horasCalculadas, { shouldValidate: false });
      }
    } else {
      // Si falta alguna hora, limpiar el campo
      setValue("horas_trabajo", "", { shouldValidate: false });
    }
  }, [horaEntrada, horaSalida, setValue]);

  useEffect(() => {
    async function loadTurno() {
      if (params.id) {
        try {
          const { data } = await getTurno(params.id);
          setTurnoActual(data);
          
          setValue("empleados_rut", data.empleados_rut || "");
          setValue("nombre_turno", data.nombre_turno || "");
          
          // Formatear horas
          const horaEntrada = data.hora_entrada ? data.hora_entrada.slice(0, 5) : '';
          const horaSalida = data.hora_salida ? data.hora_salida.slice(0, 5) : '';
          setValue("hora_entrada", horaEntrada);
          setValue("hora_salida", horaSalida);
          
          setValue("tolerancia_minutos", data.tolerancia_minutos || 15);
          // Convertir horas de trabajo a entero si existe
          const horasTrabajo = data.horas_trabajo ? Math.round(parseFloat(data.horas_trabajo)) : "";
          setValue("horas_trabajo", horasTrabajo);
          setValue("descripcion", data.descripcion || "");
          setValue("activo", data.activo !== undefined ? data.activo : true);
          
          // Cargar días de la semana
          if (data.dias_semana && Array.isArray(data.dias_semana)) {
            setDiasSemana(data.dias_semana);
            setValue("dias_semana", data.dias_semana);
          } else {
            setDiasSemana([]);
            setValue("dias_semana", []);
          }
        } catch (error) {
          toast.error("Error al cargar turno", {
            position: "bottom-right",
          });
        }
      }
    }
    loadTurno();
  }, [params.id, setValue]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id ? 'Editar Turno' : 'Nuevo Turno'}
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          {params.id ? 'Modifica la información del turno' : 'Agrega un nuevo turno al sistema'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-lg border border-gray-200 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empleado */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado <span className="text-red-500">*</span>
            </label>
            <select
              ref={empleadoRef}
              {...register("empleados_rut", { required: "El empleado es requerido" })}
              onKeyDown={(e) => handleFieldKeyDown(e, nombreTurnoRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.empleados_rut ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.rut} value={emp.rut}>
                  {emp.nombre} {emp.apellido} - {formatearRUTParaMostrar(emp.rut)}
                </option>
              ))}
            </select>
            {errors.empleados_rut && (
              <p className="mt-1 text-sm text-red-600">{errors.empleados_rut.message}</p>
            )}
          </div>

          {/* Nombre del Turno */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Turno <span className="text-red-500">*</span>
            </label>
            <input
              ref={nombreTurnoRef}
              type="text"
              placeholder="Ej: Turno Mañana, Turno Tarde, Turno Noche"
              {...register("nombre_turno", { required: "El nombre del turno es requerido" })}
              onKeyDown={(e) => handleFieldKeyDown(e, horaEntradaRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.nombre_turno ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.nombre_turno && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre_turno.message}</p>
            )}
          </div>

          {/* Hora de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Entrada <span className="text-red-500">*</span>
            </label>
            <input
              ref={horaEntradaRef}
              type="time"
              {...register("hora_entrada", { required: "La hora de entrada es requerida" })}
              onKeyDown={(e) => handleFieldKeyDown(e, horaSalidaRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.hora_entrada ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.hora_entrada && (
              <p className="mt-1 text-sm text-red-600">{errors.hora_entrada.message}</p>
            )}
          </div>

          {/* Hora de Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Salida <span className="text-red-500">*</span>
            </label>
            <input
              ref={horaSalidaRef}
              type="time"
              {...register("hora_salida", { required: "La hora de salida es requerida" })}
              onKeyDown={(e) => handleFieldKeyDown(e, toleranciaRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.hora_salida ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.hora_salida && (
              <p className="mt-1 text-sm text-red-600">{errors.hora_salida.message}</p>
            )}
          </div>

          {/* Tolerancia en Minutos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tolerancia (minutos)
            </label>
            <input
              ref={toleranciaRef}
              type="number"
              min="0"
              placeholder="15"
              {...register("tolerancia_minutos")}
              onKeyDown={(e) => handleFieldKeyDown(e, horasTrabajoRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Horas de Trabajo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas de Trabajo
            </label>
            <div className="relative">
              <input
                ref={horasTrabajoRef}
                type="number"
                step="1"
                min="0"
                readOnly
                placeholder="Se calcula automáticamente"
                {...register("horas_trabajo", {
                  setValueAs: (value) => value === "" ? "" : parseInt(value, 10)
                })}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 cursor-not-allowed focus:outline-none"
              />
              {horaEntrada && horaSalida && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Se calcula automáticamente restando 1 hora de almuerzo/descanso.
            </p>
          </div>

          {/* Días de la Semana */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de la Semana
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {diasSemanaOptions.map((dia) => {
                const isSelected = diasSemana.includes(dia.value);
                return (
                  <label
                    key={dia.value}
                    className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleDiaSemanaChange(dia.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{dia.label}</span>
                    {isSelected && (
                      <svg className="absolute top-1 right-1 h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              ref={descripcionRef}
              rows="3"
              placeholder="Descripción opcional del turno..."
              {...register("descripcion")}
              onKeyDown={(e) => handleFieldKeyDown(e, activoRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Activo */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                ref={activoRef}
                type="checkbox"
                {...register("activo")}
                onKeyDown={(e) => handleFieldKeyDown(e, 'submit')}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked={true}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Turno activo
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/turnos")}
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
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar este turno?");
                  if (accepted) {
                    try {
                      await deleteTurno(params.id);
                      toast.success("Turno eliminado correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/turnos");
                    } catch (error) {
                      console.error("Error al eliminar turno:", error);
                      const errorMessage = error.response?.data?.error 
                        ? (typeof error.response.data.error === 'string' 
                            ? error.response.data.error 
                            : JSON.stringify(error.response.data.error))
                        : "Error al eliminar turno";
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
              {params.id ? 'Actualizar' : 'Crear'} Turno
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

