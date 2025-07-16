import httpx
import logging
import os

# Configuración básica de logging (solo si utils.py se usa de forma independiente)
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

async def send_telegram_alert(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram token o chat_id no configurados")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, data=payload, timeout=5)
        logger.info("Alerta enviada a Telegram")
    except Exception as e:
        logger.error(f"Error enviando alerta a Telegram: {e}")

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
            response = await client.get(url, timeout=1)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Logs recibidos de {ip}")
        except Exception as e:
            logger.error(f"Error obteniendo logs de {ip}: {e}")
            data = {"error": "No disponible"}
    return {"ip": ip, "logs": data}
