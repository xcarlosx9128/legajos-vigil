from django.db import models
from django.utils import timezone
from organizacion.models import Area, Regimen, CondicionLaboral, TipoDocumento, SeccionLegajo

class Personal(models.Model):
    # Datos personales
    dni = models.CharField(max_length=8, unique=True)
    nombres = models.CharField(max_length=200)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')], null=True, blank=True)
    
    # Contacto
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    
    # Datos laborales actuales
    area_actual = models.ForeignKey(Area, on_delete=models.PROTECT, related_name='personal_actual', null=True)
    regimen_actual = models.ForeignKey(Regimen, on_delete=models.PROTECT, related_name='personal_actual', null=True)
    condicion_actual = models.ForeignKey(CondicionLaboral, on_delete=models.PROTECT, related_name='personal_actual', null=True)
    cargo_actual = models.CharField(max_length=200, blank=True, null=True)  # ⭐ VARCHAR, no ForeignKey
    fecha_ingreso = models.DateField(null=True, blank=True)
    
    # Control
    activo = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)
    
    # Documento inicial (PDF)
    documento = models.FileField(upload_to='documentos_personal/', blank=False, null=False)
    
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'personal'
        verbose_name = 'Personal'
        verbose_name_plural = 'Personal'
        ordering = ['apellido_paterno', 'apellido_materno', 'nombres']
    
    def __str__(self):
        return f"{self.apellido_paterno} {self.apellido_materno}, {self.nombres} - DNI: {self.dni}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellido_paterno} {self.apellido_materno}"


class Escalafon(models.Model):
    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='escalafones')
    area = models.ForeignKey(Area, on_delete=models.PROTECT)
    regimen = models.ForeignKey(Regimen, on_delete=models.PROTECT)
    condicion_laboral = models.ForeignKey(CondicionLaboral, on_delete=models.PROTECT)
    cargo = models.CharField(max_length=200)
    
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    
    resolucion = models.CharField(max_length=100, blank=True, null=True)
    documento_resolucion = models.FileField(upload_to='resoluciones/', blank=True, null=True)
    
    observaciones = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'escalafones'
        verbose_name = 'Escalafón'
        verbose_name_plural = 'Escalafones'
        ordering = ['-fecha_inicio']
    
    def __str__(self):
        return f"{self.personal.nombre_completo} - {self.cargo} ({self.fecha_inicio})"


class Legajo(models.Model):
    """
    Modelo ULTRA SIMPLIFICADO de documentos del legajo.
    
    Solo 6 campos esenciales:
    1. personal - A quién pertenece
    2. seccion - En qué sección se guarda (1-9)
    3. tipo_documento - Qué tipo de documento es
    4. descripcion - Descripción opcional
    5. archivo - Ruta del PDF (500 caracteres)
    6. fecha_creacion - Cuándo se subió (ÚNICA FECHA)
    """
    
    personal = models.ForeignKey(
        Personal, 
        on_delete=models.CASCADE, 
        related_name='legajos',
        help_text="Personal al que pertenece el documento"
    )
    
    seccion = models.ForeignKey(
        SeccionLegajo,
        on_delete=models.PROTECT,
        related_name='documentos',
        help_text="Sección del legajo (1-9 según SIGELP)"
    )
    
    tipo_documento = models.ForeignKey(
        TipoDocumento, 
        on_delete=models.PROTECT,
        related_name='documentos',
        help_text="Tipo de documento"
    )
    
    descripcion = models.TextField(
        blank=True, 
        null=True,
        help_text="Descripción opcional del documento"
    )
    
    # ⭐ ARCHIVO CON 500 CARACTERES
    archivo = models.FileField(
        upload_to='legajos/%Y/%m/',
        max_length=500,
        help_text="Archivo PDF del documento"
    )
    
    # ⭐ SOLO UNA FECHA - Cuando se subió el archivo
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora en que se subió el documento (automático)"
    )
    
    # Usuario que subió el documento
    registrado_por = models.ForeignKey(
        'usuarios.Usuario', 
        on_delete=models.PROTECT,
        related_name='legajos_registrados',
        help_text="Usuario que subió el documento"
    )
    
    class Meta:
        db_table = 'legajos'
        verbose_name = 'Documento de Legajo'
        verbose_name_plural = 'Documentos de Legajo'
        ordering = ['-fecha_creacion']  # Más recientes primero
        indexes = [
            models.Index(fields=['personal', 'seccion']),
            models.Index(fields=['personal', 'tipo_documento']),
            models.Index(fields=['seccion']),
            models.Index(fields=['-fecha_creacion']),
        ]
    
    def __str__(self):
        return f"{self.personal.nombre_completo} - {self.seccion.nombre} - {self.tipo_documento.nombre}"
    
    def save(self, *args, **kwargs):
        # Validar que el archivo sea PDF
        if self.archivo:
            if not self.archivo.name.lower().endswith('.pdf'):
                raise ValueError("Solo se permiten archivos PDF")
        super().save(*args, **kwargs)