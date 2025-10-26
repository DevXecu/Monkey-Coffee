from rest_framework import serializers
from .models import Empleado

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Empleado
        fields = '__all__'
    
    def update(self, instance, validated_data):
        # Si no se proporciona password, no actualizarlo
        if 'password' not in validated_data or not validated_data.get('password'):
            validated_data.pop('password', None)
        
        return super().update(instance, validated_data)
    