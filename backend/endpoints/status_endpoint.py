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
    return "API Raingauge funcionando"

@router.get("/favicon.ico")
def favicon():
    return Response(content=b"", media_type="image/x-icon")

@router.get("/status")
async def get_status():
    # Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
    logger.info(f"[STATUS] Consultando las siguientes IPs: {ips}")
    if not ips:
        return []
    # Usar fetch_status de utils.py para cada IP
    from utils import fetch_status
    import asyncio
    results = await asyncio.gather(*(fetch_status(ip) for ip in ips))
    logger.info(f"[STATUS] Resultados finales: {results}")
    return results

@router.get("/api/v1/status")
async def get_status_v1():
    # Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
    logger.info(f"[STATUS] Consultando las siguientes IPs: {ips}")
    if not ips:
        return []
    # Usar fetch_status de utils.py para cada IP
    from utils import fetch_status
    import asyncio
    results = await asyncio.gather(*(fetch_status(ip) for ip in ips))
    logger.info(f"[STATUS] Resultados finales: {results}")
    return results

@router.get("/log")
async def get_logs():
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
        try:
            import asyncio
            results = await asyncio.gather(*(fetch_logs(ip) for ip in ips), return_exceptions=True)
            logs_list = []
            for ip, res in zip(ips, results):
                if isinstance(res, Exception):
                    logger.error(f"Error obteniendo logs de {ip}: {res}")
                    logs_list.append({"ip": ip, "logs": {"error": str(res)}})
                else:
                    logs_list.append(res)
            return logs_list
        except Exception as e:
            logger.error(f"Error general en /log: {e}")
            # Devolver siempre una respuesta JSON válida y status 200
            return [{"ip": ip, "logs": {"error": f"Error general en backend: {str(e)}"}} for ip in ips]
