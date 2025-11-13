from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializer import EmpleadoSerializer, AsistenciaSerializer, TurnoSerializer
from .models import Empleado, Asistencia, Turno
from django.db import connection, transaction
from django.utils import timezone
from datetime import date, datetime, timedelta
import traceback

# Create your views here.
class EmpleadoView(viewsets.ModelViewSet):
    serializer_class = EmpleadoSerializer
    queryset = Empleado.objects.all()
    
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
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            print("Eliminando empleado con ID:", kwargs.get('pk'))
            instance = self.get_object()
            rut_empleado = instance.rut
            
            # Usar transacción para asegurar que todas las operaciones se ejecuten correctamente
            with transaction.atomic():
                try:
                    with connection.cursor() as cursor:
                        # 1. Eliminar horarios relacionados (debe ir antes de eliminar turnos)
                        cursor.execute(
                            "DELETE FROM horarios WHERE empleado_rut = %s",
                            [rut_empleado]
                        )
                        deleted_horarios = cursor.rowcount
                        print(f"Eliminados {deleted_horarios} horarios relacionados al empleado {rut_empleado}")
                        
                        # 2. Eliminar empleados_turnos relacionados
                        cursor.execute(
                            "DELETE FROM empleados_turnos WHERE empleados_rut = %s",
                            [rut_empleado]
                        )
                        deleted_empleados_turnos = cursor.rowcount
                        print(f"Eliminados {deleted_empleados_turnos} registros de empleados_turnos relacionados")
                        
                        # 3. Eliminar asistencias relacionadas
                        cursor.execute(
                            "DELETE FROM asistencias WHERE empleado_rut = %s",
                            [rut_empleado]
                        )
                        deleted_asistencias = cursor.rowcount
                        print(f"Eliminadas {deleted_asistencias} asistencias relacionadas al empleado {rut_empleado}")
                        
                        # 4. Los turnos se eliminarán automáticamente por CASCADE cuando se elimine el empleado
                        # ya que tienen FOREIGN KEY con ON DELETE CASCADE
                        
                except Exception as db_error:
                    # Si hay un error, lanzarlo para que la transacción se revierta
                    print(f"Error al eliminar registros relacionados: {str(db_error)}")
                    raise db_error
                
                # 5. Finalmente eliminar el empleado (esto eliminará automáticamente los turnos por CASCADE)
                self.perform_destroy(instance)
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print("Error al eliminar empleado:", str(e))
            print("Traceback:", traceback.format_exc())
            error_message = str(e)
            # Extraer mensaje más legible del error
            if "foreign key constraint" in error_message.lower():
                error_message = "No se puede eliminar el empleado porque tiene registros relacionados. Por favor, elimine primero los horarios, turnos y otros registros asociados."
            return Response(
                {"error": error_message, "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Endpoint para autenticar empleados usando RUT y contraseña
    """
    try:
        rut = request.data.get('rut')
        password = request.data.get('password')
        
        if not rut or not password:
            return Response(
                {"error": "RUT y contraseña son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar empleado por RUT
        try:
            empleado = Empleado.objects.get(rut=rut, activo=True)
        except Empleado.DoesNotExist:
            return Response(
                {"error": "RUT o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar contraseña (comparación simple por ahora)
        if empleado.password != password:
            return Response(
                {"error": "RUT o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Serializar datos del empleado (sin password)
        serializer = EmpleadoSerializer(empleado)
        empleado_data = serializer.data
        empleado_data.pop('password', None)  # Asegurar que no se envíe el password
        
        return Response({
            "message": "Login exitoso",
            "empleado": empleado_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error en login:", str(e))
        print("Traceback:", traceback.format_exc())
        return Response(
            {"error": "Error interno del servidor"},
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
            queryset = queryset.filter(empleado_rut=empleado_rut)
        
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
        queryset = Turno.objects.all().order_by('-fecha_creacion')
        
        # Filtros opcionales
        empleado_rut = self.request.query_params.get('empleado_rut', None)
        activo = self.request.query_params.get('activo', None)
        
        if empleado_rut:
            queryset = queryset.filter(empleados_rut=empleado_rut)
        
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
