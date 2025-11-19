import { useState, useMemo } from "react";
import { generarReporte } from "../api/reportes.api";
import { toast } from "react-hot-toast";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState("Empleados");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // Validar fechas antes de generar reporte
  const validarFechas = () => {
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return false;
    }
    return true;
  };

  // Configurar fechas rápidas
  const configurarFechasRapidas = (periodo) => {
    const hoy = new Date();
    let inicio = new Date();
    let fin = new Date();

    switch (periodo) {
      case "hoy":
        inicio = hoy;
        fin = hoy;
        break;
      case "semana":
        inicio.setDate(hoy.getDate() - 7);
        fin = hoy;
        break;
      case "mes":
        inicio.setMonth(hoy.getMonth() - 1);
        fin = hoy;
        break;
      case "trimestre":
        inicio.setMonth(hoy.getMonth() - 3);
        fin = hoy;
        break;
      case "año":
        inicio.setFullYear(hoy.getFullYear() - 1);
        fin = hoy;
        break;
      default:
        return;
    }

    setFechaInicio(inicio.toISOString().split("T")[0]);
    setFechaFin(fin.toISOString().split("T")[0]);
  };

  const handleGenerarReporte = async () => {
    if (!validarFechas()) return;

    try {
      setLoading(true);
      setPaginaActual(1);
      setBusqueda("");
      const resultado = await generarReporte(tipoReporte, fechaInicio, fechaFin);
      setReporte(resultado);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast.error("Error al generar el reporte. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarCSV = () => {
    if (!reporte || !reporte.datos || reporte.datos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      let csvContent = "";
      let headers = [];
      let rows = [];

      switch (reporte.tipo) {
        case "empleados":
          headers = [
            "RUT",
            "Nombre",
            "Apellido",
            "Correo",
            "Celular",
            "Cargo",
            "Departamento",
            "Estado",
            "Tipo Contrato",
            "Fecha Contratación",
            "Salario",
            "Activo",
          ];
          rows = reporte.datos.map((emp) => [
            formatearRUTParaMostrar(emp.rut) || "",
            emp.nombre || "",
            emp.apellido || "",
            emp.correo || "",
            emp.celular || "",
            emp.cargo || "",
            emp.departamento || "",
            emp.estado || "",
            emp.tipo_contrato || "",
            emp.fecha_contratacion || "",
            emp.salario || "",
            emp.activo ? "Sí" : "No",
          ]);
          break;
        case "inventario":
          headers = [
            "Código",
            "Nombre",
            "Descripción",
            "Categoría",
            "Cantidad Actual",
            "Cantidad Mínima",
            "Precio Unitario",
            "Estado",
            "Proveedor",
            "Fecha Creación",
            "Activo",
          ];
          rows = reporte.datos.map((prod) => [
            prod.codigo_producto || "",
            prod.nombre_producto || "",
            prod.descripcion || "",
            prod.categoria || "",
            prod.cantidad_actual || "",
            prod.cantidad_minima || "",
            prod.precio_unitario || "",
            prod.estado || "",
            prod.proveedor || "",
            prod.fecha_creacion || "",
            prod.activo ? "Sí" : "No",
          ]);
          break;
        case "asistencias":
          headers = [
            "RUT",
            "Nombre Empleado",
            "Fecha",
            "Hora Entrada",
            "Hora Salida",
            "Estado",
            "Horas Trabajadas",
            "Minutos Tarde",
            "Minutos Extras",
            "Tipo Entrada",
            "Tipo Salida",
            "Observaciones",
          ];
          rows = reporte.datos.map((asist) => [
            formatearRUTParaMostrar(asist.empleado_rut || asist.empleado_rut_display) || "",
            `${asist.empleado_nombre || ""} ${asist.empleado_apellido || ""}`.trim() || "",
            asist.fecha || "",
            asist.hora_entrada ? new Date(asist.hora_entrada).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "",
            asist.hora_salida ? new Date(asist.hora_salida).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "",
            asist.estado || "",
            asist.horas_trabajadas || "0",
            asist.minutos_tarde || "0",
            asist.minutos_extras || "0",
            asist.tipo_entrada || "",
            asist.tipo_salida || "",
            asist.observaciones || "",
          ]);
          break;
        default:
          toast.error("Tipo de reporte no válido para exportar");
          return;
      }

      // Crear contenido CSV
      csvContent = headers.join(",") + "\n";
      rows.forEach((row) => {
        csvContent +=
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
          "\n";
      });

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reporte_${reporte.tipo}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error exportando reporte:", error);
      toast.error("Error al exportar el reporte");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const formatearMoneda = (valor) => {
    if (!valor) return "$0";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(valor);
  };

  const formatearHora = (datetime) => {
    if (!datetime) return "N/A";
    try {
      return new Date(datetime).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return datetime;
    }
  };

  const getEstadoColorAsistencia = (estado) => {
    switch (estado) {
      case "presente":
        return "bg-green-100 text-green-800";
      case "tarde":
        return "bg-yellow-100 text-yellow-800";
      case "ausente":
        return "bg-red-100 text-red-800";
      case "justificado":
        return "bg-blue-100 text-blue-800";
      case "permiso":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatearEstadoAsistencia = (estado) => {
    const estados = {
      presente: "Presente",
      tarde: "Tarde",
      ausente: "Ausente",
      justificado: "Justificado",
      permiso: "Permiso",
    };
    return estados[estado] || estado;
  };

  // Filtrar datos según búsqueda
  const datosFiltrados = useMemo(() => {
    if (!reporte || !reporte.datos) return [];
    
    if (!busqueda.trim()) return reporte.datos;

    const busquedaLower = busqueda.toLowerCase();
    return reporte.datos.filter((item) => {
      if (reporte.tipo === "empleados") {
        return (
          (item.nombre && item.nombre.toLowerCase().includes(busquedaLower)) ||
          (item.apellido && item.apellido.toLowerCase().includes(busquedaLower)) ||
          (item.rut && formatearRUTParaMostrar(item.rut).toLowerCase().includes(busquedaLower)) ||
          (item.cargo && item.cargo.toLowerCase().includes(busquedaLower)) ||
          (item.departamento && item.departamento.toLowerCase().includes(busquedaLower))
        );
      } else if (reporte.tipo === "inventario") {
        return (
          (item.nombre_producto && item.nombre_producto.toLowerCase().includes(busquedaLower)) ||
          (item.codigo_producto && item.codigo_producto.toLowerCase().includes(busquedaLower)) ||
          (item.categoria && item.categoria.toLowerCase().includes(busquedaLower)) ||
          (item.proveedor && item.proveedor.toLowerCase().includes(busquedaLower))
        );
      } else if (reporte.tipo === "asistencias") {
        return (
          (item.empleado_nombre && item.empleado_nombre.toLowerCase().includes(busquedaLower)) ||
          (item.empleado_apellido && item.empleado_apellido.toLowerCase().includes(busquedaLower)) ||
          (item.empleado_rut && formatearRUTParaMostrar(item.empleado_rut).toLowerCase().includes(busquedaLower)) ||
          (item.estado && item.estado.toLowerCase().includes(busquedaLower)) ||
          (item.fecha && item.fecha.toLowerCase().includes(busquedaLower))
        );
      }
      return false;
    });
  }, [reporte, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return datosFiltrados.slice(inicio, fin);
  }, [datosFiltrados, paginaActual, itemsPorPagina]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(Math.max(1, Math.min(nuevaPagina, totalPaginas)));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg
              className="h-8 w-8 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Reportes
          </h1>
          <p className="text-gray-600 mt-1">Visualiza y analiza tus datos de manera eficiente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros de Búsqueda
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option>Empleados</option>
              <option>Inventario</option>
              <option>Asistencias</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              max={fechaFin || undefined}
              className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio || undefined}
              className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fechas rápidas */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 flex items-center">Períodos rápidos:</span>
          <button
            onClick={() => configurarFechasRapidas("hoy")}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => configurarFechasRapidas("semana")}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Última semana
          </button>
          <button
            onClick={() => configurarFechasRapidas("mes")}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Último mes
          </button>
          <button
            onClick={() => configurarFechasRapidas("trimestre")}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Último trimestre
          </button>
          <button
            onClick={() => configurarFechasRapidas("año")}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Último año
          </button>
          <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
            }}
            className="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Report Results */}
      {reporte && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Reporte de {tipoReporte}
                </h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generado el {formatearFecha(reporte.fechaGeneracion)}
                  {reporte.fechaInicio || reporte.fechaFin
                    ? ` | Período: ${formatearFecha(reporte.fechaInicio)} - ${formatearFecha(reporte.fechaFin)}`
                    : ""}
                </p>
              </div>
              <button
                onClick={handleExportarCSV}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Exportar CSV
              </button>
            </div>

            {/* Statistics */}
            {reporte.estadisticas && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(reporte.estadisticas).map(([key, value]) => {
                  if (typeof value === "object" && value !== null) return null;
                  
                  const getIcon = () => {
                    if (key.includes("total")) {
                      return (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      );
                    }
                    if (key.includes("activo")) {
                      return (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                    }
                    if (key.includes("valor") || key.includes("stock")) {
                      return (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                    }
                    return (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  };

                  const getColor = () => {
                    if (key.includes("activo")) return "bg-green-50 border-green-200 text-green-700";
                    if (key.includes("inactivo")) return "bg-red-50 border-red-200 text-red-700";
                    if (key.includes("valor") || key.includes("stock")) return "bg-blue-50 border-blue-200 text-blue-700";
                    return "bg-primary-50 border-primary-200 text-primary-700";
                  };

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-xl border-2 ${getColor()} transition-transform hover:scale-105`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getIcon()}
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-3xl font-bold">
                        {typeof value === "number" && (key.includes("valor") || key.includes("stock"))
                          ? formatearMoneda(value)
                          : value.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Statistics */}
            {reporte.estadisticas &&
              Object.entries(reporte.estadisticas).some(
                ([key, value]) => typeof value === "object" && value !== null
              ) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(reporte.estadisticas).map(([key, value]) => {
                    if (typeof value !== "object" || value === null)
                      return null;
                    return (
                      <div
                        key={key}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-gray-800 mb-3 capitalize flex items-center gap-2">
                          <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div
                              key={subKey}
                              className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-lg"
                            >
                              <span className="text-gray-600 font-medium">{subKey}:</span>
                              <span className="font-bold text-gray-900 bg-primary-50 px-2 py-1 rounded">
                                {subValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Search and Table Controls */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={`Buscar en ${tipoReporte.toLowerCase()}...`}
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                Mostrando {datosFiltrados.length > 0 ? (paginaActual - 1) * itemsPorPagina + 1 : 0} - {Math.min(paginaActual * itemsPorPagina, datosFiltrados.length)} de {datosFiltrados.length} resultados
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {reporte.tipo === "empleados" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RUT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cargo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Departamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Contratación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activo
                        </th>
                      </>
                    )}
                    {reporte.tipo === "inventario" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unitario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proveedor
                        </th>
                      </>
                    )}
                    {reporte.tipo === "asistencias" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RUT
                        </th>
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
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horas Trabajadas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Minutos Tarde
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Minutos Extras
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datosPaginados && datosPaginados.length > 0 ? (
                    datosPaginados.map((item, index) => (
                      <tr key={index} className="hover:bg-primary-50 transition-colors">
                        {reporte.tipo === "empleados" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatearRUTParaMostrar(item.rut)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.nombre} {item.apellido}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.cargo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.departamento || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.estado === "activo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearFecha(item.fecha_contratacion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.activo ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                          </>
                        )}
                        {reporte.tipo === "inventario" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.codigo_producto}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.nombre_producto}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.categoria || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`font-semibold ${
                                  item.cantidad_actual <=
                                  (item.cantidad_minima || 0)
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {item.cantidad_actual}
                              </span>
                              {item.cantidad_minima && (
                                <span className="text-gray-400 text-xs ml-1">
                                  / {item.cantidad_minima} min
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearMoneda(item.precio_unitario)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.estado === "disponible"
                                    ? "bg-green-100 text-green-800"
                                    : item.estado === "agotado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.estado || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.proveedor || "N/A"}
                            </td>
                          </>
                        )}
                        {reporte.tipo === "asistencias" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatearRUTParaMostrar(item.empleado_rut || item.empleado_rut_display)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.empleado_nombre} {item.empleado_apellido}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearFecha(item.fecha)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearHora(item.hora_entrada)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearHora(item.hora_salida)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColorAsistencia(item.estado)}`}
                              >
                                {formatearEstadoAsistencia(item.estado)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.horas_trabajadas ? `${item.horas_trabajadas}h` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.minutos_tarde > 0 ? (
                                <span className="text-yellow-600 font-semibold">
                                  {item.minutos_tarde} min
                                </span>
                              ) : (
                                <span className="text-gray-400">0 min</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.minutos_extras > 0 ? (
                                <span className="text-green-600 font-semibold">
                                  {item.minutos_extras} min
                                </span>
                              ) : (
                                <span className="text-gray-400">0 min</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          reporte.tipo === "empleados" ? 7 :
                          reporte.tipo === "inventario" ? 7 :
                          reporte.tipo === "asistencias" ? 9 : 7
                        }
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-900">No se encontraron resultados</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {busqueda ? "Intenta con otros términos de búsqueda" : "No hay datos disponibles para mostrar"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let pagina;
                      if (totalPaginas <= 5) {
                        pagina = i + 1;
                      } else if (paginaActual <= 3) {
                        pagina = i + 1;
                      } else if (paginaActual >= totalPaginas - 2) {
                        pagina = totalPaginas - 4 + i;
                      } else {
                        pagina = paginaActual - 2 + i;
                      }
                      return (
                        <button
                          key={pagina}
                          onClick={() => cambiarPagina(pagina)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            pagina === paginaActual
                              ? "bg-primary-500 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pagina}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Página {paginaActual} de {totalPaginas}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reporte && (
        <div className="bg-white shadow-lg rounded-xl p-12 border border-gray-100">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-12 w-12 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sin reportes generados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Selecciona el tipo de reporte y las fechas, luego presiona "Generar Reporte" para visualizar tus datos.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Elige el tipo de reporte</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Selecciona el período</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Genera el reporte</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
