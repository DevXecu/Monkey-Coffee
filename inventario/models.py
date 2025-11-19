from django.db import models
from empleado.models import Empleado

class Inventario(models.Model):
    class Categoria(models.TextChoices):
        CAFE = 'cafe', 'Café'
        INSUMOS = 'insumos', 'Insumos'
        EQUIPAMIENTO = 'equipamiento', 'Equipamiento'
        DESECHABLES = 'desechables', 'Desechables'
        ALIMENTOS = 'alimentos', 'Alimentos'
        BEBIDAS = 'bebidas', 'Bebidas'
        LIMPIEZA = 'limpieza', 'Limpieza'
        OTROS = 'otros', 'Otros'

    class UnidadMedida(models.TextChoices):
        UNIDAD = 'unidad', 'Unidad'
        KILOGRAMO = 'kilogramo', 'Kilogramo'
        LITRO = 'litro', 'Litro'
        GRAMO = 'gramo', 'Gramo'
        MILILITRO = 'mililitro', 'Mililitro'
        PAQUETE = 'paquete', 'Paquete'
        CAJA = 'caja', 'Caja'
        BOLSA = 'bolsa', 'Bolsa'

    class Estado(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        AGOTADO = 'agotado', 'Agotado'
        POR_VENCER = 'por_vencer', 'Por vencer'
        VENCIDO = 'vencido', 'Vencido'
        EN_PEDIDO = 'en_pedido', 'En pedido'
        DESCONTINUADO = 'descontinuado', 'Descontinuado'

    codigo_producto = models.CharField(max_length=50, db_column='codigo_producto', unique=True)
    nombre_producto = models.CharField(max_length=100, db_column='nombre_producto')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    categoria = models.CharField(max_length=20, choices=Categoria.choices, db_column='categoria')
    unidad_medida = models.CharField(max_length=20, choices=UnidadMedida.choices, db_column='unidad_medida')
    cantidad_actual = models.IntegerField(default=0, db_column='cantidad_actual')
    cantidad_minima = models.IntegerField(db_column='cantidad_minima')
    cantidad_maxima = models.IntegerField(blank=True, null=True, db_column='cantidad_maxima')
    precio_unitario = models.IntegerField(blank=True, null=True, db_column='precio_unitario')
    precio_venta = models.IntegerField(blank=True, null=True, db_column='precio_venta')
    codigo_qr = models.CharField(max_length=255, blank=True, null=True, db_column='codigo_qr')
    codigo_barra = models.CharField(max_length=100, blank=True, null=True, db_column='codigo_barra')
    ubicacion = models.CharField(max_length=100, blank=True, null=True, db_column='ubicacion')
    proveedor = models.CharField(max_length=100, blank=True, null=True, db_column='proveedor')
    contacto_proveedor = models.CharField(max_length=100, blank=True, null=True, db_column='contacto_proveedor')
    fecha_ultimo_ingreso = models.DateTimeField(blank=True, null=True, db_column='fecha_ultimo_ingreso')
    fecha_vencimiento = models.DateField(blank=True, null=True, db_column='fecha_vencimiento')
    lote = models.CharField(max_length=50, blank=True, null=True, db_column='lote')
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.DISPONIBLE, db_column='estado')
    requiere_alerta = models.BooleanField(default=False, db_column='requiere_alerta')
    imagen_producto = models.CharField(max_length=255, blank=True, null=True, db_column='imagen_producto')
    notas = models.TextField(blank=True, null=True, db_column='notas')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    creado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='inventarios_creados', blank=True, null=True, db_column='creado_por')
    actualizado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, related_name='inventarios_actualizados', blank=True, null=True, db_column='actualizado_por')
    activo = models.BooleanField(default=True, db_column='activo')

    class Meta:
        db_table = 'inventario'
        verbose_name = 'Inventario'
        verbose_name_plural = 'Inventarios'

    def __str__(self):
        return f"{self.nombre_producto} ({self.codigo_producto})"


class AlertasInventario(models.Model):
    TIPO_ALERTA_CHOICES = [
        ('stock_bajo', 'Stock Bajo'),
        ('stock_critico', 'Stock Crítico'),
        ('producto_vencido', 'Producto Vencido'),
        ('por_vencer', 'Por Vencer'),
        ('sin_stock', 'Sin Stock'),
        ('sobre_stock', 'Sobre Stock'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('revisada', 'Revisada'),
        ('resuelta', 'Resuelta'),
        ('ignorada', 'Ignorada'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]
    
    inventario_id = models.ForeignKey('Inventario', on_delete=models.CASCADE, db_column='inventario_id', related_name='alertas')
    tipo_alerta = models.CharField(max_length=20, choices=TIPO_ALERTA_CHOICES, db_column='tipo_alerta')
    mensaje = models.TextField(db_column='mensaje')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', db_column='estado')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media', db_column='prioridad')
    fecha_alerta = models.DateTimeField(auto_now_add=True, db_column='fecha_alerta')
    fecha_resolucion = models.DateTimeField(blank=True, null=True, db_column='fecha_resolucion')
    resuelto_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, blank=True, null=True, db_column='resuelto_por', related_name='alertas_resueltas')
    notas_resolucion = models.TextField(blank=True, null=True, db_column='notas_resolucion')
    
    class Meta:
        db_table = 'alertas_inventario'
        indexes = [
            models.Index(fields=['inventario_id']),
            models.Index(fields=['estado']),
            models.Index(fields=['tipo_alerta']),
            models.Index(fields=['prioridad']),
            models.Index(fields=['fecha_alerta']),
        ]
    
    def __str__(self):
        return f"{self.tipo_alerta} - {self.inventario_id.nombre_producto}"


class MovimientosInventario(models.Model):
    TIPO_MOVIMIENTO_CHOICES = [
        ('ingreso', 'Ingreso'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
        ('merma', 'Merma'),
        ('devolucion', 'Devolución'),
        ('transferencia', 'Transferencia'),
        ('venta', 'Venta'),
    ]
    
    inventario_id = models.ForeignKey('Inventario', on_delete=models.CASCADE, db_column='inventario_id', related_name='movimientos')
    tipo_movimiento = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO_CHOICES, db_column='tipo_movimiento')
    cantidad = models.IntegerField(db_column='cantidad')
    cantidad_anterior = models.IntegerField(db_column='cantidad_anterior')
    cantidad_nueva = models.IntegerField(db_column='cantidad_nueva')
    precio_unitario = models.IntegerField(blank=True, null=True, db_column='precio_unitario')
    costo_total = models.IntegerField(blank=True, null=True, db_column='costo_total')
    motivo = models.CharField(max_length=255, blank=True, null=True, db_column='motivo')
    documento_referencia = models.CharField(max_length=100, blank=True, null=True, db_column='documento_referencia')
    proveedor = models.CharField(max_length=100, blank=True, null=True, db_column='proveedor')
    empleado_id = models.ForeignKey(Empleado, on_delete=models.SET_NULL, blank=True, null=True, db_column='empleado_id', related_name='movimientos_inventario')
    ubicacion_origen = models.CharField(max_length=100, blank=True, null=True, db_column='ubicacion_origen')
    ubicacion_destino = models.CharField(max_length=100, blank=True, null=True, db_column='ubicacion_destino')
    fecha_movimiento = models.DateTimeField(auto_now_add=True, db_column='fecha_movimiento')
    notas = models.TextField(blank=True, null=True, db_column='notas')
    
    class Meta:
        db_table = 'movimientos_inventario'
        indexes = [
            models.Index(fields=['inventario_id']),
            models.Index(fields=['tipo_movimiento']),
            models.Index(fields=['fecha_movimiento']),
            models.Index(fields=['empleado_id']),
            models.Index(fields=['inventario_id', 'fecha_movimiento', 'tipo_movimiento']),
        ]
    
    def __str__(self):
        return f"{self.tipo_movimiento} - {self.inventario_id.nombre_producto} - {self.cantidad}"

