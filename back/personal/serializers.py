from rest_framework import serializers
from .models import Personal, Escalafon, Legajo
from organizacion.serializers import AreaSerializer, RegimenSerializer, CondicionLaboralSerializer
import os


class PersonalSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    area_actual_detalle = AreaSerializer(source='area_actual', read_only=True)
    regimen_actual_detalle = RegimenSerializer(source='regimen_actual', read_only=True)
    condicion_actual_detalle = CondicionLaboralSerializer(source='condicion_actual', read_only=True)
    
    class Meta:
        model = Personal
        fields = [
            'id', 'dni', 'nombres', 'apellido_paterno', 'apellido_materno',
            'nombre_completo', 'fecha_nacimiento', 'sexo', 'telefono', 'email',
            'direccion', 'area_actual', 'area_actual_detalle', 'regimen_actual',
            'regimen_actual_detalle', 'condicion_actual', 'condicion_actual_detalle',
            'cargo_actual', 'fecha_ingreso', 'activo', 
            'observaciones', 'documento', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class PersonalListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    area_nombre = serializers.CharField(source='area_actual.nombre', read_only=True)
    regimen_nombre = serializers.CharField(source='regimen_actual.nombre', read_only=True)
    condicion_nombre = serializers.CharField(source='condicion_actual.nombre', read_only=True)
    
    class Meta:
        model = Personal
        fields = [
            'id', 'dni', 'nombre_completo', 'area_nombre', 
            'regimen_nombre', 'condicion_nombre', 'cargo_actual', 'activo'
        ]


class PersonalCreateSerializer(serializers.ModelSerializer):
    documento = serializers.FileField(required=True)
    
    class Meta:
        model = Personal
        fields = [
            'dni', 'nombres', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'area_actual', 'regimen_actual', 'condicion_actual', 'cargo_actual',
            'fecha_ingreso', 'observaciones', 'documento'
        ]
    
    def validate_documento(self, value):
        if value:
            if not value.name.lower().endswith('.pdf'):
                raise serializers.ValidationError("Solo se permiten archivos PDF")
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no puede superar los 10MB")
        return value


class EscalafonSerializer(serializers.ModelSerializer):
    personal_nombre = serializers.CharField(source='personal.nombre_completo', read_only=True)
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    regimen_nombre = serializers.CharField(source='regimen.nombre', read_only=True)
    condicion_nombre = serializers.CharField(source='condicion_laboral.nombre', read_only=True)
    
    class Meta:
        model = Escalafon
        fields = [
            'id', 'personal', 'personal_nombre', 'area', 'area_nombre',
            'regimen', 'regimen_nombre', 'condicion_laboral', 'condicion_nombre',
            'cargo', 'fecha_inicio', 'fecha_fin', 'resolucion',
            'documento_resolucion', 'observaciones', 'fecha_registro'
        ]
        read_only_fields = ['id', 'fecha_registro']


class EscalafonCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escalafon
        fields = [
            'personal', 'area', 'regimen', 'condicion_laboral', 'cargo',
            'fecha_inicio', 'fecha_fin', 'resolucion', 'documento_resolucion',
            'observaciones'
        ]


# ============================================
# SERIALIZERS LEGAJO ULTRA SIMPLIFICADOS
# ============================================

class LegajoSerializer(serializers.ModelSerializer):
    """
    Serializer para lectura de documentos del legajo.
    ⭐ SOLO UNA FECHA: fecha_creacion
    """
    personal_nombre = serializers.CharField(source='personal.nombre_completo', read_only=True)
    
    # Campos de la sección
    seccion_id = serializers.IntegerField(source='seccion.id', read_only=True)
    seccion_nombre = serializers.CharField(source='seccion.nombre', read_only=True)
    seccion_orden = serializers.IntegerField(source='seccion.orden', read_only=True)
    seccion_color = serializers.CharField(source='seccion.color', read_only=True)
    
    # Campos del tipo de documento
    tipo_documento_id = serializers.IntegerField(source='tipo_documento.id', read_only=True)
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    
    # Usuario que registró
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre_completo', read_only=True)
    
    # URL del archivo
    archivo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Legajo
        fields = [
            'id',
            'personal',
            'personal_nombre',
            'seccion',
            'seccion_id',
            'seccion_nombre',
            'seccion_orden',
            'seccion_color',
            'tipo_documento',
            'tipo_documento_id',
            'tipo_documento_nombre',
            'descripcion',
            'archivo',
            'archivo_url',
            'registrado_por',
            'registrado_por_nombre',
            'fecha_creacion',  # ⭐ SOLO ESTA FECHA
        ]
        read_only_fields = ['id', 'fecha_creacion', 'registrado_por']
    
    def get_archivo_url(self, obj):
        if obj.archivo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.archivo.url)
            return obj.archivo.url
        return None


class LegajoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear documentos del legajo.
    Campos obligatorios: personal, seccion, tipo_documento, archivo
    """
    class Meta:
        model = Legajo
        fields = [
            'personal',
            'seccion',
            'tipo_documento',
            'descripcion',
            'archivo'
        ]
    
    def validate_archivo(self, value):
        """Validar que el archivo sea PDF"""
        if not value:
            raise serializers.ValidationError("El archivo es obligatorio")
        
        ext = os.path.splitext(value.name)[1].lower()
        if ext != '.pdf':
            raise serializers.ValidationError("Solo se permiten archivos PDF")
        
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede superar los 10MB")
        
        return value
    
    def validate_descripcion(self, value):
        """La descripción es opcional"""
        if value and len(value) > 500:
            raise serializers.ValidationError("La descripción no puede superar los 500 caracteres")
        return value
    
    def validate(self, data):
        """Validaciones adicionales"""
        # Validar que la sección esté activa
        if data.get('seccion') and not data['seccion'].activo:
            raise serializers.ValidationError({
                'seccion': 'La sección seleccionada no está activa'
            })
        
        # Validar que el tipo de documento esté activo
        if data.get('tipo_documento') and not data['tipo_documento'].activo:
            raise serializers.ValidationError({
                'tipo_documento': 'El tipo de documento seleccionado no está activo'
            })
        
        return data