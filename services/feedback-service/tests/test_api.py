from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.db import get_session
from app.models import Feedback

_client = TestClient(app)


def _mock_session():
    return MagicMock()


def _fb(**kwargs):
    defaults = dict(id=1, user_id="u1", text="Great", rating=5,
                    created_at=datetime(2024, 1, 1), session_id=None,
                    message_index=None, flag_count=0, flagged=False,
                    flag_reason=None, review_status="pending")
    defaults.update(kwargs)
    return Feedback(**defaults)


def test_health():
    r = _client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_feedback_empty():
    s = _mock_session()
    s.exec.return_value.all.return_value = []
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_list_feedback():
    s = _mock_session()
    s.exec.return_value.all.return_value = [_fb()]
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()[0]["text"] == "Great"


def test_get_feedback():
    s = _mock_session()
    s.get.return_value = _fb()
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback/1")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["rating"] == 5


def test_get_feedback_not_found():
    s = _mock_session()
    s.get.return_value = None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback/999")
    app.dependency_overrides.clear()
    assert r.status_code == 404


def test_create_feedback():
    s = _mock_session()
    s.refresh.side_effect = lambda obj: setattr(obj, "id", 1)
    app.dependency_overrides[get_session] = lambda: (yield s)
    with patch("app.tasks.process_feedback_async.delay"):
        r = _client.post("/api/v1/feedback", json={"user_id": "u1", "text": "Great", "rating": 5})
    app.dependency_overrides.clear()
    assert r.status_code == 201
    assert r.json()["text"] == "Great"


def test_flag_feedback_not_found():
    s = _mock_session()
    s.get.return_value = None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.post("/api/v1/feedback/999/flag")
    app.dependency_overrides.clear()
    assert r.status_code == 404


def test_flag_feedback_increments():
    s = _mock_session()
    s.get.return_value = _fb(flag_count=1)
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.post("/api/v1/feedback/1/flag")
    app.dependency_overrides.clear()
    assert r.status_code == 200


def test_flag_feedback_triggers_flag():
    s = _mock_session()
    s.get.return_value = _fb(flag_count=2, flagged=False)
    app.dependency_overrides[get_session] = lambda: (yield s)
    with patch("app.api.v1.routes.publish_event"):
        r = _client.post("/api/v1/feedback/1/flag")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["flagged"] is True


def test_admin_list_flagged_empty():
    s = _mock_session()
    s.exec.return_value.all.return_value = []
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback/admin/feedback")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_admin_feedback_stats():
    s = _mock_session()
    s.exec.return_value.one.return_value = 0
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/api/v1/feedback/admin/feedback/stats")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert "total_flagged" in r.json()


def test_admin_review_feedback_not_found():
    s = _mock_session()
    s.get.return_value = None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.patch("/api/v1/feedback/admin/feedback/999/review", json={"action": "dismiss"})
    app.dependency_overrides.clear()
    assert r.status_code == 404


def test_admin_review_feedback_invalid_action():
    s = _mock_session()
    s.get.return_value = _fb()
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.patch("/api/v1/feedback/admin/feedback/1/review", json={"action": "unknown"})
    app.dependency_overrides.clear()
    assert r.status_code == 400


def test_admin_review_feedback_dismiss():
    s = _mock_session()
    fb = _fb()
    s.get.return_value = fb
    s.refresh.side_effect = lambda obj: None
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.patch("/api/v1/feedback/admin/feedback/1/review", json={"action": "dismiss"})
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()["review_status"] == "dismissed"
