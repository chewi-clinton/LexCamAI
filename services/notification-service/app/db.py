from sqlmodel import SQLModel, create_engine, Session
from .config import settings

engine = create_engine(str(settings.DATABASE_URL), echo=False)


def init_db():
    return None


def get_session():
    with Session(engine) as session:
        yield session
