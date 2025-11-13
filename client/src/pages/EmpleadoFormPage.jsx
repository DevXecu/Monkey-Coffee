import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createEmpleado, deleteEmpleado, getEmpleado, updateEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { ActivityLogger } from "../utils/activityLogger";
import { formatearRUT, formatearRUTCompleto, validarRUT, limpiarRUT } from "../utils/rutUtils";

export function EmpleadoFormPage() {
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
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [rutValue, setRutValue] = useState("");
  const [nombreValue, setNombreValue] = useState("");
  const [apellidoValue, setApellidoValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [celularValue, setCelularValue] = useState("");
  
  // Referencias para los campos
  const rutRef = useRef(null);
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const fechaNacimientoRef = useRef(null);
  const direccionRef = useRef(null);
  const cargoRef = useRef(null);
  const departamentoRef = useRef(null);
  const fechaContratacionRef = useRef(null);
  const salarioRef = useRef(null);
  const tipoContratoRef = useRef(null);
  const estadoRef = useRef(null);
  const correoRef = useRef(null);
  const celularRef = useRef(null);
  const passwordRef = useRef(null);
  const observacionesRef = useRef(null);
  const activoRef = useRef(null);
  const submitButtonRef = useRef(null);

  const capitalizarTexto = (texto) => {
    return texto
      .split(' ')
      .map(palabra => {
        if (palabra.length === 0) return palabra;
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const handleNombreChange = (e) => {
    const capitalizado = capitalizarTexto(e.target.value);
    setNombreValue(capitalizado);
    setValue("nombre", capitalizado);
  };

  const handleApellidoChange = (e) => {
    const capitalizado = capitalizarTexto(e.target.value);
    setApellidoValue(capitalizado);
    setValue("apellido", capitalizado);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    setValue("password", value);
    setShowPasswordValidation(value.length > 0);
  };

  // Función para limpiar el número de celular (remover +56, espacios, etc.)
  const limpiarCelular = (celular) => {
    if (!celular) return "";
    // Remover +56, espacios, guiones y otros caracteres no numéricos
    return celular.replace(/\+56|\s|-/g, '').replace(/[^0-9]/g, '');
  };

  // Función para formatear el número de celular chileno (solo los 8 dígitos después del 9)
  const formatearCelularChileno = (numero) => {
    const limpiado = limpiarCelular(numero);
    
    // Si está vacío, retornar vacío
    if (!limpiado) return "";
    
    // Remover el 9 inicial si existe (ya que el prefijo lo incluye)
    let numeroSin9 = limpiado.startsWith('9') ? limpiado.substring(1) : limpiado;
    
    // Limitar a 8 dígitos (después del 9)
    if (numeroSin9.length > 8) {
      numeroSin9 = numeroSin9.substring(0, 8);
    }
    
    // Formatear: 1234 5678
    if (numeroSin9.length === 0) {
      return "";
    } else if (numeroSin9.length <= 4) {
      // Para 1-4 dígitos: "1", "12", "123", "1234"
      return numeroSin9;
    } else {
      // Para más de 4 dígitos: "1234 5", "1234 56", etc.
      return `${numeroSin9.substring(0, 4)} ${numeroSin9.substring(4)}`;
    }
  };

  const handleCelularChange = (e) => {
    const inputValue = e.target.value;
    
    // Limpiar y formatear el número (solo los 8 dígitos después del 9)
    const limpiado = limpiarCelular(inputValue);
    const formateado = formatearCelularChileno(limpiado);
    
    setCelularValue(formateado);
    
    // Guardar el valor completo con +56 9 para el formulario
    const valorCompleto = formateado ? `+56 9${formateado.replace(/\s/g, '')}` : "";
    setValue("celular", valorCompleto);
  };

  const handleCelularKeyDown = (e) => {
    // Permitir solo números y teclas de control
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    
    // Manejar Enter para navegar al siguiente campo
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFieldKeyDown(e, direccionRef);
    }
  };

  const handleCelularFocus = (e) => {
    // Colocar el cursor al final del texto si hay contenido
    if (celularValue) {
      setTimeout(() => {
        e.target.setSelectionRange(celularValue.length, celularValue.length);
      }, 0);
    }
  };

  const validarPassword = (password) => {
    return {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%]/.test(password)
    };
  };

  const esPasswordSegura = (password) => {
    const validacion = validarPassword(password);
    return validacion.length && validacion.uppercase && validacion.number && validacion.special;
  };

  const handleRutChange = (e) => {
    const inputValue = e.target.value;
    // Permitir solo números mientras escribe
    const cleaned = inputValue.replace(/[^0-9]/g, '');
    
    // Limitar estrictamente a 8 dígitos (sin DV)
    const limited = cleaned.substring(0, 8);
    
    if (limited.length <= 8) {
      const formatted = formatearRUT(limited);
      setRutValue(formatted);
      setValue("rut", formatted);
      clearErrors("rut");
    }
  };

  const handleRutComplete = () => {
    if (rutValue && !rutValue.includes('-')) {
      const cleaned = rutValue.replace(/[^0-9]/g, '');
      // Limitar a máximo 8 dígitos antes de calcular el DV
      const limited = cleaned.substring(0, 8);
      
      if (limited.length >= 7) { // Mínimo 7 dígitos para calcular DV
        const formatted = formatearRUTCompleto(limited);
        setRutValue(formatted);
        setValue("rut", formatted);
        
        // Validar el RUT completo
        if (validarRUT(formatted)) {
          clearErrors("rut");
        } else {
          setError("rut", { 
            type: "manual", 
            message: "RUT inválido" 
          });
        }
      }
    }
  };

  const handleRutKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRutComplete();
      nombreRef.current?.focus();
    }
  };

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

  const onSubmit = handleSubmit(async (data) => {
    let hasErrors = false;

    // Validar todos los campos y acumular errores
    if (!rutValue || rutValue.trim() === "") {
      setError("rut", { 
        type: "manual", 
        message: "El RUT es requerido" 
      });
      hasErrors = true;
    } else if (!validarRUT(rutValue)) {
      setError("rut", { 
        type: "manual", 
        message: "El RUT ingresado no es válido" 
      });
      hasErrors = true;
    }

    if (!nombreValue || nombreValue.trim() === "") {
      setError("nombre", { 
        type: "manual", 
        message: "El nombre es requerido" 
      });
      hasErrors = true;
    }
    
    if (!apellidoValue || apellidoValue.trim() === "") {
      setError("apellido", { 
        type: "manual", 
        message: "Los apellidos son requeridos" 
      });
      hasErrors = true;
    }

    if (!data.cargo || data.cargo.trim() === "") {
      setError("cargo", { 
        type: "manual", 
        message: "El cargo es requerido" 
      });
      hasErrors = true;
    }

    if (!data.fecha_contratacion || data.fecha_contratacion.trim() === "") {
      setError("fecha_contratacion", { 
        type: "manual", 
        message: "La fecha de contratación es requerida" 
      });
      hasErrors = true;
    }

    // Validar contraseña si es nuevo empleado
    if (!params.id) {
      if (!passwordValue || passwordValue.trim() === "") {
        setError("password", { 
          type: "manual", 
          message: "La contraseña es requerida" 
        });
        hasErrors = true;
      } else if (!esPasswordSegura(passwordValue)) {
        setError("password", { 
          type: "manual", 
          message: "La contraseña no cumple con los requisitos de seguridad" 
        });
        hasErrors = true;
      }
    } else if (params.id && passwordValue && passwordValue.trim() !== "") {
      // Si está editando y hay contraseña, validarla
      if (!esPasswordSegura(passwordValue)) {
        setError("password", { 
          type: "manual", 
          message: "La contraseña no cumple con los requisitos de seguridad" 
        });
        hasErrors = true;
      }
    }

    // Si hay errores, detener el envío
    if (hasErrors) {
      toast.error("Por favor completa todos los campos requeridos", {
        position: "bottom-right",
      });
      return;
    }

    try {
      // Usar los valores del estado para nombre y apellido
      const nombreCompleto = `${nombreValue} ${apellidoValue}`;
      
      // Preparar datos para enviar al backend
      // El modelo Django espera: nombre, apellido, correo, celular
      // La BD MySQL tiene: nombres, apellidos, email, telefono
      // Django hace el mapeo automáticamente con db_column
      const cleanData = {
        rut: limpiarRUT(rutValue),
        nombre: nombreValue.trim(),
        apellido: apellidoValue.trim(),
        cargo: data.cargo?.trim() || '',
        fecha_contratacion: data.fecha_contratacion || null,
      };
      
      // Limpiar campos de fecha
      if (data.fecha_nacimiento && data.fecha_nacimiento !== '') {
        cleanData.fecha_nacimiento = data.fecha_nacimiento;
      } else {
        cleanData.fecha_nacimiento = null;
      }
      
      if (data.fecha_termino && data.fecha_termino !== '') {
        cleanData.fecha_termino = data.fecha_termino;
      } else {
        cleanData.fecha_termino = null;
      }
      
      // Limpiar campos de texto opcionales
      if (data.direccion && data.direccion.trim() !== '') {
        cleanData.direccion = data.direccion.trim();
      } else {
        cleanData.direccion = null;
      }
      
      if (data.departamento && data.departamento.trim() !== '') {
        cleanData.departamento = data.departamento.trim();
      } else {
        cleanData.departamento = null;
      }
      
      if (data.correo && data.correo.trim() !== '') {
        cleanData.correo = data.correo.trim();
      } else {
        cleanData.correo = null;
      }
      
      // Limpiar y formatear celular antes de enviar
      if (data.celular && data.celular !== '') {
        const celularLimpio = limpiarCelular(data.celular);
        if (celularLimpio) {
          // Asegurar que empiece con 9
          const numeroCompleto = celularLimpio.startsWith('9') ? celularLimpio : '9' + celularLimpio;
          // Formato: +56 9 + 8 dígitos restantes
          const digitosRestantes = numeroCompleto.substring(1, 9);
          cleanData.celular = `+56 9${digitosRestantes}`;
        } else {
          cleanData.celular = null;
        }
      } else {
        cleanData.celular = null;
      }
      
      if (data.observaciones && data.observaciones.trim() !== '') {
        cleanData.observaciones = data.observaciones.trim();
      } else {
        cleanData.observaciones = null;
      }
      
      // Limpiar salario
      if (data.salario && data.salario !== '' && data.salario !== undefined && data.salario !== null) {
        cleanData.salario = parseFloat(data.salario);
      } else {
        cleanData.salario = null;
      }
      
      // Asegurar valores por defecto según la BD MySQL
      // tipo_contrato: 'indefinido','plazo_fijo','full_time','part_time'
      if (data.tipo_contrato && data.tipo_contrato !== '') {
        cleanData.tipo_contrato = data.tipo_contrato;
      } else {
        cleanData.tipo_contrato = 'indefinido';
      }
      
      // estado: 'activo','inactivo','vacaciones','licencia','desvinculado'
      if (data.estado && data.estado !== '') {
        cleanData.estado = data.estado;
      } else {
        cleanData.estado = 'activo';
      }
      
      if (data.activo !== undefined && data.activo !== '') {
        cleanData.activo = Boolean(data.activo);
      } else {
        cleanData.activo = true;
      }
      
      // Agregar password solo si está presente
      if (passwordValue && passwordValue.trim() !== '') {
        cleanData.password = passwordValue;
      }
      
      // Si es actualización y password está vacío, no enviarlo
      if (params.id) {
        if (!cleanData.password || cleanData.password.trim() === "") {
          const { password, ...dataWithoutPassword } = cleanData;
          await updateEmpleado(params.id, dataWithoutPassword);
        } else {
          await updateEmpleado(params.id, cleanData);
        }
        ActivityLogger.empleadoUpdated(nombreCompleto);
        toast.success("Empleado actualizado correctamente", {
          position: "bottom-right",
        });
      } else {
        // Para creación, password es requerido
        if (!cleanData.password || cleanData.password.trim() === "") {
          setError("password", { 
            type: "manual", 
            message: "La contraseña es requerida" 
          });
          toast.error("La contraseña es requerida para crear un empleado", {
            position: "bottom-right",
          });
          return;
        }
        await createEmpleado(cleanData);
        ActivityLogger.empleadoCreated(nombreCompleto);
        toast.success("Empleado creado correctamente", {
          position: "bottom-right",
        });
      }
      navigate("/empleado");
    } catch (error) {
      console.error("Error al guardar:", error);
      console.error("Error response:", error.response);
      
      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        // Error de RUT duplicado
        if (errorData.rut && (Array.isArray(errorData.rut) ? errorData.rut[0]?.includes('already exists') : errorData.rut.includes('already exists'))) {
          setError("rut", { 
            type: "manual", 
            message: "Este RUT ya está registrado en el sistema" 
          });
          toast.error("El RUT ingresado ya existe en el sistema", {
            position: "bottom-right",
            duration: 4000,
          });
        } else {
          // Otros errores de validación
          const errorMessage = typeof errorData === 'string' 
            ? errorData 
            : (errorData.detail || JSON.stringify(errorData));
          toast.error("Error de validación: " + errorMessage, {
            position: "bottom-right",
            duration: 5000,
          });
        }
      } else if (error.response?.data?.detail) {
        toast.error("Error: " + error.response.data.detail, {
          position: "bottom-right",
          duration: 5000,
        });
      } else {
        const errorMessage = error.message || "Error al guardar empleado";
        toast.error(errorMessage, {
          position: "bottom-right",
          duration: 4000,
        });
      }
    }
  });

  useEffect(() => {
    async function loadEmpleado() {
      if (params.id) {
        try {
          const { data } = await getEmpleado(params.id);
          setEmpleadoActual(data);
          
          // El backend devuelve: nombre, apellido, correo, celular
          // (Django mapea automáticamente desde nombres, apellidos, email, telefono)
          const rutLimpio = limpiarRUT(data.rut);
          // Si el RUT ya tiene DV, usarlo; si no, formatearlo completo
          const rutFormateado = data.rut.includes('-') ? data.rut : formatearRUTCompleto(rutLimpio);
          setRutValue(rutFormateado);
          setValue("rut", rutFormateado);
          
          // Usar nombre y apellido del backend (Django los mapea desde nombres/apellidos)
          setNombreValue(data.nombre || "");
          setValue("nombre", data.nombre || "");
          setApellidoValue(data.apellido || "");
          setValue("apellido", data.apellido || "");
          
          setValue("fecha_nacimiento", data.fecha_nacimiento || "");
          setValue("direccion", data.direccion || "");
          setValue("cargo", data.cargo || "");
          setValue("departamento", data.departamento || "");
          setValue("fecha_contratacion", data.fecha_contratacion || "");
          setValue("fecha_termino", data.fecha_termino || "");
          setValue("salario", data.salario || "");
          
          // tipo_contrato: 'indefinido','plazo_fijo','full_time','part_time'
          let tipoContrato = data.tipo_contrato || "indefinido";
          setValue("tipo_contrato", tipoContrato);
          
          setValue("estado", data.estado || "activo");
          setValue("correo", data.correo || "");
          
          // Formatear celular si existe (Django devuelve 'celular' mapeado desde 'telefono')
          if (data.celular) {
            const celularLimpio = limpiarCelular(data.celular);
            const celularFormateado = formatearCelularChileno(celularLimpio);
            setCelularValue(celularFormateado);
            setValue("celular", celularFormateado ? `+56 9${celularFormateado.replace(/\s/g, '')}` : "");
          } else {
            setCelularValue("");
            setValue("celular", "");
          }
          
          setPasswordValue("");
          setValue("password", "");
          setValue("observaciones", data.observaciones || "");
          setValue("activo", data.activo !== undefined ? data.activo : true);
        } catch (error) {
          toast.error("Error al cargar empleado", {
            position: "bottom-right",
          });
        }
      }
    }
    loadEmpleado();
  }, [params.id, setValue]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {params.id ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h1>
        <p className="text-gray-600">
          {params.id ? 'Modifica la información del empleado' : 'Agrega un nuevo empleado al sistema'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RUT */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUT *
            </label>
            <input
              ref={rutRef}
              type="text"
              placeholder="12345678"
              value={rutValue}
              onChange={handleRutChange}
              onBlur={handleRutComplete}
              onKeyDown={handleRutKeyDown}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.rut ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.rut && (
              <p className="mt-1 text-sm text-red-600">{errors.rut.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              ref={nombreRef}
              type="text"
              placeholder="Juan Carlos"
              value={nombreValue}
              onChange={handleNombreChange}
              onKeyDown={(e) => handleFieldKeyDown(e, apellidoRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos *
            </label>
            <input
              ref={apellidoRef}
              type="text"
              placeholder="Pérez González"
              value={apellidoValue}
              onChange={handleApellidoChange}
              onKeyDown={(e) => handleFieldKeyDown(e, fechaNacimientoRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.apellido ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.apellido && (
              <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
            )}
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              ref={fechaNacimientoRef}
              type="date"
              {...register("fecha_nacimiento")}
              onKeyDown={(e) => handleFieldKeyDown(e, correoRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              ref={correoRef}
              type="email"
              placeholder="juan.perez@monkeycoffee.com"
              {...register("correo")}
              onKeyDown={(e) => handleFieldKeyDown(e, celularRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Celular
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none select-none text-sm">
                +56 9
              </span>
              <input
                ref={celularRef}
                type="text"
                placeholder="1234 5678"
                value={celularValue}
                onChange={handleCelularChange}
                onKeyDown={handleCelularKeyDown}
                onFocus={handleCelularFocus}
                className="block w-full pl-[3.25rem] pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                maxLength={11}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              ref={direccionRef}
              type="text"
              placeholder="Calle Ejemplo #123, Comuna, Ciudad"
              {...register("direccion")}
              onKeyDown={(e) => handleFieldKeyDown(e, cargoRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Separador - Información Laboral */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <select
              ref={cargoRef}
              {...register("cargo", { required: "El cargo es requerido" })}
              onKeyDown={(e) => handleFieldKeyDown(e, departamentoRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.cargo ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un cargo</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
              <option value="Trabajador">Trabajador</option>
            </select>
            {errors.cargo && (
              <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>
            )}
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <input
              ref={departamentoRef}
              type="text"
              placeholder="Operaciones, Ventas, etc."
              {...register("departamento")}
              onKeyDown={(e) => handleFieldKeyDown(e, fechaContratacionRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Fecha de Contratación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Contratación *
            </label>
            <input
              ref={fechaContratacionRef}
              type="date"
              {...register("fecha_contratacion", { required: "La fecha de contratación es requerida" })}
              onKeyDown={(e) => handleFieldKeyDown(e, tipoContratoRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.fecha_contratacion ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha_contratacion && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_contratacion.message}</p>
            )}
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Contrato
            </label>
            <select
              ref={tipoContratoRef}
              {...register("tipo_contrato")}
              onKeyDown={(e) => handleFieldKeyDown(e, estadoRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="indefinido">Indefinido</option>
              <option value="plazo_fijo">Plazo Fijo</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              ref={estadoRef}
              {...register("estado")}
              onKeyDown={(e) => handleFieldKeyDown(e, salarioRef)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="licencia">Licencia</option>
              <option value="desvinculado">Desvinculado</option>
            </select>
          </div>

          {/* Salario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salario
            </label>
            <input
              ref={salarioRef}
              type="number"
              step="1"
              min="0"
              placeholder="0"
              {...register("salario")}
              onKeyDown={(e) => {
                // Prevenir entrada de punto decimal o coma
                if (e.key === '.' || e.key === ',') {
                  e.preventDefault();
                }
                handleFieldKeyDown(e, passwordRef);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Separador - Seguridad y Configuración */}
          <div className="md:col-span-2 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Seguridad y Configuración</h3>
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {!params.id && '*'}
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="•••••••••••••"
              value={passwordValue}
              onChange={handlePasswordChange}
              onKeyDown={(e) => handleFieldKeyDown(e, observacionesRef)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            {params.id && !showPasswordValidation && (
              <p className="mt-1 text-sm text-gray-500">
                Deja en blanco para mantener la contraseña actual
              </p>
            )}
            
            {/* Validación de contraseña */}
            {showPasswordValidation && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className={`text-sm font-medium mb-2 ${esPasswordSegura(passwordValue) ? 'text-green-600' : 'text-red-600'}`}>
                  {esPasswordSegura(passwordValue) ? '✓ Contraseña segura' : 'Tu contraseña no es segura.'}
                </p>
                {!esPasswordSegura(passwordValue) && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 mb-1">Debe contener al menos:</p>
                    <div className="space-y-1 text-xs">
                      <p className={validarPassword(passwordValue).length ? 'text-green-600' : 'text-red-600'}>
                        {validarPassword(passwordValue).length ? '✓' : '✗'} 12 caracteres
                      </p>
                      <p className={validarPassword(passwordValue).uppercase ? 'text-green-600' : 'text-red-600'}>
                        {validarPassword(passwordValue).uppercase ? '✓' : '✗'} Una letra mayúscula
                      </p>
                      <p className={validarPassword(passwordValue).number ? 'text-green-600' : 'text-red-600'}>
                        {validarPassword(passwordValue).number ? '✓' : '✗'} Un número
                      </p>
                      <p className={validarPassword(passwordValue).special ? 'text-green-600' : 'text-red-600'}>
                        {validarPassword(passwordValue).special ? '✓' : '✗'} Un carácter especial (!,@,#,$,%...)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              ref={observacionesRef}
              rows="3"
              placeholder="Notas adicionales sobre el empleado..."
              {...register("observaciones")}
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
              />
              <label className="ml-2 block text-sm text-gray-900">
                Empleado activo
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/empleado")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            {params.id && (
              <button
                type="button"
                onClick={async () => {
                  const accepted = window.confirm("¿Estás seguro de que quieres eliminar este empleado?");
                  if (accepted) {
                    try {
                      await deleteEmpleado(params.id);
                      if (empleadoActual) {
                        ActivityLogger.empleadoDeleted(`${empleadoActual.nombre} ${empleadoActual.apellido}`);
                      }
                      toast.success("Empleado eliminado correctamente", {
                        position: "bottom-right",
                      });
                      navigate("/empleado");
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
                    }
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            )}
            
            <button
              ref={submitButtonRef}
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {params.id ? 'Actualizar' : 'Crear'} Empleado
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}