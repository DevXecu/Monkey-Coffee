from rest_framework import serializers
from .models import Empleado
from datetime import date

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fecha_contratacion = serializers.DateField(required=False, allow_null=True)
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
    