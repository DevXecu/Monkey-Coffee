from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from datetime import timedelta
import traceback
from .models import Inventario
from .serializer import (
    InventarioSerializer, 
    InventarioCreateSerializer, 
    InventarioUpdateSerializer,
    InventarioListSerializer,
    InventarioStatsSerializer
)

class InventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar el inventario de productos
    """
    queryset = Inventario.objects.filter(activo=True)
    # permission_classes = [IsAuthenticated]  # Deshabilitado para desarrollo
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'estado', 'proveedor', 'activo']
    search_fields = ['codigo_producto', 'nombre_producto', 'descripcion', 'proveedor']
    ordering_fields = ['nombre_producto', 'cantidad_actual', 'fecha_creacion', 'fecha_vencimiento']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        """Retornar el serializer apropiado según la acción"""
        if self.action == 'create':
            return InventarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InventarioUpdateSerializer
        elif self.action == 'list':
            return InventarioListSerializer
        return InventarioSerializer

    def get_queryset(self):
        """Filtrar queryset según parámetros adicionales"""
        queryset = super().get_queryset()
        
        # Filtro para stock bajo
        if self.request.query_params.get('low_stock') == 'true':
            queryset = queryset.filter(cantidad_actual__lte=F('cantidad_minima'))
        
        # Filtro para productos por vencer
        if self.request.query_params.get('expiring_soon') == 'true':
            fecha_limite = timezone.now().date() + timedelta(days=30)
            queryset = queryset.filter(fecha_vencimiento__lte=fecha_limite)
        
        # Filtro para productos vencidos
        if self.request.query_params.get('expired') == 'true':
            queryset = queryset.filter(fecha_vencimiento__lt=timezone.now().date())
        
        return queryset

    def perform_create(self, serializer):
        """Establecer el usuario que crea el inventario"""
        if self.request.user.is_authenticated:
            serializer.save(creado_por=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        """Establecer el usuario que actualiza el inventario"""
        if self.request.user.is_authenticated:
            serializer.save(actualizado_por=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas del inventario"""
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        total_productos = queryset.count()
        productos_disponibles = queryset.filter(estado='disponible').count()
        productos_agotados = queryset.filter(estado='agotado').count()
        productos_por_vencer = queryset.filter(estado='por_vencer').count()
        productos_vencidos = queryset.filter(estado='vencido').count()
        
        # Stock bajo
        stock_bajo = queryset.filter(cantidad_actual__lte=F('cantidad_minima')).count()
        
        # Valor total del inventario
        valor_total = queryset.aggregate(
            total=Sum(F('cantidad_actual') * F('precio_unitario'))
        )['total'] or 0
        
        # Distribución por categorías
        categorias_distribucion = {}
        for categoria, _ in Inventario.Categoria.choices:
            count = queryset.filter(categoria=categoria).count()
            categorias_distribucion[categoria] = count
        
        stats_data = {
            'total_productos': total_productos,
            'productos_disponibles': productos_disponibles,
            'productos_agotados': productos_agotados,
            'productos_por_vencer': productos_por_vencer,
            'productos_vencidos': productos_vencidos,
            'stock_bajo': stock_bajo,
            'valor_total_inventario': valor_total,
            'categorias_distribucion': categorias_distribucion
        }
        
        serializer = InventarioStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Actualizar el stock de un producto"""
        inventario = self.get_object()
        cantidad = request.data.get('cantidad')
        tipo = request.data.get('tipo', 'ajuste')  # 'ingreso', 'egreso', 'ajuste'
        notas = request.data.get('notas', '')
        
        if cantidad is None:
            return Response(
                {'error': 'La cantidad es requerida'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cantidad = float(cantidad)
        except (ValueError, TypeError):
            return Response(
                {'error': 'La cantidad debe ser un número válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar stock según el tipo
        if tipo == 'ingreso':
            inventario.cantidad_actual += cantidad
        elif tipo == 'egreso':
            inventario.cantidad_actual -= cantidad
            if inventario.cantidad_actual < 0:
                return Response(
                    {'error': 'No se puede tener stock negativo'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:  # ajuste
            inventario.cantidad_actual = cantidad
        
        # Actualizar fecha de último ingreso si es un ingreso
        if tipo == 'ingreso':
            inventario.fecha_ultimo_ingreso = timezone.now()
        
        # Actualizar estado según el stock
        if inventario.cantidad_actual <= 0:
            inventario.estado = Inventario.Estado.AGOTADO
        elif inventario.cantidad_actual <= inventario.cantidad_minima:
            inventario.estado = Inventario.Estado.POR_VENCER
        else:
            inventario.estado = Inventario.Estado.DISPONIBLE
        
        if request.user.is_authenticated:
            inventario.actualizado_por = request.user
        inventario.save()
        
        # Agregar notas si se proporcionan
        if notas:
            inventario.notas = f"{inventario.notas}\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {notas}" if inventario.notas else f"[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {notas}"
            inventario.save()
        
        serializer = self.get_serializer(inventario)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Obtener productos con stock bajo"""
        queryset = self.get_queryset().filter(
            cantidad_actual__lte=F('cantidad_minima')
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Obtener productos por vencer"""
        fecha_limite = timezone.now().date() + timedelta(days=30)
        queryset = self.get_queryset().filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gt=timezone.now().date()
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Obtener productos vencidos"""
        queryset = self.get_queryset().filter(
            fecha_vencimiento__lt=timezone.now().date()
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Obtener productos agrupados por categoría"""
        categoria = request.query_params.get('categoria')
        if not categoria:
            return Response(
                {'error': 'El parámetro categoria es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(categoria=categoria)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Búsqueda avanzada de productos"""
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'El parámetro de búsqueda es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            Q(codigo_producto__icontains=query) |
            Q(nombre_producto__icontains=query) |
            Q(descripcion__icontains=query) |
            Q(proveedor__icontains=query)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: En lugar de eliminar físicamente el producto del inventario,
        se cambia el campo 'activo' a False.
        """
        try:
            print("Desactivando producto de inventario con ID:", kwargs.get('pk'))
            instance = self.get_object()
            
            # Soft delete: cambiar activo a False
            instance.activo = False
            instance.save()
            
            print(f"Producto {instance.codigo_producto} desactivado correctamente")
            
            return Response(
                {"message": "Producto desactivado correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Error al desactivar producto:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )