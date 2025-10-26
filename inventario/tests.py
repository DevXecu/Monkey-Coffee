from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Inventario


class InventarioModelTest(TestCase):
    """Pruebas para el modelo Inventario"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.inventario = Inventario.objects.create(
            codigo_producto='TEST-001',
            nombre_producto='Café Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=10.00,
            cantidad_minima=5.00,
            precio_unitario=15.50,
            estado=Inventario.Estado.DISPONIBLE,
            creado_por=self.user
        )
    
    def test_inventario_creation(self):
        """Probar creación de inventario"""
        self.assertEqual(self.inventario.codigo_producto, 'TEST-001')
        self.assertEqual(self.inventario.nombre_producto, 'Café Test')
        self.assertEqual(self.inventario.categoria, 'cafe')
        self.assertEqual(self.inventario.estado, 'disponible')
        self.assertTrue(self.inventario.activo)
    
    def test_inventario_str_representation(self):
        """Probar representación string del modelo"""
        expected = "Café Test (TEST-001)"
        self.assertEqual(str(self.inventario), expected)
    
    def test_inventario_default_values(self):
        """Probar valores por defecto"""
        self.assertEqual(self.inventario.cantidad_actual, 10.00)
        self.assertEqual(self.inventario.estado, 'disponible')
        self.assertTrue(self.inventario.activo)
        self.assertFalse(self.inventario.requiere_alerta)
    
    def test_inventario_choices(self):
        """Probar opciones de categorías, unidades y estados"""
        # Categorías
        self.assertIn('cafe', [choice[0] for choice in Inventario.Categoria.choices])
        self.assertIn('insumos', [choice[0] for choice in Inventario.Categoria.choices])
        
        # Unidades de medida
        self.assertIn('kilogramo', [choice[0] for choice in Inventario.UnidadMedida.choices])
        self.assertIn('litro', [choice[0] for choice in Inventario.UnidadMedida.choices])
        
        # Estados
        self.assertIn('disponible', [choice[0] for choice in Inventario.Estado.choices])
        self.assertIn('agotado', [choice[0] for choice in Inventario.Estado.choices])


class InventarioAPITest(APITestCase):
    """Pruebas para la API de Inventario"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=self.user)
        
        self.inventario_data = {
            'codigo_producto': 'API-TEST-001',
            'nombre_producto': 'Producto API Test',
            'categoria': 'cafe',
            'unidad_medida': 'kilogramo',
            'cantidad_actual': 20.00,
            'cantidad_minima': 10.00,
            'precio_unitario': 25.00,
            'estado': 'disponible'
        }
    
    def test_create_inventario(self):
        """Probar creación de inventario via API"""
        url = reverse('inventario-list')
        response = self.client.post(url, self.inventario_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inventario.objects.count(), 1)
        
        inventario = Inventario.objects.get()
        self.assertEqual(inventario.codigo_producto, 'API-TEST-001')
        self.assertEqual(inventario.creado_por, self.user)
    
    def test_list_inventario(self):
        """Probar listado de inventarios via API"""
        # Crear inventario de prueba
        Inventario.objects.create(
            codigo_producto='LIST-TEST-001',
            nombre_producto='Producto Lista Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=15.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['codigo_producto'], 'LIST-TEST-001')
    
    def test_get_inventario_detail(self):
        """Probar obtención de detalle de inventario"""
        inventario = Inventario.objects.create(
            codigo_producto='DETAIL-TEST-001',
            nombre_producto='Producto Detalle Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=30.00,
            cantidad_minima=10.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-detail', kwargs={'pk': inventario.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['codigo_producto'], 'DETAIL-TEST-001')
    
    def test_update_inventario(self):
        """Probar actualización de inventario"""
        inventario = Inventario.objects.create(
            codigo_producto='UPDATE-TEST-001',
            nombre_producto='Producto Update Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=25.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-detail', kwargs={'pk': inventario.pk})
        update_data = {
            'codigo_producto': 'UPDATE-TEST-001',
            'nombre_producto': 'Producto Actualizado',
            'categoria': 'cafe',
            'unidad_medida': 'kilogramo',
            'cantidad_actual': 30.00,
            'cantidad_minima': 5.00,
            'estado': 'disponible'
        }
        
        response = self.client.put(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inventario.refresh_from_db()
        self.assertEqual(inventario.nombre_producto, 'Producto Actualizado')
        self.assertEqual(inventario.actualizado_por, self.user)
    
    def test_delete_inventario(self):
        """Probar eliminación de inventario"""
        inventario = Inventario.objects.create(
            codigo_producto='DELETE-TEST-001',
            nombre_producto='Producto Delete Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=20.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-detail', kwargs={'pk': inventario.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Inventario.objects.count(), 0)
    
    def test_inventario_stats(self):
        """Probar endpoint de estadísticas"""
        # Crear inventarios de prueba
        Inventario.objects.create(
            codigo_producto='STATS-001',
            nombre_producto='Producto Stats 1',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=10.00,
            cantidad_minima=5.00,
            estado=Inventario.Estado.DISPONIBLE,
            creado_por=self.user
        )
        
        Inventario.objects.create(
            codigo_producto='STATS-002',
            nombre_producto='Producto Stats 2',
            categoria=Inventario.Categoria.INSUMOS,
            unidad_medida=Inventario.UnidadMedida.UNIDAD,
            cantidad_actual=0.00,
            cantidad_minima=5.00,
            estado=Inventario.Estado.AGOTADO,
            creado_por=self.user
        )
        
        url = reverse('inventario-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_productos'], 2)
        self.assertEqual(response.data['productos_disponibles'], 1)
        self.assertEqual(response.data['productos_agotados'], 1)
    
    def test_update_stock(self):
        """Probar actualización de stock"""
        inventario = Inventario.objects.create(
            codigo_producto='STOCK-TEST-001',
            nombre_producto='Producto Stock Test',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=10.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-update-stock', kwargs={'pk': inventario.pk})
        stock_data = {
            'cantidad': 5.00,
            'tipo': 'ingreso',
            'notas': 'Ingreso de stock'
        }
        
        response = self.client.post(url, stock_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inventario.refresh_from_db()
        self.assertEqual(inventario.cantidad_actual, 15.00)
    
    def test_low_stock_filter(self):
        """Probar filtro de stock bajo"""
        # Crear inventario con stock bajo
        Inventario.objects.create(
            codigo_producto='LOW-STOCK-001',
            nombre_producto='Producto Stock Bajo',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=2.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-low-stock')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_search_inventario(self):
        """Probar búsqueda de inventarios"""
        Inventario.objects.create(
            codigo_producto='SEARCH-001',
            nombre_producto='Café Especial',
            categoria=Inventario.Categoria.CAFE,
            unidad_medida=Inventario.UnidadMedida.KILOGRAMO,
            cantidad_actual=10.00,
            cantidad_minima=5.00,
            creado_por=self.user
        )
        
        url = reverse('inventario-search')
        response = self.client.get(url, {'q': 'Café'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre_producto'], 'Café Especial')
    
    def test_unauthorized_access(self):
        """Probar acceso no autorizado"""
        self.client.logout()
        
        url = reverse('inventario-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)