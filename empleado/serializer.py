from rest_framework import serializers
from .models import Empleado, Asistencia, Turno, Solicitudes, TiposSolicitudes, Tareas
from datetime import date, datetime, time
from django.utils import timezone
from zoneinfo import ZoneInfo
from argon2 import PasswordHasher

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fecha_contratacion = serializers.DateField(required=False)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    fecha_termino = serializers.DateField(required=False, allow_null=True)
    salario = serializers.IntegerField(required=False, allow_null=True)
    rol = serializers.ChoiceField(choices=Empleado.ROL_CHOICES, required=False, allow_blank=True, allow_null=True, default='empleado')
    # Campo calculado para compatibilidad hacia atrás
    apellido = serializers.SerializerMethodField()
    
    # Instancia de PasswordHasher para Argon2id
    _ph = PasswordHasher()
    
    class Meta:
        model = Empleado
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'apellido_paterno': {'required': True},
            'apellido_materno': {'required': False}
        }
    
    def get_apellido(self, obj):
        """Retorna el apellido completo para compatibilidad"""
        return obj.apellido_completo
    
    def to_representation(self, instance):
        """Asegurar que el password nunca se incluya en las respuestas"""
        representation = super().to_representation(instance)
        representation.pop('password', None)
        return representation
    
    def validate_password(self, value):
        # Si es creación y no hay password, lanzar error
        if not self.instance and not value:
            raise serializers.ValidationError("La contraseña es requerida al crear un empleado.")
        return value
    
    def create(self, validated_data):
        # Validar que el password esté presente en creación
        if not validated_data.get('password'):
            raise serializers.ValidationError({"password": "La contraseña es requerida al crear un empleado."})
        
        # Cifrar la contraseña con Argon2id antes de guardarla
        password_plain = validated_data.pop('password')
        password_hashed = self._ph.hash(password_plain)
        validated_data['password'] = password_hashed
        
        # Unir apellido_paterno y apellido_materno en el campo apellido
        apellido_paterno = validated_data.get('apellido_paterno', '').strip()
        apellido_materno = validated_data.get('apellido_materno', '').strip() if validated_data.get('apellido_materno') else ''
        apellidos_completos = [apellido_paterno]
        if apellido_materno:
            apellidos_completos.append(apellido_materno)
        validated_data['apellido'] = ' '.join(apellidos_completos) if apellidos_completos[0] else None
        
        # Si no se proporciona fecha_contratacion, usar la fecha actual
        if 'fecha_contratacion' not in validated_data or not validated_data.get('fecha_contratacion'):
            validated_data['fecha_contratacion'] = date.today()
        
        # Asegurarse de que los campos booleanos tengan valores por defecto
        if 'activo' not in validated_data:
            validated_data['activo'] = True
        
        # Asegurar que el rol tenga un valor por defecto si no se proporciona
        if 'rol' not in validated_data or not validated_data.get('rol'):
            validated_data['rol'] = 'empleado'
        
        # Crear el empleado
        empleado = Empleado.objects.create(**validated_data)
        return empleado
    
    def update(self, instance, validated_data):
        # No permitir actualizar RUT ni fecha_nacimiento
        if 'rut' in validated_data:
            validated_data.pop('rut')
        
        if 'fecha_nacimiento' in validated_data:
            validated_data.pop('fecha_nacimiento')
        
        # Si se proporciona password, cifrarlo con Argon2id
        password = validated_data.get('password')
        if password and password.strip() != '':
            password_hashed = self._ph.hash(password)
            validated_data['password'] = password_hashed
        else:
            # Si no se proporciona password o está vacío, no actualizarlo
            validated_data.pop('password', None)
        
        # Unir apellido_paterno y apellido_materno en el campo apellido si se actualizan
        if 'apellido_paterno' in validated_data or 'apellido_materno' in validated_data:
            # Usar el valor nuevo si está en validated_data, sino usar el valor actual de la instancia
            apellido_paterno = validated_data.get('apellido_paterno', instance.apellido_paterno).strip()
            apellido_materno = validated_data.get('apellido_materno', instance.apellido_materno)
            apellido_materno = apellido_materno.strip() if apellido_materno else ''
            apellidos_completos = [apellido_paterno]
            if apellido_materno:
                apellidos_completos.append(apellido_materno)
            validated_data['apellido'] = ' '.join(apellidos_completos) if apellidos_completos[0] else None
        
        # Actualizar los campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class AsistenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    empleado_rut = serializers.CharField(write_only=True, required=True)
    empleado_rut_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Asistencia
        fields = [
            'id', 'empleado_rut', 'empleado_rut_display', 'empleado_nombre', 'empleado_apellido',
            'fecha', 'hora_entrada', 'hora_salida', 'tipo_entrada', 'tipo_salida',
            'minutos_tarde', 'minutos_extras', 'horas_trabajadas', 'estado', 'observaciones',
            'ubicacion_entrada', 'ubicacion_salida', 'ip_entrada', 'ip_salida',
            'validado_por', 'fecha_validacion', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ('fecha_creacion', 'fecha_actualizacion', 'empleado_rut_display', 'empleado_nombre', 'empleado_apellido')
    
    def get_empleado_nombre(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleado_rut
            return empleado.nombre if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            return None
    
    def get_empleado_apellido(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleado_rut
            return empleado.apellido_completo if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            return None
    
    def get_empleado_rut_display(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleado_rut
            return empleado.rut if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            # Si el empleado no existe, usar el valor del campo directamente
            return getattr(obj, 'empleado_rut_id', None)
    
    def create(self, validated_data):
        # Extraer el RUT del validated_data
        rut = validated_data.pop('empleado_rut')
        # Buscar el empleado por RUT
        try:
            empleado = Empleado.objects.get(rut=rut)
            validated_data['empleado_rut'] = empleado
        except Empleado.DoesNotExist:
            raise serializers.ValidationError({'empleado_rut': 'No existe un empleado con este RUT'})
        
        # Si no se proporciona fecha, usar la fecha actual
        if 'fecha' not in validated_data or not validated_data.get('fecha'):
            validated_data['fecha'] = date.today()
        
        # Asegurar que las fechas hora_entrada y hora_salida se interpreten como hora local de Chile
        chile_tz = ZoneInfo('America/Santiago')
        
        if 'hora_entrada' in validated_data and validated_data['hora_entrada']:
            hora_entrada = validated_data['hora_entrada']
            # Si viene como string, parsearlo
            if isinstance(hora_entrada, str):
                try:
                    hora_entrada = datetime.fromisoformat(hora_entrada.replace('Z', ''))
                except:
                    hora_entrada = datetime.strptime(hora_entrada, '%Y-%m-%dT%H:%M:%S')
            # Si es naive datetime (sin timezone), interpretarlo como hora local de Chile
            if isinstance(hora_entrada, datetime) and timezone.is_naive(hora_entrada):
                hora_entrada = hora_entrada.replace(tzinfo=chile_tz)
            # Guardar como naive datetime en hora local (la BD guarda naive)
            validated_data['hora_entrada'] = hora_entrada.replace(tzinfo=None) if hasattr(hora_entrada, 'replace') else hora_entrada
        
        if 'hora_salida' in validated_data and validated_data.get('hora_salida'):
            hora_salida = validated_data['hora_salida']
            # Si viene como string, parsearlo
            if isinstance(hora_salida, str):
                try:
                    hora_salida = datetime.fromisoformat(hora_salida.replace('Z', ''))
                except:
                    hora_salida = datetime.strptime(hora_salida, '%Y-%m-%dT%H:%M:%S')
            # Si es naive datetime (sin timezone), interpretarlo como hora local de Chile
            if isinstance(hora_salida, datetime) and timezone.is_naive(hora_salida):
                hora_salida = hora_salida.replace(tzinfo=chile_tz)
            # Guardar como naive datetime en hora local (la BD guarda naive)
            validated_data['hora_salida'] = hora_salida.replace(tzinfo=None) if hasattr(hora_salida, 'replace') else hora_salida
        
        # Calcular horas trabajadas si hay entrada y salida
        if validated_data.get('hora_entrada') and validated_data.get('hora_salida'):
            entrada = validated_data['hora_entrada']
            salida = validated_data['hora_salida']
            # Asegurar que sean datetime objects
            if isinstance(entrada, str):
                entrada = datetime.fromisoformat(entrada.replace('Z', ''))
            if isinstance(salida, str):
                salida = datetime.fromisoformat(salida.replace('Z', ''))
            diferencia = salida - entrada
            horas = diferencia.total_seconds() / 3600
            validated_data['horas_trabajadas'] = round(horas, 2)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Si se proporciona un nuevo RUT, buscar el empleado
        if 'empleado_rut' in validated_data:
            rut = validated_data.pop('empleado_rut')
            try:
                empleado = Empleado.objects.get(rut=rut)
                validated_data['empleado_rut'] = empleado
            except Empleado.DoesNotExist:
                raise serializers.ValidationError({'empleado_rut': 'No existe un empleado con este RUT'})
        
        # Asegurar que las fechas hora_entrada y hora_salida se interpreten como hora local de Chile
        chile_tz = ZoneInfo('America/Santiago')
        
        if 'hora_entrada' in validated_data and validated_data['hora_entrada']:
            hora_entrada = validated_data['hora_entrada']
            # Si viene como string, parsearlo
            if isinstance(hora_entrada, str):
                try:
                    hora_entrada = datetime.fromisoformat(hora_entrada.replace('Z', ''))
                except:
                    hora_entrada = datetime.strptime(hora_entrada, '%Y-%m-%dT%H:%M:%S')
            # Si es naive datetime (sin timezone), interpretarlo como hora local de Chile
            if isinstance(hora_entrada, datetime) and timezone.is_naive(hora_entrada):
                hora_entrada = hora_entrada.replace(tzinfo=chile_tz)
            # Guardar como naive datetime en hora local (la BD guarda naive)
            validated_data['hora_entrada'] = hora_entrada.replace(tzinfo=None) if hasattr(hora_entrada, 'replace') else hora_entrada
        
        if 'hora_salida' in validated_data and validated_data.get('hora_salida'):
            hora_salida = validated_data['hora_salida']
            # Si viene como string, parsearlo
            if isinstance(hora_salida, str):
                try:
                    hora_salida = datetime.fromisoformat(hora_salida.replace('Z', ''))
                except:
                    hora_salida = datetime.strptime(hora_salida, '%Y-%m-%dT%H:%M:%S')
            # Si es naive datetime (sin timezone), interpretarlo como hora local de Chile
            if isinstance(hora_salida, datetime) and timezone.is_naive(hora_salida):
                hora_salida = hora_salida.replace(tzinfo=chile_tz)
            # Guardar como naive datetime en hora local (la BD guarda naive)
            validated_data['hora_salida'] = hora_salida.replace(tzinfo=None) if hasattr(hora_salida, 'replace') else hora_salida
        
        # Recalcular horas trabajadas si se actualizan las horas
        if 'hora_entrada' in validated_data or 'hora_salida' in validated_data:
            hora_entrada = validated_data.get('hora_entrada', instance.hora_entrada)
            hora_salida = validated_data.get('hora_salida', instance.hora_salida)
            
            if hora_entrada and hora_salida:
                # Asegurar que sean datetime objects
                if isinstance(hora_entrada, str):
                    hora_entrada = datetime.fromisoformat(hora_entrada.replace('Z', ''))
                if isinstance(hora_salida, str):
                    hora_salida = datetime.fromisoformat(hora_salida.replace('Z', ''))
                diferencia = hora_salida - hora_entrada
                horas = diferencia.total_seconds() / 3600
                validated_data['horas_trabajadas'] = round(horas, 2)
        
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        """Personalizar la representación para mostrar el RUT como string y fechas tal como están en BD"""
        representation = super().to_representation(instance)
        # Reemplazar el objeto empleado_rut con el RUT como string
        # Como to_field='rut', empleado_rut_id contiene el RUT directamente
        # Usar el valor del campo directamente para evitar consultas que pueden fallar
        empleado_rut = getattr(instance, 'empleado_rut_id', None)
        representation['empleado_rut'] = empleado_rut
        
        # Las fechas en BD están guardadas como DATETIME naive (sin timezone)
        # y ya contienen la hora correcta (ej: 15:00:00)
        # Simplemente las serializamos tal como están, sin agregar timezone ni hacer conversiones
        if instance.hora_entrada:
            # Serializar directamente el datetime tal como está en BD
            # Formato: '2024-01-01T15:00:00' (sin timezone)
            representation['hora_entrada'] = instance.hora_entrada.strftime('%Y-%m-%dT%H:%M:%S')
        
        if instance.hora_salida:
            # Serializar directamente el datetime tal como está en BD
            # Formato: '2024-01-01T15:00:00' (sin timezone)
            representation['hora_salida'] = instance.hora_salida.strftime('%Y-%m-%dT%H:%M:%S')
        
        return representation
    
    def validate(self, data):
        # Validar que si hay hora_salida, debe ser después de hora_entrada
        if data.get('hora_entrada') and data.get('hora_salida'):
            if data['hora_salida'] <= data['hora_entrada']:
                raise serializers.ValidationError({
                    'hora_salida': 'La hora de salida debe ser posterior a la hora de entrada'
                })
        return data


class TurnoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    empleados_rut = serializers.CharField(write_only=True, required=True)
    empleados_rut_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Turno
        fields = [
            'id', 'empleados_rut', 'empleados_rut_display', 'empleado_nombre', 'empleado_apellido',
            'nombre_turno', 'hora_entrada', 'hora_salida', 'tolerancia_minutos', 'horas_trabajo',
            'descripcion', 'dias_semana', 'activo', 'fecha_creacion'
        ]
        read_only_fields = ('fecha_creacion', 'empleados_rut_display', 'empleado_nombre', 'empleado_apellido')
    
    def get_empleado_nombre(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleados_rut
            return empleado.nombre if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            return None
    
    def get_empleado_apellido(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleados_rut
            return empleado.apellido_completo if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            return None
    
    def get_empleados_rut_display(self, obj):
        # Usar un try-except amplio para capturar cualquier error al acceder al empleado
        try:
            empleado = obj.empleados_rut
            return empleado.rut if empleado else None
        except (Empleado.DoesNotExist, AttributeError, Exception):
            # Si el empleado no existe, usar el valor del campo directamente
            return getattr(obj, 'empleados_rut_id', None)
    
    def to_representation(self, instance):
        """Personalizar la representación para mostrar el RUT como string"""
        representation = super().to_representation(instance)
        # Reemplazar el objeto empleados_rut con el RUT como string
        # Como to_field='rut', empleados_rut_id contiene el RUT directamente
        # Usar el valor del campo directamente para evitar consultas que pueden fallar
        empleado_rut = getattr(instance, 'empleados_rut_id', None)
        representation['empleados_rut'] = empleado_rut
        return representation
    
    def validate(self, data):
        # Validar que hora_salida sea posterior a hora_entrada
        if data.get('hora_entrada') and data.get('hora_salida'):
            if data['hora_salida'] <= data['hora_entrada']:
                raise serializers.ValidationError({
                    'hora_salida': 'La hora de salida debe ser posterior a la hora de entrada'
                })
        return data
    
    def create(self, validated_data):
        # Extraer el RUT del validated_data
        rut = validated_data.pop('empleados_rut')
        # Buscar el empleado por RUT
        try:
            empleado = Empleado.objects.get(rut=rut)
            validated_data['empleados_rut'] = empleado
        except Empleado.DoesNotExist:
            raise serializers.ValidationError({'empleados_rut': 'No existe un empleado con este RUT'})
        
        # Calcular horas_trabajo si no se proporciona
        if 'horas_trabajo' not in validated_data or not validated_data.get('horas_trabajo'):
            if validated_data.get('hora_entrada') and validated_data.get('hora_salida'):
                entrada = validated_data['hora_entrada']
                salida = validated_data['hora_salida']
                # Calcular diferencia en horas
                entrada_segundos = entrada.hour * 3600 + entrada.minute * 60 + entrada.second
                salida_segundos = salida.hour * 3600 + salida.minute * 60 + salida.second
                diferencia_segundos = salida_segundos - entrada_segundos
                if diferencia_segundos < 0:
                    diferencia_segundos += 24 * 3600  # Si cruza medianoche
                horas = diferencia_segundos / 3600
                # Restar 1 hora de almuerzo/descanso por defecto
                horas_trabajo = max(0, horas - 1)
                validated_data['horas_trabajo'] = round(horas_trabajo, 2)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Si se proporciona un nuevo RUT, buscar el empleado
        if 'empleados_rut' in validated_data:
            rut = validated_data.pop('empleados_rut')
            try:
                empleado = Empleado.objects.get(rut=rut)
                validated_data['empleados_rut'] = empleado
            except Empleado.DoesNotExist:
                raise serializers.ValidationError({'empleados_rut': 'No existe un empleado con este RUT'})
        
        # Recalcular horas_trabajo si se actualizan las horas
        if 'hora_entrada' in validated_data or 'hora_salida' in validated_data:
            hora_entrada = validated_data.get('hora_entrada', instance.hora_entrada)
            hora_salida = validated_data.get('hora_salida', instance.hora_salida)
            
            if hora_entrada and hora_salida:
                entrada_segundos = hora_entrada.hour * 3600 + hora_entrada.minute * 60 + hora_entrada.second
                salida_segundos = hora_salida.hour * 3600 + hora_salida.minute * 60 + hora_salida.second
                diferencia_segundos = salida_segundos - entrada_segundos
                if diferencia_segundos < 0:
                    diferencia_segundos += 24 * 3600
                horas = diferencia_segundos / 3600
                # Restar 1 hora de almuerzo/descanso por defecto
                horas_trabajo = max(0, horas - 1)
                validated_data['horas_trabajo'] = round(horas_trabajo, 2)
        
        return super().update(instance, validated_data)


class TiposSolicitudesSerializer(serializers.ModelSerializer):
    """Serializer para tipos de solicitudes"""
    
    class Meta:
        model = TiposSolicitudes
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion']


class SolicitudesSerializer(serializers.ModelSerializer):
    """Serializer para solicitudes"""
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    empleado_rut_display = serializers.SerializerMethodField()
    tipo_solicitud_nombre = serializers.CharField(source='tipo_solicitud_id.nombre', read_only=True)
    requiere_aprobacion = serializers.SerializerMethodField()
    aprobado_por_nombre = serializers.SerializerMethodField()
    aprobado_por_apellido = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    def get_empleado_nombre(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.nombre
        return None
    
    def get_empleado_apellido(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.apellido_completo
        return None
    
    def get_empleado_rut_display(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.rut
        return obj.empleado_rut
    
    def get_requiere_aprobacion(self, obj):
        if obj.tipo_solicitud_id:
            return obj.tipo_solicitud_id.requiere_aprobacion
        return True
    
    def get_aprobado_por_nombre(self, obj):
        if obj.aprobado_por:
            return obj.aprobado_por.nombre
        return None
    
    def get_aprobado_por_apellido(self, obj):
        if obj.aprobado_por:
            return obj.aprobado_por.apellido_completo
        return None
    
    class Meta:
        model = Solicitudes
        fields = [
            'id', 'empleado_rut', 'empleado_id', 'empleado_nombre', 'empleado_apellido',
            'empleado_rut_display', 'tipo_solicitud_id', 'tipo_solicitud_nombre',
            'fecha_inicio', 'fecha_fin', 'motivo', 'estado', 'estado_display',
            'aprobado_por', 'aprobado_por_nombre', 'aprobado_por_apellido',
            'fecha_aprobacion', 'comentario_aprobacion', 'documento_adjunto',
            'requiere_aprobacion', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_fecha_fin(self, value):
        """Validar que fecha_fin sea posterior a fecha_inicio"""
        fecha_inicio = self.initial_data.get('fecha_inicio')
        # Si no está en initial_data (actualización parcial), usar el valor de la instancia
        if not fecha_inicio and self.instance:
            fecha_inicio = self.instance.fecha_inicio
        
        if fecha_inicio and value:
            # Convertir a date si es string
            if isinstance(fecha_inicio, str):
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            if isinstance(value, str):
                value = datetime.strptime(value, '%Y-%m-%d').date()
            
            if value < fecha_inicio:
                raise serializers.ValidationError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return value
    
    def validate(self, data):
        """Validación adicional a nivel de objeto"""
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        
        # Si no están en data, usar valores de la instancia (para actualizaciones parciales)
        if not fecha_inicio and self.instance:
            fecha_inicio = self.instance.fecha_inicio
        if not fecha_fin and self.instance:
            fecha_fin = self.instance.fecha_fin
        
        if fecha_inicio and fecha_fin:
            if fecha_fin < fecha_inicio:
                raise serializers.ValidationError({
                    'fecha_fin': "La fecha de fin debe ser posterior a la fecha de inicio."
                })
        
        return data


class SolicitudesListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar solicitudes"""
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    empleado_rut = serializers.SerializerMethodField()
    tipo_solicitud_nombre = serializers.CharField(source='tipo_solicitud_id.nombre', read_only=True)
    requiere_aprobacion = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    aprobado_por_nombre = serializers.SerializerMethodField()
    
    def get_empleado_nombre(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.nombre
        return None
    
    def get_empleado_apellido(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.apellido_completo
        return None
    
    def get_empleado_rut(self, obj):
        if obj.empleado_id:
            return obj.empleado_id.rut
        return obj.empleado_rut
    
    def get_requiere_aprobacion(self, obj):
        if obj.tipo_solicitud_id:
            return obj.tipo_solicitud_id.requiere_aprobacion
        return True
    
    def get_aprobado_por_nombre(self, obj):
        if obj.aprobado_por:
            return obj.aprobado_por.nombre
        return None
    
    class Meta:
        model = Solicitudes
        fields = [
            'id', 'empleado_id', 'empleado_nombre', 'empleado_apellido', 'empleado_rut',
            'tipo_solicitud_id', 'tipo_solicitud_nombre', 'fecha_inicio',
            'fecha_fin', 'motivo', 'estado', 'estado_display',
            'requiere_aprobacion', 'fecha_creacion', 'fecha_aprobacion',
            'aprobado_por', 'aprobado_por_nombre', 'comentario_aprobacion'
        ]


class TareasSerializer(serializers.ModelSerializer):
    """Serializer para tareas"""
    asignada_a_nombre = serializers.SerializerMethodField()
    asignada_a_apellido = serializers.SerializerMethodField()
    creada_por_nombre = serializers.SerializerMethodField()
    creada_por_apellido = serializers.SerializerMethodField()
    tipo_tarea_display = serializers.CharField(source='get_tipo_tarea_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    def get_asignada_a_nombre(self, obj):
        if obj.asignada_a_rut:
            return obj.asignada_a_rut.nombre
        return None
    
    def get_asignada_a_apellido(self, obj):
        if obj.asignada_a_rut:
            return obj.asignada_a_rut.apellido_completo
        return None
    
    def get_creada_por_nombre(self, obj):
        if obj.creada_por_rut:
            return obj.creada_por_rut.nombre
        return None
    
    def get_creada_por_apellido(self, obj):
        if obj.creada_por_rut:
            return obj.creada_por_rut.apellido_completo
        return None
    
    class Meta:
        model = Tareas
        fields = [
            'id', 'titulo', 'descripcion', 'tipo_tarea', 'tipo_tarea_display',
            'prioridad', 'prioridad_display', 'estado', 'estado_display',
            'asignada_a_rut', 'asignada_a_nombre', 'asignada_a_apellido',
            'creada_por_rut', 'creada_por_nombre', 'creada_por_apellido',
            'fecha_inicio', 'fecha_vencimiento', 'fecha_completada',
            'es_recurrente', 'frecuencia_recurrencia', 'dias_recurrencia',
            'ubicacion', 'modulo_relacionado', 'registro_relacionado_id',
            'tiempo_estimado_minutos', 'tiempo_real_minutos',
            'porcentaje_completado', 'notas', 'archivo_adjunto',
            'requiere_aprobacion', 'aprobada_por_rut', 'fecha_aprobacion',
            'fecha_creacion', 'fecha_actualizacion', 'activo'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_porcentaje_completado(self, value):
        """Validar que el porcentaje esté entre 0 y 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("El porcentaje completado debe estar entre 0 y 100.")
        return value


class TareasListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar tareas"""
    asignada_a_nombre = serializers.SerializerMethodField()
    asignada_a_apellido = serializers.SerializerMethodField()
    creada_por_nombre = serializers.SerializerMethodField()
    creada_por_apellido = serializers.SerializerMethodField()
    tipo_tarea_display = serializers.CharField(source='get_tipo_tarea_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    def get_asignada_a_nombre(self, obj):
        if obj.asignada_a_rut:
            return obj.asignada_a_rut.nombre
        return None
    
    def get_asignada_a_apellido(self, obj):
        if obj.asignada_a_rut:
            return obj.asignada_a_rut.apellido_completo
        return None
    
    def get_creada_por_nombre(self, obj):
        if obj.creada_por_rut:
            return obj.creada_por_rut.nombre
        return None
    
    def get_creada_por_apellido(self, obj):
        if obj.creada_por_rut:
            return obj.creada_por_rut.apellido_completo
        return None
    
    class Meta:
        model = Tareas
        fields = [
            'id', 'titulo', 'descripcion', 'tipo_tarea', 'tipo_tarea_display',
            'prioridad', 'prioridad_display', 'estado', 'estado_display',
            'asignada_a_rut', 'asignada_a_nombre', 'asignada_a_apellido',
            'creada_por_rut', 'creada_por_nombre', 'creada_por_apellido',
            'fecha_vencimiento', 'porcentaje_completado', 'fecha_creacion'
        ]
    