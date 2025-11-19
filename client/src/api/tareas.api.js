const API_BASE_URL = 'http://localhost:8000/api';

class TareasAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/`);
      if (!response.ok) {
        throw new Error('Error al obtener las tareas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/`);
      if (!response.ok) {
        throw new Error('Error al obtener la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  async create(tareaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, tareaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async partialUpdate(id, tareaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en partialUpdate:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la tarea');
      }
      return true;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error al buscar tareas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  async filterByEstado(estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/?estado=${estado}`);
      if (!response.ok) {
        throw new Error('Error al filtrar tareas por estado');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en filterByEstado:', error);
      throw error;
    }
  }

  async filterByPrioridad(prioridad) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/?prioridad=${prioridad}`);
      if (!response.ok) {
        throw new Error('Error al filtrar tareas por prioridad');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en filterByPrioridad:', error);
      throw error;
    }
  }

  async completar(id, porcentaje = 100) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/completar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          porcentaje_completado: porcentaje,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al completar la tarea');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en completar:', error);
      throw error;
    }
  }

  async actualizarProgreso(id, porcentaje) {
    try {
      const response = await fetch(`${API_BASE_URL}/empleado/tareas/${id}/actualizar_progreso/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          porcentaje_completado: porcentaje,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar el progreso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en actualizarProgreso:', error);
      throw error;
    }
  }
}

export const tareasAPI = new TareasAPI();

