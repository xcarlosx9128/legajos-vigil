from django.contrib import admin
from .models import Area, Regimen, CondicionLaboral, Cargo, TipoDocumento


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


@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    list_display = ['numero', 'nombre', 'color_box', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion']
    ordering = ['numero']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero', 'nombre')
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
    
    def color_box(self, obj):
        """Muestra una cajita con el color del tipo"""
        from django.utils.html import format_html
        return format_html(
            '<div style="width: 50px; height: 20px; background-color: {}; border: 1px solid #ccc;"></div>',
            obj.color
        )
    color_box.short_description = 'Color'