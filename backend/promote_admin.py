from sqlmodel import SQLModel, Session, create_engine, select
from models import User

DATABASE_URL = "sqlite:///raspberry.db"
engine = create_engine(DATABASE_URL)

username = input("Usuario a promover a admin: ").strip()

with Session(engine) as session:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        print(f"Usuario '{username}' no encontrado en la base de datos.")
    else:
        user.role = "admin"
        session.add(user)
        session.commit()
        print(f"Usuario '{username}' ahora es admin.")
