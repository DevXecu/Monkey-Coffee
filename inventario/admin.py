from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from .models import Inventario


@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Inventario
    """
    list_display = [
        'codigo_producto',
        'nombre_producto', 
        'categoria',
        'cantidad_actual',
        'cantidad_minima',
        'unidad_medida',
        'estado',
        'precio_unitario',
        'proveedor',
        'fecha_vencimiento',
        'stock_status',
        'activo',
        'fecha_creacion'
    ]
    
    list_filter = [
        'categoria',
        'estado',
        'activo',
        'requiere_alerta',
        'fecha_creacion',
        'fecha_vencimiento',
        'proveedor'
    ]
    
    search_fields = [
        'codigo_producto',
        'nombre_producto',
        'descripcion',
        'proveedor',
        'codigo_barra',
        'codigo_qr'
    ]
    
    list_editable = [
        'cantidad_actual',
        'cantidad_minima',
        'estado',
        'precio_unitario',
        'activo'
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
        'creado_por',
        'actualizado_por'
    ]
    
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'codigo_producto',
                'nombre_producto',
                'descripcion',
                'categoria',
                'estado'
            )
        }),
        ('Stock y Medidas', {
            'fields': (
                'cantidad_actual',
                'cantidad_minima',
                'cantidad_maxima',
                'unidad_medida'
            )
        }),
        ('Precios', {
            'fields': (
                'precio_unitario',
                'precio_venta'
            )
        }),
        ('Códigos y Ubicación', {
            'fields': (
                'codigo_qr',
                'codigo_barra',
                'ubicacion',
                'imagen_producto'
            )
        }),
        ('Proveedor', {
            'fields': (
                'proveedor',
                'contacto_proveedor'
            )
        }),
        ('Fechas', {
            'fields': (
                'fecha_ultimo_ingreso',
                'fecha_vencimiento',
                'lote'
            )
        }),
        ('Configuración', {
            'fields': (
                'requiere_alerta',
                'activo',
                'notas'
            )
        }),
        ('Auditoría', {
            'fields': (
                'fecha_creacion',
                'fecha_actualizacion',
                'creado_por',
                'actualizado_por'
            ),
            'classes': ('collapse',)
        })
    )
    
    ordering = ['-fecha_creacion']
    
    def stock_status(self, obj):
        """Mostrar el estado del stock con colores"""
        if obj.cantidad_actual <= 0:
            return format_html(
                '<span style="color: red; font-weight: bold;">AGOTADO</span>'
            )
        elif obj.cantidad_actual <= obj.cantidad_minima:
            return format_html(
                '<span style="color: orange; font-weight: bold;">STOCK BAJO</span>'
            )
        else:
            return format_html(
                '<span style="color: green;">OK</span>'
            )
    stock_status.short_description = 'Estado Stock'
    
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'creado_por', 'actualizado_por'
        )
    
    def save_model(self, request, obj, form, change):
        """Establecer usuario al crear/actualizar"""
        if not change:  # Creando nuevo objeto
            obj.creado_por = request.user
        else:  # Actualizando objeto existente
            obj.actualizado_por = request.user
        super().save_model(request, obj, form, change)
    
    def get_readonly_fields(self, request, obj=None):
        """Hacer campos de solo lectura según el contexto"""
        readonly_fields = list(self.readonly_fields)
        
        # Si es un objeto existente, no permitir cambiar el creado_por
        if obj:
            readonly_fields.append('creado_por')
        
        return readonly_fields
    
    def changelist_view(self, request, extra_context=None):
        """Agregar contexto adicional a la vista de lista"""
        extra_context = extra_context or {}
        
        # Estadísticas básicas
        queryset = self.get_queryset(request)
        total_productos = queryset.count()
        stock_bajo = queryset.filter(cantidad_actual__lte=models.F('cantidad_minima')).count()
        agotados = queryset.filter(cantidad_actual=0).count()
        
        # Productos por vencer (próximos 30 días)
        fecha_limite = timezone.now().date() + timedelta(days=30)
        por_vencer = queryset.filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gt=timezone.now().date()
        ).count()
        
        extra_context.update({
            'total_productos': total_productos,
            'stock_bajo': stock_bajo,
            'agotados': agotados,
            'por_vencer': por_vencer
        })
        
        return super().changelist_view(request, extra_context)
    
    actions = ['marcar_como_agotado', 'marcar_como_disponible', 'activar_alertas']
    
    def marcar_como_agotado(self, request, queryset):
        """Acción para marcar productos como agotados"""
        updated = queryset.update(estado=Inventario.Estado.AGOTADO)
        self.message_user(
            request,
            f'{updated} productos marcados como agotados.'
        )
    marcar_como_agotado.short_description = "Marcar como agotado"
    
    def marcar_como_disponible(self, request, queryset):
        """Acción para marcar productos como disponibles"""
        updated = queryset.update(estado=Inventario.Estado.DISPONIBLE)
        self.message_user(
            request,
            f'{updated} productos marcados como disponibles.'
        )
    marcar_como_disponible.short_description = "Marcar como disponible"
    
    def activar_alertas(self, request, queryset):
        """Acción para activar alertas de stock bajo"""
        updated = queryset.update(requiere_alerta=True)
        self.message_user(
            request,
            f'Alertas activadas para {updated} productos.'
        )
    activar_alertas.short_description = "Activar alertas de stock"


# Importar models para usar en admin
from django.db import models