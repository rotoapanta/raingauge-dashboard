"""
status_ws.py

WebSocket endpoint for real-time transmission of device status, metrics, and alerts.

Endpoint WebSocket para transmitir en tiempo real el estado de dispositivos, métricas y alertas.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from models import Device, MetricHistory, Alert
from endpoints.device_endpoint import engine
import asyncio
from typing import List, Dict, Any

router = APIRouter()

class ConnectionManager:
    """
    Manages active WebSocket connections and message broadcasting.
    Gestiona las conexiones WebSocket activas y el envío de mensajes.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """
        Accept and register a new WebSocket connection.
        Acepta y registra una nueva conexión WebSocket.
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """
        Remove a closed WebSocket connection.
        Elimina una conexión WebSocket cerrada.
        """
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]) -> None:
        """
        Send a message to all active connections.
        Envía un mensaje a todas las conexiones activas.
        """
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/status")
async def websocket_status(websocket: WebSocket) -> None:
    """
    WebSocket that periodically transmits device status, metrics, and alerts.
    WebSocket que transmite periódicamente el estado de dispositivos, métricas y alertas.
    """
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            with Session(engine) as session:
                devices = session.exec(select(Device)).all()
                metrics = session.exec(select(MetricHistory)).all()
                alerts = session.exec(select(Alert).where(Alert.resolved == False)).all()
                await websocket.send_json({
                    "devices": [d.dict() for d in devices],
                    "metrics": [m.dict() for m in metrics],
                    "alerts": [a.dict() for a in alerts],
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
