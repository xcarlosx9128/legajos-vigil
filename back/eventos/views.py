from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Evento, RegistroEvento
from .serializers import EventoSerializer, RegistroEventoSerializer


class EventoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API para consultar el catálogo de eventos
    """
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]


class RegistroEventoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API para consultar el historial de eventos
    Solo lectura - los registros se crean desde las vistas de negocio
    """
    queryset = RegistroEvento.objects.all().select_related(
        'usuario_ejecutor', 
        'usuario_afectado', 
        'evento'
    )
    serializer_class = RegistroEventoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por usuario ejecutor
        usuario_ejecutor = self.request.query_params.get('usuario_ejecutor')
        if usuario_ejecutor:
            queryset = queryset.filter(usuario_ejecutor_id=usuario_ejecutor)
        
        # Filtrar por evento
        evento = self.request.query_params.get('evento')
        if evento:
            queryset = queryset.filter(evento_id=evento)
        
        # Filtrar por fecha
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            queryset = queryset.filter(fecha_hora__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_hora__lte=fecha_hasta)
        
        return queryset