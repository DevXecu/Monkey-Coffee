from django.db import models

class Empleado(models.Model):
    CARGO_CHOICES = [
        ('Gerente', 'Gerente'),
        ('Administrador', 'Administrador'),
        ('Trabajador', 'Trabajador'),
    ]

    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    cargo = models.CharField(max_length=20, choices=CARGO_CHOICES)
    correo = models.EmailField(max_length=100, blank=True, null=True)
    celular = models.CharField(max_length=20, blank=True, null=True)
    password = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cargo}"
