import time
from fastapi import APIRouter, Body, Depends, HTTPException, Request

from app.config import settings
from app.limiting import rate_limit
from app.schemas import EmbeddingRequest, EmbeddingResponse, HealthResponse
from app.security import verify_api_key

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    embedding_model = request.app.state.embedding_model
    return HealthResponse(
        status="ok",
        model=settings.model_name,
        device=settings.device,
        dimension=embedding_model.dimension,
        ready=True,
    )


@router.post(
    "/embed",
    response_model=EmbeddingResponse,
    dependencies=[Depends(verify_api_key)],
)
@rate_limit()
async def embed(request: Request, payload: EmbeddingRequest = Body(...)) -> EmbeddingResponse:
    if len(payload.texts) > settings.max_batch_size:
        raise HTTPException(
            status_code=413,
            detail="Batch size exceeds MAX_BATCH_SIZE",
        )

    embedding_model = request.app.state.embedding_model
    start = time.perf_counter()
    embeddings = await embedding_model.embed(
        payload.texts,
        payload.input_type,
        payload.normalize,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000
    normalized = settings.normalize_embeddings if payload.normalize is None else payload.normalize

    return EmbeddingResponse(
        model=settings.model_name,
        dimension=embedding_model.dimension,
        normalized=normalized,
        embeddings=embeddings,
        processing_ms=elapsed_ms,
    )
