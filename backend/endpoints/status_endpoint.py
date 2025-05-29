from fastapi import APIRouter
import psutil
import socket
import os

router = APIRouter()

@router.get("/status")
def get_status():
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "temp": get_cpu_temp(),
        "hostname": socket.gethostname(),
        "ip": get_ip(),
        "battery": {
            "voltage": 3.7,
            "status": "NORMAL"
        }        
    }

@router.post("/reboot")
def reboot():
    os.system("reboot")
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
