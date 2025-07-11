from fastapi import APIRouter
import requests
import os

router = APIRouter()

@router.get("/status")
def get_status():
    url = os.environ.get("RPI_STATUS_URL", "http://192.168.190.29:8000/status")
    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": f"No se pudo obtener el status de la Raspberry Pi: {str(e)}"}

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
