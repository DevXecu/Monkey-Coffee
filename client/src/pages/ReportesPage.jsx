import { useState } from "react";
import { generarReporte } from "../api/reportes.api";
import { toast } from "react-hot-toast";
import { formatearRUTParaMostrar } from "../utils/rutUtils";

export function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState("Empleados");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState(null);

  const handleGenerarReporte = async () => {
    try {
      setLoading(true);
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
        case "asistencia":
          headers = [
            "Empleado",
            "RUT",
            "Cargo",
            "Días Trabajados",
            "Horas Trabajadas",
            "Ausencias",
            "Tardanzas",
          ];
          rows = reporte.datos.map((item) => [
            item.empleado || "",
            formatearRUTParaMostrar(item.rut) || "",
            item.cargo || "",
            item.diasTrabajados || 0,
            item.horasTrabajadas || 0,
            item.ausencias || 0,
            item.tardanzas || 0,
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600">Visualiza y analiza tus datos</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option>Asistencia</option>
              <option>Inventario</option>
              <option>Empleados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generando..." : "Generar Reporte"}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reporte && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Reporte de {tipoReporte}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Generado el {formatearFecha(reporte.fechaGeneracion)}
                  {reporte.fechaInicio || reporte.fechaFin
                    ? ` | Período: ${formatearFecha(reporte.fechaInicio)} - ${formatearFecha(reporte.fechaFin)}`
                    : ""}
                </p>
              </div>
              <button
                onClick={handleExportarCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  className="h-4 w-4 mr-2"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(reporte.estadisticas).map(([key, value]) => {
                  if (typeof value === "object" && value !== null) return null;
                  return (
                    <div
                      key={key}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {typeof value === "number" && key.includes("valor")
                          ? formatearMoneda(value)
                          : value}
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
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <p className="text-sm font-medium text-gray-700 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <div className="space-y-1">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div
                              key={subKey}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">{subKey}:</span>
                              <span className="font-semibold text-gray-900">
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

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    {reporte.tipo === "asistencia" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RUT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cargo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Días Trabajados
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horas Trabajadas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ausencias
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tardanzas
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reporte.datos && reporte.datos.length > 0 ? (
                    reporte.datos.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
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
                        {reporte.tipo === "asistencia" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.empleado}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearRUTParaMostrar(item.rut)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.cargo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.diasTrabajados}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.horasTrabajadas}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.ausencias}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.tardanzas}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reporte && (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sin reportes generados
            </h3>
          <p className="mt-1 text-sm text-gray-500">
              Selecciona los filtros y genera un reporte para visualizar los
              datos.
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
