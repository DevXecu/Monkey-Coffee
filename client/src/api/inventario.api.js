const API_BASE_URL = 'http://localhost:8000/api';

class InventarioAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventarios:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventario:', error);
      throw error;
    }
  }

  async create(inventarioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventarioData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating inventario:', error);
      throw error;
    }
  }

  async update(id, inventarioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventarioData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating inventario:', error);
      throw error;
    }
  }

  async partialUpdate(id, inventarioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventarioData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error partially updating inventario:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting inventario:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching inventarios:', error);
      throw error;
    }
  }

  async filterByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/?categoria=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error filtering inventarios by category:', error);
      throw error;
    }
  }

  async filterByEstado(estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/?estado=${encodeURIComponent(estado)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error filtering inventarios by estado:', error);
      throw error;
    }
  }

  async getLowStock() {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/?low_stock=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching low stock inventarios:', error);
      throw error;
    }
  }

  async getExpiringSoon() {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/?expiring_soon=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching expiring soon inventarios:', error);
      throw error;
    }
  }

  async updateStock(id, cantidad, tipo = 'ingreso', notas = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${id}/update_stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad,
          tipo, // 'ingreso', 'egreso', 'ajuste'
          notas
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/stats/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventario stats:', error);
      throw error;
    }
  }
}

export const inventarioAPI = new InventarioAPI();
