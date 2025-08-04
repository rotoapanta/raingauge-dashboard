"""
auth_endpoint.py

Authentication endpoints for the Raspberry Pi Dashboard backend.
Includes local login and JWT generation.

Endpoints de autenticación para el backend de Raspberry Pi Dashboard.
Incluye login local y generación de JWT.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from models import User
from endpoints.device_endpoint import engine
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict

JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretjwtkey")
JWT_ALGORITHM = "HS256"
JWT_EXP_MINUTES = 60

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/local-login")
def local_login(data: LoginRequest) -> Dict[str, str]:
    """
    Local user authentication. Returns a JWT if credentials are valid.
    Autenticación de usuario local. Retorna un JWT si las credenciales son válidas.

    Args:
        data (LoginRequest): Login data (username and password).
        data (LoginRequest): Datos de login (usuario y contraseña).

    Returns:
        Dict[str, str]: JWT token and token type.
        Dict[str, str]: Token JWT y tipo de token.

    Raises:
        HTTPException: If the user does not exist or the password is incorrect.
        HTTPException: Si el usuario no existe o la contraseña es incorrecta.
    """
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == data.username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if not user.password_hash:
            raise HTTPException(status_code=401, detail="No local password set for this user")
        if not bcrypt.checkpw(data.password.encode(), user.password_hash.encode()):
            raise HTTPException(status_code=401, detail="Incorrect password")
        payload = {
            "sub": data.username,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"access_token": token, "token_type": "bearer", "role": user.role}
