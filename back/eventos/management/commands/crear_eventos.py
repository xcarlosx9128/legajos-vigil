from django.core.management.base import BaseCommand
from eventos.models import Evento, RegistroEvento


class Command(BaseCommand):
    help = 'Crea los eventos del sistema (borra los anteriores)'

    def handle(self, *args, **kwargs):
        # Primero eliminar todos los eventos y registros existentes
        self.stdout.write(self.style.WARNING('Eliminando eventos anteriores...'))
        RegistroEvento.objects.all().delete()
        Evento.objects.all().delete()
        
        # Crear los nuevos eventos
        eventos = [
            (1, 'Modificación de Usuario', 'Se modificaron los datos de un usuario'),
            (2, 'Creación de Usuario', 'Se creó un nuevo usuario'),
            (3, 'Creación de Nuevo Personal', 'Se agregó un nuevo personal al sistema'),
            (4, 'Agregado de Documento al Legajo', 'Se agregó un documento al legajo'),
            (5, 'Modificación de Documento del Legajo', 'Se modificó un documento del legajo'),
            (6, 'Creación de Ticket', 'Se creó un nuevo ticket'),
            (7, 'Resolución de Ticket', 'Se resolvió un ticket'),
            (8, 'Modificación de Escalafón', 'Se modificó un escalafón'),
            (9, 'Desactivación de Usuario', 'Se desactivó un usuario'),
        ]
        
        creados = 0
        
        for id_evento, nombre, descripcion in eventos:
            evento = Evento.objects.create(
                id=id_evento,
                nombre=nombre,
                descripcion=descripcion
            )
            creados += 1
            self.stdout.write(self.style.SUCCESS(f'✓ Creado: ID {evento.id} - {nombre}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Proceso completado'))
        self.stdout.write(f'  Total de eventos creados: {creados}')