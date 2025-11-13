from django.db import models

class Empleado(models.Model):
    CARGO_CHOICES = [
        ('Gerente', 'Gerente'),
        ('Administrador', 'Administrador'),
        ('Trabajador', 'Trabajador'),
    ]
    
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
    cargo = models.CharField(max_length=100, choices=CARGO_CHOICES, db_column='cargo')
    departamento = models.CharField(max_length=100, blank=True, null=True, db_column='departamento')
    fecha_contratacion = models.DateField(db_column='fecha_contratacion')
    fecha_termino = models.DateField(blank=True, null=True, db_column='fecha_termino')
    salario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='salario')
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
