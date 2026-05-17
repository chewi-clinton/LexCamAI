import sys
import respx
import pytest
import httpx

# Ensure the knowledge-base-service `app` package is imported first
sys.path.insert(0, "services/knowledge-base-service")

from app.services.embedding import EmbeddingServiceClient
from app.config import settings


@respx.mock
@pytest.mark.asyncio
async def test_embedding_client_embed_and_health(monkeypatch):
    # Mock embedding service endpoints
    base = settings.embedding_service_url + settings.api_prefix
    embed_route = respx.post(f"{base}/embed").mock(return_value=httpx.Response(200, json={"embeddings": [[0.1, 0.2, 0.3]]}))
    health_route = respx.get(f"{base}/health").mock(return_value=httpx.Response(200, json={"status": "ok"}))

    client = EmbeddingServiceClient()
    emb = await client.embed("hello world")
    assert isinstance(emb, list)
    assert emb == [0.1, 0.2, 0.3]

    h = await client.health()
    assert h["status"] == "ok"

    await client.close()
