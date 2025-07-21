"""
promote_admin.py

Script utilitario para promover un usuario existente a rol de administrador en la base de datos de Raingauge Dashboard.
"""

from sqlmodel import Session, create_engine, select
from models import User
from typing import Optional

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

def promote_to_admin(session: Session, username: str) -> None:
    """
    Promueve un usuario existente a rol de administrador.
    Args:
        session (Session): Sesión de base de datos.
        username (str): Nombre de usuario a promover.
    """
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        print(f"Usuario '{username}' no encontrado en la base de datos.")
    else:
        user.role = "admin"
        session.add(user)
        session.commit()
        print(f"Usuario '{username}' ahora es admin.")

def main() -> None:
    username = input("Usuario a promover a admin: ").strip()
    with Session(engine) as session:
        promote_to_admin(session, username)

if __name__ == "__main__":
    main()
