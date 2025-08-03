"""
utils.py

Utility functions for the Raingauge Dashboard backend.
Includes helpers for Telegram alerts, status and log fetching, and Markdown escaping.

Funciones utilitarias para el backend de Raingauge Dashboard.
Incluye utilidades para alertas de Telegram, obtención de estado y logs, y escape de Markdown.
"""

import httpx
import logging
import os
logger = logging.getLogger(__name__)

def escape_markdown(text: str) -> str:
    """
    Escape all special characters required by Telegram MarkdownV2.
    Always use this when sending messages with parse_mode='MarkdownV2'.

    Escapa todos los caracteres especiales requeridos por Telegram MarkdownV2.
    Úsala siempre que envíes mensajes con parse_mode='MarkdownV2'.
    """
    if not text:
        return "-"
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    return ''.join(f'\\{c}' if c in escape_chars else c for c in str(text))

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

async def send_telegram_alert(message: str, parse_mode: str = "Markdown"):
    """
    Send an alert message to Telegram using the bot token and chat ID from environment variables.
    Logs the response and errors.

    Envía un mensaje de alerta a Telegram usando el token y chat ID de las variables de entorno.
    Registra la respuesta y los errores.
    """
    logger.info(f"Trying to send alert to Telegram: {message}")
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning(f"Telegram token or chat_id not configured. TOKEN: {TELEGRAM_BOT_TOKEN}, CHAT_ID: {TELEGRAM_CHAT_ID}")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": parse_mode}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=payload, timeout=5)
        logger.info(f"Telegram response: {response.status_code} {response.text}")
        logger.info("Alert sent to Telegram")
    except Exception as e:
        logger.error(f"Error sending alert to Telegram: {e}")

async def fetch_status(ip):
    """
    Fetch the status from a Raspberry Pi device at the given IP address.
    Returns a dictionary with the status or an error message.

    Obtiene el estado de una Raspberry Pi en la IP dada.
    Retorna un diccionario con el estado o un mensaje de error.
    """
    url = f"http://{ip}:8000/api/v1/status"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=3)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Status received from {ip}")
            # If the response has 'data', merge it into the root
            # Si la respuesta tiene 'data', mezclarlo en la raíz
            if "data" in data:
                data = {**data["data"], "meta": data.get("meta", {})}
            # Ensure data is a dict
            # Forzar que data sea un dict
            if not isinstance(data, dict):
                logger.error(f"Unstructured response for {ip}: {data}")
                data = {"error": f"Unstructured response from Raspberry Pi {ip}"}
        except Exception as e:
            logger.error(f"Error getting status from {ip}: {e}")
            data = {"error": f"Could not get status from Raspberry Pi {ip}: {str(e)}"}
    return {"ip": ip, **data}

async def fetch_logs(ip):
    """
    Fetch the logs from a Raspberry Pi device at the given IP address.
    Returns a dictionary with the logs or an error message.

    Obtiene los logs de una Raspberry Pi en la IP dada.
    Retorna un diccionario con los logs o un mensaje de error.
    """
    url = f"http://{ip}:8000/log"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=1)
            response.raise_for_status()
            data = response.json()
            logger.info(f"Logs received from {ip}")
        except Exception as e:
            logger.error(f"Error getting logs from {ip}: {e}")
            data = {"error": "Not available"}
    return {"ip": ip, "logs": data}
