# organizacion/views.py - CON SECCIONES Y TIPOS DE DOCUMENTOS

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import Area, Regimen, CondicionLaboral, Cargo, SeccionLegajo, TipoDocumento
from .serializers import (
    AreaSerializer,
    RegimenSerializer,
    CondicionLaboralSerializer,
    CargoSerializer,
    SeccionLegajoSerializer,
    SeccionLegajoListSerializer,
    SeccionLegajoConTiposSerializer,
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
# VIEWSET: SECCION DE LEGAJO
# ============================================

class SeccionLegajoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las 9 secciones principales del legajo SIGELP.
    
    Endpoints disponibles:
    - GET /api/secciones-legajo/ - Listar todas las secciones
    - GET /api/secciones-legajo/{id}/ - Detalle de una sección
    - GET /api/secciones-legajo/activas/ - Solo secciones activas
    - GET /api/secciones-legajo/{id}/con-tipos/ - Sección con sus tipos de documentos
    - POST /api/secciones-legajo/ - Crear nueva sección (requiere admin)
    - PUT /api/secciones-legajo/{id}/ - Actualizar sección (requiere admin)
    - DELETE /api/secciones-legajo/{id}/ - Eliminar sección (requiere admin)
    """
    queryset = SeccionLegajo.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = SeccionLegajoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['numero', 'nombre', 'orden']
    ordering = ['numero']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SeccionLegajoListSerializer
        elif self.action == 'con_tipos':
            return SeccionLegajoConTiposSerializer
        return SeccionLegajoSerializer
    
    def get_queryset(self):
        queryset = SeccionLegajo.objects.annotate(
            total_tipos=Count('tipos_documento')
        )
        
        # Filtrar solo activas
        activas = self.request.query_params.get('activas', None)
        if activas == 'true':
            queryset = queryset.filter(activo=True)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('numero')
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Devuelve solo las secciones activas.
        GET /api/secciones-legajo/activas/
        """
        secciones = SeccionLegajo.objects.filter(activo=True).annotate(
            total_tipos=Count('tipos_documento')
        ).order_by('numero')
        serializer = SeccionLegajoListSerializer(secciones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def con_tipos(self, request, pk=None):
        """
        Devuelve una sección con todos sus tipos de documentos.
        GET /api/secciones-legajo/{id}/con-tipos/
        """
        seccion = self.get_object()
        serializer = SeccionLegajoConTiposSerializer(seccion)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar sección"""
        seccion = self.get_object()
        seccion.activo = not seccion.activo
        seccion.save()
        serializer = self.get_serializer(seccion)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """
        Devuelve estadísticas de uso de una sección.
        GET /api/secciones-legajo/{id}/estadisticas/
        """
        seccion = self.get_object()
        
        # Intentar obtener estadísticas del modelo Legajo si existe
        try:
            from personal.models import Legajo
            from django.utils import timezone
            from datetime import timedelta
            
            total_documentos = Legajo.objects.filter(
                tipo_documento__seccion=seccion
            ).count()
            
            # Documentos recientes (últimos 30 días)
            hace_30_dias = timezone.now() - timedelta(days=30)
            documentos_recientes = Legajo.objects.filter(
                tipo_documento__seccion=seccion,
                fecha_registro__gte=hace_30_dias
            ).count()
            
            # Tipos más usados
            tipos_mas_usados = Legajo.objects.filter(
                tipo_documento__seccion=seccion
            ).values(
                'tipo_documento__id',
                'tipo_documento__nombre',
                'tipo_documento__codigo'
            ).annotate(
                total=Count('id')
            ).order_by('-total')[:5]
            
        except ImportError:
            total_documentos = 0
            documentos_recientes = 0
            tipos_mas_usados = []
        
        return Response({
            'seccion': SeccionLegajoSerializer(seccion).data,
            'total_documentos': total_documentos,
            'documentos_ultimos_30_dias': documentos_recientes,
            'tipos_mas_usados': list(tipos_mas_usados)
        })


# ============================================
# VIEWSET: TIPO DE DOCUMENTO
# ============================================

class TipoDocumentoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los tipos de documentos dentro de cada sección del legajo.
    
    Endpoints disponibles:
    - GET /api/tipos-documento/ - Listar todos los tipos
    - GET /api/tipos-documento/{id}/ - Detalle de un tipo
    - GET /api/tipos-documento/activos/ - Solo tipos activos
    - GET /api/tipos-documento/por-seccion/{seccion_id}/ - Tipos de una sección específica
    - POST /api/tipos-documento/ - Crear nuevo tipo (requiere admin)
    - PUT /api/tipos-documento/{id}/ - Actualizar tipo (requiere admin)
    - DELETE /api/tipos-documento/{id}/ - Eliminar tipo (requiere admin)
    """
    queryset = TipoDocumento.objects.select_related('seccion').all()
    permission_classes = [IsAuthenticated]
    serializer_class = TipoDocumentoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo']
    ordering_fields = ['seccion__numero', 'numero', 'nombre']
    ordering = ['seccion__numero', 'numero']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TipoDocumentoListSerializer
        return TipoDocumentoSerializer
    
    def get_queryset(self):
        queryset = TipoDocumento.objects.select_related('seccion').all()
        
        # Filtrar solo activos
        activos = self.request.query_params.get('activos', None)
        if activos == 'true':
            queryset = queryset.filter(activo=True)
        
        # Filtrar por sección
        seccion_id = self.request.query_params.get('seccion', None)
        if seccion_id:
            queryset = queryset.filter(seccion_id=seccion_id)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        return queryset.order_by('seccion__numero', 'numero')
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Devuelve solo los tipos de documentos activos.
        GET /api/tipos-documento/activos/
        """
        tipos = TipoDocumento.objects.filter(activo=True).select_related('seccion')
        serializer = TipoDocumentoListSerializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_seccion(self, request):
        """
        Devuelve tipos de documentos agrupados por sección.
        GET /api/tipos-documento/por-seccion/
        GET /api/tipos-documento/por-seccion/?seccion_id=1
        """
        seccion_id = request.query_params.get('seccion_id', None)
        
        if seccion_id:
            # Tipos de una sección específica
            tipos = TipoDocumento.objects.filter(
                seccion_id=seccion_id,
                activo=True
            ).order_by('numero')
            serializer = TipoDocumentoListSerializer(tipos, many=True)
            return Response(serializer.data)
        else:
            # Todas las secciones con sus tipos
            secciones = SeccionLegajo.objects.filter(activo=True).prefetch_related(
                'tipos_documento'
            ).order_by('numero')
            serializer = SeccionLegajoConTiposSerializer(secciones, many=True)
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
            from django.utils import timezone
            from datetime import timedelta
            
            total_documentos = Legajo.objects.filter(tipo_documento=tipo).count()
            
            # Documentos recientes (últimos 30 días)
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