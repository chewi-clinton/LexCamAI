from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class ScrapeJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(index=True)
    status: str = Field(default="pending")
    result: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None


class LawScrapeJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(index=True)
    code: str
    name: str
    domain: str = "general"
    language: str = "fr"
    status: str = Field(default="pending")
    result: Optional[str] = None
    articles_ingested: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
