import os
from sqlmodel import Session, select
from models import Device
from endpoints.device_endpoint import engine

# Leer IPs desde .env
from dotenv import load_dotenv
load_dotenv()
ips = os.getenv("RASPBERRY_IPS", "").split(",")
ips = [ip.strip() for ip in ips if ip.strip()]

if not ips:
    print("No se encontraron IPs en RASPBERRY_IPS.")
    exit(0)

with Session(engine) as session:
    for ip in ips:
        # Verifica si ya existe
        exists = session.exec(select(Device).where(Device.ip == ip)).first()
        if exists:
            print(f"Ya existe el dispositivo con IP {ip}, se omite.")
            continue
        device = Device(
            name=f"Raspberry {ip}",
            ip=ip,
            description=f"Importado desde .env",
            enabled=True
        )
        session.add(device)
        print(f"Dispositivo agregado: {ip}")
    session.commit()
print("Importación finalizada.")
