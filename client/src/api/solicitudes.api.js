const API_BASE_URL = 'http://localhost:8000/api';

// Función helper para obtener headers con información del empleado
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Obtener información del empleado desde localStorage
  const empleado = localStorage.getItem("empleado");
  if (empleado) {
    try {
      const empleadoData = JSON.parse(empleado);
      // Agregar RUT y rol del empleado en los headers
      if (empleadoData.rut) {
        const rutNormalizado = empleadoData.rut.replace(/[^0-9kK]/g, '').toUpperCase();
        headers['X-Empleado-Rut'] = rutNormalizado;
      }
      if (empleadoData.rol) {
        const rolNormalizado = empleadoData.rol.toLowerCase().trim();
        headers['X-Empleado-Rol'] = rolNormalizado;
      }
    } catch (error) {
      console.error("Error parsing empleado from localStorage:", error);
    }
  }
  
  return headers;
};

class SolicitudesAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  async create(solicitudData) {
    try {
      console.log('Enviando datos a crear solicitud:', solicitudData);
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(solicitudData),
      });
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error('Error data recibido:', errorData);
        } catch (e) {
          console.error('No se pudo parsear el error como JSON');
          const text = await response.text();
          console.error('Respuesta de error (texto):', text);
          errorData = { detail: text || `Error ${response.status}: ${response.statusText}` };
        }
        
        const error = new Error(errorData.detail || errorData.error || 'Error al crear la solicitud');
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      
      const result = await response.json();
      console.log('Solicitud creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en create:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      throw error;
    }
  }

  async update(id, solicitudData) {
    try {
      console.log('Enviando datos para actualizar solicitud:', id, solicitudData);
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(solicitudData),
      });
      
      console.log('Respuesta del servidor (update):', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error('Error data recibido (update):', errorData);
        } catch (e) {
          console.error('No se pudo parsear el error como JSON (update)');
          const text = await response.text();
          console.error('Respuesta de error (texto):', text);
          errorData = { detail: text || `Error ${response.status}: ${response.statusText}` };
        }
        
        const error = new Error(errorData.detail || errorData.error || 'Error al actualizar la solicitud');
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      
      const result = await response.json();
      console.log('Solicitud actualizada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en update:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      throw error;
    }
  }

  async partialUpdate(id, solicitudData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(solicitudData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en partialUpdate:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.detail || errorData.error || 'Error al eliminar la solicitud');
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/?search=${encodeURIComponent(query)}`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al buscar solicitudes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  async filterByEstado(estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/?estado=${estado}`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al filtrar solicitudes por estado');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en filterByEstado:', error);
      throw error;
    }
  }

  async aprobar(id, aprobadoPor, comentario = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/aprobar/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          aprobado_por: aprobadoPor,
          comentario_aprobacion: comentario,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al aprobar la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en aprobar:', error);
      throw error;
    }
  }

  async rechazar(id, aprobadoPor, comentario = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/rechazar/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          aprobado_por: aprobadoPor,
          comentario_aprobacion: comentario,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al rechazar la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en rechazar:', error);
      throw error;
    }
  }

  async getTiposSolicitudes() {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tipos-solicitudes/`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Error al obtener los tipos de solicitudes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getTiposSolicitudes:', error);
      throw error;
    }
  }
}

export const solicitudesAPI = new SolicitudesAPI();

