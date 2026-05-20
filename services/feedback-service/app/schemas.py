from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    user_id: Optional[str]
    text: str
    rating: Optional[int]
    session_id: Optional[str] = None
    message_index: Optional[int] = None
    flag_reason: Optional[str] = None


class FeedbackRead(BaseModel):
    id: int
    user_id: Optional[str]
    text: str
    rating: Optional[int]
    created_at: datetime
    session_id: Optional[str]
    message_index: Optional[int]
    flagged: bool
    flag_count: int
    flag_reason: Optional[str]
    review_status: str

    class Config:
        orm_mode = True


class FeedbackReviewAction(BaseModel):
    action: str  # "dismiss", "escalate", "block"
