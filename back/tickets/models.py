# tickets/models.py

from django.db import models
from django.utils import timezone
from organizacion.models import Area
from usuarios.models import Usuario

class Ticket(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADO', 'Completado'),
    ]
    
    numero_ticket = models.CharField(max_length=20, unique=True, blank=True)
    
    # Datos de la persona
    nombre = models.CharField(max_length=200, default='Sin datos')
    apellido = models.CharField(max_length=200, default='Sin datos')
    persona_responsable = models.CharField(max_length=200, blank=True, default='')
    
    # Área
    area = models.ForeignKey(
        Area, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='tickets'
    )
    
    # Observaciones
    observaciones = models.TextField()
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    
    creado_por = models.ForeignKey(
        Usuario, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='tickets_creados'
    )
    
    class Meta:
        db_table = 'tickets'
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'
        ordering = ['-fecha_creacion']
    
    def save(self, *args, **kwargs):
        # Generar número de ticket si no existe
        if not self.numero_ticket:
            ultimo_ticket = Ticket.objects.order_by('-id').first()
            if ultimo_ticket and ultimo_ticket.numero_ticket:
                try:
                    ultimo_numero = int(ultimo_ticket.numero_ticket.split('-')[1])
                    self.numero_ticket = f'TICKET-{str(ultimo_numero + 1).zfill(6)}'
                except:
                    self.numero_ticket = 'TICKET-000001'
            else:
                self.numero_ticket = 'TICKET-000001'
        
        # Si el estado cambia a COMPLETADO, actualizar fecha_resolucion
        if self.pk:  # Si el ticket ya existe
            try:
                ticket_anterior = Ticket.objects.get(pk=self.pk)
                if ticket_anterior.estado != 'COMPLETADO' and self.estado == 'COMPLETADO':
                    self.fecha_resolucion = timezone.now()
            except Ticket.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.numero_ticket} - {self.nombre} {self.apellido}"