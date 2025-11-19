from django.db import models
from empleado.models import Empleado


class ConfiguracionApp(models.Model):
    TIPO_CHOICES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ]
    
    clave = models.CharField(max_length=100, unique=True, db_column='clave')
    valor = models.TextField(db_column='valor')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='string', db_column='tipo')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    categoria = models.CharField(max_length=50, blank=True, null=True, db_column='categoria')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    
    class Meta:
        db_table = 'configuracion_app'
        indexes = [
            models.Index(fields=['categoria']),
        ]
    
    def __str__(self):
        return f"{self.clave} = {self.valor}"


class Reportes(models.Model):
    TIPO_REPORTE_CHOICES = [
        ('asistencia', 'Asistencia'),
        ('inventario', 'Inventario'),
        ('personal', 'Personal'),
        ('financiero', 'Financiero'),
        ('personalizado', 'Personalizado'),
    ]
    
    FORMATO_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    nombre_reporte = models.CharField(max_length=200, db_column='nombre_reporte')
    tipo_reporte = models.CharField(max_length=20, choices=TIPO_REPORTE_CHOICES, db_column='tipo_reporte')
    periodo_inicio = models.DateField(blank=True, null=True, db_column='periodo_inicio')
    periodo_fin = models.DateField(blank=True, null=True, db_column='periodo_fin')
    parametros = models.JSONField(blank=True, null=True, db_column='parametros')
    archivo_generado = models.CharField(max_length=255, blank=True, null=True, db_column='archivo_generado')
    formato = models.CharField(max_length=10, choices=FORMATO_CHOICES, default='pdf', db_column='formato')
    generado_por = models.ForeignKey(Empleado, on_delete=models.SET_NULL, blank=True, null=True, db_column='generado_por', related_name='reportes_generados')
    fecha_generacion = models.DateTimeField(auto_now_add=True, db_column='fecha_generacion')
    tiempo_generacion = models.IntegerField(blank=True, null=True, db_column='tiempo_generacion')
    
    class Meta:
        db_table = 'reportes'
        indexes = [
            models.Index(fields=['tipo_reporte']),
            models.Index(fields=['fecha_generacion']),
            models.Index(fields=['generado_por']),
        ]
    
    def __str__(self):
        return f"{self.nombre_reporte} - {self.tipo_reporte}"


class LogsActividad(models.Model):
    empleado_id = models.ForeignKey(Empleado, on_delete=models.SET_NULL, blank=True, null=True, db_column='empleado_id', related_name='logs_actividad')
    modulo = models.CharField(max_length=50, db_column='modulo')
    accion = models.CharField(max_length=100, db_column='accion')
    tabla_afectada = models.CharField(max_length=100, blank=True, null=True, db_column='tabla_afectada')
    registro_id = models.IntegerField(blank=True, null=True, db_column='registro_id')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    datos_anteriores = models.JSONField(blank=True, null=True, db_column='datos_anteriores')
    datos_nuevos = models.JSONField(blank=True, null=True, db_column='datos_nuevos')
    ip_address = models.CharField(max_length=45, blank=True, null=True, db_column='ip_address')
    user_agent = models.TextField(blank=True, null=True, db_column='user_agent')
    fecha_registro = models.DateTimeField(auto_now_add=True, db_column='fecha_registro')
    
    class Meta:
        db_table = 'logs_actividad'
        indexes = [
            models.Index(fields=['empleado_id']),
            models.Index(fields=['modulo']),
            models.Index(fields=['fecha_registro']),
            models.Index(fields=['tabla_afectada', 'registro_id']),
        ]
    
    def __str__(self):
        return f"{self.modulo} - {self.accion} - {self.fecha_registro}"
