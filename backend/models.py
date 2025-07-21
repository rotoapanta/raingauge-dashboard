"""
models.py

Modelos de datos para el backend de Raingauge Dashboard.
Define las tablas principales: Device, MetricHistory, User y Alert.
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Device(SQLModel, table=True):
    """
    Representa un dispositivo (Raspberry Pi) registrado en el sistema.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None, description="Nombre del dispositivo")
    ip: str = Field(description="Dirección IP del dispositivo")
    description: Optional[str] = Field(default=None, description="Descripción opcional")
    enabled: bool = Field(default=True, description="Si el dispositivo está habilitado")

class MetricHistory(SQLModel, table=True):
    """
    Historial de métricas reportadas por un dispositivo.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: int = Field(foreign_key="device.id", description="ID del dispositivo asociado")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Fecha y hora de la métrica")
    cpu: Optional[float] = Field(default=None, description="Uso de CPU (%)")
    ram: Optional[float] = Field(default=None, description="Uso de RAM (%)")
    disk: Optional[float] = Field(default=None, description="Uso de disco (%)")
    temp: Optional[float] = Field(default=None, description="Temperatura (°C)")
    status: Optional[str] = Field(default=None, description="Estado reportado")

class User(SQLModel, table=True):
    """
    Usuario del sistema, con rol y credenciales.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(description="Nombre de usuario único")
    email: Optional[str] = Field(default=None, description="Correo electrónico")
    role: str = Field(default="user", description="Rol del usuario: 'admin' o 'user'")
    password_hash: Optional[str] = Field(default=None, description="Hash de la contraseña para login local")

class Alert(SQLModel, table=True):
    """
    Alerta generada por un cambio de estado o evento relevante en un dispositivo.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: int = Field(foreign_key="device.id", description="ID del dispositivo asociado")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Fecha y hora de la alerta")
    level: str = Field(description="Nivel de la alerta: CRITICAL, WARNING, INFO")
    message: str = Field(description="Mensaje de la alerta")
    resolved: bool = Field(default=False, description="Si la alerta ha sido resuelta")
    sent_to_telegram: bool = Field(default=False, description="Si la alerta fue enviada a Telegram")
