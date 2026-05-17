from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = Field(index=True)
    text: str
    rating: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None
    message_index: Optional[int] = None
    flag_count: int = Field(default=0)
    flagged: bool = Field(default=False)
