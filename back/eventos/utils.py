from .models import RegistroEvento, Evento


def registrar(usuario_ejecutor, id_evento, usuario_afectado=None, personal_afectado=None):
    """
    Registra un evento en el sistema
    
    Args:
        usuario_ejecutor: Usuario que realiza la acción
        id_evento: ID del evento (de la tabla Evento)
        usuario_afectado: Usuario afectado por la acción (opcional)
        personal_afectado: Personal afectado por la acción (opcional)
    
    Returns:
        RegistroEvento creado
    
    Ejemplos:
        from eventos.utils import registrar
        
        # Registrar que admin modificó datos de un usuario
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5,
            usuario_afectado=usuario_juan
        )
        
        # Registrar que admin editó el legajo de un personal
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5,
            personal_afectado=personal_maria
        )
        
        # Registrar que admin editó datos de un usuario y personal relacionado
        registrar(
            usuario_ejecutor=request.user,
            id_evento=5,
            usuario_afectado=usuario_juan,
            personal_afectado=personal_maria
        )
    """
    try:
        evento = Evento.objects.get(id=id_evento)
        
        registro = RegistroEvento.objects.create(
            usuario_ejecutor=usuario_ejecutor,
            usuario_afectado=usuario_afectado,
            personal_afectado=personal_afectado,  # ⭐ NUEVO
            evento=evento
        )
        
        # Log para debugging
        mensaje = f"✅ Evento registrado: {evento.nombre}"
        if usuario_afectado:
            mensaje += f" | Usuario afectado: {usuario_afectado.nombre_completo}"
        if personal_afectado:
            mensaje += f" | Personal afectado: {personal_afectado.nombre_completo}"
        print(mensaje)
        
        return registro
    
    except Evento.DoesNotExist:
        print(f"❌ Error: Evento con ID {id_evento} no existe")
        return None
    except Exception as e:
        print(f"❌ Error al registrar evento: {str(e)}")
        return None