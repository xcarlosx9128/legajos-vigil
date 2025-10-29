from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.http import FileResponse, Http404
from eventos.utils import registrar
from .models import Personal, Escalafon, Legajo
from organizacion.models import TipoDocumento
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
    
    def perform_create(self, serializer):
        """Crear personal y automáticamente agregar su documento al legajo"""
        print("\n" + "="*80)
        print("🔵 CREANDO PERSONAL")
        print("="*80)
        
        personal = serializer.save()
        print(f"✅ Personal creado: {personal.nombre_completo} (ID: {personal.id})")
        print(f"📄 ¿Tiene documento?: {bool(personal.documento)}")
        
        # Buscar el tipo "Documentos Varios" (número 9)
        if personal.documento:
            print("📁 Documento detectado, guardando en Legajo...")
            try:
                # Buscar el tipo número 9 (Documentos Varios)
                tipo_varios = TipoDocumento.objects.get(numero=9)
                print(f"✅ Tipo VARIOS encontrado:")
                print(f"   - ID: {tipo_varios.id}")
                print(f"   - Número: {tipo_varios.numero}")
                print(f"   - Nombre: {tipo_varios.nombre}")
                
                # Crear el documento en Legajo con el modelo simplificado
                legajo = Legajo.objects.create(
                    personal=personal,
                    tipo_documento=tipo_varios,
                    descripcion=f'Documento adjunto al momento de crear el registro del personal',
                    archivo=personal.documento,
                    registrado_por=self.request.user
                )
                print(f"✅ Documento guardado en Legajo!")
                print(f"   - ID Legajo: {legajo.id}")
                print(f"   - Tipo: {legajo.tipo_documento.nombre}")
                print(f"   - Fecha: {legajo.fecha_registro}")
                print(f"   - Archivo: {legajo.archivo.url if legajo.archivo else 'Sin archivo'}")
                
            except TipoDocumento.DoesNotExist:
                print("❌ ERROR: No se encontró el tipo de documento número 9")
                print("💡 Verifica en el admin que exista un TipoDocumento con numero=9")
                print("💡 Debería ser: 9. Documentos Varios")
            except Exception as e:
                print(f"❌ ERROR al crear documento en legajo: {str(e)}")
                import traceback
                traceback.print_exc()
        else:
            print("⚠️ No se subió documento, no se crea registro en Legajo")
        
        print("="*80 + "\n")
    
    def create(self, request, *args, **kwargs):
        """Crear personal y registrar evento"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Registrar evento: Creación de Nuevo Personal (ID 3)
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
        legajos = Legajo.objects.filter(personal=personal).select_related(
            'tipo_documento', 'registrado_por'
        )
        serializer = LegajoSerializer(legajos, many=True, context={'request': request})
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
        
        # Registrar evento: Modificación de Escalafón (ID 8)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=8
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)


class LegajoViewSet(viewsets.ModelViewSet):
    """
    ViewSet simplificado para gestión de documentos del legajo
    """
    queryset = Legajo.objects.all()
    permission_classes = [IsAuthenticated, CanManagePersonal]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LegajoCreateSerializer
        return LegajoSerializer
    
    def get_queryset(self):
        queryset = Legajo.objects.select_related(
            'personal', 
            'tipo_documento', 
            'registrado_por'
        )
        
        # Filtros
        personal_id = self.request.query_params.get('personal', None)
        tipo = self.request.query_params.get('tipo', None)
        
        if personal_id:
            queryset = queryset.filter(personal_id=personal_id)
        if tipo:
            queryset = queryset.filter(tipo_documento_id=tipo)
        
        return queryset.order_by('-fecha_registro')  # Cambiado a fecha_registro
    
    def perform_create(self, serializer):
        """Crear documento y asignar usuario que lo registra"""
        serializer.save(registrado_por=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Crear documento del legajo y registrar evento"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Registrar evento: Agregado de Documento al Legajo (ID 4)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=4
        )
        
        # Devolver el objeto completo con todas las relaciones
        instance = serializer.instance
        output_serializer = LegajoSerializer(instance, context={'request': request})
        
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Actualizar documento del legajo y registrar evento"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Registrar evento: Modificación de Documento del Legajo (ID 5)
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Eliminar documento del legajo"""
        instance = self.get_object()
        
        # Eliminar el archivo físico
        if instance.archivo:
            try:
                instance.archivo.delete(save=False)
            except Exception as e:
                print(f"Error al eliminar archivo físico: {e}")
        
        self.perform_destroy(instance)
        return Response(
            {'message': 'Documento eliminado exitosamente'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """
        Obtener documentos organizados por tipo
        GET /api/legajo/por_tipo/?personal=<id>
        """
        personal_id = request.query_params.get('personal')
        if not personal_id:
            return Response(
                {'error': 'Se requiere el parámetro personal'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener todos los tipos de documento activos
        from organizacion.serializers import TipoDocumentoListSerializer
        tipos = TipoDocumento.objects.filter(activo=True).order_by('numero')
        
        resultado = []
        for tipo in tipos:
            documentos = Legajo.objects.filter(
                personal_id=personal_id,
                tipo_documento=tipo
            ).select_related('registrado_por')
            
            resultado.append({
                'tipo': TipoDocumentoListSerializer(tipo).data,
                'documentos': LegajoSerializer(
                    documentos,
                    many=True,
                    context={'request': request}
                ).data,
                'cantidad': documentos.count()
            })
        
        return Response(resultado)
    
    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        """
        Endpoint para descargar un documento
        """
        documento = self.get_object()
        if not documento.archivo:
            return Response(
                {'error': 'El documento no tiene archivo asociado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Redirigir a la URL del archivo
        try:
            return FileResponse(
                documento.archivo.open('rb'),
                content_type='application/pdf',
                as_attachment=True,
                filename=documento.archivo.name.split('/')[-1]
            )
        except FileNotFoundError:
            raise Http404("Archivo no encontrado")
