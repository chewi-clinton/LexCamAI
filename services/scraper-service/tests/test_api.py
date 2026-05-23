from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.db import get_session
from app.models import ScrapeJob, LawScrapeJob

_client = TestClient(app)


def _mock_session():
    return MagicMock()


def _job(**kwargs):
    defaults = dict(id=1, url="https://example.com", status="pending",
                    result=None, created_at=datetime(2024, 1, 1), finished_at=None)
    defaults.update(kwargs)
    return ScrapeJob(**defaults)


def _law_job(**kwargs):
    defaults = dict(id=1, url="https://example.com/law", code="CC", name="Civil Code",
                    domain="civil", language="fr", status="pending", result=None,
                    articles_ingested=0, created_at=datetime(2024, 1, 1), finished_at=None)
    defaults.update(kwargs)
    return LawScrapeJob(**defaults)


def test_health():
    r = _client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_jobs_empty():
    s = _mock_session()
    s.exec.return_value.all.return_value = []
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_list_jobs():
    s = _mock_session()
    s.exec.return_value.all.return_value = [_job()]
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()[0]["url"] == "https://example.com"


def test_get_job():
    s = _mock_session()
    s.get.return_value = _job()
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape/1")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["status"] == "pending"


def test_get_job_not_found():
    s = _mock_session()
    s.get.return_value = None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape/999")
    app.dependency_overrides.clear()
    assert r.status_code == 404


def test_create_job():
    s = _mock_session()
    s.refresh.side_effect = lambda obj: setattr(obj, "id", 1)
    app.dependency_overrides[get_session] = lambda: (yield s)
    with patch("app.tasks.run_scrape_async.delay"):
        r = _client.post("/api/v1/scrape", json={"url": "https://example.com"})
    app.dependency_overrides.clear()
    assert r.status_code == 201
    assert r.json()["status"] == "pending"


def test_list_law_jobs_empty():
    s = _mock_session()
    s.exec.return_value.all.return_value = []
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape-laws")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_list_law_jobs():
    s = _mock_session()
    s.exec.return_value.all.return_value = [_law_job()]
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape-laws")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()[0]["code"] == "CC"


def test_get_law_job():
    s = _mock_session()
    s.get.return_value = _law_job()
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape-laws/1")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["name"] == "Civil Code"


def test_get_law_job_not_found():
    s = _mock_session()
    s.get.return_value = None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/scrape-laws/999")
    app.dependency_overrides.clear()
    assert r.status_code == 404


def test_create_law_job():
    s = _mock_session()
    s.refresh.side_effect = lambda obj: setattr(obj, "id", 1)
    app.dependency_overrides[get_session] = lambda: (yield s)
    with patch("app.tasks.run_law_scrape.delay"):
        r = _client.post("/api/v1/scrape-laws", json={
            "url": "https://example.com/law",
            "code": "CC",
            "name": "Civil Code",
            "domain": "civil",
            "language": "fr"
        })
    app.dependency_overrides.clear()
    assert r.status_code == 201
    assert r.json()["code"] == "CC"
