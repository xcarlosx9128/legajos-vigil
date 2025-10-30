# organizacion/models.py - CON SECCIONES Y TIPOS DE DOCUMENTOS

from django.db import models
from django.utils import timezone


class Area(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    codigo = models.CharField(max_length=20, unique=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'areas'
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Regimen(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'regimenes'
        verbose_name = 'Régimen'
        verbose_name_plural = 'Regímenes'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class CondicionLaboral(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'condiciones_laborales'
        verbose_name = 'Condición Laboral'
        verbose_name_plural = 'Condiciones Laborales'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Cargo(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'cargos'
        verbose_name = 'Cargo'
        verbose_name_plural = 'Cargos'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


# ============================================
# NUEVO MODELO: SECCION DE LEGAJO (9 SECCIONES PRINCIPALES)
# ============================================
class SeccionLegajo(models.Model):
    """
    Las 9 secciones principales del legajo SIGELP.
    Ejemplo:
    - 1. Currículo Vitae Datos
    - 2. Documentos Personales y Familiares del Trabajador
    - 3. Documentos de Estudio y de Capacitación
    - etc.
    """
    numero = models.IntegerField(
        unique=True,
        help_text="Número de la sección (1-9)"
    )
    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre de la sección"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción de la sección"
    )
    color = models.CharField(
        max_length=20,
        default='#1976d2',
        help_text="Color para la UI (hexadecimal)"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la sección está activa"
    )
    orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización"
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'secciones_legajo'
        verbose_name = 'Sección de Legajo'
        verbose_name_plural = 'Secciones de Legajo'
        ordering = ['numero']
    
    def __str__(self):
        return f"{self.numero}. {self.nombre}"
    
    def get_nombre_completo(self):
        """Retorna el nombre con el número"""
        return f"{self.numero}. {self.nombre}"


# ============================================
# MODELO ACTUALIZADO: TIPO DE DOCUMENTO (SUBTIPOS DENTRO DE CADA SECCIÓN)
# ============================================
class TipoDocumento(models.Model):
    """
    Los tipos de documentos dentro de cada sección del legajo.
    Ejemplo para Sección 1 (Currículo Vitae):
    - 1.1 Datos Personales
    - 1.2 Estudios Realizados
    - 1.3 Experiencia Laboral
    - 1.4 Ficha Escalafonaria de trabajador Municipal
    """
    seccion = models.ForeignKey(
        SeccionLegajo,
        on_delete=models.CASCADE,
        related_name='tipos_documento',
        help_text="Sección a la que pertenece este tipo"
    )
    numero = models.IntegerField(
        help_text="Número del subtipo dentro de la sección (ej: 1, 2, 3 para 1.1, 1.2, 1.3)"
    )
    codigo = models.CharField(
        max_length=10,
        unique=True,
        help_text="Código único del tipo (ej: '1.1', '2.3', '4.15')"
    )
    nombre = models.CharField(
        max_length=200,
        help_text="Nombre del tipo de documento"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción del tipo de documento"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el tipo está activo"
    )
    es_obligatorio = models.BooleanField(
        default=False,
        help_text="Indica si es un documento obligatorio"
    )
    orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización dentro de la sección"
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tipos_documento'
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        ordering = ['seccion__numero', 'numero']
        unique_together = [['seccion', 'numero']]
    
    def __str__(self):
        return f"{self.codigo} {self.nombre}"
    
    def get_nombre_completo(self):
        """Retorna el nombre con el código"""
        return f"{self.codigo} {self.nombre}"
    
    def save(self, *args, **kwargs):
        # Generar código automáticamente si no existe
        if not self.codigo and self.seccion:
            self.codigo = f"{self.seccion.numero}.{self.numero}"
        super().save(*args, **kwargs)