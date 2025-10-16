from rest_framework import serializers
from .models import Personal, Escalafon, Legajo
from organizacion.serializers import AreaSerializer, RegimenSerializer, CondicionLaboralSerializer
from usuarios.serializers import UsuarioListSerializer

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
            'cargo_actual', 'fecha_ingreso', 'activo', 'observaciones', 'foto',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']

class PersonalListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    area_nombre = serializers.CharField(source='area_actual.nombre', read_only=True)
    cargo = serializers.CharField(source='cargo_actual', read_only=True)
    
    class Meta:
        model = Personal
        fields = ['id', 'dni', 'nombre_completo', 'area_nombre', 'cargo', 'activo']

class PersonalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = [
            'dni', 'nombres', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'area_actual', 'regimen_actual', 'condicion_actual', 'cargo_actual',
            'fecha_ingreso', 'observaciones', 'foto'
        ]

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

class LegajoSerializer(serializers.ModelSerializer):
    personal_nombre = serializers.CharField(source='personal.nombre_completo', read_only=True)
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre_completo', read_only=True)
    
    class Meta:
        model = Legajo
        fields = [
            'id', 'personal', 'personal_nombre', 'tipo_documento',
            'tipo_documento_display', 'nombre_documento', 'descripcion',
            'archivo', 'numero_documento', 'fecha_documento', 'fecha_registro',
            'registrado_por', 'registrado_por_nombre'
        ]
        read_only_fields = ['id', 'fecha_registro', 'registrado_por']

class LegajoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Legajo
        fields = [
            'personal', 'tipo_documento', 'nombre_documento', 'descripcion',
            'archivo', 'numero_documento', 'fecha_documento'
        ]