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
            'cargo_actual', 'fecha_ingreso', 'activo', 'observaciones', 'documento',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class PersonalListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    area_nombre = serializers.CharField(source='area_actual.nombre', read_only=True)
    regimen_nombre = serializers.CharField(source='regimen_actual.nombre', read_only=True)
    condicion_nombre = serializers.CharField(source='condicion_actual.nombre', read_only=True)
    cargo_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Personal
        fields = [
            'id', 'dni', 'nombre_completo', 'area_nombre', 
            'regimen_nombre', 'condicion_nombre', 'cargo_nombre', 'activo'
        ]
    
    def get_cargo_nombre(self, obj):
        if obj.cargo_actual:
            try:
                from organizacion.models import Cargo
                cargo = Cargo.objects.get(id=obj.cargo_actual)
                return cargo.nombre
            except (Cargo.DoesNotExist, ValueError):
                return obj.cargo_actual
        return None


class PersonalCreateSerializer(serializers.ModelSerializer):
    # Permitir tanto area_actual como area_actual_id
    area_actual_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    regimen_actual_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    condicion_actual_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Documento es obligatorio
    documento = serializers.FileField(required=True)
    
    class Meta:
        model = Personal
        fields = [
            'dni', 'nombres', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'area_actual', 'area_actual_id', 'regimen_actual', 'regimen_actual_id', 
            'condicion_actual', 'condicion_actual_id', 'cargo_actual',
            'fecha_ingreso', 'observaciones', 'documento'
        ]
    
    def validate_documento(self, value):
        """Validar que el archivo sea un PDF"""
        if value:
            if not value.name.lower().endswith('.pdf'):
                raise serializers.ValidationError("Solo se permiten archivos PDF")
            # Validar tamaño (máximo 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no puede superar los 10MB")
        return value
    
    def create(self, validated_data):
        # Manejar los campos _id si vienen
        if 'area_actual_id' in validated_data:
            validated_data['area_actual_id'] = validated_data.pop('area_actual_id')
        if 'regimen_actual_id' in validated_data:
            validated_data['regimen_actual_id'] = validated_data.pop('regimen_actual_id')
        if 'condicion_actual_id' in validated_data:
            validated_data['condicion_actual_id'] = validated_data.pop('condicion_actual_id')
        
        return super().create(validated_data)


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
# SERIALIZERS ACTUALIZADOS PARA LEGAJO
# ============================================

class LegajoSerializer(serializers.ModelSerializer):
    """
    Serializer completo para lectura de documentos del legajo
    ⭐ ACTUALIZADO CON CAMPOS DE SECCIÓN
    """
    personal_nombre = serializers.CharField(source='personal.nombre_completo', read_only=True)
    
    # Campos del tipo de documento
    tipo_documento_id = serializers.IntegerField(source='tipo_documento.id', read_only=True)
    tipo_documento_codigo = serializers.CharField(source='tipo_documento.codigo', read_only=True)  # ⭐ NUEVO
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    tipo_documento_numero = serializers.IntegerField(source='tipo_documento.numero', read_only=True)
    
    # ⭐ CAMPOS DE LA SECCIÓN (NUEVOS)
    tipo_documento_seccion = serializers.IntegerField(source='tipo_documento.seccion.id', read_only=True)
    seccion_numero = serializers.IntegerField(source='tipo_documento.seccion.numero', read_only=True)
    seccion_nombre = serializers.CharField(source='tipo_documento.seccion.nombre', read_only=True)
    seccion_color = serializers.CharField(source='tipo_documento.seccion.color', read_only=True)
    
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre_completo', read_only=True)
    archivo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Legajo
        fields = [
            'id',
            'personal',
            'personal_nombre',
            'tipo_documento',
            'tipo_documento_id',
            'tipo_documento_codigo',          # ⭐ NUEVO
            'tipo_documento_nombre',
            'tipo_documento_numero',
            'tipo_documento_seccion',         # ⭐ NUEVO
            'seccion_numero',                 # ⭐ NUEVO
            'seccion_nombre',                 # ⭐ NUEVO
            'seccion_color',                  # ⭐ NUEVO
            'fecha_documento',                # ⭐ NUEVO (fecha del documento)
            'descripcion',
            'archivo',
            'archivo_url',
            'registrado_por',
            'registrado_por_nombre',
            'fecha_registro',                 # Fecha de registro en sistema
            'fecha_creacion',
            'fecha_modificacion'
        ]
        read_only_fields = ['id', 'fecha_registro', 'registrado_por', 'fecha_creacion', 'fecha_modificacion']
    
    def get_archivo_url(self, obj):
        if obj.archivo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.archivo.url)
            return obj.archivo.url
        return None


class LegajoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para crear documentos del legajo
    Solo requiere: personal, tipo_documento, descripcion (opcional), archivo (PDF obligatorio)
    """
    class Meta:
        model = Legajo
        fields = [
            'personal',
            'tipo_documento',
            'descripcion',
            'archivo'
        ]
    
    def validate_archivo(self, value):
        """
        Validar que el archivo sea PDF
        """
        if not value:
            raise serializers.ValidationError("El archivo es obligatorio")
        
        ext = os.path.splitext(value.name)[1].lower()
        if ext != '.pdf':
            raise serializers.ValidationError("Solo se permiten archivos PDF")
        
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede superar los 10MB")
        
        return value
    
    def validate_descripcion(self, value):
        """
        La descripción es opcional pero si se proporciona, validar longitud
        """
        if value and len(value) > 500:
            raise serializers.ValidationError("La descripción no puede superar los 500 caracteres")
        return value