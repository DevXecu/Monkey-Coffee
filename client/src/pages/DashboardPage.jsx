import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmpleado } from "../api/empleado.api";
import { inventarioAPI } from "../api/inventario.api";
import { getAllAsistencia, getEstadisticasAsistencia } from "../api/asistencia.api";
import { getAllTurnos } from "../api/turno.api";
import { solicitudesAPI } from "../api/solicitudes.api";
import { formatCurrency, formatNumber } from "../utils/currencyUtils";

// Componente de gráfico de barras simple
const BarChart = ({ data, labels, colors, height = 200 }) => {
  const maxValue = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px` }}>
      {data.map((value, index) => {
        const barHeight = (value / maxValue) * 80;
        const x = (index * barWidth) + (barWidth * 0.1);
        const width = barWidth * 0.8;
        const y = 90 - barHeight;
        const color = colors[index % colors.length];

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={width}
              height={barHeight}
              fill={color}
              className="transition-all duration-300 hover:opacity-80"
            />
            <text
              x={x + width / 2}
              y={y - 2}
              textAnchor="middle"
              fontSize="3"
              fill="#374151"
              fontWeight="600"
            >
              {value}
            </text>
            <text
              x={x + width / 2}
              y="95"
              textAnchor="middle"
              fontSize="2.5"
              fill="#6B7280"
            >
              {labels[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Componente de gráfico de líneas simple
const LineChart = ({ data, labels, color = "#3B82F6", height = 200 }) => {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  const pointSpacing = 100 / (data.length - 1 || 1);

  const points = data.map((value, index) => {
    const x = index * pointSpacing;
    const y = 90 - ((value - minValue) / range) * 80;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,90 ${points} 100,90`;

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${height}px` }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        points={areaPoints}
        fill="url(#lineGradient)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = index * pointSpacing;
        const y = 90 - ((value - minValue) / range) * 80;
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              className="transition-all duration-300 hover:r-2"
            />
            <text
              x={x}
              y={y - 3}
              textAnchor="middle"
              fontSize="2.5"
              fill="#374151"
              fontWeight="600"
            >
              {value}
            </text>
            {index % Math.ceil(data.length / 5) === 0 && (
              <text
                x={x}
                y="95"
                textAnchor="middle"
                fontSize="2"
                fill="#6B7280"
              >
                {labels[index]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Componente de gráfico circular (donut)
const DonutChart = ({ data, labels, colors, size = 150 }) => {
  const total = data.reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-gray-400 text-sm">Sin datos</p>
      </div>
    );
  }

  let currentAngle = -90;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ width: size, height: size }}>
      {data.map((value, index) => {
        const percentage = (value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          "Z"
        ].join(" ");

        currentAngle = endAngle;

        return (
          <path
            key={index}
            d={pathData}
            fill={colors[index % colors.length]}
            className="transition-all duration-300 hover:opacity-80"
          />
        );
      })}
      <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="white" />
      <text
        x={centerX}
        y={centerY - 5}
        textAnchor="middle"
        fontSize="6"
        fill="#374151"
        fontWeight="bold"
      >
        {total}
      </text>
      <text
        x={centerX}
        y={centerY + 5}
        textAnchor="middle"
        fontSize="3"
        fill="#6B7280"
      >
        Total
      </text>
    </svg>
  );
};

// Componente de KPI con tendencia
const KPICard = ({ title, value, subtitle, icon, color, trend, trendValue, onClick }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className={`bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && trendValue && (
                <div className={`flex items-center text-sm font-semibold ${trendColor}`}>
                  <span>{trendIcon}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// Función para obtener actividades del localStorage
const getRecentActivities = () => {
  try {
    const activities = localStorage.getItem('recentActivities');
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Error al cargar actividades:', error);
    return [];
  }
};

// Función para calcular tiempo relativo
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

// Función para obtener estadísticas de asistencia del día
const getAsistenciaStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await getEstadisticasAsistencia(today);
    const stats = response.data || {};
    
    return {
      presentes: stats.presentes || 0,
      tardes: stats.tardes || 0,
      ausentes: stats.ausentes || 0,
      justificados: stats.justificados || 0,
      permisos: stats.permisos || 0,
      total: stats.total_registrados || 0,
      totalEmpleados: stats.total_empleados || 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de asistencia:', error);
    // Fallback: obtener datos manualmente
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getAllAsistencia({ fecha: today });
      const asistencias = response.data || [];
      
      return {
        presentes: asistencias.filter(a => a.estado === 'presente').length,
        tardes: asistencias.filter(a => a.estado === 'tarde').length,
        ausentes: asistencias.filter(a => a.estado === 'ausente').length,
        justificados: asistencias.filter(a => a.estado === 'justificado').length,
        permisos: asistencias.filter(a => a.estado === 'permiso').length,
        total: asistencias.length,
        totalEmpleados: 0
      };
    } catch (fallbackError) {
      console.error('Error en fallback de estadísticas:', fallbackError);
      return { presentes: 0, tardes: 0, ausentes: 0, justificados: 0, permisos: 0, total: 0, totalEmpleados: 0 };
    }
  }
};

// Función para obtener datos de los últimos 7 días
const getLast7DaysData = async () => {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      const asistenciaResponse = await getAllAsistencia({ fecha: dateStr });
      const asistencias = asistenciaResponse.data || [];
      const presentes = asistencias.filter(a => a.estado === 'presente' || a.estado === 'tarde').length;
      
      days.push({
        date: dateStr,
        label: date.toLocaleDateString('es-CL', { weekday: 'short' }),
        presentes
      });
    } catch (error) {
      days.push({ date: dateStr, label: date.toLocaleDateString('es-CL', { weekday: 'short' }), presentes: 0 });
    }
  }
  
  return days;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    empleadosActivos: 0,
    empleadosTotal: 0,
    productosActivos: 0,
    inventarioDisponible: 0,
    inventarioAgotado: 0,
    inventarioPorVencer: 0,
    inventarioVencido: 0,
    valorInventario: 0,
    asistenciaHoy: { presentes: 0, tardes: 0, ausentes: 0, total: 0 },
    turnosActivos: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [inventarioPorCategoria, setInventarioPorCategoria] = useState([]);
  const [topProductos, setTopProductos] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadActivities();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener empleados
      const empleadosResponse = await getAllEmpleado();
      const empleadosActivos = empleadosResponse.data.filter(emp => emp.activo).length;
      const empleadosTotal = empleadosResponse.data.length;
      
      // Obtener inventario
      const inventarioResponse = await inventarioAPI.getAll();
      const inventarioActivo = inventarioResponse.filter(item => item.activo).length;
      const inventarioDisponible = inventarioResponse.filter(item => item.estado === 'disponible').length;
      const inventarioAgotado = inventarioResponse.filter(item => item.estado === 'agotado').length;
      const inventarioPorVencer = inventarioResponse.filter(item => item.estado === 'por_vencer').length;
      const inventarioVencido = inventarioResponse.filter(item => item.estado === 'vencido').length;
      
      // Calcular valor total del inventario
      const valorInventario = inventarioResponse.reduce((total, item) => {
        const valor = (item.precio_unitario || 0) * (item.cantidad_actual || 0);
        return total + valor;
      }, 0);

      // Análisis por categoría
      const categoriaMap = {};
      inventarioResponse.forEach(item => {
        const categoria = item.categoria || 'Sin categoría';
        if (!categoriaMap[categoria]) {
          categoriaMap[categoria] = { cantidad: 0, valor: 0 };
        }
        categoriaMap[categoria].cantidad += item.cantidad_actual || 0;
        categoriaMap[categoria].valor += (item.precio_unitario || 0) * (item.cantidad_actual || 0);
      });
      setInventarioPorCategoria(Object.entries(categoriaMap).map(([cat, data]) => ({
        categoria: cat,
        cantidad: data.cantidad,
        valor: data.valor
      })));

      // Top productos por valor
      const productosConValor = inventarioResponse
        .map(item => ({
          nombre: item.nombre_producto,
          valor: (item.precio_unitario || 0) * (item.cantidad_actual || 0),
          cantidad: item.cantidad_actual || 0
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      setTopProductos(productosConValor);
      
      // Obtener estadísticas de asistencia
      const asistenciaStats = await getAsistenciaStats();
      
      // Obtener turnos activos
      let turnosActivos = 0;
      try {
        const turnosResponse = await getAllTurnos();
        const turnos = turnosResponse.data || [];
        const today = new Date().toISOString().split('T')[0];
        turnosActivos = turnos.filter(t => {
          const fechaInicio = t.fecha_inicio?.split('T')[0] || t.fecha_inicio;
          const fechaFin = t.fecha_fin?.split('T')[0] || t.fecha_fin;
          return fechaInicio <= today && fechaFin >= today && t.activo;
        }).length;
      } catch (error) {
        console.error('Error al obtener turnos:', error);
      }

      // Obtener solicitudes
      let solicitudesPendientes = 0;
      let solicitudesAprobadas = 0;
      let solicitudesRechazadas = 0;
      try {
        const solicitudesResponse = await solicitudesAPI.getAll();
        const solicitudes = solicitudesResponse || [];
        solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
        solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
        solicitudesRechazadas = solicitudes.filter(s => s.estado === 'rechazada').length;
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
      }

      // Obtener datos de los últimos 7 días
      const last7Days = await getLast7DaysData();
      setLast7DaysData(last7Days);
      
      setStats({
        empleadosActivos,
        empleadosTotal,
        productosActivos: inventarioActivo,
        inventarioDisponible,
        inventarioAgotado,
        inventarioPorVencer,
        inventarioVencido,
        valorInventario,
        asistenciaHoy: asistenciaStats,
        turnosActivos,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesRechazadas,
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = () => {
    const activities = getRecentActivities();
    setRecentActivities(activities.slice(0, 10));
  };

  const kpiCards = [
    {
      title: 'Empleados Activos',
      value: loading ? '...' : `${stats.empleadosActivos}`,
      subtitle: `de ${stats.empleadosTotal} empleados totales`,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      trend: stats.empleadosActivos > 0 ? 'up' : null,
      trendValue: `${Math.round((stats.empleadosActivos / stats.empleadosTotal) * 100)}%`,
      onClick: () => navigate('/empleado'),
    },
    {
      title: 'Asistencia Hoy',
      value: loading ? '...' : `${stats.asistenciaHoy.presentes + stats.asistenciaHoy.tardes}`,
      subtitle: `${stats.asistenciaHoy.ausentes} ausentes`,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
      trend: stats.asistenciaHoy.presentes > 0 ? 'up' : null,
      onClick: () => navigate('/asistencia'),
    },
    {
      title: 'Valor Inventario',
      value: loading ? '...' : formatCurrency(stats.valorInventario),
      subtitle: `${stats.productosActivos} productos activos`,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-600',
      onClick: () => navigate('/inventario'),
    },
    {
      title: 'Turnos Activos',
      value: loading ? '...' : stats.turnosActivos,
      subtitle: 'En curso',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600',
      onClick: () => navigate('/turnos'),
    },
    {
      title: 'Solicitudes Pendientes',
      value: loading ? '...' : stats.solicitudesPendientes,
      subtitle: `${stats.solicitudesAprobadas} aprobadas este mes`,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-orange-100 text-orange-600',
      trend: stats.solicitudesPendientes > 0 ? 'down' : null,
      onClick: () => navigate('/solicitudes'),
    },
    {
      title: 'Inventario Disponible',
      value: loading ? '...' : stats.inventarioDisponible,
      subtitle: `${stats.inventarioAgotado} productos agotados`,
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-indigo-100 text-indigo-600',
      trend: stats.inventarioAgotado > 0 ? 'down' : 'up',
      onClick: () => navigate('/inventario'),
    },
  ];

  const asistenciaData = [
    stats.asistenciaHoy.presentes,
    stats.asistenciaHoy.tardes,
    stats.asistenciaHoy.ausentes,
    stats.asistenciaHoy.justificados || 0,
    stats.asistenciaHoy.permisos || 0,
  ];
  const asistenciaLabels = ['Presentes', 'Tardes', 'Ausentes', 'Justificados', 'Permisos'];
  const asistenciaColors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  const solicitudesData = [
    stats.solicitudesPendientes,
    stats.solicitudesAprobadas,
    stats.solicitudesRechazadas,
  ];
  const solicitudesLabels = ['Pendientes', 'Aprobadas', 'Rechazadas'];
  const solicitudesColors = ['#F59E0B', '#10B981', '#EF4444'];

  const last7DaysLabels = last7DaysData.map(d => d.label);
  const last7DaysValues = last7DaysData.map(d => d.presentes);

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligencia de Negocios</h1>
          <p className="text-gray-600 mt-1">Análisis completo y métricas en tiempo real de Monkey Coffee</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-CL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Alertas Críticas */}
      {(stats.inventarioAgotado > 0 || stats.inventarioPorVencer > 0 || stats.inventarioVencido > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Alertas de Inventario</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.inventarioAgotado > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Productos Agotados</p>
                    <p className="text-2xl font-bold text-red-900">{stats.inventarioAgotado}</p>
                  </div>
                )}
                {stats.inventarioPorVencer > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">Por Vencer</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.inventarioPorVencer}</p>
                  </div>
                )}
                {stats.inventarioVencido > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Vencidos</p>
                    <p className="text-2xl font-bold text-red-900">{stats.inventarioVencido}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos y Análisis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Asistencia - Distribución */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Asistencia Hoy</h3>
          <div className="flex items-center justify-center">
            <DonutChart
              data={asistenciaData}
              labels={asistenciaLabels}
              colors={asistenciaColors}
              size={200}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {asistenciaLabels.map((label, index) => (
              <div key={label} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded`} style={{ backgroundColor: asistenciaColors[index] }}></div>
                <span className="text-sm text-gray-600">{label}: {asistenciaData[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Tendencia - Últimos 7 días */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Asistencia (Últimos 7 días)</h3>
          {last7DaysData.length > 0 ? (
            <LineChart
              data={last7DaysValues}
              labels={last7DaysLabels}
              color="#3B82F6"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Cargando datos...</p>
            </div>
          )}
        </div>

        {/* Gráfico de Solicitudes */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Solicitudes</h3>
          <div className="flex items-center justify-center">
            <DonutChart
              data={solicitudesData}
              labels={solicitudesLabels}
              colors={solicitudesColors}
              size={200}
            />
          </div>
          <div className="mt-4 space-y-2">
            {solicitudesLabels.map((label, index) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded`} style={{ backgroundColor: solicitudesColors[index] }}></div>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{solicitudesData[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Productos por Valor */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Productos por Valor</h3>
          {topProductos.length > 0 ? (
            <div className="space-y-4">
              {topProductos.map((producto, index) => {
                const maxValor = Math.max(...topProductos.map(p => p.valor), 1);
                const porcentaje = (producto.valor / maxValor) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">{producto.nombre}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2">{formatCurrency(producto.valor)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Cantidad: {formatNumber(producto.cantidad)} unidades
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
      </div>

      {/* Análisis de Inventario por Categoría */}
      {inventarioPorCategoria.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario por Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventarioPorCategoria.map((cat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-800 mb-2">{cat.categoria}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cantidad:</span>
                    <span className="font-semibold text-gray-900">{formatNumber(cat.cantidad)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(cat.valor)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividad Reciente y Acciones Rápidas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activities */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0">
                      <span className="text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No hay actividad reciente</p>
                  <p className="text-xs text-gray-400">Las acciones que realices se mostrarán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
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
                onClick={() => navigate('/inventario-create')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
              >
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-green-700">Agregar Producto</p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/asistencia')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
              >
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-purple-700">Ver Asistencias</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
