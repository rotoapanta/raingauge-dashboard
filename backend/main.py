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
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

# FastAPI application instance
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(status_router)
app.include_router(device_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ws_router)

# Start background monitoring thread for device status
threading.Thread(target=start_monitoring, daemon=True).start()
