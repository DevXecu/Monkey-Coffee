import axios from "axios";
import { getAllEmpleado } from "./empleado.api";
import { inventarioAPI } from "./inventario.api";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

// Función para generar reporte de empleados
export const generarReporteEmpleados = async (fechaInicio, fechaFin) => {
  try {
    const response = await getAllEmpleado();
    let empleados = response.data;

    // Filtrar por fechas si se proporcionan
    if (fechaInicio || fechaFin) {
      empleados = empleados.filter((emp) => {
        const fechaContratacion = new Date(emp.fecha_contratacion);
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio && fin) {
          return fechaContratacion >= inicio && fechaContratacion <= fin;
        } else if (inicio) {
          return fechaContratacion >= inicio;
        } else if (fin) {
          return fechaContratacion <= fin;
        }
        return true;
      });
    }

    // Calcular estadísticas
    const estadisticas = {
      total: empleados.length,
      activos: empleados.filter((e) => e.activo).length,
      inactivos: empleados.filter((e) => !e.activo).length,
      porCargo: {},
      porEstado: {},
      porTipoContrato: {},
    };

    empleados.forEach((emp) => {
      // Por cargo
      estadisticas.porCargo[emp.cargo] =
        (estadisticas.porCargo[emp.cargo] || 0) + 1;

      // Por estado
      estadisticas.porEstado[emp.estado] =
        (estadisticas.porEstado[emp.estado] || 0) + 1;

      // Por tipo de contrato
      estadisticas.porTipoContrato[emp.tipo_contrato] =
        (estadisticas.porTipoContrato[emp.tipo_contrato] || 0) + 1;
    });

    return {
      tipo: "empleados",
      fechaGeneracion: new Date().toISOString(),
      fechaInicio,
      fechaFin,
      datos: empleados,
      estadisticas,
    };
  } catch (error) {
    console.error("Error generando reporte de empleados:", error);
    throw error;
  }
};

// Función para generar reporte de inventario
export const generarReporteInventario = async (fechaInicio, fechaFin) => {
  try {
    const inventarios = await inventarioAPI.getAll();
    let productos = inventarios;

    // Filtrar por fechas si se proporcionan
    if (fechaInicio || fechaFin) {
      productos = productos.filter((prod) => {
        const fechaCreacion = new Date(prod.fecha_creacion);
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio && fin) {
          return fechaCreacion >= inicio && fechaCreacion <= fin;
        } else if (inicio) {
          return fechaCreacion >= inicio;
        } else if (fin) {
          return fechaCreacion <= fin;
        }
        return true;
      });
    }

    // Calcular estadísticas
    const estadisticas = {
      total: productos.length,
      activos: productos.filter((p) => p.activo).length,
      inactivos: productos.filter((p) => !p.activo).length,
      porCategoria: {},
      porEstado: {},
      stockBajo: productos.filter(
        (p) => p.cantidad_actual <= (p.cantidad_minima || 0)
      ).length,
      stockTotal: productos.reduce(
        (sum, p) => sum + (parseFloat(p.cantidad_actual) || 0),
        0
      ),
      valorTotal: productos.reduce(
        (sum, p) =>
          sum +
          (parseFloat(p.cantidad_actual) || 0) *
            (parseFloat(p.precio_unitario) || 0),
        0
      ),
    };

    productos.forEach((prod) => {
      // Por categoría
      if (prod.categoria) {
        estadisticas.porCategoria[prod.categoria] =
          (estadisticas.porCategoria[prod.categoria] || 0) + 1;
      }

      // Por estado
      if (prod.estado) {
        estadisticas.porEstado[prod.estado] =
          (estadisticas.porEstado[prod.estado] || 0) + 1;
      }
    });

    return {
      tipo: "inventario",
      fechaGeneracion: new Date().toISOString(),
      fechaInicio,
      fechaFin,
      datos: productos,
      estadisticas,
    };
  } catch (error) {
    console.error("Error generando reporte de inventario:", error);
    throw error;
  }
};

// Función para generar reporte de asistencia (placeholder - se puede expandir)
export const generarReporteAsistencia = async (fechaInicio, fechaFin) => {
  try {
    // Por ahora retornamos datos de ejemplo
    // En el futuro esto se conectará con un endpoint de asistencia
    const empleadosResponse = await getAllEmpleado();
    const empleados = empleadosResponse.data.filter((e) => e.activo);

    return {
      tipo: "asistencia",
      fechaGeneracion: new Date().toISOString(),
      fechaInicio,
      fechaFin,
      datos: empleados.map((emp) => ({
        empleado: `${emp.nombre} ${emp.apellido}`,
        rut: emp.rut,
        cargo: emp.cargo,
        diasTrabajados: 0, // Se calcularía con datos reales
        horasTrabajadas: 0,
        ausencias: 0,
        tardanzas: 0,
      })),
      estadisticas: {
        totalEmpleados: empleados.length,
        totalDiasTrabajados: 0,
        totalHorasTrabajadas: 0,
        totalAusencias: 0,
        totalTardanzas: 0,
      },
    };
  } catch (error) {
    console.error("Error generando reporte de asistencia:", error);
    throw error;
  }
};

// Función principal para generar reportes
export const generarReporte = async (tipoReporte, fechaInicio, fechaFin) => {
  switch (tipoReporte) {
    case "Empleados":
      return await generarReporteEmpleados(fechaInicio, fechaFin);
    case "Inventario":
      return await generarReporteInventario(fechaInicio, fechaFin);
    case "Asistencia":
      return await generarReporteAsistencia(fechaInicio, fechaFin);
    default:
      throw new Error(`Tipo de reporte no válido: ${tipoReporte}`);
  }
};

