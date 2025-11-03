# organizacion/models.py - TIPOS DE DOCUMENTO GENERALES (SIMPLIFICADO)

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
# SECCIONES DE LEGAJO (9 secciones SIGELP)
# ============================================
class SeccionLegajo(models.Model):
    """
    Las 9 secciones principales del legajo SIGELP.
    """
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
        unique=True,
        help_text="Orden de visualización (debe ser único)"
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'secciones_legajo'
        verbose_name = 'Sección de Legajo'
        verbose_name_plural = 'Secciones de Legajo'
        ordering = ['orden']
    
    def __str__(self):
        return f"{self.orden}. {self.nombre}"
    
    def get_nombre_completo(self):
        """Retorna el nombre con el orden"""
        return f"{self.orden}. {self.nombre}"


# ============================================
# ⭐ TIPO DE DOCUMENTO - ULTRA SIMPLIFICADO
# ============================================
class TipoDocumento(models.Model):
    """
    Tipos de documento GENERALES - Versión ultra simplificada.
    
    Cualquier tipo puede agregarse a cualquier sección del legajo.
    Ya NO tiene: seccion, numero, es_obligatorio
    Solo tiene: nombre, descripcion, codigo, activo, orden
    
    Ejemplos:
    - Memorándum
    - Solicitud  
    - Oficio
    - Boleta de Pago
    - Certificado de Estudios
    - Contrato
    - Resolución
    - etc.
    """
    
    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre del tipo de documento (ej: Memorándum, Solicitud, Oficio)"
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción opcional del tipo de documento"
    )
    
    codigo = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Código opcional para identificar el tipo (ej: MEM, SOL, OF)"
    )
    
    activo = models.BooleanField(
        default=True,
        help_text="Si está desactivado, no aparecerá en los selectores"
    )
    
    orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización en los selectores (menor número = primero)"
    )
    
    fecha_creacion = models.DateTimeField(
        default=timezone.now,
        help_text="Fecha de creación del registro"
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        help_text="Última actualización del registro"
    )
    
    class Meta:
        db_table = 'tipos_documento'
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        ordering = ['orden', 'nombre']
        indexes = [
            models.Index(fields=['activo']),
            models.Index(fields=['nombre']),
            models.Index(fields=['orden']),
        ]
    
    def __str__(self):
        if self.codigo:
            return f"{self.codigo} - {self.nombre}"
        return self.nombre
    
    def get_nombre_completo(self):
        """Retorna el nombre completo con código si existe"""
        if self.codigo:
            return f"{self.codigo} - {self.nombre}"
        return self.nombre