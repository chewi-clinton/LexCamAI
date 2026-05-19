from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LawDocumentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    jurisdiction: str
    language: str
    version: Optional[str]
    created_at: datetime


class LawArticleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    document_id: UUID
    document_code: Optional[str]
    document_name: Optional[str]
    article_number: str
    title: Optional[str]
    domain: str
    language: str


class ArticleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    document_id: UUID
    document_code: Optional[str]
    document_name: Optional[str]
    article_number: str
    chapter: Optional[str]
    title: Optional[str]
    full_text: str
    plain_summary: Optional[str]
    domain: str
    language: str
    qdrant_id: Optional[str]


class SearchRequest(BaseModel):
    query: str
    language: Optional[str] = None
    domain: Optional[str] = None
    limit: Optional[int] = 10


class SearchResultItem(BaseModel):
    article_id: UUID
    law_name: str
    article_number: str
    title: Optional[str]
    domain: str
    language: str
    text_preview: str
    score: float


class RetrieveRequest(BaseModel):
    query_vector: List[float]
    top_k: Optional[int] = 5
    domain_filter: Optional[List[str]] = None


class RetrieveItem(BaseModel):
    article_id: UUID
    law_name: str
    article_number: str
    domain: str
    language: str
    text_preview: str
    score: float


class RetrieveResponse(BaseModel):
    results: List[RetrieveItem]


class IngestArticleInput(BaseModel):
    article_number: str
    chapter: Optional[str] = None
    title: Optional[str] = None
    full_text: str
    plain_summary: Optional[str] = None
    domain: str
    language: str = "fr"


class IngestRequest(BaseModel):
    code: str
    name: str
    jurisdiction: str = "cameroon"
    language: str = "fr"
    version: Optional[str] = None
    articles: List[IngestArticleInput]


class IngestResponse(BaseModel):
    document_id: UUID
    articles_ingested: int
