from dotenv import load_dotenv
load_dotenv()
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.status_endpoint import router as status_router  # ✅ corrección aquí
from endpoints.device_endpoint import router as device_router
from endpoints.auth_endpoint import router as auth_router
from endpoints.user_endpoint import router as user_router
from endpoints.status_ws import router as ws_router
from services.logging_utils import read_logs
from background.ping_task import start_monitoring
import threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas principales
app.include_router(status_router)
app.include_router(device_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ws_router)

# @app.get("/log")
# def get_connection_logs():
#     return read_logs()

# 🟢 Ejecuta el monitoreo en un hilo en segundo plano
threading.Thread(target=start_monitoring, daemon=True).start()
