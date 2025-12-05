from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProveedorViewSet, OrdenCompraViewSet

# Crear router para los ViewSets
router = DefaultRouter()
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')
router.register(r'ordenes-compra', OrdenCompraViewSet, basename='orden-compra')

urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

# Las rutas disponibles serán:
# PROVEEDORES:
# GET    /api/proveedores/                    - Listar todos los proveedores
# POST   /api/proveedores/                    - Crear nuevo proveedor
# GET    /api/proveedores/{id}/               - Obtener proveedor específico
# PUT    /api/proveedores/{id}/               - Actualizar proveedor completo
# PATCH  /api/proveedores/{id}/               - Actualizar proveedor parcial
# DELETE /api/proveedores/{id}/               - Eliminar proveedor (soft delete)
# GET    /api/proveedores/{id}/historial_compras/ - Historial de compras del proveedor
# GET    /api/proveedores/activos/            - Solo proveedores activos
#
# ÓRDENES DE COMPRA:
# GET    /api/ordenes-compra/                 - Listar todas las órdenes
# POST   /api/ordenes-compra/                 - Crear nueva orden
# GET    /api/ordenes-compra/{id}/            - Obtener orden específica
# PUT    /api/ordenes-compra/{id}/            - Actualizar orden completa
# PATCH  /api/ordenes-compra/{id}/            - Actualizar orden parcial
# DELETE /api/ordenes-compra/{id}/            - Eliminar orden
# POST   /api/ordenes-compra/{id}/aprobar/   - Aprobar orden
# POST   /api/ordenes-compra/{id}/recibir/   - Marcar orden como recibida
# POST   /api/ordenes-compra/{id}/agregar_item/ - Agregar item a orden
# DELETE /api/ordenes-compra/{id}/eliminar_item/ - Eliminar item de orden
# GET    /api/ordenes-compra/por_proveedor/   - Órdenes por proveedor
# GET    /api/ordenes-compra/estadisticas/   - Estadísticas de órdenes

