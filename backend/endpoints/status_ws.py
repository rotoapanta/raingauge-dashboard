from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from models import Device, MetricHistory, Alert
from endpoints.device_endpoint import engine
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/status")
async def websocket_status(websocket: WebSocket):
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
