from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ldap3 import Server, Connection, ALL, NTLM, SIMPLE, SUBTREE
import jwt
import os
from datetime import datetime, timedelta

LDAP_SERVER = os.environ.get("LDAP_SERVER", "ldap://srvbckup.igepn.edu.ec")
LDAP_BASE_DN = os.environ.get("LDAP_BASE_DN", "DC=igepn,DC=edu,DC=ec")
LDAP_SEARCH_ATTR = os.environ.get("LDAP_SEARCH_ATTR", "sAMAccountName")
JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretjwtkey")
JWT_ALGORITHM = "HS256"
JWT_EXP_MINUTES = 60

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    from sqlmodel import Session, select
    from models import User
    from endpoints.device_endpoint import engine
    server = Server(LDAP_SERVER, get_info=ALL)
    # Buscar DN del usuario
    try:
        conn = Connection(server, auto_bind=True)
        conn.search(
            search_base=LDAP_BASE_DN,
            search_filter=f'({LDAP_SEARCH_ATTR}={data.username})',
            search_scope=SUBTREE,
            attributes=["distinguishedName"]
        )
        if not conn.entries:
            raise HTTPException(status_code=401, detail="Usuario no encontrado en AD")
        user_dn = conn.entries[0].distinguishedName.value
        conn.unbind()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error buscando usuario en AD: {e}")
    # Intentar bind con el usuario y contraseña
    try:
        user_conn = Connection(server, user=user_dn, password=data.password, authentication=SIMPLE, auto_bind=True)
        user_conn.unbind()
    except Exception:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    # Crear usuario local si no existe
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == data.username)).first()
        if not user:
            user = User(username=data.username, role="user")
            session.add(user)
            session.commit()
            session.refresh(user)
    # Generar JWT
    payload = {
        "sub": data.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": user.role}

import bcrypt

@router.post("/local-login")
def local_login(data: LoginRequest):
    from sqlmodel import Session, select
    from models import User
    from endpoints.device_endpoint import engine
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == data.username)).first()
        if not user or not user.password_hash:
            raise HTTPException(status_code=401, detail="Usuario no encontrado o sin contraseña local")
        if not bcrypt.checkpw(data.password.encode(), user.password_hash.encode()):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")
        # Generar JWT
        payload = {
            "sub": data.username,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"access_token": token, "token_type": "bearer", "role": user.role}
