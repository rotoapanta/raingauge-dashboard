from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from models import User, Alert
import crud
from auth_utils import get_current_user
from endpoints.device_endpoint import engine

router = APIRouter(prefix="/users", tags=["users"])

def get_session():
    with Session(engine) as session:
        yield session

def admin_required(user: str = Depends(get_current_user), session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.username == user)).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden realizar esta acción")
    return db_user

@router.post("/", response_model=User)
def create_user(user_obj: User, session: Session = Depends(get_session), admin=Depends(admin_required)):
    return crud.create_user(session, user_obj)

@router.get("/", response_model=List[User])
def read_users(session: Session = Depends(get_session), admin=Depends(admin_required)):
    return crud.get_users(session)

from fastapi import Query

@router.get("/alerts", response_model=List[Alert])
def get_alerts(
    session: Session = Depends(get_session),
    unresolved_only: bool = Query(False)
):
    return crud.get_alerts(session, unresolved_only=unresolved_only)

@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, session: Session = Depends(get_session), admin=Depends(admin_required)):
    user = crud.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user_obj: User, session: Session = Depends(get_session), admin=Depends(admin_required)):
    updated = crud.update_user(session, user_id, user_obj.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.delete("/{user_id}", response_model=dict)
def delete_user(user_id: int, session: Session = Depends(get_session), admin=Depends(admin_required)):
    deleted = crud.delete_user(session, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}
