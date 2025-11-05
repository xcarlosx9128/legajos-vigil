from rest_framework import serializers
from .models import Evento, RegistroEvento


class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'descripcion']


class RegistroEventoSerializer(serializers.ModelSerializer):
    # Usuario ejecutor
    usuario_ejecutor_nombre = serializers.CharField(
        source='usuario_ejecutor.nombre_completo', 
        read_only=True
    )
    usuario_ejecutor_username = serializers.CharField(
        source='usuario_ejecutor.username', 
        read_only=True
    )
    
    # Usuario afectado
    usuario_afectado_nombre = serializers.CharField(
        source='usuario_afectado.nombre_completo', 
        read_only=True,
        allow_null=True
    )
    usuario_afectado_username = serializers.CharField(
        source='usuario_afectado.username', 
        read_only=True,
        allow_null=True
    )
    
    # ⭐ NUEVO: Personal afectado
    personal_afectado_nombre = serializers.SerializerMethodField()
    personal_afectado_dni = serializers.CharField(
        source='personal_afectado.dni',
        read_only=True,
        allow_null=True
    )
    
    # Evento
    evento_nombre = serializers.CharField(
        source='evento.nombre', 
        read_only=True
    )
    
    def get_personal_afectado_nombre(self, obj):
        if obj.personal_afectado:
            return obj.personal_afectado.nombre_completo
        return None
    
    class Meta:
        model = RegistroEvento
        fields = [
            'id',
            'usuario_ejecutor',
            'usuario_ejecutor_nombre',
            'usuario_ejecutor_username',
            'usuario_afectado',
            'usuario_afectado_nombre',
            'usuario_afectado_username',
            'personal_afectado',
            'personal_afectado_nombre',
            'personal_afectado_dni',
            'evento',
            'evento_nombre',
            'fecha_hora',
        ]
        read_only_fields = fields