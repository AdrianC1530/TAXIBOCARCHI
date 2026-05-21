import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def enviar_alerta(cantidad_personas):
    if cantidad_personas >= 4:
        emoji = "🔴"
        titulo = "¡TAXI REQUERIDO URGENTE!"
        estado = "¡Llenando cupo! Se necesita un taxi de inmediato."
    else:  # Caso preventivo (3 personas)
        emoji = "🟡"
        titulo = "ALERTA PREVENTIVA"
        estado = "Se está formando un grupo. ¡Acércate a la parada!"
        
    mensaje = (
        f"{emoji} *{titulo}*\n\n"
        f"👥 Pasajeros esperando: *{cantidad_personas}*\n"
        f"📍 Parada: Sector monitoreado\n"
        f"🚖 Acción: {estado}"
    )
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": mensaje,
        "parse_mode": "Markdown"
    }
    response = requests.post(url, json=payload)
    return response.json()