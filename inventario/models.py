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
    cantidad_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, db_column='cantidad_actual')
    cantidad_minima = models.DecimalField(max_digits=10, decimal_places=2, db_column='cantidad_minima')
    cantidad_maxima = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='cantidad_maxima')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='precio_unitario')
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='precio_venta')
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
