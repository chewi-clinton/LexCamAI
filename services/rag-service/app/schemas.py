from pydantic import BaseModel
from typing import List, Optional


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class ResultSource(BaseModel):
    id: str
    score: Optional[float]
    snippet: Optional[str]


class QueryResponse(BaseModel):
    query: str
    results: List[ResultSource]
    synthesized_answer: str
    provenance: List[ResultSource]
