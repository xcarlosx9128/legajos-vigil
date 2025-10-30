# organizacion/management/commands/cargar_tipos_documento.py

from django.core.management.base import BaseCommand
from organizacion.models import SeccionLegajo, TipoDocumento


class Command(BaseCommand):
    help = 'Carga las 9 secciones del legajo SIGELP y todos sus tipos de documentos (64 tipos)'

    def handle(self, *args, **kwargs):
        self.stdout.write("="*80)
        self.stdout.write(self.style.SUCCESS("CARGANDO SECCIONES Y TIPOS DE DOCUMENTOS DEL LEGAJO SIGELP"))
        self.stdout.write("="*80)
        
        secciones_data = [
            {
                'numero': 1,
                'nombre': 'Currículo Vitae Datos',
                'descripcion': 'Información personal, académica y laboral del trabajador',
                'color': '#2196F3',
                'tipos': [
                    {'numero': 1, 'nombre': 'Datos Personales', 'obligatorio': True},
                    {'numero': 2, 'nombre': 'Estudios Realizados', 'obligatorio': True},
                    {'numero': 3, 'nombre': 'Experiencia Laboral', 'obligatorio': True},
                    {'numero': 4, 'nombre': 'Ficha Escalafonaria de trabajador Municipal', 'obligatorio': False},
                ]
            },
            {
                'numero': 2,
                'nombre': 'Documentos Personales y Familiares del Trabajador',
                'descripcion': 'Documentación personal y familiar requerida',
                'color': '#4CAF50',
                'tipos': [
                    {'numero': 1, 'nombre': 'Declaración Jurada de ingreso de Bienes y rentas', 'obligatorio': True},
                    {'numero': 2, 'nombre': 'Registro de estado Civil', 'obligatorio': True},
                    {'numero': 3, 'nombre': 'Sección de Nacimientos', 'obligatorio': True},
                    {'numero': 4, 'nombre': 'Certificado de Estudio', 'obligatorio': True},
                    {'numero': 5, 'nombre': 'Certificado de SALUD', 'obligatorio': True},
                    {'numero': 6, 'nombre': 'Antecedentes Penales y Judiciales', 'obligatorio': True},
                    {'numero': 7, 'nombre': 'Antecedentes Policiales', 'obligatorio': True},
                    {'numero': 8, 'nombre': 'Declaración Jurada de percibir otros ingresos en la administración pública', 'obligatorio': True},
                    {'numero': 9, 'nombre': 'Certificado Domiciliario', 'obligatorio': False},
                    {'numero': 10, 'nombre': 'Ficha registral de activos', 'obligatorio': False},
                ]
            },
            {
                'numero': 3,
                'nombre': 'Documentos de Estudio y de Capacitación',
                'descripcion': 'Certificados y constancias de estudios y capacitaciones',
                'color': '#FF9800',
                'tipos': [
                    {'numero': 1, 'nombre': 'Certificados General', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Certificados de Estudios', 'obligatorio': True},
                ]
            },
            {
                'numero': 4,
                'nombre': 'Documentos de la Carrera Laboral',
                'descripcion': 'Documentación relacionada con la carrera y desarrollo laboral',
                'color': '#9C27B0',
                'tipos': [
                    {'numero': 1, 'nombre': 'Memorándum', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Hoja de Trámite', 'obligatorio': False},
                    {'numero': 3, 'nombre': 'Solicitud', 'obligatorio': False},
                    {'numero': 4, 'nombre': 'Boleta de Pago', 'obligatorio': False},
                    {'numero': 5, 'nombre': 'Resolución', 'obligatorio': False},
                    {'numero': 6, 'nombre': 'Oficio', 'obligatorio': False},
                    {'numero': 7, 'nombre': 'Informe', 'obligatorio': False},
                    {'numero': 8, 'nombre': 'Acta de Constatación de Asistencia y Permanencia de Personal', 'obligatorio': False},
                    {'numero': 9, 'nombre': 'Registro de Control', 'obligatorio': False},
                    {'numero': 10, 'nombre': 'Constancia de Haberes y Descuentos', 'obligatorio': False},
                    {'numero': 11, 'nombre': 'Constancia de Trabajo', 'obligatorio': False},
                    {'numero': 12, 'nombre': 'Resolución de Alcaldía', 'obligatorio': False},
                    {'numero': 13, 'nombre': 'Resolución de Gerencia Administrativa', 'obligatorio': False},
                    {'numero': 14, 'nombre': 'División de Registro Civil Constancia de Defunción', 'obligatorio': False},
                    {'numero': 15, 'nombre': 'Listado de Marcaciones', 'obligatorio': False},
                    {'numero': 16, 'nombre': 'Boleta de Remuneraciones', 'obligatorio': False},
                    {'numero': 17, 'nombre': 'Carta de Despido', 'obligatorio': False},
                    {'numero': 18, 'nombre': 'Oficio Múltiple', 'obligatorio': False},
                    {'numero': 19, 'nombre': 'Liquidación de Beneficios Sociales', 'obligatorio': False},
                    {'numero': 20, 'nombre': 'Certificado', 'obligatorio': False},
                    {'numero': 21, 'nombre': 'Contrato de Servicios Personales', 'obligatorio': False},
                    {'numero': 22, 'nombre': 'Contrato de Prestación de Servicios para el Personal de Proyectos', 'obligatorio': False},
                    {'numero': 23, 'nombre': 'Contrato de Locación por Servicios Personales', 'obligatorio': False},
                    {'numero': 24, 'nombre': 'Contrato de Prestación de Servicios Personales', 'obligatorio': False},
                    {'numero': 25, 'nombre': 'Hoja de Datos personales y Laborales', 'obligatorio': False},
                    {'numero': 26, 'nombre': 'Currículum Vitae', 'obligatorio': False},
                    {'numero': 27, 'nombre': 'Ficha Personal de Trabajador Municipal', 'obligatorio': False},
                    {'numero': 28, 'nombre': 'Ficha Individual del Evaluado', 'obligatorio': False},
                ]
            },
            {
                'numero': 5,
                'nombre': 'Documentos del Comportamiento Laboral',
                'descripcion': 'Documentos relacionados con la evaluación y comportamiento laboral',
                'color': '#F44336',
                'tipos': [
                    {'numero': 1, 'nombre': 'Informe', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Oficio', 'obligatorio': False},
                    {'numero': 3, 'nombre': 'Hojas de Resultados (Nombramiento)', 'obligatorio': False},
                    {'numero': 4, 'nombre': 'Acta de Entrevista Personal Proceso Final de Convocatoria', 'obligatorio': False},
                    {'numero': 5, 'nombre': 'Solicitud de Declaración Jurada', 'obligatorio': False},
                    {'numero': 6, 'nombre': 'Declaración Jurada', 'obligatorio': False},
                    {'numero': 7, 'nombre': 'Oficio Múltiple', 'obligatorio': False},
                    {'numero': 8, 'nombre': 'Resolución', 'obligatorio': False},
                    {'numero': 9, 'nombre': 'Memorándum', 'obligatorio': False},
                    {'numero': 10, 'nombre': 'Formulario de Control y Asistencia de Personal', 'obligatorio': False},
                ]
            },
            {
                'numero': 6,
                'nombre': 'Documentos Sobre Derechos Económicos',
                'descripcion': 'Documentos relacionados con beneficios y derechos económicos',
                'color': '#00BCD4',
                'tipos': [
                    {'numero': 1, 'nombre': 'Oficio', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Resolución de Gerencia de Administración', 'obligatorio': False},
                ]
            },
            {
                'numero': 7,
                'nombre': 'Documentos sobre Obligaciones Económicas',
                'descripcion': 'Adeudos, responsabilidades y descuentos judiciales',
                'color': '#795548',
                'tipos': [
                    {'numero': 1, 'nombre': 'Adeudos y Responsabilidades y Descuentos Judiciales', 'obligatorio': False},
                ]
            },
            {
                'numero': 8,
                'nombre': 'Documentos Sobre Producción Cultural',
                'descripcion': 'Actividades técnicas, científicas, económicas, artísticas y recreativas',
                'color': '#E91E63',
                'tipos': [
                    {'numero': 1, 'nombre': 'Actividad Técnico Científica', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Actividad Económica', 'obligatorio': False},
                    {'numero': 3, 'nombre': 'Actividad Artística', 'obligatorio': False},
                    {'numero': 4, 'nombre': 'Actividad Recreativa', 'obligatorio': False},
                ]
            },
            {
                'numero': 9,
                'nombre': 'Documentos Varios',
                'descripcion': 'Otros documentos no clasificados en las secciones anteriores',
                'color': '#607D8B',
                'tipos': [
                    {'numero': 1, 'nombre': 'Hoja de Trámite', 'obligatorio': False},
                    {'numero': 2, 'nombre': 'Solicitud', 'obligatorio': False},
                    {'numero': 3, 'nombre': 'Otros', 'obligatorio': False},
                ]
            },
        ]
        
        total_secciones = 0
        total_tipos = 0
        
        for seccion_data in secciones_data:
            seccion, created = SeccionLegajo.objects.update_or_create(
                numero=seccion_data['numero'],
                defaults={
                    'nombre': seccion_data['nombre'],
                    'descripcion': seccion_data['descripcion'],
                    'color': seccion_data['color'],
                    'orden': seccion_data['numero'],
                    'activo': True
                }
            )
            
            action = "✓ CREADA" if created else "↻ ACTUALIZADA"
            self.stdout.write(f"\n{action}: Sección {seccion.numero}. {seccion.nombre}")
            self.stdout.write(f"  Color: {seccion.color}")
            total_secciones += 1
            
            for tipo_data in seccion_data['tipos']:
                codigo = f"{seccion.numero}.{tipo_data['numero']}"
                
                tipo, tipo_created = TipoDocumento.objects.update_or_create(
                    codigo=codigo,
                    defaults={
                        'seccion': seccion,
                        'numero': tipo_data['numero'],
                        'nombre': tipo_data['nombre'],
                        'es_obligatorio': tipo_data.get('obligatorio', False),
                        'orden': tipo_data['numero'],
                        'activo': True
                    }
                )
                
                tipo_action = "  ✓ Creado" if tipo_created else "  ↻ Actualizado"
                obligatorio_text = " [OBLIGATORIO]" if tipo.es_obligatorio else ""
                self.stdout.write(f"    {tipo_action}: {tipo.codigo} - {tipo.nombre}{obligatorio_text}")
                total_tipos += 1
        
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS(f"✅ CARGA COMPLETADA EXITOSAMENTE"))
        self.stdout.write(f"   Total secciones: {total_secciones}")
        self.stdout.write(f"   Total tipos de documentos: {total_tipos}")
        self.stdout.write("="*80)
        
        self.stdout.write("\n📊 RESUMEN POR SECCIÓN:")
        self.stdout.write("-" * 80)
        for seccion in SeccionLegajo.objects.all().order_by('numero'):
            count = seccion.tipos_documento.count()
            obligatorios = seccion.tipos_documento.filter(es_obligatorio=True).count()
            self.stdout.write(f"{seccion.numero}. {seccion.nombre:50s} | Total: {count:2d} | Obligatorios: {obligatorios:2d}")
        self.stdout.write("-" * 80)