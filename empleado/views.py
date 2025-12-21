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
import bcrypt
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
        
        # Verificar contraseña con Argon2 o bcrypt
        password_valid = False
        stored_password = empleado.password
        
        # Detectar el tipo de hash y verificar apropiadamente
        if stored_password.startswith('$argon2'):
            # Hash de Argon2 (argon2id, argon2i, etc.)
            try:
                ph = PasswordHasher()
                ph.verify(stored_password, password)
                password_valid = True
            except VerifyMismatchError:
                password_valid = False
            except Exception:
                # Si hay error de formato, intentar con bcrypt
                password_valid = False
        elif stored_password.startswith('$2a$') or stored_password.startswith('$2b$') or stored_password.startswith('$2y$'):
            # Hash de bcrypt
            try:
                # bcrypt.checkpw espera bytes
                password_bytes = password.encode('utf-8')
                stored_password_bytes = stored_password.encode('utf-8')
                password_valid = bcrypt.checkpw(password_bytes, stored_password_bytes)
            except Exception:
                password_valid = False
        else:
            # Intentar primero con Argon2 (por si acaso)
            try:
                ph = PasswordHasher()
                ph.verify(stored_password, password)
                password_valid = True
            except (VerifyMismatchError, Exception):
                # Si falla Argon2, intentar con bcrypt
                try:
                    password_bytes = password.encode('utf-8')
                    stored_password_bytes = stored_password.encode('utf-8')
                    password_valid = bcrypt.checkpw(password_bytes, stored_password_bytes)
                except Exception:
                    # Si ambos fallan, intentar comparación directa (para migración gradual)
                    try:
                        password_valid = (stored_password.strip() == password)
                    except:
                        password_valid = False
        
        if not password_valid:
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
        # Obtener todas las asistencias, pero manejar empleados inexistentes en el serializer
        queryset = Asistencia.objects.all().order_by('-fecha', '-hora_entrada')
        
        # Verificar si el usuario es un empleado (no gerente ni administrador)
        # Si es empleado, solo puede ver sus propias asistencias
        empleado_rut_request = self.request.query_params.get('empleado_rut', None)
        empleado_rol = self.request.query_params.get('empleado_rol', None)
        
        # Si el usuario es empleado, forzar el filtro para que solo vea sus asistencias
        if empleado_rol == 'empleado' and empleado_rut_request:
            queryset = queryset.filter(empleado_rut__rut=empleado_rut_request)
        elif empleado_rol == 'empleado' and not empleado_rut_request:
            # Si es empleado pero no se proporciona el RUT, no devolver nada
            queryset = queryset.none()
        else:
            # Para gerente y administrador, aplicar filtros opcionales
            if empleado_rut_request:
                queryset = queryset.filter(empleado_rut__rut=empleado_rut_request)
        
        # Filtros adicionales (aplican a todos los roles)
        fecha = self.request.query_params.get('fecha', None)
        estado = self.request.query_params.get('estado', None)
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
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
    queryset = Turno.objects.all()
    
    def get_queryset(self):
        # Obtener todos los turnos, pero manejar empleados inexistentes en el serializer
        queryset = Turno.objects.all().order_by('-fecha_creacion')
        
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
    permission_classes = [AllowAny]
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
    
    def create(self, request, *args, **kwargs):
        """Crear una nueva solicitud"""
        try:
            print("Datos recibidos (CREATE solicitud):", request.data)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            print("Error de validación (CREATE solicitud):", e.detail)
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al crear solicitud:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Actualizar una solicitud"""
        try:
            print("Datos recibidos (UPDATE solicitud):", request.data)
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Verificar si se está intentando cambiar el estado a aprobada o rechazada
            nuevo_estado = request.data.get('estado')
            if nuevo_estado in ['aprobada', 'rechazada']:
                # Obtener el empleado que está actualizando desde el request
                # El frontend debe enviar el ID del empleado logueado en 'aprobado_por' o 'empleado_actualizador'
                empleado_actualizador_id = request.data.get('aprobado_por') or request.data.get('empleado_actualizador')
                
                if empleado_actualizador_id:
                    try:
                        empleado_actualizador = Empleado.objects.get(id=empleado_actualizador_id)
                        # Verificar que el empleado tenga rol de gerente o administrador
                        if empleado_actualizador.rol not in ['gerente', 'administrador']:
                            return Response(
                                {"error": "Solo gerentes y administradores pueden cambiar el estado de una solicitud a aprobada o rechazada"},
                                status=status.HTTP_403_FORBIDDEN
                            )
                        # Verificar que el empleado no esté aprobando su propia solicitud
                        if instance.empleado_id and instance.empleado_id.id == empleado_actualizador.id:
                            return Response(
                                {"error": "No puedes aprobar o rechazar tu propia solicitud"},
                                status=status.HTTP_403_FORBIDDEN
                            )
                    except Empleado.DoesNotExist:
                        return Response(
                            {"error": "Empleado no encontrado"},
                            status=status.HTTP_404_NOT_FOUND
                        )
                else:
                    # Si no se proporciona el ID del empleado, verificar si el empleado que creó la solicitud es el que está actualizando
                    # En este caso, no permitir cambiar a aprobada/rechazada
                    return Response(
                        {"error": "Solo gerentes y administradores pueden cambiar el estado de una solicitud a aprobada o rechazada. Se requiere el ID del empleado que aprueba/rechaza."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            print("Error de validación (UPDATE solicitud):", e.detail)
            return Response(
                {"error": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Error al actualizar solicitud:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar una solicitud - Solo gerente o administrador"""
        solicitud = self.get_object()
        
        # Obtener el empleado que está aprobando desde el request
        aprobado_por_id = request.data.get('aprobado_por')
        if not aprobado_por_id:
            return Response(
                {"error": "Se requiere el ID del empleado que aprueba"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            empleado_aprobador = Empleado.objects.get(id=aprobado_por_id)
        except Empleado.DoesNotExist:
            return Response(
                {"error": "Empleado no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que el empleado tenga rol de gerente o administrador
        if empleado_aprobador.rol not in ['gerente', 'administrador']:
            return Response(
                {"error": "Solo gerentes y administradores pueden aprobar solicitudes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comentario = request.data.get('comentario_aprobacion', '')
        
        solicitud.estado = 'aprobada'
        solicitud.aprobado_por_id = aprobado_por_id
        solicitud.fecha_aprobacion = timezone.now()
        solicitud.comentario_aprobacion = comentario
        solicitud.save()
        
        serializer = self.get_serializer(solicitud)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechazar una solicitud - Solo gerente o administrador"""
        solicitud = self.get_object()
        
        # Obtener el empleado que está rechazando desde el request
        aprobado_por_id = request.data.get('aprobado_por')
        if not aprobado_por_id:
            return Response(
                {"error": "Se requiere el ID del empleado que rechaza"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            empleado_rechazador = Empleado.objects.get(id=aprobado_por_id)
        except Empleado.DoesNotExist:
            return Response(
                {"error": "Empleado no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que el empleado tenga rol de gerente o administrador
        if empleado_rechazador.rol not in ['gerente', 'administrador']:
            return Response(
                {"error": "Solo gerentes y administradores pueden rechazar solicitudes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comentario = request.data.get('comentario_aprobacion', '')
        
        solicitud.estado = 'rechazada'
        solicitud.aprobado_por_id = aprobado_por_id
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
    permission_classes = [AllowAny]
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
