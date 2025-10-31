# organizacion/admin.py - SIMPLIFICADO

from django.contrib import admin
from .models import Area, Regimen, CondicionLaboral, Cargo, SeccionLegajo, TipoDocumento


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['id', 'codigo', 'nombre', 'descripcion', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'codigo', 'descripcion']
    ordering = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


@admin.register(Regimen)
class RegimenAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre',)
        }),
        ('Detalles', {
            'fields': ('descripcion', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion']


@admin.register(CondicionLaboral)
class CondicionLaboralAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre',)
        }),
        ('Detalles', {
            'fields': ('descripcion', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion']


@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre',)
        }),
        ('Detalles', {
            'fields': ('descripcion', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion']


@admin.register(SeccionLegajo)
class SeccionLegajoAdmin(admin.ModelAdmin):
    """Admin para las 9 secciones del legajo SIGELP"""
    list_display = ['numero', 'nombre', 'activo', 'orden', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['numero']
    list_editable = ['orden', 'activo']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero', 'nombre', 'orden')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'color', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


# ============================================
# ⭐ ADMIN: TIPO DE DOCUMENTO (ULTRA SIMPLIFICADO)
# ============================================

@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    """
    Admin SIMPLIFICADO para tipos de documentos generales.
    
    Ya NO tiene: seccion, numero, es_obligatorio
    Solo tiene: nombre, codigo, descripcion, activo, orden
    """
    list_display = ['nombre', 'codigo', 'orden', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'codigo', 'descripcion']
    ordering = ['orden', 'nombre']
    list_editable = ['orden', 'activo']
    list_display_links = ['nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'orden')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    # Acciones personalizadas
    actions = ['activar_tipos', 'desactivar_tipos']
    
    def activar_tipos(self, request, queryset):
        """Activa los tipos seleccionados"""
        updated = queryset.update(activo=True)
        self.message_user(request, f'{updated} tipos de documento activados.')
    activar_tipos.short_description = "✅ Activar tipos seleccionados"
    
    def desactivar_tipos(self, request, queryset):
        """Desactiva los tipos seleccionados"""
        updated = queryset.update(activo=False)
        self.message_user(request, f'{updated} tipos de documento desactivados.')
    desactivar_tipos.short_description = "❌ Desactivar tipos seleccionados"