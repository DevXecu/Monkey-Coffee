from rest_framework import serializers
from .models import Proveedor, OrdenCompra, ItemOrdenCompra
from inventario.serializer import InventarioListSerializer


class ProveedorSerializer(serializers.ModelSerializer):
    """Serializer para Proveedor"""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    actualizado_por_nombre = serializers.SerializerMethodField()
    total_ordenes = serializers.SerializerMethodField()
    total_compras = serializers.SerializerMethodField()
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.nombre} {obj.creado_por.apellido}"
        return None
    
    def get_actualizado_por_nombre(self, obj):
        if obj.actualizado_por:
            return f"{obj.actualizado_por.nombre} {obj.actualizado_por.apellido}"
        return None
    
    def get_total_ordenes(self, obj):
        """Obtener el total de órdenes del proveedor"""
        return obj.ordenes_compra.count()
    
    def get_total_compras(self, obj):
        """Obtener el total de compras realizadas"""
        from django.db.models import Sum
        total = obj.ordenes_compra.filter(estado__in=['recibida', 'parcialmente_recibida', 'facturada']).aggregate(
            total=Sum('total')
        )['total'] or 0
        return total
    
    class Meta:
        model = Proveedor
        fields = [
            'id',
            'nombre',
            'razon_social',
            'rut',
            'email',
            'telefono',
            'celular',
            'sitio_web',
            'direccion',
            'ciudad',
            'region',
            'codigo_postal',
            'pais',
            'contacto_principal',
            'cargo_contacto',
            'email_contacto',
            'telefono_contacto',
            'estado',
            'estado_display',
            'categoria',
            'tipo_proveedor',
            'condiciones_pago',
            'plazo_entrega',
            'descuento',
            'notas',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion',
            'creado_por',
            'creado_por_nombre',
            'actualizado_por',
            'actualizado_por_nombre',
            'total_ordenes',
            'total_compras',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class ProveedorListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar proveedores"""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    total_ordenes = serializers.SerializerMethodField()
    
    def get_total_ordenes(self, obj):
        return obj.ordenes_compra.count()
    
    class Meta:
        model = Proveedor
        fields = [
            'id',
            'nombre',
            'razon_social',
            'rut',
            'email',
            'telefono',
            'celular',
            'contacto_principal',
            'estado',
            'estado_display',
            'categoria',
            'tipo_proveedor',
            'activo',
            'fecha_creacion',
            'total_ordenes',
        ]


class ItemOrdenCompraSerializer(serializers.ModelSerializer):
    """Serializer para ItemOrdenCompra"""
    producto_info = InventarioListSerializer(source='producto', read_only=True)
    nombre_producto_display = serializers.SerializerMethodField()
    
    def get_nombre_producto_display(self, obj):
        if obj.producto:
            return obj.producto.nombre_producto
        return obj.nombre_producto
    
    class Meta:
        model = ItemOrdenCompra
        fields = [
            'id',
            'orden_compra',
            'producto',
            'producto_info',
            'codigo_producto',
            'nombre_producto',
            'nombre_producto_display',
            'descripcion',
            'cantidad',
            'cantidad_recibida',
            'unidad_medida',
            'precio_unitario',
            'descuento',
            'precio_total',
            'notas',
        ]
        read_only_fields = ['id', 'precio_total']


class OrdenCompraSerializer(serializers.ModelSerializer):
    """Serializer para OrdenCompra"""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    proveedor_info = ProveedorListSerializer(source='proveedor', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    aprobado_por_nombre = serializers.SerializerMethodField()
    items = ItemOrdenCompraSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.nombre} {obj.creado_por.apellido}"
        return None
    
    def get_aprobado_por_nombre(self, obj):
        if obj.aprobado_por:
            return f"{obj.aprobado_por.nombre} {obj.aprobado_por.apellido}"
        return None
    
    def get_total_items(self, obj):
        """Obtener el total de items en la orden"""
        return obj.items.count()
    
    class Meta:
        model = OrdenCompra
        fields = [
            'id',
            'numero_orden',
            'proveedor',
            'proveedor_nombre',
            'proveedor_info',
            'fecha_orden',
            'fecha_entrega_esperada',
            'fecha_entrega_real',
            'estado',
            'estado_display',
            'subtotal',
            'descuento',
            'impuestos',
            'total',
            'moneda',
            'condiciones_pago',
            'metodo_envio',
            'direccion_entrega',
            'notas',
            'numero_factura',
            'creado_por',
            'creado_por_nombre',
            'aprobado_por',
            'aprobado_por_nombre',
            'fecha_creacion',
            'fecha_actualizacion',
            'fecha_aprobacion',
            'items',
            'total_items',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'subtotal', 'total']


class OrdenCompraListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar órdenes de compra"""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    total_items = serializers.SerializerMethodField()
    
    def get_total_items(self, obj):
        return obj.items.count()
    
    class Meta:
        model = OrdenCompra
        fields = [
            'id',
            'numero_orden',
            'proveedor',
            'proveedor_nombre',
            'fecha_orden',
            'fecha_entrega_esperada',
            'fecha_entrega_real',
            'estado',
            'estado_display',
            'total',
            'moneda',
            'fecha_creacion',
            'total_items',
        ]


class OrdenCompraCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear órdenes de compra con items"""
    items = ItemOrdenCompraSerializer(many=True)
    
    class Meta:
        model = OrdenCompra
        fields = [
            'numero_orden',
            'proveedor',
            'fecha_orden',
            'fecha_entrega_esperada',
            'estado',
            'descuento',
            'impuestos',
            'moneda',
            'condiciones_pago',
            'metodo_envio',
            'direccion_entrega',
            'notas',
            'items',
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        orden = OrdenCompra.objects.create(**validated_data)
        
        for item_data in items_data:
            ItemOrdenCompra.objects.create(orden_compra=orden, **item_data)
        
        orden.calcular_total()
        return orden


class HistorialCompraSerializer(serializers.Serializer):
    """Serializer para el historial de compras por proveedor"""
    proveedor_id = serializers.IntegerField()
    proveedor_nombre = serializers.CharField()
    total_ordenes = serializers.IntegerField()
    total_compras = serializers.IntegerField()
    ultima_compra = serializers.DateTimeField(allow_null=True)
    ordenes = OrdenCompraListSerializer(many=True)

