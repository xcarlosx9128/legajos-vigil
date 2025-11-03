# organizacion/views.py - SIMPLIFICADO

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Area, Regimen, CondicionLaboral, Cargo, SeccionLegajo, TipoDocumento
from .serializers import (
    AreaSerializer,
    RegimenSerializer,
    CondicionLaboralSerializer,
    CargoSerializer,
    SeccionLegajoSerializer,
    TipoDocumentoSerializer
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
# VIEWSET: SECCION DE LEGAJO
# ============================================

class SeccionLegajoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las secciones del legajo SIGELP.
    """
    queryset = SeccionLegajo.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = SeccionLegajoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['orden', 'nombre']
    ordering = ['orden']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = SeccionLegajo.objects.all()
        
        activas = self.request.query_params.get('activas', None)
        if activas == 'true':
            queryset = queryset.filter(activo=True)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('orden')
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Devuelve solo las secciones activas.
        GET /api/secciones-legajo/activas/
        """
        secciones = SeccionLegajo.objects.filter(activo=True).order_by('orden')
        serializer = SeccionLegajoSerializer(secciones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar sección"""
        seccion = self.get_object()
        seccion.activo = not seccion.activo
        seccion.save()
        serializer = self.get_serializer(seccion)
        return Response(serializer.data)


# ============================================
# ⭐ VIEWSET: TIPO DE DOCUMENTO (ULTRA SIMPLIFICADO)
# ============================================

class TipoDocumentoViewSet(viewsets.ModelViewSet):
    """
    ViewSet SIMPLIFICADO para tipos de documentos generales.
    
    Ya NO hay filtros por sección - todos los tipos están disponibles para cualquier sección.
    
    Endpoints:
    - GET /api/tipos-documento/ - Listar todos los tipos
    - GET /api/tipos-documento/{id}/ - Detalle de un tipo
    - GET /api/tipos-documento/activos/ - Solo tipos activos
    - POST /api/tipos-documento/ - Crear tipo (admin)
    - PUT /api/tipos-documento/{id}/ - Actualizar tipo (admin)
    - DELETE /api/tipos-documento/{id}/ - Eliminar tipo (admin)
    """
    queryset = TipoDocumento.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = TipoDocumentoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo']
    ordering_fields = ['orden', 'nombre']
    ordering = ['orden', 'nombre']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = TipoDocumento.objects.all()
        
        # Filtrar solo activos
        activos = self.request.query_params.get('activos', None)
        if activos == 'true':
            queryset = queryset.filter(activo=True)
        
        # Búsqueda por nombre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('orden', 'nombre')
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los tipos de documentos activos.
        GET /api/tipos-documento/activos/
        """
        tipos = TipoDocumento.objects.filter(activo=True).order_by('orden', 'nombre')
        serializer = TipoDocumentoSerializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar tipo de documento"""
        tipo = self.get_object()
        tipo.activo = not tipo.activo
        tipo.save()
        serializer = self.get_serializer(tipo)
        return Response(serializer.data)