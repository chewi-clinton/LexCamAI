from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class RagSession(Base):
    __tablename__ = "rag_sessions"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text, nullable=False)
    prompt = Column(Text, nullable=True)
    response = Column(Text, nullable=True)
    sources = Column(JSON(), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
