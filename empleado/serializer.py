from rest_framework import serializers
from .models import Empleado
from datetime import date

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
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
    
    def create(self, validated_data):
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
        # Si no se proporciona password, no actualizarlo
        if 'password' not in validated_data or not validated_data.get('password'):
            validated_data.pop('password', None)
        
        # Actualizar los campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    