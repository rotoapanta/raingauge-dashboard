from sqlmodel import SQLModel, Session, create_engine, select
from models import User
import bcrypt

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

username = input("Usuario: ").strip()
password = input("Contraseña: ").strip()
role = input("Rol (user/admin): ").strip() or "user"

password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

with Session(engine) as session:
    user = session.exec(select(User).where(User.username == username)).first()
    if user:
        print("Usuario ya existe.")
    else:
        user = User(username=username, role=role, password_hash=password_hash)
        session.add(user)
        session.commit()
        print(f"Usuario '{username}' creado con rol '{role}'.")
