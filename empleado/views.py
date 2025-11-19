from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from .serializer import (
    EmpleadoSerializer, AsistenciaSerializer, TurnoSerializer,
    SolicitudesSerializer, SolicitudesListSerializer, TiposSolicitudesSerializer,
    TareasSerializer, TareasListSerializer
)
from .models import Empleado, Asistencia, Turno, Solicitudes, TiposSolicitudes, Tareas
from django.db import connection, transaction
from django.utils import timezone
from datetime import date, datetime, timedelta
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import traceback

# Create your views here.
class EmpleadoView(viewsets.ModelViewSet):
    serializer_class = EmpleadoSerializer
    queryset = Empleado.objects.filter(activo=True)
    
    def create(self, request, *args, **kwargs):
        try:
            print("Datos recibidos (CREATE):", request.data)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            print("Error de validación (CREATE):", e.detail)
            # Manejar errores de validación (como RUT duplicado)
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al crear empleado:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            print("Datos recibidos (UPDATE):", request.data)
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            old_rut = instance.rut
            new_rut = request.data.get('rut', old_rut)
            
            # Si se está cambiando el RUT, necesitamos actualizar las referencias manualmente
            if new_rut and new_rut != old_rut:
                print(f"Cambiando RUT de {old_rut} a {new_rut}")
                with transaction.atomic():
                    try:
                        with connection.cursor() as cursor:
                            # Deshabilitar temporalmente las verificaciones de clave foránea
                            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                            
                            try:
                                # 1. Actualizar empleados_turnos (PRIMERO, ya que puede tener restricciones)
                                cursor.execute(
                                    "UPDATE empleados_turnos SET empleados_rut = %s WHERE empleados_rut = %s",
                                    [new_rut, old_rut]
                                )
                                updated_empleados_turnos = cursor.rowcount
                                print(f"Actualizados {updated_empleados_turnos} registros en empleados_turnos")
                                
                                # 2. Actualizar asistencias
                                cursor.execute(
                                    "UPDATE asistencias SET empleado_rut = %s WHERE empleado_rut = %s",
                                    [new_rut, old_rut]
                                )
                                updated_asistencias = cursor.rowcount
                                print(f"Actualizadas {updated_asistencias} asistencias")
                                
                                # 3. Actualizar turnos
                                cursor.execute(
                                    "UPDATE turnos SET empleados_rut = %s WHERE empleados_rut = %s",
                                    [new_rut, old_rut]
                                )
                                updated_turnos = cursor.rowcount
                                print(f"Actualizados {updated_turnos} turnos")
                                
                                # 4. Actualizar horarios (si existe la tabla)
                                try:
                                    cursor.execute(
                                        "UPDATE horarios SET empleado_rut = %s WHERE empleado_rut = %s",
                                        [new_rut, old_rut]
                                    )
                                    updated_horarios = cursor.rowcount
                                    print(f"Actualizados {updated_horarios} horarios")
                                except Exception as e:
                                    print(f"Tabla horarios no existe o error al actualizar: {str(e)}")
                                
                                # 5. Actualizar tareas (aunque tiene ON UPDATE CASCADE, lo hacemos explícitamente)
                                try:
                                    cursor.execute(
                                        "UPDATE tareas SET asignada_a_rut = %s WHERE asignada_a_rut = %s",
                                        [new_rut, old_rut]
                                    )
                                    updated_tareas_asignadas = cursor.rowcount
                                    cursor.execute(
                                        "UPDATE tareas SET creada_por_rut = %s WHERE creada_por_rut = %s",
                                        [new_rut, old_rut]
                                    )
                                    updated_tareas_creadas = cursor.rowcount
                                    cursor.execute(
                                        "UPDATE tareas SET aprobada_por_rut = %s WHERE aprobada_por_rut = %s",
                                        [new_rut, old_rut]
                                    )
                                    updated_tareas_aprobadas = cursor.rowcount
                                    print(f"Actualizadas {updated_tareas_asignadas} tareas asignadas, {updated_tareas_creadas} creadas, {updated_tareas_aprobadas} aprobadas")
                                except Exception as e:
                                    print(f"Tabla tareas no existe o error al actualizar: {str(e)}")
                                
                                # Nota: validado_por en asistencias referencia empleados.id, no rut, así que no necesita actualización
                                
                                # 6. Ahora actualizar el RUT del empleado directamente en la base de datos
                                cursor.execute(
                                    "UPDATE empleados SET rut = %s WHERE rut = %s",
                                    [new_rut, old_rut]
                                )
                                print(f"RUT actualizado en la tabla empleados de {old_rut} a {new_rut}")
                                
                            finally:
                                # Rehabilitar las verificaciones de clave foránea
                                cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                                
                    except Exception as db_error:
                        print(f"Error al actualizar referencias: {str(db_error)}")
                        raise db_error
                    
                    # Recargar la instancia desde la base de datos para obtener el nuevo RUT
                    instance.refresh_from_db()
                    
                    # Si el RUT ya fue actualizado, removerlo del request.data para evitar conflictos
                    # en la actualización del serializer
                    # Convertir request.data a un diccionario mutable
                    if hasattr(request.data, '_mutable'):
                        request_data_copy = request.data.copy()
                    else:
                        request_data_copy = dict(request.data)
                    
                    if 'rut' in request_data_copy:
                        # Ya actualizamos el RUT, así que lo removemos del serializer
                        # pero mantenemos el nuevo valor en la instancia
                        del request_data_copy['rut']
                    
                    # Usar el request_data_copy modificado para actualizar otros campos
                    serializer = self.get_serializer(instance, data=request_data_copy, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    self.perform_update(serializer)
                    return Response(serializer.data)
            
            # Si no se cambió el RUT, proceder con la actualización normal
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            print("Error de validación (UPDATE):", e.detail)
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al actualizar empleado:", str(e))
            print("Traceback:", traceback.format_exc())
            error_message = str(e)
            # Extraer mensaje más legible del error
            if "foreign key constraint" in error_message.lower():
                error_message = "Error de validación: No se puede actualizar el empleado debido a restricciones de clave foránea. Por favor, verifique que no haya conflictos con registros relacionados."
            return Response(
                {"error": error_message, "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: En lugar de eliminar físicamente el empleado,
        se cambia el campo 'activo' a False.
        """
        try:
            print("Desactivando empleado con ID:", kwargs.get('pk'))
            instance = self.get_object()
            
            # Soft delete: cambiar activo a False
            instance.activo = False
            instance.save()
            
            print(f"Empleado {instance.rut} desactivado correctamente")
            
            return Response(
                {"message": "Empleado desactivado correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Error al desactivar empleado:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Endpoint para autenticar empleados usando RUT y contraseña.
    Los empleados deben estar activos y tener un estado 'activo' para poder iniciar sesión.
    """
    try:
        rut = request.data.get('rut', '').strip()
        password = request.data.get('password', '').strip()
        
        # Validar que se proporcionen ambos campos
        if not rut:
            return Response(
                {"error": "El RUT es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not password:
            return Response(
                {"error": "La contraseña es requerida"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Normalizar el RUT: limpiar puntos y guiones, convertir a mayúsculas
        import re
        rut_normalizado = re.sub(r'[^0-9kK]', '', rut).upper()
        
        # Buscar empleado por RUT normalizado (sin formato)
        # Como los RUTs en la BD pueden tener formato, necesitamos comparar normalizados
        empleados = Empleado.objects.filter(activo=True, estado='activo')
        empleado = None
        
        for emp in empleados:
            # Normalizar el RUT del empleado de la BD
            rut_empleado_limpio = re.sub(r'[^0-9kK]', '', emp.rut).upper()
            if rut_empleado_limpio == rut_normalizado:
                empleado = emp
                break
        
        if not empleado:
            # No revelar si el RUT existe o no por seguridad
            return Response(
                {"error": "RUT o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar que el empleado tenga contraseña configurada
        if not empleado.password:
            return Response(
                {"error": "El empleado no tiene contraseña configurada. Contacte al administrador."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar contraseña con Argon2id
        ph = PasswordHasher()
        try:
            # Intentar verificar la contraseña con Argon2id
            ph.verify(empleado.password, password)
        except VerifyMismatchError:
            # Si falla la verificación, la contraseña es incorrecta
            return Response(
                {"error": "RUT o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            # Si hay otro error (por ejemplo, formato de hash inválido), 
            # podría ser una contraseña antigua en texto plano
            # Intentar comparación directa como fallback (para migración gradual)
            try:
                if empleado.password.strip() != password:
                    return Response(
                        {"error": "RUT o contraseña incorrectos"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except:
                return Response(
                    {"error": "RUT o contraseña incorrectos"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Serializar datos del empleado (el serializer ya excluye el password por write_only=True)
        serializer = EmpleadoSerializer(empleado)
        empleado_data = serializer.data
        
        # Asegurar que el password no se incluya en la respuesta
        if 'password' in empleado_data:
            empleado_data.pop('password')
        
        return Response({
            "message": "Login exitoso",
            "empleado": empleado_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error en login:", str(e))
        print("Traceback:", traceback.format_exc())
        return Response(
            {"error": "Error interno del servidor. Por favor, intente nuevamente."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class AsistenciaView(viewsets.ModelViewSet):
    serializer_class = AsistenciaSerializer
    queryset = Asistencia.objects.all()
    
    def get_queryset(self):
        queryset = Asistencia.objects.all().order_by('-fecha', '-hora_entrada')
        
        # Filtros opcionales
        empleado_rut = self.request.query_params.get('empleado_rut', None)
        fecha = self.request.query_params.get('fecha', None)
        estado = self.request.query_params.get('estado', None)
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
        if empleado_rut:
            queryset = queryset.filter(empleado_rut__rut=empleado_rut)
        
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        
        if estado:
            queryset = queryset.filter(estado=estado)
        
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al crear asistencia:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al actualizar asistencia:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([AllowAny])
def estadisticas_asistencia(request):
    """
    Endpoint para obtener estadísticas de asistencia
    """
    try:
        fecha = request.query_params.get('fecha', None)
        if not fecha:
            fecha = date.today()
        else:
            fecha = datetime.strptime(fecha, '%Y-%m-%d').date()
        
        # Contar asistencias por estado
        presentes = Asistencia.objects.filter(fecha=fecha, estado='presente').count()
        ausentes = Asistencia.objects.filter(fecha=fecha, estado='ausente').count()
        tardes = Asistencia.objects.filter(fecha=fecha, estado='tarde').count()
        justificados = Asistencia.objects.filter(fecha=fecha, estado='justificado').count()
        permisos = Asistencia.objects.filter(fecha=fecha, estado='permiso').count()
        
        # Total de empleados activos
        total_empleados = Empleado.objects.filter(activo=True).count()
        
        return Response({
            'fecha': fecha.isoformat(),
            'presentes': presentes,
            'ausentes': ausentes,
            'tardes': tardes,
            'justificados': justificados,
            'permisos': permisos,
            'total_empleados': total_empleados,
            'total_registrados': presentes + tardes + justificados + permisos
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error en estadísticas:", str(e))
        return Response(
            {"error": "Error al obtener estadísticas"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class TurnoView(viewsets.ModelViewSet):
    serializer_class = TurnoSerializer
    queryset = Turno.objects.filter(activo=True)
    
    def get_queryset(self):
        queryset = Turno.objects.filter(activo=True).order_by('-fecha_creacion')
        
        # Filtros opcionales
        empleado_rut = self.request.query_params.get('empleado_rut', None)
        activo = self.request.query_params.get('activo', None)
        
        if empleado_rut:
            queryset = queryset.filter(empleados_rut__rut=empleado_rut)
        
        if activo is not None:
            activo_bool = activo.lower() == 'true'
            queryset = queryset.filter(activo=activo_bool)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al crear turno:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al actualizar turno:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: En lugar de eliminar físicamente el turno,
        se cambia el campo 'activo' a False.
        """
        try:
            print("Desactivando turno con ID:", kwargs.get('pk'))
            instance = self.get_object()
            
            # Soft delete: cambiar activo a False
            instance.activo = False
            instance.save()
            
            print(f"Turno {instance.id} desactivado correctamente")
            
            return Response(
                {"message": "Turno desactivado correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Error al desactivar turno:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SolicitudesViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las solicitudes
    """
    queryset = Solicitudes.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'tipo_solicitud_id', 'empleado_id']
    search_fields = ['motivo', 'empleado_id__nombre', 'empleado_id__apellido']
    ordering_fields = ['fecha_creacion', 'fecha_inicio', 'fecha_fin']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        """Retornar el serializer apropiado según la acción"""
        if self.action == 'list':
            return SolicitudesListSerializer
        return SolicitudesSerializer

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar una solicitud"""
        solicitud = self.get_object()
        comentario = request.data.get('comentario_aprobacion', '')
        
        solicitud.estado = 'aprobada'
        solicitud.aprobado_por_id = request.data.get('aprobado_por')
        solicitud.fecha_aprobacion = timezone.now()
        solicitud.comentario_aprobacion = comentario
        solicitud.save()
        
        serializer = self.get_serializer(solicitud)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechazar una solicitud"""
        solicitud = self.get_object()
        comentario = request.data.get('comentario_aprobacion', '')
        
        solicitud.estado = 'rechazada'
        solicitud.aprobado_por_id = request.data.get('aprobado_por')
        solicitud.fecha_aprobacion = timezone.now()
        solicitud.comentario_aprobacion = comentario
        solicitud.save()
        
        serializer = self.get_serializer(solicitud)
        return Response(serializer.data)


class TiposSolicitudesViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los tipos de solicitudes
    """
    queryset = TiposSolicitudes.objects.filter(activo=True)
    serializer_class = TiposSolicitudesSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['activo', 'requiere_aprobacion']
    search_fields = ['nombre', 'descripcion']


class TareasViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las tareas
    """
    queryset = Tareas.objects.filter(activo=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'prioridad', 'tipo_tarea', 'asignada_a_rut', 'creada_por_rut']
    search_fields = ['titulo', 'descripcion', 'asignada_a_rut__nombre', 'asignada_a_rut__apellido']
    ordering_fields = ['fecha_creacion', 'fecha_vencimiento', 'prioridad']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        """Retornar el serializer apropiado según la acción"""
        if self.action == 'list':
            return TareasListSerializer
        return TareasSerializer

    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """Marcar una tarea como completada"""
        tarea = self.get_object()
        porcentaje = request.data.get('porcentaje_completado', 100)
        
        tarea.estado = 'completada'
        tarea.porcentaje_completado = porcentaje
        tarea.fecha_completada = timezone.now()
        tarea.save()
        
        serializer = self.get_serializer(tarea)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def actualizar_progreso(self, request, pk=None):
        """Actualizar el progreso de una tarea"""
        tarea = self.get_object()
        porcentaje = request.data.get('porcentaje_completado', tarea.porcentaje_completado)
        
        if porcentaje < 0 or porcentaje > 100:
            return Response(
                {'error': 'El porcentaje debe estar entre 0 y 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tarea.porcentaje_completado = porcentaje
        
        # Actualizar estado según el progreso
        if porcentaje == 100:
            tarea.estado = 'completada'
            tarea.fecha_completada = timezone.now()
        elif porcentaje > 0 and tarea.estado == 'pendiente':
            tarea.estado = 'en_proceso'
        
        tarea.save()
        
        serializer = self.get_serializer(tarea)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: En lugar de eliminar físicamente, cambiar activo a False"""
        try:
            instance = self.get_object()
            instance.activo = False
            instance.save()
            
            return Response(
                {"message": "Tarea desactivada correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Error al desactivar tarea:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
