from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: Optional[str]
    message: str


class NotificationRead(BaseModel):
    id: int
    user_id: Optional[str]
    message: str
    delivered: bool
    created_at: datetime

    class Config:
        orm_mode = True
