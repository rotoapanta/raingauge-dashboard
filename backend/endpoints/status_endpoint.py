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
    import os
    import requests
    import socket
    # Leer la lista de IPs desde la variable de entorno
    ips = os.getenv("RASPBERRY_IPS", "").split(",")
    ips = [ip.strip() for ip in ips if ip.strip()]
    print("[STATUS] Consultando las siguientes IPs:", ips)
    if not ips:
        # Si no hay IPs, devolver estado local
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
        print("[STATUS] No hay IPs configuradas. Devolviendo estado local.")
        return {
            "status": "ok",
            "ip": get_ip(),
            "cpu_temp": get_cpu_temp(),
        }
    async def fetch_status_async(ip):
        url = f"http://{ip}:8000/status"
        print(f"[STATUS] Consultando {url}")
        try:
            loop = asyncio.get_event_loop()
            resp = await loop.run_in_executor(None, requests.get, url)
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
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        results = await asyncio.gather(*(fetch_logs(device.ip) for device in devices))
        return results

@router.post("/reboot")
def reboot():
    os.system("/home/pi/Documents/Projects/raspberry-api/reboot_pi.sh")
    return {"status": "Rebooting..."}

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
