from flask import Flask, request, jsonify
from flask_cors import CORS
from telegram_bot import enviar_alerta
from dotenv import load_dotenv
from datetime import datetime
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

load_dotenv()

# Inicializar Firebase
try:
    cred = credentials.Certificate("firebase_credentials.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Conectado a Firebase Firestore")
except Exception as e:
    print(f"Error al conectar con Firebase: {e}")
    db = None

app = Flask(__name__)
CORS(app)

UMBRAL_DEFINITIVO = int(os.getenv("UMBRAL_PERSONAS", 4))
UMBRAL_PREVENTIVO = 3 # A las 3 personas avisamos que se acerquen

# Historial en memoria y control anti-spam
registros = []
ultima_alerta = datetime.min
TIEMPO_ESPERA_SEGUNDOS = 60 # Esperar 1 minuto antes de enviar otra alerta igual
ultima_cantidad = -1
ultima_vez_guardado = datetime.min
TIEMPO_GUARDADO_NORMAL = 15 # Guardar en Firebase máximo cada 15 seg si no hay cambios

@app.route("/deteccion", methods=["POST"])
def recibir_deteccion():
    global UMBRAL_DEFINITIVO, UMBRAL_PREVENTIVO, TIEMPO_ESPERA_SEGUNDOS
    
    # Intentar leer configuración en tiempo real desde Firebase
    if db is not None:
        try:
            cfg_doc = db.collection("configuracion").document("actual").get()
            if cfg_doc.exists:
                cfg_data = cfg_doc.to_dict()
                UMBRAL_DEFINITIVO = int(cfg_data.get("umbral_definitivo", UMBRAL_DEFINITIVO))
                UMBRAL_PREVENTIVO = int(cfg_data.get("umbral_preventivo", UMBRAL_PREVENTIVO))
                TIEMPO_ESPERA_SEGUNDOS = int(cfg_data.get("tiempo_espera_segundos", TIEMPO_ESPERA_SEGUNDOS))
        except Exception as e:
            print(f"Error cargando config dinamica: {e}")

    datos = request.get_json()
    
    if not datos or "personas" not in datos:
        return jsonify({"error": "Datos inválidos"}), 400
    
    cantidad = datos["personas"]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Lógica de Alertas
    global ultima_alerta
    ahora = datetime.now()
    alerta_enviada = False
    estado_alerta = "Normal"
    anti_spam_activo = False
    
    if cantidad >= UMBRAL_DEFINITIVO:
        estado_alerta = "Urgente"
    elif cantidad >= UMBRAL_PREVENTIVO:
        estado_alerta = "Preventiva"
    
    if cantidad >= UMBRAL_PREVENTIVO:
        tiempo_transcurrido = (ahora - ultima_alerta).total_seconds()
        
        if tiempo_transcurrido >= TIEMPO_ESPERA_SEGUNDOS:
            enviar_alerta(cantidad)
            ultima_alerta = ahora
            alerta_enviada = True
            print(f"Alerta enviada a Telegram (Pasajeros: {cantidad})")
        else:
            anti_spam_activo = True
            print(f"Alerta omitida temporalmente (Sistema anti-spam activo)")
            
    global ultima_cantidad, ultima_vez_guardado
    
    guardar_registro = False
    
    # Guardamos si hay un cambio en la cantidad, si se envió alerta o si pasó el tiempo normal
    if cantidad != ultima_cantidad:
        guardar_registro = True
    elif alerta_enviada:
        guardar_registro = True
    elif (ahora - ultima_vez_guardado).total_seconds() >= TIEMPO_GUARDADO_NORMAL:
        guardar_registro = True

    if guardar_registro:
        ultima_cantidad = cantidad
        ultima_vez_guardado = ahora
        
        # Guardar registro en memoria local
        registros.append({
            "timestamp": timestamp,
            "personas": cantidad,
            "alerta_enviada": alerta_enviada,
            "estado_alerta": estado_alerta
        })
        
        # Guardar registro en Firebase Firestore
        if db is not None:
            try:
                db.collection("detecciones").add({
                    "timestamp": timestamp,
                    "personas": cantidad,
                    "alerta_enviada": alerta_enviada,
                    "estado_alerta": estado_alerta,
                    "anti_spam_activo": anti_spam_activo,
                    "fecha_hora": firestore.SERVER_TIMESTAMP
                })
                print(f"Registro guardado exitosamente en Firebase (Pasajeros: {cantidad})")
            except Exception as e:
                print(f"Error al guardar en Firebase: {e}")
    
    return jsonify({
        "status": "ok",
        "personas": cantidad,
        "alerta_enviada": alerta_enviada
    }), 200

@app.route("/historial", methods=["GET"])
def ver_historial():
    return jsonify(registros), 200

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "servidor activo"}), 200

import threading
from telegram_bot import start_bot

if __name__ == "__main__":
    # Iniciar el bot de Telegram en un hilo separado
    bot_thread = threading.Thread(target=start_bot, daemon=True)
    bot_thread.start()
    
    # Iniciar el servidor Flask
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)