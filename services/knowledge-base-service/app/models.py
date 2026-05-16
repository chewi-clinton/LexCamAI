import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import TSVECTOR, UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class LawDocument(Base):
    __tablename__ = "law_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(length=128), nullable=False)
    name = Column(String(length=256), nullable=False)
    jurisdiction = Column(String(length=128), nullable=False)
    language = Column(String(length=16), nullable=False)
    version = Column(String(length=64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    articles = relationship("LawArticle", back_populates="document")


class LawArticle(Base):
    __tablename__ = "law_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("law_documents.id"), nullable=False)
    article_number = Column(String(length=128), nullable=False)
    chapter = Column(String(length=128), nullable=True)
    title = Column(String(length=512), nullable=True)
    full_text = Column(Text, nullable=False)
    plain_summary = Column(Text, nullable=True)
    domain = Column(String(length=64), nullable=False)
    language = Column(String(length=16), nullable=False)
    qdrant_id = Column(String(length=128), nullable=True)
    search_vector = Column(TSVECTOR, nullable=True)

    document = relationship("LawDocument", back_populates="articles")


Index("ix_law_articles_search_vector", LawArticle.search_vector, postgresql_using="gin")
