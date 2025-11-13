from rest_framework import serializers
from .models import Empleado, Asistencia, Turno
from datetime import date, datetime, time

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fecha_contratacion = serializers.DateField(required=False)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    fecha_termino = serializers.DateField(required=False, allow_null=True)
    salario = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    
    class Meta:
        model = Empleado
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate_password(self, value):
        # Si es creación y no hay password, lanzar error
        if not self.instance and not value:
            raise serializers.ValidationError("La contraseña es requerida al crear un empleado.")
        return value
    
    def create(self, validated_data):
        # Validar que el password esté presente en creación
        if not validated_data.get('password'):
            raise serializers.ValidationError({"password": "La contraseña es requerida al crear un empleado."})
        
        # Si no se proporciona fecha_contratacion, usar la fecha actual
        if 'fecha_contratacion' not in validated_data or not validated_data.get('fecha_contratacion'):
            validated_data['fecha_contratacion'] = date.today()
        
        # Asegurarse de que los campos booleanos tengan valores por defecto
        if 'activo' not in validated_data:
            validated_data['activo'] = True
        
        # Crear el empleado
        empleado = Empleado.objects.create(**validated_data)
        return empleado
    
    def update(self, instance, validated_data):
        # Si no se proporciona password o está vacío, no actualizarlo
        password = validated_data.get('password')
        if not password or password.strip() == '':
            validated_data.pop('password', None)
        
        # Actualizar los campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class AsistenciaSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    
    class Meta:
        model = Asistencia
        fields = '__all__'
        read_only_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    def get_empleado_nombre(self, obj):
        try:
            empleado = Empleado.objects.get(rut=obj.empleado_rut)
            return empleado.nombre
        except Empleado.DoesNotExist:
            return None
    
    def get_empleado_apellido(self, obj):
        try:
            empleado = Empleado.objects.get(rut=obj.empleado_rut)
            return empleado.apellido
        except Empleado.DoesNotExist:
            return None
    
    def validate(self, data):
        # Validar que si hay hora_salida, debe ser después de hora_entrada
        if data.get('hora_entrada') and data.get('hora_salida'):
            if data['hora_salida'] <= data['hora_entrada']:
                raise serializers.ValidationError({
                    'hora_salida': 'La hora de salida debe ser posterior a la hora de entrada'
                })
        return data
    
    def create(self, validated_data):
        # Si no se proporciona fecha, usar la fecha actual
        if 'fecha' not in validated_data or not validated_data.get('fecha'):
            validated_data['fecha'] = date.today()
        
        # Calcular horas trabajadas si hay entrada y salida
        if validated_data.get('hora_entrada') and validated_data.get('hora_salida'):
            diferencia = validated_data['hora_salida'] - validated_data['hora_entrada']
            horas = diferencia.total_seconds() / 3600
            validated_data['horas_trabajadas'] = round(horas, 2)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Recalcular horas trabajadas si se actualizan las horas
        if 'hora_entrada' in validated_data or 'hora_salida' in validated_data:
            hora_entrada = validated_data.get('hora_entrada', instance.hora_entrada)
            hora_salida = validated_data.get('hora_salida', instance.hora_salida)
            
            if hora_entrada and hora_salida:
                diferencia = hora_salida - hora_entrada
                horas = diferencia.total_seconds() / 3600
                validated_data['horas_trabajadas'] = round(horas, 2)
        
        return super().update(instance, validated_data)


class TurnoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField()
    empleado_apellido = serializers.SerializerMethodField()
    
    class Meta:
        model = Turno
        fields = '__all__'
        read_only_fields = ('fecha_creacion',)
    
    def get_empleado_nombre(self, obj):
        try:
            empleado = Empleado.objects.get(rut=obj.empleados_rut)
            return empleado.nombre
        except Empleado.DoesNotExist:
            return None
    
    def get_empleado_apellido(self, obj):
        try:
            empleado = Empleado.objects.get(rut=obj.empleados_rut)
            return empleado.apellido
        except Empleado.DoesNotExist:
            return None
    
    def validate(self, data):
        # Validar que hora_salida sea posterior a hora_entrada
        if data.get('hora_entrada') and data.get('hora_salida'):
            if data['hora_salida'] <= data['hora_entrada']:
                raise serializers.ValidationError({
                    'hora_salida': 'La hora de salida debe ser posterior a la hora de entrada'
                })
        return data
    
    def create(self, validated_data):
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
                validated_data['horas_trabajo'] = round(horas, 2)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
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
                validated_data['horas_trabajo'] = round(horas, 2)
        
        return super().update(instance, validated_data)
    