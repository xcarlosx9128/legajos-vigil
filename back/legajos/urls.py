# legajos/urls.py (o tu archivo principal de URLs) - VERSIÓN ACTUALIZADA

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from usuarios.views import UsuarioViewSet
from organizacion.views import (
    AreaViewSet,
    RegimenViewSet,
    CondicionLaboralViewSet,
    CargoViewSet,
    TipoDocumentoViewSet  # NUEVO
)
from personal.views import PersonalViewSet, EscalafonViewSet, LegajoViewSet
from tickets.views import TicketViewSet
from eventos.views import EventoViewSet, RegistroEventoViewSet

# Router para las APIs
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'regimenes', RegimenViewSet, basename='regimen')
router.register(r'condiciones-laborales', CondicionLaboralViewSet, basename='condicion-laboral')
router.register(r'cargos', CargoViewSet, basename='cargo')
router.register(r'tipos-documento', TipoDocumentoViewSet, basename='tipo-documento')  # NUEVO
router.register(r'personal', PersonalViewSet, basename='personal')
router.register(r'escalafones', EscalafonViewSet, basename='escalafon')
router.register(r'legajos', LegajoViewSet, basename='legajo')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'registro-eventos', RegistroEventoViewSet, basename='registro-evento')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include(router.urls)),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)