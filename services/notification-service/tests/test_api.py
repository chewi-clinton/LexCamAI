from datetime import datetime
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.db import get_session
from app.models import Notification

_client = TestClient(app)


def _mock_session():
    s = MagicMock()
    return s


def _notif(**kwargs):
    defaults = dict(id=1, user_id="u1", message="Hello", delivered=False,
                    created_at=datetime(2024, 1, 1))
    defaults.update(kwargs)
    return Notification(**defaults)


def test_health():
    r = _client.get("/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_notifications_empty():
    s = _mock_session()
    s.exec.return_value.all.return_value = []
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/v1/notifications")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json() == []


def test_list_notifications():
    s = _mock_session()
    s.exec.return_value.all.return_value = [_notif()]
    app.dependency_overrides[get_session] = lambda: (yield s)
    r = _client.get("/v1/notifications")
    app.dependency_overrides.clear()
    assert r.status_code == 200
    assert r.json()[0]["message"] == "Hello"


def test_create_notification():
    s = _mock_session()
    s.refresh.side_effect = lambda obj: setattr(obj, "id", 1)
    app.dependency_overrides[get_session] = lambda: (yield s)
    with patch("app.tasks.send_notification_async.delay"):
        r = _client.post("/v1/notify", json={"user_id": "u1", "message": "Hello"})
    app.dependency_overrides.clear()
    assert r.status_code == 201
    assert r.json()["message"] == "Hello"
    assert r.json()["delivered"] is False
