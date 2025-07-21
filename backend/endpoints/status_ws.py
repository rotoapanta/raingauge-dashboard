"""
status_ws.py

WebSocket endpoint para transmitir en tiempo real el estado de dispositivos, métricas y alertas.
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
    Gestiona las conexiones WebSocket activas y el envío de mensajes.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """
        Acepta y registra una nueva conexión WebSocket.
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """
        Elimina una conexión WebSocket cerrada.
        """
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]) -> None:
        """
        Envía un mensaje a todas las conexiones activas.
        """
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/status")
async def websocket_status(websocket: WebSocket) -> None:
    """
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
