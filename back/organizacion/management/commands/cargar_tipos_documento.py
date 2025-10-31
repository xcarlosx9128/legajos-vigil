# SCRIPT DE DATA MIGRATION - Copiar y pegar en tu archivo de migración
# Ruta: tu_app/migrations/XXXX_poblar_tipos_documento.py

from django.db import migrations

def crear_tipos_documento(apps, schema_editor):
    """
    Crea todos los tipos de documento generales (no ligados a secciones)
    """
    TipoDocumento = apps.get_model('tu_app', 'TipoDocumento')
    
    # Lista completa de tipos de documento
    tipos = [
        # Documentos personales y administrativos
        {"nombre": "Personales", "codigo": "PER", "orden": 1},
        {"nombre": "Estudios Realizados", "codigo": "EST", "orden": 2},
        {"nombre": "Experiencia Laboral", "codigo": "EXP", "orden": 3},
        {"nombre": "Ficha Escalafonaria de trabajador Municipal", "codigo": "FEM", "orden": 4},
        {"nombre": "Declaración Jurada de ingreso de Bienes y rentas", "codigo": "DJBR", "orden": 5},
        {"nombre": "Registro de estado Civil", "codigo": "REC", "orden": 6},
        {"nombre": "Sección de Nacimientos", "codigo": "NAC", "orden": 7},
        
        # Certificados
        {"nombre": "Certificado de Estudio", "codigo": "CE", "orden": 8},
        {"nombre": "Certificado de SALUD", "codigo": "CS", "orden": 9},
        {"nombre": "Certificados General", "codigo": "CG", "orden": 10},
        {"nombre": "Certificados de Estudios", "codigo": "CES", "orden": 11},
        {"nombre": "Certificado Domiciliario", "codigo": "CD", "orden": 12},
        {"nombre": "Certificado", "codigo": "CERT", "orden": 13},
        
        # Antecedentes
        {"nombre": "Antecedentes Penales y Judiciales", "codigo": "APJ", "orden": 14},
        {"nombre": "Antecedentes Policiales", "codigo": "AP", "orden": 15},
        
        # Declaraciones Juradas
        {"nombre": "Declaración Jurada de percibir otros ingresos en la administración pública", "codigo": "DJOI", "orden": 16},
        {"nombre": "Solicitud de Declaración Jurada", "codigo": "SDJ", "orden": 17},
        {"nombre": "Declaración Jurada", "codigo": "DJ", "orden": 18},
        
        # Registros y Fichas
        {"nombre": "Ficha registral de activos", "codigo": "FRA", "orden": 19},
        {"nombre": "Ficha Personal de Trabajador Municipal", "codigo": "FPTM", "orden": 20},
        {"nombre": "Ficha Individual del Evaluado", "codigo": "FIE", "orden": 21},
        {"nombre": "Hoja de Datos personales y Laborales", "codigo": "HDPL", "orden": 22},
        {"nombre": "Currículum Vitae", "codigo": "CV", "orden": 23},
        
        # Documentos administrativos
        {"nombre": "Memorándum", "codigo": "MEM", "orden": 24},
        {"nombre": "Hoja de Trámite", "codigo": "HT", "orden": 25},
        {"nombre": "Solicitud", "codigo": "SOL", "orden": 26},
        {"nombre": "Oficio", "codigo": "OF", "orden": 27},
        {"nombre": "Oficio Múltiple", "codigo": "OFM", "orden": 28},
        {"nombre": "Informe", "codigo": "INF", "orden": 29},
        
        # Resoluciones
        {"nombre": "Resolución", "codigo": "RES", "orden": 30},
        {"nombre": "Resolución de Alcaldía", "codigo": "RA", "orden": 31},
        {"nombre": "Resolución de Gerencia Administrativa", "codigo": "RGA", "orden": 32},
        {"nombre": "Resolución de Gerencia de Administración", "codigo": "RGAD", "orden": 33},
        
        # Boletas y Pagos
        {"nombre": "Boleta de Pago", "codigo": "BP", "orden": 34},
        {"nombre": "Boleta de Remuneraciones", "codigo": "BR", "orden": 35},
        
        # Constancias
        {"nombre": "Constancia de Haberes y Descuentos", "codigo": "CHD", "orden": 36},
        {"nombre": "Constancia de Trabajo", "codigo": "CT", "orden": 37},
        {"nombre": "División de Registro Civil Constancia de Defunción", "codigo": "DRCCD", "orden": 38},
        
        # Control y Asistencia
        {"nombre": "Acta de Constatación de Asistencia y Permanencia de Personal", "codigo": "ACAPP", "orden": 39},
        {"nombre": "Registro de Control", "codigo": "RC", "orden": 40},
        {"nombre": "Listado de Marcaciones", "codigo": "LM", "orden": 41},
        {"nombre": "Formulario de Control y Asistencia de Personal", "codigo": "FCAP", "orden": 42},
        
        # Contratos
        {"nombre": "Contrato de Servicios Personales", "codigo": "CSP", "orden": 43},
        {"nombre": "Contrato de Prestación de Servicios para el Personal de Proyectos", "codigo": "CPSPP", "orden": 44},
        {"nombre": "Contrato de Locación por Servicios Personales", "codigo": "CLSP", "orden": 45},
        {"nombre": "Contrato de Prestación de Servicios Personales", "codigo": "CPSP", "orden": 46},
        
        # Procesos y Evaluaciones
        {"nombre": "Hojas de Resultados (Nombramiento)", "codigo": "HRN", "orden": 47},
        {"nombre": "Acta de Entrevista Personal Proceso Final de Convocatoria", "codigo": "AEPPFC", "orden": 48},
        
        # Otros documentos
        {"nombre": "Carta de Despido", "codigo": "CDes", "orden": 49},
        {"nombre": "Liquidación de Beneficios Sociales", "codigo": "LBS", "orden": 50},
        {"nombre": "Adeudos y Responsabilidades y Descuentos Judiciales", "codigo": "ARDJ", "orden": 51},
        {"nombre": "Actividad Técnico Científica, Actividad Económica, Actividad Artística, Actividad Recreativa", "codigo": "ACT", "orden": 52},
        
        # Siempre al final
        {"nombre": "Otros", "codigo": "OTR", "orden": 999},
    ]
    
    # Crear cada tipo
    for tipo_data in tipos:
        TipoDocumento.objects.get_or_create(
            nombre=tipo_data["nombre"],
            defaults={
                'codigo': tipo_data.get("codigo", ""),
                'orden': tipo_data["orden"],
                'activo': True,
                'es_obligatorio': False,
                'descripcion': ""
            }
        )
    
    print(f"✅ Se crearon {len(tipos)} tipos de documento")


def eliminar_tipos_documento(apps, schema_editor):
    """
    Reversa: elimina todos los tipos creados
    """
    TipoDocumento = apps.get_model('tu_app', 'TipoDocumento')
    count = TipoDocumento.objects.count()
    TipoDocumento.objects.all().delete()
    print(f"❌ Se eliminaron {count} tipos de documento")


class Migration(migrations.Migration):
    """
    INSTRUCCIONES:
    1. Crea una migración vacía:
       python manage.py makemigrations --empty tu_app --name poblar_tipos_documento
    
    2. Copia este código en el archivo generado
    
    3. Reemplaza 'tu_app' con el nombre real de tu aplicación Django
    
    4. Asegúrate de que la dependencia apunte a la migración anterior:
       dependencies = [('tu_app', '0XXX_remove_tipodocumento_seccion')]
    
    5. Ejecuta: python manage.py migrate
    """
    
    dependencies = [
        # ⚠️ IMPORTANTE: Reemplazar con tu migración anterior
        ('tu_app', '0XXX_remove_tipodocumento_seccion'),
    ]

    operations = [
        migrations.RunPython(
            crear_tipos_documento,
            reverse_code=eliminar_tipos_documento
        ),
    ]