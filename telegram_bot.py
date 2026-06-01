import os
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

bot = telebot.TeleBot(TOKEN)

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
    
    markup = InlineKeyboardMarkup()
    btn_voy = InlineKeyboardButton("¡Voy para allá! 🚖", callback_data="voy_en_camino")
    markup.add(btn_voy)

    try:
        # Usamos parse_mode="Markdown" para que reconozca la negrita
        bot.send_message(chat_id=CHAT_ID, text=mensaje, parse_mode="Markdown", reply_markup=markup)
    except Exception as e:
        print(f"Error al enviar mensaje por Telegram: {e}")

@bot.callback_query_handler(func=lambda call: call.data == "voy_en_camino")
def callback_voy_en_camino(call):
    # Cuando un taxista hace clic en el botón
    conductor_nombre = call.from_user.first_name
    if call.from_user.last_name:
        conductor_nombre += f" {call.from_user.last_name}"
        
    # Mensaje actualizado (quitando el botón)
    mensaje_actualizado = call.message.text + f"\n\n✅ *Viaje tomado por:* {conductor_nombre} ya va en camino."
    
    try:
        bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=mensaje_actualizado,
            parse_mode="Markdown",
            reply_markup=None # Quitamos el botón
        )
        # Opcional: mostrar un "toast" o alerta flotante al conductor en su app de Telegram
        bot.answer_callback_query(call.id, "¡Gracias! Tu viaje ha sido confirmado.")
    except Exception as e:
        print(f"Error al editar el mensaje en Telegram: {e}")

def start_bot():
    print("Iniciando bot de Telegram en segundo plano...")
    # non_stop=True asegura que siga intentando conectar aunque falle la red
    bot.polling(non_stop=True)

if __name__ == "__main__":
    # Si ejecutamos este script directamente, iniciar el bot.
    # Pero usualmente será importado por app.py
    start_bot()