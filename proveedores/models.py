from django.db import models
from empleado.models import Empleado
from inventario.models import Inventario


class Proveedor(models.Model):
    """Modelo para almacenar información de proveedores"""
    
    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'
        SUSPENDIDO = 'suspendido', 'Suspendido'
    
    # Información básica
    nombre = models.CharField(max_length=200, db_column='nombre', unique=True)
    razon_social = models.CharField(max_length=200, blank=True, null=True, db_column='razon_social')
    rut = models.CharField(max_length=20, blank=True, null=True, db_column='rut', unique=True)
    
    # Información de contacto
    email = models.EmailField(max_length=100, blank=True, null=True, db_column='email')
    telefono = models.CharField(max_length=20, blank=True, null=True, db_column='telefono')
    celular = models.CharField(max_length=20, blank=True, null=True, db_column='celular')
    sitio_web = models.URLField(max_length=255, blank=True, null=True, db_column='sitio_web')
    
    # Dirección
    direccion = models.TextField(blank=True, null=True, db_column='direccion')
    ciudad = models.CharField(max_length=100, blank=True, null=True, db_column='ciudad')
    region = models.CharField(max_length=100, blank=True, null=True, db_column='region')
    codigo_postal = models.CharField(max_length=20, blank=True, null=True, db_column='codigo_postal')
    pais = models.CharField(max_length=100, default='Chile', db_column='pais')
    
    # Información adicional
    contacto_principal = models.CharField(max_length=200, blank=True, null=True, db_column='contacto_principal')
    cargo_contacto = models.CharField(max_length=100, blank=True, null=True, db_column='cargo_contacto')
    email_contacto = models.EmailField(max_length=100, blank=True, null=True, db_column='email_contacto')
    telefono_contacto = models.CharField(max_length=20, blank=True, null=True, db_column='telefono_contacto')
    
    # Estado y categorización
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVO, db_column='estado')
    categoria = models.CharField(max_length=100, blank=True, null=True, db_column='categoria')
    tipo_proveedor = models.CharField(max_length=100, blank=True, null=True, db_column='tipo_proveedor')
    
    # Información financiera
    condiciones_pago = models.CharField(max_length=100, blank=True, null=True, db_column='condiciones_pago')
    plazo_entrega = models.CharField(max_length=100, blank=True, null=True, db_column='plazo_entrega')
    descuento = models.DecimalField(max_digits=5, decimal_places=2, default=0, db_column='descuento')
    
    # Notas y observaciones
    notas = models.TextField(blank=True, null=True, db_column='notas')
    activo = models.BooleanField(default=True, db_column='activo')
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    creado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='proveedores_creados', blank=True, null=True, db_column='creado_por')
    actualizado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='proveedores_actualizados', blank=True, null=True, db_column='actualizado_por')
    
    class Meta:
        db_table = 'proveedores'
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        indexes = [
            models.Index(fields=['nombre']),
            models.Index(fields=['estado']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        return self.nombre


class OrdenCompra(models.Model):
    """Modelo para órdenes de compra"""
    
    class Estado(models.TextChoices):
        BORRADOR = 'borrador', 'Borrador'
        PENDIENTE = 'pendiente', 'Pendiente'
        ENVIADA = 'enviada', 'Enviada'
        CONFIRMADA = 'confirmada', 'Confirmada'
        EN_TRANSITO = 'en_transito', 'En Tránsito'
        RECIBIDA = 'recibida', 'Recibida'
        PARCIALMENTE_RECIBIDA = 'parcialmente_recibida', 'Parcialmente Recibida'
        CANCELADA = 'cancelada', 'Cancelada'
        FACTURADA = 'facturada', 'Facturada'
    
    # Información básica
    numero_orden = models.CharField(max_length=50, unique=True, db_column='numero_orden')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='ordenes_compra', db_column='proveedor_id')
    
    # Fechas
    fecha_orden = models.DateField(db_column='fecha_orden')
    fecha_entrega_esperada = models.DateField(blank=True, null=True, db_column='fecha_entrega_esperada')
    fecha_entrega_real = models.DateField(blank=True, null=True, db_column='fecha_entrega_real')
    
    # Estado
    estado = models.CharField(max_length=30, choices=Estado.choices, default=Estado.BORRADOR, db_column='estado')
    
    # Información financiera
    subtotal = models.IntegerField(default=0, db_column='subtotal')
    descuento = models.IntegerField(default=0, db_column='descuento')
    impuestos = models.IntegerField(default=0, db_column='impuestos')
    total = models.IntegerField(default=0, db_column='total')
    moneda = models.CharField(max_length=10, default='CLP', db_column='moneda')
    
    # Información adicional
    condiciones_pago = models.CharField(max_length=200, blank=True, null=True, db_column='condiciones_pago')
    metodo_envio = models.CharField(max_length=100, blank=True, null=True, db_column='metodo_envio')
    direccion_entrega = models.TextField(blank=True, null=True, db_column='direccion_entrega')
    notas = models.TextField(blank=True, null=True, db_column='notas')
    numero_factura = models.CharField(max_length=50, blank=True, null=True, db_column='numero_factura')
    
    # Usuarios
    creado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='ordenes_compra_creadas', blank=True, null=True, db_column='creado_por')
    aprobado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='ordenes_compra_aprobadas', blank=True, null=True, db_column='aprobado_por')
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    fecha_aprobacion = models.DateTimeField(blank=True, null=True, db_column='fecha_aprobacion')
    
    class Meta:
        db_table = 'ordenes_compra'
        verbose_name = 'Orden de Compra'
        verbose_name_plural = 'Órdenes de Compra'
        indexes = [
            models.Index(fields=['numero_orden']),
            models.Index(fields=['proveedor']),
            models.Index(fields=['estado']),
            models.Index(fields=['fecha_orden']),
        ]
    
    def __str__(self):
        return f"Orden {self.numero_orden} - {self.proveedor.nombre}"
    
    def calcular_total(self):
        """Calcular el total de la orden basado en los items"""
        items = self.items.all()
        subtotal = sum(item.precio_total for item in items)
        self.subtotal = subtotal
        self.total = subtotal - self.descuento + self.impuestos
        self.save()


class ItemOrdenCompra(models.Model):
    """Modelo para items de una orden de compra"""
    
    orden_compra = models.ForeignKey(OrdenCompra, on_delete=models.CASCADE, related_name='items', db_column='orden_compra_id')
    producto = models.ForeignKey(Inventario, on_delete=models.SET_NULL, blank=True, null=True, related_name='ordenes_compra', db_column='producto_id')
    
    # Información del producto (puede ser un producto del inventario o uno externo)
    codigo_producto = models.CharField(max_length=50, blank=True, null=True, db_column='codigo_producto')
    nombre_producto = models.CharField(max_length=200, db_column='nombre_producto')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    
    # Cantidad y precios
    cantidad = models.IntegerField(db_column='cantidad')
    cantidad_recibida = models.IntegerField(default=0, db_column='cantidad_recibida')
    unidad_medida = models.CharField(max_length=20, default='unidad', db_column='unidad_medida')
    precio_unitario = models.IntegerField(db_column='precio_unitario')
    descuento = models.IntegerField(default=0, db_column='descuento')
    precio_total = models.IntegerField(db_column='precio_total')
    
    # Información adicional
    notas = models.TextField(blank=True, null=True, db_column='notas')
    
    class Meta:
        db_table = 'items_orden_compra'
        verbose_name = 'Item de Orden de Compra'
        verbose_name_plural = 'Items de Órdenes de Compra'
        indexes = [
            models.Index(fields=['orden_compra']),
            models.Index(fields=['producto']),
        ]
    
    def __str__(self):
        return f"{self.nombre_producto} - Cantidad: {self.cantidad}"
    
    def save(self, *args, **kwargs):
        """Calcular precio_total antes de guardar"""
        self.precio_total = (self.precio_unitario * self.cantidad) - self.descuento
        super().save(*args, **kwargs)
        # Recalcular total de la orden
        if self.orden_compra:
            self.orden_compra.calcular_total()
