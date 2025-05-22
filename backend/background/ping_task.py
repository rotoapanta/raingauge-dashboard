import time
import socket
from services.logging_utils import log_status

def is_online():
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

def start_monitoring():
    previous_status = None
    while True:
        online = is_online()
        if online != previous_status:
            log_status(online)
            previous_status = online
        time.sleep(10)  # 10 segundos de intervalo
