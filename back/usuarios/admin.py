from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ['username', 'email', 'nombre_completo', 'rol', 'is_active', 'fecha_creacion']
    list_filter = ['rol', 'is_active', 'is_staff', 'fecha_creacion']
    search_fields = ['username', 'email', 'nombres', 'apellidos', 'dni']
    ordering = ['-fecha_creacion']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('nombres', 'apellidos', 'dni', 'email', 'telefono')}),
        ('Permisos', {'fields': ('rol', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login', 'fecha_creacion')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'nombres', 'apellidos', 'dni', 'rol', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['fecha_creacion', 'last_login']