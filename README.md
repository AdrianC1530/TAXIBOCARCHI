# TaxiBocarchi 🚖

**Sistema Inteligente de Monitoreo y Alertas IoT para Paradas de Taxis**

Este proyecto es un sistema integral diseñado para optimizar el servicio logístico de la cooperativa de taxis **TaxiBocarchi**. Utiliza monitoreo en tiempo real para evaluar la cantidad de pasajeros en espera y notifica proactivamente a los conductores mediante Telegram para reducir los tiempos de espera y mejorar el servicio al cliente.

---

## 🌟 Características Principales

* **Monitoreo en Tiempo Real**: Panel de control interactivo (Dashboard) que muestra el flujo actual de pasajeros esperando en la parada.
* **Alertas Automáticas**: Al superar un umbral específico de personas, el sistema envía notificaciones push a un bot de Telegram.
* **Analítica de Datos**: Gráficos interactivos de demanda horaria y semanal procesados desde el historial de detecciones.
* **Gestión de Accesos (Taxistas)**: Los conductores pueden solicitar registro ingresando su número de unidad, quedando sujetos a aprobación del administrador.
* **Diseño Premium**: Interfaz moderna (Glassmorphism), rápida y responsiva, utilizando Recharts y Lucide-React.

---

## 🛠️ Arquitectura y Tecnologías

El sistema está construido mediante una arquitectura de microservicios:

1. **Frontend (React.js + Vite)**: Interfaz de usuario administrativa.
2. **Backend API (NestJS / Node.js)**: Cerebro lógico para consultas a base de datos, sistema de login (JWT) y cálculo estadístico.
3. **Backend IoT (Python / Flask)**: Motor de ingestión de datos desde hardware (simulador/sensores). Procesa las detecciones y acciona las alertas a Telegram.
4. **Base de Datos (Firebase Firestore)**: Almacenamiento NoSQL seguro y en la nube.

---

## 🚀 Requisitos e Instalación

### Prerrequisitos
* **Node.js** (v18 o superior)
* **Python** (v3.10 o superior)
* Archivo de credenciales de Firebase: `firebase_credentials.json` en la raíz del proyecto.

### 1. Iniciar el Backend (Python - Motor IoT)
```bash
pip install -r requirements.txt
python app.py
```

### 2. Iniciar el Backend API (NestJS)
```bash
cd taxi-backend
npm install
npm run start
```

### 3. Iniciar el Frontend (React)
```bash
cd taxi-frontend
npm install
npm run dev
```

---

## 📂 Estructura del Proyecto

* `/taxi-frontend`: Código fuente de la interfaz web (React).
* `/taxi-backend`: Código fuente de la API (NestJS).
* `app.py`: Script servidor Flask para recibir conteos de sensores IoT.
* `telegram_bot.py`: Lógica de alertas a través del API de Telegram.
* `test_api.py`: Script para simular tráfico de pasajeros y probar la reacción del sistema en tiempo real.
* `code.ino`: Código C++ para la programación física del microcontrolador ESP32/ESP8266 (Hardware).

---

## 💡 Cómo probar el sistema
Con todos los servicios corriendo, puedes usar el script `test_api.py` para simular la llegada de personas a la parada. 
```bash
python test_api.py
```
El panel web (*Dashboard*) reaccionará en tiempo real, iluminando los pasajeros y enviando la alerta a Telegram si se supera la capacidad normal.

---

> **Nota para el despliegue**: Asegúrate de tener configuradas tus variables de entorno y tu archivo `firebase_credentials.json` (no incluido en este repositorio por seguridad).
