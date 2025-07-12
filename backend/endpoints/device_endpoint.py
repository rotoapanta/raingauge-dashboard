from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, create_engine, Session, select
from typing import List
from models import Device, MetricHistory, Alert
import crud
from datetime import datetime
from auth_utils import get_current_user

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL, echo=True)

# Crear tablas si no existen
SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

router = APIRouter(prefix="/devices", tags=["devices"])

@router.post("/", response_model=Device)
def create_device(device: Device, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return crud.create_device(session, device)

@router.get("/", response_model=List[Device])
def read_devices(session: Session = Depends(get_session)):
    return crud.get_devices(session)

@router.get("/{device_id}", response_model=Device)
def read_device(device_id: int, session: Session = Depends(get_session)):
    device = crud.get_device(session, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=Device)
def update_device(device_id: int, device: Device, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    updated = crud.update_device(session, device_id, device.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Device not found")
    return updated

@router.delete("/{device_id}", response_model=dict)
def delete_device(device_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    deleted = crud.delete_device(session, device_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"ok": True}

@router.get("/{device_id}/metrics", response_model=List[MetricHistory])
def get_device_metrics(device_id: int, session: Session = Depends(get_session),
                      start: datetime = None, end: datetime = None):
    query = select(MetricHistory).where(MetricHistory.device_id == device_id)
    if start:
        query = query.where(MetricHistory.timestamp >= start)
    if end:
        query = query.where(MetricHistory.timestamp <= end)
    return session.exec(query.order_by(MetricHistory.timestamp)).all()

@router.get("/alerts", response_model=List[Alert])
def get_alerts(session: Session = Depends(get_session), unresolved_only: bool = False):
    return crud.get_alerts(session, unresolved_only=unresolved_only)

@router.post("/alerts/{alert_id}/resolve", response_model=dict)
def resolve_alert(alert_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    ok = crud.resolve_alert(session, alert_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"ok": True}
