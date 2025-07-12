from sqlmodel import Session, select
from models import Device, MetricHistory, Alert, User
from typing import List, Optional
from datetime import datetime

def get_session(engine):
    return Session(engine)

def create_device(session: Session, device: Device) -> Device:
    session.add(device)
    session.commit()
    session.refresh(device)
    return device

def get_devices(session: Session) -> List[Device]:
    return session.exec(select(Device)).all()

def get_device(session: Session, device_id: int) -> Optional[Device]:
    return session.get(Device, device_id)

def update_device(session: Session, device_id: int, device_data: dict) -> Optional[Device]:
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
    device = session.get(Device, device_id)
    if not device:
        return False
    session.delete(device)
    session.commit()
    return True

# CRUD para usuarios

def create_user(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_users(session: Session) -> List[User]:
    return session.exec(select(User)).all()

def get_user(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, user_data: dict) -> Optional[User]:
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
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True

def save_metric_history(session: Session, device_id: int, cpu: float = None, ram: float = None, disk: float = None, temp: float = None, status: str = None):
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

def create_alert(session: Session, device_id: int, level: str, message: str):
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
    query = select(Alert)
    if unresolved_only:
        query = query.where(Alert.resolved == False)
    return session.exec(query.order_by(Alert.timestamp.desc())).all()

def resolve_alert(session: Session, alert_id: int) -> bool:
    alert = session.get(Alert, alert_id)
    if not alert:
        return False
    alert.resolved = True
    session.add(alert)
    session.commit()
    return True
