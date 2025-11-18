from django.db import models

class Asistencia(models.Model):
    TIPO_ENTRADA_CHOICES = [
        ('biometrico', 'Biométrico'),
        ('manual', 'Manual'),
        ('app_movil', 'App Móvil'),
    ]
    
    ESTADO_CHOICES = [
        ('presente', 'Presente'),
        ('tarde', 'Tarde'),
        ('ausente', 'Ausente'),
        ('justificado', 'Justificado'),
        ('permiso', 'Permiso'),
    ]

    empleado_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleado_rut', related_name='asistencias')
    fecha = models.DateField(db_column='fecha')
    hora_entrada = models.DateTimeField(blank=True, null=True, db_column='hora_entrada')
    hora_salida = models.DateTimeField(blank=True, null=True, db_column='hora_salida')
    tipo_entrada = models.CharField(max_length=20, choices=TIPO_ENTRADA_CHOICES, default='biometrico', db_column='tipo_entrada')
    tipo_salida = models.CharField(max_length=20, choices=TIPO_ENTRADA_CHOICES, default='biometrico', db_column='tipo_salida')
    minutos_tarde = models.IntegerField(default=0, db_column='minutos_tarde')
    minutos_extras = models.IntegerField(default=0, db_column='minutos_extras')
    horas_trabajadas = models.IntegerField(blank=True, null=True, db_column='horas_trabajadas')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='presente', db_column='estado')
    observaciones = models.TextField(blank=True, null=True, db_column='observaciones')
    ubicacion_entrada = models.CharField(max_length=255, blank=True, null=True, db_column='ubicacion_entrada')
    ubicacion_salida = models.CharField(max_length=255, blank=True, null=True, db_column='ubicacion_salida')
    ip_entrada = models.CharField(max_length=45, blank=True, null=True, db_column='ip_entrada')
    ip_salida = models.CharField(max_length=45, blank=True, null=True, db_column='ip_salida')
    validado_por = models.ForeignKey('Empleado', on_delete=models.SET_NULL, blank=True, null=True, db_column='validado_por', related_name='asistencias_validadas')
    fecha_validacion = models.DateTimeField(blank=True, null=True, db_column='fecha_validacion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    
    class Meta:
        db_table = 'asistencias'
        unique_together = [['empleado_rut', 'fecha']]
        indexes = [
            models.Index(fields=['empleado_rut', 'fecha']),
            models.Index(fields=['fecha']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        rut_display = self.empleado_rut.rut if self.empleado_rut else 'N/A'
        return f"{rut_display} - {self.fecha} - {self.estado}"

class Empleado(models.Model):
    TIPO_CONTRATO_CHOICES = [
        ('indefinido', 'Indefinido'),
        ('plazo_fijo', 'Plazo Fijo'),
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
    ]
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('vacaciones', 'Vacaciones'),
        ('licencia', 'Licencia'),
        ('desvinculado', 'Desvinculado'),
    ]

    # Campos básicos
    rut = models.CharField(max_length=12, unique=True, db_column='rut')
    nombre = models.CharField(max_length=100, db_column='nombres')
    apellido = models.CharField(max_length=100, db_column='apellidos')
    correo = models.EmailField(max_length=100, blank=True, null=True, db_column='email')
    celular = models.CharField(max_length=15, blank=True, null=True, db_column='telefono')
    fecha_nacimiento = models.DateField(blank=True, null=True, db_column='fecha_nacimiento')
    direccion = models.TextField(blank=True, null=True, db_column='direccion')
    
    # Información laboral
    cargo = models.CharField(max_length=100, db_column='cargo')
    departamento = models.CharField(max_length=100, blank=True, null=True, db_column='departamento')
    fecha_contratacion = models.DateField(db_column='fecha_contratacion')
    fecha_termino = models.DateField(blank=True, null=True, db_column='fecha_termino')
    salario = models.IntegerField(blank=True, null=True, db_column='salario')
    tipo_contrato = models.CharField(max_length=20, choices=TIPO_CONTRATO_CHOICES, default='indefinido', db_column='tipo_contrato')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo', db_column='estado')
    
    # Seguridad
    password = models.CharField(max_length=255, blank=True, null=True, db_column='password')
    
    # Archivos y datos biométricos
    foto_perfil = models.CharField(max_length=255, blank=True, null=True, db_column='foto_perfil')
    huella_digital = models.BinaryField(blank=True, null=True, db_column='huella_digital')
    
    # Otros
    observaciones = models.TextField(blank=True, null=True, db_column='observaciones')
    activo = models.BooleanField(default=True, db_column='activo')
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    
    class Meta:
        db_table = 'empleados'

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cargo}"


class Turno(models.Model):
    empleados_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleados_rut', related_name='turnos')
    nombre_turno = models.CharField(max_length=100, db_column='nombre_turno')
    hora_entrada = models.TimeField(db_column='hora_entrada')
    hora_salida = models.TimeField(db_column='hora_salida')
    tolerancia_minutos = models.IntegerField(default=15, db_column='tolerancia_minutos')
    horas_trabajo = models.IntegerField(db_column='horas_trabajo')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    dias_semana = models.JSONField(blank=True, null=True, db_column='dias_semana')
    activo = models.BooleanField(default=True, db_column='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    
    class Meta:
        db_table = 'turnos'
        indexes = [
            models.Index(fields=['empleados_rut']),
            models.Index(fields=['nombre_turno']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        rut_display = self.empleados_rut.rut if self.empleados_rut else 'N/A'
        return f"{self.nombre_turno} - {rut_display}"
