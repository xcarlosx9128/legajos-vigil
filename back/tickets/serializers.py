# tickets/serializers.py

from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    creado_por_nombre = serializers.CharField(source='creado_por.nombre_completo', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'numero_ticket',
            'nombre',
            'apellido',
            'persona_responsable',
            'area',
            'area_nombre',
            'observaciones',
            'estado',
            'fecha_creacion',
            'fecha_actualizacion',
            'fecha_resolucion',
            'creado_por',
            'creado_por_nombre',
        ]
        read_only_fields = [
            'numero_ticket', 
            'fecha_creacion', 
            'fecha_actualizacion',
            'creado_por',
        ]
    
    def validate(self, data):
        # Solo validar en creación, no en actualizaciones parciales
        if self.instance is None:  # Solo en creación
            if not data.get('nombre', '').strip():
                raise serializers.ValidationError({'nombre': 'El nombre es obligatorio'})
            
            if not data.get('apellido', '').strip():
                raise serializers.ValidationError({'apellido': 'El apellido es obligatorio'})
            
            if not data.get('observaciones', '').strip():
                raise serializers.ValidationError({'observaciones': 'Las observaciones son obligatorias'})
        
        return data