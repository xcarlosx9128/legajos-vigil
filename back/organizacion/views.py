from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Area, Regimen, CondicionLaboral
from .serializers import (
    AreaSerializer, AreaListSerializer,
    RegimenSerializer, RegimenListSerializer,
    CondicionLaboralSerializer, CondicionLaboralListSerializer
)
from usuarios.permissions import IsAdmin

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AreaSerializer  # ← USAR SIEMPRE AreaSerializer (con descripción)
    
    # ELIMINAMOS el método get_serializer_class para que use AreaSerializer siempre
    # def get_serializer_class(self):
    #     if self.action == 'list':
    #         return AreaListSerializer  # ← Esto NO tiene descripción
    #     return AreaSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Area.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        search = self.request.query_params.get('search', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        if search:
            queryset = queryset.filter(nombre__icontains=search) | queryset.filter(codigo__icontains=search)
        
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar área"""
        area = self.get_object()
        area.activo = not area.activo
        area.save()
        serializer = self.get_serializer(area)
        return Response(serializer.data)

class RegimenViewSet(viewsets.ModelViewSet):
    queryset = Regimen.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RegimenListSerializer
        return RegimenSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Regimen.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        tipo = self.request.query_params.get('tipo', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar régimen"""
        regimen = self.get_object()
        regimen.activo = not regimen.activo
        regimen.save()
        serializer = self.get_serializer(regimen)
        return Response(serializer.data)

class CondicionLaboralViewSet(viewsets.ModelViewSet):
    queryset = CondicionLaboral.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CondicionLaboralListSerializer
        return CondicionLaboralSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = CondicionLaboral.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        tipo = self.request.query_params.get('tipo', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar condición laboral"""
        condicion = self.get_object()
        condicion.activo = not condicion.activo
        condicion.save()
        serializer = self.get_serializer(condicion)
        return Response(serializer.data)