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
    
    class Meta:
        model = Personal
        fields = [
            'dni', 'nombres', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'area_actual', 'area_actual_id', 'regimen_actual', 'regimen_actual_id', 
            'condicion_actual', 'condicion_actual_id', 'cargo_actual',
            'fecha_ingreso', 'observaciones', 'foto'
        ]
    
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