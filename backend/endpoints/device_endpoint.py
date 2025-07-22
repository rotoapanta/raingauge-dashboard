"""
device_endpoint.py

Endpoints for device management in the Raingauge Dashboard backend.
Includes CRUD operations, metrics, and alerts.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, create_engine, Session, select
from typing import List, Optional, Dict, Any
from models import Device, MetricHistory, Alert
import crud
from datetime import datetime
from auth_utils import get_current_user
from utils import send_telegram_alert
import logging
logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL, echo=True)

# Create tables if they do not exist
SQLModel.metadata.create_all(engine)

def get_session():
    """
    Generator for database sessions for dependency injection.
    """
    with Session(engine) as session:
        yield session

router = APIRouter(prefix="/devices", tags=["devices"])

@router.post("/", response_model=Device)
async def create_device(device: Device, session: Session = Depends(get_session), user: str = Depends(get_current_user)) -> Device:
    """
    Create a new device and send a Telegram alert.
    """
    try:
        created = crud.create_device(session, device)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    from utils import escape_markdown
    description = escape_markdown(device.description if device.description not in (None, "", "null") else "-")
    enabled = escape_markdown("Yes" if getattr(device, 'enabled', True) else "No")
    msg = (
        "📡🆕 *New device registered*\n"
        f"• IP: {escape_markdown(device.ip)}\n"
        f"• Description: {description}\n"
        f"• Enabled: {enabled}\n"
        f"• Created by: {escape_markdown(user)}"
    )
    await send_telegram_alert(msg, parse_mode="MarkdownV2")
    return created

@router.get("/", response_model=List[Device])
def read_devices(session: Session = Depends(get_session)) -> List[Device]:
    """
    List all registered devices.
    """
    return crud.get_devices(session)

@router.get("/alerts", response_model=List[Alert])
def get_alerts(session: Session = Depends(get_session), unresolved_only: bool = False) -> List[Alert]:
    """
    List all alerts, optionally only unresolved ones.
    """
    return crud.get_alerts(session, unresolved_only=unresolved_only)

@router.post("/alerts/{alert_id}/resolve", response_model=Dict[str, Any])
def resolve_alert(alert_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Mark an alert as resolved.
    """
    ok = crud.resolve_alert(session, alert_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"ok": True}

@router.get("/{device_id}", response_model=Device)
def read_device(device_id: int, session: Session = Depends(get_session)) -> Device:
    """
    Get a device by its ID.
    """
    device = crud.get_device(session, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=Device)
async def update_device(device_id: int, device: Device, session: Session = Depends(get_session), user: str = Depends(get_current_user)) -> Device:
    """
    Update an existing device and send a Telegram alert.
    """
    updated = crud.update_device(session, device_id, device.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Device not found")
    from utils import escape_markdown
    description = escape_markdown(device.description if device.description not in (None, "", "null") else "-")
    enabled = escape_markdown("Yes" if getattr(device, 'enabled', True) else "No")
    msg = (
        "🔄 *Device updated*\n"
        f"• IP: {escape_markdown(device.ip)}\n"
        f"• Description: {description}\n"
        f"• Enabled: {enabled}\n"
        f"• Updated by: {escape_markdown(user)}"
    )
    await send_telegram_alert(msg, parse_mode="MarkdownV2")
    return updated

@router.delete("/{device_id}", response_model=Dict[str, Any])
def delete_device(device_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Delete a device by its ID.
    """
    device = session.get(Device, device_id)
    if not device:
        return {"ok": False, "detail": "Device not found"}
    description = device.description if device.description not in (None, "", "null") else "-"
    enabled = "Yes" if getattr(device, 'enabled', True) else "No"
    msg = (
        "🗑️❌ *Device deletion request*\n"
        f"• IP: {device.ip}\n"
        f"• Description: {description}\n"
        f"• Enabled: {enabled}\n"
        f"• Requested by: {user}"
    )
    try:
        import asyncio
        asyncio.create_task(send_telegram_alert(msg))
    except Exception as e:
        import logging
        logging.error(f"Error sending Telegram alert: {e}")
    try:
        deleted = crud.delete_device(session, device_id)
    except Exception as e:
        import logging
        logging.error(f"Error deleting device {device_id}: {e}")
        return {"ok": False, "detail": f"Error deleting device: {str(e)}"}
    return {"ok": True}

@router.get("/{device_id}/metrics", response_model=List[MetricHistory])
def get_device_metrics(device_id: int, session: Session = Depends(get_session),
                      start: Optional[datetime] = None, end: Optional[datetime] = None) -> List[MetricHistory]:
    """
    Get the metric history of a device within an optional date range.
    """
    query = select(MetricHistory).where(MetricHistory.device_id == device_id)
    if start:
        query = query.where(MetricHistory.timestamp >= start)
    if end:
        query = query.where(MetricHistory.timestamp <= end)
    return session.exec(query.order_by(MetricHistory.timestamp)).all()
