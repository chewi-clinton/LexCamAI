from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    user_id: Optional[str]
    text: str
    rating: Optional[int]


class FeedbackRead(BaseModel):
    id: int
    user_id: Optional[str]
    text: str
    rating: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True
