"""
import_raspberry_ips.py

Utility script to import Raspberry Pi IPs from the RASPBERRY_IPS environment variable and add them to the database.
Avoids duplicates and allows bulk import of multiple devices.

Script utilitario para importar IPs de Raspberry Pi desde la variable de entorno RASPBERRY_IPS y agregarlas a la base de datos.
Evita duplicados y permite la importación masiva de múltiples dispositivos.
"""

import os
from sqlmodel import Session, select
from models import Device
from endpoints.device_endpoint import engine
from dotenv import load_dotenv
from typing import List

def get_ips_from_env() -> List[str]:
    """
    Get the list of IPs from the RASPBERRY_IPS environment variable.
    Obtiene la lista de IPs desde la variable de entorno RASPBERRY_IPS.
    Returns:
        List[str]: List of IPs.
        List[str]: Lista de IPs.
    """
    load_dotenv()
    ips = os.getenv("RASPBERRY_IPS", "").split(",")
    return [ip.strip() for ip in ips if ip.strip()]

def import_ips(ips: List[str]) -> None:
    """
    Import the IPs into the database, avoiding duplicates.
    Importa las IPs en la base de datos, evitando duplicados.
    Args:
        ips (List[str]): List of IPs to import.
        ips (List[str]): Lista de IPs a importar.
    """
    if not ips:
        print("No IPs found in RASPBERRY_IPS.")
        return
    with Session(engine) as session:
        for ip in ips:
            exists = session.exec(select(Device).where(Device.ip == ip)).first()
            if exists:
                print(f"Device with IP {ip} already exists, skipping.")
                continue
            device = Device(
                name=f"Raspberry {ip}",
                ip=ip,
                description="Imported from .env",
                enabled=True
            )
            session.add(device)
            print(f"Device added: {ip}")
        session.commit()
    print("Import finished.")

def main() -> None:
    """
    Main entry point for the script. Handles the import process.
    Punto de entrada principal del script. Maneja el proceso de importación.
    """
    ips = get_ips_from_env()
    import_ips(ips)

if __name__ == "__main__":
    main()
