"""
user_endpoint.py

Endpoints for user management in the Raingauge Dashboard backend.
Includes CRUD operations and user-related alerts.

Endpoints para la gestión de usuarios en el backend de Raingauge Dashboard.
Incluye operaciones CRUD y alertas relacionadas con usuarios.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List, Dict, Any
from models import User, Alert
import crud
from auth_utils import get_current_user
from endpoints.device_endpoint import engine
from utils import send_telegram_alert
import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

def get_session():
    """
    Generator for database sessions for dependency injection.
    Generador de sesiones de base de datos para inyección de dependencias.
    """
    with Session(engine) as session:
        yield session

def admin_required(user: str = Depends(get_current_user), session: Session = Depends(get_session)) -> User:
    """
    Verifies that the authenticated user is an administrator.
    Verifica que el usuario autenticado sea administrador.
    """
    db_user = session.exec(select(User).where(User.username == user)).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can perform this action")
    return db_user

@router.post("/", response_model=User)
async def create_user(user_obj: User, session: Session = Depends(get_session), admin: User = Depends(admin_required)) -> User:
    """
    Create a new user and send a Telegram alert.
    Crea un nuevo usuario y envía una alerta de Telegram.
    """
    try:
        created = crud.create_user(session, user_obj)
    except Exception as e:
        import logging
        logging.error(f"Error en create_user: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    from utils import escape_markdown
    msg = (
        "👤🆕 *New user created*\n"
        f"• Username: {escape_markdown(user_obj.username)}\n"
        f"• Email: {escape_markdown(getattr(user_obj, 'email', '-') or '-')}\n"
        f"• Role: {escape_markdown(getattr(user_obj, 'role', '-'))}\n"
        f"• Created by: {escape_markdown(admin.username)}"
    )
    await send_telegram_alert(msg, parse_mode="MarkdownV2")
    return created

@router.get("/", response_model=List[User])
def read_users(session: Session = Depends(get_session), admin: User = Depends(admin_required)) -> List[User]:
    """
    List all registered users (admin only).
    Lista todos los usuarios registrados (solo para administradores).
    """
    try:
        return crud.get_users(session)
    except Exception as e:
        import logging
        logging.error(f"Error in read_users: {e}")
        raise HTTPException(status_code=400, detail=f"Error getting users: {str(e)}")

@router.get("/alerts", response_model=List[Alert])
def get_alerts(
    session: Session = Depends(get_session),
    unresolved_only: bool = Query(False)
) -> List[Alert]:
    """
    List all alerts, optionally only unresolved ones.
    Lista todas las alertas, opcionalmente solo las no resueltas.
    """
    return crud.get_alerts(session, unresolved_only=unresolved_only)

@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, session: Session = Depends(get_session), admin: User = Depends(admin_required)) -> User:
    """
    Get a user by ID (admin only).
    Obtiene un usuario por su ID (solo para administradores).
    """
    user = crud.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, user_obj: User, session: Session = Depends(get_session), admin: User = Depends(admin_required)) -> User:
    """
    Update an existing user and send a Telegram alert.
    Actualiza un usuario existente y envía una alerta de Telegram.
    """
    updated = crud.update_user(session, user_id, user_obj.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    from utils import escape_markdown
    msg = (
        "✏️ *User updated*\n"
        f"• Username: {escape_markdown(user_obj.username)}\n"
        f"• Email: {escape_markdown(getattr(user_obj, 'email', '-') or '-')}\n"
        f"• Role: {escape_markdown(getattr(user_obj, 'role', '-') or '-')}\n"
        f"• Updated by: {escape_markdown(admin.username)}"
    )
    await send_telegram_alert(msg, parse_mode="MarkdownV2")
    return updated

@router.delete("/{user_id}", response_model=Dict[str, Any])
def delete_user(user_id: int, session: Session = Depends(get_session), admin: User = Depends(admin_required)) -> Dict[str, Any]:
    """
    Delete a user by ID (admin only).
    Elimina un usuario por su ID (solo para administradores).
    """
    user = session.get(User, user_id)
    if not user:
        return {"ok": False, "detail": "User not found"}
    msg = f"User {admin.username} deleted user {user.username}"
    try:
        import asyncio
        asyncio.create_task(send_telegram_alert(msg))
    except Exception as e:
        import logging
        logging.error(f"Error sending Telegram alert: {e}")
    try:
        deleted = crud.delete_user(session, user_id)
    except Exception as e:
        import logging
        logging.error(f"Error deleting user {user_id}: {e}")
        return {"ok": False, "detail": f"Error deleting user: {str(e)}"}
    return {"ok": True}
