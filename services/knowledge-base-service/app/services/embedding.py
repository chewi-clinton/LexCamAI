import httpx

from app.config import settings


class EmbeddingServiceClient:
    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=30.0)

    async def close(self) -> None:
        await self._client.aclose()

    async def embed(self, text: str) -> list[float]:
        response = await self._client.post(
            f"{settings.embedding_service_url}{settings.api_prefix}/embed",
            json={"texts": [text]},
        )
        response.raise_for_status()
        payload = response.json()
        embeddings = payload.get("embeddings")
        if not embeddings or not isinstance(embeddings, list):
            raise RuntimeError("Invalid embedding response from Embedding Service")
        return embeddings[0]

    async def health(self) -> dict:
        try:
            resp = await self._client.get(f"{settings.embedding_service_url}{settings.api_prefix}/health")
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return {"status": "unreachable"}
