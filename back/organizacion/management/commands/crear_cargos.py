# organizacion/management/commands/crear_cargos.py

from django.core.management.base import BaseCommand
from organizacion.models import Cargo


class Command(BaseCommand):
    help = 'Crea los cargos iniciales del sistema'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando creación de cargos...'))
        
        cargos = [
            'Alcalde Provincial', 'Gerente Municipal', 'Asesor Legal', 'Secretario General',
            'Jefe de la Oficina de Imagen Institucional', 'Jefe de la Oficina de Planificación y Presupuesto',
            'Jefe de la Oficina de Racionalización y Estadística', 'Jefe de la Oficina de Cooperación Técnica Internacional',
            'Gerente de Administración', 'Subgerente de Logística', 'Subgerente de Recursos Humanos',
            'Subgerente de Tesorería', 'Subgerente de Contabilidad', 'Subgerente de Control Patrimonial',
            'Jefe de Almacén', 'Técnico Administrativo', 'Técnico en Control Patrimonial', 'Contador',
            'Cajero', 'Secretaria de Área', 'Auxiliar Administrativo', 'Asistente de Contabilidad',
            'Operador de Equipo de Cómputo', 'Conserje', 'Gerente de Rentas', 'Subgerente de Administración Tributaria',
            'Subgerente de Fiscalización Tributaria', 'Inspector Tributario', 'Recaudador', 'Notificador Tributario',
            'Secretaria de Subgerencia', 'Jefe de la Oficina de Sistemas y Tecnologías de la Información',
            'Analista de Sistemas', 'Programador de Sistemas', 'Técnico de Soporte Informático',
            'Operador de Computadora', 'Especialista en Redes y Comunicaciones', 'Asistente Administrativo',
            'Gerente de Obras e Infraestructura', 'Subgerente de Obras', 'Subgerente de Mantenimiento Vial',
            'Ingeniero Civil', 'Ingeniero de Obras de Construcción Civil', 'Técnico en Construcción Civil',
            'Dibujante', 'Topógrafo', 'Coordinador de Taller', 'Mecánico', 'Soldador', 'Electro Mecánico',
            'Ayudante de Taller', 'Almacenero', 'Auxiliar de Almacén', 'Chofer', 'Ayudante de Maquinaria Pesada',
            'Operador de Maquinaria Pesada', 'Guardián', 'Gerente de Saneamiento y Salud Ambiental',
            'Subgerente de Saneamiento', 'Subgerente de Salud Ambiental', 'Biólogo', 'Especialista en Salud Ambiental',
            'Inspector Sanitario', 'Supervisor de Limpieza', 'Controlador del Relleno Sanitario', 'Barredor de Calle',
            'Coordinador de Sección de Salubridad', 'Coordinador de Sección Parques y Áreas Verdes',
            'Técnico Agropecuario', 'Auxiliar Agropecuario', 'Jardinero', 'Ayudante de Jardinería',
            'Trabajador de Limpieza', 'Vigilante', 'Gerente de Tránsito y Transporte Público',
            'Subgerente de Control de Transporte', 'Subgerente de Educación Vial', 'Coordinador de Educación Vial',
            'Internador de Vehículos', 'Inspector de Transporte', 'Gerente de Desarrollo Social',
            'Jefe de la División de Alimentación y Nutrición', 'Jefe de la División del Vaso de Leche',
            'Jefe de la División de Defensoría del Niño, Adolescente, Mujer y Discapacitados',
            'Jefe de la División de Desarrollo Humano', 'Jefe de la División de Participación Comunitaria',
            'Abogado', 'Psicólogo', 'Nutricionista', 'Especialista Administrativo', 'Promotor Social',
            'Almacenero Kardista', 'Gerente de Servicios Municipales', 'Subgerente de Limpieza Pública',
            'Subgerente de Parques y Jardines', 'Supervisor de Limpieza Pública', 'Obrero de Limpieza Pública',
            'Chofer de Recolector', 'Vigilante de Piscina', 'Subgerente de Seguridad Ciudadana',
            'Jefe de la División de Serenazgo y Vigilancia Municipal', 'Coordinador de Serenazgo', 'Mayor PM',
            'Asistente Social', 'Asistente de Personal', 'Vigilante de Seguridad', 'Notificador',
            'Promotor de Programas Municipales'
        ]
        
        for nombre_cargo in cargos:
            cargo, created = Cargo.objects.get_or_create(
                nombre=nombre_cargo,
                defaults={'nombre': nombre_cargo}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Cargo creado: {cargo.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'○ Cargo ya existe: {cargo.nombre}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n¡Proceso completado! Total de cargos: {Cargo.objects.count()}'))