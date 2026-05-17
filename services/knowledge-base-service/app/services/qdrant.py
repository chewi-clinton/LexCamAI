from qdrant_client import QdrantClient

from app.config import settings


def create_qdrant_client() -> QdrantClient:
    client_kwargs = {"url": settings.qdrant_url}
    if settings.qdrant_api_key:
        client_kwargs["api_key"] = settings.qdrant_api_key
    return QdrantClient(**client_kwargs)
