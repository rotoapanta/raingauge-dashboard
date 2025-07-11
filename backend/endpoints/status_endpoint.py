from fastapi import APIRouter
import os
from config import RASPBERRY_IPS
from utils import fetch_status, fetch_logs

router = APIRouter()

@router.get("/status")
async def get_status():
    import asyncio
    results = await asyncio.gather(*(fetch_status(ip) for ip in RASPBERRY_IPS))
    return results

@router.get("/log")
async def get_logs():
    import asyncio
    results = await asyncio.gather(*(fetch_logs(ip) for ip in RASPBERRY_IPS))
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
