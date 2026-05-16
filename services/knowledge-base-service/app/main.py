from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1 import router as v1_router
from app.config import settings
from app.db import engine
from app.models import Base
from app.services.cache import create_redis_client
from app.services.embedding import EmbeddingServiceClient
from app.services.qdrant import create_qdrant_client


def _configure_logging() -> None:
    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    Base.metadata.create_all(bind=engine)
    app.state.qdrant = create_qdrant_client()
    app.state.embedding_client = EmbeddingServiceClient()
    app.state.redis = create_redis_client()
    yield
    await app.state.embedding_client.close()
    await app.state.redis.close()


app = FastAPI(
    title="LexCam Knowledge Base Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(v1_router, prefix=settings.api_prefix)
