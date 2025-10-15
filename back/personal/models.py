from django.db import models
from django.utils import timezone
from organizacion.models import Area, Regimen, CondicionLaboral

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
    cargo_actual = models.CharField(max_length=200, blank=True, null=True)
    fecha_ingreso = models.DateField(null=True, blank=True)
    
    # Control
    activo = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to='fotos_personal/', blank=True, null=True)
    
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
    TIPOS_DOCUMENTO = [
        ('DNI', 'DNI'),
        ('TITULO', 'Título Profesional'),
        ('CV', 'Curriculum Vitae'),
        ('CONTRATO', 'Contrato'),
        ('RESOLUCION', 'Resolución'),
        ('CERTIFICADO', 'Certificado'),
        ('DECLARACION', 'Declaración Jurada'),
        ('MEMORANDO', 'Memorando'),
        ('OTRO', 'Otro'),
    ]
    
    personal = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='legajos')
    tipo_documento = models.CharField(max_length=20, choices=TIPOS_DOCUMENTO)
    nombre_documento = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    archivo = models.FileField(upload_to='legajos/')
    numero_documento = models.CharField(max_length=100, blank=True, null=True)
    fecha_documento = models.DateField(null=True, blank=True)
    
    fecha_registro = models.DateTimeField(default=timezone.now)
    registrado_por = models.ForeignKey('usuarios.Usuario', on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'legajos'
        verbose_name = 'Documento de Legajo'
        verbose_name_plural = 'Documentos de Legajo'
        ordering = ['-fecha_registro']
    
    def __str__(self):
        return f"{self.personal.nombre_completo} - {self.nombre_documento}"