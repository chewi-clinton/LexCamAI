from sqlmodel import SQLModel, create_engine, Session
from .config import settings

engine = create_engine(str(settings.DATABASE_URL), echo=False)


def init_db():
    from . import models  # noqa: F401 — registers SQLModel tables
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
