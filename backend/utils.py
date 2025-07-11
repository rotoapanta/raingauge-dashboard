import httpx
import logging

# Configuración básica de logging (solo si utils.py se usa de forma independiente)
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

async def fetch_status(ip):
    url = f"http://{ip}:8000/status"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=3)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Status recibido de {ip}")
        except Exception as e:
            logger.error(f"Error obteniendo status de {ip}: {e}")
            data = {"error": f"No se pudo obtener el status de la Raspberry Pi {ip}: {str(e)}"}
    return {"ip": ip, **data}

async def fetch_logs(ip):
    url = f"http://{ip}:8000/log"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=3)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Logs recibidos de {ip}")
        except Exception as e:
            logger.error(f"Error obteniendo logs de {ip}: {e}")
            data = {"error": "No disponible"}
    return {"ip": ip, "logs": data}
