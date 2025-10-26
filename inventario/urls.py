from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventarioViewSet

# Crear router para el ViewSet
router = DefaultRouter()
router.register(r'inventario', InventarioViewSet, basename='inventario')

urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

# Las rutas disponibles serán:
# GET    /api/inventario/                    - Listar todos los inventarios
# POST   /api/inventario/                    - Crear nuevo inventario
# GET    /api/inventario/{id}/               - Obtener inventario específico
# PUT    /api/inventario/{id}/               - Actualizar inventario completo
# PATCH  /api/inventario/{id}/               - Actualizar inventario parcial
# DELETE /api/inventario/{id}/               - Eliminar inventario
# GET    /api/inventario/stats/              - Estadísticas del inventario
# POST   /api/inventario/{id}/update_stock/  - Actualizar stock
# GET    /api/inventario/low_stock/          - Productos con stock bajo
# GET    /api/inventario/expiring_soon/      - Productos por vencer
# GET    /api/inventario/expired/            - Productos vencidos
# GET    /api/inventario/by_category/        - Productos por categoría
# GET    /api/inventario/search/             - Búsqueda de productos
