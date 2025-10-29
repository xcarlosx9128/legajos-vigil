# organizacion/management/commands/cargar_tipos_documento.py
# Ejecutar con: python manage.py cargar_tipos_documento

from django.core.management.base import BaseCommand
from organizacion.models import TipoDocumento


class Command(BaseCommand):
    help = 'Carga los 9 tipos de documentos del sistema SIGELP'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando carga de tipos de documentos...'))
        
        # Los 9 tipos de documentos del SIGELP
        tipos = [
            {
                'numero': 1,
                'nombre': 'Currículum Vitae Datos',
                'descripcion': 'Documentos relacionados con el currículum vitae y datos personales del trabajador',
                'color': '#1976d2'
            },
            {
                'numero': 2,
                'nombre': 'Documentos Personales y Familiares del Trabajador',
                'descripcion': 'Documentos de identificación personal y familiares',
                'color': '#388e3c'
            },
            {
                'numero': 3,
                'nombre': 'Documentos de Estudio y de Capacitación',
                'descripcion': 'Títulos, certificados, constancias de estudios y capacitaciones',
                'color': '#f57c00'
            },
            {
                'numero': 4,
                'nombre': 'Documentos de la Carrera Laboral',
                'descripcion': 'Resoluciones, memorándums y documentos de la trayectoria laboral',
                'color': '#d32f2f'
            },
            {
                'numero': 5,
                'nombre': 'Documentos del Comportamiento Laboral',
                'descripcion': 'Documentos relacionados con el desempeño y comportamiento laboral',
                'color': '#7b1fa2'
            },
            {
                'numero': 6,
                'nombre': 'Documentos Sobre Derechos Económicos',
                'descripcion': 'Documentos relacionados con beneficios y derechos económicos',
                'color': '#0288d1'
            },
            {
                'numero': 7,
                'nombre': 'Documentos sobre Obligaciones Económicas',
                'descripcion': 'Documentos relacionados con obligaciones y descuentos económicos',
                'color': '#c2185b'
            },
            {
                'numero': 8,
                'nombre': 'Documentos Sobre Producción Cultural',
                'descripcion': 'Documentos de actividades culturales y producción intelectual',
                'color': '#00796b'
            },
            {
                'numero': 9,
                'nombre': 'Documentos Varios',
                'descripcion': 'Otros documentos no clasificados en las categorías anteriores',
                'color': '#616161'
            }
        ]
        
        creados = 0
        actualizados = 0
        
        for tipo_data in tipos:
            tipo, created = TipoDocumento.objects.update_or_create(
                numero=tipo_data['numero'],
                defaults={
                    'nombre': tipo_data['nombre'],
                    'descripcion': tipo_data['descripcion'],
                    'color': tipo_data['color'],
                    'activo': True
                }
            )
            
            if created:
                creados += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Creado: {tipo.numero}. {tipo.nombre}')
                )
            else:
                actualizados += 1
                self.stdout.write(
                    self.style.WARNING(f'○ Actualizado: {tipo.numero}. {tipo.nombre}')
                )
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Proceso completado'))
        self.stdout.write(f'  Creados: {creados}')
        self.stdout.write(f'  Actualizados: {actualizados}')
        self.stdout.write(f'  Total: {creados + actualizados}')