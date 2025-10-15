from django.contrib import admin
from .models import Evento, RegistroEvento


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'descripcion']
    search_fields = ['nombre', 'descripcion']
    list_per_page = 50


@admin.register(RegistroEvento)
class RegistroEventoAdmin(admin.ModelAdmin):
    list_display = ['id', 'fecha_hora', 'usuario_ejecutor', 'evento', 'usuario_afectado']
    list_filter = ['evento', 'fecha_hora']
    search_fields = ['usuario_ejecutor__username', 'usuario_afectado__username', 'evento__nombre']
    date_hierarchy = 'fecha_hora'
    readonly_fields = ['usuario_ejecutor', 'evento', 'usuario_afectado', 'fecha_hora']
    list_per_page = 100
    
    def has_add_permission(self, request):
        # No permitir agregar manualmente desde el admin
        return False
    
    def has_change_permission(self, request, obj=None):
        # No permitir editar desde el admin
        return False