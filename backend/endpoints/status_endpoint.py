from fastapi import APIRouter, Depends
import os
from sqlmodel import Session, select
from models import Device
from utils import fetch_status, fetch_logs, send_telegram_alert
import crud

router = APIRouter()

from endpoints.device_endpoint import engine

@router.get("/status")
async def get_status():
    import asyncio
    # Obtener dispositivos habilitados desde la base de datos
    with Session(engine) as session:
        devices = session.exec(select(Device).where(Device.enabled == True)).all()
        results = await asyncio.gather(*(fetch_status(device.ip) for device in devices))
        # Guardar histórico de métricas para cada dispositivo que responde
        for device, result in zip(devices, results):
            if not result.get("error"):
                cpu = result.get("cpu")
                ram = result.get("ram")
                disk = result.get("disk")
                temp = result.get("temp")
                crud.save_metric_history(
                    session,
                    device_id=device.id,
                    cpu=cpu,
                    ram=ram,
                    disk=disk,
                    temp=temp,
                    status="ONLINE"
                )
                # Alertas por umbral crítico
                if (cpu is not None and cpu > 90) or (temp is not None and temp > 70):
                    msg = f"CPU alta: {cpu}%" if cpu and cpu > 90 else f"Temp alta: {temp}°C"
                    crud.create_alert(
                        session,
                        device_id=device.id,
                        level="CRITICAL",
                        message=msg
                    )
                    await send_telegram_alert(f"[ALERTA] {device.name} ({device.ip}): {msg}")
            else:
                crud.save_metric_history(
                    session,
                    device_id=device.id,
                    status="OFFLINE"
                )
                crud.create_alert(
                    session,
                    device_id=device.id,
                    level="CRITICAL",
                    message="Dispositivo offline"
                )
                await send_telegram_alert(f"[ALERTA] {device.name} ({device.ip}): Dispositivo offline")
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
