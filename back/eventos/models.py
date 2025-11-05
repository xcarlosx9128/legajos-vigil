from django.db import models
from django.utils import timezone
from usuarios.models import Usuario


class Evento(models.Model):
    """
    Catálogo de eventos del sistema
    """
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'eventos'
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
    
    def __str__(self):
        return self.nombre


class RegistroEvento(models.Model):
    """
    Registro de todas las acciones del sistema
    """
    # Usuario que ejecuta la acción
    usuario_ejecutor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='eventos_ejecutados',
        help_text='Usuario que realizó la acción'
    )
    
    # Usuario afectado (opcional - solo si aplica)
    usuario_afectado = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='eventos_recibidos',
        null=True,
        blank=True,
        help_text='Usuario sobre el que se realizó la acción'
    )
    
    # ⭐ NUEVO: Personal afectado (opcional - cuando la acción es sobre un personal)
    personal_afectado = models.ForeignKey(
        'personal.Personal',
        on_delete=models.CASCADE,
        related_name='eventos_personal',
        null=True,
        blank=True,
        help_text='Personal sobre el que se realizó la acción'
    )
    
    # Tipo de evento
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name='registros'
    )
    
    # Timestamp
    fecha_hora = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'registro_eventos'
        verbose_name = 'Registro de Evento'
        verbose_name_plural = 'Registros de Eventos'
        ordering = ['-fecha_hora']
        indexes = [
            models.Index(fields=['-fecha_hora']),
            models.Index(fields=['usuario_ejecutor', '-fecha_hora']),
            models.Index(fields=['personal_afectado', '-fecha_hora']),
        ]
    
    def __str__(self):
        return f"{self.usuario_ejecutor.username} - {self.evento.nombre} - {self.fecha_hora}"