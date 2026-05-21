import requests
import time

BASE_URL = "http://localhost:5000"

def test_ping():
    print("Enviando ping al servidor...")
    try:
        response = requests.get(f"{BASE_URL}/ping")
        print(f"Respuesta ({response.status_code}): {response.json()}\n")
    except Exception as e:
        print(f"Error al conectar con el servidor: {e}\n")

def test_deteccion(personas):
    print(f"Simulando detección de {personas} personas...")
    try:
        response = requests.post(
            f"{BASE_URL}/deteccion",
            json={"personas": personas}
        )
        print(f"Respuesta ({response.status_code}): {response.json()}\n")
    except Exception as e:
        print(f"Error al conectar con el servidor: {e}\n")

def test_historial():
    print("Consultando historial...")
    try:
        response = requests.get(f"{BASE_URL}/historial")
        print(f"Respuesta ({response.status_code}): {response.json()}\n")
    except Exception as e:
        print(f"Error al conectar con el servidor: {e}\n")

if __name__ == "__main__":
    print("--- INICIANDO PRUEBAS DE LA API ---")
    test_ping()
    time.sleep(1)
    
    # Prueba 1: Bajo el umbral (no debería enviar alerta)
    test_deteccion(2)
    time.sleep(1)
    
    # Prueba 2: En el umbral (alerta amarilla, UMBRAL=4)
    test_deteccion(4)
    time.sleep(1)
    
    # Prueba 3: Sobre el umbral (alerta roja)
    test_deteccion(6)
    time.sleep(1)
    
    # Verificamos que se hayan guardado en el historial
    test_historial()
    print("--- PRUEBAS FINALIZADAS ---")
