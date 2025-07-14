from sqlmodel import SQLModel, Session, create_engine, select
from models import User
import bcrypt

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

username = input("Usuario: ").strip()

with Session(engine) as session:
    user = session.exec(select(User).where(User.username == username)).first()
    if user:
        print(f"Usuario '{username}' ya existe.")
        confirm = input("¿Deseas borrar este usuario y crear uno nuevo? (s/n): ").strip().lower()
        if confirm == 's':
            session.delete(user)
            session.commit()
            print(f"Usuario '{username}' eliminado.")
        else:
            print("Operación cancelada.")
            exit()

password = input("Contraseña: ").strip()
role = input("Rol (user/admin): ").strip() or "user"
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

with Session(engine) as session:
    user = User(username=username, role=role, password_hash=password_hash)
    session.add(user)
    session.commit()
    print(f"Usuario '{username}' creado con rol '{role}'.")
