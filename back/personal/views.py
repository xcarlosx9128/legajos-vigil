from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from eventos.utils import registrar  # ← IMPORTAR
from .models import Personal, Escalafon, Legajo
from .serializers import (
    PersonalSerializer, PersonalListSerializer, PersonalCreateSerializer,
    EscalafonSerializer, EscalafonCreateSerializer,
    LegajoSerializer, LegajoCreateSerializer
)
from usuarios.permissions import CanManagePersonal


class PersonalViewSet(viewsets.ModelViewSet):
    queryset = Personal.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PersonalCreateSerializer
        elif self.action == 'list':
            return PersonalListSerializer
        return PersonalSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), CanManagePersonal()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Personal.objects.select_related(
            'area_actual', 'regimen_actual', 'condicion_actual'
        )
        
        # Filtros
        dni = self.request.query_params.get('dni', None)
        activo = self.request.query_params.get('activo', None)
        area = self.request.query_params.get('area', None)
        regimen = self.request.query_params.get('regimen', None)
        condicion = self.request.query_params.get('condicion', None)
        search = self.request.query_params.get('search', None)
        
        if dni:
            queryset = queryset.filter(dni=dni)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        if area:
            queryset = queryset.filter(area_actual_id=area)
        if regimen:
            queryset = queryset.filter(regimen_actual_id=regimen)
        if condicion:
            queryset = queryset.filter(condicion_actual_id=condicion)
        if search:
            queryset = queryset.filter(
                Q(dni__icontains=search) |
                Q(nombres__icontains=search) |
                Q(apellido_paterno__icontains=search) |
                Q(apellido_materno__icontains=search)
            )
        
        return queryset.order_by('apellido_paterno', 'apellido_materno', 'nombres')
    
    def create(self, request, *args, **kwargs):
        """Crear personal y registrar evento"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # ✅ REGISTRAR EVENTO: Creación de Nuevo Personal (ID 3)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=3
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def escalafon(self, request, pk=None):
        """Obtener historial de escalafón del personal"""
        personal = self.get_object()
        escalafones = Escalafon.objects.filter(personal=personal).select_related(
            'area', 'regimen', 'condicion_laboral'
        )
        serializer = EscalafonSerializer(escalafones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def legajo(self, request, pk=None):
        """Obtener legajo del personal"""
        personal = self.get_object()
        legajos = Legajo.objects.filter(personal=personal).select_related('registrado_por')
        serializer = LegajoSerializer(legajos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManagePersonal])
    def toggle_active(self, request, pk=None):
        """Habilitar/Deshabilitar personal"""
        personal = self.get_object()
        personal.activo = not personal.activo
        personal.save()
        serializer = self.get_serializer(personal)
        return Response(serializer.data)


class EscalafonViewSet(viewsets.ModelViewSet):
    queryset = Escalafon.objects.all()
    permission_classes = [IsAuthenticated, CanManagePersonal]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EscalafonCreateSerializer
        return EscalafonSerializer
    
    def get_queryset(self):
        queryset = Escalafon.objects.select_related(
            'personal', 'area', 'regimen', 'condicion_laboral'
        )
        
        # Filtro por personal
        personal_id = self.request.query_params.get('personal', None)
        if personal_id:
            queryset = queryset.filter(personal_id=personal_id)
        
        return queryset.order_by('-fecha_inicio')
    
    def perform_create(self, serializer):
        escalafon = serializer.save()
        
        # Actualizar datos actuales del personal si es el registro más reciente
        personal = escalafon.personal
        if not escalafon.fecha_fin:  # Si no tiene fecha fin, es el actual
            personal.area_actual = escalafon.area
            personal.regimen_actual = escalafon.regimen
            personal.condicion_actual = escalafon.condicion_laboral
            personal.cargo_actual = escalafon.cargo
            personal.save()
    
    def update(self, request, *args, **kwargs):
        """Actualizar escalafón y registrar evento"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # ✅ REGISTRAR EVENTO: Modificación de Escalafón (ID 8)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=8
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)


class LegajoViewSet(viewsets.ModelViewSet):
    queryset = Legajo.objects.all()
    permission_classes = [IsAuthenticated, CanManagePersonal]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LegajoCreateSerializer
        return LegajoSerializer
    
    def get_queryset(self):
        queryset = Legajo.objects.select_related('personal', 'registrado_por')
        
        # Filtros
        personal_id = self.request.query_params.get('personal', None)
        tipo = self.request.query_params.get('tipo', None)
        
        if personal_id:
            queryset = queryset.filter(personal_id=personal_id)
        if tipo:
            queryset = queryset.filter(tipo_documento=tipo)
        
        return queryset.order_by('-fecha_registro')
    
    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Crear legajo (documento) y registrar evento"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # ✅ REGISTRAR EVENTO: Agregado de Documento al Legajo (ID 4)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=4
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Actualizar legajo (documento) y registrar evento"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # ✅ REGISTRAR EVENTO: Modificación de Documento del Legajo (ID 5)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)