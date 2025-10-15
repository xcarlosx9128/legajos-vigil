from rest_framework import serializers
from .models import Evento, RegistroEvento


class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'descripcion']


class RegistroEventoSerializer(serializers.ModelSerializer):
    usuario_ejecutor_nombre = serializers.CharField(
        source='usuario_ejecutor.nombre_completo', 
        read_only=True
    )
    usuario_ejecutor_username = serializers.CharField(
        source='usuario_ejecutor.username', 
        read_only=True
    )
    usuario_afectado_nombre = serializers.CharField(
        source='usuario_afectado.nombre_completo', 
        read_only=True
    )
    evento_nombre = serializers.CharField(
        source='evento.nombre', 
        read_only=True
    )
    
    class Meta:
        model = RegistroEvento
        fields = [
            'id',
            'usuario_ejecutor',
            'usuario_ejecutor_nombre',
            'usuario_ejecutor_username',
            'usuario_afectado',
            'usuario_afectado_nombre',
            'evento',
            'evento_nombre',
            'fecha_hora',
        ]
        read_only_fields = fields