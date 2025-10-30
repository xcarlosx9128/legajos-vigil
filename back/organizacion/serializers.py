# organizacion/serializers.py - CON SECCIONES Y TIPOS DE DOCUMENTOS

from rest_framework import serializers
from .models import Area, Regimen, CondicionLaboral, Cargo, SeccionLegajo, TipoDocumento


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'nombre', 'descripcion', 'codigo', 'activo', 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class RegimenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regimen
        fields = ['id', 'nombre', 'descripcion', 'activo', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


class CondicionLaboralSerializer(serializers.ModelSerializer):
    class Meta:
        model = CondicionLaboral
        fields = ['id', 'nombre', 'descripcion', 'activo', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nombre', 'descripcion', 'activo', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


# ============================================
# SERIALIZERS: SECCION DE LEGAJO
# ============================================

class SeccionLegajoListSerializer(serializers.ModelSerializer):
    """Serializer simple para listar secciones"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    total_tipos = serializers.IntegerField(source='tipos_documento.count', read_only=True)
    
    class Meta:
        model = SeccionLegajo
        fields = ['id', 'numero', 'nombre', 'nombre_completo', 'color', 'activo', 'total_tipos']


class SeccionLegajoSerializer(serializers.ModelSerializer):
    """Serializer completo para secciones"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    total_tipos = serializers.IntegerField(source='tipos_documento.count', read_only=True)
    
    class Meta:
        model = SeccionLegajo
        fields = [
            'id',
            'numero',
            'nombre',
            'nombre_completo',
            'descripcion',
            'color',
            'activo',
            'orden',
            'total_tipos',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


# ============================================
# SERIALIZERS: TIPO DE DOCUMENTO
# ============================================

class TipoDocumentoListSerializer(serializers.ModelSerializer):
    """Serializer simple para listar tipos de documentos"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    seccion_numero = serializers.IntegerField(source='seccion.numero', read_only=True)
    seccion_nombre = serializers.CharField(source='seccion.nombre', read_only=True)
    seccion_color = serializers.CharField(source='seccion.color', read_only=True)
    
    class Meta:
        model = TipoDocumento
        fields = [
            'id',
            'codigo',
            'numero',
            'nombre',
            'nombre_completo',
            'seccion',
            'seccion_numero',
            'seccion_nombre',
            'seccion_color',
            'es_obligatorio',
            'activo'
        ]


class TipoDocumentoSerializer(serializers.ModelSerializer):
    """Serializer completo para tipos de documentos"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    seccion_numero = serializers.IntegerField(source='seccion.numero', read_only=True)
    seccion_nombre = serializers.CharField(source='seccion.nombre', read_only=True)
    seccion_color = serializers.CharField(source='seccion.color', read_only=True)
    
    class Meta:
        model = TipoDocumento
        fields = [
            'id',
            'seccion',
            'seccion_numero',
            'seccion_nombre',
            'seccion_color',
            'numero',
            'codigo',
            'nombre',
            'nombre_completo',
            'descripcion',
            'activo',
            'es_obligatorio',
            'orden',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'codigo', 'fecha_creacion', 'fecha_actualizacion']


# ============================================
# SERIALIZER: SECCION CON TIPOS (NESTED)
# ============================================

class SeccionLegajoConTiposSerializer(serializers.ModelSerializer):
    """Serializer de sección que incluye todos sus tipos de documentos"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    tipos_documento = TipoDocumentoListSerializer(many=True, read_only=True)
    
    class Meta:
        model = SeccionLegajo
        fields = [
            'id',
            'numero',
            'nombre',
            'nombre_completo',
            'descripcion',
            'color',
            'activo',
            'orden',
            'tipos_documento',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']