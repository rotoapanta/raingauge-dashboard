"""
crud.py

Operaciones CRUD para el backend de Raingauge Dashboard.
Incluye funciones para crear, leer, actualizar y eliminar dispositivos, usuarios, métricas e alertas en la base de datos.
Todas las funciones usan sesiones SQLModel y validan unicidad donde corresponde.
"""

from sqlmodel import Session, select
from models import Device, MetricHistory, Alert, User
from typing import List, Optional, Dict, Any
from datetime import datetime

def get_session(engine) -> Session:
    """
    Obtiene una nueva sesión SQLModel para el engine dado.
    """
    return Session(engine)

def create_device(session: Session, device: Device) -> Device:
    """
    Crea un nuevo dispositivo en la base de datos, asegurando que la IP sea única.
    Args:
        session (Session): Sesión de base de datos.
        device (Device): Objeto dispositivo a crear.
    Returns:
        Device: Dispositivo creado.
    Raises:
        ValueError: Si ya existe un dispositivo con la misma IP.
    """
    exists = session.exec(select(Device).where(Device.ip == device.ip)).first()
    if exists:
        raise ValueError("Ya existe un dispositivo con esa IP")
    session.add(device)
    session.commit()
    session.refresh(device)
    return device

def get_devices(session: Session) -> List[Device]:
    """
    Devuelve una lista de todos los dispositivos en la base de datos.
    """
    return session.exec(select(Device)).all()

def get_device(session: Session, device_id: int) -> Optional[Device]:
    """
    Devuelve un dispositivo por su ID, o None si no existe.
    """
    return session.get(Device, device_id)

def update_device(session: Session, device_id: int, device_data: Dict[str, Any]) -> Optional[Device]:
    """
    Actualiza un dispositivo por su ID con los datos proporcionados.
    Args:
        session (Session): Sesión de base de datos.
        device_id (int): ID del dispositivo.
        device_data (dict): Datos a actualizar.
    Returns:
        Optional[Device]: Dispositivo actualizado o None si no existe.
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
    Elimina un dispositivo por su ID.
    Args:
        session (Session): Sesión de base de datos.
        device_id (int): ID del dispositivo.
    Returns:
        bool: True si se eliminó, False si no existe.
    """
    device = session.get(Device, device_id)
    if not device:
        return False
    session.delete(device)
    session.commit()
    return True

# CRUD for users

def create_user(session: Session, user: User) -> User:
    """
    Crea un nuevo usuario en la base de datos, asegurando que el nombre de usuario sea único.
    Args:
        session (Session): Sesión de base de datos.
        user (User): Objeto usuario a crear.
    Returns:
        User: Usuario creado.
    Raises:
        ValueError: Si ya existe un usuario con el mismo nombre de usuario.
    """
    exists = session.exec(select(User).where(User.username == user.username)).first()
    if exists:
        raise ValueError("Ya existe un usuario con ese nombre de usuario")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_users(session: Session) -> List[User]:
    """
    Devuelve una lista de todos los usuarios en la base de datos.
    """
    return session.exec(select(User)).all()

def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Devuelve un usuario por su ID, o None si no existe.
    """
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    """
    Actualiza un usuario por su ID con los datos proporcionados.
    Args:
        session (Session): Sesión de base de datos.
        user_id (int): ID del usuario.
        user_data (dict): Datos a actualizar.
    Returns:
        Optional[User]: Usuario actualizado o None si no existe.
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
    Elimina un usuario por su ID.
    Args:
        session (Session): Sesión de base de datos.
        user_id (int): ID del usuario.
    Returns:
        bool: True si se eliminó, False si no existe.
    """
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True

def save_metric_history(session: Session, device_id: int, cpu: float = None, ram: float = None, disk: float = None, temp: float = None, status: str = None) -> MetricHistory:
    """
    Guarda un nuevo registro de historial de métricas para un dispositivo.
    Args:
        session (Session): Sesión de base de datos.
        device_id (int): ID del dispositivo.
        cpu (float, opcional): Uso de CPU.
        ram (float, opcional): Uso de RAM.
        disk (float, opcional): Uso de disco.
        temp (float, opcional): Temperatura.
        status (str, opcional): Estado.
    Returns:
        MetricHistory: Objeto de historial de métricas creado.
    """
    metric = MetricHistory(
        device_id=device_id,
        cpu=cpu,
        ram=ram,
        disk=disk,
        temp=temp,
        status=status,
        timestamp=datetime.utcnow()
    )
    session.add(metric)
    session.commit()
    session.refresh(metric)
    return metric

def create_alert(session: Session, device_id: int, level: str, message: str) -> Alert:
    """
    Crea una nueva alerta para un dispositivo.
    Args:
        session (Session): Sesión de base de datos.
        device_id (int): ID del dispositivo.
        level (str): Nivel de la alerta.
        message (str): Mensaje de la alerta.
    Returns:
        Alert: Objeto de alerta creado.
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
    Devuelve una lista de alertas, opcionalmente solo las no resueltas.
    Args:
        session (Session): Sesión de base de datos.
        unresolved_only (bool, opcional): Si es True, solo devuelve alertas no resueltas.
    Returns:
        List[Alert]: Lista de alertas.
    """
    query = select(Alert)
    if unresolved_only:
        query = query.where(Alert.resolved == False)
    return session.exec(query.order_by(Alert.timestamp.desc())).all()

def resolve_alert(session: Session, alert_id: int) -> bool:
    """
    Marca una alerta como resuelta por su ID.
    Args:
        session (Session): Sesión de base de datos.
        alert_id (int): ID de la alerta.
    Returns:
        bool: True si se resolvió, False si no existe.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        return False
    alert.resolved = True
    session.add(alert)
    session.commit()
    return True
