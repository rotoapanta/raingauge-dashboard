from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Device(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None
    ip: str
    description: Optional[str] = None
    enabled: bool = True

class MetricHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: int = Field(foreign_key="device.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cpu: Optional[float] = None
    ram: Optional[float] = None
    disk: Optional[float] = None
    temp: Optional[float] = None
    status: Optional[str] = None

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: Optional[str] = None
    role: str = "user"  # "admin" o "user"
    password_hash: Optional[str] = None  # Para login local

class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: int = Field(foreign_key="device.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str  # e.g. "CRITICAL", "WARNING", "INFO"
    message: str
    resolved: bool = False
    sent_to_telegram: bool = False
