from rest_framework import serializers
from .models import Inventario
from datetime import timedelta


class InventarioSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    unidad_medida_display = serializers.CharField(source='get_unidad_medida_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    actualizado_por_nombre = serializers.SerializerMethodField()
    precio_con_iva = serializers.SerializerMethodField()
    ganancia = serializers.SerializerMethodField()
    proveedor = serializers.SerializerMethodField()  # Cambiar a SerializerMethodField para evitar activar la relación
    proveedor_nombre = serializers.SerializerMethodField()
    proveedor_telefono = serializers.SerializerMethodField()
    proveedor_email = serializers.SerializerMethodField()
    
    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.nombre} {obj.creado_por.apellido}"
        return None
    
    def get_actualizado_por_nombre(self, obj):
        if obj.actualizado_por:
            return f"{obj.actualizado_por.nombre} {obj.actualizado_por.apellido}"
        return None
    
    def get_precio_con_iva(self, obj):
        """Calcular precio de venta con IVA (19%)"""
        if obj.precio_venta is not None:
            # IVA en Chile es 19%
            return int(obj.precio_venta * 1.19)
        return None
    
    def get_ganancia(self, obj):
        """Calcular ganancia (precio_venta - precio_unitario)"""
        if obj.precio_venta is not None and obj.precio_unitario is not None:
            return int(obj.precio_venta - obj.precio_unitario)
        return None
    
    def get_proveedor(self, obj):
        """Obtener ID del proveedor sin activar la relación ForeignKey"""
        try:
            # Obtener el valor crudo del campo sin activar la relación
            proveedor_value = obj.__dict__.get('proveedor_id', None)
            if proveedor_value is None:
                proveedor_value = obj.__dict__.get('proveedor', None)
            
            # Si es un número válido, devolverlo
            if proveedor_value is not None:
                if isinstance(proveedor_value, int):
                    return proveedor_value
                elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                    return int(proveedor_value)
        except (AttributeError, KeyError, ValueError, TypeError):
            pass
        return None
    
    def get_proveedor_nombre(self, obj):
        """Obtener nombre del proveedor"""
        try:
            # Intentar obtener el valor crudo del campo sin activar la relación ForeignKey
            # Esto previene errores si el campo todavía contiene texto en lugar de IDs
            proveedor_value = None
            
            # Primero intentar obtener proveedor_id (si la migración se ejecutó)
            try:
                proveedor_value = obj.__dict__.get('proveedor_id', None)
            except (AttributeError, KeyError):
                pass
            
            # Si no hay proveedor_id, puede que todavía esté como 'proveedor' (texto)
            if proveedor_value is None:
                try:
                    # Intentar obtener el valor directamente del dict sin activar la relación
                    proveedor_value = obj.__dict__.get('proveedor', None)
                except (AttributeError, KeyError):
                    pass
            
            # Si tenemos un valor, intentar usarlo
            if proveedor_value is not None:
                try:
                    # Si es un número válido (int o string que representa un número)
                    if isinstance(proveedor_value, int):
                        proveedor_id_int = proveedor_value
                    elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                        proveedor_id_int = int(proveedor_value)
                    else:
                        # Es texto (nombre del proveedor), no podemos hacer la relación
                        return proveedor_value  # Devolver el nombre directamente
                    
                    # Si llegamos aquí, tenemos un ID válido
                    from proveedores.models import Proveedor
                    proveedor = Proveedor.objects.get(id=proveedor_id_int)
                    return proveedor.nombre
                except (ValueError, TypeError, Proveedor.DoesNotExist, AttributeError):
                    # Si falla, puede que sea texto, devolverlo como está
                    if isinstance(proveedor_value, str):
                        return proveedor_value
                    pass
        except Exception:
            pass
        
        # Fallback: devolver contacto_proveedor si existe
        return obj.contacto_proveedor if hasattr(obj, 'contacto_proveedor') else None
    
    def get_proveedor_telefono(self, obj):
        """Obtener teléfono del proveedor"""
        try:
            proveedor_value = None
            try:
                proveedor_value = obj.__dict__.get('proveedor_id', None)
            except (AttributeError, KeyError):
                pass
            
            if proveedor_value is None:
                try:
                    proveedor_value = obj.__dict__.get('proveedor', None)
                except (AttributeError, KeyError):
                    pass
            
            if proveedor_value is not None:
                try:
                    if isinstance(proveedor_value, int):
                        proveedor_id_int = proveedor_value
                    elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                        proveedor_id_int = int(proveedor_value)
                    else:
                        # Es texto, no podemos obtener el teléfono
                        return None
                    
                    from proveedores.models import Proveedor
                    proveedor = Proveedor.objects.get(id=proveedor_id_int)
                    return proveedor.telefono or proveedor.celular
                except (ValueError, TypeError, Proveedor.DoesNotExist, AttributeError):
                    pass
        except Exception:
            pass
        return None
    
    def get_proveedor_email(self, obj):
        """Obtener email del proveedor"""
        try:
            proveedor_value = None
            try:
                proveedor_value = obj.__dict__.get('proveedor_id', None)
            except (AttributeError, KeyError):
                pass
            
            if proveedor_value is None:
                try:
                    proveedor_value = obj.__dict__.get('proveedor', None)
                except (AttributeError, KeyError):
                    pass
            
            if proveedor_value is not None:
                try:
                    if isinstance(proveedor_value, int):
                        proveedor_id_int = proveedor_value
                    elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                        proveedor_id_int = int(proveedor_value)
                    else:
                        # Es texto, no podemos obtener el email
                        return None
                    
                    from proveedores.models import Proveedor
                    proveedor = Proveedor.objects.get(id=proveedor_id_int)
                    return proveedor.email or proveedor.email_contacto
                except (ValueError, TypeError, Proveedor.DoesNotExist, AttributeError):
                    pass
        except Exception:
            pass
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
            'precio_con_iva',
            'ganancia',
            'codigo_qr',
            'codigo_barra',
            'ubicacion',
            'proveedor',
            'proveedor_nombre',
            'proveedor_telefono',
            'proveedor_email',
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
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'precio_venta']

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

    def validate(self, data):
        """Calcular automáticamente el precio de venta si se proporciona precio_unitario"""
        # Solo calcular precio_venta si precio_unitario está en los datos (crear o actualizar)
        precio_unitario = data.get('precio_unitario')
        
        # Si hay precio_unitario en los datos, calcular precio_venta automáticamente
        # Fórmula: Precio Unitario + 19% IVA + 10% ganancia = Precio Unitario * 1.29
        if precio_unitario is not None and precio_unitario >= 0:
            precio_venta_calculado = int(precio_unitario * 1.29)
            data['precio_venta'] = precio_venta_calculado
        
        return data

    def validate_fecha_vencimiento(self, value):
        """Validar que la fecha de vencimiento no sea en el pasado (solo para nuevos productos)"""
        # Permitir fechas pasadas si se está actualizando un producto existente
        # Esto permite editar productos que ya tienen fechas de vencimiento pasadas
        if self.instance is None and value:
            # Solo validar para productos nuevos
            from django.utils import timezone
            if value < timezone.now().date():
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
    precio_con_iva = serializers.SerializerMethodField()
    ganancia = serializers.SerializerMethodField()
    proveedor = serializers.SerializerMethodField()
    proveedor_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventario
        fields = [
            'id',
            'codigo_producto',
            'nombre_producto',
            'descripcion',
            'categoria',
            'categoria_display',
            'cantidad_actual',
            'cantidad_minima',
            'cantidad_maxima',
            'unidad_medida',
            'estado',
            'estado_display',
            'precio_unitario',
            'precio_venta',
            'precio_con_iva',
            'ganancia',
            'fecha_vencimiento',
            'stock_bajo',
            'por_vencer',
            'proveedor',
            'proveedor_nombre',
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
    
    def get_precio_con_iva(self, obj):
        """Calcular precio de venta con IVA (19%)"""
        if obj.precio_venta is not None:
            # IVA en Chile es 19%
            return int(obj.precio_venta * 1.19)
        return None
    
    def get_ganancia(self, obj):
        """Calcular ganancia (precio_venta - precio_unitario)"""
        if obj.precio_venta is not None and obj.precio_unitario is not None:
            return int(obj.precio_venta - obj.precio_unitario)
        return None
    
    def get_proveedor(self, obj):
        """Obtener ID del proveedor sin activar la relación ForeignKey"""
        try:
            # Obtener el valor crudo del campo sin activar la relación
            proveedor_value = obj.__dict__.get('proveedor_id', None)
            if proveedor_value is None:
                proveedor_value = obj.__dict__.get('proveedor', None)
            
            # Si es un número válido, devolverlo
            if proveedor_value is not None:
                if isinstance(proveedor_value, int):
                    return proveedor_value
                elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                    return int(proveedor_value)
        except (AttributeError, KeyError, ValueError, TypeError):
            pass
        return None
    
    def get_proveedor_nombre(self, obj):
        """Obtener nombre del proveedor"""
        try:
            # Intentar obtener el valor crudo del campo sin activar la relación ForeignKey
            proveedor_value = None
            
            # Primero intentar obtener proveedor_id (si la migración se ejecutó)
            try:
                proveedor_value = obj.__dict__.get('proveedor_id', None)
            except (AttributeError, KeyError):
                pass
            
            # Si no hay proveedor_id, puede que todavía esté como 'proveedor' (texto)
            if proveedor_value is None:
                try:
                    # Intentar obtener el valor directamente del dict sin activar la relación
                    proveedor_value = obj.__dict__.get('proveedor', None)
                except (AttributeError, KeyError):
                    pass
            
            # Si tenemos un valor, intentar usarlo
            if proveedor_value is not None:
                try:
                    # Si es un número válido (int o string que representa un número)
                    if isinstance(proveedor_value, int):
                        proveedor_id_int = proveedor_value
                    elif isinstance(proveedor_value, str) and proveedor_value.isdigit():
                        proveedor_id_int = int(proveedor_value)
                    else:
                        # Es texto (nombre del proveedor), devolverlo directamente
                        return proveedor_value
                    
                    # Si llegamos aquí, tenemos un ID válido
                    from proveedores.models import Proveedor
                    proveedor = Proveedor.objects.get(id=proveedor_id_int)
                    return proveedor.nombre
                except (ValueError, TypeError, Proveedor.DoesNotExist, AttributeError):
                    # Si falla, puede que sea texto, devolverlo como está
                    if isinstance(proveedor_value, str):
                        return proveedor_value
                    pass
        except Exception:
            pass
        
        # Fallback: devolver contacto_proveedor si existe
        return obj.contacto_proveedor if hasattr(obj, 'contacto_proveedor') else None
    
    def get_proveedor(self, obj):
        """Obtener nombre del proveedor para compatibilidad con el frontend"""
        # Devolver el nombre del proveedor en lugar del ID para compatibilidad
        return self.get_proveedor_nombre(obj)


class InventarioStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del inventario"""
    total_productos = serializers.IntegerField()
    productos_disponibles = serializers.IntegerField()
    productos_agotados = serializers.IntegerField()
    productos_por_vencer = serializers.IntegerField()
    productos_vencidos = serializers.IntegerField()
    stock_bajo = serializers.IntegerField()
    valor_total_inventario = serializers.IntegerField()
    categorias_distribucion = serializers.DictField()


