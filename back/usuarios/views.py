from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from eventos.utils import registrar  # ← IMPORTAR
from .models import Usuario
from .serializers import (
    UsuarioSerializer, UsuarioCreateSerializer, UsuarioUpdateSerializer,
    ChangePasswordSerializer, UsuarioListSerializer
)
from .permissions import IsAdmin


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Vista para la gestión de usuarios del sistema.
    """
    queryset = Usuario.objects.all().order_by('-fecha_creacion')
    permission_classes = [IsAuthenticated]

    # Selección automática del serializer según la acción
    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        elif self.action == 'list':
            return UsuarioListSerializer
        return UsuarioSerializer

    # Control de permisos según la acción
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_active', 'reset_password']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    # Filtros avanzados
    def get_queryset(self):
        queryset = Usuario.objects.all().order_by('-fecha_creacion')

        rol = self.request.query_params.get('rol')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')

        if rol:
            queryset = queryset.filter(rol=rol)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(nombres__icontains=search) |
                Q(apellidos__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        """Crear usuario y registrar evento"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nuevo_usuario = self.perform_create(serializer)
        
        # ✅ REGISTRAR EVENTO: Creación de Usuario (ID 2)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=2,
            usuario_afectado=nuevo_usuario
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        return serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Actualizar usuario y registrar evento"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # ✅ REGISTRAR EVENTO: Modificación de Usuario (ID 1)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=1,
            usuario_afectado=instance
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)

    # Bloquear eliminación de usuarios
    def destroy(self, request, *args, **kwargs):
        return Response(
            {'detail': 'No se permite eliminar usuarios. Use el método de deshabilitación.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    # Habilitar/Deshabilitar usuario (solo admin)
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def toggle_active(self, request, pk=None):
        usuario = self.get_object()
        estaba_activo = usuario.is_active
        usuario.is_active = not usuario.is_active
        usuario.save()
        
        # ✅ REGISTRAR EVENTO: Desactivación de Usuario (ID 9) - solo si se desactiva
        if estaba_activo and not usuario.is_active:
            registrar(
                usuario_ejecutor=request.user,
                id_evento=9,
                usuario_afectado=usuario
            )
        
        serializer = self.get_serializer(usuario)
        estado = "habilitado" if usuario.is_active else "deshabilitado"
        return Response(
            {'detail': f'Usuario {estado} exitosamente.', 'usuario': serializer.data},
            status=status.HTTP_200_OK
        )

    # Información del usuario autenticado
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    # Cambio de contraseña del usuario autenticado
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Contraseña incorrecta.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Contraseña actualizada exitosamente.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Resetear contraseña (solo admin)
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def reset_password(self, request, pk=None):
        usuario = self.get_object()
        new_password = request.data.get('new_password')

        if not new_password:
            return Response(
                {'detail': 'Se requiere una nueva contraseña.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.set_password(new_password)
        usuario.save()
        return Response({'detail': 'Contraseña reseteada exitosamente.'}, status=status.HTTP_200_OK)