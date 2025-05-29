from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.status_endpoint import router as status_router  # ✅ corrección aquí
from services.logging_utils import read_logs
from background.ping_task import start_monitoring
import threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas principales
app.include_router(status_router)

@app.get("/log")
def get_connection_logs():
    return read_logs()

# 🟢 Ejecuta el monitoreo en un hilo en segundo plano
threading.Thread(target=start_monitoring, daemon=True).start()
