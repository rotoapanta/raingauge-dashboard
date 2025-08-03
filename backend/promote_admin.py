"""
promote_admin.py

Utility script to promote an existing user to admin role in the Raingauge Dashboard database.

Script utilitario para promover un usuario existente al rol de administrador en la base de datos del Raingauge Dashboard.
"""

from sqlmodel import Session, create_engine, select
from models import User
from typing import Optional

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

def promote_to_admin(session: Session, username: str) -> None:
    """
    Promote an existing user to admin role.
    Args:
        session (Session): Database session.
        username (str): Username to promote.
    ---
    Promueve un usuario existente al rol de administrador.
    Parámetros:
        session (Session): Sesión de base de datos.
        username (str): Nombre de usuario a promover.
    """
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        print(f"User '{username}' not found in the database.")
    else:
        user.role = "admin"
        session.add(user)
        session.commit()
        print(f"User '{username}' is now admin.")

def main() -> None:
    """
    Main entry point for the script. Handles user promotion.
    ---
    Punto de entrada principal del script. Maneja la promoción de usuario.
    """
    username = input("Username to promote to admin: ").strip()
    with Session(engine) as session:
        promote_to_admin(session, username)

if __name__ == "__main__":
    main()
