# tickets/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Ticket.objects.select_related('area', 'creado_por')
        
        # Filtros opcionales
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        return queryset.order_by('-fecha_creacion')
    
    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def completar(self, request, pk=None):
        """Marcar ticket como completado"""
        ticket = self.get_object()
        
        ticket.estado = 'COMPLETADO'
        ticket.fecha_resolucion = timezone.now()
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def estadisticas(self, request):
        """Obtener estadísticas de tickets"""
        tickets = Ticket.objects.all()
        
        stats = {
            'total': tickets.count(),
            'pendientes': tickets.filter(estado='PENDIENTE').count(),
            'completados': tickets.filter(estado='COMPLETADO').count(),
        }
        
        return Response(stats)