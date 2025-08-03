"""
status_endpoint.py

Endpoints for device status and logs in the Raingauge Dashboard backend.
Provides API routes for checking API health, device status, and logs.

Endpoints para el estado y logs de dispositivos en el backend de Raingauge Dashboard.
Proporciona rutas API para verificar el estado de la API, el estado de los dispositivos y los logs.
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response
from sqlmodel import Session, select
from models import Device
from utils import fetch_logs
from endpoints.device_endpoint import engine
import logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_class=PlainTextResponse)
def root():
    """
    Health check endpoint for the API.
    Endpoint de verificación de salud para la API.
    """
    return "API Raingauge funcionando"

@router.get("/favicon.ico")
def favicon():
    """
    Favicon endpoint (returns empty icon).
    Endpoint de favicon (retorna icono vacío).
    """
    return Response(content=b"", media_type="image/x-icon")

@router.get("/status")
async def get_status():
    """
    Get the status of all enabled devices (legacy route).
    Obtiene el estado de todos los dispositivos habilitados (ruta legacy).
    """
    # Get enabled devices from the database / Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
    logger.info(f"[STATUS] Consultando las siguientes IPs: {ips}")
    if not ips:
        return []
    # Use fetch_status from utils.py for each IP / Usar fetch_status de utils.py para cada IP
    from utils import fetch_status
    import asyncio
    results = await asyncio.gather(*(fetch_status(ip) for ip in ips))
    logger.info(f"[STATUS] Resultados finales: {results}")
    return results

@router.get("/api/v1/status")
async def get_status_v1():
    """
    Get the status of all enabled devices (v1 route).
    Obtiene el estado de todos los dispositivos habilitados (ruta v1).
    """
    # Get enabled devices from the database / Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
    logger.info(f"[STATUS] Consultando las siguientes IPs: {ips}")
    if not ips:
        return []
    # Use fetch_status from utils.py for each IP / Usar fetch_status de utils.py para cada IP
    from utils import fetch_status
    import asyncio
    results = await asyncio.gather(*(fetch_status(ip) for ip in ips))
    logger.info(f"[STATUS] Resultados finales: {results}")
    return results

@router.get("/log")
async def get_logs():
    """
    Get logs from all enabled devices.
    Obtiene los logs de todos los dispositivos habilitados.
    """
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
        try:
            import asyncio
            results = await asyncio.gather(*(fetch_logs(ip) for ip in ips), return_exceptions=True)
            logs_list = []
            for ip, res in zip(ips, results):
                if isinstance(res, Exception):
                    logger.error(f"Error getting logs from {ip}: {res}")
                    logs_list.append({"ip": ip, "logs": {"error": str(res)}})
                else:
                    logs_list.append(res)
            return logs_list
        except Exception as e:
            logger.error(f"General error in /log: {e}")
            # Always return a valid JSON response and status 200 / Devolver siempre una respuesta JSON válida y status 200
            return [{"ip": ip, "logs": {"error": f"General backend error: {str(e)}"}} for ip in ips]
