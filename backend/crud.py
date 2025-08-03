"""
crud.py

CRUD operations for the Raingauge Dashboard backend.
Includes functions to create, read, update, and delete devices, users, metrics, and alerts in the database.
All functions use SQLModel sessions and validate uniqueness where appropriate.

Operaciones CRUD para el backend de Raingauge Dashboard.
Incluye funciones para crear, leer, actualizar y eliminar dispositivos, usuarios, métricas y alertas en la base de datos.
Todas las funciones usan sesiones de SQLModel y validan unicidad donde corresponde.
"""

from sqlmodel import Session, select
from models import Device, MetricHistory, Alert, User
from typing import List, Optional, Dict, Any
from datetime import datetime

# Get a new SQLModel session for the given engine
# Obtener una nueva sesión de SQLModel para el engine dado
def get_session(engine) -> Session:
    """
    Get a new SQLModel session for the given engine.
    Obtener una nueva sesión de SQLModel para el engine dado.
    """
    return Session(engine)

# Device CRUD / CRUD de dispositivos
def create_device(session: Session, device: Device) -> Device:
    """
    Create a new device in the database, ensuring the IP is unique.
    Crear un nuevo dispositivo en la base de datos, asegurando que la IP sea única.
    """
    exists = session.exec(select(Device).where(Device.ip == device.ip)).first()
    if exists:
        raise ValueError("A device with that IP already exists")
    session.add(device)
    session.commit()
    session.refresh(device)
    return device

def get_devices(session: Session) -> List[Device]:
    """
    Return a list of all devices in the database.
    Retorna una lista de todos los dispositivos en la base de datos.
    """
    return session.exec(select(Device)).all()

def get_device(session: Session, device_id: int) -> Optional[Device]:
    """
    Return a device by its ID, or None if it does not exist.
    Retorna un dispositivo por su ID, o None si no existe.
    """
    return session.get(Device, device_id)

def update_device(session: Session, device_id: int, device_data: Dict[str, Any]) -> Optional[Device]:
    """
    Update a device by its ID with the provided data.
    Actualiza un dispositivo por su ID con los datos proporcionados.
    """
    device = session.get(Device, device_id)
    if not device:
        return None
    for key, value in device_data.items():
        setattr(device, key, value)
    session.add(device)
    session.commit()
    session.refresh(device)
    return device

def delete_device(session: Session, device_id: int) -> bool:
    """
    Delete a device by its ID.
    Elimina un dispositivo por su ID.
    """
    device = session.get(Device, device_id)
    if not device:
        return False
    session.delete(device)
    session.commit()
    return True

# CRUD for users / CRUD de usuarios
def create_user(session: Session, user: User) -> User:
    """
    Create a new user in the database, ensuring the username is unique.
    Crear un nuevo usuario en la base de datos, asegurando que el nombre de usuario sea único.
    """
    exists = session.exec(select(User).where(User.username == user.username)).first()
    if exists:
        raise ValueError("A user with that username already exists")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_users(session: Session) -> List[User]:
    """
    Return a list of all users in the database.
    Retorna una lista de todos los usuarios en la base de datos.
    """
    return session.exec(select(User)).all()

def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Return a user by their ID, or None if not found.
    Retorna un usuario por su ID, o None si no existe.
    """
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    """
    Update a user by their ID with the provided data.
    Actualiza un usuario por su ID con los datos proporcionados.
    """
    user = session.get(User, user_id)
    if not user:
        return None
    for key, value in user_data.items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def delete_user(session: Session, user_id: int) -> bool:
    """
    Delete a user by their ID.
    Elimina un usuario por su ID.
    """
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True


# Alerts / Alertas
def create_alert(session: Session, device_id: int, level: str, message: str) -> Alert:
    """
    Create a new alert for a device.
    Crea una nueva alerta para un dispositivo.
    """
    alert = Alert(
        device_id=device_id,
        level=level,
        message=message,
        timestamp=datetime.utcnow(),
        resolved=False
    )
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert

def get_alerts(session: Session, unresolved_only: bool = False) -> List[Alert]:
    """
    Return a list of alerts, optionally only unresolved ones.
    Retorna una lista de alertas, opcionalmente solo las no resueltas.
    """
    query = select(Alert)
    if unresolved_only:
        query = query.where(Alert.resolved == False)
    return session.exec(query.order_by(Alert.timestamp.desc())).all()

def resolve_alert(session: Session, alert_id: int) -> bool:
    """
    Mark an alert as resolved by its ID.
    Marca una alerta como resuelta por su ID.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        return False
    alert.resolved = True
    session.add(alert)
    session.commit()
    return True
