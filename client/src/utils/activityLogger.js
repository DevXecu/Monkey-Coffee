// Utilidad para registrar actividades del usuario

const MAX_ACTIVITIES = 50; // Máximo de actividades a guardar

// Iconos para cada tipo de actividad
const ACTIVITY_ICONS = {
  empleado_create: '👤',
  empleado_update: '✏️',
  empleado_delete: '🗑️',
  inventario_create: '📦',
  inventario_update: '✏️',
  inventario_delete: '🗑️',
  stock_update: '📊',
  asistencia_create: '📅',
  asistencia_update: '✏️',
  asistencia_delete: '🗑️',
  reporte_create: '📄',
  default: '📌',
};

/**
 * Registra una nueva actividad en localStorage
 * @param {string} type - Tipo de actividad (ej: 'empleado_create', 'inventario_update')
 * @param {string} message - Mensaje descriptivo de la actividad
 * @param {object} data - Datos adicionales opcionales
 */
export const logActivity = (type, message, data = {}) => {
  try {
    // Obtener actividades existentes
    const activities = getActivities();
    
    // Crear nueva actividad
    const newActivity = {
      type,
      message,
      icon: ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default,
      timestamp: new Date().toISOString(),
      data,
    };
    
    // Agregar al principio del array
    activities.unshift(newActivity);
    
    // Limitar el número de actividades
    const limitedActivities = activities.slice(0, MAX_ACTIVITIES);
    
    // Guardar en localStorage
    localStorage.setItem('recentActivities', JSON.stringify(limitedActivities));
    
    return true;
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    return false;
  }
};

/**
 * Obtiene todas las actividades registradas
 * @returns {Array} Array de actividades
 */
export const getActivities = () => {
  try {
    const activities = localStorage.getItem('recentActivities');
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
};

/**
 * Limpia todas las actividades registradas
 */
export const clearActivities = () => {
  try {
    localStorage.removeItem('recentActivities');
    return true;
  } catch (error) {
    console.error('Error al limpiar actividades:', error);
    return false;
  }
};

/**
 * Funciones helper para actividades comunes
 */
export const ActivityLogger = {
  // Empleados
  empleadoCreated: (nombre) => 
    logActivity('empleado_create', `Nuevo empleado registrado: ${nombre}`),
  
  empleadoUpdated: (nombre) => 
    logActivity('empleado_update', `Empleado actualizado: ${nombre}`),
  
  empleadoDeleted: (nombre) => 
    logActivity('empleado_delete', `Empleado eliminado: ${nombre}`),
  
  // Inventario
  productoCreated: (nombre) => 
    logActivity('inventario_create', `Nuevo producto agregado: ${nombre}`),
  
  productoUpdated: (nombre) => 
    logActivity('inventario_update', `Producto actualizado: ${nombre}`),
  
  productoDeleted: (nombre) => 
    logActivity('inventario_delete', `Producto eliminado: ${nombre}`),
  
  stockUpdated: (nombre, cantidad, tipo) => 
    logActivity('stock_update', `Stock ${tipo}: ${nombre} (${cantidad} unidades)`),
  
  // Asistencias
  asistenciaCreated: (nombre) => 
    logActivity('asistencia_create', `Nueva asistencia registrada: ${nombre}`),
  
  asistenciaUpdated: (nombre) => 
    logActivity('asistencia_update', `Asistencia actualizada: ${nombre}`),
  
  asistenciaDeleted: (nombre) => 
    logActivity('asistencia_delete', `Asistencia eliminada: ${nombre}`),
  
  // Reportes
  reporteCreated: (tipo) => 
    logActivity('reporte_create', `Reporte generado: ${tipo}`),
};

