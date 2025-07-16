from fastapi import APIRouter, Depends
import os
from sqlmodel import Session, select
from models import Device
from utils import fetch_status, fetch_logs, send_telegram_alert
import crud

from fastapi.responses import PlainTextResponse, Response

router = APIRouter()

@router.get("/", response_class=PlainTextResponse)
def root():
    return "API Raingauge funcionando"

@router.get("/favicon.ico")
def favicon():
    # Devuelve un favicon vacío para evitar error en navegador
    return Response(content=b"", media_type="image/x-icon")

from endpoints.device_endpoint import engine


@router.get("/status")
async def get_status():
    import asyncio
    import requests
    from endpoints.device_endpoint import engine
    from sqlmodel import Session, select
    from models import Device
    # Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
    print("[STATUS] Consultando las siguientes IPs:", ips)
    if not ips:
        return []
    async def fetch_status_async(ip):
        url = f"http://{ip}:8000/status"
        print(f"[STATUS] Consultando {url}")
        try:
            loop = asyncio.get_event_loop()
            resp = await loop.run_in_executor(None, lambda: requests.get(url, timeout=1))
            resp.raise_for_status()
            data = resp.json()
            data["ip"] = ip
            print(f"[STATUS] Respuesta de {ip}: {data}")
            return data
        except Exception as e:
            print(f"[STATUS] Error consultando {ip}: {e}")
            return {"ip": ip, "error": str(e)}
    results = await asyncio.gather(*(fetch_status_async(ip) for ip in ips))
    print("[STATUS] Resultados finales:", results)
    return results

@router.get("/log")
async def get_logs():
    import asyncio
    from endpoints.device_endpoint import engine
    from sqlmodel import Session, select
    from models import Device
    import logging
    logger = logging.getLogger("raingauge-backend")
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        ips = [d.ip for d in devices]
        try:
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
            return [{"ip": ip, "logs": {"error": "Error general en backend"}} for ip in ips]

from fastapi import Request
import requests

@router.post("/reboot")
def reboot(request: Request):
    data = request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    ip = data.get("ip")
    print(f"[BACKEND] Petición de reboot recibida para IP: {ip}")
    if not ip:
        print("[BACKEND] No se proporcionó la IP en el body de la petición.")
        return {"error": "No se proporcionó la IP"}
    try:
        url = f"http://{ip}:8000/reboot"
        print(f"[BACKEND] Reenviando reboot a {url}")
        resp = requests.post(url, timeout=5)
        print(f"[BACKEND] Respuesta de {ip}: {resp.status_code} {resp.text}")
        resp.raise_for_status()
        return {"status": f"Reboot enviado a {ip}"}
    except Exception as e:
        print(f"[BACKEND] Error al reenviar reboot: {e}")
        return {"error": f"No se pudo reiniciar {ip}: {str(e)}"}

def get_cpu_temp():
    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            return round(int(f.read()) / 1000, 1)
    except:
        return None

def get_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return "Unknown"
