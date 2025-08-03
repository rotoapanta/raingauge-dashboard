"""
create_local_user.py

Utility script to create a local user in the Raingauge Dashboard database.
Allows creating or replacing a user with a local password and specified role.

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
    Prompt the user for the necessary data to create a local user.
    Solicita al usuario los datos necesarios para crear un usuario local.
    Returns:
        tuple: (username, password, role)
        tuple: (usuario, contraseña, rol)
    """
    username = input("Username: ").strip()
    password = input("Password: ").strip()
    role = input("Role (user/admin): ").strip() or "user"
    return username, password, role

def user_exists(session: Session, username: str) -> Optional[User]:
    """
    Check if a user already exists in the database.
    Verifica si un usuario ya existe en la base de datos.
    Args:
        session (Session): Database session.
        username (str): Username to check.
        session (Session): Sesión de base de datos.
        username (str): Nombre de usuario a verificar.
    Returns:
        Optional[User]: The user if found, otherwise None.
        Optional[User]: El usuario si existe, si no None.
    """
    return session.exec(select(User).where(User.username == username)).first()

def delete_user(session: Session, user: User) -> None:
    """
    Delete a user from the database.
    Elimina un usuario de la base de datos.
    Args:
        session (Session): Database session.
        user (User): User to delete.
        session (Session): Sesión de base de datos.
        user (User): Usuario a eliminar.
    """
    session.delete(user)
    session.commit()

def create_user(session: Session, username: str, password: str, role: str) -> None:
    """
    Create a new local user with the specified role and password.
    Crea un nuevo usuario local con el rol y contraseña especificados.
    Args:
        session (Session): Database session.
        username (str): Username for the new user.
        password (str): Password for the new user.
        role (str): Role for the new user.
        session (Session): Sesión de base de datos.
        username (str): Nombre de usuario para el nuevo usuario.
        password (str): Contraseña para el nuevo usuario.
        role (str): Rol para el nuevo usuario.
    """
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, role=role, password_hash=password_hash)
    session.add(user)
    session.commit()
    print(f"User '{username}' created with role '{role}'.")

def main() -> None:
    """
    Main entry point for the script. Handles user creation and replacement logic.
    Punto de entrada principal del script. Maneja la lógica de creación y reemplazo de usuario.
    """
    username, password, role = prompt_user_input()
    with Session(engine) as session:
        user = user_exists(session, username)
        if user:
            print(f"User '{username}' already exists.")
            confirm = input("Do you want to delete this user and create a new one? (y/n): ").strip().lower()
            if confirm == 'y':
                delete_user(session, user)
                print(f"User '{username}' deleted.")
            else:
                print("Operation cancelled.")
                return
        create_user(session, username, password, role)

if __name__ == "__main__":
    main()
