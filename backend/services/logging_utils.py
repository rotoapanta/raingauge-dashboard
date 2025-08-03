"""
logging_utils.py

Utilities for logging and reading connection logs in the Raspberry Pi Dashboard backend.
Utilidades para el registro y lectura de logs de conexión en el backend de Raspberry Pi Dashboard.
"""

import os
from datetime import datetime
from typing import List, Dict

LOG_FILE = "/app/logs/connection.log"

def log_status(is_online: bool) -> None:
    """
    Log the connection status (ONLINE/OFFLINE) to the log file.
    Registra el estado de conexión (ONLINE/OFFLINE) en el archivo de logs.
    Args:
        is_online (bool): True if online, False if offline.
        is_online (bool): True si está online, False si está offline.
    """
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        status = "ONLINE" if is_online else "OFFLINE"
        f.write(f"{datetime.now().isoformat()} - {status}\n")

def read_logs() -> List[Dict[str, str]]:
    """
    Read the last 50 entries from the connection log file.
    Lee los últimos 50 registros del archivo de logs de conexión.
    Returns:
        List[Dict[str, str]]: List of dicts with timestamp and status.
        List[Dict[str, str]]: Lista de diccionarios con timestamp y status.
    """
    if not os.path.exists(LOG_FILE):
        return []
    try:
        with open(LOG_FILE, "r") as f:
            lines = f.readlines()
        return [
            {"timestamp": line.split(" - ")[0], "status": line.split(" - ")[1].strip()}
            for line in lines[-50:]
        ]
    except Exception:
        return []
