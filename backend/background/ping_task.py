import time
import os
import httpx
from sqlmodel import Session, select
from models import Device
from utils import send_telegram_alert
import crud

def is_online(ip):
    try:
        # Intenta hacer una petición HTTP al endpoint /status de la Raspberry Pi
        url = f"http://{ip}:8000/status"
        resp = httpx.get(url, timeout=3)
        return resp.status_code == 200
    except Exception:
        return False

def start_monitoring():
    # Obtener las IPs de las Raspberry Pi desde la base de datos
    from endpoints.device_endpoint import engine
    previous_status = {}
    while True:
        with Session(engine) as session:
            devices = session.exec(select(Device).where(Device.enabled == True)).all()
            for device in devices:
                ip = device.ip
                online = is_online(ip)
                last_status = previous_status.get(ip)
                if last_status is None:
                    previous_status[ip] = online
                    continue  # No alertar en el primer ciclo
                if online != last_status:
                    # Cambio de estado: enviar alerta y registrar
                    if online:
                        msg = f"✅ Raspberry Pi {ip} ({device.name}) ha vuelto a estar ONLINE."
                        level = "INFO"
                    else:
                        msg = f"❌ Raspberry Pi {ip} ({device.name}) está OFFLINE."
                        level = "CRITICAL"
                    send_telegram_alert(msg)
                    crud.create_alert(session, device.id, level, msg)
                    print(f"[ALERTA] {msg}")
                    previous_status[ip] = online
        time.sleep(10)  # Intervalo de monitoreo
