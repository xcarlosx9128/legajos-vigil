# organizacion/serializers.py - VERSIÓN SIMPLIFICADA

from rest_framework import serializers
from .models import Area, Regimen, CondicionLaboral, Cargo, TipoDocumento


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
# NUEVO SERIALIZER: TIPO DE DOCUMENTO
# ============================================

class TipoDocumentoListSerializer(serializers.ModelSerializer):
    """Serializer simple para listar tipos de documentos"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    
    class Meta:
        model = TipoDocumento
        fields = ['id', 'numero', 'nombre', 'nombre_completo', 'color']


class TipoDocumentoSerializer(serializers.ModelSerializer):
    """Serializer completo para tipos de documentos"""
    nombre_completo = serializers.CharField(source='get_nombre_completo', read_only=True)
    
    class Meta:
        model = TipoDocumento
        fields = [
            'id',
            'numero',
            'nombre',
            'nombre_completo',
            'descripcion',
            'color',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']