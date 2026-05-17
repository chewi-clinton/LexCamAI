from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class DeliveryLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    notification_id: Optional[int] = Field(index=True)
    to_address: str
    subject: str
    status: str = Field(default="pending")
    error: Optional[str] = None
    sent_at: Optional[datetime] = None
