from fastapi import APIRouter
import requests
import os

router = APIRouter()

@router.get("/status")
def get_status():
    # Lista de IPs de las Raspberry Pi a monitorear
    raspberry_ips = [
        "192.168.190.29",
        "192.168.190.28"
    ]
    results = []
    for ip in raspberry_ips:
        url = f"http://{ip}:8000/status"
        try:
            response = requests.get(url, timeout=3)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            data = {"error": f"No se pudo obtener el status de la Raspberry Pi {ip}: {str(e)}"}
        results.append({"ip": ip, **data})
    return results

@router.get("/log")
def get_logs():
    raspberry_ips = [
        "192.168.190.29",
        "192.168.190.28"
    ]
    results = []
    for ip in raspberry_ips:
        url = f"http://{ip}:8000/log"
        try:
            response = requests.get(url, timeout=3)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            data = {"error": "No disponible"}
        results.append({"ip": ip, "logs": data})
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
