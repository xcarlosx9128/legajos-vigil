# organizacion/models.py - VERSIÓN SIMPLIFICADA (SOLO 9 TIPOS)

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
# NUEVO MODELO: TIPO DE DOCUMENTO (9 TIPOS DEL SIGELP)
# ============================================
class TipoDocumento(models.Model):
    """
    Los 9 tipos de documentos del sistema SIGELP.
    Cada tipo representa una categoría de documentos del legajo.
    """
    numero = models.IntegerField(
        unique=True,
        help_text="Número del tipo (1-9)"
    )
    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre del tipo de documento"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción del tipo de documento"
    )
    color = models.CharField(
        max_length=20,
        default='#e0e0e0',
        help_text="Color para la UI (hexadecimal)"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el tipo está activo"
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tipos_documento'
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        ordering = ['numero']
    
    def __str__(self):
        return f"{self.numero}. {self.nombre}"
    
    def get_nombre_completo(self):
        """Retorna el nombre con el número"""
        return f"{self.numero}. {self.nombre}"