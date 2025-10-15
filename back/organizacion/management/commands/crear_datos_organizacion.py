# organizacion/management/commands/crear_datos_organizacion.py

from django.core.management.base import BaseCommand
from organizacion.models import Area, Regimen, CondicionLaboral


class Command(BaseCommand):
    help = 'Crea datos iniciales de Áreas, Regímenes y Condiciones Laborales'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando creación de datos...'))
        
        # Crear Áreas
        areas = [
            {'nombre': 'CONSEJO DE COORDINACIÓN LOCAL PROVINCIAL', 'codigo': 'CCLP'},
            {'nombre': 'JUNTA DE DELEGADOS VECINALES Y COMUNALES', 'codigo': 'JDVC'},
            {'nombre': 'COMITÉ PROVINCIAL DE SEGURIDAD CIUDADANA', 'codigo': 'CPSC'},
            {'nombre': 'PLATAFORMA PROVINCIAL DE DEFENSA CIVIL', 'codigo': 'PPDC'},
            {'nombre': 'COMITÉ DE ADMINISTRACIÓN DEL PROGRAMA DE VASO DE LECHE', 'codigo': 'CAPVL'},
            {'nombre': 'COMISIÓN AMBIENTAL MUNICIPAL', 'codigo': 'CAM'},
            {'nombre': 'ORGANO DE CONTROL INSTITUCIONAL', 'codigo': 'OCI'},
            {'nombre': 'PROCURADURÍA PÚBLICA MUNICIPAL', 'codigo': 'PPM'},
            {'nombre': 'UNIDAD DE ADMINISTRACIÓN DOCUMENTARIA Y ARCHIVO GENERAL', 'codigo': 'UADAG'},
            {'nombre': 'OFICINA DE COMUNICACIONES E IMAGEN INSTITUCIONAL', 'codigo': 'OCII'},
            {'nombre': 'GERENCIA DE PLANEAMIENTO Y ORGANIZACIÓN', 'codigo': 'GPO'},
            {'nombre': 'OFICINA DE ASESORÍA JURÍDICA', 'codigo': 'OAJ'},
            {'nombre': 'OFICINA DE COOPERACIÓN TÉCNICA', 'codigo': 'OCT'},
            {'nombre': 'SUB GERENCIA DE PLANEAMIENTO, PROGRAMACIÓN E INVERSIONES', 'codigo': 'SGPPI'},
            {'nombre': 'SUB GERENCIA DE PRESUPUESTO', 'codigo': 'SGP'},
            {'nombre': 'SUB GERENCIA DE RACIONALIZACIÓN Y ESTADÍSTICA', 'codigo': 'SGRE'},
            {'nombre': 'OFICINA DE SISTEMAS Y TECNOLOGÍAS DE LA INFORMACIÓN', 'codigo': 'OSTI'},
            {'nombre': 'GERENCIA DE ADMINISTRACIÓN Y FINANZAS', 'codigo': 'GAF'},
            {'nombre': 'SUB GERENCIA DE LOGISTICA Y CONTROL PATRIMONIAL', 'codigo': 'SGLCP'},
            {'nombre': 'SUB GERENCIA DE GESTIÓN DE RECURSOS HUMANOS', 'codigo': 'SGRRHH'},
            {'nombre': 'GERENCIA DE ACONDICIONAMIENTO TERRITORIAL', 'codigo': 'GAT'},
            {'nombre': 'SUB GERENCIA DE DESARROLLO Y PLANEAMIENTO URBANO', 'codigo': 'SGDPU'},
            {'nombre': 'SUB GERENCIA DE CATASTRO', 'codigo': 'SGC'},
            {'nombre': 'GERENCIA SANEAMIENTO, SALUBRIDAD Y SALUD AMBIENTAL', 'codigo': 'GSSSA'},
            {'nombre': 'SUB GERENCIA DE SANEAMIENTO', 'codigo': 'SGS'},
            {'nombre': 'SUB GERENCIA DE SALUBRIDAD Y SALUD AMBIENTAL', 'codigo': 'SGSSA'},
            {'nombre': 'GERENCIA DE OBRAS E INFRAESTRUCTURA', 'codigo': 'GOI'},
            {'nombre': 'SUB GERENCIA DE SUPERVISIÓN, EJECUCIÓN Y LIQUIDACIÓN DE OBRAS', 'codigo': 'SGSELO'},
            {'nombre': 'SUB GERENCIA DE ESTUDIOS Y PROYECTOS', 'codigo': 'SGEP'},
            {'nombre': 'SUB GERENCIA DE MAQUNARIA, EQUIPO, MANTENIMIENTO VIAL Y DE PLANTA', 'codigo': 'SGMEMVP'},
            {'nombre': 'GERENCIA DE TRÁNSITO Y TRANSPORTE PÚBLICO', 'codigo': 'GTT'},
            {'nombre': 'GERENCIA DE DESARROLLO SOCIAL', 'codigo': 'GDS'},
            {'nombre': 'SUB GERENCIA DE PROGRAMAS ALIMENTARIOS', 'codigo': 'SGPA'},
            {'nombre': 'SUB GERENCIA DE SALUD, PARTICIPACIÓN COMUNITARIA Y REGISTRO CIVIL', 'codigo': 'SGSPCRC'},
            {'nombre': 'SUB GERENCIA DE DEMUNA Y POBLACIONES VULNERABLES', 'codigo': 'SGDPV'},
            {'nombre': 'SUB GERENCIA DE EDUCACIÓN, DEPORTE Y JUVENTUD', 'codigo': 'SGEDJ'},
            {'nombre': 'GERENCIA DE PROMOCIÓN ECONOMICA', 'codigo': 'GPE'},
            {'nombre': 'SUB GERENCIA DE COMERCIALIZACIÓN', 'codigo': 'SGC2'},
            {'nombre': 'SUB GERENCIA DE PROMOCIÓN EMPRESARIAL Y DEL EMPLEO', 'codigo': 'SGPEE'},
            {'nombre': 'SUB GERENCIA DE PROMOCIÓN RURAL Y AGROPECUARIO', 'codigo': 'SGPRA'},
            {'nombre': 'SUB GERENCIA DE TURISMO, CULTURA Y ARTESANÍA', 'codigo': 'SGTCA'},
            {'nombre': 'GERENCIA DE SEGURIDAD CIUDADANA Y GESTIÓN DE RIESGO DE DESASTRES', 'codigo': 'GSCRD'},
            {'nombre': 'SUB GERENCIA DE SEGURIDAD CIUDADANA', 'codigo': 'SGSC'},
            {'nombre': 'SUB GERENCIA DE PREVENSIÓN DE RIESGO DESASTRES Y DEFENSA CIVIL', 'codigo': 'SGPRD'},
            {'nombre': 'MUNICIPALIDADES DE CENTROS POBLADOS', 'codigo': 'MCCP'},
            {'nombre': 'AGENCIAS MUNICIPALES', 'codigo': 'AM'},
        ]
        
        for area_data in areas:
            area, created = Area.objects.get_or_create(
                codigo=area_data['codigo'],
                defaults=area_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Área creada: {area.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'○ Área ya existe: {area.nombre}'))
        
        # Crear Regímenes
        regimenes = [
            {'nombre': 'Decreto Legislativo 276'},
            {'nombre': 'Decreto Legislativo 728'},
        ]
        
        for regimen_data in regimenes:
            regimen, created = Regimen.objects.get_or_create(
                nombre=regimen_data['nombre'],
                defaults=regimen_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Régimen creado: {regimen.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'○ Régimen ya existe: {regimen.nombre}'))
        
        # Crear Condiciones Laborales
        condiciones = [
            {'nombre': 'CESANTES FALLECIDOS'},
            {'nombre': 'PENSIONISTAS'},
            {'nombre': 'CESADOS LIMITE EDAD'},
            {'nombre': 'CESE JUDICIAL'},
            {'nombre': 'SERENAZGO GAF'},
            {'nombre': 'RENUNCIA'},
            {'nombre': 'SERENOS CESADOS'},
            {'nombre': 'ALCALDES Y REGIDORES'},
            {'nombre': 'DESTITUIDOS'},
            {'nombre': 'PERSONAL REINCORPORADO'},
            {'nombre': 'EX FUNCIONARIOS Y OTROS'},
            {'nombre': 'OBREROS PERMANENTES'},
            {'nombre': 'OBREROS CONTRATADOS'},
            {'nombre': 'CONTRATADOS CEDIF'},
            {'nombre': 'NOMBRADOS'},
            {'nombre': 'DISCPACITADOS'},
            {'nombre': 'CAS'},
            {'nombre': 'FUNCIONARIOS'},
        ]
        
        for condicion_data in condiciones:
            condicion, created = CondicionLaboral.objects.get_or_create(
                nombre=condicion_data['nombre'],
                defaults=condicion_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Condición creada: {condicion.nombre}'))
            else:
                self.stdout.write(self.style.WARNING(f'○ Condición ya existe: {condicion.nombre}'))
        
        self.stdout.write(self.style.SUCCESS('\n¡Proceso completado!'))
        self.stdout.write(self.style.SUCCESS(f'Áreas: {Area.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Regímenes: {Regimen.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Condiciones Laborales: {CondicionLaboral.objects.count()}'))