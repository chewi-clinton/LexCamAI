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
