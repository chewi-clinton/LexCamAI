from typing import Optional
from datetime import datetime
from pydantic import BaseModel, AnyUrl


class ScrapeCreate(BaseModel):
    url: AnyUrl


class ScrapeRead(BaseModel):
    id: int
    url: str
    status: str
    result: Optional[str]
    created_at: datetime
    finished_at: Optional[datetime]

    class Config:
        orm_mode = True
