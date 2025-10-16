from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Area, Regimen, CondicionLaboral, Cargo
from .serializers import (
    AreaSerializer,
    RegimenSerializer,
    CondicionLaboralSerializer,
    CargoSerializer
)
from usuarios.permissions import IsAdmin

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AreaSerializer
    
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
    serializer_class = RegimenSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Regimen.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
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
    serializer_class = CondicionLaboralSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = CondicionLaboral.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar condición laboral"""
        condicion = self.get_object()
        condicion.activo = not condicion.activo
        condicion.save()
        serializer = self.get_serializer(condicion)
        return Response(serializer.data)

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = CargoSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Cargo.objects.all()
        
        # Filtros
        activo = self.request.query_params.get('activo', None)
        search = self.request.query_params.get('search', None)
        
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('nombre')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar cargo"""
        cargo = self.get_object()
        cargo.activo = not cargo.activo
        cargo.save()
        serializer = self.get_serializer(cargo)
        return Response(serializer.data)