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
    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=100)  # Corresponde a 'nombres' en BD
    apellido = models.CharField(max_length=100)  # Corresponde a 'apellidos' en BD
    correo = models.EmailField(max_length=100, blank=True, null=True)  # Corresponde a 'email' en BD
    celular = models.CharField(max_length=15, blank=True, null=True)  # Corresponde a 'telefono' en BD
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    
    # Información laboral
    cargo = models.CharField(max_length=100, choices=CARGO_CHOICES)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    fecha_contratacion = models.DateField(blank=True, null=True)
    fecha_termino = models.DateField(blank=True, null=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tipo_contrato = models.CharField(max_length=20, choices=TIPO_CONTRATO_CHOICES, default='indefinido')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    
    # Seguridad
    password = models.CharField(max_length=255)
    
    # Archivos y datos biométricos
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)
    huella_digital = models.BinaryField(blank=True, null=True)
    
    # Otros
    observaciones = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cargo}"
