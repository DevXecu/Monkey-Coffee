from django.contrib import admin
from .models import Proveedor, OrdenCompra, ItemOrdenCompra


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'razon_social', 'rut', 'email', 'telefono', 'estado', 'activo', 'fecha_creacion']
    list_filter = ['estado', 'activo', 'categoria', 'tipo_proveedor']
    search_fields = ['nombre', 'razon_social', 'rut', 'email', 'telefono']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


class ItemOrdenCompraInline(admin.TabularInline):
    model = ItemOrdenCompra
    extra = 1
    fields = ['producto', 'codigo_producto', 'nombre_producto', 'cantidad', 'cantidad_recibida', 'precio_unitario', 'descuento', 'precio_total']


@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    list_display = ['numero_orden', 'proveedor', 'fecha_orden', 'estado', 'total', 'moneda', 'fecha_creacion']
    list_filter = ['estado', 'moneda', 'fecha_orden']
    search_fields = ['numero_orden', 'proveedor__nombre', 'numero_factura']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'subtotal', 'total']
    inlines = [ItemOrdenCompraInline]
