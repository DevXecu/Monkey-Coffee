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
    horas_trabajadas = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True, db_column='horas_trabajadas')
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
    horas_trabajo = models.DecimalField(max_digits=4, decimal_places=2, db_column='horas_trabajo')
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


class EmpleadosTurnos(models.Model):
    empleados_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleados_rut', related_name='empleados_turnos')
    turno_id = models.ForeignKey('Turno', on_delete=models.CASCADE, db_column='turno_id', related_name='empleados_asignados')
    fecha_inicio = models.DateField(db_column='fecha_inicio')
    fecha_fin = models.DateField(blank=True, null=True, db_column='fecha_fin')
    activo = models.BooleanField(default=True, db_column='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    
    class Meta:
        db_table = 'empleados_turnos'
        indexes = [
            models.Index(fields=['empleados_rut']),
            models.Index(fields=['turno_id']),
            models.Index(fields=['activo']),
            models.Index(fields=['fecha_inicio']),
        ]
    
    def __str__(self):
        return f"{self.empleados_rut.rut} - Turno {self.turno_id.id}"


class Horarios(models.Model):
    empleado_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleado_rut', related_name='horarios')
    turno_id = models.ForeignKey('Turno', on_delete=models.RESTRICT, db_column='turno_id', related_name='horarios_asignados')
    fecha_inicio = models.DateField(db_column='fecha_inicio')
    fecha_fin = models.DateField(blank=True, null=True, db_column='fecha_fin')
    dias_semana = models.JSONField(blank=True, null=True, db_column='dias_semana')
    observaciones = models.TextField(blank=True, null=True, db_column='observaciones')
    activo = models.BooleanField(default=True, db_column='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    
    class Meta:
        db_table = 'horarios'
        indexes = [
            models.Index(fields=['turno_id']),
            models.Index(fields=['fecha_inicio']),
            models.Index(fields=['empleado_rut']),
        ]
    
    def __str__(self):
        return f"{self.empleado_rut.rut} - {self.turno_id.nombre_turno}"


class TiposSolicitudes(models.Model):
    nombre = models.CharField(max_length=100, db_column='nombre')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    requiere_aprobacion = models.BooleanField(default=True, db_column='requiere_aprobacion')
    dias_anticipacion = models.IntegerField(default=1, db_column='dias_anticipacion')
    color_hex = models.CharField(max_length=7, default='#007bff', db_column='color_hex')
    activo = models.BooleanField(default=True, db_column='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    
    class Meta:
        db_table = 'tipos_solicitudes'
        indexes = [
            models.Index(fields=['nombre']),
        ]
    
    def __str__(self):
        return self.nombre


class Solicitudes(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('cancelada', 'Cancelada'),
    ]
    
    empleado_rut = models.CharField(max_length=12, blank=True, null=True, db_column='empleado_rut')
    empleado_id = models.ForeignKey('Empleado', on_delete=models.CASCADE, db_column='empleado_id', related_name='solicitudes')
    tipo_solicitud_id = models.ForeignKey('TiposSolicitudes', on_delete=models.RESTRICT, db_column='tipo_solicitud_id', related_name='solicitudes')
    fecha_inicio = models.DateField(db_column='fecha_inicio')
    fecha_fin = models.DateField(db_column='fecha_fin')
    motivo = models.TextField(db_column='motivo')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', db_column='estado')
    aprobado_por = models.ForeignKey('Empleado', on_delete=models.SET_NULL, blank=True, null=True, db_column='aprobado_por', related_name='solicitudes_aprobadas')
    fecha_aprobacion = models.DateTimeField(blank=True, null=True, db_column='fecha_aprobacion')
    comentario_aprobacion = models.TextField(blank=True, null=True, db_column='comentario_aprobacion')
    documento_adjunto = models.CharField(max_length=255, blank=True, null=True, db_column='documento_adjunto')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    
    class Meta:
        db_table = 'solicitudes'
        indexes = [
            models.Index(fields=['empleado_id']),
            models.Index(fields=['tipo_solicitud_id']),
            models.Index(fields=['estado']),
            models.Index(fields=['fecha_inicio', 'fecha_fin']),
        ]
    
    def __str__(self):
        return f"{self.empleado_id.rut} - {self.tipo_solicitud_id.nombre} - {self.estado}"


class Notificaciones(models.Model):
    TIPO_CHOICES = [
        ('info', 'Información'),
        ('alerta', 'Alerta'),
        ('urgente', 'Urgente'),
        ('recordatorio', 'Recordatorio'),
        ('aprobacion', 'Aprobación'),
    ]
    
    empleado_id = models.ForeignKey('Empleado', on_delete=models.CASCADE, db_column='empleado_id', related_name='notificaciones')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, db_column='tipo')
    titulo = models.CharField(max_length=200, db_column='titulo')
    mensaje = models.TextField(db_column='mensaje')
    modulo = models.CharField(max_length=50, blank=True, null=True, db_column='modulo')
    referencia_id = models.IntegerField(blank=True, null=True, db_column='referencia_id')
    leida = models.BooleanField(default=False, db_column='leida')
    fecha_lectura = models.DateTimeField(blank=True, null=True, db_column='fecha_lectura')
    requiere_accion = models.BooleanField(default=False, db_column='requiere_accion')
    url_accion = models.CharField(max_length=255, blank=True, null=True, db_column='url_accion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_expiracion = models.DateTimeField(blank=True, null=True, db_column='fecha_expiracion')
    
    class Meta:
        db_table = 'notificaciones'
        indexes = [
            models.Index(fields=['empleado_id']),
            models.Index(fields=['leida']),
            models.Index(fields=['tipo']),
            models.Index(fields=['fecha_creacion']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.empleado_id.rut}"


class Tareas(models.Model):
    TIPO_TAREA_CHOICES = [
        ('general', 'General'),
        ('inventario', 'Inventario'),
        ('mantenimiento', 'Mantenimiento'),
        ('limpieza', 'Limpieza'),
        ('atencion_cliente', 'Atención Cliente'),
        ('administrativa', 'Administrativa'),
        ('urgente', 'Urgente'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En Proceso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
        ('pausada', 'Pausada'),
    ]
    
    FRECUENCIA_CHOICES = [
        ('diaria', 'Diaria'),
        ('semanal', 'Semanal'),
        ('mensual', 'Mensual'),
        ('anual', 'Anual'),
    ]
    
    titulo = models.CharField(max_length=200, db_column='titulo')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    tipo_tarea = models.CharField(max_length=20, choices=TIPO_TAREA_CHOICES, default='general', db_column='tipo_tarea')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media', db_column='prioridad')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente', db_column='estado')
    asignada_a_rut = models.ForeignKey('Empleado', on_delete=models.SET_NULL, blank=True, null=True, to_field='rut', db_column='asignada_a_rut', related_name='tareas_asignadas')
    creada_por_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='creada_por_rut', related_name='tareas_creadas')
    fecha_inicio = models.DateTimeField(blank=True, null=True, db_column='fecha_inicio')
    fecha_vencimiento = models.DateTimeField(blank=True, null=True, db_column='fecha_vencimiento')
    fecha_completada = models.DateTimeField(blank=True, null=True, db_column='fecha_completada')
    es_recurrente = models.BooleanField(default=False, db_column='es_recurrente')
    frecuencia_recurrencia = models.CharField(max_length=20, choices=FRECUENCIA_CHOICES, blank=True, null=True, db_column='frecuencia_recurrencia')
    dias_recurrencia = models.JSONField(blank=True, null=True, db_column='dias_recurrencia')
    ubicacion = models.CharField(max_length=100, blank=True, null=True, db_column='ubicacion')
    modulo_relacionado = models.CharField(max_length=50, blank=True, null=True, db_column='modulo_relacionado')
    registro_relacionado_id = models.IntegerField(blank=True, null=True, db_column='registro_relacionado_id')
    tiempo_estimado_minutos = models.IntegerField(blank=True, null=True, db_column='tiempo_estimado_minutos')
    tiempo_real_minutos = models.IntegerField(blank=True, null=True, db_column='tiempo_real_minutos')
    porcentaje_completado = models.IntegerField(default=0, db_column='porcentaje_completado')
    notas = models.TextField(blank=True, null=True, db_column='notas')
    archivo_adjunto = models.CharField(max_length=255, blank=True, null=True, db_column='archivo_adjunto')
    requiere_aprobacion = models.BooleanField(default=False, db_column='requiere_aprobacion')
    aprobada_por_rut = models.ForeignKey('Empleado', on_delete=models.SET_NULL, blank=True, null=True, to_field='rut', db_column='aprobada_por_rut', related_name='tareas_aprobadas')
    fecha_aprobacion = models.DateTimeField(blank=True, null=True, db_column='fecha_aprobacion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, db_column='fecha_actualizacion')
    activo = models.BooleanField(default=True, db_column='activo')
    
    class Meta:
        db_table = 'tareas'
        indexes = [
            models.Index(fields=['asignada_a_rut']),
            models.Index(fields=['creada_por_rut']),
            models.Index(fields=['aprobada_por_rut']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.estado}"


class TareasComentarios(models.Model):
    tarea_id = models.ForeignKey('Tareas', on_delete=models.CASCADE, db_column='tarea_id', related_name='comentarios')
    empleado_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleado_rut', related_name='comentarios_tareas')
    comentario = models.TextField(db_column='comentario')
    archivo_adjunto = models.CharField(max_length=255, blank=True, null=True, db_column='archivo_adjunto')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    
    class Meta:
        db_table = 'tareas_comentarios'
        indexes = [
            models.Index(fields=['tarea_id']),
            models.Index(fields=['empleado_rut']),
        ]
    
    def __str__(self):
        return f"Comentario en {self.tarea_id.titulo}"


class TareasHistorial(models.Model):
    tarea_id = models.ForeignKey('Tareas', on_delete=models.CASCADE, db_column='tarea_id', related_name='historial')
    empleado_rut = models.ForeignKey('Empleado', on_delete=models.CASCADE, to_field='rut', db_column='empleado_rut', related_name='historial_tareas')
    accion = models.CharField(max_length=100, db_column='accion')
    campo_modificado = models.CharField(max_length=50, blank=True, null=True, db_column='campo_modificado')
    valor_anterior = models.TextField(blank=True, null=True, db_column='valor_anterior')
    valor_nuevo = models.TextField(blank=True, null=True, db_column='valor_nuevo')
    descripcion = models.TextField(blank=True, null=True, db_column='descripcion')
    fecha_registro = models.DateTimeField(auto_now_add=True, db_column='fecha_registro')
    
    class Meta:
        db_table = 'tareas_historial'
        indexes = [
            models.Index(fields=['tarea_id']),
            models.Index(fields=['empleado_rut']),
        ]
    
    def __str__(self):
        return f"{self.accion} - {self.tarea_id.titulo}"
