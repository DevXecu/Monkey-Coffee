from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Max
from django.utils import timezone
import traceback
from .models import Proveedor, OrdenCompra, ItemOrdenCompra
from .serializer import (
    ProveedorSerializer,
    ProveedorListSerializer,
    OrdenCompraSerializer,
    OrdenCompraListSerializer,
    OrdenCompraCreateSerializer,
    ItemOrdenCompraSerializer,
    HistorialCompraSerializer
)


class ProveedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proveedores
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'categoria', 'tipo_proveedor', 'activo']
    search_fields = ['nombre', 'razon_social', 'rut', 'email', 'telefono', 'contacto_principal']
    ordering_fields = ['nombre', 'fecha_creacion', 'fecha_actualizacion']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """Obtener queryset de proveedores activos"""
        try:
            return Proveedor.objects.filter(activo=True).select_related('creado_por', 'actualizado_por')
        except Exception as e:
            # Si hay error al acceder a la tabla, retornar queryset vacío
            print(f"Error al obtener proveedores: {e}")
            traceback.print_exc()
            return Proveedor.objects.none()

    def get_serializer_class(self):
        """Retornar el serializer apropiado según la acción"""
        if self.action == 'list':
            return ProveedorListSerializer
        return ProveedorSerializer

    def list(self, request, *args, **kwargs):
        """Sobrescribir list para manejar errores"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error en list de proveedores: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Error al cargar los proveedores", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """Establecer el usuario que crea el proveedor"""
        if self.request.user.is_authenticated:
            serializer.save(creado_por=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        """Establecer el usuario que actualiza el proveedor"""
        if self.request.user.is_authenticated:
            serializer.save(actualizado_por=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def historial_compras(self, request, pk=None):
        """Obtener historial de compras de un proveedor"""
        proveedor = self.get_object()
        ordenes = proveedor.ordenes_compra.all().order_by('-fecha_orden')
        
        total_compras = sum(orden.total for orden in ordenes.filter(
            estado__in=['recibida', 'parcialmente_recibida', 'facturada']
        ))
        
        ultima_compra = ordenes.filter(
            estado__in=['recibida', 'parcialmente_recibida', 'facturada']
        ).first()
        
        historial_data = {
            'proveedor_id': proveedor.id,
            'proveedor_nombre': proveedor.nombre,
            'total_ordenes': ordenes.count(),
            'total_compras': total_compras,
            'ultima_compra': ultima_compra.fecha_creacion if ultima_compra else None,
            'ordenes': ordenes
        }
        
        serializer = HistorialCompraSerializer(historial_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Obtener solo proveedores activos"""
        queryset = self.get_queryset().filter(estado='activo', activo=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: cambiar activo a False"""
        try:
            instance = self.get_object()
            instance.activo = False
            instance.save()
            return Response(
                {"message": "Proveedor desactivado correctamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrdenCompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar órdenes de compra
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['proveedor', 'estado', 'moneda']
    search_fields = ['numero_orden', 'proveedor__nombre', 'numero_factura']
    ordering_fields = ['fecha_orden', 'fecha_creacion', 'total']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        """Retornar el serializer apropiado según la acción"""
        if self.action == 'create':
            return OrdenCompraCreateSerializer
        elif self.action == 'list':
            return OrdenCompraListSerializer
        return OrdenCompraSerializer

    def get_queryset(self):
        """Filtrar queryset según parámetros adicionales"""
        try:
            queryset = OrdenCompra.objects.all().select_related('proveedor', 'creado_por', 'aprobado_por').prefetch_related('items')
        except Exception as e:
            # Si hay error al acceder a la tabla, retornar queryset vacío
            print(f"Error al obtener órdenes de compra: {e}")
            traceback.print_exc()
            queryset = OrdenCompra.objects.none()
        
        # Filtro por proveedor
        proveedor_id = self.request.query_params.get('proveedor_id')
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)
        
        # Filtro por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            queryset = queryset.filter(fecha_orden__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_orden__lte=fecha_hasta)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Sobrescribir list para manejar errores"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error en list de órdenes de compra: {e}")
            traceback.print_exc()
            return Response(
                {"error": "Error al cargar las órdenes de compra", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """Establecer el usuario que crea la orden"""
        if self.request.user.is_authenticated:
            serializer.save(creado_por=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar una orden de compra"""
        orden = self.get_object()
        if orden.estado != OrdenCompra.Estado.BORRADOR:
            return Response(
                {'error': 'Solo se pueden aprobar órdenes en estado borrador'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orden.estado = OrdenCompra.Estado.PENDIENTE
        orden.fecha_aprobacion = timezone.now()
        if request.user.is_authenticated:
            orden.aprobado_por = request.user
        orden.save()
        
        serializer = self.get_serializer(orden)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def recibir(self, request, pk=None):
        """Marcar una orden como recibida"""
        orden = self.get_object()
        items_recibidos = request.data.get('items', [])
        
        # Actualizar cantidad recibida de cada item
        for item_data in items_recibidos:
            item_id = item_data.get('id')
            cantidad_recibida = item_data.get('cantidad_recibida', 0)
            
            try:
                item = orden.items.get(id=item_id)
                item.cantidad_recibida = cantidad_recibida
                item.save()
            except ItemOrdenCompra.DoesNotExist:
                continue
        
        # Actualizar estado de la orden
        total_recibido = sum(item.cantidad_recibida for item in orden.items.all())
        total_esperado = sum(item.cantidad for item in orden.items.all())
        
        if total_recibido == 0:
            return Response(
                {'error': 'No se puede marcar como recibida sin items recibidos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif total_recibido == total_esperado:
            orden.estado = OrdenCompra.Estado.RECIBIDA
            orden.fecha_entrega_real = timezone.now().date()
        else:
            orden.estado = OrdenCompra.Estado.PARCIALMENTE_RECIBIDA
            if not orden.fecha_entrega_real:
                orden.fecha_entrega_real = timezone.now().date()
        
        orden.save()
        
        serializer = self.get_serializer(orden)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def agregar_item(self, request, pk=None):
        """Agregar un item a una orden existente"""
        orden = self.get_object()
        item_data = request.data
        
        item = ItemOrdenCompra.objects.create(orden_compra=orden, **item_data)
        orden.calcular_total()
        
        serializer = ItemOrdenCompraSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def eliminar_item(self, request, pk=None):
        """Eliminar un item de una orden"""
        orden = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            item = orden.items.get(id=item_id)
            item.delete()
            orden.calcular_total()
            return Response(
                {"message": "Item eliminado correctamente"},
                status=status.HTTP_200_OK
            )
        except ItemOrdenCompra.DoesNotExist:
            return Response(
                {"error": "Item no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def por_proveedor(self, request):
        """Obtener órdenes agrupadas por proveedor"""
        proveedor_id = request.query_params.get('proveedor_id')
        if not proveedor_id:
            return Response(
                {'error': 'El parámetro proveedor_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(proveedor_id=proveedor_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas de órdenes de compra"""
        queryset = self.get_queryset()
        
        total_ordenes = queryset.count()
        ordenes_pendientes = queryset.filter(estado='pendiente').count()
        ordenes_enviadas = queryset.filter(estado='enviada').count()
        ordenes_recibidas = queryset.filter(estado='recibida').count()
        ordenes_canceladas = queryset.filter(estado='cancelada').count()
        
        total_compras = queryset.filter(
            estado__in=['recibida', 'parcialmente_recibida', 'facturada']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            'total_ordenes': total_ordenes,
            'ordenes_pendientes': ordenes_pendientes,
            'ordenes_enviadas': ordenes_enviadas,
            'ordenes_recibidas': ordenes_recibidas,
            'ordenes_canceladas': ordenes_canceladas,
            'total_compras': total_compras,
        })
