"""
crud.py

CRUD operations for the Raingauge Dashboard backend.
Includes functions to create, read, update, and delete devices, users, metrics, and alerts in the database.
All functions use SQLModel sessions and validate uniqueness where appropriate.
"""

from sqlmodel import Session, select
from models import Device, MetricHistory, Alert, User
from typing import List, Optional, Dict, Any
from datetime import datetime

def get_session(engine) -> Session:
    """
    Get a new SQLModel session for the given engine.
    """
    return Session(engine)

def create_device(session: Session, device: Device) -> Device:
    """
    Create a new device in the database, ensuring the IP is unique.
    Args:
        session (Session): Database session.
        device (Device): Device object to create.
    Returns:
        Device: Created device.
    Raises:
        ValueError: If a device with the same IP already exists.
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
    """
    return session.exec(select(Device)).all()

def get_device(session: Session, device_id: int) -> Optional[Device]:
    """
    Return a device by its ID, or None if it does not exist.
    """
    return session.get(Device, device_id)

def update_device(session: Session, device_id: int, device_data: Dict[str, Any]) -> Optional[Device]:
    """
    Update a device by its ID with the provided data.
    Args:
        session (Session): Database session.
        device_id (int): Device ID.
        device_data (dict): Data to update.
    Returns:
        Optional[Device]: Updated device or None if not found.
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
    Args:
        session (Session): Database session.
        device_id (int): Device ID.
    Returns:
        bool: True if deleted, False if not found.
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
    Create a new user in the database, ensuring the username is unique.
    Args:
        session (Session): Database session.
        user (User): User object to create.
    Returns:
        User: Created user.
    Raises:
        ValueError: If a user with the same username already exists.
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
    """
    return session.exec(select(User)).all()

def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Return a user by their ID, or None if not found.
    """
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    """
    Update a user by their ID with the provided data.
    Args:
        session (Session): Database session.
        user_id (int): User ID.
        user_data (dict): Data to update.
    Returns:
        Optional[User]: Updated user or None if not found.
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
    Args:
        session (Session): Database session.
        user_id (int): User ID.
    Returns:
        bool: True if deleted, False if not found.
    """
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True

def save_metric_history(session: Session, device_id: int, cpu: float = None, ram: float = None, disk: float = None, temp: float = None, status: str = None) -> MetricHistory:
    """
    Save a new metric history record for a device.
    Args:
        session (Session): Database session.
        device_id (int): Device ID.
        cpu (float, optional): CPU usage.
        ram (float, optional): RAM usage.
        disk (float, optional): Disk usage.
        temp (float, optional): Temperature.
        status (str, optional): Status.
    Returns:
        MetricHistory: Created metric history object.
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
    Create a new alert for a device.
    Args:
        session (Session): Database session.
        device_id (int): Device ID.
        level (str): Alert level.
        message (str): Alert message.
    Returns:
        Alert: Created alert object.
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
    Args:
        session (Session): Database session.
        unresolved_only (bool, optional): If True, only return unresolved alerts.
    Returns:
        List[Alert]: List of alerts.
    """
    query = select(Alert)
    if unresolved_only:
        query = query.where(Alert.resolved == False)
    return session.exec(query.order_by(Alert.timestamp.desc())).all()

def resolve_alert(session: Session, alert_id: int) -> bool:
    """
    Mark an alert as resolved by its ID.
    Args:
        session (Session): Database session.
        alert_id (int): Alert ID.
    Returns:
        bool: True if resolved, False if not found.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        return False
    alert.resolved = True
    session.add(alert)
    session.commit()
    return True
