import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { updateEmpleado, getEmpleado, getAllEmpleado } from "../api/empleado.api";
import { toast } from "react-hot-toast";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function ProfilePage() {
  const { empleado: empleadoAuth, login } = useAuth();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [celularValue, setCelularValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    if (empleadoAuth?.rut) {
      loadEmpleado();
    }
  }, [empleadoAuth]);

  const loadEmpleado = async () => {
    try {
      setLoading(true);
      // Si el empleado tiene ID, usarlo directamente
      // Si no, buscar en la lista completa por RUT
      let empleadoData;
      if (empleadoAuth.id) {
        const response = await getEmpleado(empleadoAuth.id);
        empleadoData = response.data;
      } else {
        // Buscar por RUT en la lista completa
        const response = await getAllEmpleado();
        const empleados = response.data;
        empleadoData = empleados.find(emp => {
          const rutLimpio = emp.rut?.replace(/[^0-9kK]/g, '').toUpperCase();
          const rutAuthLimpio = empleadoAuth.rut?.replace(/[^0-9kK]/g, '').toUpperCase();
          return rutLimpio === rutAuthLimpio;
        });
        
        if (!empleadoData) {
          throw new Error("Empleado no encontrado");
        }
        
        // Obtener datos completos usando el ID encontrado
        const fullResponse = await getEmpleado(empleadoData.id);
        empleadoData = fullResponse.data;
      }
      
      setEmpleado(empleadoData);
      
      // Establecer valores del formulario
      reset({
        correo: empleadoData.correo || "",
        celular: empleadoData.celular || "",
        direccion: empleadoData.direccion || "",
        observaciones: empleadoData.observaciones || "",
      });

      // Formatear celular para mostrar
      if (empleadoData.celular) {
        const celularLimpio = limpiarCelular(empleadoData.celular);
        const celularFormateado = formatearCelularChileno(celularLimpio);
        setCelularValue(celularFormateado);
        setValue("celular", celularFormateado ? `+56 9${celularFormateado.replace(/\s/g, '')}` : "");
      } else {
        setCelularValue("");
        setValue("celular", "");
      }
    } catch (error) {
      console.error("Error al cargar empleado:", error);
      toast.error("Error al cargar la información del perfil");
    } finally {
      setLoading(false);
    }
  };

  const capitalizarTexto = (texto) => {
    return texto
      .split(' ')
      .map(palabra => {
        if (palabra.length === 0) return palabra;
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
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
  };

  const handleCelularFocus = (e) => {
    // Colocar el cursor al final del texto si hay contenido
    if (celularValue) {
      setTimeout(() => {
        e.target.setSelectionRange(celularValue.length, celularValue.length);
      }, 0);
    }
  };

  // Función para formatear el celular para mostrar (modo no-edición)
  const formatearCelularParaMostrar = (celular) => {
    if (!celular || celular.trim() === "") {
      return "No especificado";
    }
    const celularLimpio = limpiarCelular(celular);
    if (!celularLimpio || celularLimpio.length === 0) {
      return "No especificado";
    }
    const celularFormateado = formatearCelularChileno(celularLimpio);
    return celularFormateado ? `+56 9 ${celularFormateado}` : "No especificado";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    setValue("password", value);
    setShowPasswordValidation(value.length > 0);
  };

  const validarPassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const passwordValidation = validarPassword(passwordValue);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updateData = {};

      // Solo incluir campos que se pueden editar
      if (data.correo !== undefined) {
        updateData.correo = data.correo.trim() || null;
      }
      
      // Limpiar y formatear celular antes de enviar
      if (data.celular && data.celular !== '') {
        const celularLimpio = limpiarCelular(data.celular);
        if (celularLimpio) {
          // Asegurar que empiece con 9
          const numeroCompleto = celularLimpio.startsWith('9') ? celularLimpio : '9' + celularLimpio;
          // Formato: +56 9 + 8 dígitos restantes
          const digitosRestantes = numeroCompleto.substring(1, 9);
          updateData.celular = `+56 9${digitosRestantes}`;
        } else {
          updateData.celular = null;
        }
      } else {
        updateData.celular = null;
      }
      
      if (data.direccion !== undefined) {
        updateData.direccion = data.direccion.trim() || null;
      }
      
      if (data.observaciones !== undefined) {
        updateData.observaciones = data.observaciones.trim() || null;
      }

      // Si se está cambiando la contraseña
      if (showPasswordSection && passwordValue) {
        if (passwordValue !== confirmPasswordValue) {
          toast.error("Las contraseñas no coinciden");
          return;
        }

        if (!passwordValidation.length || !passwordValidation.uppercase || 
            !passwordValidation.lowercase || !passwordValidation.number) {
          toast.error("La contraseña no cumple con los requisitos mínimos");
          return;
        }

        updateData.password = passwordValue;
      }

      // Actualizar empleado
      const response = await updateEmpleado(empleado.id, updateData);
      
      // Actualizar estado local
      setEmpleado(response.data);
      
      // Actualizar AuthContext si es necesario
      if (empleadoAuth.rut === empleado.rut) {
        const empleadoGuardado = JSON.parse(localStorage.getItem("empleado") || "{}");
        const empleadoActualizado = { ...empleadoGuardado, ...response.data };
        localStorage.setItem("empleado", JSON.stringify(empleadoActualizado));
      }

      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
      setShowPasswordSection(false);
      setPasswordValue("");
      setConfirmPasswordValue("");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error(error.response?.data?.error || "Error al actualizar el perfil");
    }
  });

  const getInitials = () => {
    if (empleado) {
      const nombre = empleado.nombre || '';
      const apellido = empleado.apellido || '';
      return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    // Si la fecha viene en formato YYYY-MM-DD, parsearla como fecha local
    const dateParts = dateString.split('T')[0].split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Los meses en JS son 0-indexados
      const day = parseInt(dateParts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Fallback al método original si el formato no es el esperado
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "No especificado";
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar la información del perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y configuración</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              // Asegurar que el celular se inicialice correctamente al entrar en modo edición
              if (empleado?.celular) {
                const celularLimpio = limpiarCelular(empleado.celular);
                const celularFormateado = formatearCelularChileno(celularLimpio);
                setCelularValue(celularFormateado);
                setValue("celular", celularFormateado ? `+56 9${celularFormateado.replace(/\s/g, '')}` : "");
              } else {
                setCelularValue("");
                setValue("celular", "");
              }
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Perfil</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información del perfil */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center mb-4">
                {empleado.foto_perfil ? (
                  <img
                    src={empleado.foto_perfil}
                    alt={`${empleado.nombre} ${empleado.apellido}`}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">{getInitials()}</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {empleado.nombre} {empleado.apellido}
              </h2>
              <p className="text-gray-600 mt-1">{empleado.cargo}</p>
              {empleado.departamento && (
                <p className="text-sm text-gray-500 mt-1">{empleado.departamento}</p>
              )}
            </div>

            {/* Estado */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  empleado.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : empleado.estado === 'inactivo'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {empleado.estado?.charAt(0).toUpperCase() + empleado.estado?.slice(1) || 'Activo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario de información */}
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RUT - Solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={formatearRUTParaMostrar(empleado.rut)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Nombre - Solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={`${empleado.nombre} ${empleado.apellido}`}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Correo - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      {...register("correo", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Correo electrónico inválido"
                        }
                      })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.correo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <input
                      type="text"
                      value={empleado.correo || "No especificado"}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                  {errors.correo && (
                    <p className="mt-1 text-sm text-red-600">{errors.correo.message}</p>
                  )}
                </div>

                {/* Celular - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none select-none text-sm">
                        +56 9
                      </span>
                      <input
                        key={`celular-edit-${empleado?.id || 'new'}`}
                        type="text"
                        placeholder="1234 5678"
                        value={celularValue || ""}
                        onChange={handleCelularChange}
                        onKeyDown={handleCelularKeyDown}
                        onFocus={handleCelularFocus}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          const limpiado = limpiarCelular(pastedText);
                          const formateado = formatearCelularChileno(limpiado);
                          setCelularValue(formateado);
                          const valorCompleto = formateado ? `+56 9${formateado.replace(/\s/g, '')}` : "";
                          setValue("celular", valorCompleto);
                        }}
                        maxLength={11}
                        className="w-full pl-[3.25rem] pr-4 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 border-gray-300"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formatearCelularParaMostrar(empleado.celular)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                {/* Fecha de Nacimiento - Solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="text"
                    value={formatDate(empleado.fecha_nacimiento)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Dirección - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register("direccion")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ingresa tu dirección"
                    />
                  ) : (
                    <input
                      type="text"
                      value={empleado.direccion || "No especificada"}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                {/* Descripción - Editable */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  {isEditing ? (
                    <textarea
                      {...register("observaciones")}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ingresa una descripción"
                    />
                  ) : (
                    <textarea
                      value={empleado.observaciones || "No especificada"}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Información Laboral
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={empleado.cargo || "No especificado"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={empleado.departamento || "No especificado"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Contratación
                  </label>
                  <input
                    type="text"
                    value={formatDate(empleado.fecha_contratacion)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Contrato
                  </label>
                  <input
                    type="text"
                    value={empleado.tipo_contrato ? empleado.tipo_contrato.charAt(0).toUpperCase() + empleado.tipo_contrato.slice(1).replace('_', ' ') : "No especificado"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {empleado.salario && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salario
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(empleado.salario)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cambio de Contraseña */}
            {isEditing && (
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Cambiar Contraseña
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(!showPasswordSection);
                      if (showPasswordSection) {
                        setPasswordValue("");
                        setConfirmPasswordValue("");
                        setShowPasswordValidation(false);
                      }
                    }}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    {showPasswordSection ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordValue}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      {showPasswordValidation && (
                        <div className="mt-2 space-y-1">
                          <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className={`h-4 w-4 mr-1 ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {passwordValidation.length ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            Mínimo 8 caracteres
                          </div>
                          <div className={`flex items-center text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className={`h-4 w-4 mr-1 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {passwordValidation.uppercase ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            Al menos una mayúscula
                          </div>
                          <div className={`flex items-center text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className={`h-4 w-4 mr-1 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {passwordValidation.lowercase ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            Al menos una minúscula
                          </div>
                          <div className={`flex items-center text-xs ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className={`h-4 w-4 mr-1 ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {passwordValidation.number ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            Al menos un número
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPasswordValue}
                        onChange={(e) => setConfirmPasswordValue(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          confirmPasswordValue && passwordValue !== confirmPasswordValue
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      {confirmPasswordValue && passwordValue !== confirmPasswordValue && (
                        <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordSection(false);
                    setPasswordValue("");
                    setConfirmPasswordValue("");
                    setShowPasswordValidation(false);
                    loadEmpleado();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

