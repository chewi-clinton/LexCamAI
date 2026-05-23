from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.status import HTTP_429_TOO_MANY_REQUESTS

from app.api.v1 import router as v1_router
from app.config import settings
from app.monitoring import prometheus_middleware, prometheus_endpoint
from app.limiting import limiter
from app.services.embedding import EmbeddingModel


def _configure_logging() -> None:
    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    model = EmbeddingModel()
    await model.load()
    app.state.embedding_model = model
    yield


app = FastAPI(
    title="LexCam Embedding Service",
    version="0.1.0",
    lifespan=lifespan,
)


def _rate_limit_handler(
    request: Request,
    exc: RateLimitExceeded,
) -> JSONResponse:
    return JSONResponse(
        status_code=HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Rate limit exceeded"},
    )


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)
app.middleware("http")(prometheus_middleware)
app.add_api_route("/metrics", prometheus_endpoint, methods=["GET"])

app.include_router(v1_router, prefix=settings.api_prefix)
