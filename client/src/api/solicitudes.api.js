const API_BASE_URL = 'http://localhost:8000/api';

class SolicitudesAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/`);
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
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`);
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
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitudData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, solicitudData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitudData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la solicitud');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async partialUpdate(id, solicitudData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la solicitud');
      }
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/?search=${encodeURIComponent(query)}`);
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
      const response = await fetch(`${API_BASE_URL}/empleado/solicitudes/?estado=${estado}`);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/empleado/tipos-solicitudes/`);
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

