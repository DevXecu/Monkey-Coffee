import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import toast from "react-hot-toast";
import { formatearRUT, formatearRUTCompleto, limpiarRUT } from "../utils/rutUtils";

export const LoginPage = () => {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { hasPermission, rol } = usePermissions();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Encontrar la primera ruta permitida según el rol
      let routes = [];
      
      if (rol === "gerente") {
        routes = [
          "/dashboard",
          "/inventario",
          "/empleado",
          "/turnos",
          "/asistencia",
          "/proveedores",
          "/ordenes-compra",
          "/solicitudes",
        ];
      } else if (rol === "administrador") {
        routes = [
          "/inventario",
          "/empleado",
          "/turnos",
          "/asistencia",
          "/proveedores",
          "/ordenes-compra",
          "/solicitudes",
        ];
      } else {
        routes = [
          "/inventario",
          "/asistencia",
          "/solicitudes",
          "/turnos",
        ];
      }
      
      const allowedRoute = routes.find((route) => hasPermission(route)) || "/inventario";
      navigate(allowedRoute, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, hasPermission, rol]);

  const handleRutChange = (e) => {
    const inputValue = e.target.value;
    // Si el RUT ya tiene guión, extraer solo los números para reformatear
    if (inputValue.includes('-')) {
      const parts = inputValue.split('-');
      const numeros = parts[0].replace(/[^0-9]/g, '').substring(0, 8);
      const dv = parts[1] ? parts[1].replace(/[^0-9kK]/g, '').toUpperCase().substring(0, 1) : '';
      if (numeros.length >= 7 && dv) {
        const formatted = formatearRUT(numeros) + '-' + dv;
        setRut(formatted);
      } else if (numeros.length > 0) {
        const formatted = formatearRUT(numeros);
        setRut(formatted);
      } else {
        setRut('');
      }
    } else {
      // Si no tiene guión, formatear solo con puntos
      const cleaned = inputValue.replace(/[^0-9]/g, '');
      const limited = cleaned.substring(0, 8);
      if (limited.length <= 8) {
        const formatted = formatearRUT(limited);
        setRut(formatted);
      }
    }
  };

  const handleRutComplete = () => {
    if (rut && !rut.includes('-')) {
      const cleaned = rut.replace(/[^0-9]/g, '');
      // Limitar a máximo 8 dígitos antes de calcular el DV
      const limited = cleaned.substring(0, 8);
      
      if (limited.length >= 7) { // Mínimo 7 dígitos para calcular DV
        const formatted = formatearRUTCompleto(limited);
        setRut(formatted);
      }
    }
  };

  const handleRutKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRutComplete();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rut || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    // Asegurar que el RUT tenga el dígito verificador antes de enviarlo
    let rutParaEnviar = rut;
    if (rut && !rut.includes('-')) {
      const cleaned = rut.replace(/[^0-9]/g, '');
      const limited = cleaned.substring(0, 8);
      if (limited.length >= 7) {
        rutParaEnviar = formatearRUTCompleto(limited);
        setRut(rutParaEnviar);
      } else {
        toast.error("Por favor, ingresa un RUT válido");
        return;
      }
    }

    setLoading(true);
    // Limpiar el RUT antes de enviarlo (remover puntos y guión)
    const rutLimpio = limpiarRUT(rutParaEnviar);
    const result = await login(rutLimpio, password);
    setLoading(false);

    if (result.success) {
      toast.success("¡Bienvenido!");
      // La redirección se manejará automáticamente por el useEffect que verifica isAuthenticated
      // Esperar un momento para que el estado se actualice y el useEffect se ejecute
    } else {
      toast.error(result.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logoMC.png"
              alt="Monkey Coffee Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Monkey Coffee
          </h1>
          <p className="text-primary-600">Inicia sesión con tu cuenta</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo RUT */}
            <div>
              <label
                htmlFor="rut"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                RUT
              </label>
              <input
                id="rut"
                type="text"
                value={rut}
                onChange={handleRutChange}
                onBlur={handleRutComplete}
                onKeyDown={handleRutKeyDown}
                placeholder="12.345.678-9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                ref={passwordRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Problemas para iniciar sesión?{" "}
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-primary-600">
          <p>© 2025 Monkey Coffee. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

