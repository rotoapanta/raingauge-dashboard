"""
create_local_user.py

Script utilitario para crear un usuario local en la base de datos de Raingauge Dashboard.
Permite crear o reemplazar un usuario con contraseña local y rol especificado.
"""

from sqlmodel import Session, create_engine, select
from models import User
import bcrypt
from typing import Optional

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

def prompt_user_input() -> tuple[str, str, str]:
    """
    Solicita al usuario los datos necesarios para crear un usuario local.
    Returns:
        tuple: (username, password, role)
    """
    username = input("Usuario: ").strip()
    password = input("Contraseña: ").strip()
    role = input("Rol (user/admin): ").strip() or "user"
    return username, password, role

def user_exists(session: Session, username: str) -> Optional[User]:
    """
    Verifica si un usuario ya existe en la base de datos.
    """
    return session.exec(select(User).where(User.username == username)).first()

def delete_user(session: Session, user: User) -> None:
    """
    Elimina un usuario de la base de datos.
    """
    session.delete(user)
    session.commit()

def create_user(session: Session, username: str, password: str, role: str) -> None:
    """
    Crea un nuevo usuario local con el rol y contraseña especificados.
    """
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, role=role, password_hash=password_hash)
    session.add(user)
    session.commit()
    print(f"Usuario '{username}' creado con rol '{role}'.")

def main() -> None:
    username, password, role = prompt_user_input()
    with Session(engine) as session:
        user = user_exists(session, username)
        if user:
            print(f"Usuario '{username}' ya existe.")
            confirm = input("¿Deseas borrar este usuario y crear uno nuevo? (s/n): ").strip().lower()
            if confirm == 's':
                delete_user(session, user)
                print(f"Usuario '{username}' eliminado.")
            else:
                print("Operación cancelada.")
                return
        create_user(session, username, password, role)

if __name__ == "__main__":
    main()
