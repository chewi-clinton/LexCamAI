import logging
from sqlmodel import SQLModel, create_engine, Session
from .config import settings

logger = logging.getLogger(__name__)

engine = create_engine(str(settings.DATABASE_URL), echo=False)


def init_db():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as exc:
        # Tables or sequences may already exist from a prior migration
        logger.warning("init_db skipped (pre-existing schema): %s", exc)


def get_session():
    with Session(engine) as session:
        yield session
