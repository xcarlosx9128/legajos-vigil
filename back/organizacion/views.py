# organizacion/views.py - VERSIÓN SIMPLIFICADA

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Area, Regimen, CondicionLaboral, Cargo, TipoDocumento
from .serializers import (
    AreaSerializer,
    RegimenSerializer,
    CondicionLaboralSerializer,
    CargoSerializer,
    TipoDocumentoSerializer,
    TipoDocumentoListSerializer
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


# ============================================
# NUEVO VIEWSET: TIPO DE DOCUMENTO
# ============================================

class TipoDocumentoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los 9 tipos de documentos del SIGELP.
    
    Endpoints disponibles:
    - GET /api/tipos-documento/ - Listar todos los tipos
    - GET /api/tipos-documento/{id}/ - Detalle de un tipo
    - GET /api/tipos-documento/activos/ - Solo tipos activos
    - POST /api/tipos-documento/ - Crear nuevo tipo (requiere admin)
    - PUT /api/tipos-documento/{id}/ - Actualizar tipo (requiere admin)
    - DELETE /api/tipos-documento/{id}/ - Eliminar tipo (requiere admin)
    """
    queryset = TipoDocumento.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = TipoDocumentoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['numero', 'nombre']
    ordering = ['numero']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TipoDocumentoListSerializer
        return TipoDocumentoSerializer
    
    def get_queryset(self):
        queryset = TipoDocumento.objects.all()
        
        # Filtrar solo activos
        activos = self.request.query_params.get('activos', None)
        if activos == 'true':
            queryset = queryset.filter(activo=True)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('numero')
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los tipos de documentos activos.
        GET /api/tipos-documento/activos/
        """
        tipos = TipoDocumento.objects.filter(activo=True)
        serializer = TipoDocumentoListSerializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar tipo de documento"""
        tipo = self.get_object()
        tipo.activo = not tipo.activo
        tipo.save()
        serializer = self.get_serializer(tipo)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """
        Devuelve estadísticas de uso de un tipo de documento.
        GET /api/tipos-documento/{id}/estadisticas/
        """
        tipo = self.get_object()
        
        # Intentar obtener estadísticas del modelo Legajo si existe
        try:
            from personal.models import Legajo
            
            total_documentos = Legajo.objects.filter(tipo_documento=tipo).count()
            
            # Documentos recientes (últimos 30 días)
            from django.utils import timezone
            from datetime import timedelta
            hace_30_dias = timezone.now() - timedelta(days=30)
            documentos_recientes = Legajo.objects.filter(
                tipo_documento=tipo,
                fecha_registro__gte=hace_30_dias
            ).count()
        except ImportError:
            total_documentos = 0
            documentos_recientes = 0
        
        return Response({
            'tipo': TipoDocumentoSerializer(tipo).data,
            'total_documentos': total_documentos,
            'documentos_ultimos_30_dias': documentos_recientes,
        })