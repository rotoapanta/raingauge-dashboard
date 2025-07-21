"""
import_raspberry_ips.py

Script utilitario para importar IPs de Raspberry Pi desde la variable de entorno RASPBERRY_IPS y agregarlas a la base de datos.
Evita duplicados y permite importar múltiples dispositivos de forma masiva.
"""

import os
from sqlmodel import Session, select
from models import Device
from endpoints.device_endpoint import engine
from dotenv import load_dotenv
from typing import List

def get_ips_from_env() -> List[str]:
    """
    Obtiene la lista de IPs desde la variable de entorno RASPBERRY_IPS.
    Returns:
        List[str]: Lista de IPs.
    """
    load_dotenv()
    ips = os.getenv("RASPBERRY_IPS", "").split(",")
    return [ip.strip() for ip in ips if ip.strip()]

def import_ips(ips: List[str]) -> None:
    """
    Importa las IPs a la base de datos, evitando duplicados.
    """
    if not ips:
        print("No se encontraron IPs en RASPBERRY_IPS.")
        return
    with Session(engine) as session:
        for ip in ips:
            exists = session.exec(select(Device).where(Device.ip == ip)).first()
            if exists:
                print(f"Ya existe el dispositivo con IP {ip}, se omite.")
                continue
            device = Device(
                name=f"Raspberry {ip}",
                ip=ip,
                description="Importado desde .env",
                enabled=True
            )
            session.add(device)
            print(f"Dispositivo agregado: {ip}")
        session.commit()
    print("Importación finalizada.")

def main() -> None:
    ips = get_ips_from_env()
    import_ips(ips)

if __name__ == "__main__":
    main()
