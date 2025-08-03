"""
ping_task.py

Background monitoring of Raspberry Pi device status. Sends alerts and logs status changes.

Monitoreo en background del estado de las Raspberry Pi. Envía alertas y registra cambios de estado.
"""

import time
import logging
import httpx
from sqlmodel import Session, select
from models import Device
from utils import send_telegram_alert
import crud
from endpoints.device_endpoint import engine
from typing import Dict

logger = logging.getLogger("raingauge-backend")

def is_online(ip: str) -> bool:
    """
    Check if a Raspberry Pi is online by making an HTTP request to /status.
    Verifica si una Raspberry Pi está online mediante una petición HTTP a /status.

    Args:
        ip (str): Device IP address.
        ip (str): Dirección IP del dispositivo.

    Returns:
        bool: True if responds correctly, False otherwise.
        bool: True si responde correctamente, False en caso contrario.
    """
    try:
        url = f"http://{ip}:8000/api/v1/status"
        resp = httpx.get(url, timeout=3)
        return resp.status_code == 200
    except Exception as e:
        logger.warning(f"No se pudo conectar con {ip}: {e}")
        return False

def start_monitoring() -> None:
    """
    Start continuous monitoring of devices. Sends alerts and logs status changes.
    Inicia el monitoreo continuo de dispositivos. Envía alertas y registra cambios de estado.
    """
    previous_status: Dict[str, bool] = {}
    while True:
        with Session(engine) as session:
            devices = session.exec(select(Device).where(Device.enabled == True)).all()
            for device in devices:
                ip = device.ip
                online = is_online(ip)
                last_status = previous_status.get(ip)
                if last_status is None:
                    previous_status[ip] = online
                    continue  # Do not alert on first cycle / No alertar en el primer ciclo
                if online != last_status:
                    # State change: send alert and log / Cambio de estado: enviar alerta y registrar
                    from utils import escape_markdown
                    if online:
                        msg = (
                            "🟢✅ Raspberry Pi "
                            f"{escape_markdown(ip)} ({escape_markdown(device.name)}) ha vuelto a estar ONLINE."
                        )
                        level = "INFO"
                    else:
                        msg = (
                            "🔴❌ Raspberry Pi "
                            f"{escape_markdown(ip)} ({escape_markdown(device.name)}) está OFFLINE."
                        )
                        level = "CRITICAL"
                    import asyncio
                    asyncio.create_task(send_telegram_alert(msg, parse_mode="MarkdownV2"))
                    crud.create_alert(session, device.id, level, msg)
                    logger.info(f"[ALERTA] {msg}")
                    previous_status[ip] = online
        time.sleep(10)  # Monitoring interval / Intervalo de monitoreo
