import io
import uuid as _uuid
from unittest.mock import MagicMock
from fastapi.testclient import TestClient


class _FakeQdrant:
    def get_collection(self, name):
        return {"name": name}

    def search(self, **_):
        return []

    def upsert(self, **_):
        pass

    def create_collection(self, **_):
        pass


class _Hit:
    def __init__(self):
        self.payload = {
            "article_id": str(_uuid.uuid4()),
            "law_name": "Labour Code",
            "article_number": "Art. 1",
            "title": "Introduction",
            "domain": "labor",
            "language": "fr",
            "text_preview": "Sample text",
        }
        self.score = 0.9


class _FakeQdrantHit(_FakeQdrant):
    def search(self, **_):
        return [_Hit()]


class _FakeRedis:
    async def ping(self):
        return True

    async def close(self):
        pass

    async def get(self, key):
        return None

    async def set(self, key, value, **_):
        pass


class _FakeEmbed:
    async def embed(self, text):
        return [0.0] * 384

    async def health(self):
        return {"status": "ok"}

    async def close(self):
        pass


def _mock_db():
    db = MagicMock()
    db.execute.return_value.all.return_value = []
    db.scalars.return_value.all.return_value = []
    db.get.return_value = None

    def _set_id(obj):
        if not getattr(obj, "id", None):
            obj.id = _uuid.uuid4()

    db.add.side_effect = _set_id
    return db


def _setup(qdrant=None):
    from app.main import app
    from app.api.v1.routes import get_db, get_qdrant, get_embedding_client, get_redis

    db = _mock_db()
    _q = qdrant if qdrant is not None else _FakeQdrant()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_qdrant] = lambda: _q
    app.dependency_overrides[get_embedding_client] = lambda: _FakeEmbed()
    app.dependency_overrides[get_redis] = lambda: _FakeRedis()
    return app


def test_list_articles_empty():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.get("/api/v1/articles")
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_list_articles_all_filters():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.get("/api/v1/articles?law_code=LAB-2019&domain=labor&language=fr")
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200


def test_list_laws_empty():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.get("/api/v1/laws")
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_search_empty_query():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.post("/api/v1/search", json={"query": "   "})
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 400


def test_search_success():
    app = _setup(qdrant=_FakeQdrantHit())
    try:
        with TestClient(app) as c:
            r = c.post("/api/v1/search", json={"query": "labour law", "limit": 5})
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200


def test_get_article_not_found():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.get(f"/api/v1/articles/{_uuid.uuid4()}")
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 404


def test_internal_retrieve_empty():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.post("/api/v1/internal/retrieve", json={
                "query_vector": [0.0] * 384,
                "top_k": 5,
            })
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["results"] == []


def test_ingest_document_empty():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.post("/api/v1/ingest", json={
                "code": "LAB-2019",
                "name": "Labour Code",
                "jurisdiction": "cameroon",
                "language": "fr",
                "articles": [],
            })
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["articles_ingested"] == 0


def test_ingest_pdf_non_pdf_file():
    app = _setup()
    try:
        with TestClient(app) as c:
            r = c.post(
                "/api/v1/ingest/pdf",
                data={"code": "X", "name": "X"},
                files={"file": ("test.txt", io.BytesIO(b"data"), "text/plain")},
            )
    finally:
        app.dependency_overrides.clear()
    assert r.status_code == 400
