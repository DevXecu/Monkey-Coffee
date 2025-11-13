from django.urls import path, include
from rest_framework import routers
from empleado import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

router = routers.DefaultRouter()
router.register(r'empleado', views.EmpleadoView, 'empleado')
router.register(r'asistencia', views.AsistenciaView, 'asistencia')
router.register(r'turno', views.TurnoView, 'turno')

urlpatterns = [
    # Endpoint de estadísticas de asistencia (debe ir antes del router para evitar conflictos)
    path('asistencia/estadisticas/', views.estadisticas_asistencia, name='estadisticas_asistencia'),
    
    # Endpoint de autenticación
    path('auth/login/', views.login, name='login'),
    
    # Rutas del router (deben ir después de las rutas personalizadas)
    path("", include(router.urls)),

    # Endpoint para generar el esquema OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Página de documentación interactiva (Swagger)
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Otra opción de documentación (Redoc)
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
