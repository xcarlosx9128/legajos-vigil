from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Permiso para administradores"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'ADMIN'

class IsSubgerente(permissions.BasePermission):
    """Permiso para subgerentes"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'SUBGERENTE'

class IsEncargado(permissions.BasePermission):
    """Permiso para encargados de archivo"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'ENCARGADO'

class IsCoordinador(permissions.BasePermission):
    """Permiso para coordinadores"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'COORDINADOR'

class IsAdminOrSubgerente(permissions.BasePermission):
    """Permiso para admin o subgerente"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol in ['ADMIN', 'SUBGERENTE']

class IsEncargadoOrCoordinador(permissions.BasePermission):
    """Permiso para encargado o coordinador"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol in ['ENCARGADO', 'COORDINADOR']

class CanManagePersonal(permissions.BasePermission):
    """Permiso para gestionar personal (encargado, coordinador, admin)"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol in ['ADMIN', 'ENCARGADO', 'COORDINADOR']

class CanGenerateTickets(permissions.BasePermission):
    """Solo coordinador puede generar tickets"""
    def has_permission(self, request, view):
        if view.action == 'create':
            return request.user and request.user.is_authenticated and request.user.rol == 'COORDINADOR'
        return request.user and request.user.is_authenticated