"""
create_local_user.py

Utility script to create a local user in the Raingauge Dashboard database.
Allows creating or replacing a user with a local password and specified role.
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
    Returns:
        tuple: (username, password, role)
    """
    username = input("Username: ").strip()
    password = input("Password: ").strip()
    role = input("Role (user/admin): ").strip() or "user"
    return username, password, role

def user_exists(session: Session, username: str) -> Optional[User]:
    """
    Check if a user already exists in the database.
    Args:
        session (Session): Database session.
        username (str): Username to check.
    Returns:
        Optional[User]: The user if found, otherwise None.
    """
    return session.exec(select(User).where(User.username == username)).first()

def delete_user(session: Session, user: User) -> None:
    """
    Delete a user from the database.
    Args:
        session (Session): Database session.
        user (User): User to delete.
    """
    session.delete(user)
    session.commit()

def create_user(session: Session, username: str, password: str, role: str) -> None:
    """
    Create a new local user with the specified role and password.
    Args:
        session (Session): Database session.
        username (str): Username for the new user.
        password (str): Password for the new user.
        role (str): Role for the new user.
    """
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, role=role, password_hash=password_hash)
    session.add(user)
    session.commit()
    print(f"User '{username}' created with role '{role}'.")

def main() -> None:
    """
    Main entry point for the script. Handles user creation and replacement logic.
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
