import os
from datetime import datetime

LOG_FILE = "/app/logs/connection.log"

def log_status(is_online: bool):
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as f:
        status = "ONLINE" if is_online else "OFFLINE"
        f.write(f"{datetime.now().isoformat()} - {status}\n")

def read_logs():
    if not os.path.exists(LOG_FILE):
        return []
    with open(LOG_FILE, "r") as f:
        lines = f.readlines()
    return [
        {"timestamp": line.split(" - ")[0], "status": line.split(" - ")[1].strip()}
        for line in lines[-50:]
    ]
