from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = Field(index=True)
    message: str
    delivered: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
