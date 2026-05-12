from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, conlist


class EmbeddingRequest(BaseModel):
    texts: conlist(str, min_items=1) = Field(..., description="Texts to embed")
    input_type: Literal["query", "passage"] | None = Field(
        default=None,
        description="Optional E5 prefix to apply",
    )
    normalize: bool | None = Field(
        default=None,
        description="Override embedding normalization",
    )


class EmbeddingResponse(BaseModel):
    model: str
    dimension: int
    normalized: bool
    embeddings: list[list[float]]
    processing_ms: float


class HealthResponse(BaseModel):
    status: str
    model: str
    device: str
    dimension: int
    ready: bool
