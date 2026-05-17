import time
from fastapi import APIRouter, Body, Depends, HTTPException, Request

from app.config import settings
from app.limiting import rate_limit
from app.schemas import EmbeddingRequest, EmbeddingResponse, HealthResponse
from app.security import verify_api_key

router = APIRouter()


async def _get_embedding_model(request: Request):
    embedding_model = getattr(request.app.state, "embedding_model", None)
    if embedding_model is None:
        from app.services.embedding import EmbeddingModel

        embedding_model = EmbeddingModel()
        await embedding_model.load()
        request.app.state.embedding_model = embedding_model
    return embedding_model


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    embedding_model = await _get_embedding_model(request)
    try:
        dimension = embedding_model.dimension
        ready = True
        status_msg = "ok"
    except Exception as exc:
        # model not loaded or failed to infer dimension
        dimension = 0
        ready = False
        status_msg = f"model not ready: {exc}"

    return HealthResponse(
        status=status_msg,
        model=settings.model_name,
        device=settings.device,
        dimension=dimension,
        ready=ready,
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

    embedding_model = await _get_embedding_model(request)
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
