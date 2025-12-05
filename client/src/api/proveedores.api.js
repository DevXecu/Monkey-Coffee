const API_BASE_URL = 'http://localhost:8000/api';

class ProveedoresAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching proveedor:', error);
      throw error;
    }
  }

  async create(proveedorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating proveedor:', error);
      throw error;
    }
  }

  async update(id, proveedorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating proveedor:', error);
      throw error;
    }
  }

  async partialUpdate(id, proveedorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error partially updating proveedor:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching proveedores:', error);
      throw error;
    }
  }

  async getHistorialCompras(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/historial_compras/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching historial compras:', error);
      throw error;
    }
  }

  async getActivos() {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/activos/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching proveedores activos:', error);
      throw error;
    }
  }
}

class OrdenesCompraAPI {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ordenes compra:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orden compra:', error);
      throw error;
    }
  }

  async create(ordenData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating orden compra:', error);
      throw error;
    }
  }

  async update(id, ordenData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating orden compra:', error);
      throw error;
    }
  }

  async partialUpdate(id, ordenData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error partially updating orden compra:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting orden compra:', error);
      throw error;
    }
  }

  async aprobar(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/aprobar/`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error aprobando orden compra:', error);
      throw error;
    }
  }

  async recibir(id, items) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/recibir/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error recibiendo orden compra:', error);
      throw error;
    }
  }

  async agregarItem(id, itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/agregar_item/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error agregando item a orden compra:', error);
      throw error;
    }
  }

  async eliminarItem(id, itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}/eliminar_item/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error eliminando item de orden compra:', error);
      throw error;
    }
  }

  async getPorProveedor(proveedorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/por_proveedor/?proveedor_id=${proveedorId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ordenes por proveedor:', error);
      throw error;
    }
  }

  async getEstadisticas() {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes-compra/estadisticas/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching estadisticas ordenes compra:', error);
      throw error;
    }
  }
}

export const proveedoresAPI = new ProveedoresAPI();
export const ordenesCompraAPI = new OrdenesCompraAPI();

