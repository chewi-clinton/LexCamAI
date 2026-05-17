import sys
import types
import pytest
from fastapi.testclient import TestClient


class FakeQdrant:
    def get_collection(self, name):
        return {"name": name}


class FakeEmbeddingClient:
    def __init__(self):
        pass

    async def health(self):
        return {"status": "ok"}

    async def close(self):
        return None


class FakeRedis:
    async def ping(self):
        return True

    async def close(self):
        return None


def test_health_endpoint(monkeypatch):
    # Ensure the knowledge-base-service `app` package is imported first
    import sys
    kb_path = "services/knowledge-base-service"
    sys.path.insert(0, kb_path)

    # Use an in-memory SQLite DB for tests to avoid attempting to connect to Postgres
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")

    # Ensure app config/db pick up the test DATABASE_URL
    import importlib
    try:
        import app.config as _config
        importlib.reload(_config)
    except Exception:
        pass
    try:
        import app.db as _db
        importlib.reload(_db)
    except Exception:
        pass

    # Patch creation functions so lifespan uses our fakes
    # Prevent metadata.create_all from running DB-specific DDL in tests
    try:
        import app.models as _models
        _models.Base.metadata.create_all = lambda bind=None: None
    except Exception:
        pass

    import app.services.qdrant as qmod
    import app.services.embedding as emod
    import app.services.cache as cmod

    monkeypatch.setattr(qmod, "create_qdrant_client", lambda: FakeQdrant())
    monkeypatch.setattr(emod, "EmbeddingServiceClient", lambda: FakeEmbeddingClient())
    monkeypatch.setattr(cmod, "create_redis_client", lambda: FakeRedis())

    # Import app after monkeypatching so lifespan uses the fakes
    from app.main import app

    with TestClient(app) as client:
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["qdrant_collection"] is not None
        assert body["embedding_service"]["status"] == "ok"
        assert body["redis"] == "ok"
