# organizacion/serializers.py - SIMPLIFICADO

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

class SeccionLegajoSerializer(serializers.ModelSerializer):
    """Serializer completo para secciones"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    
    class Meta:
        model = SeccionLegajo
        fields = [
            'id',
            'nombre',
            'nombre_completo',
            'descripcion',
            'color',
            'activo',
            'orden',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


# ============================================
# ⭐ SERIALIZERS: TIPO DE DOCUMENTO (SIMPLIFICADO)
# ============================================

class TipoDocumentoSerializer(serializers.ModelSerializer):
    """
    Serializer ULTRA SIMPLIFICADO para tipos de documentos generales.
    Ya NO tiene: seccion, codigo, orden, es_obligatorio, numero
    Solo tiene: id, nombre, descripcion, activo
    """
    
    class Meta:
        model = TipoDocumento
        fields = [
            'id',
            'nombre',
            'descripcion',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']