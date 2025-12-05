import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { inventarioAPI } from "../api/inventario.api";
import { getAllAsistencia, getEstadisticasAsistencia } from "../api/asistencia.api";
import { getAllTurnos } from "../api/turno.api";
import { solicitudesAPI } from "../api/solicitudes.api";
import { formatCurrency, formatNumber } from "../utils/currencyUtils";

// Componente de gráfico de área apilado avanzado
const AreaChart = ({ data, labels, colors, height = 250, title }) => {
  const maxValue = Math.max(...data.flatMap(d => d.values), 1);
  const pointSpacing = 100 / (data[0]?.values.length - 1 || 1);
  
  const generatePath = (values, color, index) => {
    const points = values.map((value, i) => {
      const x = i * pointSpacing;
      const y = 90 - (value / maxValue) * 80;
      return `${x},${y}`;
    }).join(" ");
    
    const firstX = 0;
    const firstY = 90;
    const lastX = (values.length - 1) * pointSpacing;
    const lastY = 90;
    
    return `M ${firstX},${firstY} L ${points} L ${lastX},${lastY} Z`;
  };

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
      <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px` }}>
        <defs>
          {colors.map((color, i) => (
            <linearGradient key={i} id={`areaGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          ))}
        </defs>
        {data.map((series, seriesIndex) => (
          <path
            key={seriesIndex}
            d={generatePath(series.values, colors[seriesIndex], seriesIndex)}
            fill={`url(#areaGradient${seriesIndex})`}
            stroke={colors[seriesIndex]}
            strokeWidth="0.3"
            className="transition-all duration-500"
          />
        ))}
        {data[0]?.values.map((_, index) => {
          const x = index * pointSpacing;
          if (index % Math.ceil(data[0].values.length / 6) === 0) {
            return (
              <g key={index}>
                <line x1={x} y1="90" x2={x} y2="92" stroke="#9CA3AF" strokeWidth="0.5" />
                <text
                  x={x}
                  y="95"
                  textAnchor="middle"
                  fontSize="2"
                  fill="#6B7280"
                >
                  {labels[index]}
                </text>
              </g>
            );
          }
          return null;
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((series, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[index] }}></div>
            <span className="text-xs text-gray-600">{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de gráfico de barras agrupadas
const GroupedBarChart = ({ data, labels, colors, height = 250 }) => {
  const maxValue = Math.max(...data.flatMap(group => group.values), 1);
  const groupWidth = 100 / data.length;
  const barWidth = groupWidth / (data[0]?.values.length || 1) * 0.8;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px` }}>
      {data.map((group, groupIndex) => {
        const groupX = (groupIndex * groupWidth) + (groupWidth * 0.1);
        return group.values.map((value, barIndex) => {
          const barHeight = (value / maxValue) * 80;
          const x = groupX + (barIndex * barWidth);
          const y = 90 - barHeight;
          return (
            <g key={`${groupIndex}-${barIndex}`}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.9}
                height={barHeight}
                fill={colors[barIndex]}
                className="transition-all duration-300 hover:opacity-80"
              />
              {value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 1}
                  textAnchor="middle"
                  fontSize="2"
                  fill="#374151"
                  fontWeight="600"
                >
                  {value}
                </text>
              )}
            </g>
          );
        });
      })}
      {data.map((group, index) => {
        const x = (index * groupWidth) + (groupWidth / 2);
        return (
          <text
            key={index}
            x={x}
            y="95"
            textAnchor="middle"
            fontSize="2.5"
            fill="#6B7280"
          >
            {group.label}
          </text>
        );
      })}
    </svg>
  );
};

// Componente de gráfico de radar (spider chart)
const RadarChart = ({ data, labels, maxValue, size = 200 }) => {
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  const angleStep = (2 * Math.PI) / labels.length;
  
  const points = labels.map((_, index) => {
    const angle = (index * angleStep) - (Math.PI / 2);
    const value = data[index] || 0;
    const distance = (value / maxValue) * radius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return { x, y };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ width: size, height: size }}>
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <circle
          key={scale}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="0.3"
        />
      ))}
      
      {/* Grid lines */}
      {labels.map((_, index) => {
        const angle = (index * angleStep) - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth="0.3"
          />
        );
      })}
      
      {/* Data area */}
      <path
        d={pathData}
        fill="#3B82F6"
        fillOpacity="0.2"
        stroke="#3B82F6"
        strokeWidth="0.5"
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="1" fill="#3B82F6" />
          <text
            x={point.x + (point.x > centerX ? 2 : -2)}
            y={point.y + (point.y > centerY ? 2 : -2)}
            textAnchor={point.x > centerX ? "start" : "end"}
            fontSize="2"
            fill="#374151"
            fontWeight="600"
          >
            {data[index]}
          </text>
        </g>
      ))}
      
      {/* Labels */}
      {labels.map((label, index) => {
        const angle = (index * angleStep) - (Math.PI / 2);
        const x = centerX + (radius + 5) * Math.cos(angle);
        const y = centerY + (radius + 5) * Math.sin(angle);
        return (
          <text
            key={index}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="2.5"
            fill="#6B7280"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

// Componente de Heatmap
const HeatmapChart = ({ data, labels, height = 200 }) => {
  const maxValue = Math.max(...data.flatMap(row => row.values), 1);
  const cellWidth = 100 / data[0]?.values.length;
  const cellHeight = 80 / data.length;
  
  const getColor = (value) => {
    const intensity = value / maxValue;
    if (intensity === 0) return '#F3F4F6';
    if (intensity < 0.3) return '#DBEAFE';
    if (intensity < 0.6) return '#93C5FD';
    if (intensity < 0.8) return '#60A5FA';
    return '#3B82F6';
  };
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px` }}>
      {data.map((row, rowIndex) => 
        row.values.map((value, colIndex) => {
          const x = colIndex * cellWidth;
          const y = 10 + rowIndex * cellHeight;
          return (
            <g key={`${rowIndex}-${colIndex}`}>
              <rect
                x={x}
                y={y}
                width={cellWidth * 0.9}
                height={cellHeight * 0.9}
                fill={getColor(value)}
                stroke="#fff"
                strokeWidth="0.2"
                className="transition-all duration-300"
              />
              {value > 0 && (
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2}
                  textAnchor="middle"
                  fontSize="2"
                  fill={value > maxValue * 0.5 ? "#fff" : "#374151"}
                  fontWeight="600"
                >
                  {value}
                </text>
              )}
            </g>
          );
        })
      )}
      {labels.map((label, index) => (
        <text
          key={index}
          x={index * cellWidth + cellWidth / 2}
          y="95"
          textAnchor="middle"
          fontSize="2"
          fill="#6B7280"
        >
          {label}
        </text>
      ))}
    </svg>
  );
};

// Componente de KPI avanzado con múltiples métricas
const AdvancedKPICard = ({ title, primaryValue, primaryLabel, secondaryValue, secondaryLabel, icon, color, trend, trendValue, onClick, children }) => {
  const trendColor = trend === 'up' ? 'text-emerald-700 bg-emerald-50' : trend === 'down' ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-50';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className={`bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="flex items-baseline space-x-3">
              <p className="text-4xl font-bold text-gray-900">{primaryValue}</p>
              {trend && trendValue && (
                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${trendColor}`}>
                  <span className="mr-1">{trendIcon}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {primaryLabel && (
              <p className="text-xs text-gray-500 mt-2">{primaryLabel}</p>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${color}`}>
            {icon}
          </div>
        </div>
        {secondaryValue !== undefined && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{secondaryLabel}</span>
              <span className="text-lg font-semibold text-gray-900">{secondaryValue}</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Función para obtener estadísticas avanzadas de asistencia
const getAdvancedAsistenciaStats = async () => {
  try {
    const today = new Date();
    const stats = {
      hoy: { presentes: 0, tardes: 0, ausentes: 0, justificados: 0, permisos: 0, total: 0 },
      semana: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      mes: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      tendencia: []
    };
    
    // Estadísticas de hoy
    const todayStr = today.toISOString().split('T')[0];
    try {
      const response = await getEstadisticasAsistencia(todayStr);
      const data = response.data || {};
      stats.hoy = {
        presentes: data.presentes || 0,
        tardes: data.tardes || 0,
        ausentes: data.ausentes || 0,
        justificados: data.justificados || 0,
        permisos: data.permisos || 0,
        total: data.total_registrados || 0
      };
    } catch (error) {
      const response = await getAllAsistencia({ fecha: todayStr });
      const asistencias = response.data || [];
      stats.hoy = {
        presentes: asistencias.filter(a => a.estado === 'presente').length,
        tardes: asistencias.filter(a => a.estado === 'tarde').length,
        ausentes: asistencias.filter(a => a.estado === 'ausente').length,
        justificados: asistencias.filter(a => a.estado === 'justificado').length,
        permisos: asistencias.filter(a => a.estado === 'permiso').length,
        total: asistencias.length
      };
    }
    
    // Estadísticas de la semana
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      try {
        const response = await getAllAsistencia({ fecha: dateStr });
        const asistencias = response.data || [];
        const presentes = asistencias.filter(a => a.estado === 'presente' || a.estado === 'tarde').length;
        stats.semana.presentes += presentes;
        stats.semana.tardes += asistencias.filter(a => a.estado === 'tarde').length;
        stats.semana.ausentes += asistencias.filter(a => a.estado === 'ausente').length;
        stats.semana.total += asistencias.length;
        
        if (i < 7) {
          stats.tendencia.push({
            fecha: dateStr,
            label: date.toLocaleDateString('es-CL', { weekday: 'short' }),
            presentes
          });
        }
      } catch (error) {
        // Ignorar errores
      }
    }
    
    stats.tendencia.reverse();
    
    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas avanzadas:', error);
    return {
      hoy: { presentes: 0, tardes: 0, ausentes: 0, justificados: 0, permisos: 0, total: 0 },
      semana: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      mes: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      tendencia: []
    };
  }
};

// Función para obtener datos históricos de inventario
const getInventarioHistory = async () => {
  // Simulamos datos históricos basados en el estado actual
  // En producción, esto vendría de una API de historial
  return [];
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [stats, setStats] = useState({
    empleados: {
      activos: 0,
      total: 0,
      porDepartamento: {},
      promedioEdad: 0,
      rotacion: 0
    },
    inventario: {
      valorTotal: 0,
      productosActivos: 0,
      disponibles: 0,
      agotados: 0,
      porVencer: 0,
      vencidos: 0,
      porCategoria: [],
      topProductos: [],
      rotacion: 0
    },
    asistencia: {
      hoy: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      semana: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
      tendencia: [],
      promedioSemanal: 0,
      tasaAsistencia: 0
    },
    turnos: {
      activos: 0,
      total: 0,
      cobertura: 0
    },
    solicitudes: {
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      tasaAprobacion: 0,
      porTipo: {}
    },
    productividad: {
      indice: 0,
      eficiencia: 0,
      tendencia: []
    }
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [empleadosRes, inventarioRes, asistenciaStats, turnosRes, solicitudesRes] = await Promise.all([
        getAllEmpleado().catch(() => ({ data: [] })),
        inventarioAPI.getAll().catch(() => []),
        getAdvancedAsistenciaStats().catch(() => ({ hoy: {}, semana: {}, tendencia: [] })),
        getAllTurnos().catch(() => ({ data: [] })),
        solicitudesAPI.getAll().catch(() => [])
      ]);

      const empleados = empleadosRes.data || [];
      const inventario = inventarioRes || [];
      const turnos = turnosRes.data || [];
      const solicitudes = solicitudesRes || [];

      // Procesar empleados
      const empleadosActivos = empleados.filter(emp => emp.activo).length;
      const empleadosPorDept = {};
      let totalEdad = 0;
      let empleadosConEdad = 0;
      
      empleados.forEach(emp => {
        const dept = emp.departamento || 'Sin departamento';
        empleadosPorDept[dept] = (empleadosPorDept[dept] || 0) + 1;
        if (emp.fecha_nacimiento) {
          const edad = new Date().getFullYear() - new Date(emp.fecha_nacimiento).getFullYear();
          totalEdad += edad;
          empleadosConEdad++;
        }
      });

      // Procesar inventario
      const inventarioActivo = inventario.filter(item => item.activo);
      const valorTotal = inventarioActivo.reduce((total, item) => {
        return total + ((item.precio_unitario || 0) * (item.cantidad_actual || 0));
      }, 0);

      const categoriaMap = {};
      inventarioActivo.forEach(item => {
        const cat = item.categoria || 'Sin categoría';
        if (!categoriaMap[cat]) {
          categoriaMap[cat] = { cantidad: 0, valor: 0 };
        }
        categoriaMap[cat].cantidad += item.cantidad_actual || 0;
        categoriaMap[cat].valor += (item.precio_unitario || 0) * (item.cantidad_actual || 0);
      });

      const topProductos = inventarioActivo
        .map(item => ({
          nombre: item.nombre_producto,
          valor: (item.precio_unitario || 0) * (item.cantidad_actual || 0),
          cantidad: item.cantidad_actual || 0,
          categoria: item.categoria
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

      // Procesar turnos
      const today = new Date().toISOString().split('T')[0];
      const turnosActivos = turnos.filter(t => {
        const fechaInicio = t.fecha_inicio?.split('T')[0] || t.fecha_inicio;
        const fechaFin = t.fecha_fin?.split('T')[0] || t.fecha_fin;
        return fechaInicio <= today && fechaFin >= today && t.activo;
      }).length;

      // Procesar solicitudes
      const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
      const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
      const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'rechazada').length;
      const tasaAprobacion = solicitudes.length > 0 
        ? (solicitudesAprobadas / (solicitudesAprobadas + solicitudesRechazadas)) * 100 
        : 0;

      const solicitudesPorTipo = {};
      solicitudes.forEach(s => {
        const tipo = s.tipo_solicitud || 'Otro';
        solicitudesPorTipo[tipo] = (solicitudesPorTipo[tipo] || 0) + 1;
      });

      // Calcular métricas de productividad
      const tasaAsistencia = empleadosActivos > 0 
        ? ((asistenciaStats.hoy.presentes + asistenciaStats.hoy.tardes) / empleadosActivos) * 100 
        : 0;
      
      const promedioSemanal = asistenciaStats.tendencia.length > 0
        ? asistenciaStats.tendencia.reduce((sum, d) => sum + d.presentes, 0) / asistenciaStats.tendencia.length
        : 0;

      // Calcular métricas de inventario para productividad
      const inventarioDisponibles = inventarioActivo.filter(item => item.estado === 'disponible').length;
      const inventarioAgotados = inventarioActivo.filter(item => item.estado === 'agotado').length;
      const inventarioProductosActivos = inventarioActivo.length;
      const tasaDisponibilidadInventario = inventarioProductosActivos > 0
        ? (inventarioDisponibles / inventarioProductosActivos) * 100
        : 100;

      setStats({
        empleados: {
          activos: empleadosActivos,
          total: empleados.length,
          porDepartamento: empleadosPorDept,
          promedioEdad: empleadosConEdad > 0 ? Math.round(totalEdad / empleadosConEdad) : 0,
          rotacion: 0 // Se calcularía con datos históricos
        },
        inventario: {
          valorTotal,
          productosActivos: inventarioProductosActivos,
          disponibles: inventarioDisponibles,
          agotados: inventarioAgotados,
          porVencer: inventarioActivo.filter(item => item.estado === 'por_vencer').length,
          vencidos: inventarioActivo.filter(item => item.estado === 'vencido').length,
          porCategoria: Object.entries(categoriaMap).map(([cat, data]) => ({
            categoria: cat,
            cantidad: data.cantidad,
            valor: data.valor
          })),
          topProductos,
          rotacion: 0
        },
        asistencia: {
          ...asistenciaStats,
          promedioSemanal: Math.round(promedioSemanal),
          tasaAsistencia: Math.round(tasaAsistencia)
        },
        turnos: {
          activos: turnosActivos,
          total: turnos.length,
          cobertura: empleadosActivos > 0 ? Math.round((turnosActivos / empleadosActivos) * 100) : 0
        },
        solicitudes: {
          pendientes: solicitudesPendientes,
          aprobadas: solicitudesAprobadas,
          rechazadas: solicitudesRechazadas,
          tasaAprobacion: Math.round(tasaAprobacion),
          porTipo: solicitudesPorTipo
        },
        productividad: {
          indice: Math.round((tasaAsistencia + tasaDisponibilidadInventario) / 2),
          eficiencia: Math.round(tasaAsistencia),
          tendencia: asistenciaStats.tendencia
        }
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos
  const asistenciaTendenciaData = [
    {
      label: 'Presentes',
      values: stats.asistencia.tendencia.map(d => d.presentes)
    }
  ];

  const asistenciaTendenciaLabels = stats.asistencia.tendencia.map(d => d.label);

  const inventarioPorCategoriaData = stats.inventario.porCategoria.map(cat => ({
    label: cat.categoria.substring(0, 10),
    values: [cat.cantidad]
  }));

  const solicitudesPorTipoData = Object.entries(stats.solicitudes.porTipo).map(([tipo, count]) => ({
    label: tipo.substring(0, 8),
    values: [count]
  }));

  // Datos para heatmap de asistencia semanal
  const asistenciaHeatmapData = [
    { values: stats.asistencia.tendencia.map(d => d.presentes) }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdvancedKPICard
          title="Empleados Activos"
          primaryValue={loading ? '...' : stats.empleados.activos}
          primaryLabel={`de ${stats.empleados.total} total`}
          secondaryValue={stats.empleados.promedioEdad}
          secondaryLabel="Edad Promedio"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="bg-blue-50 text-blue-600"
          trend="up"
          trendValue={`${Math.round((stats.empleados.activos / stats.empleados.total) * 100)}%`}
          onClick={() => navigate('/empleado')}
        />
        
        <AdvancedKPICard
          title="Valor Inventario"
          primaryValue={loading ? '...' : formatCurrency(stats.inventario.valorTotal)}
          primaryLabel={`${stats.inventario.productosActivos} productos activos`}
          secondaryValue={stats.inventario.disponibles}
          secondaryLabel="Disponibles"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-amber-50 text-amber-600"
          onClick={() => navigate('/inventario')}
        />
        
        <AdvancedKPICard
          title="Tasa de Asistencia"
          primaryValue={loading ? '...' : `${stats.asistencia.tasaAsistencia}%`}
          primaryLabel={`${stats.asistencia.hoy.presentes + stats.asistencia.hoy.tardes} presentes hoy`}
          secondaryValue={stats.asistencia.promedioSemanal}
          secondaryLabel="Promedio Semanal"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-emerald-50 text-emerald-600"
          trend={stats.asistencia.tasaAsistencia >= 80 ? 'up' : 'down'}
          trendValue={`${stats.asistencia.tasaAsistencia >= 80 ? '+' : '-'}${Math.abs(stats.asistencia.tasaAsistencia - 80)}%`}
          onClick={() => navigate('/asistencia')}
        />
        
        <AdvancedKPICard
          title="Productividad"
          primaryValue={loading ? '...' : `${stats.productividad.indice}%`}
          primaryLabel="Índice General"
          secondaryValue={stats.productividad.eficiencia}
          secondaryLabel="Eficiencia"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="bg-indigo-50 text-indigo-600"
          trend={stats.productividad.indice >= 70 ? 'up' : 'down'}
          onClick={() => navigate('/reportes')}
        />
      </div>

      {/* Alertas Críticas */}
      {(stats.inventario.agotados > 0 || stats.inventario.porVencer > 0 || stats.inventario.vencidos > 0 || stats.solicitudes.pendientes > 5) && (
        <div className="bg-orange-50 border-l-4 border-orange-300 rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Alertas Requieren Atención</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.inventario.agotados > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-1">Productos Agotados</p>
                    <p className="text-3xl font-bold text-red-900">{stats.inventario.agotados}</p>
                  </div>
                )}
                {stats.inventario.porVencer > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-xs font-medium text-amber-700 mb-1">Por Vencer</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.inventario.porVencer}</p>
                  </div>
                )}
                {stats.inventario.vencidos > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-1">Vencidos</p>
                    <p className="text-3xl font-bold text-red-900">{stats.inventario.vencidos}</p>
                  </div>
                )}
                {stats.solicitudes.pendientes > 5 && (
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="text-xs font-medium text-orange-700 mb-1">Solicitudes Pendientes</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.solicitudes.pendientes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tendencia de Asistencia */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tendencia de Asistencia (7 días)</h3>
          {asistenciaTendenciaData[0]?.values.length > 0 ? (
            <AreaChart
              data={asistenciaTendenciaData}
              labels={asistenciaTendenciaLabels}
              colors={['#3B82F6']}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Cargando datos...</p>
            </div>
          )}
        </div>

        {/* Distribución de Inventario por Categoría */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Inventario por Categoría</h3>
          {inventarioPorCategoriaData.length > 0 ? (
            <GroupedBarChart
              data={inventarioPorCategoriaData}
              labels={stats.inventario.porCategoria.map(c => c.categoria.substring(0, 10))}
              colors={['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA']}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Análisis Detallados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Productos */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top 5 Productos por Valor</h3>
          {stats.inventario.topProductos.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {stats.inventario.topProductos.slice(0, 5).map((producto, index) => {
                const maxValor = Math.max(...stats.inventario.topProductos.map(p => p.valor), 1);
                const porcentaje = (producto.valor / maxValor) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-700 truncate flex-1">{producto.nombre}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(producto.valor)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Cantidad: {formatNumber(producto.cantidad)}</span>
                      <span>{Math.round(porcentaje)}% del total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Métricas de Solicitudes */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Estado de Solicitudes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-gray-700">Pendientes</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.solicitudes.pendientes}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-gray-700">Aprobadas</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.solicitudes.aprobadas}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-gray-700">Rechazadas</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.solicitudes.rechazadas}</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasa de Aprobación</span>
                <span className="text-lg font-bold text-gray-900">{stats.solicitudes.tasaAprobacion}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Turnos */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Cobertura de Turnos</h3>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E5E7EB"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#8B5CF6"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(stats.turnos.cobertura / 100) * 552} 552`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{stats.turnos.cobertura}%</span>
                <span className="text-sm text-gray-600">Cobertura</span>
              </div>
            </div>
            <div className="mt-6 space-y-2 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Turnos Activos</span>
                <span className="font-semibold text-gray-900">{stats.turnos.activos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Turnos</span>
                <span className="font-semibold text-gray-900">{stats.turnos.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Resumen de Categorías */}
      {stats.inventario.porCategoria.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Análisis Detallado por Categoría</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor Total</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.inventario.porCategoria.map((cat, index) => {
                  const porcentaje = (cat.valor / stats.inventario.valorTotal) * 100;
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {cat.categoria.charAt(0).toUpperCase() + cat.categoria.slice(1).toLowerCase()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatNumber(cat.cantidad)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(cat.valor)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12 text-right">{Math.round(porcentaje)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-2xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/empleado-create')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-700">Nuevo Empleado</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/asistencia')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-green-700">Ver Asistencias</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/reportes')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-orange-700">Ver Reportes</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/turnos')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-purple-700">Ver Turnos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
