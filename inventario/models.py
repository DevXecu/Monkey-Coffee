from django.db import models
from django.contrib.auth.models import User

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

    codigo_producto = models.CharField(max_length=50)
    nombre_producto = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=20, choices=Categoria.choices)
    unidad_medida = models.CharField(max_length=20, choices=UnidadMedida.choices)
    cantidad_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cantidad_minima = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_maxima = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    codigo_qr = models.CharField(max_length=255, blank=True, null=True)
    codigo_barra = models.CharField(max_length=100, blank=True, null=True)
    ubicacion = models.CharField(max_length=100, blank=True, null=True)
    proveedor = models.CharField(max_length=100, blank=True, null=True)
    contacto_proveedor = models.CharField(max_length=100, blank=True, null=True)
    fecha_ultimo_ingreso = models.DateTimeField(blank=True, null=True)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    lote = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.DISPONIBLE)
    requiere_alerta = models.BooleanField(default=False)
    imagen_producto = models.CharField(max_length=255, blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='inventarios_creados', blank=True, null=True)
    actualizado_por = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='inventarios_actualizados', blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventario'
        verbose_name = 'Inventario'
        verbose_name_plural = 'Inventarios'

    def __str__(self):
        return f"{self.nombre_producto} ({self.codigo_producto})"
