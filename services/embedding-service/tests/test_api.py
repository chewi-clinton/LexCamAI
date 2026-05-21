from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app


class _FakeModel:
    @property
    def dimension(self):
        return 384

    async def load(self):
        pass

    async def embed(self, texts, input_type=None, normalize=None):
        return [[0.0] * self.dimension for _ in texts]


def test_health():
    with patch("app.main.EmbeddingModel", return_value=_FakeModel()):
        with TestClient(app) as client:
            r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["dimension"] == 384
    assert r.json()["ready"] is True


def test_embed_single():
    with patch("app.main.EmbeddingModel", return_value=_FakeModel()):
        with TestClient(app) as client:
            r = client.post("/api/v1/embed", json={"texts": ["hello world"]})
    assert r.status_code == 200
    data = r.json()
    assert "embeddings" in data
    assert len(data["embeddings"]) == 1
    assert len(data["embeddings"][0]) == 384


def test_embed_multiple():
    with patch("app.main.EmbeddingModel", return_value=_FakeModel()):
        with TestClient(app) as client:
            r = client.post("/api/v1/embed", json={"texts": ["first", "second", "third"]})
    assert r.status_code == 200
    assert len(r.json()["embeddings"]) == 3


def test_embed_batch_too_large():
    with patch("app.main.EmbeddingModel", return_value=_FakeModel()):
        with TestClient(app) as client:
            payload = {"texts": ["x"] * 65}
            r = client.post("/api/v1/embed", json=payload)
    assert r.status_code == 413
