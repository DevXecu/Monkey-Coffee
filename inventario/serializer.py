from rest_framework import serializers
from .models import Inventario
from datetime import timedelta


class InventarioSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    unidad_medida_display = serializers.CharField(source='get_unidad_medida_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    actualizado_por_nombre = serializers.SerializerMethodField()
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.nombre} {obj.creado_por.apellido}"
        return None
    
    def get_actualizado_por_nombre(self, obj):
        if obj.actualizado_por:
            return f"{obj.actualizado_por.nombre} {obj.actualizado_por.apellido}"
        return None
    
    class Meta:
        model = Inventario
        fields = [
            'id',
            'codigo_producto',
            'nombre_producto',
            'descripcion',
            'categoria',
            'categoria_display',
            'unidad_medida',
            'unidad_medida_display',
            'cantidad_actual',
            'cantidad_minima',
            'cantidad_maxima',
            'precio_unitario',
            'precio_venta',
            'codigo_qr',
            'codigo_barra',
            'ubicacion',
            'proveedor',
            'contacto_proveedor',
            'fecha_ultimo_ingreso',
            'fecha_vencimiento',
            'lote',
            'estado',
            'estado_display',
            'requiere_alerta',
            'imagen_producto',
            'notas',
            'fecha_creacion',
            'fecha_actualizacion',
            'creado_por',
            'creado_por_nombre',
            'actualizado_por',
            'actualizado_por_nombre',
            'activo'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

    def validate_codigo_producto(self, value):
        """Validar que el código del producto sea único"""
        if self.instance and self.instance.codigo_producto == value:
            return value
        
        if Inventario.objects.filter(codigo_producto=value).exists():
            raise serializers.ValidationError("Ya existe un producto con este código.")
        return value

    def validate_cantidad_actual(self, value):
        """Validar que la cantidad actual no sea negativa"""
        if value < 0:
            raise serializers.ValidationError("La cantidad actual no puede ser negativa.")
        return value

    def validate_cantidad_minima(self, value):
        """Validar que la cantidad mínima no sea negativa"""
        if value < 0:
            raise serializers.ValidationError("La cantidad mínima no puede ser negativa.")
        return value

    def validate_cantidad_maxima(self, value):
        """Validar que la cantidad máxima sea mayor que la mínima si se proporciona"""
        if value is not None and value < 0:
            raise serializers.ValidationError("La cantidad máxima no puede ser negativa.")
        
        cantidad_minima = self.initial_data.get('cantidad_minima')
        if value is not None and cantidad_minima and value < cantidad_minima:
            raise serializers.ValidationError("La cantidad máxima debe ser mayor que la cantidad mínima.")
        return value

    def validate_precio_unitario(self, value):
        """Validar que el precio unitario no sea negativo"""
        if value is not None and value < 0:
            raise serializers.ValidationError("El precio unitario no puede ser negativo.")
        return value

    def validate_precio_venta(self, value):
        """Validar que el precio de venta no sea negativo"""
        if value is not None and value < 0:
            raise serializers.ValidationError("El precio de venta no puede ser negativo.")
        return value

    def validate_fecha_vencimiento(self, value):
        """Validar que la fecha de vencimiento no sea en el pasado"""
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError("La fecha de vencimiento no puede ser en el pasado.")
        return value


class InventarioCreateSerializer(InventarioSerializer):
    """Serializer específico para crear inventarios"""
    
    class Meta(InventarioSerializer.Meta):
        fields = InventarioSerializer.Meta.fields.copy()
        # Remover campos que se establecen automáticamente
        read_only_fields = InventarioSerializer.Meta.read_only_fields + ['creado_por', 'actualizado_por']


class InventarioUpdateSerializer(InventarioSerializer):
    """Serializer específico para actualizar inventarios"""
    
    class Meta(InventarioSerializer.Meta):
        fields = InventarioSerializer.Meta.fields.copy()
        # Remover campos que no se pueden actualizar
        read_only_fields = InventarioSerializer.Meta.read_only_fields + ['creado_por']


class InventarioListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar inventarios"""
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    stock_bajo = serializers.SerializerMethodField()
    por_vencer = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventario
        fields = [
            'id',
            'codigo_producto',
            'nombre_producto',
            'categoria',
            'categoria_display',
            'cantidad_actual',
            'cantidad_minima',
            'unidad_medida',
            'estado',
            'estado_display',
            'precio_unitario',
            'precio_venta',
            'fecha_vencimiento',
            'stock_bajo',
            'por_vencer',
            'activo'
        ]
    
    def get_stock_bajo(self, obj):
        """Determinar si el stock está bajo"""
        return obj.cantidad_actual <= obj.cantidad_minima
    
    def get_por_vencer(self, obj):
        """Determinar si el producto está por vencer"""
        from django.utils import timezone
        if obj.fecha_vencimiento:
            # Considerar por vencer si vence en los próximos 30 días
            return obj.fecha_vencimiento <= timezone.now().date() + timedelta(days=30)
        return False


class InventarioStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del inventario"""
    total_productos = serializers.IntegerField()
    productos_disponibles = serializers.IntegerField()
    productos_agotados = serializers.IntegerField()
    productos_por_vencer = serializers.IntegerField()
    productos_vencidos = serializers.IntegerField()
    stock_bajo = serializers.IntegerField()
    valor_total_inventario = serializers.DecimalField(max_digits=15, decimal_places=2)
    categorias_distribucion = serializers.DictField()
