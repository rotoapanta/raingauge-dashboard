"""
main.py

Entry point for the Raingauge Dashboard backend API.
Initializes FastAPI application, configures logging, CORS, and registers API routers.
Starts background monitoring for device status.

Punto de entrada para la API backend de Raingauge Dashboard.
Inicializa la aplicación FastAPI, configura logging, CORS y registra los routers de la API.
Inicia la monitorización en segundo plano del estado de los dispositivos.
"""

from dotenv import load_dotenv
import logging
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.status_endpoint import router as status_router
from endpoints.device_endpoint import router as device_router
from endpoints.auth_endpoint import router as auth_router
from endpoints.user_endpoint import router as user_router
from endpoints.status_ws import router as ws_router
from background.ping_task import start_monitoring

# Load environment variables from .env file
# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configure logging to file and console
# Configurar logging a archivo y consola
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

# Create FastAPI application instance
# Crear instancia de la aplicación FastAPI
app = FastAPI()

# Configure CORS to allow all origins and credentials
# Configurar CORS para permitir todos los orígenes y credenciales
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers for different endpoints
# Registrar routers de la API para los diferentes endpoints
app.include_router(status_router)
app.include_router(device_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ws_router)

# Start background monitoring thread for device status
# Iniciar hilo de monitorización en segundo plano para el estado de los dispositivos
threading.Thread(target=start_monitoring, daemon=True).start()
