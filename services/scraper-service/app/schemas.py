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


class LawScrapeCreate(BaseModel):
    url: AnyUrl
    code: str
    name: str
    domain: str = "general"
    language: str = "fr"


class LawScrapeRead(BaseModel):
    id: int
    url: str
    code: str
    name: str
    domain: str
    language: str
    status: str
    result: Optional[str]
    articles_ingested: int
    created_at: datetime
    finished_at: Optional[datetime]

    class Config:
        orm_mode = True
