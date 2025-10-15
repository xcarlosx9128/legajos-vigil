from .models import RegistroEvento, Evento


def registrar(usuario_ejecutor, id_evento, usuario_afectado=None):
    """
    Registra un evento en el sistema
    
    Args:
        usuario_ejecutor: Usuario que realiza la acción
        id_evento: ID del evento (de la tabla Evento)
        usuario_afectado: Usuario afectado por la acción (opcional)
    
    Returns:
        RegistroEvento creado
    
    Ejemplo:
        from eventos.utils import registrar
        
        # Registrar que admin modificó datos de Juan
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5,
            usuario_afectado=usuario_juan
        )
    """
    try:
        evento = Evento.objects.get(id=id_evento)
        
        registro = RegistroEvento.objects.create(
            usuario_ejecutor=usuario_ejecutor,
            usuario_afectado=usuario_afectado,
            evento=evento
        )
        
        return registro
    
    except Evento.DoesNotExist:
        print(f"Error: Evento con ID {id_evento} no existe")
        return None