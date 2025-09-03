from rest_framework import viewsets
from .serializer import EmpleadoSerializer
from .models import Empleado

# Create your views here.
class EmpleadoView(viewsets.ModelViewSet):
    serializer_class = EmpleadoSerializer
    queryset = Empleado.objects.all()
